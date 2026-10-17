"use client";

import { useState } from "react";
import type { Movie } from "@/lib/movies";
import { useMovieSearch } from "@/app/hooks/useMovieSearch";
import MoviePoster from "./movies/MoviePoster";
import MovieDetails from "./movies/MovieDetails";

const collections = ["Batman", "Star Wars", "Harry Potter", "Marvel"];

export default function MovieExplorer({
  initial,
  initialError,
}: {
  initial: Movie[];
  initialError: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [collection, setCollection] = useState("Batman");
  const [selected, setSelected] = useState<string | null>(null);
  const search = query.trim();
  const result = useMovieSearch(search, type, page, collection);
  const movies = result.active ? result.movies : initial;
  const error = result.active ? result.error : initialError;
  const total = result.active ? result.total : initial.length;
  const pages = Math.min(100, Math.ceil(total / 10));
  const heading =
    search.length >= 3
      ? `Resultados para “${search}”`
      : `${type === "series" ? "Series" : type === "movie" ? "Películas" : "Universo"} de ${collection}`;
  function reset() {
    setQuery("");
    setType("");
    setPage(1);
    setCollection("Batman");
  }

  return (
    <>
      <section
        className="search-panel"
        data-reveal
        id="explorar"
        aria-label="Buscador del catálogo"
      >
        <div className="search-panel-heading">
          <label htmlFor="movie-query">Encuentra tu próxima historia</label>
          <span>PELÍCULAS + SERIES</span>
        </div>
        <div className="search-controls">
          <input
            id="movie-query"
            type="search"
            maxLength={100}
            value={query}
            aria-describedby="search-help"
            placeholder="Busca por título: Interstellar, Suits…"
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <select
            aria-label="Tipo de título"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los títulos</option>
            <option value="movie">Películas</option>
            <option value="series">Series</option>
          </select>
        </div>
        <p id="search-help">
          {query && search.length < 3
            ? "Escribe al menos 3 caracteres para buscar."
            : "Explora por título o elige una colección. Los resultados se actualizan aquí."}
        </p>
      </section>
      <nav className="collection-tabs" aria-label="Colecciones de películas">
        <span>EXPLORA UN UNIVERSO</span>
        {collections.map((name) => (
          <button
            key={name}
            aria-pressed={collection === name && !search}
            onClick={() => {
              setCollection(name);
              setQuery("");
              setPage(1);
            }}
          >
            {name}
          </button>
        ))}
      </nav>
      <section
        className="catalog"
        aria-busy={result.loading}
        aria-labelledby="catalog-title"
      >
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">TU CATÁLOGO, A UN DESCUBRIMIENTO</p>
            <h2 id="catalog-title">{heading}</h2>
          </div>
          <span>{result.loading ? "Buscando…" : `${total} títulos`}</span>
        </div>
        <div role="status" aria-live="polite">
          {error && (
            <div className="empty-state">
              <span aria-hidden="true">◇</span>
              <h3>No encontramos una historia esta vez</h3>
              <p>{error}</p>
              <div>
                <button
                  className="retry-button"
                  onClick={
                    result.active
                      ? result.retry
                      : () => window.location.reload()
                  }
                >
                  Reintentar
                </button>
                <button onClick={reset}>Restablecer filtros</button>
              </div>
            </div>
          )}
        </div>
        {result.loading ? (
          <div className="movie-grid" aria-label="Cargando títulos">
            {Array.from({ length: 10 }, (_, i) => (
              <div className="skeleton-card" key={i}>
                <div />
                <span />
                <small />
              </div>
            ))}
          </div>
        ) : (
          !error && (
            <div className="movie-grid">
              {movies.map((movie) => (
                <button
                  key={movie.imdbID}
                  className="movie-card"
                  aria-label={`Ver detalles de ${movie.Title}`}
                  onClick={() => setSelected(movie.imdbID)}
                >
                  <div className="poster-wrap">
                    <MoviePoster movie={movie} />
                    <span className="type-badge">
                      {movie.Type === "series"
                        ? "SERIE"
                        : movie.Type === "episode"
                          ? "EPISODIO"
                          : "PELÍCULA"}
                    </span>
                    <span className="card-action">
                      Descubrir esta historia <span>↗</span>
                    </span>
                  </div>
                  <h3>{movie.Title}</h3>
                  <p>
                    {movie.Year}
                    <span>Ver ficha ↗</span>
                  </p>
                </button>
              ))}
            </div>
          )
        )}
        {result.active && !result.loading && !error && movies.length === 0 && (
          <p className="notice">
            No hay resultados. Prueba otro título o restablece los filtros.
          </p>
        )}
        {result.active && !error && pages > 1 && (
          <nav className="pagination" aria-label="Paginación">
            <button
              disabled={page === 1 || result.loading}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </button>
            <span>
              Página {page} de {pages}
            </span>
            <button
              disabled={page >= pages || result.loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}
      </section>
      {selected && (
        <MovieDetails
          key={selected}
          id={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
