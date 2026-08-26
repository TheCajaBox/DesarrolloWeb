// Mundo 8 — Los datos tienen forma.
//
// Del "copiar y pegar la ficha tres veces" a "una lista de datos y un bucle
// que la pinta". Es el salto que hace que anadir un sombrero sea una linea en
// vez de quince, y el que prepara todo el lado del servidor.
//
// El ultimo paso usa fetch de verdad: se le inyecta un fetch que sirve los
// ficheros del propio alumno, asi que escribe exactamente el mismo codigo que
// escribiria en produccion.
//
// Dialogos originales, en el registro de los personajes.

import {
  crearFetchFalso,
  dejarQueTermine,
  ejecutarPagina,
  lineasDeConsola,
} from '../../motor/ejecutar-js.js'
import { buscarTodos, textoDe } from '../../motor/leer-html.js'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
    <link rel="stylesheet" href="css/estilos.css">
  </head>
  <body>

    <h1>Sombreros</h1>

    <main class="rejilla"></main>

    <script src="app.js"></script>
  </body>
</html>
`

const CSS_BASE = `* { box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  max-width: 55rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}

.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

article {
  padding: 1rem;
  border: 1px solid #ddd;
}
`

const JS_BASE = `// El <main class="rejilla"> está vacío a propósito.
// A partir de ahora, las fichas las pinta el código.
`

const JSON_SOLUCION = `[
  { "nombre": "El de siempre", "descripcion": "Marrón, con el ala vencida." },
  { "nombre": "Hongo de contable", "descripcion": "Duro, redondo y respetable." },
  { "nombre": "El de las bodas", "descripcion": "Gris perla, impecable." }
]
`

const explicar = (error) => {
  if (!error) return null
  if (error.tipo === 'sintaxis') return `Tu código no llega ni a ejecutarse: ${error.message}`
  if (error.tipo === 'bucle') return error.message
  return `Tu código ha reventado: ${error.message}`
}

export default {
  numero: 8,
  acto: 'Que haga cosas',
  titulo: 'Mundo 8 · Los datos tienen forma',

  entradilla: {
    quien: 'wayne',
    texto:
      'Hasta ahora, añadir un sombrero era copiar quince líneas y cambiarles el texto. Con tres da igual. ' +
      'Con cuarenta te da algo. Y yo tengo más de cuarenta, aunque a efectos legales tenga tres.',
  },

  ficheros: { 'index.html': HTML_BASE, 'css/estilos.css': CSS_BASE, 'app.js': JS_BASE },

  solucion: {
    'index.html': HTML_BASE,
    'css/estilos.css': CSS_BASE,
    'sombreros.json': JSON_SOLUCION,
    'app.js': `const sombreros = [
  { nombre: "El de siempre", descripcion: "Marrón, con el ala vencida." },
  { nombre: "Hongo de contable", descripcion: "Duro, redondo y respetable." },
  { nombre: "El de las bodas", descripcion: "Gris perla, impecable." }
];

function pintar(lista) {
  const rejilla = document.querySelector(".rejilla");
  rejilla.textContent = "";

  for (const sombrero of lista) {
    const ficha = document.createElement("article");

    const titulo = document.createElement("h2");
    titulo.textContent = sombrero.nombre;

    const texto = document.createElement("p");
    texto.textContent = sombrero.descripcion;

    ficha.appendChild(titulo);
    ficha.appendChild(texto);
    rejilla.appendChild(ficha);
  }
}

pintar(sombreros);

