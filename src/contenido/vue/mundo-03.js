// Mundo 3 (Vue) — Enlaces, imágenes y semántica.
//
// Cierra el Acto I. El template sigue siendo HTML, y aquí entran las dos
// etiquetas que hacen que una web sea una web (el enlace y la imagen) y las
// etiquetas de región (header, nav, main, footer) que le dan forma a una
// página de verdad, la que un navegador y un lector de pantalla entienden.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { atributo, comprobarVue, dentro, hay } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { buscarTodos } from '../../motor/leer-html.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio.</p>

    <h2>El catálogo</h2>
    <ul>
      <li>Bombín de fieltro</li>
      <li>Panamá de verano</li>
      <li>Gorra de leñador</li>
    </ul>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

export default {
  numero: 3,
  acto: 'Un componente',
  titulo: 'Mundo 3 · Enlaces, imágenes y regiones',

  entradilla: {
    quien: 'wayne',
    texto:
      'Una web sin enlaces es un folleto. Hoy le pones el enlace, que es lo que la hace web, y una imagen, ' +
      'que es lo que la hace mirable. Y de paso, unas etiquetas que le dicen al navegador dónde está la cabecera y dónde el pie, ' +
      'que resulta que importa más de lo que parece.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <header>
    <h1>Sombreros que merecen la pena</h1>
    <nav>
      <a href="#catalogo">El catálogo</a>
      <a href="https://es.wikipedia.org/wiki/Sombrero">Qué es un sombrero</a>
    </nav>
  </header>

  <main>
    <p>Una colección pequeña y con muy poco criterio.</p>

    <section id="catalogo">
      <h2>El catálogo</h2>
      <img src="/sombreros/bombin.jpg" alt="Un bombín de fieltro negro sobre una mesa de madera" />
      <ul>
        <li>Bombín de fieltro</li>
        <li>Panamá de verano</li>
        <li>Gorra de leñador</li>
      </ul>
    </section>
  </main>

  <footer>
    <p>Hecho a mano, sin prisa. <a href="mailto:hola@elsombrero.example">Escríbeme</a>.</p>
  </footer>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'El enlace, la imagen y las regiones',
    cuerpo: `Dos etiquetas más y una idea. Con esto, tu template deja de ser una hoja de texto y empieza a ser una página.

**El enlace: \`<a>\`.** Es la etiqueta que inventó la web. Se escribe \`<a href="destino">texto que se ve</a>\`. El \`href\` es a dónde lleva, y hay de dos clases. Un enlace **absoluto** apunta a otro sitio de internet: \`href="https://ejemplo.com"\`, con su \`https://\` delante. Un enlace **relativo** apunta a algo de tu propia web: \`href="/catalogo"\` o \`href="#catalogo"\` (esto último salta a un elemento con ese \`id\` en la misma página). Hay dos más que conviene conocer: \`mailto:\` abre el correo, y sin \`href\` el enlace no lleva a ningún lado.

**La imagen: \`<img>\`.** Se escribe \`<img src="ruta" alt="descripción" />\`. El \`src\` es de dónde sale la imagen; el \`alt\` es su descripción en texto. El \`alt\` **no es opcional**: es lo que lee en voz alta un lector de pantalla, lo que se ve si la imagen no carga, y lo que entiende un buscador. Una imagen sin \`alt\` es una imagen que existe solo para quien puede verla. Descríbela como se la contarías a alguien por teléfono. \`<img>\` es además una etiqueta que **no se cierra**: no lleva \`</img>\`, se cierra ella sola con la barra del final.

**Las regiones: el esqueleto con nombre.** Hasta ahora todo iba en un \`<main>\`. Pero una página tiene partes, y HTML tiene una etiqueta para cada una: \`<header>\` es la cabecera (el título, el logo), \`<nav>\` es la navegación (el menú de enlaces), \`<main>\` es el contenido principal —y solo hay uno—, \`<section>\` agrupa un bloque temático, y \`<footer>\` es el pie. Podrías hacerlo todo con \`<div>\`, que es la caja genérica sin significado, pero entonces nadie sabría qué es cada parte. Estas etiquetas se ven **exactamente igual** que un \`<div>\`; la diferencia es que **significan**, y esa diferencia es la que usan la accesibilidad y el buen orden.

**La regla, otra vez la misma:** la etiqueta se elige por lo que la cosa es. Un menú es un \`<nav>\`, no un \`<div>\` con enlaces. Cuesta lo mismo y vale mucho más.`,
  },

  pasos: [
    {
      id: '3-1',
      titulo: 'El primer enlace',
      enunciado:
        'Dentro del <code>&lt;main&gt;</code>, añade un enlace con <code>&lt;a&gt;</code> que tenga texto y un atributo <code>href</code> con un destino (por ejemplo <code>https://…</code> o <code>#catalogo</code>).',
      pista: 'Se escribe <code>&lt;a href="destino"&gt;texto&lt;/a&gt;</code>. Sin <code>href</code>, no es un enlace de verdad.',
      comprobar: comprobarVue({
        template: [
          hay('a', { conTexto: true, falta: 'Todavía no hay ningún enlace <a> con texto.' }),
          atributo('a', 'href', {
            patron: /\S/,
            falta: 'El <a> está, pero le falta el atributo href con un destino.',
          }),
        ],
        exito: 'Un enlace de verdad, con destino. Eso, exactamente eso, es lo que hace que la web sea web.',
      }),
    },

    eleccion({
      id: '3-2',
      titulo: 'Absoluto o relativo',
      enunciado: 'Quieres enlazar a otra página de tu propia web, la de contacto, que está en <code>/contacto</code>. ¿Cuál es el href correcto?',
      pista: 'Lo tuyo empieza por barra; lo de fuera lleva el https:// delante.',
      opciones: [
        {
          texto: 'href="/contacto" — una ruta relativa a tu propio sitio.',
          correcta: true,
          porque: 'Sí. La barra al principio dice "de mi propia web". Es lo que usarás para moverte por tus páginas.',
        },
        {
          texto: 'href="https://contacto" — con https:// porque todo enlace lo lleva.',
          porque: 'No: el https:// es para sitios de fuera. Para lo tuyo basta la ruta, y ese "https://contacto" ni siquiera es una dirección válida.',
        },
        {
          texto: 'href="contacto.html" y rezar.',
          porque: 'En una app Vue no navegas por ficheros .html sueltos; las rutas internas empiezan por barra. Ya llegaremos al router.',
        },
      ],
    }),

    {
      id: '3-3',
      titulo: 'Una imagen, con su alt',
      enunciado:
        'Añade una imagen con <code>&lt;img&gt;</code>. Necesita <code>src</code> (de dónde sale) y <code>alt</code> (una descripción en texto, que no puede quedar vacía). Puede que la imagen no cargue todavía; lo que importa es la etiqueta.',
      pista: 'Se escribe <code>&lt;img src="/ruta.jpg" alt="descripción" /&gt;</code>. El <code>alt</code> descríbelo como si lo contaras por teléfono.',
      comprobar: comprobarVue({
        template: [
          hay('img', { falta: 'Todavía no hay ninguna <img> en el template.' }),
          atributo('img', 'src', { patron: /\S/, falta: 'A la <img> le falta el atributo src.' }),
          atributo('img', 'alt', {
            patron: /\S/,
            falta: 'A la <img> le falta el atributo alt.',
            malo: 'El alt está vacío. Descríbela: es lo que se lee si la imagen no carga.',
          }),
        ],
        exito: 'Imagen con descripción. Quien no pueda verla, ahora sabe qué hay. Eso es hacerlo bien.',
      }),
    },

    verdaderoFalso({
      id: '3-4',
      titulo: 'Cierto o falso: el alt y las regiones',
      enunciado: 'Cinco frases sobre imágenes y semántica. Todas.',
      pista: 'La idea: las etiquetas significan, y esa descripción de la imagen es para todo el mundo.',
      afirmaciones: [
        { texto: 'El alt de una imagen es lo que se lee si la imagen no carga o no se puede ver.', cierto: true, porque: 'Cierto: es la imagen contada en texto, para lectores de pantalla, buscadores y errores de carga.' },
        { texto: '<img> se cierra con </img> al final.', cierto: false, porque: 'Falso: <img> no se cierra con etiqueta; se cierra ella sola con la barra: <img … />.' },
        { texto: '<header>, <nav>, <main> y <footer> se ven igual que un <div>, pero significan algo.', cierto: true, porque: 'Cierto: a la vista son cajas iguales; la diferencia es que dicen qué parte de la página son.' },
        { texto: 'Puede haber varios <main> en una misma página.', cierto: false, porque: 'Falso: el contenido principal es uno, así que <main> va una sola vez.' },
        { texto: 'Un menú de enlaces se marca mejor con <nav> que con un <div> cualquiera.', cierto: true, porque: 'Cierto: <nav> dice "esto es la navegación", y eso lo aprovecha la accesibilidad.' },
      ],
    }),

    {
      id: '3-5',
      titulo: 'Cabecera y pie',
      enunciado:
        'Dale forma a la página: envuelve el título en un <code>&lt;header&gt;</code> y añade al final un <code>&lt;footer&gt;</code> con algo de texto. Pueden ir como hermanos del <code>&lt;main&gt;</code> (Vue permite varios elementos en el template).',
      pista: 'Estructura: <code>&lt;header&gt;…&lt;/header&gt;</code>, luego <code>&lt;main&gt;…&lt;/main&gt;</code>, luego <code>&lt;footer&gt;…&lt;/footer&gt;</code>.',
      comprobar: comprobarVue({
        template: [
          hay('header', { conTexto: true, falta: 'Falta un <header> con contenido (mete dentro el <h1>).' }),
          hay('footer', { conTexto: true, falta: 'Falta un <footer> con texto al final.' }),
        ],
        exito: 'Cabecera arriba, pie abajo. La página ya tiene silueta, y el navegador sabe qué es cada zona.',
      }),
    },

    completar({
      id: '3-6',
      titulo: 'Los atributos de una imagen',
      enunciado: 'Completa la etiqueta de imagen (solo el nombre de cada atributo).',
      pista: 'Uno dice de dónde sale la imagen; el otro la describe en palabras.',
      plantilla: `<img ___="/sombreros/panama.jpg" ___="Un panamá de verano, de paja clara" />`,
      huecos: [
        { respuestas: ['src'], porque: 'src es de dónde sale la imagen.' },
        { respuestas: ['alt'], porque: 'alt es la descripción en texto, la que no puede faltar.' },
      ],
    }),

    {
      id: '3-7',
      titulo: 'La navegación',
      enunciado:
        'Añade un <code>&lt;nav&gt;</code> (lo natural es dentro del <code>&lt;header&gt;</code>) con al menos <strong>dos</strong> enlaces <code>&lt;a&gt;</code> dentro.',
      pista: 'Un <code>&lt;nav&gt;</code> que contiene varios <code>&lt;a href="…"&gt;</code>. Es el menú de tu web.',
      comprobar: comprobarVue({
        template: [
          hay('nav', { falta: 'Todavía no hay ningún <nav>.' }),
          dentro('nav', 'a', {
            minimo: 2,
            pocos: (n) => `El <nav> tiene ${n} enlace${n === 1 ? '' : 's'} y hacen falta 2.`,
            fuera: 'Hay enlaces, pero fuera del <nav>. El menú los quiere dentro.',
          }),
        ],
        exito: 'Un menú de verdad: <nav> con sus enlaces. El navegador ya sabe cuál es la navegación de tu web.',
      }),
    },

    ordenar({
      id: '3-8',
      titulo: 'El esqueleto de una página',
      enunciado: 'Ordena las regiones de arriba abajo, como se leen en una página normal.',
      pista: 'Primero lo que corona la página; en medio lo importante; al final lo que se firma.',
      lineas: [
        '<header> — la cabecera, con el título y el menú',
        '<main> — el contenido principal de la página',
        '<footer> — el pie, con el cierre y el contacto',
      ],
      porque: 'Ese es el reparto de siempre: cabecera, contenido, pie. Con esas tres regiones cualquiera entiende tu página de un vistazo.',
    }),

    emparejar({
      id: '3-9',
      titulo: 'Cada región, su papel',
      enunciado: 'Une cada etiqueta con la parte de la página que representa.',
      pista: 'Todas son "cajas", pero cada una dice qué caja es.',
      pares: [
        { izquierda: '<nav>', derecha: 'el menú de navegación' },
        { izquierda: '<main>', derecha: 'el contenido principal (único)' },
        { izquierda: '<footer>', derecha: 'el pie de página' },
        { izquierda: '<section>', derecha: 'un bloque temático dentro del contenido' },
      ],
      porque: 'Elegir la región correcta cuesta lo mismo que un <div> y hace tu página legible para las máquinas y para el que venga detrás.',
    }),

    {
      id: '3-10',
      titulo: 'Una página completa y semántica',
      sintesis: true,
      enunciado:
        'Sin pistas. Junta todo: un <code>&lt;header&gt;</code> con el <code>&lt;h1&gt;</code> y un <code>&lt;nav&gt;</code> de al menos dos enlaces, un <code>&lt;main&gt;</code> con una <code>&lt;img&gt;</code> (con <code>alt</code> descrito) y algún enlace más, y un <code>&lt;footer&gt;</code>. Tu catálogo, con el esqueleto que usaría cualquier web profesional.',
      comprobar: comprobarVue({
        template: [
          hay('header', { conTexto: true, falta: 'Falta el <header>.' }),
          dentro('nav', 'a', { minimo: 2, pocos: (n) => `El <nav> lleva ${n} de 2 enlaces.` }),
          hay('main', { falta: 'Falta el <main> con el contenido principal.' }),
          atributo('img', 'alt', { patron: /\S/, falta: 'La <img> necesita un alt descrito.', malo: 'El alt de la imagen no puede quedar vacío.' }),
          hay('footer', { conTexto: true, falta: 'Falta el <footer>.' }),
          (doc) => {
            const enlaces = buscarTodos(doc, 'a').filter((a) => (a.getAttribute('href') || '').trim())
            return enlaces.length < 3 ? `Hay ${enlaces.length} enlaces con href y hacen falta al menos 3 (los del menú y uno más).` : null
          },
        ],
        exito:
          'Una página entera, semántica, con enlaces e imagen descrita. Con esto cierras el Acto I: ya sabes construir el contenido de cualquier web. Ahora toca vestirlo.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Con esto acabas el primer acto. Repasa lo que sabes hacer: estructurar una página con las etiquetas que significan, enlazarla, ilustrarla y dividirla en regiones. ' +
      'Es HTML de verdad, del que se cobra. Lo que viene ahora es el CSS, y por fin vas a poder decidir cómo se ve.',
  },
}
