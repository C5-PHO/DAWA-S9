# FRAME

### Galería de películas y series

Aplicación web para descubrir títulos, explorar colecciones y consultar fichas de películas y series. Combina una selección inicial renderizada en el servidor con búsquedas interactivas en el navegador, utilizando datos de OMDb.

Proyecto desarrollado para el **Laboratorio 09 de Desarrollo de Aplicaciones Web Avanzado** de Tecsup.

## Funcionalidades

- Selección inicial de películas disponible en el HTML generado por el servidor.
- Búsqueda por título sin recargar la página, con espera de 450 ms al escribir y cancelación de consultas anteriores.
- Filtros de películas y series, colecciones temáticas y paginación.
- Ficha de cada título con sinopsis, reparto, dirección, estreno, calificaciones, premios y enlace a IMDb, según la información disponible.
- Modal con navegación por teclado, cierre con Escape y recuperación del foco.
- Diseño adaptable a escritorio y móvil, estados de carga, reintentos y pósters alternativos.
- Animaciones de entrada tipográfica y aparición de portadas al desplazarse, con soporte para movimiento reducido.

Las colecciones se obtienen mediante búsquedas temáticas en OMDb. No representan un ranking de popularidad ni indican disponibilidad en plataformas de streaming.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Next.js 16 y App Router | Páginas, componentes de servidor y rutas HTTP |
| React 19 | Componentes interactivos, estado y efectos |
| TypeScript | Tipos compartidos y verificación estática |
| Tailwind CSS 4 y CSS | Utilidades, diseño adaptable y animaciones |
| OMDb API | Catálogo, pósters y detalles de títulos |
| Fetch API | Consultas de la galería y cancelación con AbortController |
| Axios | Consultas de los ejercicios de Pokémon y clima |
| ESLint | Análisis de calidad del código |

Las versiones exactas y las dependencias están registradas en `package.json` y `package-lock.json`.

## Instalación local

### Requisitos

- Node.js 22 y npm. El proyecto se verificó localmente con Node.js 22.20.0.
- Git.
- Una API key propia de OMDb, activada mediante el enlace recibido por correo.

### 1. Clonar e instalar

```bash
git clone https://github.com/C5-PHO/DAWA-S9.git
cd DAWA-S9
npm ci
```

### 2. Configurar el entorno

Crea `.env.local` en la raíz del repositorio, junto a `package.json`. Puedes partir del ejemplo si el archivo aún no existe:

```powershell
Copy-Item .env.example .env.local
```

En Linux o macOS:

```bash
cp .env.example .env.local
```

Edita el archivo y reemplaza el marcador:

```dotenv
OMDB_API_KEY=your_activated_api_key
```

El valor debe contener únicamente la clave, sin la URL de la API. Reinicia el servidor si modificas esta configuración.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `OMDB_API_KEY` | Sí, para la galería | Clave de OMDb utilizada exclusivamente en el servidor |

`.env.local` está excluido de Git. La clave no utiliza el prefijo `NEXT_PUBLIC_` y no se incorpora a las consultas del navegador.

### 3. Iniciar el proyecto

```bash
npm run dev
```

