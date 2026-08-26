// Mundo 1 — Esto es un papel.
//
// El primero de todos. Aqui no se da nada por sabido: quien lo abre puede no
// haber escrito una linea de codigo en su vida. Los dos primeros pasos son
// cambiar texto que ya esta escrito. Nada mas.
//
// Si algun dia alguien propone "meter aqui una etiqueta nueva para avanzar mas
// rapido", la respuesta es no. Correr es lo que hace que la gente lo deje.
//
// Doce pasos y seis tipos distintos, terminando en sintesis. Es el patron que
// siguen los demas mundos.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  cambiadoRespectoA,
  comprobarHtml,
  hay,
  sinRepetir,
  textoDeAlMenos,
} from './comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from './tipos-de-paso.js'
import { buscarTodos, leerHtml, textoDe, textoDel } from '../../motor/leer-html.js'

const TITULO_SEMBRADO = 'Cambia esto'
const H1_SEMBRADO = 'Hola'

const SEMILLA = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Cambia esto</title>
  </head>
  <body>

    <h1>Hola</h1>

  </body>
</html>
`

export default {
  numero: 1,
  acto: 'Qué es todo esto',
  titulo: 'Mundo 1 · Esto es un papel',

  entradilla: {
    quien: 'wayne',
    texto:
      'Antes de que te agobies: esto no es magia, es un papel. Un papel con instrucciones sobre cómo quiere que lo miren. ' +
      'Tú escribes el papel, el navegador lo lee y hace lo que pone. Si pones tonterías, hace tonterías, pero sin juzgarte. ' +
      'Es más de fiar que la mayoría de la gente que conozco.',
  },

  ficheros: { 'index.html': SEMILLA },

  // Solución de referencia: solo la usan las pruebas, para verificar que el
  // mundo se puede terminar de verdad.
  solucion: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo de Wayne</title>
  </head>
  <body>

    <h1>Sombreros que merecen la pena</h1>

    <!-- Esto es una nota para mí: aquí irán las fichas. -->

    <p>Esto es una lista de sombreros, ordenada sin ningún criterio.</p>
    <p>Puede que crezca. Puede que no. Ya veremos.</p>

    <h2>Cómo se lee esta lista</h2>
    <p>De arriba abajo, como todo lo demás en esta página.</p>

  </body>
</html>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Qué es realmente una página web',
    cuerpo: `Una página web es un fichero de texto. Eso es todo. Puedes abrirlo con el bloc de notas y leerlo entero.

No hay nada dentro que no puedas ver. No hay una parte oculta ni compilada. El fichero que tú escribes es exactamente el que llega al navegador de otra persona.

