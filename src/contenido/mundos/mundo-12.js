// Mundo 12 — La API.
//
// El alumno escribe un handler de Worker de verdad y aqui se ejecuta de
// verdad, con un `env.DB` que imita a D1 sobre SQLite. Su codigo es el mismo
// que desplegaria: no hay nada que traducir despues.
//
// La unica diferencia con un Worker real es la primera linea: alli se escribe
// `export default { ... }` y aqui `const worker = { ... }`, porque el codigo se
// ejecuta en un sandbox que no admite modulos. Se dice en la leccion, sin
// disimularlo.
//
// Dialogos originales, en el registro de los personajes.

import { ejecutar as ejecutarJs } from '../../motor/ejecutar-js.js'
import { crearEnv } from '../../motor/shim-d1.js'
import { leerHtml } from '../../motor/leer-html.js'

const DATOS = `CREATE TABLE sombreros (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT ''
);

INSERT INTO sombreros (id, nombre, descripcion) VALUES
  (1, 'El de siempre',     'Marrón, con el ala vencida.'),
  (2, 'Hongo de contable', 'Duro, redondo y respetable.'),
  (3, 'El de las bodas',   'Gris perla, impecable.');
`

const API_BASE = `// Esto es un Worker. En un proyecto de verdad, la primera línea sería
// "export default {" — aquí es "const worker = {" porque el código se
// ejecuta en un sandbox. Todo lo demás es idéntico.

const worker = {
  async fetch(request, env) {
    // Escribe aquí.
  }
};
`

// Ejecuta el handler del alumno contra una peticion y devuelve la respuesta.
async function llamar(ficheros, ruta, opciones = {}) {
  const codigo = String(ficheros?.['api.js'] || '')

  const motor = await import('../../motor/sql.js')
  await motor.reiniciar('api')
  await motor.ejecutarGuion(DATOS, 'api')

  const salida = ejecutarJs(codigo, leerHtml('<body></body>'), { capturar: 'worker' })
  if (salida.error) return { fallo: salida.error }

  const worker = salida.capturado
  if (!worker || typeof worker.fetch !== 'function') {
    return { sinWorker: true }
  }

  const env = await crearEnv('api')

  try {
    const respuesta = await worker.fetch(new Request(`https://ejemplo.com${ruta}`, opciones), env)
    if (!respuesta || typeof respuesta.status !== 'number') {
      return { respuestaInvalida: true, devuelto: respuesta }
    }

    const texto = await respuesta.text()
    let datos = null
    try {
      datos = JSON.parse(texto)
    } catch {
      /* no era JSON, y a veces eso es correcto */
    }

    return {
      estado: respuesta.status,
      tipo: respuesta.headers.get('content-type') || '',
      texto,
      datos,
    }
  } catch (error) {
    return { fallo: { tipo: 'ejecucion', message: error.message } }
  }
}

function problemaDe(r) {
  if (r.fallo) {
    return r.fallo.tipo === 'sintaxis'
      ? `Tu código no llega ni a ejecutarse: ${r.fallo.message}`
      : `Tu handler ha reventado: ${r.fallo.message}`
  }
  if (r.sinWorker) {
    return 'No encuentro un objeto «worker» con un método «fetch». Revisa que siga estando el const worker = { async fetch(request, env) { … } }.'
  }
  if (r.respuestaInvalida) {
    return `Tu fetch ha devuelto ${r.devuelto === undefined ? 'undefined' : typeof r.devuelto} en vez de un Response. Todo camino tiene que terminar devolviendo uno.`
  }
  return null
}

