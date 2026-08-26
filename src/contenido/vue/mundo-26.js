// Mundo 26 (Vue) — Publicar: del proyecto al mundo.
//
// Abre el Acto VIII. La web se prepara para salir: título y descripción de
// verdad en index.html, el idioma declarado, y la teoría del viaje: qué hace
// npm run build, qué es dist/, dónde se aloja una web estática y el ritual de
// git para no perder nada por el camino.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarHtml } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const INDEX_SEMBRADO = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cambia esto</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`

export default {
  numero: 26,
  acto: 'Publicar',
  titulo: 'Mundo 26 · Preparada para el mundo',

  entradilla: {
    quien: 'wax',
    texto:
      'Tu web funciona, pero solo existe en tu máquina. Publicarla tiene dos partes: prepararla (que diga quién es, ' +
      'en su título, su descripción, su idioma) y entender el viaje (compilar, empaquetar, subir). Hoy haces la primera ' +
      'con las manos y la segunda con la cabeza. Al acabar, sabrás exactamente qué pasa entre tu carpeta y una URL pública.',
  },

  ficheros: { 'index.html': INDEX_SEMBRADO },

  solucion: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="El Sombrero: un catálogo de sombreros elegidos con poco criterio y mucho cariño." />
    <title>El Sombrero — sombreros que merecen la pena</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'De tu carpeta a una URL: el viaje completo',
    cuerpo: `Lo que tienes en la carpeta no es "la web": es el **proyecto de desarrollo**, con sus ficheros sueltos, sus comentarios y su Vite recompilando a cada guardado. Lo que se publica es otra cosa, y el viaje tiene tres etapas:

**Etapa 1: el build.** El comando \`npm run build\` le pide a Vite que **compile de verdad**: junta todos tus componentes, traduce los \`.vue\`, quita comentarios y espacios (**minificar**: mismo código, tamaño mínimo) y deja el resultado en una carpeta nueva: **\`dist/\`** (de *distribution*). Dentro hay un \`index.html\`, un JavaScript apretujado e ilegible —así debe ser: no es para humanos— y los recursos. Esa carpeta ES tu web: autosuficiente, estática, lista para servirse desde cualquier parte. En esta app de escritorio tienes el botón **«Exportar mi web»**, que hace exactamente esto y te abre la carpeta resultante: pruébalo al acabar el mundo.

**Etapa 2: el alojamiento.** Una web estática como la tuya (HTML + CSS + JS, sin servidor propio) se sirve desde un **hosting estático**: Netlify, Vercel, GitHub Pages, Cloudflare Pages… Muchos con capa gratuita de sobra para empezar. El ritual es parecido en todos: les das tu carpeta \`dist/\` (o mejor, tu repositorio, y ellos ejecutan el build), y te devuelven una URL pública. Con un **dominio** propio (unos euros al año) le pones nombre de verdad. Un matiz de SPA: como tus rutas (\`/catalogo\`, \`/cesta\`) las resuelve el router EN el navegador, hay que decirle al hosting que sirva \`index.html\` para cualquier ruta —todos tienen una casilla o fichero para esto ("SPA fallback")—; sin ella, entrar directamente a \`tudominio.com/cesta\` daría 404.

**Etapa 3 (transversal): git.** Antes, durante y después: **control de versiones**. Git es la libreta de contabilidad de tu código: cada **commit** es una foto con fecha y mensaje de todo el proyecto, y puedes volver a cualquier foto. El vocabulario mínimo: \`git init\` (estrenar la libreta en la carpeta), \`git add\` (marcar qué cambios entran en la próxima foto), \`git commit -m "mensaje"\` (tomar la foto, con un mensaje que explique el porqué), \`git push\` (subir la libreta a un servidor tipo GitHub, que hace de copia de seguridad y de escaparate). Los hostings modernos se conectan ahí: cada push, publican solos. Escribir → commit → push → publicado: ese es el ciclo de trabajo real.

**Y la preparación de la que nadie se acuerda: el index.html.** Tu web va a tener UNA carta de presentación ante buscadores, pestañas y enlaces compartidos:

- **\`<title>\`**: el texto de la pestaña y el titular en Google. "Cambia esto" no vende sombreros.
- **\`<meta name="description" content="…">\`**: la frase gris bajo el titular en los buscadores. Una o dos frases honestas que den ganas de entrar.
- **\`<html lang="es">\`**: declara el idioma. Lo usan los lectores de pantalla (para pronunciar bien), los traductores automáticos y los buscadores. Una palabra, tres beneficios.

Pequeños, baratos y casi siempre olvidados. Los tuyos, después de hoy, no.`,
  },

  pasos: [
    eleccion({
      id: '26-1',
      titulo: 'Qué hace el build',
      enunciado: '¿Qué es exactamente lo que produce <code>npm run build</code>?',
      pista: 'Piensa en la diferencia entre tu carpeta de trabajo y lo que se sirve al público.',
      opciones: [
        {
          texto: 'La carpeta dist/: la web compilada, minificada y autosuficiente, lista para cualquier hosting.',
          correcta: true,
          porque: 'Eso es: los .vue traducidos, el código apretujado, todo junto. dist/ ES la web; el proyecto es solo su fábrica.',
        },
        {
          texto: 'Un fichero .zip con el proyecto entero, node_modules incluido.',
          porque: 'No: node_modules ni viaja (pesa una barbaridad y solo sirve para desarrollar). El build produce el resultado final, no el taller.',
        },
        {
          texto: 'Nada visible: solo comprueba que no haya errores.',
          porque: 'Comprobar comprueba, pero lo importante es lo que deja: la carpeta dist/ con la web empaquetada.',
        },
      ],
    }),

    {
      id: '26-2',
      titulo: 'Un título de verdad',
      enunciado:
        'Abre <code>index.html</code> (está en la raíz del proyecto) y dale a tu web su nombre: cambia el <code>&lt;title&gt;</code> por algo tuyo y descriptivo, tipo «El Sombrero — sombreros que merecen la pena».',
      pista: 'El title vive en el head. Es lo que se lee en la pestaña del navegador y en el titular de Google.',
      comprobar: comprobarHtml({
        fichero: 'index.html',
        requisitos: [
          (doc) => {
            const t = doc.querySelector('title')?.textContent?.trim() || ''
            if (!t) return 'El index.html se ha quedado sin <title>.'
            if (t === 'Cambia esto') return 'El título sigue siendo «Cambia esto». Ponle el nombre de tu web.'
            if (t.length < 10) return 'Muy corto para vender nada: dale al título al menos 10 caracteres.'
            return null
          },
        ],
        exito: 'Tu web ya tiene nombre en la pestaña y titular para los buscadores. Primera impresión, resuelta.',
      }),
    },

    {
      id: '26-3',
      titulo: 'La frase de los buscadores',
      enunciado:
        'En el <code>&lt;head&gt;</code>, añade la descripción: <code>&lt;meta name="description" content="…" /&gt;</code> con una o dos frases honestas sobre tu web (mínimo 40 caracteres).',
      pista: 'Es la frase gris bajo el titular en Google. Escribe la que te haría entrar a ti.',
      comprobar: comprobarHtml({
        fichero: 'index.html',
        requisitos: [
          (doc) => {
            const meta = doc.querySelector('meta[name="description"]')
            if (!meta) return 'Falta la <meta name="description" content="…" /> en el head.'
            const contenido = (meta.getAttribute('content') || '').trim()
            if (contenido.length < 40) {
              return `La descripción tiene ${contenido.length} caracteres; con al menos 40 empieza a contar algo.`
            }
            return null
          },
        ],
        exito: 'Titular y descripción: tu resultado de búsqueda ya está escrito por ti, no improvisado por una máquina.',
      }),
    },

    {
      id: '26-4',
      titulo: 'Declara el idioma',
      enunciado: 'Al <code>&lt;html&gt;</code> le falta el idioma: ponle <code>lang="es"</code>.',
      pista: 'La primera etiqueta del fichero: <code>&lt;html lang="es"&gt;</code>. Una palabra, tres beneficios.',
      comprobar: comprobarHtml({
        fichero: 'index.html',
        requisitos: [
          (doc) => {
            const lang = doc.querySelector('html')?.getAttribute('lang') || ''
            if (!lang.trim()) return 'Al <html> le falta el atributo lang.'
            if (!/^es/i.test(lang.trim())) return `El lang dice "${lang}"; tu web está en español: lang="es".`
            return null
          },
        ],
        exito: 'Idioma declarado: lectores de pantalla que pronuncian bien, traductores que aciertan, buscadores que clasifican.',
      }),
    },

    verdaderoFalso({
      id: '26-5',
      titulo: 'Cierto o falso: el viaje',
      enunciado: 'Cinco frases sobre publicar. Todas.',
      pista: 'dist, minificar, hosting estático y el matiz de las SPA.',
      afirmaciones: [
        { texto: 'Minificar cambia lo que hace el código para que ocupe menos.', cierto: false, porque: 'Falso: hace EXACTAMENTE lo mismo; solo pierde espacios, comentarios y nombres largos. Mismo comportamiento, mínimo tamaño.' },
        { texto: 'La carpeta dist/ es autosuficiente: se puede servir desde cualquier hosting estático.', cierto: true, porque: 'Cierto: HTML, JS y recursos, sin depender de Vite ni de node_modules.' },
        { texto: 'Para publicar una web Vue como la tuya hace falta alquilar un servidor y administrarlo.', cierto: false, porque: 'Falso: una web estática vive feliz en un hosting estático, muchos gratuitos. El servidor propio es para cuando tengas API.' },
        { texto: 'En una SPA hay que configurar el hosting para servir index.html en cualquier ruta.', cierto: true, porque: 'Cierto: tus rutas las resuelve el router en el navegador. Sin ese ajuste, entrar directo a /cesta daría 404.' },
        { texto: 'El JavaScript de dist/ es ilegible, y eso es un problema.', cierto: false, porque: 'Falso a medias: ilegible sí, problema no. No es para humanos; tu código de verdad sigue en el proyecto (y en git).' },
      ],
    }),

    emparejar({
      id: '26-6',
      titulo: 'El ritual de git',
      enunciado: 'Une cada comando con lo que hace en la libreta del proyecto.',
      pista: 'Estrenar, marcar, fotografiar, subir.',
      pares: [
        { izquierda: 'git init', derecha: 'estrenar la libreta en esta carpeta' },
        { izquierda: 'git add .', derecha: 'marcar los cambios para la próxima foto' },
        { izquierda: 'git commit -m "…"', derecha: 'tomar la foto, con su mensaje', porque: 'El mensaje explica el PORQUÉ del cambio: tu yo del futuro lo agradecerá.' },
        { izquierda: 'git push', derecha: 'subir la libreta al servidor (GitHub)' },
      ],
      porque: 'Init una vez, add-commit en cada avance, push para respaldar y publicar. Cuatro comandos y tu trabajo nunca más se pierde.',
    }),

    ordenar({
      id: '26-7',
      titulo: 'De la carpeta a la URL',
      enunciado: 'Ordena el camino completo de publicación, del código al público.',
      pista: 'Preparar, fotografiar, subir, construir, servir.',
      lineas: [
        'Preparar el index.html: title, description, lang',
        'git add y git commit con un buen mensaje',
        'git push al repositorio (GitHub)',
        'El hosting detecta el push y ejecuta npm run build',
        'La carpeta dist/ resultante se sirve en tu URL pública',
      ],
      porque: 'Preparar → commit → push → build → servir. Con el hosting conectado al repositorio, publicar se reduce a: escribe y haz push.',
    }),

    completar({
      id: '26-8',
      titulo: 'Los comandos de memoria',
      enunciado: 'Completa el ciclo de guardar y publicar trabajo.',
      pista: 'La foto con mensaje, la subida, y el comando que empaqueta.',
      plantilla: `git add .
git ___ -m "El catálogo carga desde el servidor"
git ___

npm run ___`,
      huecos: [
        { respuestas: ['commit'], porque: 'commit toma la foto del estado actual, con su mensaje.' },
        { respuestas: ['push'], porque: 'push sube tus commits al servidor remoto.' },
        { respuestas: ['build'], porque: 'build compila y deja la web lista en dist/.' },
      ],
    }),

    {
      id: '26-9',
      titulo: 'La carta de presentación completa',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja tu <code>index.html</code> listo para el mundo: un <code>&lt;title&gt;</code> tuyo y con sustancia, la <code>&lt;meta name="description"&gt;</code> con su contenido de al menos 40 caracteres, y el <code>lang="es"</code> en el <code>&lt;html&gt;</code>. Cuando esté verde, date el capricho: pulsa <strong>«Exportar mi web»</strong> arriba a la derecha y abre la carpeta que sale. Eso que ves es tu web, empaquetada de verdad.',
      comprobar: comprobarHtml({
        fichero: 'index.html',
        requisitos: [
          (doc) => {
            const t = doc.querySelector('title')?.textContent?.trim() || ''
            if (!t || t === 'Cambia esto' || t.length < 10) return 'El título tiene que ser tuyo y con al menos 10 caracteres.'
            return null
          },
          (doc) => {
            const contenido = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim()
            return contenido.length < 40 ? 'La descripción necesita sus 40 caracteres.' : null
          },
          (doc) => (/^es/i.test(doc.querySelector('html')?.getAttribute('lang')?.trim() || '') ? null : 'Falta el lang="es".'),
        ],
        exito:
          'Título, descripción e idioma: tu web sabe presentarse. Y si has pulsado Exportar, acabas de hacer tu primer build de verdad. Queda un solo mundo, y no tiene apuntes: tiene retos.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      '¿Has abierto la carpeta del export? Mira el JavaScript de dentro: ilegible, apretado, precioso. Eso era tu proyecto hace un momento. ' +
      'Súbelo a cualquier hosting estático y tu tienda existe para el planeta entero. Nos queda una cosa tú y yo: comprobar que todo esto ya es tuyo. Sin apuntes. Sin pistas. Último mundo.',
  },
}
