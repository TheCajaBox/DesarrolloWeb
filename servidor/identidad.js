// Quien esta al otro lado.
//
// No hay registro propio ni contrasenas: de eso se encarga Cloudflare Access,
// que planta un PIN de un solo uso delante del Worker del taller. Aqui solo se
// lee la identidad que Access ya ha verificado.

const CABECERA_EMAIL = 'cf-access-authenticated-user-email'

// En desarrollo no hay Access delante, asi que se usa una identidad ficticia.
// Solo se activa si esta puesta la variable, nunca por accidente en produccion.
function identidadDePruebas(env) {
  return env && env.EMAIL_DE_PRUEBAS ? { email: env.EMAIL_DE_PRUEBAS, alias: 'pruebas' } : null
}

export async function identidadDe(c) {
  // La via buena: Access a nivel de Worker expone la identidad ya verificada.
  const acceso = c.executionCtx && c.executionCtx.access
  if (acceso && typeof acceso.getIdentity === 'function') {
    try {
      const identidad = await acceso.getIdentity()
      if (identidad && identidad.email) return { email: identidad.email, alias: aliasDe(identidad) }
    } catch {
      // Access configurado pero sin sesion: se cae a las siguientes opciones.
    }
  }

  // Respaldo para aplicaciones de Access por nombre de host, que en vez del
  // objeto de identidad inyectan esta cabecera.
  const email = c.req.header(CABECERA_EMAIL)
  if (email) return { email, alias: email.split('@')[0] }

  return identidadDePruebas(c.env)
}

function aliasDe(identidad) {
  return identidad.name || (identidad.email ? identidad.email.split('@')[0] : 'alguien')
}

// Devuelve el id de la fila de usuarios, creandola la primera vez. El email
// viene de Access, asi que es de fiar como clave.
export async function usuarioIdDe(c) {
  const identidad = await identidadDe(c)
  if (!identidad) return null

  const fila = await c.env.DB.prepare(
    `INSERT INTO usuarios (email, alias) VALUES (?, ?)
     ON CONFLICT (email) DO UPDATE SET email = excluded.email
     RETURNING id`,
  )
    .bind(identidad.email, identidad.alias)
    .first()

  return fila ? fila.id : null
}

// Middleware para las rutas que no tienen sentido sin saber quien eres.
export function exigirIdentidad() {
  return async (c, siguiente) => {
    const identidad = await identidadDe(c)
    if (!identidad) {
      return c.json(
        { error: 'sin_identidad', mensaje: 'Esta parte va detras de Access y no hay sesion.' },
        401,
      )
    }
    c.set('identidad', identidad)
    await siguiente()
  }
}
