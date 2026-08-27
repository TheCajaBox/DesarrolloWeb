// Armonia. Responde y ayuda a pensar, pero no da la solucion.
//
// Corre sobre Workers AI: sin clave de API, 10.000 Neurons al dia que se
// reinician a las 00:00 UTC. Cuando se agotan, la llamada falla y Armonia
// queda en modo glosario hasta el dia siguiente.
//
// Las cuatro protecciones viven aqui, en el servidor, y no en el navegador
// como en croquetas. Desde las herramientas de desarrollo no se pueden tocar.

import { Hono } from 'hono'
import { usuarioIdDe } from './identidad.js'
import mundos from '../src/contenido/mundos/indice.js'
import {
  NEGATIVAS,
  pareceQuePideSolucion,
  taparCodigo,
} from '../src/motor/armonia-comun.js'

export const armonia = new Hono()

// OJO al nombre exacto: `@cf/meta/llama-3.1-8b-instruct` (sin el sufijo) NO
// existe en el catalogo, aunque aparezca en ejemplos de la documentacion.
// Comprobar siempre con `npx wrangler ai models` antes de cambiarlo.
//
// El de 70B sale a unos 70 Neurons por pregunta, asi que los 10.000 diarios
// dan para unas 140. De sobra para dos personas, y razona mucho mejor sobre
// cuando negarse a dar la solucion.
const MODELO = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
const TOPE_DIARIO = 40
const MAXIMO_PREGUNTA = 500

const INSTRUCCION = `Eres Armonia, la ayudante de un taller donde se aprende a construir paginas web desde cero.

Tu papel es que la persona ENTIENDA, no que termine. Nunca escribes la solucion del ejercicio.

Reglas que no puedes saltarte:
- No escribas el codigo que resuelve el paso, ni entero ni a trozos que solo haya que pegar.
- Si te piden la solucion directamente, niegate con amabilidad y devuelve una pregunta que les haga pensar.
- Puedes explicar conceptos, aclarar vocabulario y poner ejemplos con OTRO tema distinto al del ejercicio.
- Si se han atascado, sugiere el siguiente paso pequeno, no el resultado final.
- Responde en espanol, en dos o tres parrafos como mucho. Tono sereno y calido, sin efusividad.
- Si no sabes algo, dilo.

No conoces la solucion de este ejercicio: no te la han dado. No te la inventes ni finjas tenerla.`

// El detector de "dame la solucion", las negativas y el tapador de codigo
// viven en src/motor/armonia-comun.js: los comparte con la Armonia local de la
// app de escritorio, para que las dos se comporten igual. Se re-exportan
// porque las pruebas (y quien lea este fichero) los buscan aqui.
export { pareceQuePideSolucion, taparCodigo }

// Distinguir "se han acabado los Neurons del dia" de "esto esta roto". Se mira
// el texto del error porque Workers AI no expone un codigo estable para esto.
const SENALES_DE_CUOTA = /(quota|neuron|capacity|rate.?limit|too many requests|exceed|429|3040)/i

export function esCuotaAgotada(mensaje) {
  return SENALES_DE_CUOTA.test(String(mensaje || ''))
}

