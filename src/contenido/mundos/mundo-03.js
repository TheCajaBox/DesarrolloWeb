// Mundo 3 — Todo es un fichero que alguien pide.
//
// El mundo donde se entiende que una web no es "una página": son varios
// ficheros que el navegador va pidiendo uno a uno. Sin esto interiorizado, el
// CSS que no se aplica y el 404 son magia negra en vez de un error con causa.
//
// Dialogos originales, en el registro de los personajes.

import { atributo, buscarTodos, leerHtml, textoDel } from '../../motor/leer-html.js'

const CATALOGO = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
  </head>
  <body>

    <h1>Sombreros</h1>

    <main>
      <article>
        <h2>El de siempre</h2>
        <p>Marrón, con el ala vencida por el lado izquierdo.</p>
      </article>

      <article>
        <h2>Hongo de contable</h2>
        <p>Duro, redondo y respetable. Te lo pones y te hablan de impuestos.</p>
      </article>

      <article>
        <h2>El de las bodas</h2>
        <p>Gris perla, impecable, con una mancha detrás.</p>
      </article>
    </main>

  </body>
</html>
`

// Enlaces cuyo destino apunta a un fichero del proyecto, no a otro sitio.
function enlacesInternos(doc) {
  return buscarTodos(doc, 'a[href]')
    .map((enlace) => enlace.getAttribute('href'))
    .filter((destino) => destino && !/^(https?:|mailto:|#)/i.test(destino))
}

export default {
  numero: 3,
  acto: 'Qué es todo esto',
  titulo: 'Mundo 3 · Todo es un fichero',

  entradilla: {
    quien: 'wayne',
    texto:
      'Una web no es un papel: son varios, y el navegador los va pidiendo de uno en uno como quien pide rondas. ' +
      'Si pides mal, te traen otra cosa. O nada. Y esto último pasa más de lo que la gente admite.',
  },

  ficheros: { 'index.html': CATALOGO },

  solucion: {
    'index.html': CATALOGO.replace(
      '    <title>El catálogo</title>\n',
      '    <title>El catálogo</title>\n    <link rel="stylesheet" href="css/estilos.css">\n',
    ).replace('    <h1>Sombreros</h1>\n', '    <h1>Sombreros</h1>\n    <a href="acerca.html">Sobre esto</a>\n'),
    'acerca.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Sobre esto</title>
  </head>
  <body>
    <h1>Sobre este catálogo</h1>
    <p>Lo hicimos porque sí.</p>
    <a href="index.html">Volver al catálogo</a>
  </body>
</html>
`,
    'css/estilos.css': `body {
  font-family: system-ui, sans-serif;
}
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Cómo pide el navegador cada cosa',
    cuerpo: `Cuando abres una página, el navegador no recibe la página entera de golpe. Recibe el HTML, y ese HTML es una lista de la compra.

Lo lee de arriba abajo. Cada vez que encuentra algo que apunta a otro fichero —una hoja de estilos, una imagen, un script— hace **otra petición** para traérselo. Una página normal puede provocar veinte, cincuenta, doscientas peticiones. Cada una es un viaje de ida y vuelta.

Esto explica dos cosas que confunden mucho al empezar:

