// Mundo 4 (Vue) — El bloque style es CSS.
//
// Abre el Acto II. El <style scoped> del componente es CSS puro. Aquí se
// aprende la anatomía de una regla, a apuntar a los elementos con selectores,
// a poner color y tipografía, y qué significa de verdad ese "scoped" que hace
// que el estilo no se escape del componente.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, declara, hayRegla } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { buscarTodos } from '../../motor/leer-html.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio, elegida con calma.</p>

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
}
</style>
`

// Que algún elemento del template lleve una clase concreta.
function tieneClase(nombre, mensaje) {
  return (doc) => {
    const puesto = buscarTodos(doc, '*').some((n) =>
      (n.getAttribute('class') || '').split(/\s+/).includes(nombre),
    )
    return puesto ? null : mensaje
  }
}

export default {
  numero: 4,
  acto: 'Que se vea',
  titulo: 'Mundo 4 · El bloque style es CSS',

  entradilla: {
    quien: 'wax',
    texto:
      'Ya tienes el esqueleto. Ahora, el CSS. Vive en el bloque <style> del mismo componente, y no es magia: ' +
      'apuntas a un elemento, dices qué propiedad quieres cambiar y le das un valor. Tres piezas. ' +
      'Y ese "scoped" de al lado va a ser tu mejor amigo; hoy entenderás por qué.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio, elegida <span class="destacado">con calma</span>.</p>

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
}

h1 {
  color: #6b4a2b;
}

p {
  line-height: 1.6;
  color: #333;
}

.destacado {
  color: #b06a2c;
  font-weight: 600;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'La anatomía de una regla',
    cuerpo: `El CSS del bloque \`<style>\` se escribe en **reglas**, y una regla tiene siempre la misma forma:

\`\`\`
selector {
  propiedad: valor;
}
\`\`\`

El **selector** dice a qué elementos afecta. El **bloque** entre llaves dice qué cambiarles. Cada línea de dentro es una **declaración**: una \`propiedad\`, dos puntos, un \`valor\` y un punto y coma. Por ejemplo, \`h1 { color: #6b4a2b; }\` significa "a todos los \`<h1>\`, ponles ese color".

**Los selectores, de menos a más preciso:**
- **Por etiqueta:** \`p\` apunta a *todos* los párrafos. Sencillo y amplio.
- **Por clase:** \`.destacado\` apunta a los elementos que en el HTML lleven \`class="destacado"\`. El punto delante es la marca de "esto es una clase". Es la forma más útil: tú decides qué elementos entran, poniéndoles la clase.
- **Por id:** \`#cabecera\` apunta al único elemento con \`id="cabecera"\`. Se usa poco para estilos, porque un id es único y pesa mucho en la cascada.

**La cascada y la especificidad.** ¿Qué pasa si dos reglas dicen cosas distintas sobre el mismo elemento? Gana la **más específica**. Una clase (\`.destacado\`) gana a una etiqueta (\`p\`). Un id gana a una clase. Y a igualdad de especificidad, gana la que esté escrita **después**. No es aleatorio: es un orden que puedes aprender, y entenderlo te ahorra horas de "por qué no me hace caso este color".

**La tipografía, lo primero que se nota.** Tres propiedades cambian una página de "cruda" a "leíble": \`font-family\` (la fuente), \`font-size\` (el tamaño) y \`line-height\` (el espacio entre líneas; \`1.6\` es un buen valor para leer). Se heredan hacia abajo: si las pones en un contenedor, sus hijos las cogen.

**Y ahora el \`scoped\`.** Fíjate en \`<style scoped>\`. Esa palabra hace que estas reglas **solo afecten a este componente**. Si en otro componente también hay un \`p\`, tu \`p { color: #333 }\` no lo toca. Vue lo consigue por debajo marcando cada elemento de tu template con un identificador oculto y añadiéndolo a tus selectores. ¿Por qué es tan importante? Porque en una app con cincuenta componentes, sin \`scoped\` cualquier regla podría pisar a cualquier otra, y depurar eso es una pesadilla. Con \`scoped\`, cada componente es dueño de su propio aspecto y de nada más. Es una de las razones de peso para trabajar por componentes.`,
  },

  pasos: [
    {
      id: '4-1',
      titulo: 'El primer color',
      enunciado:
        'En el bloque <code>&lt;style&gt;</code>, escribe una regla para <code>h1</code> que le dé un <code>color</code>. La forma es <code>h1 { color: … }</code>.',
      pista: 'Un color puede ser un nombre (<code>brown</code>), un hex (<code>#6b4a2b</code>) o <code>rgb(...)</code>. Elige el que quieras.',
      comprobar: comprobarVue({
        estilo: [
          hayRegla('h1', { falta: 'Todavía no hay ninguna regla para h1 en el bloque style.' }),
          declara('h1', 'color', { patron: /\S/, falta: 'La regla de h1 está, pero le falta la propiedad color.' }),
        ],
        exito: 'Tu primer color, y con la forma exacta de toda regla CSS: selector, propiedad, valor.',
      }),
    },

    eleccion({
      id: '4-2',
      titulo: 'Para qué sirve scoped',
      enunciado: 'Tu componente tiene <code>&lt;style scoped&gt;</code> y dentro <code>p { color: #333 }</code>. En otro componente distinto también hay párrafos. ¿Qué les pasa a esos párrafos del otro componente?',
      pista: 'La palabra "scoped" significa "acotado", encerrado en este componente.',
      opciones: [
        {
          texto: 'Nada: la regla solo afecta a los <p> de ESTE componente.',
          correcta: true,
          porque: 'Exacto. Eso es scoped: tu estilo es tuyo y no se escapa. En una app grande, es lo que te salva de que todo se pise.',
        },
        {
          texto: 'También se ponen de ese color, porque el CSS es global.',
          porque: 'Sería así SIN scoped. Con scoped, Vue marca tus elementos por debajo para que la regla no salga de aquí.',
        },
        {
          texto: 'Da error, porque no puede haber dos reglas para <p>.',
          porque: 'No hay error: puede haber muchas reglas para <p> en muchos componentes. Scoped es precisamente lo que hace que convivan.',
        },
      ],
    }),

    {
      id: '4-3',
      titulo: 'Centrar el contenido',
      enunciado:
        'Dale forma a la columna de texto: en la regla de <code>main</code>, añade un <code>max-width</code> (para que no se estire) y un <code>margin</code> con <code>auto</code> a los lados (para centrarla). Algo como <code>margin: 2rem auto</code>.',
      pista: '<code>max-width: 40rem</code> limita el ancho; <code>margin: 2rem auto</code> centra el bloque (el <code>auto</code> reparte el hueco a los dos lados).',
      comprobar: comprobarVue({
        estilo: [
          declara('main', 'max-width', { patron: /\S/, falta: 'A main le falta un max-width que limite el ancho.' }),
          declara('main', 'margin', {
            patron: /auto/,
            falta: 'A main le falta el margin.',
            malo: 'El margin está, pero para centrar necesita "auto" a los lados: margin: 2rem auto.',
          }),
        ],
        exito: 'Una columna centrada y con ancho de lectura. Ese truco, max-width + margin auto, lo usarás mil veces.',
      }),
    },

    completar({
      id: '4-4',
      titulo: 'Las tres piezas de una regla',
      enunciado: 'Completa la regla para que todos los párrafos tengan interlineado. Rellena selector, propiedad y valor típico de lectura.',
      pista: 'El selector de "todos los párrafos" es la etiqueta a secas; la propiedad del interlineado y un valor cómodo de leer.',
      plantilla: `___ {
  line-___: 1.6;
}`,
      huecos: [
        { respuestas: ['p'], porque: 'El selector de todos los párrafos es la etiqueta p.' },
        { respuestas: ['height'], porque: 'La propiedad del interlineado es line-height.' },
      ],
    }),

    {
      id: '4-5',
      titulo: 'Texto que se lee',
      enunciado:
        'Añade una regla para <code>p</code> con <code>line-height</code> (prueba <code>1.6</code>) para que el texto respire. Puedes darle también un <code>color</code> si quieres.',
      pista: 'Regla nueva: <code>p { line-height: 1.6; }</code>. El interlineado es lo que más cambia la sensación de "leíble".',
      comprobar: comprobarVue({
        estilo: [
          hayRegla('p', { falta: 'Todavía no hay una regla para p.' }),
          declara('p', 'line-height', { patron: /\S/, falta: 'A la regla de p le falta line-height.' }),
        ],
        exito: 'Con el interlineado a 1.6 el texto deja de apelotonarse. Pequeño cambio, gran diferencia.',
      }),
    },

    verdaderoFalso({
      id: '4-6',
      titulo: 'Cierto o falso: selectores y cascada',
      enunciado: 'Cinco frases sobre cómo funciona el CSS. Todas.',
      pista: 'La idea de fondo: quién apunta a qué, y quién gana cuando hay conflicto.',
      afirmaciones: [
        { texto: 'El selector .destacado apunta a los elementos con class="destacado".', cierto: true, porque: 'Cierto: el punto delante marca "clase", y la clase la pones tú en el HTML.' },
        { texto: 'El selector p (sin punto) apunta a UN párrafo concreto que tú elijas.', cierto: false, porque: 'Falso: p a secas apunta a TODOS los párrafos. Para elegir uno, usa una clase.' },
        { texto: 'Si dos reglas chocan, gana la más específica; una clase gana a una etiqueta.', cierto: true, porque: 'Cierto: esa es la cascada. Clase > etiqueta, e id > clase.' },
        { texto: 'Con scoped, una regla de este componente puede cambiar el estilo de otro.', cierto: false, porque: 'Falso: scoped es justo lo contrario, encierra la regla en su componente.' },
        { texto: 'font-family, font-size y line-height se heredan a los elementos hijos.', cierto: true, porque: 'Cierto: si las pones en un contenedor, sus hijos las cogen. Por eso se ponen arriba.' },
      ],
    }),

    {
      id: '4-7',
      titulo: 'Una clase propia',
      enunciado:
        'Ponle <code>class="destacado"</code> a algún trozo de texto en el template (por ejemplo, envolviéndolo en un <code>&lt;span&gt;</code>), y en el style crea la regla <code>.destacado</code> con algún cambio (un color, o <code>font-weight</code>).',
      pista: 'En el template: <code>&lt;span class="destacado"&gt;con calma&lt;/span&gt;</code>. En el style: <code>.destacado { color: … }</code>.',
      comprobar: comprobarVue({
        template: [tieneClase('destacado', 'Ningún elemento lleva class="destacado" todavía. Ponsela a un trozo de texto.')],
        estilo: [hayRegla('.destacado', { falta: 'Falta la regla .destacado en el style (con el punto delante).' })],
        exito: 'Una clase tuya: tú decides qué elementos la llevan, y la regla los alcanza. Es el selector que más usarás.',
      }),
    },

    ordenar({
      id: '4-8',
      titulo: 'Quién gana en la cascada',
      enunciado: 'Ordena estos selectores de MENOS a MÁS fuerza en la cascada (el último gana los empates).',
      pista: 'Lo único gana a lo agrupado, y lo agrupado gana a lo general.',
      lineas: [
        'p — una etiqueta (la más débil)',
        '.destacado — una clase',
        '#aviso — un id (el más fuerte)',
      ],
      porque: 'Etiqueta < clase < id. Un id gana a mil clases, y una clase gana a mil etiquetas. No se suma, se compara por rango.',
    }),

    emparejar({
      id: '4-9',
      titulo: 'Cada propiedad, lo suyo',
      enunciado: 'Une cada propiedad de CSS con lo que controla.',
      pista: 'Todas son de texto y color; piensa en qué toca cada una.',
      pares: [
        { izquierda: 'color', derecha: 'el color del texto' },
        { izquierda: 'font-family', derecha: 'la fuente (la tipografía)' },
        { izquierda: 'line-height', derecha: 'el espacio entre líneas' },
        { izquierda: 'font-weight', derecha: 'el grosor de la letra' },
      ],
      porque: 'Saber qué propiedad toca cada cosa es media batalla del CSS. La otra media es la cascada.',
    }),

    {
      id: '4-10',
      titulo: 'Un componente con estilo',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja tu style con: un <code>color</code> para <code>h1</code>, un <code>main</code> con <code>max-width</code> y <code>margin: … auto</code>, una regla de <code>p</code> con <code>line-height</code>, y una clase propia <code>.destacado</code> aplicada en el template y con su regla. Es la primera vez que tu página tiene aspecto elegido por ti.',
      comprobar: comprobarVue({
        template: [tieneClase('destacado', 'Falta aplicar class="destacado" en el template.')],
        estilo: [
          declara('h1', 'color', { patron: /\S/, falta: 'A h1 le falta el color.' }),
          declara('main', 'max-width', { patron: /\S/, falta: 'A main le falta el max-width.' }),
          declara('main', 'margin', { patron: /auto/, falta: 'A main le falta el margin: … auto que lo centra.' }),
          declara('p', 'line-height', { patron: /\S/, falta: 'A p le falta el line-height.' }),
          hayRegla('.destacado', { falta: 'Falta la regla .destacado.' }),
        ],
        exito:
          'Tipografía, color, una columna centrada y una clase tuya. Eso ya es diseño, y todo dentro del componente, sin escaparse a ningún lado. Cierras la primera mitad del Acto II.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Mira la diferencia con lo de hace un rato. El mismo texto, pero ahora se lee, respira y tiene color. ' +
      'Y lo mejor: cada regla que has escrito vive aquí dentro y no va a ir a molestar a ningún otro componente. Eso es el scoped, y es oro.',
  },
}
