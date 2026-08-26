// Mundo 13 — Que no te la cuelen.
//
// El unico mundo donde el alumno ATACA antes de defender, y a proposito: leer
// que la inyeccion SQL es peligrosa no convence a nadie. Escribir tú mismo el
// texto que se salta el filtro y ver salir la tabla entera, sí.
//
// Todo ocurre contra SQLite de verdad y contra un DOM de verdad. La inyeccion
// funciona porque funciona, no porque lo simulemos.
//
// Dialogos originales, en el registro de los personajes.

import { ejecutar as ejecutarJs, ejecutarPagina } from '../../motor/ejecutar-js.js'
import { crearEnv } from '../../motor/shim-d1.js'
import { buscarTodos, leerHtml } from '../../motor/leer-html.js'

const DATOS = `CREATE TABLE sombreros (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  secreto TEXT NOT NULL DEFAULT 'nada'
);

INSERT INTO sombreros (id, nombre, secreto) VALUES
  (1, 'El de siempre',      'lo compró en un mercadillo'),
  (2, 'Hongo de contable',  'no es suyo'),
  (3, 'El de las bodas',    'la mancha es de vino'),
  (4, 'Gorra de conductor', 'nunca ha conducido'),
  (5, 'El prestado',        'sigue sin devolverlo');
`

// El handler sembrado es vulnerable A PROPOSITO. Es el ejercicio.
const API_VULNERABLE = `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const busca = url.searchParams.get("q") || "";

    // ⚠️ Esta consulta pega el texto de fuera dentro del SQL.
    //    Está mal a propósito: es lo que tienes que romper.
    const { results } = await env.DB.prepare(
      "SELECT id, nombre FROM sombreros WHERE nombre = '" + busca + "'"
    ).all();

    return Response.json({ sombreros: results });
  }
};
`

const APP_VULNERABLE = `// Pinta los resultados de la búsqueda.
function pintar(lista) {
  const caja = document.querySelector("#resultados");
  caja.innerHTML = "";

  for (const sombrero of lista) {
    // ⚠️ innerHTML interpreta lo que le metas como HTML.
    caja.innerHTML += "<article><h2>" + sombrero.nombre + "</h2></article>";
  }
}

pintar(window.__datos || []);
`

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Buscador de sombreros</title>
  </head>
  <body>
    <h1>Buscar</h1>
    <div id="resultados"></div>
    <script src="app.js"></script>
  </body>
</html>
`

const ATAQUE_VACIO = `Escribe aquí, en una sola línea, el texto que harías pasar por
el buscador para que devuelva TODOS los sombreros en vez de uno.

(Este fichero es tu cuaderno de notas: solo se lee la primera línea
que no empiece por paréntesis.)
`

function textoDelAtaque(contenido) {
  return String(contenido || '')
    .split('\n')
    .map((linea) => linea.trim())
    .find((linea) => linea && !linea.startsWith('(') && !linea.startsWith('Escribe aquí') && !linea.startsWith('el buscador') && !linea.startsWith('que no empiece'))
}

async function buscar(ficheros, termino) {
  const motor = await import('../../motor/sql.js')
  await motor.reiniciar('seguridad')
  await motor.ejecutarGuion(DATOS, 'seguridad')

  const salida = ejecutarJs(String(ficheros?.['api.js'] || ''), leerHtml('<body></body>'), {
    capturar: 'worker',
  })
  if (salida.error) return { fallo: salida.error }

  const worker = salida.capturado
  if (!worker || typeof worker.fetch !== 'function') return { sinWorker: true }

  const env = await crearEnv('seguridad')
  const url = `https://ejemplo.com/api/buscar?q=${encodeURIComponent(termino)}`

  try {
    const respuesta = await worker.fetch(new Request(url), env)
    const texto = await respuesta.text()
    let datos = null
    try {
      datos = JSON.parse(texto)
    } catch {
      /* puede no ser JSON si ha reventado */
    }
    return { estado: respuesta.status, datos, texto }
  } catch (error) {
    return { fallo: { tipo: 'ejecucion', message: error.message } }
  }
}

