// Mundo 5 (Vue) — Cajas: padding, border, margin y fondo.
//
// Segundo mundo del Acto II. Todo elemento es una caja, y saber leer esa caja
// (contenido, relleno, borde, margen) es EL modelo mental del CSS. Aquí se
// construye la primera ficha de sombrero con aspecto de tarjeta.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  declara,
  declaraAlguna,
  hay,
  hayRegla,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { buscarTodos } from '../../motor/leer-html.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>

    <article>
      <h2>Bombín de fieltro</h2>
      <p>Serio por fuera, blando por dentro. Como su dueño.</p>
    </article>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
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
  numero: 5,
  acto: 'Que se vea',
  titulo: 'Mundo 5 · Todo es una caja',

  entradilla: {
    quien: 'wax',
    texto:
      'Hay una idea que, cuando cae, el CSS entero se ordena solo: todo elemento es una caja. ' +
      'Texto, imagen, título: cajas. Y toda caja tiene lo mismo: contenido, relleno, borde y margen. ' +
      'Hoy conviertes esa ficha sosa en una tarjeta con cuerpo.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>

    <article class="ficha">
      <h2>Bombín de fieltro</h2>
      <p>Serio por fuera, blando por dentro. Como su dueño.</p>
      <p class="precio">42 €</p>
    </article>

    <article class="ficha">
      <h2>Panamá de verano</h2>
      <p>Para fingir que estás de vacaciones aunque sea martes.</p>
      <p class="precio">35 €</p>
    </article>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}

.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
  margin: 1.5rem 0;
}

.ficha h2 {
  margin: 0 0 0.4rem;
}

