import { NextRequest, NextResponse } from 'next/server';
import { MovieError, movieDetails, searchMovies } from '@/lib/omdb';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get('id');
  const query = (params.get('q') || '').trim();
  const page = params.get('page') || '1';
  const type = params.get('type') || '';
  if (id ? !/^tt\d{7,10}$/.test(id) : query.length < 3 || query.length > 100 || !/^(?:[1-9]\d?|100)$/.test(page) || !['', 'movie', 'series'].includes(type)) {
    return NextResponse.json({ error: 'La búsqueda debe tener entre 3 y 100 caracteres y filtros válidos.' }, { status: 400 });
  }
  try { return NextResponse.json(id ? await movieDetails(id) : await searchMovies(query, page, type)); }
  catch (error) {
    return NextResponse.json({ error: error instanceof MovieError ? error.message : 'No se pudo completar la consulta.' }, { status: error instanceof MovieError ? error.status : 500 });
  }
}