**Por qué el CSS "no se aplica".** Casi nunca es que el CSS esté mal escrito. Casi siempre es que el navegador pidió un fichero y le contestaron que no existe. Pidió \`estilos.css\` y el fichero se llamaba \`estilo.css\`, o estaba en otra carpeta. La página se ve sin estilos porque nunca llegaron.

**Qué es un 404.** Es la respuesta que da el servidor cuando le piden algo que no tiene. No es un error de tu código: es una conversación que ha ido así:

    Navegador: dame /css/estilos.css
    Servidor:  no tengo eso (404)

**Cómo se escriben las direcciones de esos ficheros.** Hay tres formas y conviene distinguirlas:

- \`estilos.css\` — **relativa**. Significa "en la misma carpeta que el fichero que estás leyendo ahora". Es la más común y la más portable: si mueves el proyecto entero, sigue funcionando.
- \`/css/estilos.css\` — **absoluta de sitio**. La barra del principio significa "desde la raíz del sitio", sin importar desde dónde preguntes.
- \`https://otrositio.com/x.css\` — **absoluta completa**. Otro servidor, otra petición, y ya no dependes de ti.

Dentro de una ruta relativa, \`..\` significa "sube una carpeta". Si estás en \`css/estilos.css\` y quieres una imagen que está en \`imagenes/\`, la ruta es \`../imagenes/foto.png\`: sube desde \`css\` y baja a \`imagenes\`.

**La trampa clásica.** Las rutas relativas se resuelven desde **el fichero que las contiene**, no desde la página. Si tu CSS está en \`css/estilos.css\` y dentro pones \`background: url(fondo.png)\`, el navegador buscará \`css/fondo.png\`, no \`fondo.png\`. A mucha gente esto le cuesta una tarde la primera vez.

**Y una que se olvida siempre.** El orden importa: si el \`<link>\` de la hoja de estilos está al final del \`<body>\`, la página se pinta primero sin estilos y luego da un salto. Por eso el \`<link>\` va en el \`<head>\`: para que el navegador lo pida cuanto antes.`,
  },

  pasos: [
    {
      id: '3-1',
      titulo: 'Saca los estilos a su fichero',
      enunciado:
        'Crea un fichero nuevo llamado <code>estilos.css</code> (botón <strong>+</strong> en la pestaña Ficheros), escribe algo dentro —por ejemplo <code>body { font-family: system-ui; }</code>— y enlázalo desde el <code>&lt;head&gt;</code> con <code>&lt;link rel="stylesheet" href="estilos.css"&gt;</code>.',
      pista: 'El <code>&lt;link&gt;</code> no se cierra: no lleva <code>&lt;/link&gt;</code>. Va dentro del <code>&lt;head&gt;</code>, debajo del <code>&lt;title&gt;</code>.',
      comprobar(ficheros) {
        const nombres = Object.keys(ficheros || {})
        const hoja = nombres.find((ruta) => /(^|\/)estilos\.css$/i.test(ruta))

        if (!hoja) {
          return { superado: false, mensaje: 'Todavía no existe ningún fichero llamado estilos.css.' }
        }
        if (!String(ficheros[hoja] || '').trim()) {
          return { superado: false, mensaje: 'El fichero estilos.css existe pero está vacío. Escribe alguna regla.' }
        }

        const doc = leerHtml(ficheros['index.html'] || '')
        const enlaces = buscarTodos(doc, 'link[rel="stylesheet"]')

        if (!enlaces.length) {
          return {
            superado: false,
            mensaje: 'El fichero existe, pero la página no lo pide: falta el <link rel="stylesheet"> en el <head>.',
          }
        }

        const destino = enlaces[0].getAttribute('href') || ''
        if (!/estilos\.css$/i.test(destino)) {
          return {
            superado: false,
            mensaje: `El <link> apunta a "${destino}", y tu fichero se llama ${hoja}. El navegador pide lo que pone ahí, literalmente.`,
          }
        }

        return { superado: true, mensaje: 'Dos ficheros, dos peticiones. Ya no es una página: es un sitio.' }
      },
    },

    {
      id: '3-2',
      titulo: 'Una segunda página',
      enunciado:
        'Crea <code>acerca.html</code> y escribe dentro una página completa: <code>&lt;!doctype html&gt;</code>, su <code>&lt;head&gt;</code> con <code>&lt;title&gt;</code>, y un <code>&lt;body&gt;</code> con un <code>&lt;h1&gt;</code> y un párrafo contando de qué va el catálogo.',
      pista: 'Lo más rápido es copiar la estructura de <code>index.html</code> y vaciarle el contenido.',
      comprobar(ficheros) {
        const fuente = ficheros?.['acerca.html']
        if (!fuente) {
          return { superado: false, mensaje: 'No existe ningún fichero llamado acerca.html.' }
        }

        const doc = leerHtml(fuente)
        if (!textoDel(doc, 'title')) {
          return { superado: false, mensaje: 'A acerca.html le falta el <title> con texto.' }
        }
        if (!textoDel(doc, 'h1')) {
          return { superado: false, mensaje: 'A acerca.html le falta un <h1> con texto.' }
        }

        const parrafo = buscarTodos(doc, 'p').find((p) => p.textContent.trim().length >= 10)
        if (!parrafo) {
          return { superado: false, mensaje: 'Falta un párrafo con algo de contenido (al menos 10 caracteres).' }
        }

        return { superado: true, mensaje: 'Dos páginas. Todavía no se hablan, pero existen las dos.' }
      },
    },

    {
      id: '3-3',
      titulo: 'Que se hablen',
      enunciado:
        'Pon en <code>index.html</code> un enlace a la página nueva, y en <code>acerca.html</code> otro de vuelta. Un enlace es <code>&lt;a href="destino.html"&gt;texto&lt;/a&gt;</code>.',
      pista: 'El <code>href</code> lleva el nombre del fichero tal cual, porque están en la misma carpeta.',
      comprobar(ficheros) {
        const indice = leerHtml(ficheros?.['index.html'] || '')
        const acerca = leerHtml(ficheros?.['acerca.html'] || '')

        if (!ficheros?.['acerca.html']) {
          return { superado: false, mensaje: 'Primero necesitas acerca.html, del paso anterior.' }
        }

        const ida = enlacesInternos(indice).find((destino) => /acerca\.html/i.test(destino))
        if (!ida) {
          return { superado: false, mensaje: 'En index.html no hay ningún <a> que apunte a acerca.html.' }
        }

        const vuelta = enlacesInternos(acerca).find((destino) => /index\.html/i.test(destino))
        if (!vuelta) {
          return {
            superado: false,
            mensaje: 'Falta el enlace de vuelta: en acerca.html no hay ningún <a> que apunte a index.html.',
          }
        }

        const textoIda = buscarTodos(indice, 'a[href]').find((a) =>
          /acerca\.html/i.test(a.getAttribute('href') || ''),
        )
        if (!textoIda.textContent.trim()) {
          return {
            superado: false,
            mensaje: 'El enlace está, pero sin texto: no habría nada que pulsar.',
          }
        }

        return {
          superado: true,
          mensaje: 'Pruébalo en la vista previa: pincha y navega. Eso es un sitio web, ni más ni menos.',
        }
      },
    },

    {
      id: '3-4',
      titulo: 'Mete el CSS en su carpeta',
      enunciado:
        'Los proyectos crecen y los ficheros sueltos acaban siendo un desastre. Renombra <code>estilos.css</code> a <code>css/estilos.css</code> —escribiendo la carpeta en el nombre— y arregla el <code>href</code> del <code>&lt;link&gt;</code> para que siga encontrándolo.',
      pista: 'Usa el lápiz junto al fichero para renombrarlo. Si no cambias el <code>href</code>, la vista previa se quedará sin estilos: pruébalo antes de arreglarlo.',
      comprobar(ficheros) {
        const nombres = Object.keys(ficheros || {})
        const enCarpeta = nombres.find((ruta) => /^css\/estilos\.css$/i.test(ruta))

        if (!enCarpeta) {
          const suelto = nombres.find((ruta) => /(^|\/)estilos\.css$/i.test(ruta))
          return {
            superado: false,
            mensaje: suelto
              ? `Sigue en ${suelto}. Renómbralo a css/estilos.css.`
              : 'No encuentro estilos.css por ninguna parte.',
          }
        }

        const destino = atributo(leerHtml(ficheros['index.html'] || ''), 'link[rel="stylesheet"]', 'href')

        if (!destino) {
          return { superado: false, mensaje: 'Se ha perdido el <link rel="stylesheet"> del <head>.' }
        }
        if (!/css\/estilos\.css$/i.test(destino)) {
          return {
            superado: false,
            mensaje: `El fichero ya está en css/, pero el <link> sigue pidiendo "${destino}". Eso ahora mismo es un 404.`,
          }
        }

        return {
          superado: true,
          mensaje: 'Movido y encontrado. Esa ruta es exactamente lo que el navegador va a pedir.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Acuérdate de esto cuando algo "no funcione" y no sepas por qué: casi siempre alguien pidió una cosa y le dieron otra, ' +
      'o nada. No es magia, es un malentendido. Como casi todo.',
  },
}
