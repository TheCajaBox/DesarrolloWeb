// Mundo 7 — JavaScript, por fin.
//
// Aqui la pagina deja de ser un papel y empieza a responder. Es el mundo con
// mas riesgo de perder a la gente: se pasa de "escribo cómo se ve" a "escribo
// qué pasa cuando". Por eso el primer paso es un console.log y nada más.
//
// Las comprobaciones EJECUTAN el codigo del alumno contra su propio HTML, con
// motor/ejecutar-js.js. Nada de mirar el texto: si su codigo funciona, pasa;
// si no, no. Los bucles infinitos se cortan solos.
//
// Dialogos originales, en el registro de los personajes.

import { ejecutarPagina, lineasDeConsola, pulsar } from '../../motor/ejecutar-js.js'
import { buscarTodos, leerHtml, textoDel } from '../../motor/leer-html.js'

const H1_SEMBRADO = 'Sombreros'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
    <link rel="stylesheet" href="css/estilos.css">
  </head>
  <body>

    <h1>Sombreros</h1>

    <main class="rejilla">
      <article>
        <h2>El de siempre</h2>
        <p>Marrón, con el ala vencida por el lado izquierdo.</p>
      </article>
    </main>

    <script src="app.js"></script>
  </body>
</html>
`

const CSS_BASE = `* { box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}

article {
  padding: 1rem;
  border: 1px solid #ddd;
}
`

const JS_BASE = `// Este fichero se ejecuta cuando la página termina de cargarse.
// De momento está vacío. Escribe aquí debajo.
`

// Ejecuta la pagina del alumno tal cual la tiene.
const correr = (ficheros) =>
  ejecutarPagina(ficheros?.['index.html'] || '', ficheros?.['app.js'] || '')

// Traduce el error a algo que se pueda leer sin saber inglés.
function explicar(error) {
  if (!error) return null
  if (error.tipo === 'sintaxis') return `Tu código no llega ni a ejecutarse: ${error.message}`
  if (error.tipo === 'bucle') return error.message
  return `Tu código ha reventado: ${error.message}`
}

export default {
  numero: 7,
  acto: 'Que haga cosas',
  titulo: 'Mundo 7 · JavaScript, por fin',

  entradilla: {
    quien: 'wayne',
    texto:
      'Hasta ahora la página era un cartel: bonito, quieto y sin nada que decir. ' +
      'A partir de aquí puede responder cuando la tocas. Que es más de lo que hace mucha gente.',
  },

  ficheros: { 'index.html': HTML_BASE, 'css/estilos.css': CSS_BASE, 'app.js': JS_BASE },

  solucion: {
    'index.html': HTML_BASE.replace(
      '      </article>',
      '        <p class="votos">0 votos</p>\n        <button class="votar">Me gusta</button>\n      </article>',
    ),
    'css/estilos.css': CSS_BASE,
    'app.js': `console.log("La página ya funciona");

const titulo = document.querySelector("h1");
titulo.textContent = "Sombreros que merecen la pena";

let votos = 0;
const boton = document.querySelector(".votar");
const marcador = document.querySelector(".votos");

