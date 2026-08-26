// Worker publico: la portada, el catalogo de sombreros y las paginas que los
// alumnos han publicado. Sin Access delante, cualquiera entra.

import { Hono } from 'hono'
import { catalogo, montarVotacion } from './catalogo.js'
import { publicado } from './publicado.js'

const app = new Hono()

app.route('/', catalogo)
app.route('/', publicado)

const COOKIE_VISITANTE = 'visitante'
const ANO_EN_SEGUNDOS = 60 * 60 * 24 * 365

function leerCookie(c, nombre) {
  const crudas = c.req.header('cookie') || ''
  for (const trozo of crudas.split(';')) {
    const [clave, ...resto] = trozo.trim().split('=')
    if (clave === nombre) return resto.join('=')
  }
  return null
}

// Identidad de visitante para poder votar sin registrarse.
//
// Es deliberadamente floja: quien borre las cookies puede volver a votar. No
// pretende ser inviolable, solo evitar que se vote diez veces seguidas por
// darle al boton. Para un catalogo de sombreros da de sobra; si esto fuera una
// votacion con algo en juego, harian falta cuentas de verdad.
async function visitanteIdDe(c) {
  let ficha = leerCookie(c, COOKIE_VISITANTE)

  if (!/^[0-9a-f-]{36}$/i.test(ficha || '')) {
    ficha = crypto.randomUUID()
    c.header(
      'Set-Cookie',
      `${COOKIE_VISITANTE}=${ficha}; Path=/; Max-Age=${ANO_EN_SEGUNDOS}; HttpOnly; Secure; SameSite=Lax`,
      { append: true },
    )
  }

  const fila = await c.env.DB.prepare(
    `INSERT INTO usuarios (email, alias) VALUES (?, ?)
     ON CONFLICT (email) DO UPDATE SET email = excluded.email
     RETURNING id`,
  )
    .bind(`anonimo:${ficha}`, 'alguien de paso')
    .first()

  return fila ? fila.id : null
}

montarVotacion(app, visitanteIdDe)

app.onError((error, c) => {
  console.error('fallo en el Worker publico:', error && error.stack)
  return c.json({ error: 'algo_ha_petado' }, 500)
})

export default {
  async fetch(peticion, env, contexto) {
    const url = new URL(peticion.url)

    // Lo que no sea API ni pagina publicada es la aplicacion de Vue. Los
    // ficheros que existen no llegan hasta aqui (los sirve el binding de
    // assets gratis y sin invocar al Worker); esto es solo para las rutas
    // internas de la aplicacion.
    const esDelWorker = url.pathname.startsWith('/api/') || url.pathname.startsWith('/publicado/')
    if (!esDelWorker) {
      return env.ASSETS.fetch(new Request(new URL('/', url), peticion))
    }

    return app.fetch(peticion, env, contexto)
  },
}
