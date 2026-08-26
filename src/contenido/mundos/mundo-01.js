// Mundo 1 — Esto es un papel.
//
// El primero de todos. Aqui no se da nada por sabido: la persona que lo abre
// puede no haber escrito una linea de codigo en su vida. Los dos primeros
// pasos son cambiar texto que ya esta escrito. Nada mas.
//
// Si algun dia alguien propone "meter aqui una etiqueta nueva para que avance
// mas rapido", la respuesta es no. Correr es lo que hace que la gente lo deje.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { buscarTodos, leerHtml, textoDel, tieneTexto } from '../../motor/leer-html.js'

const TITULO_SEMBRADO = 'Cambia esto'
const H1_SEMBRADO = 'Hola'

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

  ficheros: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Cambia esto</title>
  </head>
  <body>

    <h1>Hola</h1>

  </body>
</html>
`,
  },

  // Una solución que supera todos los pasos. No se le enseña a nadie: existe
  // para que las pruebas verifiquen que el mundo se puede terminar. Un mundo
  // imposible por una comprobación mal escrita es el peor fallo posible aquí,
  // porque la persona da por hecho que la que no sabe es ella.
  solucion: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo de Wayne</title>
  </head>
  <body>

    <h1>Sombreros que merecen la pena</h1>

    <p>Esto es una lista de sombreros, ordenada sin ningún criterio.</p>
    <p>Puede que crezca. Puede que no. Ya veremos.</p>

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

**Cómo llega hasta ti.** Cuando escribes una dirección, tu navegador le pide ese fichero a un ordenador que está en otro sitio y que se pasa el día encendido esperando que alguien pregunte. Ese ordenador se llama servidor, y no es nada especial: es un ordenador cuyo único trabajo es contestar.

La dirección tiene partes, y cada una dice algo:

    https://ejemplo.com/catalogo/sombreros.html
    -----   -----------  ------------------
    cómo    a quién      qué se le pide

El \`https\` es cómo se habla con él, y la ese del final significa que la conversación va cifrada. \`ejemplo.com\` es a quién se le pregunta. Y lo de después es qué fichero se quiere.

**Tres cosas que sorprenden al principio:**

1. **Los espacios de más no se ven.** Si escribes diez espacios seguidos, el navegador pinta uno. Si pulsas Enter tres veces, no aparecen tres líneas en blanco. Para el navegador, cualquier cantidad de espacios y saltos seguidos es un solo espacio. Se hace así a propósito: permite escribir el fichero ordenado y con sangrías sin que eso cambie lo que se ve.
2. **Lo que escribes en el fichero no siempre se ve.** El \`<title>\` no aparece dentro de la página: sale en la pestaña del navegador. Hay cosas que se escriben para el navegador, no para quien lee.
3. **El orden manda.** Lo que va antes en el fichero, se pinta antes. No hay más misterio.

**Lo que casi todo el mundo entiende mal al empezar:** que hace falta un programa especial para hacer páginas web. No hace falta. Hace falta un sitio donde escribir texto. Todo lo demás son comodidades.`,
  },

  pasos: [
    {
      id: '1-1',
      titulo: 'Ponle nombre a la ventana',
      enunciado:
        'Arriba del todo, en la pestaña del navegador de la vista previa, pone <strong>Cambia esto</strong>. Búscalo en el fichero, dentro de <code>&lt;title&gt;</code>, y escribe lo que quieras.',
      pista: 'Está en la línea 5. Cambia solo el texto que hay entre <code>&lt;title&gt;</code> y <code>&lt;/title&gt;</code>, sin tocar las etiquetas.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')
        const titulo = textoDel(doc, 'title')

        if (!titulo) {
          return {
            superado: false,
            mensaje: 'El título se ha quedado vacío. Escribe algo entre las dos etiquetas.',
          }
        }
        if (titulo === TITULO_SEMBRADO) {
          return { superado: false, mensaje: 'Sigue poniendo «Cambia esto». Pon lo que tú quieras.' }
        }

        return {
          superado: true,
          mensaje: `Ya pone «${titulo}» ahí arriba. Acabas de cambiar tu primera cosa de una página web.`,
        }
      },
    },

    {
      id: '1-2',
      titulo: 'Cambia lo que se ve',
      enunciado:
        'Eso de antes salía en la pestaña, pero no dentro de la página. Ahora cambia el texto grande: el que está dentro de <code>&lt;h1&gt;</code> y ahora mismo dice <strong>Hola</strong>.',
      pista: 'Igual que antes: solo el texto de en medio. <code>&lt;h1&gt;</code> significa "título principal".',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')
        const encabezado = textoDel(doc, 'h1')

        if (!encabezado) {
          return { superado: false, mensaje: 'El <h1> se ha quedado sin texto, o ya no está.' }
        }
        if (encabezado === H1_SEMBRADO) {
          return { superado: false, mensaje: 'Sigue diciendo «Hola». Escribe otra cosa.' }
        }

        return {
          superado: true,
          mensaje: 'Y esto sí se ve en la página. Esa es la diferencia entre el título de la ventana y el de dentro.',
        }
      },
    },

    {
      id: '1-3',
      titulo: 'Escribe un párrafo',
      enunciado:
        'Debajo del <code>&lt;h1&gt;</code>, escribe un párrafo. Se hace con <code>&lt;p&gt;</code>: abres <code>&lt;p&gt;</code>, escribes, y cierras con <code>&lt;/p&gt;</code>. Cuenta lo que quieras, pero que tenga al menos diez caracteres.',
      pista: 'Entero, sería así: <code>&lt;p&gt;Aquí va lo que sea.&lt;/p&gt;</code>. La barra del cierre es lo que lo distingue de la apertura.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')
        const parrafos = buscarTodos(doc, 'p').filter((p) => p.textContent.trim().length > 0)

        if (!parrafos.length) {
          return { superado: false, mensaje: 'Todavía no hay ningún <p> con texto dentro.' }
        }

        const texto = parrafos[0].textContent.trim()
        if (texto.length < 10) {
          return {
            superado: false,
            mensaje: `El párrafo tiene ${texto.length} caracteres y hacen falta 10. Cuenta algo más.`,
          }
        }

        return { superado: true, mensaje: 'Un título y un párrafo. Eso ya es una página, por corta que sea.' }
      },
    },

    {
      id: '1-4',
      titulo: 'Y ahora otro',
      enunciado:
        'Escribe un segundo <code>&lt;p&gt;</code> debajo del primero. Fíjate en la vista previa: no se ponen uno al lado del otro, se apilan. Los párrafos ocupan toda la línea aunque el texto sea corto.',
      pista: 'Es copiar el que ya tienes y cambiarle el texto. Copiar y pegar es una técnica legítima.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')
        const parrafos = buscarTodos(doc, 'p').filter((p) => p.textContent.trim().length > 0)

        if (parrafos.length < 2) {
          return {
            superado: false,
            mensaje: `Llevas ${parrafos.length} párrafo${parrafos.length === 1 ? '' : 's'} con texto. Hacen falta 2.`,
          }
        }

        const textos = parrafos.map((p) => p.textContent.trim().toLowerCase())
        if (new Set(textos).size < 2) {
          return { superado: false, mensaje: 'Los dos dicen exactamente lo mismo. Cámbiale el texto a uno.' }
        }

        if (!tieneTexto(doc, 'h1')) {
          return { superado: false, mensaje: 'Se ha perdido el <h1> por el camino.' }
        }

        return {
          superado: true,
          mensaje: 'Uno debajo del otro, sin que tú hayas dicho nada. El navegador ya sabe cómo van los párrafos.',
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
