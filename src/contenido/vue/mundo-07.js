// Mundo 7 (Vue) — Grid y responsive: la rejilla que se adapta.
//
// Cierra el Acto II. Flexbox coloca en una dirección; Grid coloca en dos: el
// catálogo de fichas en rejilla de columnas. Y con @media (o mejor: con
// auto-fill + minmax) la rejilla se adapta a la pantalla. Al acabar este
// mundo, la alumna sabe montar el layout completo de una web moderna.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, declara, enMedia, hay, hayRegla } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <article class="ficha">
        <h2>Bombín de fieltro</h2>
        <p>Serio por fuera, blando por dentro.</p>
      </article>
      <article class="ficha">
        <h2>Panamá de verano</h2>
        <p>Para fingir que estás de vacaciones.</p>
      </article>
      <article class="ficha">
        <h2>Gorra de leñador</h2>
        <p>Nunca ha visto un bosque, pero lo disimula.</p>
      </article>
      <article class="ficha">
        <h2>Boina clásica</h2>
        <p>La lleva quien sabe algo que tú no.</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
`

export default {
  numero: 7,
  acto: 'Que se vea',
  titulo: 'Mundo 7 · Grid y responsive',

  entradilla: {
    quien: 'wax',
    texto:
      'Cuatro fichas apiladas en columna desperdician la pantalla entera. Grid las pone en rejilla: ' +
      'columnas y filas a la vez. Y con una condición de anchura, la misma rejilla se estrecha en el móvil sin romperse. ' +
      'Este es el último ladrillo del layout: después de hoy, sabes montar una página entera.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <article class="ficha">
        <h2>Bombín de fieltro</h2>
        <p>Serio por fuera, blando por dentro.</p>
      </article>
      <article class="ficha">
        <h2>Panamá de verano</h2>
        <p>Para fingir que estás de vacaciones.</p>
      </article>
      <article class="ficha">
        <h2>Gorra de leñador</h2>
        <p>Nunca ha visto un bosque, pero lo disimula.</p>
      </article>
      <article class="ficha">
        <h2>Boina clásica</h2>
        <p>La lleva quien sabe algo que tú no.</p>
      </article>
      <article class="ficha">
        <h2>Sombrero de copa</h2>
        <p>Para bodas, magos y gente con planes.</p>
      </article>
      <article class="ficha">
        <h2>Canotier de paja</h2>
        <p>Rígido, honesto y con vocación de barca.</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.catalogo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}

@media (max-width: 40rem) {
  .catalogo {
    grid-template-columns: 1fr;
  }
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Grid y las pantallas que no controlas',
    cuerpo: `Flexbox coloca en **una** dirección. Grid coloca en **dos**: defines columnas, y las cajas se van repartiendo en filas solas. Es la herramienta de los catálogos, las galerías y los paneles.