Abre [localhost:3000](http://localhost:3000).

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Ejecuta la compilación de producción |
| `npm run lint` | Analiza el código con ESLint |
| `npx tsc --noEmit` | Comprueba los tipos sin generar archivos JavaScript |

Para probar la compilación de producción localmente, ejecuta `npm run build` y después `npm start`, con el servidor de desarrollo detenido.

## Arquitectura

```text
app/
├── api/movies/route.ts           # API interna de búsqueda y detalles
├── components/
│   ├── GalleryMotion.tsx        # Aparición de elementos al entrar en pantalla
│   ├── MovieExplorer.tsx        # Búsqueda, filtros, colecciones y paginación
│   └── movies/
│       ├── MovieDetails.tsx     # Modal y consulta de la ficha
│       └── MoviePoster.tsx      # Póster y alternativa ante errores
├── hooks/useMovieSearch.ts      # Estado, espera y cancelación de búsquedas
├── page.tsx                     # Página principal renderizada en servidor
├── gallery.css                  # Estilos de la galería
├── motion.css                   # Secuencias de animación
├── pokemon-csr/                 # Ejercicio de consulta desde el navegador
├── pokemon-ssr/                 # Ejercicio con componente de servidor
└── weather/                     # Dashboard que combina servidor y cliente
lib/
├── movies.ts                    # Tipos compartidos del catálogo
└── omdb.ts                      # Integración con OMDb, exclusiva del servidor
```

### Decisiones de renderizado

| Parte | Estrategia | Justificación |
| --- | --- | --- |
| Selección inicial | SSR dinámico | Obtiene las películas antes de entregar el HTML y ofrece contenido inicial sin esperar una consulta del navegador |
| Búsqueda y filtros | CSR | Responde a las entradas del usuario y actualiza los resultados sin navegar a otra página |
| Ficha de un título | Consulta bajo demanda | Carga el detalle únicamente cuando se abre el modal |

La página principal consulta directamente el módulo de OMDb. Las interacciones del cliente utilizan `/api/movies`, que conserva la clave en el servidor. Las consultas externas tienen un tiempo de espera de 10 segundos y una revalidación de caché de cinco minutos para reducir solicitudes repetidas.

`GalleryMotion` utiliza IntersectionObserver y Web Animations. Los efectos se ejecutan al entrar en pantalla y liberan sus observadores al desmontarse. No intercepta la rueda del mouse. La preferencia `prefers-reduced-motion` desactiva las secuencias y cancela las animaciones en curso.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Galería FRAME |
| `/pokemon-csr` | Pokémon consultado desde el navegador |
| `/pokemon-ssr` | Pokémon obtenido en un componente de servidor |
| `/weather` | Clima de Lima y selector interactivo de ciudades |
| `/api/movies` | API interna de consulta de títulos |

Los ejercicios de Pokémon y Weather conservan su implementación académica. Un componente de servidor puede prerenderizarse durante el build; su existencia por sí sola no implica ejecución en cada petición. La galería principal declara explícitamente `force-dynamic`.

### API interna

| Consulta | Ejemplo |
| --- | --- |
| Buscar títulos | `/api/movies?q=batman&type=movie&page=1` |
| Consultar detalle | `/api/movies?id=tt0372784` |

La búsqueda acepta entre 3 y 100 caracteres, tipos `movie` o `series` y páginas de 1 a 100. El detalle utiliza un identificador IMDb. Las respuestas de error incluyen un mensaje y un estado HTTP; la interfaz presenta los estados de carga y error con opciones para reintentar.

## Verificación

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Los ejercicios de Pokémon mantienen advertencias de ESLint por el uso de etiquetas `<img>`. Las comprobaciones estáticas complementan las pruebas de interacción en el navegador.

Flujo de revisión manual:

1. Abrir la galería y comprobar la selección inicial.
2. Buscar un título, cambiar entre películas y series, y probar una colección sin texto de búsqueda.
3. Cambiar de página y verificar que los resultados correspondan a los filtros actuales.
4. Abrir una ficha, revisar su contenido y cerrarla mediante Escape o el botón de cierre.
5. Probar un título inexistente y revisar el estado de error.
6. Comprobar la vista móvil, el desplazamiento y las alternativas cuando un póster no está disponible.

## Despliegue en Vercel

1. Importar el repositorio `C5-PHO/DAWA-S9` y seleccionar la rama `main`.
2. Elegir **Next.js** como Application Preset y mantener **`./`** como Root Directory.
3. Mantener los comandos de compilación y salida detectados por Vercel.
4. Agregar `OMDB_API_KEY` como variable sensible en Production y, si se utilizarán vistas previas, en Preview.
5. Desplegar y comprobar catálogo, búsqueda, filtros y detalles.

Los cambios enviados a la rama de producción generan nuevos despliegues mediante la integración de GitHub. Una modificación de las variables de entorno requiere un nuevo despliegue para aplicarse.

## Alcance y consideraciones

La aplicación consulta un catálogo externo y no almacena cuentas ni datos de usuarios. Los resultados, imágenes y campos disponibles dependen de OMDb y de la cuota de la clave utilizada. Antes de ampliar el acceso público, conviene incorporar límites de solicitudes a la API interna y revisar el consumo del proveedor.

## Referencias

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de React](https://react.dev/learn)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación y claves de OMDb](https://www.omdbapi.com/)
