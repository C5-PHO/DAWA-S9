"use client";

import { useEffect, useRef, useState } from "react";
import type { MovieDetail } from "@/lib/movies";
import MoviePoster from "./MoviePoster";

export default function MovieDetails({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      opener?.focus();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/movies?id=${id}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw Error(data.error);
        setDetail(data);
      } catch (cause) {
        if (!controller.signal.aborted)
          setDetailError(
            cause instanceof Error
              ? cause.message
              : "No se pudo cargar el detalle.",
          );
      }
    }
    load();
    return () => controller.abort();
  }, [id, retry]);
  const close = () => onClose();
  return (
    <dialog
      ref={dialog}
      className="movie-dialog"
      aria-labelledby="detail-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        className="close-dialog"
        aria-label="Cerrar detalles"
        onClick={close}
      >
        ✕
      </button>
      {!detail ? (
        <div className="detail-loading">
          <h2 id="detail-title">Detalles del título</h2>
          <p role="status">{detailError || "Cargando historia…"}</p>
          {detailError && (
            <button
              className="retry-button"
              onClick={() => {
                setDetailError("");
                setRetry((r) => r + 1);
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      ) : (
        <div className="detail-grid">
          <MoviePoster key={detail.imdbID} movie={detail} />
          <div className="detail-copy">
            <p className="eyebrow">
              {detail.Type === "series" ? "SERIE" : "PELÍCULA"} · {detail.Year}
            </p>
            <h2 id="detail-title">{detail.Title}</h2>
            <p className="detail-meta">
              ★ {detail.imdbRating} IMDb · {detail.Runtime} · {detail.Rated}
            </p>
            <p className="genre">{detail.Genre}</p>
            <h3>Sinopsis</h3>
            <p className="plot">{detail.Plot}</p>
            <dl>
              {[
                ["Dirección", detail.Director],
                ["Reparto", detail.Actors],
                ["Guion", detail.Writer],
                ["Estreno", detail.Released],
                ["País", detail.Country],
                ["Idioma", detail.Language],
                ["Premios", detail.Awards],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value === "N/A" ? "No disponible" : value}</dd>
                </div>
              ))}
            </dl>
            <div className="ratings">
              {detail.Ratings?.map((r) => (
                <span key={r.Source}>
                  {r.Source}
                  <strong>{r.Value}</strong>
                </span>
              ))}
            </div>
            <a
              className="imdb-link"
              href={`https://www.imdb.com/title/${detail.imdbID}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explorar en IMDb ↗
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
