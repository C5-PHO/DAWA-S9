# FRAME — Galería de películas y series

Tarea del Laboratorio 09. Next.js App Router, React, TypeScript, Tailwind CSS y OMDb. Conserva los ejercicios `/pokemon-csr`, `/pokemon-ssr` y `/weather`.

## Desarrollo

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Configura `OMDB_API_KEY` en `.env.local` con una clave propia activada en OMDb. No sobrescribas tu archivo si ya existe. Abre http://localhost:3000. La clave permanece en el servidor; no usa el prefijo NEXT_PUBLIC ni se envía al navegador.

## Requisitos y decisiones de renderizado

- **Inicio SSR:** `app/page.tsx` fuerza renderizado dinámico y obtiene una selección de películas de Batman antes de entregar la página. OMDb no tiene un ranking de popularidad: se usa una selección temática de una saga conocida, sin presentar sus resultados como ranking.
- **Búsqueda CSR:** `MovieExplorer.tsx` utiliza `use client`, `useState` y `useEffect`; espera 450 ms tras escribir, cancela peticiones anteriores y actualiza resultados sin recargar. Tiene filtros de películas/series y paginación.
- **Detalles:** modal nativo con sinopsis completa, reparto, dirección, premios, calificaciones y enlace a IMDb. Cierra con Escape, botón o clic en el fondo, y conserva la búsqueda.
- **API interna:** `/api/movies?q=batman&type=movie&page=1` y `/api/movies?id=tt0372784`. Valida parámetros, protege la clave, limita la espera y presenta errores de búsqueda, configuración o proveedor. Consultas a OMDb cacheadas durante cinco minutos para reducir consumo de cuota.
- **Tailwind y diseño:** Tailwind global y utilidades, estilos de galería responsive, pósters alternativos, estados de carga, foco visible y movimiento reducido. Los ejercicios previos mantienen sus rutas.

La lista inicial se beneficia de contenido disponible en el HTML; la búsqueda usa CSR porque depende de entradas y filtros del usuario. Consultar una API interna desde CSR sigue siendo interacción en el cliente, sin revelar la credencial de OMDb.

## Verificación

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

Prueba: inicio con clave válida; buscar Batman y Suits; filtrar; avanzar/retroceder páginas; abrir/cerrar detalles con Escape; búsqueda inexistente; vista móvil; póster ausente. Los ejercicios Pokémon conservan advertencias de ESLint por sus imágenes HTML.

## Vercel (siguiente etapa)

Importa `C5-PHO/DAWA-S9`, rama `main`, Framework Next.js. La raíz del repositorio contiene package.json: deja Root Directory en `.`. Añade `OMDB_API_KEY` en Environment Variables para Production (y Preview si lo necesitas). Usa la versión de Node compatible con Next.js, ejecuta el build y despliega. No subas `.env.local`; `.env.example` solo incluye un marcador.

Documentación: https://www.omdbapi.com/ y https://nextjs.org/docs/app/guides/environment-variables

## Organización de la galería

- `app/components/MovieExplorer.tsx`: coordina los filtros, colecciones y paginación.
- `app/hooks/useMovieSearch.ts`: debounce, cancelación, resultados asociados a la consulta y reintentos.
- `app/components/movies/MoviePoster.tsx`: póster reutilizable con alternativa si la imagen falla.
- `app/components/movies/MovieDetails.tsx`: modal accesible, consulta del detalle, cierre por teclado y restauración de foco.
- `app/gallery.css`: estilos de la galería aislados de los ejercicios de Pokémon y Weather.
- `lib/omdb.ts`: integración exclusiva del servidor con la API externa.

Las colecciones temáticas son búsquedas de OMDb, no rankings. El filtro de tipo funciona también sin texto. Las tarjetas de carga reemplazan resultados anteriores mientras se obtiene una nueva consulta. Los datos y la clave de OMDb no se persisten en el cliente.

## Movimiento

`app/motion.css` contiene la secuencia de apertura por máscaras tipográficas y las transiciones del modal. `GalleryMotion.tsx` utiliza IntersectionObserver y Web Animations para revelar las portadas una sola vez al entrar en pantalla, también tras buscar. No intercepta eventos de rueda ni modifica el desplazamiento. La preferencia `prefers-reduced-motion` desactiva las animaciones y cancela las que estén en curso. El contenido sigue visible sin JavaScript; los observadores se liberan al salir de la página.