.precio {
  font-weight: 700;
  color: #6b4a2b;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'El modelo de caja',
    cuerpo: `Cierra los ojos y mira cualquier web: es un montón de rectángulos, unos dentro de otros. Ese es el secreto a voces del CSS: **todo elemento es una caja**, y toda caja tiene cuatro capas, de dentro afuera:

**1. El contenido.** El texto o la imagen en sí. Su tamaño lo controlan \`width\` y \`height\` (aunque casi siempre es mejor dejar que el contenido mande y limitar con \`max-width\`).

**2. El relleno: \`padding\`.** El espacio entre el contenido y el borde, **por dentro**. Es lo que hace que un texto no toque las paredes de su caja. \`padding: 1.2rem\` pone el mismo relleno por los cuatro lados; \`padding: 1rem 2rem\` pone 1 arriba/abajo y 2 a los lados.

**3. El borde: \`border\`.** La línea que rodea la caja. Se declara con tres valores: grosor, estilo y color: \`border: 1px solid #d8c9ad\`. Y su compañera \`border-radius\` redondea las esquinas: es la diferencia entre una caja de laboratorio y una tarjeta amable.

**4. El margen: \`margin\`.** El espacio **por fuera** del borde, el que separa esta caja de las demás. Ya lo usaste para centrar (\`margin: 2rem auto\`); también sirve para dar aire entre fichas: \`margin: 1.5rem 0\`.

**La confusión clásica, y cómo no caer:** padding y margin se parecen porque los dos son "espacio". La diferencia: **padding es espacio DENTRO de la caja** (entre contenido y borde; si la caja tiene fondo, el padding se pinta del color del fondo), **margin es espacio FUERA** (entre esta caja y la siguiente; siempre transparente). Si quieres que el texto respire dentro de su tarjeta: padding. Si quieres separar dos tarjetas entre sí: margin.

**El fondo: \`background\`.** El color (o imagen) que llena la caja hasta el borde: \`background: #f7f1e6\`. Con fondo es cuando el padding se ve de verdad: sin padding, el texto pegado al filo del color canta muchísimo.

**Los rem, ya que salen.** \`1rem\` es el tamaño de letra base de la página (normalmente 16px). Medir en \`rem\` en vez de en píxeles hace que todo escale junto si alguien agranda la letra. Cuesta lo mismo y es más considerado.

**Y el truco del oficio:** cuando una caja no hace lo que esperas, pregúntate por sus cuatro capas en orden: ¿cuánto contenido? ¿cuánto padding? ¿hay borde? ¿cuánto margin? El noventa por ciento de los "esto no cuadra" se resuelve ahí.`,
  },

  pasos: [
    {
      id: '5-1',
      titulo: 'La tarjeta nace',
      enunciado:
        'Ponle <code>class="ficha"</code> al <code>&lt;article&gt;</code> y crea en el style la regla <code>.ficha</code> con un <code>background</code> (un color suave, tipo <code>#f7f1e6</code>).',
      pista: 'En el template: <code>&lt;article class="ficha"&gt;</code>. En el style: <code>.ficha { background: #f7f1e6; }</code>.',
      comprobar: comprobarVue({
        template: [tieneClase('ficha', 'El <article> aún no lleva class="ficha".')],
        estilo: [
          hayRegla('.ficha', { falta: 'Falta la regla .ficha en el style.' }),
          declaraAlguna('.ficha', ['background', 'background-color'], {
            falta: 'A .ficha le falta el background con un color.',
          }),
        ],
        exito: 'Con fondo, la ficha ya se distingue del resto. Ahora se le ve la caja… y también que el texto toca las paredes.',
      }),
    },

    eleccion({
      id: '5-2',
      titulo: '¿Padding o margin?',
      enunciado: 'El texto de tu ficha está pegado al filo del color de fondo y queda mal. ¿Qué propiedad lo despega?',
      pista: '¿El espacio que buscas está DENTRO de la caja o FUERA?',
      opciones: [
        {
          texto: 'padding: espacio por dentro, entre el contenido y el borde.',
          correcta: true,
          porque: 'Eso es. El padding empuja el contenido hacia dentro, y como es parte de la caja, se pinta del color del fondo.',
        },
        {
          texto: 'margin: espacio por fuera de la caja.',
          porque: 'El margin separa esta caja de las demás, pero no despega el texto del filo: eso pasa por dentro, y por dentro manda el padding.',
        },
        {
          texto: 'border: una línea más gorda para disimular.',
          porque: 'El borde es la línea que rodea; hacerla gorda no da aire al texto, solo hace la pared más ancha.',
        },
      ],
    }),

    {
      id: '5-3',
      titulo: 'Aire por dentro',
      enunciado: 'Dale a <code>.ficha</code> un <code>padding</code> (prueba <code>1.2rem</code>) para que el contenido respire.',
      pista: 'Dentro de la regla que ya tienes: <code>padding: 1.2rem;</code>.',
      comprobar: comprobarVue({
        estilo: [
          declaraAlguna('.ficha', ['padding', 'padding-top', 'padding-block'], {
            falta: 'A .ficha le falta el padding.',
          }),
        ],
        exito: 'Qué diferencia, ¿eh? El mismo fondo, pero ahora el texto no toca las paredes. Eso era el padding.',
      }),
    },

    {
      id: '5-4',
      titulo: 'Borde y esquinas',
      enunciado:
        'Remata la tarjeta: un <code>border</code> fino (grosor, estilo y color, como <code>1px solid #d8c9ad</code>) y un <code>border-radius</code> para redondear las esquinas.',
      pista: 'El borde lleva tres valores seguidos: <code>1px solid #color</code>. El radio, con probar <code>0.6rem</code> vale.',
      comprobar: comprobarVue({
        estilo: [
          declara('.ficha', 'border', {
            patron: /solid|dashed|dotted/,
            falta: 'A .ficha le falta el border.',
            malo: 'El border necesita sus tres valores: grosor, estilo (solid) y color.',
          }),
          declara('.ficha', 'border-radius', { patron: /\S/, falta: 'Faltan las esquinas: border-radius.' }),
        ],
        exito: 'Fondo, aire, borde y esquinas suaves: eso ya es una tarjeta, no un párrafo con color.',
      }),
    },

    ordenar({
      id: '5-5',
      titulo: 'Las capas de la caja',
      enunciado: 'Ordena las capas de una caja de DENTRO hacia FUERA.',
      pista: 'Empieza por lo que se lee y acaba por el espacio que la separa de las demás.',
      lineas: [
        'el contenido — el texto o la imagen',
        'el padding — el relleno por dentro',
        'el border — la línea que la rodea',
        'el margin — el espacio por fuera',
      ],
      porque: 'Contenido, padding, border, margin: de dentro afuera. Con ese orden en la cabeza, cualquier caja se deja leer.',
    }),

    verdaderoFalso({
      id: '5-6',
      titulo: 'Cierto o falso: la caja',
      enunciado: 'Cinco frases sobre el modelo de caja. Todas.',
      pista: 'Dentro/fuera es la clave de casi todas.',
      afirmaciones: [
        { texto: 'El padding queda por dentro del borde; el margin, por fuera.', cierto: true, porque: 'Cierto, y es LA distinción del modelo de caja.' },
        { texto: 'El margin de una caja se pinta del color de su fondo.', cierto: false, porque: 'Falso: el margin queda FUERA de la caja y siempre es transparente. El que se pinta del fondo es el padding.' },
        { texto: 'border: 1px solid #999 declara grosor, estilo y color a la vez.', cierto: true, porque: 'Cierto: es la forma abreviada de los tres.' },
        { texto: 'margin: 2rem auto sirve para centrar una caja con ancho limitado.', cierto: true, porque: 'Cierto: el auto reparte el espacio sobrante a los dos lados.' },
        { texto: '1rem es siempre exactamente 16 píxeles, pase lo que pase.', cierto: false, porque: 'Falso: 1rem es el tamaño base de la página. SUELE ser 16px, pero si la persona lo agranda, todo lo medido en rem escala con ella.' },
      ],
    }),

    completar({
      id: '5-7',
      titulo: 'Una tarjeta de memoria',
      enunciado: 'Completa la regla de una tarjeta: el relleno interior, la línea que la rodea y el espacio exterior.',
      pista: 'Dentro, alrededor, fuera: en ese orden aparecen.',
      plantilla: `.tarjeta {
  ___: 1.2rem;
  ___: 1px solid #d8c9ad;
  ___: 1.5rem 0;
}`,
      huecos: [
        { respuestas: ['padding'], porque: 'El relleno interior es el padding.' },
        { respuestas: ['border'], porque: 'La línea que rodea es el border.' },
        { respuestas: ['margin'], porque: 'El espacio hacia las demás cajas es el margin.' },
      ],
    }),

    emparejar({
      id: '5-8',
      titulo: 'Cada propiedad, su capa',
      enunciado: 'Une cada propiedad con lo que controla en la caja.',
      pista: 'Repasa las capas de dentro afuera.',
      pares: [
        { izquierda: 'padding', derecha: 'el espacio interior' },
        { izquierda: 'margin', derecha: 'el espacio hacia otras cajas', porque: 'El margin siempre queda fuera, y siempre es transparente.' },
        { izquierda: 'border-radius', derecha: 'el redondeo de las esquinas' },
        { izquierda: 'background', derecha: 'el color que llena la caja' },
      ],
      porque: 'Cuatro propiedades, cuatro capas. Con esto se construye el noventa por ciento de las tarjetas del mundo.',
    }),

    {
      id: '5-9',
      titulo: 'Aire entre fichas',
      enunciado:
        'Duplica el <code>&lt;article class="ficha"&gt;</code> para tener una <strong>segunda</strong> ficha (otro sombrero, otro texto), y sepáralas con <code>margin</code> en la regla <code>.ficha</code>.',
      pista: 'Copia el article entero y cámbiale el contenido. En el style: <code>margin: 1.5rem 0;</code> (arriba/abajo, nada a los lados).',
      comprobar: comprobarVue({
        template: [
          hay('article', {
            minimo: 2,
            pocos: (n) => `Hay ${n} ficha${n === 1 ? '' : 's'} y hacen falta 2. Duplica el article.`,
          }),
        ],
        estilo: [
          declaraAlguna('.ficha', ['margin', 'margin-top', 'margin-block'], {
            falta: 'A .ficha le falta el margin que separa una ficha de otra.',
          }),
        ],
        exito: 'Dos tarjetas con aire entre medias. El margin de cada una empuja a la vecina: espacio por fuera.',
      }),
    },

    {
      id: '5-10',
      titulo: 'La tarjeta completa',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja tu <code>.ficha</code> con la caja entera: <code>background</code>, <code>padding</code>, <code>border</code>, <code>border-radius</code> y <code>margin</code>. Y en el template, al menos dos <code>&lt;article class="ficha"&gt;</code>, cada uno con su <code>&lt;h2&gt;</code> y su <code>&lt;p&gt;</code>. Un catálogo con tarjetas de verdad.',
      comprobar: comprobarVue({
        template: [
          hay('article', { minimo: 2, pocos: (n) => `Van ${n} de 2 fichas.` }),
          tieneClase('ficha', 'Los article necesitan class="ficha".'),
          hay('article h2', { conTexto: true, falta: 'Cada ficha necesita su <h2> con el nombre del sombrero.' }),
          hay('article p', { conTexto: true, falta: 'Cada ficha necesita al menos un <p>.' }),
        ],
        estilo: [
          declaraAlguna('.ficha', ['background', 'background-color'], { falta: 'A .ficha le falta el fondo.' }),
          declaraAlguna('.ficha', ['padding', 'padding-top', 'padding-block'], { falta: 'A .ficha le falta el padding.' }),
          declara('.ficha', 'border', { patron: /\S/, falta: 'A .ficha le falta el border.' }),
          declara('.ficha', 'border-radius', { patron: /\S/, falta: 'A .ficha le faltan las esquinas (border-radius).' }),
          declaraAlguna('.ficha', ['margin', 'margin-top', 'margin-block'], { falta: 'A .ficha le falta el margin.' }),
        ],
        exito:
          'Tarjetas con las cuatro capas bien puestas, repetidas y separadas. Acabas de aprender el modelo mental con el que se lee TODO el CSS.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Todo es una caja. Ya está, ese es el gran secreto; los demás son detalles. Cuando algo no te cuadre en una página, ' +
      'de aquí a diez años, te preguntarás "¿cuánto padding, cuánto margin?" y casi siempre acertarás. Fíchalo, que es de las que valen.',
  },
}