boton.addEventListener("click", function () {
  votos = votos + 1;
  marcador.textContent = votos + " votos";
});
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'El DOM, los eventos, y qué significa "cuando"',
    cuerpo: `Hasta ahora has escrito **qué** hay en la página (HTML) y **cómo** se ve (CSS). JavaScript responde a una tercera pregunta: **qué pasa cuando**.

**Qué es el DOM.** Cuando el navegador lee tu HTML, no se queda con el texto: construye con él un árbol de objetos en memoria. Ese árbol se llama DOM, y es lo que JavaScript puede tocar.

La distinción importa: **tú no modificas el fichero HTML**. Modificas el árbol que el navegador construyó a partir de él. Por eso los cambios desaparecen al recargar, y por eso el fichero sigue igual aunque en pantalla veas otra cosa.

**Coger un elemento.** Se hace con \`querySelector\`, y lo bueno es que acepta **los mismos selectores del CSS**. Lo que ya sabes te sirve entero:

    document.querySelector("h1")         // el primer h1
    document.querySelector(".votos")     // el primero con class="votos"
    document.querySelectorAll("article") // TODOS los article

Ojo con esa última: \`querySelectorAll\` devuelve una lista, aunque solo encuentre uno. Y si no encuentra nada, \`querySelector\` devuelve \`null\`, que es la causa del error más frecuente del mundo:

    Cannot read properties of null

Eso significa, siempre, lo mismo: buscaste algo, no estaba, y luego intentaste usarlo. O el selector está mal escrito, o el elemento no existe todavía cuando tu código se ejecuta.

**Cambiar lo que hay dentro.** \`textContent\` pone o lee el texto de un elemento. Hay otra propiedad, \`innerHTML\`, que además interpreta etiquetas, y por eso es peligrosa: si le metes ahí algo que ha escrito otra persona, esa persona puede meter un \`<script>\`. Volveremos a esto en el mundo de seguridad. Mientras dudes, \`textContent\`.

**Los eventos, que es lo nuevo de verdad.** El resto de tu código se ejecuta de arriba abajo y termina. Un evento no: es código que dejas preparado para que se ejecute **más tarde**, cuando pase algo.

    boton.addEventListener("click", function () {
      // esto no se ejecuta ahora.
      // se ejecuta cada vez que alguien pulse.
    });

Esa función de dentro no se ejecuta al escribirla. Se guarda. El navegador la llamará cuando toque, puede que nunca, puede que cien veces.

Es el cambio mental grande del mundo: dejas de escribir "haz esto" y empiezas a escribir "cuando pase esto, haz aquello".

**Ejemplo trabajado.** Un contador de votos:

    let votos = 0;
    const boton = document.querySelector(".votar");
    const marcador = document.querySelector(".votos");

    boton.addEventListener("click", function () {
      votos = votos + 1;
      marcador.textContent = votos + " votos";
    });

Fíjate en que \`votos\` está declarada **fuera** de la función. Si estuviera dentro, se crearía de cero en cada pulsación y siempre valdría 1. Ese es el bug clásico de los contadores.

**Un aviso sobre el orden.** Si tu \`<script>\` está en el \`<head>\`, se ejecuta antes de que exista el \`<body>\`, y todos tus \`querySelector\` devolverán \`null\`. Por eso el \`<script>\` va al final del \`<body>\`, como en tu fichero, o con el atributo \`defer\`.`,
  },

  pasos: [
    {
      id: '7-1',
      titulo: 'Que diga algo',
      enunciado:
        'En <code>app.js</code>, escribe <code>console.log("lo que sea")</code>. No cambia nada en pantalla: sale en la consola del navegador (F12, pestaña <em>Console</em>). Es la herramienta que más vas a usar para saber qué está pasando.',
      pista: 'Una sola línea: <code>console.log("hola");</code>',
      comprobar(ficheros) {
        const resultado = correr(ficheros)
        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        const lineas = lineasDeConsola(resultado).filter((linea) => linea.trim())
        if (!lineas.length) {
          return { superado: false, mensaje: 'Tu código se ejecuta sin errores, pero no imprime nada.' }
        }

        return { superado: true, mensaje: `Dice «${lineas[0]}». Ese es tu programa hablando.` }
      },
    },

    {
      id: '7-2',
      titulo: 'Cambia la página desde el código',
      enunciado:
        'Coge el <code>&lt;h1&gt;</code> con <code>document.querySelector("h1")</code> y cámbiale el texto con <code>.textContent</code>. Fíjate en que el HTML no cambia: lo que cambia es lo que el navegador tiene en memoria.',
      pista: '<code>const titulo = document.querySelector("h1");</code> y luego <code>titulo.textContent = "otra cosa";</code>',
      comprobar(ficheros) {
        const resultado = correr(ficheros)
        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        const enFichero = textoDel(leerHtml(ficheros?.['index.html'] || ''), 'h1')
        const trasCorrer = textoDel(resultado.documento, 'h1')

        if (!trasCorrer) {
          return { superado: false, mensaje: 'Después de ejecutar tu código, el <h1> se ha quedado sin texto.' }
        }
        if (trasCorrer === enFichero) {
          if (enFichero !== H1_SEMBRADO) {
            return {
              superado: false,
              mensaje: 'Has cambiado el texto en el HTML, pero el paso pide cambiarlo desde JavaScript.',
            }
          }
          return { superado: false, mensaje: 'El <h1> sigue diciendo lo mismo después de ejecutar tu código.' }
        }

        return {
          superado: true,
          mensaje: `Ahora pone «${trasCorrer}», y el fichero HTML sigue diciendo «${enFichero}». Has cambiado el árbol, no el papel.`,
        }
      },
    },

    {
      id: '7-3',
      titulo: 'Un botón y un marcador',
      enunciado:
        'En el HTML, dentro de <strong>una</strong> de tus fichas, añade dos cosas: <code>&lt;p class="votos"&gt;0 votos&lt;/p&gt;</code> y <code>&lt;button class="votar"&gt;Me gusta&lt;/button&gt;</code>. Todavía no hacen nada: primero que existan.',
      pista: 'Las dos van dentro del mismo <code>&lt;article&gt;</code>. Las clases son las que buscará tu JavaScript, así que tienen que escribirse igual.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros?.['index.html'] || '')

        const marcadores = buscarTodos(doc, '.votos')
        if (!marcadores.length) {
          return {
            superado: false,
            mensaje: 'Falta el párrafo con class="votos". Es donde el contador escribirá el número.',
          }
        }

        const botones = buscarTodos(doc, 'button.votar')
        if (!botones.length) {
          return {
            superado: false,
            mensaje: buscarTodos(doc, 'button').length
              ? 'Hay un <button>, pero le falta class="votar".'
              : 'Todavía no hay ningún <button> con class="votar".',
          }
        }

        if (!botones[0].textContent.trim()) {
          return { superado: false, mensaje: 'El botón no tiene texto: no habría nada escrito dentro.' }
        }

        if (!buscarTodos(doc, 'article button.votar').length) {
          return {
            superado: false,
            mensaje: 'El botón está fuera del <article>. Es parte de la ficha, así que va dentro.',
          }
        }

        return { superado: true, mensaje: 'Ahí están los dos. Se puede pulsar, aunque de momento no pase nada.' }
      },
    },

    {
      id: '7-4',
      titulo: 'Que el botón cuente',
      enunciado:
        'Haz que al pulsar el botón, el párrafo <code>.votos</code> suba de número. Necesitas una variable fuera de la función y un <code>addEventListener("click", …)</code> que la incremente y actualice el texto.',
      pista: 'Si la variable la declaras <em>dentro</em> de la función, se crea de cero en cada pulsación y siempre valdrá 1. Va fuera.',
      comprobar(ficheros) {
        const resultado = correr(ficheros)
        const problema = explicar(resultado.error)
        if (problema) return { superado: false, mensaje: problema }

        const documento = resultado.documento
        if (!documento.querySelector('button.votar')) {
          return { superado: false, mensaje: 'Se ha perdido el botón del paso anterior.' }
        }

        const marcador = documento.querySelector('.votos')
        if (!marcador) {
          return { superado: false, mensaje: 'Se ha perdido el párrafo con class="votos".' }
        }

        const antes = marcador.textContent.trim()

        if (!pulsar(documento, 'button.votar')) {
          return { superado: false, mensaje: 'No he podido pulsar el botón.' }
        }
        const trasUna = documento.querySelector('.votos').textContent.trim()

        if (trasUna === antes) {
          return {
            superado: false,
            mensaje: 'He pulsado el botón y el texto de los votos no ha cambiado. ¿Está puesto el addEventListener?',
          }
        }

        // La prueba de fuego del contador: la segunda pulsación tiene que
        // seguir subiendo. Si la variable está dentro de la función, aquí se
        // queda clavada en el mismo número.
        pulsar(documento, 'button.votar')
        const trasDos = documento.querySelector('.votos').textContent.trim()

        if (trasDos === trasUna) {
          return {
            superado: false,
            mensaje: `Sube una vez y se queda en «${trasUna}». Eso pasa cuando la variable del contador está declarada dentro de la función: se crea de nuevo en cada pulsación.`,
          }
        }

        const numeros = [antes, trasUna, trasDos].map((texto) => Number((texto.match(/-?\d+/) || [NaN])[0]))
        if (numeros.some(Number.isNaN)) {
          return { superado: false, mensaje: 'El texto cambia, pero no consigo leer un número en él.' }
        }
        if (!(numeros[1] > numeros[0] && numeros[2] > numeros[1])) {
          return {
            superado: false,
            mensaje: `El número va ${numeros.join(' → ')} y debería ir subiendo con cada pulsación.`,
          }
        }

        return {
          superado: true,
          mensaje: `Dos pulsaciones: ${numeros.join(' → ')}. Tu página ya responde a lo que hace la gente.`,
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Lo que has escrito en el último paso no se ejecuta cuando lo escribes: se guarda y espera. ' +
      'Ese cambio —de "haz esto" a "cuando pase esto, haz aquello"— es la idea central de toda la programación de interfaces.',
  },
}
