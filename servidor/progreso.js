// Progreso del alumno. Se guarda en D1 para que sobreviva a cambiar de
// navegador o de ordenador, que es justo lo que le falta a croquetas.
//
// Se escribe al superar un paso, no en cada pulsacion: son unas pocas
// escrituras por sesion, muy lejos de las 100.000 diarias del plan gratuito.

import { Hono } from 'hono'
import { usuarioIdDe } from './identidad.js'

export const progreso = new Hono()

const ESTADOS = ['pendiente', 'en_curso', 'superado']

progreso.get('/api/progreso', async (c) => {
  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  const { results } = await c.env.DB.prepare(
    'SELECT mundo, paso, estado, actualizado_en FROM progreso WHERE usuario_id = ? ORDER BY mundo, paso',
  )
    .bind(usuarioId)
    .all()

  return c.json({ progreso: results })
})

progreso.put('/api/progreso', async (c) => {
  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  let cuerpo
  try {
    cuerpo = await c.req.json()
  } catch {
    return c.json({ error: 'cuerpo_invalido' }, 400)
  }

  const mundo = Number(cuerpo?.mundo)
  const paso = Number(cuerpo?.paso)
  const estado = String(cuerpo?.estado || '')

  if (!Number.isInteger(mundo) || !Number.isInteger(paso)) {
    return c.json({ error: 'mundo_o_paso_invalido' }, 400)
  }
  if (!ESTADOS.includes(estado)) {
    return c.json({ error: 'estado_invalido', mensaje: `Tiene que ser uno de: ${ESTADOS.join(', ')}` }, 400)
  }

  await c.env.DB.prepare(
    `INSERT INTO progreso (usuario_id, mundo, paso, estado)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (usuario_id, mundo, paso)
     DO UPDATE SET estado = excluded.estado, actualizado_en = datetime('now')`,
  )
    .bind(usuarioId, mundo, paso, estado)
    .run()

  return c.json({ ok: true })
})
