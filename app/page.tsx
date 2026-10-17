import "./gallery.css";
import "./motion.css";
import Link from "next/link";
import MovieExplorer from "./components/MovieExplorer";
import GalleryMotion from "./components/GalleryMotion";
import { MovieError, searchMovies } from "@/lib/omdb";
import type { Movie } from "@/lib/movies";
export const dynamic = "force-dynamic";
export default async function Home() {
  let movies: Movie[] = [];
  let error = "";
  try {
    movies = (await searchMovies("Batman", "1", "movie")).Search;
  } catch (cause) {
    error =
      cause instanceof MovieError
        ? cause.message
        : "El catálogo no está disponible.";
  }
  return (
    <div className="cinema-app min-h-screen">
      <GalleryMotion />
      <header className="cinema-nav">
        <Link href="/" className="brand">
          <span>◈</span> FRAME.
        </Link>
        <a href="#explorar">Explorar catálogo ↗</a>
        <span className="nav-note">CINE & SERIES / PARA MENTES CURIOSAS</span>
      </header>
      <main className="cinema-main">
        <section className="cinema-hero relative overflow-hidden">
          <div className="hero-top">
            <p className="eyebrow">● PARA LOS QUE VIVEN LAS HISTORIAS</p>
            <span>EL SIGUIENTE GRAN DESCUBRIMIENTO</span>
          </div>
          <h1 className="hero-title">
            <span className="title-mask">
              <span>Una buena historia</span>
            </span>
            <span className="title-mask">
              <span>
                merece <em>ser encontrada.</em>
              </span>
            </span>
          </h1>
          <div className="hero-bottom">
            <p>
              Películas que se quedan contigo. Series que no puedes soltar.
              <br />
              Encuentra qué ver y descubre todo lo que hay detrás.
            </p>
            <a href="#explorar" aria-label="Ir al buscador">
              ↓
            </a>
          </div>
          <div className="hero-lines">
            <span>01 / EXPLORA</span>
            <span>02 / DESCUBRE</span>
            <span>03 / ELIGE TU HISTORIA</span>
          </div>
        </section>
        <MovieExplorer initial={movies} initialError={error} />
        <section className="cinema-note" data-reveal>
          <span>◈</span>
          <p>
            No es solo qué ver.
            <br />
            <strong>Es qué historia quieres vivir.</strong>
          </p>
          <small>
            Información y pósters de OMDb.
            <br />
            Disponibilidad de streaming no incluida.
          </small>
        </section>
      </main>
      <footer className="cinema-footer">
        <span>FRAME. / LABORATORIO 09</span>
        <nav>
          <Link href="/pokemon-csr">Pokémon CSR</Link>
          <Link href="/pokemon-ssr">Pokémon servidor</Link>
          <Link href="/weather">Weather</Link>
        </nav>
        <span>Hecho para explorar.</span>
      </footer>
    </div>
  );
}
