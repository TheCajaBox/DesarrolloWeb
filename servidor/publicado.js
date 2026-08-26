// Sirve las paginas que los alumnos han publicado, en /publicado/<alias>/<proyecto>/...
//
// Aqui se sirve HTML y JavaScript escritos por otra persona. Eso, en el mismo
// origen que el catalogo, seria un agujero de libro: su pagina podria leer las
// cookies del visitante y llamar a la API en su nombre.
//
// La cabecera `Content-Security-Policy: sandbox` lo resuelve de raiz. Mete el
// documento en un origen opaco y unico: su JavaScript sigue funcionando, pero
// para el navegador ya no es "nuestro sitio", asi que no llega ni a las
// cookies ni al almacenamiento ni a la sesion de nadie.
//
// Y por si hiciera falta decirlo: el codigo de backend del alumno NO se
// ejecuta aqui. Solo se sirven sus ficheros. Evaluar codigo ajeno dentro del
// Worker seria ejecucion remota, sin mas.

import { Hono } from 'hono'
import { tipoDe } from './tipos.js'

export const publicado = new Hono()

const SANDBOX = 'sandbox allow-scripts allow-forms allow-popups allow-modals'

publicado.get('/publicado/:alias/:proyecto/*', async (c) => {
  const { alias, proyecto } = c.req.param()

  let ruta = c.req.path.split(`/publicado/${alias}/${proyecto}/`)[1] ?? ''
  ruta = decodeURIComponent(ruta)
  if (ruta === '' || ruta.endsWith('/')) ruta += 'index.html'

  const fila = await c.env.DB.prepare(
    `SELECT f.contenido
     FROM ficheros f
     JOIN proyectos p ON p.id = f.proyecto_id
     JOIN usuarios u  ON u.id = p.usuario_id
     WHERE u.alias = ? AND p.nombre = ? AND f.ruta = ?`,
  )
    .bind(alias, proyecto, ruta)
    .first()

  if (!fila) return c.text('Aqui no hay nada.', 404)

  return new Response(fila.contenido, {
    headers: {
      'Content-Type': tipoDe(ruta),
      'Content-Security-Policy': SANDBOX,
      // Que no se quede una version vieja pegada tras republicar.
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
})

// Sin barra final el navegador resolveria mal las rutas relativas de dentro
// (pediria /publicado/<alias>/estilos.css). Se redirige y se acabo.
publicado.get('/publicado/:alias/:proyecto', (c) => {
  const { alias, proyecto } = c.req.param()
  return c.redirect(`/publicado/${alias}/${proyecto}/`, 301)
})
