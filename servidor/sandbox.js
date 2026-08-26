// El sandbox: el proyecto en curso de cada persona, guardado en D1.
//
// Antes vivía solo en IndexedDB, así que cambiar de navegador o de ordenador
// significaba empezar de cero. Ahora se sincroniza.
//
// La resolución de conflictos es deliberadamente simple: **manda la copia más
// reciente**, comparando la fecha del último cambio. No hay fusión de cambios
// línea a línea, y no la va a haber: con dos personas trabajando cada una en su
// propio proyecto, el caso de dos ediciones simultáneas del mismo fichero desde
// dos sitios no llega a darse. Si algún día pasa, se pierde el trabajo del lado
// que iba más atrasado, y eso hay que decirlo en vez de disimularlo.

import { Hono } from 'hono'
import { usuarioIdDe } from './identidad.js'

export const sandbox = new Hono()

const MAXIMO_FICHEROS = 80
const MAXIMO_BYTES = 600 * 1024

sandbox.get('/api/sandbox', async (c) => {
  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  const { results } = await c.env.DB.prepare(
    'SELECT ruta, contenido, actualizado_en FROM sandbox WHERE usuario_id = ? ORDER BY ruta',
  )
    .bind(usuarioId)
    .all()

  // La fecha del cambio más reciente: es lo que el navegador compara con la
  // suya para decidir quién manda.
  const actualizado = results.reduce(
    (ultimo, fila) => (fila.actualizado_en > ultimo ? fila.actualizado_en : ultimo),
    '',
  )

  return c.json({
    ficheros: Object.fromEntries(results.map((fila) => [fila.ruta, fila.contenido])),
    actualizado: actualizado || null,
    cuantos: results.length,
  })
})

sandbox.put('/api/sandbox', async (c) => {
  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  let cuerpo
  try {
    cuerpo = await c.req.json()
  } catch {
    return c.json({ error: 'cuerpo_invalido' }, 400)
  }

  const ficheros = cuerpo?.ficheros
  if (!ficheros || typeof ficheros !== 'object') return c.json({ error: 'sin_ficheros' }, 400)

  const entradas = Object.entries(ficheros)
  if (entradas.length > MAXIMO_FICHEROS) {
    return c.json({ error: 'demasiados_ficheros', mensaje: `Máximo ${MAXIMO_FICHEROS}.` }, 400)
  }

  const total = entradas.reduce((suma, [ruta, texto]) => suma + ruta.length + String(texto).length, 0)
  if (total > MAXIMO_BYTES) {
    return c.json({ error: 'demasiado_grande', mensaje: 'El proyecto pasa de 600 KB.' }, 413)
  }

  // Las mismas reglas de ruta que en el taller. Sin esto, un `..` escribiría
  // donde no debe.
  for (const [ruta] of entradas) {
    if (typeof ruta !== 'string' || !ruta || ruta.length > 200 || ruta.includes('..') || /^[/\\]/.test(ruta)) {
      return c.json({ error: 'ruta_invalida', mensaje: `No vale la ruta "${ruta}".` }, 400)
    }
  }

  // Se reescribe entero: así un fichero que se borró en el navegador
  // desaparece también aquí. Es una sola transacción por lotes.
  const sentencias = [c.env.DB.prepare('DELETE FROM sandbox WHERE usuario_id = ?').bind(usuarioId)]

  for (const [ruta, contenido] of entradas) {
    sentencias.push(
      c.env.DB.prepare(
        'INSERT INTO sandbox (usuario_id, ruta, contenido) VALUES (?, ?, ?)',
      ).bind(usuarioId, ruta, String(contenido)),
    )
  }

  await c.env.DB.batch(sentencias)

  return c.json({ ok: true, cuantos: entradas.length })
})
