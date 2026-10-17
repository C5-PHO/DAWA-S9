export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}
export interface MovieDetail extends Movie {
  Plot: string;
  Genre: string;
  Runtime: string;
  Director: string;
  Actors: string;
  imdbRating: string;
  Released: string;
  Language: string;
  Country: string;
  Awards: string;
  Writer: string;
  Rated: string;
  Ratings?: { Source: string; Value: string }[];
}
export interface SearchResult {
  Search: Movie[];
  totalResults: string;
}
