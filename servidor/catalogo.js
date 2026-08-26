// El catalogo de sombreros de verdad. Es la web que el alumno acaba sabiendo
// construir, funcionando delante de el desde el primer dia.

import { Hono } from 'hono'

export const catalogo = new Hono()

// Media y numero de votos se calculan en la consulta, no en JavaScript: si se
// trajeran todos los votos para promediarlos aqui, el dia que haya diez mil
// votos se traerian diez mil filas para devolver un numero.
const CONSULTA_LISTA = `
  SELECT
    s.id,
    s.nombre,
    s.descripcion,
    s.imagen,
    s.creado_en,
    COUNT(v.usuario_id)          AS votos,
    ROUND(AVG(v.puntuacion), 2)  AS media
  FROM sombreros s
  LEFT JOIN votos v ON v.sombrero_id = s.id
  GROUP BY s.id
  ORDER BY media DESC NULLS LAST, votos DESC, s.nombre
`

catalogo.get('/api/sombreros', async (c) => {
  const { results } = await c.env.DB.prepare(CONSULTA_LISTA).all()
  return c.json({
    sombreros: results.map((fila) => ({
      ...fila,
      // Sin votos, AVG devuelve NULL. Que el frontend no tenga que adivinarlo.
      media: fila.media === null ? null : Number(fila.media),
      votos: Number(fila.votos),
    })),
  })
})

catalogo.get('/api/sombreros/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id)) return c.json({ error: 'id_invalido' }, 400)

  const sombrero = await c.env.DB.prepare(
    `SELECT s.id, s.nombre, s.descripcion, s.imagen, s.creado_en,
            COUNT(v.usuario_id) AS votos, ROUND(AVG(v.puntuacion), 2) AS media
     FROM sombreros s
     LEFT JOIN votos v ON v.sombrero_id = s.id
     WHERE s.id = ?
     GROUP BY s.id`,
  )
    .bind(id)
    .first()

  if (!sombrero) return c.json({ error: 'no_existe' }, 404)
  return c.json({ sombrero })
})

// Votar exige identidad: sin ella no hay forma de impedir que la misma persona
// vote cien veces. Se resuelve en el Worker que monta estas rutas.
export function montarVotacion(app, obtenerUsuarioId) {
  app.put('/api/sombreros/:id/voto', async (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isInteger(id)) return c.json({ error: 'id_invalido' }, 400)

    let cuerpo
    try {
      cuerpo = await c.req.json()
    } catch {
      return c.json({ error: 'cuerpo_invalido' }, 400)
    }

    const puntuacion = Number(cuerpo?.puntuacion)
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      return c.json({ error: 'puntuacion_invalida', mensaje: 'Tiene que ser un entero del 1 al 5.' }, 400)
    }

    const usuarioId = await obtenerUsuarioId(c)
    if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

    // Un voto por persona y sombrero. Si ya voto, cambia su voto.
    await c.env.DB.prepare(
      `INSERT INTO votos (usuario_id, sombrero_id, puntuacion)
       VALUES (?, ?, ?)
       ON CONFLICT (usuario_id, sombrero_id)
       DO UPDATE SET puntuacion = excluded.puntuacion, creado_en = datetime('now')`,
    )
      .bind(usuarioId, id, puntuacion)
      .run()

    const resumen = await c.env.DB.prepare(
      `SELECT COUNT(*) AS votos, ROUND(AVG(puntuacion), 2) AS media
       FROM votos WHERE sombrero_id = ?`,
    )
      .bind(id)
      .first()

    return c.json({ ok: true, ...resumen })
  })
}