**Se activa en el padre, como flexbox:** \`display: grid\` en el contenedor. Y la propiedad estrella es \`grid-template-columns\`, que define las columnas:

- \`grid-template-columns: repeat(3, 1fr)\` — tres columnas iguales. El \`fr\` es una unidad nueva: una **fracción del espacio disponible**. \`1fr 1fr 1fr\` (o su abreviatura con \`repeat\`) reparte el ancho en tres partes iguales. \`2fr 1fr\` haría la primera el doble de ancha.
- \`gap: 1rem\` — el mismo \`gap\` de flexbox, pero aquí separa filas y columnas a la vez.

Con esas dos líneas, tus cuatro fichas se colocan en rejilla: tres arriba, una abajo, todas del mismo ancho, sin medir nada.

**El problema de las pantallas.** Tu rejilla de tres columnas es estupenda… en tu monitor. En un móvil de 380 píxeles, tres columnas son tres columnas raquíticas. Y aquí está la verdad incómoda del oficio: **no controlas la pantalla donde se verá tu web**. La solución clásica es la \`@media\`:

\`\`\`
@media (max-width: 40rem) {
  .catalogo { grid-template-columns: 1fr; }
}
\`\`\`

Se lee: "si la ventana mide 40rem o menos, aplica estas reglas". Dentro va CSS normal que **sobrescribe** al de fuera solo cuando se cumple la condición. Pantalla grande: tres columnas. Pantalla estrecha: una. La misma página, dos comportamientos.

**El truco de nivel pro: que la rejilla se adapte sola.** Existe una fórmula que hace el responsive sin @media:

\`\`\`
grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
\`\`\`

Se lee: "mete tantas columnas como quepan (\`auto-fill\`), cada una de mínimo 14rem y máximo una fracción (\`minmax\`)". En una pantalla ancha caben cuatro; en un móvil cabe una. Sin condiciones, sin puntos de corte: la rejilla calcula. Cuando la entiendas, la usarás en todos lados.

**¿Grid o flexbox?** La pregunta del millón, con respuesta corta: **una dirección → flexbox; dos dimensiones → grid**. Cabecera con menú: flexbox. Catálogo de tarjetas: grid. Fila de precio y botón: flexbox. Galería de fotos: grid. Y se combinan sin problema: un grid de fichas donde cada ficha usa flexbox por dentro es el pan de cada día.`,
  },

  pasos: [
    {
      id: '7-1',
      titulo: 'La rejilla nace',
      enunciado:
        'Crea la regla <code>.catalogo</code> con <code>display: grid</code> y <code>grid-template-columns: repeat(3, 1fr)</code>. Tres columnas iguales, del tirón.',
      pista: 'Dos líneas en una regla nueva. El repeat(3, 1fr) es la abreviatura de 1fr 1fr 1fr.',
      comprobar: comprobarVue({
        estilo: [
          hayRegla('.catalogo', { falta: 'Todavía no hay regla para .catalogo.' }),
          declara('.catalogo', 'display', { patron: /grid/, falta: 'A .catalogo le falta display: grid.' }),
          declara('.catalogo', 'grid-template-columns', {
            patron: /\S/,
            falta: 'Falta grid-template-columns con las columnas.',
          }),
        ],
        exito: 'Rejilla. Las fichas se han repartido solas en columnas: tú defines la plantilla, Grid coloca.',
      }),
    },

    eleccion({
      id: '7-2',
      titulo: 'Qué es un fr',
      enunciado: 'En <code>grid-template-columns: 2fr 1fr</code>, ¿qué significa exactamente?',
      pista: 'fr viene de "fracción". ¿Fracción de qué?',
      opciones: [
        {
          texto: 'Dos columnas: la primera ocupa el doble de fracción del espacio disponible que la segunda.',
          correcta: true,
          porque: 'Eso es: el espacio se parte en 3 fracciones (2+1), la primera columna se lleva 2 y la segunda 1.',
        },
        {
          texto: 'Dos columnas de 2 y 1 píxeles de ancho.',
          porque: 'No: fr no es una medida fija, es una fracción del espacio que quede libre. Por eso la rejilla se estira con la pantalla.',
        },
        {
          texto: 'Una columna que se repite 2.1 veces.',
          porque: 'Son dos valores separados (2fr y 1fr), no un decimal. Cada valor define una columna.',
        },
      ],
    }),

    {
      id: '7-3',
      titulo: 'Aire en la rejilla',
      enunciado: 'Las fichas están pegadas entre sí. Añade <code>gap</code> a <code>.catalogo</code> para separar filas y columnas de una vez.',
      pista: 'El mismo gap de flexbox: <code>gap: 1rem;</code> en la regla .catalogo.',
      comprobar: comprobarVue({
        estilo: [
          declara('.catalogo', 'gap', { patron: /\S/, falta: 'A .catalogo le falta el gap.' }),
        ],
        exito: 'Un solo gap separa filas y columnas. En grid es todavía más rentable que en flexbox.',
      }),
    },

    verdaderoFalso({
      id: '7-4',
      titulo: 'Cierto o falso: grid y flexbox',
      enunciado: 'Cinco frases sobre las dos herramientas de layout. Todas.',
      pista: 'Una dirección contra dos dimensiones: casi todo sale de ahí.',
      afirmaciones: [
        { texto: 'Grid coloca en dos dimensiones; flexbox en una dirección.', cierto: true, porque: 'Cierto, y es EL criterio para elegir entre ellos.' },
        { texto: 'display: grid se escribe en cada ficha para que se coloque.', cierto: false, porque: 'Falso: igual que flexbox, grid se declara en el CONTENEDOR y coloca a los hijos.' },
        { texto: '1fr significa una fracción del espacio disponible.', cierto: true, porque: 'Cierto: por eso las columnas en fr se estiran y encogen con la pantalla.' },
        { texto: 'gap en grid separa solo las columnas, no las filas.', cierto: false, porque: 'Falso: un solo gap separa filas Y columnas (y puedes afinar con row-gap y column-gap).' },
        { texto: 'Un grid de fichas donde cada ficha usa flexbox por dentro es una combinación normal.', cierto: true, porque: 'Cierto: se combinan constantemente. Grid para la rejilla, flexbox para el interior.' },
      ],
    }),

    {
      id: '7-5',
      titulo: 'Que quepa en un móvil',
      enunciado:
        'Añade al final del style una <code>@media (max-width: 40rem)</code> que dentro cambie <code>.catalogo</code> a una sola columna: <code>grid-template-columns: 1fr</code>. Estrecha la ventana de la vista previa para verlo actuar.',
      pista: 'La @media envuelve reglas normales: <code>@media (max-width: 40rem) { .catalogo { grid-template-columns: 1fr; } }</code>.',
      comprobar: comprobarVue({
        estilo: [
          enMedia('.catalogo', 'grid-template-columns', {
            condicion: /max-width/i,
            falta: 'Todavía no hay una @media con max-width que toque a .catalogo.',
          }),
        ],
        exito: 'Pantalla ancha: tres columnas. Estrecha: una. La misma página se adapta, y eso es el responsive.',
      }),
    },

    completar({
      id: '7-6',
      titulo: 'La rejilla que se adapta sola',
      enunciado: 'Completa la fórmula pro: tantas columnas como quepan, de mínimo 14rem cada una.',
      pista: 'Las dos palabras clave: la que rellena con columnas automáticas y la que define mínimo-máximo.',
      plantilla: `.catalogo {
  display: grid;
  grid-template-columns: repeat(___-fill, ___(14rem, 1fr));
}`,
      huecos: [
        { respuestas: ['auto'], porque: 'auto-fill mete tantas columnas como quepan en el ancho.' },
        { respuestas: ['minmax'], porque: 'minmax(14rem, 1fr) dice: mínimo 14rem, máximo una fracción. La pareja hace el responsive sin @media.' },
      ],
    }),

    emparejar({
      id: '7-7',
      titulo: 'Herramienta para cada trabajo',
      enunciado: 'Une cada parte de una web con la herramienta que la coloca mejor.',
      pista: 'Una dirección → flexbox. Dos dimensiones → grid.',
      pares: [
        { izquierda: 'cabecera con logo y menú', derecha: 'flexbox' },
        { izquierda: 'catálogo de tarjetas', derecha: 'grid', porque: 'Filas Y columnas a la vez: dos dimensiones, grid.' },
        { izquierda: 'fila de precio y botón', derecha: 'flexbox (otra vez)' },
        { izquierda: 'galería de fotos', derecha: 'grid (otra vez)' },
      ],
      porque: 'Con ese criterio (¿una dirección o dos?) eliges bien en el 95% de los casos. El otro 5% da igual: los dos funcionan.',
    }),

    {
      id: '7-8',
      titulo: 'Más catálogo',
      enunciado:
        'Un catálogo de cuatro se queda corto. Añade al menos <strong>dos fichas más</strong> (seis en total), cada una con su <code>&lt;h2&gt;</code> y su <code>&lt;p&gt;</code>. Mira cómo la rejilla las coloca sin que toques el CSS.',
      pista: 'Copia un <code>&lt;article class="ficha"&gt;</code> y cámbiale el contenido. El grid hace el resto.',
      comprobar: comprobarVue({
        template: [
          hay('article', { minimo: 6, pocos: (n) => `Van ${n} fichas de 6. Duplica alguna y cámbiale el texto.` }),
          hay('article h2', { conTexto: true, falta: 'Cada ficha necesita su <h2>.' }),
        ],
        exito: 'Seis fichas y ni una línea nueva de CSS: la plantilla de columnas absorbe lo que le eches. Así escala una rejilla bien hecha.',
      }),
    },

    {
      id: '7-9',
      titulo: 'El layout completo',
      sintesis: true,
      enunciado:
        'Sin pistas. La página final del Acto II: <code>.catalogo</code> con <code>display: grid</code>, columnas con <code>fr</code>, <code>gap</code>, al menos <strong>seis</strong> fichas, y una <code>@media</code> de <code>max-width</code> que baje las columnas en pantallas estrechas. Todo a la vez, todo tuyo.',
      comprobar: comprobarVue({
        template: [hay('article', { minimo: 6, pocos: (n) => `Van ${n} fichas de 6.` })],
        estilo: [
          declara('.catalogo', 'display', { patron: /grid/, falta: 'A .catalogo le falta display: grid.' }),
          declara('.catalogo', 'grid-template-columns', { patron: /fr|auto-fill|auto-fit/, falta: 'Faltan las columnas (con fr) en grid-template-columns.' }),
          declara('.catalogo', 'gap', { patron: /\S/, falta: 'A .catalogo le falta el gap.' }),
          enMedia('.catalogo', 'grid-template-columns', {
            condicion: /max-width/i,
            falta: 'Falta la @media (max-width: …) que adapte la rejilla.',
          }),
        ],
        exito:
          'Rejilla adaptable, con aire, llena de fichas. Con esto cierras el Acto II: sabes estructurar (HTML), vestir (CSS) y colocar (flexbox y grid). Lo que viene ahora es lo que hace a Vue especial: los datos.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Míralo: un catálogo de verdad, en rejilla, que se adapta al tamaño de lo que sea que lo mire. Hasta aquí, todo era decorar. ' +
      'Lo del próximo acto es distinto: la página va a empezar a PENSAR. Datos, botones que hacen cosas… ahí es donde Vue se gana el sueldo.',
  },
}
