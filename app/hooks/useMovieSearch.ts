"use client";

import { useEffect, useState } from "react";
import type { Movie, SearchResult } from "@/lib/movies";

interface SearchState {
  key: string;
  movies: Movie[];
  total: number;
  error: string;
}

export function useMovieSearch(
  query: string,
  type: string,
  page: number,
  collection: string,
) {
  const active = query.length >= 3 || Boolean(type) || collection !== "Batman";
  const term = query.length >= 3 ? query : collection;
  const key = `${term}:${type}:${page}`;
  const [state, setState] = useState<SearchState | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        try {
          const response = await fetch(
            `/api/movies?${new URLSearchParams({ q: term, type, page: String(page) })}`,
            { signal: controller.signal },
          );
          const data = await response.json();
          if (!response.ok) throw Error(data.error);
          const result = data as SearchResult;
          if (!controller.signal.aborted)
            setState({
              key,
              movies: result.Search,
              total: Number(result.totalResults),
              error: "",
            });
        } catch (cause) {
          if (!controller.signal.aborted)
            setState({
              key,
              movies: [],
              total: 0,
              error:
                cause instanceof Error ? cause.message : "Error al buscar.",
            });
        }
      },
      query.length >= 3 ? 450 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, key, term, type, page, query, retry]);
  const settled = state?.key === key;
  return {
    active,
    loading: active && !settled,
    movies: settled ? state.movies : [],
    total: settled ? state.total : 0,
    error: settled ? state.error : "",
    retry: () => {
      setState(null);
      setRetry((r) => r + 1);
    },
  };
}
