"use client";

import Image from "next/image";
import { useState } from "react";
import type { Movie } from "@/lib/movies";

export default function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="poster">
      {!failed && movie.Poster?.startsWith("https://") ? (
        <Image
          src={movie.Poster}
          alt={`Póster de ${movie.Title}`}
          fill
          sizes="(max-width:640px) 45vw, 230px"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          ◈<small>Sin póster</small>
        </span>
      )}
    </div>
  );
}
