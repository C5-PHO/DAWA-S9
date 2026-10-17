import "server-only";
import type { MovieDetail, SearchResult } from "./movies";

export class MovieError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}
async function request<T>(params: Record<string, string>): Promise<T> {
  const key = process.env.OMDB_API_KEY;
  if (!key)
    throw new MovieError(
      "Configura OMDB_API_KEY para consultar el catálogo.",
      503,
    );
  const url = new URL("https://www.omdbapi.com/");
  url.search = new URLSearchParams({ ...params, apikey: key }).toString();
  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new MovieError(
      "No pudimos conectar con el catálogo. Intenta de nuevo.",
    );
  }
  if (!response.ok)
    throw new MovieError("El catálogo no está disponible temporalmente.");
  const data = await response.json();
  if (data.Response === "False") {
    if (/not found|too many results/i.test(data.Error || ""))
      throw new MovieError(
        "No encontramos títulos. Prueba una búsqueda más específica.",
        404,
      );
    throw new MovieError(
      "No se pudo consultar OMDb. Revisa la clave o su cuota de uso.",
      502,
    );
  }
  return data as T;
}
export function searchMovies(query: string, page = "1", type = "") {
  return request<SearchResult>({ s: query, page, ...(type ? { type } : {}) });
}
export function movieDetails(id: string) {
  return request<MovieDetail>({ i: id, plot: "full" });
}