// PROTECCION 1 — lista blanca.
// Del ejercicio solo salen de aqui titulo, enunciado y leccion. Ni la
// solucion, ni los tests, ni las pistas entran en el proceso: no es que se
// filtren despues, es que nunca llegan a estar en el prompt.
export function contextoPermitido(numeroMundo, idPaso) {
  const mundo = mundos.find((m) => m.numero === Number(numeroMundo))
  if (!mundo) return null

  const paso = mundo.pasos.find((p) => p.id === idPaso)
  const sinEtiquetas = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return [
    `Mundo: ${mundo.titulo}`,
    paso ? `Paso: ${paso.titulo}` : null,
    paso ? `Enunciado: ${sinEtiquetas(paso.enunciado)}` : null,
    mundo.apunte ? `Leccion de referencia: ${mundo.apunte.cuerpo.slice(0, 1500)}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')
}

// PROTECCION 4 — filtrado de salida: taparCodigo, arriba en el re-export.
// Aunque el modelo se venga arriba y suelte codigo, se tapa mientras el paso
// siga abierto.

async function consumirCuota(c, usuarioId) {
  const dia = new Date().toISOString().slice(0, 10)

  const fila = await c.env.DB.prepare(
    `INSERT INTO uso_armonia (usuario_id, dia, consultas) VALUES (?, ?, 1)
     ON CONFLICT (usuario_id, dia) DO UPDATE SET consultas = consultas + 1
     RETURNING consultas`,
  )
    .bind(usuarioId, dia)
    .first()

  return fila ? fila.consultas : 0
}

armonia.post('/api/armonia', async (c) => {
  let cuerpo
  try {
    cuerpo = await c.req.json()
  } catch {
    return c.json({ error: 'cuerpo_invalido' }, 400)
  }

  const pregunta = String(cuerpo?.pregunta || '').trim()
  if (!pregunta) return c.json({ error: 'sin_pregunta' }, 400)
  if (pregunta.length > MAXIMO_PREGUNTA) {
    return c.json({ error: 'pregunta_larguisima', mensaje: `Maximo ${MAXIMO_PREGUNTA} caracteres.` }, 400)
  }

  // PROTECCION 3 — rechazo antes de gastar.
  if (pareceQuePideSolucion(pregunta)) {
    const cual = Math.floor(Math.random() * NEGATIVAS.length)
    return c.json({ respuesta: NEGATIVAS[cual], modo: 'negativa', gastado: false })
  }

  const usuarioId = await usuarioIdDe(c)
  if (!usuarioId) return c.json({ error: 'sin_identidad' }, 401)

  const consultas = await consumirCuota(c, usuarioId)
  if (consultas > TOPE_DIARIO) {
    return c.json({
      respuesta: 'Por hoy ya he pensado bastante. Manana con las ideas frescas.',
      modo: 'cuota_propia',
      gastado: false,
    })
  }

  const contexto = contextoPermitido(cuerpo?.mundo, cuerpo?.paso)

  try {
    // PROTECCION 2 — la instruccion de sistema se monta aqui, en el servidor.
    // Desde el navegador no hay forma de reescribirla.
    const salida = await c.env.AI.run(MODELO, {
      messages: [
        { role: 'system', content: INSTRUCCION },
        ...(contexto ? [{ role: 'system', content: `Contexto del ejercicio:\n${contexto}` }] : []),
        { role: 'user', content: pregunta },
      ],
      max_tokens: 400,
    })

    const texto = String(salida?.response || '').trim()
    if (!texto) throw new Error('respuesta vacia')

    return c.json({ respuesta: taparCodigo(texto), modo: 'modelo', gastado: true })
  } catch (error) {
    // Aqui habia un fallo de diseno: TODO error se contaba como cuota agotada.
    // Cuando el nombre del modelo estaba mal, Armonia respondia "vuelve
    // manana" y no habia forma de saber que pasaba de verdad. Un mensaje de
    // error que miente cuesta horas.
    const detalle = String(error && error.message ? error.message : error)
    console.error('Armonia ha fallado:', detalle)

    if (esCuotaAgotada(detalle)) {
      return c.json({
        respuesta:
          'Hoy ya no me da la cabeza para mas. Vuelve manana, que se reinicia. Mientras tanto tienes el glosario y los apuntes de Wax.',
        modo: 'cuota',
        gastado: false,
      })
    }

    return c.json({
      respuesta: 'Algo se ha roto por dentro y no he podido pensar. No eres tu, soy yo.',
      modo: 'averiada',
      // Los que usan esto son quienes lo construyen: que vean el error de
      // verdad en pantalla ahorra una vuelta entera de diagnostico.
      detalle,
      gastado: false,
    })
  }
})
