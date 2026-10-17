'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Movie, MovieDetail } from '@/lib/movies';
function Poster({ movie }: { movie: Movie }) {
 const [failed,setFailed]=useState(false);
 return <div className="poster">{!failed && movie.Poster?.startsWith('https://') ? <Image src={movie.Poster} alt={`Póster de ${movie.Title}`} fill sizes="(max-width:640px) 45vw, 230px" unoptimized onError={()=>setFailed(true)}/> : <span>◈<small>Sin póster</small></span>}</div>;
}
export default function MovieExplorer({initial,initialError}:{initial:Movie[];initialError:string}) {
 const [query,setQuery]=useState(''),[type,setType]=useState(''),[page,setPage]=useState(1);
 const [movies,setMovies]=useState(initial),[total,setTotal]=useState(0),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [selected,setSelected]=useState<string|null>(null),[detail,setDetail]=useState<MovieDetail|null>(null),[detailError,setDetailError]=useState('');
 const dialog=useRef<HTMLDialogElement>(null); const search=query.trim();
 useEffect(()=>{
  if(search.length<3 && !type)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   setLoading(true);setError('');
   try{const response=await fetch(`/api/movies?${new URLSearchParams({q:search.length>=3?search:'Batman',type,page:String(page)})}`,{signal:controller.signal});const data=await response.json();if(!response.ok)throw Error(data.error);setMovies(data.Search);setTotal(Number(data.totalResults));}
   catch(cause){if(!controller.signal.aborted){setError(cause instanceof Error?cause.message:'Error al buscar.');setMovies([]);setTotal(0);}}
   finally{if(!controller.signal.aborted)setLoading(false);}
  },450);
  return()=>{clearTimeout(timer);controller.abort();};
 },[search,type,page]);
 useEffect(()=>{
  if(!selected)return;
  const controller=new AbortController();dialog.current?.showModal();
  async function load(){try{const response=await fetch(`/api/movies?id=${selected}`,{signal:controller.signal});const data=await response.json();if(!response.ok)throw Error(data.error);setDetail(data);}catch(cause){if(!controller.signal.aborted)setDetailError(cause instanceof Error?cause.message:'No se pudo cargar el detalle.');}}
  load();return()=>controller.abort();
 },[selected]);
 const searching=search.length>=3 || !!type; const visible=searching?movies:initial; const message=searching?error:initialError;
 const close=()=>{dialog.current?.close();setSelected(null);};
 return <>
 <section className="search-panel" id="explorar"><label htmlFor="movie-query">Tu próxima historia empieza aquí</label><div className="search-controls"><input id="movie-query" type="search" maxLength={100} value={query} placeholder="Busca un título: Batman, Suits, Interstellar…" onChange={e=>{setQuery(e.target.value);setPage(1);}}/><select aria-label="Tipo de título" value={type} onChange={e=>{setType(e.target.value);setPage(1);}}><option value="">Películas y series</option><option value="movie">Películas</option><option value="series">Series</option></select></div><p>{query&&search.length<3?'Escribe al menos 3 caracteres.':'Explora el catálogo sin recargar la página.'}</p></section>
 <section className="catalog" aria-busy={loading}><div className="section-heading"><div><p className="eyebrow">{searching?'ENCUENTRA TU HISTORIA':'SELECCIÓN PARA EXPLORAR'}</p><h2>{searching?search.length>=3?`Resultados para “${search}”`:type==='series'?'Series de Batman':'Películas de Batman':'Historias que dejan huella'}</h2></div><span>{searching?`${total} títulos`:`${initial.length} títulos`}</span></div><div role="status" aria-live="polite">{searching&&loading&&<p className="notice">Buscando…</p>}{message&&<p className="notice">{message}</p>}</div><div className={`movie-grid ${searching&&loading?'is-loading':''}`}>{visible.map(movie=><button key={movie.imdbID} className="movie-card" aria-label={`Ver detalles de ${movie.Title}`} onClick={()=>{setDetail(null);setDetailError('');setSelected(movie.imdbID);}}><div className="poster-wrap"><Poster movie={movie}/><span className="type-badge">{movie.Type==='series'?'SERIE':'PELÍCULA'}</span><span className="card-action">Ver detalles ↗</span></div><h3>{movie.Title}</h3><p>{movie.Year}<span>↗</span></p></button>)}</div>{searching&&!error&&total>10&&<nav className="pagination" aria-label="Paginación"><button disabled={page===1||loading} onClick={()=>setPage(p=>p-1)}>← Anterior</button><span>{page} / {Math.min(100,Math.ceil(total/10))}</span><button disabled={page>=Math.min(100,Math.ceil(total/10))||loading} onClick={()=>setPage(p=>p+1)}>Siguiente →</button></nav>}</section>
 <dialog ref={dialog} className="movie-dialog" aria-labelledby="detail-title" onCancel={close} onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)close();}}><button className="close-dialog" aria-label="Cerrar detalles" onClick={close}>✕</button>{!detail?<div className="detail-loading"><h2 id="detail-title">Detalles del título</h2><p role="status">{detailError||'Cargando historia…'}</p></div>:<div className="detail-grid"><Poster movie={detail}/><div className="detail-copy"><p className="eyebrow">{detail.Type==='series'?'SERIE':'PELÍCULA'} · {detail.Year}</p><h2 id="detail-title">{detail.Title}</h2><p className="detail-meta">★ {detail.imdbRating} IMDb · {detail.Runtime} · {detail.Rated}</p><p className="genre">{detail.Genre}</p><h3>Sinopsis</h3><p className="plot">{detail.Plot}</p><dl>{[['Dirección',detail.Director],['Reparto',detail.Actors],['Guion',detail.Writer],['Estreno',detail.Released],['País',detail.Country],['Idioma',detail.Language],['Premios',detail.Awards]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value==='N/A'?'No disponible':value}</dd></div>)}</dl><div className="ratings">{detail.Ratings?.map(r=><span key={r.Source}>{r.Source}<strong>{r.Value}</strong></span>)}</div><a className="imdb-link" href={`https://www.imdb.com/title/${detail.imdbID}/`} target="_blank" rel="noopener noreferrer">Explorar en IMDb ↗</a></div></div>}</dialog>
 </>;
}