fetch("sombreros.json")
  .then(function (respuesta) {
    return respuesta.json();
  })
  .then(function (datos) {
    pintar(datos);
  });
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Listas, objetos, JSON, y por qué esperar',
    cuerpo: `Tienes tres fichas escritas a mano en el HTML. Añadir la cuarta es copiar quince líneas. Cambiar cómo se ven todas es tocarlas una por una. Con tres se aguanta; con cuarenta, no.

La solución es separar **los datos** de **cómo se pintan**. Escribes la lista una vez, escribes el molde una vez, y el código los junta tantas veces como haga falta.

**Un objeto** agrupa datos que van juntos, con un nombre para cada uno:

    const sombrero = {
      nombre: "El de siempre",
      descripcion: "Marrón, con el ala vencida."
    };

Se lee con \`sombrero.nombre\`. Nada más.

**Un array** es una lista ordenada. Puede contener objetos:

    const sombreros = [
      { nombre: "El de siempre", descripcion: "..." },
      { nombre: "Hongo de contable", descripcion: "..." }
    ];

\`sombreros.length\` dice cuántos hay, y \`for (const s of sombreros)\` recorre uno a uno.

**Pintar desde datos.** El patrón es siempre el mismo: vaciar el contenedor, recorrer la lista, y por cada elemento crear los nodos y colgarlos.

    const rejilla = document.querySelector(".rejilla");
    rejilla.textContent = "";

    for (const s of sombreros) {
      const ficha = document.createElement("article");
      const titulo = document.createElement("h2");
      titulo.textContent = s.nombre;
      ficha.appendChild(titulo);
      rejilla.appendChild(ficha);
    }

Lo importante: **vaciar antes**. Si no, cada vez que pintes se añadirán encima de lo anterior y acabarás con la lista repetida.

**JSON.** Los datos siguen dentro de tu JavaScript, y eso es un problema en cuanto quieras que vengan de otro sitio. JSON es un formato de texto para representar exactamente estas mismas estructuras, pero **independiente del lenguaje**: lo escribe un servidor en cualquier lenguaje y lo lee tu navegador sin traducirlo.

Se parece muchísimo a la sintaxis de objetos de JavaScript, con tres diferencias que causan casi todos los errores:

1. Las claves van **siempre** entre comillas dobles: \`"nombre"\`, no \`nombre\`.
2. Solo comillas dobles. Las simples no valen.
3. No se admite coma después del último elemento.

**\`fetch\`, y por qué hay que esperar.** Pedir un fichero lleva tiempo: hay que ir a buscarlo. Si el navegador se quedara parado esperando, la página se congelaría. Así que \`fetch\` no devuelve los datos: devuelve una **promesa**, que es un resguardo de "esto llegará".

    fetch("sombreros.json")
      .then(function (respuesta) {
        return respuesta.json();
      })
      .then(function (datos) {
        pintar(datos);
      });

Fíjate en que hay **dos** pasos. El primero espera a que llegue la respuesta; el segundo espera a que se termine de leer y convertir el texto en datos. Las dos cosas llevan su tiempo, así que las dos son promesas.

**El error que va a cometer todo el mundo una vez:**

    const datos = fetch("sombreros.json");
    console.log(datos.length);   // undefined

Ahí \`datos\` no es la lista: es la promesa. Los datos todavía no han llegado. Todo lo que dependa de ellos tiene que ir **dentro** del \`.then\`, no después.

**Y el orden de las cosas.** El código de después del \`fetch\` se ejecuta **antes** que el de dentro del \`.then\`. No es un error: es que el navegador sigue trabajando mientras espera. Cuando algo aparezca "en el orden equivocado" en la consola, casi siempre es esto.`,
  },

  pasos: [
    {
      id: '8-1',
      titulo: 'Los datos, en una lista',
      enunciado:
        'En <code>app.js</code>, crea <code>const sombreros = [ … ]</code> con al menos tres objetos, cada uno con <code>nombre</code> y <code>descripcion</code>. Todavía no pintan nada: primero los datos.',
      pista: 'Cada objeto va entre llaves y se separan por comas: <code>{ nombre: "X", descripcion: "Y" }</code>',
      comprobar(ficheros) {
        const resultado = ejecutarPagina(ficheros?.['index.html'] || '', ficheros?.['app.js'] || '', {
          capturar: 'sombreros',
          extras: { fetch: crearFetchFalso(ficheros) },
        })

        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        const lista = resultado.capturado
        if (lista === undefined) {
          return { superado: false, mensaje: 'No encuentro ninguna variable que se llame «sombreros».' }
        }
        if (!Array.isArray(lista)) {
          return { superado: false, mensaje: `«sombreros» existe, pero es ${typeof lista} y tiene que ser un array.` }
        }
        if (lista.length < 3) {
          return { superado: false, mensaje: `El array tiene ${lista.length} elemento(s) y hacen falta 3.` }
        }

        const incompleto = lista.findIndex(
          (item) => !item || typeof item !== 'object' || !item.nombre || !item.descripcion,
        )
        if (incompleto !== -1) {
          return {
            superado: false,
            mensaje: `Al elemento ${incompleto + 1} le falta «nombre» o «descripcion». Cuidado con las tildes: la propiedad va sin ella.`,
          }
        }

        return { superado: true, mensaje: `${lista.length} sombreros, en datos. Ahora ya se pueden pintar solos.` }
      },
    },

    {
      id: '8-2',
      titulo: 'Píntalos con un bucle',
      enunciado:
        'Recorre el array y, por cada sombrero, crea un <code>&lt;article&gt;</code> con su <code>&lt;h2&gt;</code> y su <code>&lt;p&gt;</code>, y cuélgalo del <code>.rejilla</code>. Usa <code>document.createElement</code> y <code>appendChild</code>.',
      pista: 'Vacía la rejilla antes del bucle con <code>rejilla.textContent = ""</code>, o al repintar se irán acumulando.',
      comprobar(ficheros) {
        const resultado = ejecutarPagina(ficheros?.['index.html'] || '', ficheros?.['app.js'] || '', {
          capturar: 'sombreros',
          extras: { fetch: crearFetchFalso(ficheros) },
        })

        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        const lista = resultado.capturado
        if (!Array.isArray(lista)) {
          return { superado: false, mensaje: 'Se ha perdido el array «sombreros» del paso anterior.' }
        }

        const fichas = buscarTodos(resultado.documento, '.rejilla article')
        if (!fichas.length) {
          if (buscarTodos(resultado.documento, 'article').length) {
            return { superado: false, mensaje: 'Creas los <article>, pero no acaban dentro del .rejilla.' }
          }
          return { superado: false, mensaje: 'Después de ejecutar tu código, la rejilla sigue vacía.' }
        }

        if (fichas.length !== lista.length) {
          return {
            superado: false,
            mensaje: `Hay ${lista.length} sombreros en los datos y ${fichas.length} fichas pintadas. ${
              fichas.length > lista.length
                ? 'Se están acumulando: vacía la rejilla antes del bucle.'
                : 'El bucle no llega hasta el final.'
            }`,
          }
        }

        for (const [indice, sombrero] of lista.entries()) {
          const ficha = fichas[indice]
          const titulo = textoDe(ficha.querySelector('h2'))
          const texto = textoDe(ficha.querySelector('p'))

          if (!titulo) return { superado: false, mensaje: `La ficha ${indice + 1} no tiene un <h2> con texto.` }
          if (!texto) return { superado: false, mensaje: `La ficha ${indice + 1} no tiene un <p> con texto.` }
          if (titulo !== String(sombrero.nombre).replace(/\s+/g, ' ').trim()) {
            return {
              superado: false,
              mensaje: `La ficha ${indice + 1} pone «${titulo}» y en los datos es «${sombrero.nombre}». ¿Estás escribiendo el texto a mano en vez de sacarlo del objeto?`,
            }
          }
        }

        return {
          superado: true,
          mensaje: 'Ahora añadir un sombrero es añadir una línea al array. Eso es lo que se ha ganado.',
        }
      },
    },

    {
      id: '8-3',
      titulo: 'Sácalos a un fichero JSON',
      enunciado:
        'Crea <code>sombreros.json</code> con la misma lista, pero en JSON: claves entre <strong>comillas dobles</strong> y sin coma final. Luego, en <code>app.js</code>, cárgalo con <code>fetch("sombreros.json")</code> y pinta lo que llegue.',
      pista: 'Son dos <code>.then</code>: el primero hace <code>respuesta.json()</code>, el segundo recibe los datos ya convertidos.',
      async comprobar(ficheros) {
        const fuente = ficheros?.['sombreros.json']
        if (fuente === undefined) {
          return { superado: false, mensaje: 'No existe ningún fichero llamado sombreros.json.' }
        }

        let datos
        try {
          datos = JSON.parse(String(fuente))
        } catch (error) {
          return {
            superado: false,
            mensaje: `El JSON está mal escrito: ${error.message}. Recuerda que las claves van entre comillas dobles y que no puede haber coma después del último elemento.`,
          }
        }

        if (!Array.isArray(datos) || datos.length < 3) {
          return { superado: false, mensaje: 'El JSON tiene que ser un array con al menos tres sombreros.' }
        }
        const flojo = datos.findIndex((item) => !item?.nombre || !item?.descripcion)
        if (flojo !== -1) {
          return { superado: false, mensaje: `Al elemento ${flojo + 1} del JSON le falta «nombre» o «descripcion».` }
        }

        // Se le da un fetch que sirve sus propios ficheros: su código es el
        // mismo que escribiría en producción.
        const resultado = ejecutarPagina(ficheros?.['index.html'] || '', ficheros?.['app.js'] || '', {
          extras: { fetch: crearFetchFalso(ficheros) },
        })

        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        if (!/fetch\s*\(/.test(String(ficheros?.['app.js'] || ''))) {
          return { superado: false, mensaje: 'El JSON está bien, pero app.js no lo carga con fetch.' }
        }

        // El fetch termina después, así que hay que dejar correr las promesas.
        await dejarQueTermine()

        const fichas = buscarTodos(resultado.documento, '.rejilla article')
        if (fichas.length !== datos.length) {
          return {
            superado: false,
            mensaje: `El JSON tiene ${datos.length} sombreros y en pantalla hay ${fichas.length} fichas. ¿Estás pintando dentro del .then?`,
          }
        }

        const nombresEnJson = datos.map((item) => String(item.nombre).trim())
        const nombresPintados = fichas.map((ficha) => textoDe(ficha.querySelector('h2')))

        if (nombresEnJson.some((nombre, i) => nombre !== nombresPintados[i])) {
          return {
            superado: false,
            mensaje: 'Lo pintado no coincide con lo que hay en el JSON. Puede que estés pintando el array de antes en vez de los datos recibidos.',
          }
        }

        const avisos = lineasDeConsola(resultado).filter((linea) => /\[object Promise\]|undefined/.test(linea))
        if (avisos.length) {
          return {
            superado: false,
            mensaje: 'Algo imprime undefined o una promesa: los datos se usan dentro del .then, no en la línea de después.',
          }
        }

        return {
          superado: true,
          mensaje: 'Los datos ya viven fuera del código. Cambiar el catálogo es editar un fichero, sin tocar nada más.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Lo que acabas de montar es exactamente la forma de todo lo que viene después. En el mundo del servidor, ese fichero JSON ' +
      'lo generará una base de datos en lugar de estar escrito a mano. Tu código del navegador no se enterará: pide y pinta, igual que ahora.',
  },
}