**Qué hace el navegador con él.** Lo lee de arriba abajo, una vez, y va construyendo lo que ves. Cuando encuentra \`<h1>Hola</h1>\`, entiende: "aquí hay un título principal, y dice Hola". Entonces lo dibuja grande y en negrita, porque eso es lo que hace por defecto con los títulos principales.

Fíjate en el orden: **primero entiende, después dibuja**. Esa distinción parece una tontería y no lo es. Es la que explica por qué en el fichero se escribe qué es cada cosa y no cómo se ve. El cómo llega después.

**Las partes de un documento.** Todo fichero HTML tiene la misma forma:

    <!doctype html>          esto es HTML moderno
    <html lang="es">         empieza el documento, y está en español
      <head>                 información PARA el navegador
        <meta charset="utf-8">   cómo leer las letras raras: ñ, á, ü
        <title>...</title>       lo que sale en la pestaña
      </head>
      <body>                 lo que SE VE
        ...
      </body>
    </html>

La división entre \`<head>\` y \`<body>\` es la que más confunde al principio, y se resume así: en el \`head\` va lo que el navegador necesita saber; en el \`body\`, lo que la persona va a leer.

Ese \`lang="es"\` no es decorativo. Le dice al navegador en qué idioma está el texto, y de eso dependen cosas reales: cómo lo pronuncia un lector de pantalla, si el corrector ortográfico sabe qué diccionario usar, y si un buscador entiende a quién le interesa tu página.

**Cómo llega hasta ti.** Cuando escribes una dirección, tu navegador le pide ese fichero a un ordenador que está en otro sitio y que se pasa el día encendido esperando que alguien pregunte. Ese ordenador se llama servidor, y no es nada especial: es un ordenador cuyo único trabajo es contestar.

La dirección tiene partes, y cada una dice algo:

    https://ejemplo.com/catalogo/sombreros.html
    -----   -----------  ------------------
    cómo    a quién      qué se le pide

El \`https\` es cómo se habla con él, y la ese del final significa que la conversación va cifrada. \`ejemplo.com\` es a quién se le pregunta. Y lo de después es qué fichero se quiere.

**Tres cosas que sorprenden al principio:**

1. **Los espacios de más no se ven.** Si escribes diez espacios seguidos, el navegador pinta uno. Si pulsas Enter tres veces, no aparecen tres líneas en blanco. Para el navegador, cualquier cantidad de espacios y saltos seguidos es un solo espacio. Se hace así a propósito: permite escribir el fichero ordenado y con sangrías sin que eso cambie lo que se ve.
2. **Lo que escribes en el fichero no siempre se ve.** El \`<title>\` no aparece dentro de la página. Hay cosas que se escriben para el navegador, no para quien lee.
3. **El orden manda.** Lo que va antes en el fichero, se pinta antes. No hay más misterio.

**Los comentarios.** Se escriben así:

    <!-- esto no se ve en la página -->

Sirven para dejarte notas a ti mismo. Y una advertencia que hay que dar el primer día: **no se ven, pero cualquiera puede leerlos.** Están en el fichero que llega al navegador de todo el mundo. No es sitio para contraseñas ni para lo que pienses de tu jefe.

**Lo que casi todo el mundo entiende mal al empezar:** que hace falta un programa especial para hacer páginas web. No hace falta. Hace falta un sitio donde escribir texto. Todo lo demás son comodidades.`,
  },

  pasos: [
    // ---- Tocar lo que ya está ----
    {
      id: '1-1',
      titulo: 'Ponle nombre a la ventana',
      enunciado:
        'Mira el panel de la derecha: encima de tu página hay una etiqueta que ahora dice <strong>Cambia esto</strong>. Eso es el <code>&lt;title&gt;</code>, y es lo que el navegador escribe en su pestaña. Búscalo en el fichero y pon lo que quieras.',
      pista:
        'Está en la línea 5 del fichero. Cambia solo el texto de en medio, entre <code>&lt;title&gt;</code> y <code>&lt;/title&gt;</code>, sin tocar las etiquetas.',
      comprobar: comprobarHtml({
        requisitos: [
          cambiadoRespectoA('title', TITULO_SEMBRADO, {
            falta: 'El título se ha quedado vacío. Escribe algo entre las dos etiquetas.',
            igual: 'Sigue poniendo «Cambia esto». Pon lo que tú quieras.',
          }),
        ],
        exito: (doc) =>
          `La etiqueta de la derecha ya pone «${textoDel(doc, 'title')}». Acabas de cambiar tu primera cosa de una página web.`,
      }),
    },

    {
      id: '1-2',
      titulo: 'Cambia lo que se ve',
      enunciado:
        'Eso de antes cambió la etiqueta de arriba, pero no lo que hay dentro de la página. Ahora cambia el texto grande, el que se ve: está dentro de <code>&lt;h1&gt;</code> y ahora mismo dice <strong>Hola</strong>.',
      pista: 'Igual que antes: solo el texto de en medio. <code>&lt;h1&gt;</code> significa "título principal".',
      comprobar: comprobarHtml({
        requisitos: [
          cambiadoRespectoA('h1', H1_SEMBRADO, {
            falta: 'El <h1> se ha quedado sin texto, o ya no está.',
            igual: 'Sigue diciendo «Hola». Escribe otra cosa.',
          }),
        ],
        exito:
          'Y esto sí se ve dentro de la página. Esa es la diferencia entre el título de la ventana y el del documento.',
      }),
    },

    // ---- Entender lo que acaba de pasar ----
    eleccion({
      id: '1-3',
      titulo: 'Dos títulos distintos',
      enunciado:
        'Acabas de cambiar dos cosas que las dos se llaman «título». ¿Por qué una sale en la pestaña y la otra dentro de la página?',
      pista: 'Fíjate en qué parte del fichero está cada una.',
      opciones: [
        {
          texto: 'Porque el <title> está en el <head>, que es información para el navegador, y el <h1> está en el <body>, que es lo que se ve.',
          correcta: true,
          porque:
            'Eso es. Y es la división más útil de todo el fichero: en el head va lo que el navegador necesita saber; en el body, lo que la persona va a leer.',
        },
        {
          texto: 'Porque <title> es más importante y el navegador lo pone en un sitio destacado.',
          porque:
            'No hay jerarquía de importancia. Lo que decide dónde acaba cada cosa es en qué parte del documento la escribes: head o body.',
        },
        {
          texto: 'Porque el <h1> lleva número y el <title> no.',
          porque:
            'El número del h1 indica nivel de encabezado (h1, h2, h3…), no dónde se pinta. Un h1 dentro del head no funcionaría.',
        },
        {
          texto: 'Porque el navegador siempre pinta la primera etiqueta en la pestaña.',
          porque:
            'La primera etiqueta del fichero es <html>, y no sale en ninguna pestaña. Lo que manda es el head.',
        },
      ],
    }),

    // ---- Escribir algo nuevo ----
    {
      id: '1-4',
      titulo: 'Escribe un párrafo',
      enunciado:
        'Debajo del <code>&lt;h1&gt;</code>, escribe un párrafo. Se hace con <code>&lt;p&gt;</code>: abres <code>&lt;p&gt;</code>, escribes, y cierras con <code>&lt;/p&gt;</code>. Cuenta lo que quieras, pero que tenga al menos diez caracteres.',
      pista:
        'Entero, sería así: <code>&lt;p&gt;Aquí va lo que sea.&lt;/p&gt;</code>. La barra del cierre es lo que lo distingue de la apertura.',
      comprobar: comprobarHtml({
        requisitos: [
          hay('p', { conTexto: true, falta: 'Todavía no hay ningún <p> con texto dentro.' }),
          textoDeAlMenos('p', 10, {
            corto: (n, m) => `El párrafo tiene ${n} caracteres y hacen falta ${m}. Cuenta algo más.`,
          }),
        ],
        exito: 'Un título y un párrafo. Eso ya es una página, por corta que sea.',
      }),
    },

    completar({
      id: '1-5',
      titulo: 'La etiqueta que falta',
      enunciado:
        'A este fragmento le faltan las etiquetas. Rellena los huecos con el <strong>nombre de la etiqueta</strong>, sin los ángulos.',
      pista:
        'El primero es un título principal y el segundo un párrafo. Los nombres son los que has usado en los pasos anteriores.',
      plantilla: `<___>Sombreros</___>
<___>Marrón, con el ala vencida.</___>`,
      huecos: [
        { respuestas: ['h1'], porque: 'Un título principal es un h1.' },
        { respuestas: ['h1'], porque: 'El cierre lleva el mismo nombre que la apertura, con barra.' },
        { respuestas: ['p'], porque: 'Un párrafo de texto es un p.' },
        {
          respuestas: ['p'],
          porque:
            'Cada etiqueta se cierra con su mismo nombre. Ese emparejamiento es lo que le dice al navegador dónde acaba cada cosa.',
        },
      ],
    }),

    {
      id: '1-6',
      titulo: 'Y ahora otro',
      enunciado:
        'Escribe un segundo <code>&lt;p&gt;</code> debajo del primero. Fíjate en la vista previa: no se ponen uno al lado del otro, se apilan. Los párrafos ocupan toda la línea aunque el texto sea corto.',
      pista: 'Es copiar el que ya tienes y cambiarle el texto. Copiar y pegar es una técnica legítima.',
      comprobar: comprobarHtml({
        requisitos: [
          hay('p', {
            minimo: 2,
            conTexto: true,
            pocos: (n) => `Llevas ${n} párrafo${n === 1 ? '' : 's'} con texto. Hacen falta 2.`,
          }),
          sinRepetir('p', {
            mensaje: 'Los dos dicen exactamente lo mismo. Cámbiale el texto a uno.',
          }),
          hay('h1', { conTexto: true, falta: 'Se ha perdido el <h1> por el camino.' }),
        ],
        exito:
          'Uno debajo del otro, sin que tú hayas dicho nada. El navegador ya sabe cómo van los párrafos.',
      }),
    },

    // ---- Los espacios ----
    eleccion({
      id: '1-7',
      titulo: 'Diez espacios seguidos',
      enunciado: 'Si escribes esto en el fichero, ¿qué se ve en la página?',
      codigo: '<p>Hola          Wayne</p>',
      pista: 'Pruébalo de verdad en tu fichero y mira la vista previa antes de contestar.',
      opciones: [
        {
          texto: 'Hola Wayne, con un solo espacio.',
          correcta: true,
          porque:
            'Para el navegador, cualquier cantidad de espacios y saltos de línea seguidos es un solo espacio. Se hace a propósito: así puedes escribir el fichero ordenado y con sangrías sin que eso cambie lo que se ve.',
        },
        {
          texto: 'Hola          Wayne, con los diez espacios.',
          porque:
            'Sería lo intuitivo, pero no. Pruébalo: el navegador los junta en uno. Si algún día necesitas espacios de verdad, existe el CSS para eso.',
        },
        {
          texto: 'HolaWayne, sin espacios.',
          porque: 'Los junta en uno, no los elimina. Sigue habiendo separación entre las dos palabras.',
        },
        {
          texto: 'Da un error y no se pinta el párrafo.',
          porque:
            'El HTML casi nunca da errores: intenta entender lo que le pongas y pinta algo. Eso es cómodo y a la vez peligroso, porque los fallos no se notan.',
        },
      ],
    }),

    // ---- Estructura del documento ----
    ordenar({
      id: '1-8',
      titulo: 'Las partes de un documento',
      enunciado:
        'Estas son las líneas con las que empieza cualquier página web, desordenadas. Ponlas en el orden correcto.',
      pista: 'Mira tu propio fichero: las tienes todas ahí arriba.',
      lineas: ['<!doctype html>', '<html lang="es">', '<head>', '<title>El catálogo</title>', '</head>', '<body>'],
      porque:
        'Ese es el orden de cualquier página: primero se declara que es HTML, luego abre el documento, luego la información para el navegador, y al final lo que se ve.',
    }),

    emparejar({
      id: '1-9',
      titulo: 'Qué hace cada parte',
      enunciado: 'Une cada trozo con lo que realmente hace.',
      pista: 'Dos de ellos no se ven nunca en la página. Piensa cuáles.',
      pares: [
        { izquierda: '<!doctype html>', derecha: 'avisa de que esto es HTML moderno' },
        { izquierda: '<head>', derecha: 'información para el navegador, no se ve' },
        { izquierda: '<body>', derecha: 'todo lo que la persona va a leer' },
        {
          izquierda: 'lang="es"',
          derecha: 'en qué idioma está el texto',
          porque:
            'El idioma no es decoración: de él dependen cómo lo pronuncia un lector de pantalla y qué diccionario usa el corrector.',
        },
        { izquierda: '<meta charset="utf-8">', derecha: 'cómo leer las letras con tilde y la ñ' },
      ],
      porque:
        'Fíjate en que tres de las cinco no pintan nada. Buena parte de un fichero HTML es información para el navegador, no contenido.',
    }),

    // ---- Comentarios ----
    {
      id: '1-10',
      titulo: 'Una nota que no se ve',
      enunciado:
        'Escribe un comentario en el <code>&lt;body&gt;</code>: <code>&lt;!-- lo que quieras --&gt;</code>. Míralo en la vista previa: no aparece. Sirve para dejarte notas a ti mismo.',
      pista: 'Empieza con <code>&lt;!--</code> y termina con <code>--&gt;</code>. Lo de dentro puede ser cualquier cosa.',
      comprobar(ficheros) {
        const fuente = String(ficheros?.['index.html'] || '')
        const doc = leerHtml(fuente)

        // El comentario sembrado no cuenta: hay que escribir uno propio.
        const comentarios = fuente.match(/<!--([\s\S]*?)-->/g) || []
        const propios = comentarios.filter((c) => c.replace(/<!--|-->/g, '').trim().length >= 5)

        if (!propios.length) {
          return {
            superado: false,
            mensaje: comentarios.length
              ? 'Hay un comentario, pero está casi vacío. Escribe algo dentro.'
              : 'Todavía no hay ningún comentario en el fichero.',
          }
        }

        if (!textoDe(buscarTodos(doc, 'h1')[0])) {
          return { superado: false, mensaje: 'Se ha perdido el <h1>.' }
        }

        return {
          superado: true,
          mensaje:
            'No se ve, pero está en el fichero. Y ojo: cualquiera puede leerlo, porque el fichero llega entero a su navegador.',
        }
      },
    },

    // ---- Repaso ----
    verdaderoFalso({
      id: '1-11',
      titulo: 'Repaso: cierto o falso',
      enunciado: 'Cinco afirmaciones sobre lo que has visto. Marca cada una.',
      pista: 'Si dudas de alguna, vuelve a la lección de Wax: está todo ahí.',
      afirmaciones: [
        {
          texto: 'Una página web es un fichero de texto que puedes abrir con el bloc de notas.',
          cierto: true,
          porque:
            'Es cierto, y es lo primero que hay que interiorizar: no hay nada compilado ni oculto.',
        },
        {
          texto: 'Lo que escribes dentro de <head> se ve en la página.',
          cierto: false,
          porque:
            'No: el head es información para el navegador. Lo que se ve va en el body.',
        },
        {
          texto: 'Si pulsas Enter tres veces en el fichero, aparecen tres líneas en blanco.',
          cierto: false,
          porque:
            'No: cualquier cantidad de espacios y saltos seguidos cuenta como un solo espacio.',
        },
        {
          texto: 'Un comentario HTML no se ve en la página, pero cualquiera puede leerlo.',
          cierto: true,
          porque:
            'Las dos cosas son ciertas a la vez, y por eso no es sitio para nada privado.',
        },
        {
          texto: 'Hace falta un programa especial para escribir páginas web.',
          cierto: false,
          porque:
            'No hace falta: basta un sitio donde escribir texto. Todo lo demás son comodidades.',
        },
      ],
    }),

    // ---- Síntesis ----
    {
      id: '1-12',
      titulo: 'Súbelo todo junto',
      sintesis: true,
      enunciado:
        'Sin pistas esta vez. Deja tu <code>index.html</code> con <strong>todo</strong> a la vez: un <code>&lt;title&gt;</code> tuyo, un <code>&lt;h1&gt;</code>, al menos <strong>dos párrafos</strong> distintos, un <code>&lt;h2&gt;</code> con un subtítulo, y un comentario. Es la primera vez que tienes que juntar lo aprendido en vez de hacer una cosa cada vez.',
      comprobar(ficheros) {
        const fuente = String(ficheros?.['index.html'] || '')
        const doc = leerHtml(fuente)

        const faltan = []

        if (!textoDel(doc, 'title') || textoDel(doc, 'title') === TITULO_SEMBRADO) {
          faltan.push('un <title> tuyo')
        }
        if (!textoDel(doc, 'h1') || textoDel(doc, 'h1') === H1_SEMBRADO) {
          faltan.push('un <h1> tuyo')
        }

        const parrafos = buscarTodos(doc, 'p').filter((p) => textoDe(p).length >= 10)
        if (parrafos.length < 2) faltan.push(`dos párrafos (llevas ${parrafos.length})`)

        const distintos = new Set(parrafos.map((p) => textoDe(p).toLowerCase()))
        if (parrafos.length >= 2 && distintos.size < 2) faltan.push('que los párrafos digan cosas distintas')

        if (!textoDel(doc, 'h2')) faltan.push('un <h2> con texto')

        const comentarios = (fuente.match(/<!--([\s\S]*?)-->/g) || []).filter(
          (c) => c.replace(/<!--|-->/g, '').trim().length >= 5,
        )
        if (!comentarios.length) faltan.push('un comentario')

        if (faltan.length) {
          return {
            superado: false,
            mensaje: `Falta ${faltan.length === 1 ? '' : 'todavía: '}${faltan.join(', ')}.`,
          }
        }

        return {
          superado: true,
          mensaje:
            'Ahí está: una página entera escrita por ti, con su estructura completa. Ya sabes lo suficiente para leer el HTML de cualquier sitio y entender qué está pasando.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Repasa lo que has hecho: escribir texto en un fichero. Ya está. No has instalado nada, no has configurado nada, ' +
      'y hay una página ahí que antes no existía. Toda la web funciona así por debajo, hasta la más complicada. ' +
      'Lo demás son capas encima, y ya iremos.',
  },
}
