// Worker del taller. Va detras de Cloudflare Access: aqui no llega nadie sin
// haber pasado el PIN, asi que estas rutas dan por hecho que hay identidad.

import { Hono } from 'hono'
import { armonia } from './armonia.js'
import { identidadDe, usuarioIdDe } from './identidad.js'
import { progreso } from './progreso.js'
import { sandbox } from './sandbox.js'

const app = new Hono()

app.route('/', progreso)
app.route('/', armonia)
app.route('/', sandbox)

const MAXIMO_FICHEROS = 60
const MAXIMO_BYTES = 400 * 1024

app.get('/api/yo', async (c) => {
  const identidad = await identidadDe(c)
  if (!identidad) return c.json({ error: 'sin_identidad' }, 401)
  return c.json({ identidad })
})

// Publicar: el sistema de ficheros virtual del alumno pasa a D1 y queda
// servido por el Worker publico en /publicado/<alias>/<proyecto>/.
//
// Solo se guardan sus ficheros. Su codigo de backend NO se ejecuta en el
// servidor: eso seria ejecucion remota y no va a pasar.
app.post('/api/publicar', async (c) => {
  const identidad = await identidadDe(c)
  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  let cuerpo
  try {
    cuerpo = await c.req.json()
  } catch {
    return c.json({ error: 'cuerpo_invalido' }, 400)
  }

  const nombre = String(cuerpo?.proyecto || '').trim()
  if (!/^[a-z0-9-]{1,40}$/i.test(nombre)) {
    return c.json({ error: 'nombre_invalido', mensaje: 'Letras, numeros y guiones, hasta 40.' }, 400)
  }

  const ficheros = cuerpo?.ficheros
  if (!ficheros || typeof ficheros !== 'object') return c.json({ error: 'sin_ficheros' }, 400)

  const entradas = Object.entries(ficheros)
  if (!entradas.length) return c.json({ error: 'sin_ficheros' }, 400)
  if (entradas.length > MAXIMO_FICHEROS) {
    return c.json({ error: 'demasiados_ficheros', mensaje: `Maximo ${MAXIMO_FICHEROS}.` }, 400)
  }

  const total = entradas.reduce((suma, [ruta, contenido]) => suma + ruta.length + String(contenido).length, 0)
  if (total > MAXIMO_BYTES) {
    return c.json({ error: 'demasiado_grande', mensaje: 'El proyecto pasa de 400 KB.' }, 413)
  }

  // Rutas: las mismas reglas que en el taller. Sin esto, un `../` podria
  // escribir donde no debe.
  for (const [ruta] of entradas) {
    if (!/^[^/\\][^\\]*$/.test(ruta) || ruta.includes('..') || ruta.length > 200) {
      return c.json({ error: 'ruta_invalida', mensaje: `No vale la ruta "${ruta}".` }, 400)
    }
  }

  const proyecto = await c.env.DB.prepare(
    `INSERT INTO proyectos (usuario_id, nombre) VALUES (?, ?)
     ON CONFLICT (usuario_id, nombre) DO UPDATE SET nombre = excluded.nombre
     RETURNING id`,
  )
    .bind(usuarioId, nombre)
    .first()

  const proyectoId = proyecto.id

  // Se borra y se reescribe entero: asi un fichero que el alumno ha eliminado
  // desaparece tambien de lo publicado.
  const sentencias = [c.env.DB.prepare('DELETE FROM ficheros WHERE proyecto_id = ?').bind(proyectoId)]
  for (const [ruta, contenido] of entradas) {
    sentencias.push(
      c.env.DB.prepare('INSERT INTO ficheros (proyecto_id, ruta, contenido) VALUES (?, ?, ?)').bind(
        proyectoId,
        ruta,
        String(contenido),
      ),
    )
  }

  await c.env.DB.batch(sentencias)

  return c.json({
    ok: true,
    url: `/publicado/${encodeURIComponent(identidad.alias)}/${encodeURIComponent(nombre)}/`,
    ficheros: entradas.length,
  })
})

app.onError((error, c) => {
  console.error('fallo en el Worker del taller:', error && error.stack)
  return c.json({ error: 'algo_ha_petado' }, 500)
})

export default {
  async fetch(peticion, env, contexto) {
    const url = new URL(peticion.url)

    if (!url.pathname.startsWith('/api/')) {
      // Todo lo demas es la aplicacion de Vue. Incluidas las rutas /vista/*,
      // que en cuanto el Service Worker esta instalado ni siquiera llegan a
      // la red; esto es solo por si alguien abre una en frio.
      return env.ASSETS.fetch(new Request(new URL('/', url), peticion))
    }

    return app.fetch(peticion, env, contexto)
  },
}