export default {
  numero: 12,
  acto: 'El otro lado',
  titulo: 'Mundo 12 · La API',

  entradilla: {
    quien: 'wayne',
    texto:
      'Ahora te toca ser el de la ventanilla. Alguien viene, pide algo, y tú contestas. ' +
      'Lo importante de estar en la ventanilla es que también hay que saber decir que no, y decirlo bien.',
  },

  ficheros: { 'api.js': API_BASE, 'datos.sql': DATOS },

  solucion: {
    'datos.sql': DATOS,
    'api.js': `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/sombreros") {
      const { results } = await env.DB.prepare(
        "SELECT id, nombre, descripcion FROM sombreros ORDER BY nombre"
      ).all();

      return Response.json({ sombreros: results });
    }

    if (url.pathname.startsWith("/api/sombreros/")) {
      const id = Number(url.pathname.split("/").pop());

      if (!Number.isInteger(id)) {
        return Response.json({ error: "id_invalido" }, { status: 400 });
      }

      const sombrero = await env.DB.prepare(
        "SELECT id, nombre, descripcion FROM sombreros WHERE id = ?"
      ).bind(id).first();

      if (!sombrero) {
        return Response.json({ error: "no_existe" }, { status: 404 });
      }

      return Response.json({ sombrero });
    }

    return Response.json({ error: "ruta_desconocida" }, { status: 404 });
  }
};
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Diseñar una API que no dé sorpresas',
    cuerpo: `Un handler de Worker es una función que recibe una petición y devuelve una respuesta. Nada más:

    const worker = {
      async fetch(request, env) {
        return new Response("hola");
      }
    };

En un proyecto de verdad esa primera línea es \`export default {\`. Aquí es \`const worker = {\` porque el código se ejecuta en un sandbox que no admite módulos. Es la única diferencia, y conviene saberla para no sorprenderse al desplegar.

**Los dos argumentos.** \`request\` es lo que ha pedido quien llama: su URL, su método, sus cabeceras y su cuerpo. \`env\` es lo que tú le has dado al Worker en la configuración: aquí, \`env.DB\`, que es la base de datos.

Fíjate en que la base **no se abre ni se conecta**. No hay contraseña ni cadena de conexión en el código: el enlace se declara fuera y el Worker lo recibe hecho. Ese es el modelo, y evita la fuga de credenciales más común que existe, que es una contraseña escrita en un fichero que acaba en un repositorio.

**Leer la ruta.** \`request.url\` es la dirección completa. Para trabajar con ella:

    const url = new URL(request.url);
    url.pathname            // "/api/sombreros/3"
    url.searchParams.get("q")  // lo que venga en ?q=...

**Consultar, con parámetros.** Siempre así:

    const { results } = await env.DB.prepare(
      "SELECT id, nombre FROM sombreros WHERE id = ?"
    ).bind(id).all();

Esa interrogación es un **hueco**, y \`bind\` mete el valor dentro sin que forme parte del texto de la consulta. Nunca, jamás, se pega el valor a la cadena. El mundo siguiente enseña exactamente por qué, con una demostración.

\`all()\` devuelve todas las filas; \`first()\` la primera o \`null\`; \`run()\` no devuelve filas y sirve para INSERT, UPDATE y DELETE.

**Contestar.** Para JSON hay un atajo:

    return Response.json({ sombreros: results });

Que pone el \`Content-Type\` correcto solo. Con estado distinto:

    return Response.json({ error: "no_existe" }, { status: 404 });

**Elegir bien el número.** Es lo que separa una API que se puede usar de una que no:

- **200** cuando hay resultado. Una lista vacía **también es 200**: has preguntado bien y la respuesta es "ninguno".
- **404** cuando el recurso concreto no existe. Pedir el sombrero 999 es 404; pedir la lista y que esté vacía, no.
- **400** cuando la petición está mal formada: un id que no es un número, un cuerpo sin el campo obligatorio.
- **401** cuando no sé quién eres. **403** cuando sé quién eres y no puedes.
- **500** solo cuando el error es tuyo. Si devuelves 500 porque el usuario mandó basura, estás echándote la culpa y además ocultando el problema real.

**Validar lo que entra, siempre.** Todo lo que llega de fuera es sospechoso, incluido lo que manda tu propio frontend: cualquiera puede llamar a tu API sin pasar por tu página.

    const id = Number(url.pathname.split("/").pop());
    if (!Number.isInteger(id)) {
      return Response.json({ error: "id_invalido" }, { status: 400 });
    }

**Y una regla que evita mucho dolor:** todos los caminos tienen que terminar devolviendo un \`Response\`. Si un \`if\` no lo hace, ahí devolverás \`undefined\` y el Worker dará un error genérico que no dice nada de dónde estaba el fallo.`,
  },

  pasos: [
    {
      id: '12-1',
      titulo: 'Contesta algo',
      enunciado:
        'Haz que <code>/api/sombreros</code> devuelva la lista de sombreros en JSON, sacada de la base con <code>env.DB</code>. Devuelve <code>Response.json({ sombreros: results })</code>.',
      pista: 'Lee la ruta con <code>new URL(request.url).pathname</code>. La consulta es <code>await env.DB.prepare("SELECT …").all()</code>.',
      async comprobar(ficheros) {
        const r = await llamar(ficheros, '/api/sombreros')
        const problema = problemaDe(r)
        if (problema) return { superado: false, mensaje: problema }

        if (r.estado !== 200) {
          return { superado: false, mensaje: `Devuelve un ${r.estado} y debería ser 200.` }
        }
        if (!r.datos) {
          return { superado: false, mensaje: `La respuesta no es JSON válido. Devuelve: ${r.texto.slice(0, 80)}` }
        }

        const lista = r.datos.sombreros
        if (!Array.isArray(lista)) {
          return {
            superado: false,
            mensaje: `El JSON no tiene una propiedad «sombreros» con un array. Devuelve: ${JSON.stringify(r.datos).slice(0, 90)}`,
          }
        }
        if (lista.length !== 3) {
          return { superado: false, mensaje: `Vienen ${lista.length} sombreros y en la base hay 3.` }
        }
        if (!lista[0]?.nombre) {
          return { superado: false, mensaje: 'Los sombreros vienen sin «nombre». Revisa qué columnas pides en el SELECT.' }
        }

        return { superado: true, mensaje: 'Tu primer endpoint, sacando datos de la base de verdad.' }
      },
    },

    {
      id: '12-2',
      titulo: 'Uno concreto',
      enunciado:
        'Añade <code>/api/sombreros/2</code>, que devuelva <strong>ese</strong> sombrero. Usa un parámetro con <code>?</code> y <code>.bind(id)</code>, y <code>.first()</code> en vez de <code>.all()</code>.',
      pista: 'El id sale de la ruta: <code>url.pathname.split("/").pop()</code>, convertido a número.',
      async comprobar(ficheros) {
        const r = await llamar(ficheros, '/api/sombreros/2')
        const problema = problemaDe(r)
        if (problema) return { superado: false, mensaje: problema }

        if (r.estado !== 200) return { superado: false, mensaje: `Devuelve un ${r.estado} y debería ser 200.` }
        if (!r.datos) return { superado: false, mensaje: 'La respuesta no es JSON válido.' }

        const uno = r.datos.sombrero || r.datos
        if (Array.isArray(uno) || Array.isArray(r.datos.sombreros)) {
          return { superado: false, mensaje: 'Sigue devolviendo la lista entera. Esta ruta tiene que devolver uno solo.' }
        }
        if (!uno?.nombre) {
          return { superado: false, mensaje: `No encuentro el sombrero en la respuesta: ${JSON.stringify(r.datos).slice(0, 90)}` }
        }
        if (!/hongo/i.test(String(uno.nombre))) {
          return { superado: false, mensaje: `El id 2 es «Hongo de contable» y devuelves «${uno.nombre}». Revisa el bind.` }
        }

        // Que la lista siga funcionando: es un error clasico romperla al
        // anadir la ruta nueva.
        const lista = await llamar(ficheros, '/api/sombreros')
        if (lista.estado !== 200 || !Array.isArray(lista.datos?.sombreros)) {
          return { superado: false, mensaje: 'Al añadir la ruta nueva se ha roto /api/sombreros. Las dos tienen que convivir.' }
        }

        return { superado: true, mensaje: 'Parámetro enlazado y una sola fila. Así se piden recursos concretos.' }
      },
    },

    {
      id: '12-3',
      titulo: 'Aprende a decir que no',
      enunciado:
        'Falta lo que separa una API usable de una que no: los errores. <code>/api/sombreros/999</code> tiene que devolver <strong>404</strong>, y <code>/api/sombreros/pepe</code> un <strong>400</strong>, porque eso ni siquiera es un id.',
      pista: 'Comprueba con <code>Number.isInteger</code> antes de consultar. Y si <code>first()</code> devuelve <code>null</code>, es un 404.',
      async comprobar(ficheros) {
        const inexistente = await llamar(ficheros, '/api/sombreros/999')
        const problema = problemaDe(inexistente)
        if (problema) return { superado: false, mensaje: problema }

        if (inexistente.estado !== 404) {
          return {
            superado: false,
            mensaje:
              inexistente.estado === 200
                ? 'El sombrero 999 no existe y devuelves 200. Si first() da null, eso es un 404.'
                : `El sombrero 999 devuelve ${inexistente.estado} y debería ser 404.`,
          }
        }

        const invalido = await llamar(ficheros, '/api/sombreros/pepe')
        if (invalido.estado !== 400) {
          return {
            superado: false,
            mensaje:
              invalido.estado === 404
                ? '«pepe» devuelve 404, pero no es que no exista: es que ni siquiera es un id. Eso es un 400.'
                : `«pepe» devuelve ${invalido.estado} y debería ser 400.`,
          }
        }

        const bueno = await llamar(ficheros, '/api/sombreros/1')
        if (bueno.estado !== 200) {
          return { superado: false, mensaje: `Los errores están bien, pero ahora el sombrero 1 devuelve ${bueno.estado}.` }
        }

        return {
          superado: true,
          mensaje: '200, 404 y 400, cada uno donde toca. Quien use tu API sabrá siempre de quién es el problema.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Ese código es literalmente el que se despliega. Cambia «const worker =» por «export default» y funciona en Cloudflare tal cual. ' +
      'No hay una versión de prácticas y otra de verdad: es la misma.',
  },
}