const filasDe = (r) => (Array.isArray(r?.datos?.sombreros) ? r.datos.sombreros : null)

export default {
  numero: 13,
  acto: 'El otro lado',
  titulo: 'Mundo 13 · Que no te la cuelen',

  entradilla: {
    quien: 'wayne',
    texto:
      'Este mundo me gusta porque por una vez el que hace la trampa eres tú. Y créeme: entender una trampa desde dentro ' +
      'es la única forma de no caer en ella. Lo sé por motivos que no vienen al caso.',
  },

  ficheros: {
    'index.html': HTML_BASE,
    'api.js': API_VULNERABLE,
    'app.js': APP_VULNERABLE,
    'datos.sql': DATOS,
    'ataque.txt': ATAQUE_VACIO,
  },

  solucion: {
    'index.html': HTML_BASE,
    'datos.sql': DATOS,
    'ataque.txt': "' OR '1'='1",
    'api.js': `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const busca = url.searchParams.get("q") || "";

    const { results } = await env.DB.prepare(
      "SELECT id, nombre FROM sombreros WHERE nombre = ?"
    ).bind(busca).all();

    return Response.json({ sombreros: results });
  }
};
`,
    'app.js': `function pintar(lista) {
  const caja = document.querySelector("#resultados");
  caja.textContent = "";

  for (const sombrero of lista) {
    const ficha = document.createElement("article");
    const titulo = document.createElement("h2");
    titulo.textContent = sombrero.nombre;
    ficha.appendChild(titulo);
    caja.appendChild(ficha);
  }
}

pintar(window.__datos || []);
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Inyección, XSS, y la regla que los resume',
    cuerpo: `Los dos fallos de seguridad más comunes de la web son el mismo fallo cometido en dos sitios distintos: **texto que escribió otra persona acaba siendo interpretado como instrucciones**.

**Inyección SQL.** Mira esta consulta:

    "SELECT id, nombre FROM sombreros WHERE nombre = '" + busca + "'"

Si alguien busca "El de siempre", queda:

    SELECT id, nombre FROM sombreros WHERE nombre = 'El de siempre'

Perfecto. Pero si escribe \`' OR '1'='1\`, queda:

    SELECT id, nombre FROM sombreros WHERE nombre = '' OR '1'='1'

Y eso ya no es una búsqueda: es una condición que siempre es cierta. Devuelve la tabla entera. La comilla que escribió esa persona **cerró** la comilla de tu consulta, y a partir de ahí lo que escribiera era SQL, no un dato.

Con un \`;\` puede añadir otra sentencia. Y ahí ya no hablamos de leer de más: hablamos de borrar.

**La solución no es escapar comillas.** Es no pegar nunca el valor a la consulta:

    "SELECT id, nombre FROM sombreros WHERE nombre = ?"

y aparte \`.bind(busca)\`. La interrogación es un **hueco**, y el valor viaja por otro canal. La base recibe la consulta y los datos por separado, así que **nada de lo que escriba esa persona puede convertirse en SQL**. No importa lo que escriba. Deja de ser un problema de listas de caracteres prohibidos y pasa a ser imposible por construcción.

Intentar arreglarlo filtrando comillas es una carrera que se pierde: siempre hay una codificación, un carácter unicode o un caso raro en el que tu filtro falla.

**XSS: la misma historia, en el navegador.** Aquí:

    caja.innerHTML += "<article><h2>" + sombrero.nombre + "</h2></article>";

Si un nombre es \`<img src=x onerror="robar()">\`, eso no se pinta como texto: el navegador lo **ejecuta**. Y se ejecuta en el navegador de quien esté mirando la página, con sus cookies y su sesión.

La solución tiene la misma forma: no construyas HTML pegando texto. Crea el elemento y pon el texto como texto.

    const titulo = document.createElement("h2");
    titulo.textContent = sombrero.nombre;

\`textContent\` no interpreta nada: si el nombre contiene \`<script>\`, se verá escrito \`<script>\`, que es exactamente lo que debe pasar.

**La regla que resume las dos:** los datos son datos y el código es código, y la separación entre ambos no la puede decidir el texto que llega de fuera.

**Validar en el cliente no cuenta.** Comprobar en el navegador está bien para avisar rápido, pero **no es seguridad**: cualquiera puede llamar a tu API sin pasar por tu página. Toda comprobación que importe se repite en el servidor.

**Contraseñas.** No se guardan. Se guarda el resultado de pasarlas por una función lenta y con sal (bcrypt, argon2, PBKDF2 con muchas iteraciones). Lenta a propósito: si te roban la base, quien la tenga necesita años en vez de minutos.

Y aquí, un ejemplo de restricción real: en el plan gratuito de Cloudflare hay 10 ms de CPU por petición, y un hasheo en condiciones no cabe. Por eso este taller no gestiona contraseñas: delega la identidad en Cloudflare Access. Reconocer que algo no cabe y buscar otra solución es más seguro que hacerlo mal por cumplir.

**HTTPS.** Sin él, todo lo anterior da igual: cualquiera en la misma red lo lee. Hoy es gratis y automático. No hay excusa.`,
  },

  pasos: [
    {
      id: '13-1',
      titulo: 'Rompe el buscador',
      enunciado:
        'El buscador de <code>api.js</code> pega el texto dentro de la consulta. Encuentra un texto que, al buscarlo, devuelva <strong>los cinco sombreros</strong> en vez de uno, y escríbelo en la primera línea de <code>ataque.txt</code>.',
      pista: 'Mira la consulta: tu texto va entre comillas simples. ¿Y si cierras esa comilla y añades una condición que siempre sea verdad?',
      async comprobar(ficheros) {
        const ataque = textoDelAtaque(ficheros?.['ataque.txt'])
        if (!ataque) {
          return { superado: false, mensaje: 'El fichero ataque.txt no tiene ninguna línea con tu intento.' }
        }

        // El ataque se prueba SIEMPRE contra el buscador vulnerable original,
        // no contra el api.js que tenga ahora el alumno. Si no, al arreglarlo
        // en el paso siguiente este paso dejaría de estar superado, y eso no
        // tiene sentido: haber encontrado el agujero sigue siendo cierto.
        const r = await buscar({ ...ficheros, 'api.js': API_VULNERABLE }, ataque)
        if (r.fallo) return { superado: false, mensaje: `El handler ha reventado: ${r.fallo.message}` }
        if (r.sinWorker) return { superado: false, mensaje: 'No encuentro el objeto «worker» en api.js.' }

        const filas = filasDe(r)
        if (!filas) {
          return {
            superado: false,
            mensaje: `Con ese texto la consulta revienta en vez de devolver filas. Estás cerca: has roto la sintaxis, pero hay que dejarla válida. Respuesta: ${r.texto.slice(0, 90)}`,
          }
        }

        if (filas.length < 5) {
          return {
            superado: false,
            mensaje: `Ese texto devuelve ${filas.length} sombrero(s). Hay que llegar a los 5: la condición tiene que ser cierta para todas las filas.`,
          }
        }

        return {
          superado: true,
          mensaje: `Cinco de cinco. Acabas de leerte la tabla entera con una comilla. Y esto es lo suave: con un punto y coma se pueden borrar cosas.`,
        }
      },
    },

    {
      id: '13-2',
      titulo: 'Ciérralo bien',
      enunciado:
        'Ahora arréglalo en <code>api.js</code>: usa <code>?</code> en la consulta y pasa el valor con <code>.bind(busca)</code>. Nada de filtrar comillas, que es una carrera que se pierde.',
      pista: 'La consulta pasa a ser <code>"… WHERE nombre = ?"</code> y después <code>.bind(busca).all()</code>.',
      async comprobar(ficheros) {
        const ataque = textoDelAtaque(ficheros?.['ataque.txt']) || "' OR '1'='1"

        // El mismo ataque de antes ya no debe funcionar.
        const atacado = await buscar(ficheros, ataque)
        if (atacado.fallo) return { superado: false, mensaje: `El handler ha reventado: ${atacado.fallo.message}` }

        const filasAtaque = filasDe(atacado)
        if (!filasAtaque) {
          return { superado: false, mensaje: 'Con el texto del ataque, la respuesta ya no es JSON válido. Algo se ha roto al arreglarlo.' }
        }
        if (filasAtaque.length > 0) {
          return {
            superado: false,
            mensaje: `El ataque sigue devolviendo ${filasAtaque.length} filas. Mientras el valor se pegue al texto de la consulta, seguirá funcionando.`,
          }
        }

        // Y una búsqueda normal tiene que seguir funcionando.
        const normal = await buscar(ficheros, 'El de siempre')
        const filasNormal = filasDe(normal)
        if (!filasNormal || filasNormal.length !== 1) {
          return {
            superado: false,
            mensaje: `El ataque ya no funciona, pero la búsqueda normal de «El de siempre» devuelve ${filasNormal ? filasNormal.length : 'nada'} y debería devolver 1.`,
          }
        }

        // Y que no se haya arreglado a base de filtrar comillas.
        const fuente = String(ficheros?.['api.js'] || '')
        if (!/\.bind\s*\(/.test(fuente)) {
          return {
            superado: false,
            mensaje: 'Funciona, pero no veo ningún .bind(). Si lo has resuelto quitando comillas del texto, cámbialo: ese filtro se salta antes o después.',
          }
        }

        return {
          superado: true,
          mensaje: 'Mismo ataque, cero filas. Y no porque lo hayas filtrado: porque ya no puede llegar a ser SQL.',
        }
      },
    },

    {
      id: '13-3',
      titulo: 'Y ahora en el navegador',
      enunciado:
        'El mismo fallo está en <code>app.js</code>: pega los nombres con <code>innerHTML</code>. Si alguien se llama <code>&lt;img src=x onerror=…&gt;</code>, el navegador lo ejecuta. Reescríbelo con <code>createElement</code> y <code>textContent</code>.',
      pista: 'Crea el <code>&lt;article&gt;</code> y el <code>&lt;h2&gt;</code>, ponle el nombre con <code>textContent</code> y cuélgalos con <code>appendChild</code>.',
      comprobar(ficheros) {
        const veneno = '<img src=x onerror="alert(1)"><script>alert(2)<\/script>'
        const datos = [{ nombre: 'El de siempre' }, { nombre: veneno }]

        const resultado = ejecutarPagina(ficheros?.['index.html'] || '', ficheros?.['app.js'] || '', {
          extras: { window: { __datos: datos } },
        })

        if (resultado.error) {
          return { superado: false, mensaje: `Tu código ha reventado: ${resultado.error.message}` }
        }

        const documento = resultado.documento
        const caja = documento.querySelector('#resultados')
        if (!caja) return { superado: false, mensaje: 'Se ha perdido el contenedor #resultados del HTML.' }

        const fichas = buscarTodos(documento, '#resultados article')
        if (fichas.length !== 2) {
          return {
            superado: false,
            mensaje: `Se pintan ${fichas.length} fichas y hay 2 sombreros en los datos.`,
          }
        }

        // Lo importante: el nombre envenenado tiene que verse ESCRITO, no
        // haberse convertido en elementos.
        const inyectados = buscarTodos(documento, '#resultados img, #resultados script')
        if (inyectados.length) {
          return {
            superado: false,
            mensaje: `El nombre malicioso ha creado ${inyectados.length} elemento(s) de verdad (${inyectados
              .map((n) => n.tagName.toLowerCase())
              .join(', ')}). Con innerHTML, el texto de otra persona se convierte en HTML.`,
          }
        }

        const escrito = fichas.some((ficha) => ficha.textContent.includes('<img'))
        if (!escrito) {
          return {
            superado: false,
            mensaje: 'No se han creado elementos raros, pero tampoco aparece el nombre escrito tal cual. Debería verse el texto completo, con sus ángulos y todo.',
          }
        }

        return {
          superado: true,
          mensaje: 'El nombre se ve escrito, con sus ángulos, sin ejecutarse. Eso es textContent haciendo su trabajo.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Los dos fallos que has arreglado son el mismo: texto de fuera acabando donde se interpretan instrucciones. ' +
      'Cuando dudes de si algo es seguro, hazte esa pregunta, y no la de si has filtrado bastante.',
  },
}
