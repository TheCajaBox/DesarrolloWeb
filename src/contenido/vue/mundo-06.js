// Mundo 6 (Vue) — Flexbox: colocar cosas en fila.
//
// Tercer mundo del Acto II. Hasta ahora las cajas se apilan solas, una debajo
// de otra. Flexbox es la herramienta para ponerlas en fila, repartir el
// espacio, alinear y separar. Se aprende con el caso que más se repite en el
// mundo real: una cabecera con el título a un lado y el menú al otro, y la
// fila de precio dentro de la ficha.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, declara, declaraAlguna, hayRegla } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { buscarTodos } from '../../motor/leer-html.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <header class="cabecera">
    <h1>El Sombrero</h1>
    <nav>
      <a href="#catalogo">Catálogo</a>
      <a href="#contacto">Contacto</a>
    </nav>
  </header>

  <main>
    <article class="ficha">
      <h2>Bombín de fieltro</h2>
      <p>Serio por fuera, blando por dentro.</p>
      <div class="pie">
        <span class="precio">42 €</span>
        <button>Lo quiero</button>
      </div>
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
}
</style>
`

function tieneClase(nombre, mensaje) {
  return (doc) => {
    const puesto = buscarTodos(doc, '*').some((n) =>
      (n.getAttribute('class') || '').split(/\s+/).includes(nombre),
    )
    return puesto ? null : mensaje
  }
}

export default {
  numero: 6,
  acto: 'Que se vea',
  titulo: 'Mundo 6 · Flexbox: cosas en fila',

  entradilla: {
    quien: 'wayne',
    texto:
      'Habrás notado que todo se apila en columna, quieras o no. Hoy aprendes la palabra mágica para ponerlo en fila: ' +
      'display flex. Con eso y dos propiedades más colocas la cabecera de cualquier web del mundo. Literalmente cualquiera: míralas, todas la llevan.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <header class="cabecera">
    <h1>El Sombrero</h1>
    <nav class="menu">
      <a href="#catalogo">Catálogo</a>
      <a href="#contacto">Contacto</a>
    </nav>
  </header>

  <main>
    <article class="ficha">
      <h2>Bombín de fieltro</h2>
      <p>Serio por fuera, blando por dentro.</p>
      <div class="pie">
        <span class="precio">42 €</span>
        <button>Lo quiero</button>
      </div>
    </article>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid #d8c9ad;
}

.menu {
  display: flex;
  gap: 1rem;
}

.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}

.pie {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Flexbox, o cómo dejar de pelear con las cajas',
    cuerpo: `Por defecto, las cajas de bloque se apilan en columna, una debajo de otra. Durante años, ponerlas en fila fue una guerra de trucos. Flexbox la terminó. Funciona así:

**Se activa en el padre.** Escribes \`display: flex\` en el **contenedor**, y sus hijos directos pasan a colocarse **en fila**. Esta es la idea que hay que grabarse: flexbox se declara en el padre y ordena a los hijos. Si algo no se coloca, casi siempre es porque estás mirando al hijo cuando la propiedad va en el padre.

**Tres propiedades hacen el 90% del trabajo:**

**\`justify-content\` reparte a lo largo de la fila** (el eje principal). Sus valores útiles: \`flex-start\` (todo al principio, es lo normal), \`center\` (todo al centro), \`space-between\` (el primero al principio, el último al final, el hueco en medio). Ese último es el rey de las cabeceras: logo a un lado, menú al otro, sin calcular nada.

**\`align-items\` alinea en el eje cruzado** (perpendicular a la fila). Si tus hijos tienen alturas distintas —un título grande y unos enlaces pequeños—, \`align-items: center\` los centra verticalmente entre sí. Es la respuesta a "¿por qué el menú sale pegado arriba?".

**\`gap\` pone espacio ENTRE los hijos.** \`gap: 1rem\` separa cada hijo del siguiente, sin margins que se acumulen ni huecos sobrantes en los extremos. Antes de \`gap\`, esto se hacía con margins y era feo; ahora es una línea.

**El eje se puede girar.** \`flex-direction: row\` es el valor por defecto (fila); \`flex-direction: column\` apila en columna pero manteniendo los superpoderes de reparto y alineado. Ojo: al girar, \`justify-content\` pasa a repartir en vertical y \`align-items\` en horizontal. Los ejes giran con la dirección.

**¿Y si no caben?** Por defecto flexbox aprieta a los hijos para que quepan en una línea. Con \`flex-wrap: wrap\`, los que no caben saltan a la línea siguiente. Es el ingrediente barato para que una fila de tarjetas se adapte a pantallas estrechas.

**Cuándo usar flexbox:** cuando quieres colocar cosas **en una dirección** (una fila O una columna): cabeceras, menús, la fila de precio y botón, un pie con iconos. Para rejillas de dos dimensiones (filas Y columnas a la vez) existe Grid, y es el siguiente mundo. La pareja flexbox+grid cubre prácticamente todo el layout moderno.`,
  },

  pasos: [
    {
      id: '6-1',
      titulo: 'La cabecera, en fila',
      enunciado:
        'La cabecera tiene el título y el menú apilados. Crea la regla <code>.cabecera</code> con <code>display: flex</code> y mira cómo se ponen en fila.',
      pista: 'Una regla nueva: <code>.cabecera { display: flex; }</code>. La clase ya está puesta en el header.',
      comprobar: comprobarVue({
        estilo: [
          hayRegla('.cabecera', { falta: 'Todavía no hay regla para .cabecera.' }),
          declara('.cabecera', 'display', {
            patron: /flex/,
            falta: 'A .cabecera le falta display.',
            malo: 'El display tiene otro valor; para poner en fila hace falta display: flex.',
          }),
        ],
        exito: 'En fila. Una línea de CSS en el PADRE y los hijos se colocan. Así funciona flexbox.',
      }),
    },

    eleccion({
      id: '6-2',
      titulo: 'Dónde se declara flex',
      enunciado: 'Quieres que los enlaces del <code>&lt;nav&gt;</code> se pongan en fila con espacio entre ellos. ¿Dónde va el <code>display: flex</code>?',
      pista: 'Flexbox ordena a los hijos, pero se declara en…',
      opciones: [
        {
          texto: 'En el <nav>, que es el padre de los enlaces.',
          correcta: true,
          porque: 'Eso es. Flexbox se activa en el contenedor y coloca a sus hijos directos. El padre manda.',
        },
        {
          texto: 'En cada <a>, que son los que se tienen que mover.',
          porque: 'Es lo intuitivo, pero no: los hijos no se colocan a sí mismos. El display: flex va en el padre que los contiene.',
        },
        {
          texto: 'En el <body>, para que afecte a toda la página.',
          porque: 'Pondría en fila a los hijos directos del body, que no es lo que buscas: quieres la fila DENTRO del nav.',
        },
      ],
    }),

    {
      id: '6-3',
      titulo: 'Título a un lado, menú al otro',
      enunciado:
        'Añade a <code>.cabecera</code> las dos compañeras de siempre: <code>justify-content: space-between</code> (extremos opuestos) y <code>align-items: center</code> (centrados en vertical).',
      pista: 'Las dos van dentro de la regla .cabecera que ya tienes. space-between empuja el primero y el último a los extremos.',
      comprobar: comprobarVue({
        estilo: [
          declara('.cabecera', 'justify-content', {
            patron: /space-between/,
            falta: 'Falta justify-content en .cabecera.',
            malo: 'Para título a un lado y menú al otro, el valor es space-between.',
          }),
          declara('.cabecera', 'align-items', {
            patron: /center/,
            falta: 'Falta align-items en .cabecera.',
            malo: 'Para centrarlos en vertical entre sí, align-items: center.',
          }),
        ],
        exito: 'Esa es LA cabecera: título a la izquierda, menú a la derecha, todo centrado. La llevan todas las webs que conoces.',
      }),
    },

    {
      id: '6-4',
      titulo: 'Espacio entre enlaces',
      enunciado:
        'Ponle <code>class="menu"</code> al <code>&lt;nav&gt;</code> y crea la regla <code>.menu</code> con <code>display: flex</code> y un <code>gap</code> para separar los enlaces.',
      pista: 'En el template: <code>&lt;nav class="menu"&gt;</code>. En el style: <code>.menu { display: flex; gap: 1rem; }</code>.',
      comprobar: comprobarVue({
        template: [tieneClase('menu', 'El <nav> aún no lleva class="menu".')],
        estilo: [
          declara('.menu', 'display', { patron: /flex/, falta: 'A .menu le falta display: flex.' }),
          declara('.menu', 'gap', { patron: /\S/, falta: 'A .menu le falta el gap que separa los enlaces.' }),
        ],
        exito: 'gap: espacio entre hijos, sin margins acumulados ni huecos en los extremos. Una de las mejores incorporaciones del CSS moderno.',
      }),
    },

    verdaderoFalso({
      id: '6-5',
      titulo: 'Cierto o falso: flexbox',
      enunciado: 'Cinco frases sobre flexbox. Todas.',
      pista: 'La clave está en padre/hijos y en qué eje toca cada propiedad.',
      afirmaciones: [
        { texto: 'display: flex se escribe en el contenedor, no en los hijos.', cierto: true, porque: 'Cierto: el padre declara, los hijos se colocan.' },
        { texto: 'justify-content: space-between deja el hueco en los extremos y junta a los hijos en el centro.', cierto: false, porque: 'Falso, es al revés: extremos ocupados y hueco EN MEDIO. Para hueco en los extremos existe space-around.' },
        { texto: 'align-items alinea a los hijos en el eje cruzado (perpendicular a la fila).', cierto: true, porque: 'Cierto: en una fila, align-items trabaja en vertical.' },
        { texto: 'gap solo funciona en Grid, no en flexbox.', cierto: false, porque: 'Falso: gap funciona en los dos, y en flexbox es la forma limpia de separar hijos.' },
        { texto: 'Con flex-direction: column, justify-content pasa a repartir en vertical.', cierto: true, porque: 'Cierto: los ejes giran con la dirección. justify siempre sigue al eje principal.' },
      ],
    }),

    completar({
      id: '6-6',
      titulo: 'La cabecera de memoria',
      enunciado: 'Completa la receta de cabecera que acabas de usar (solo los valores).',
      pista: 'Activar, repartir a los extremos, centrar en vertical.',
      plantilla: `.cabecera {
  display: ___;
  justify-content: ___;
  align-items: ___;
}`,
      huecos: [
        { respuestas: ['flex'], porque: 'display: flex activa el modo fila en el contenedor.' },
        { respuestas: ['space-between'], porque: 'space-between manda el primero y el último a los extremos.' },
        { respuestas: ['center'], porque: 'align-items: center los alinea en vertical entre sí.' },
      ],
    }),

    {
      id: '6-7',
      titulo: 'El pie de la ficha',
      enunciado:
        'Dentro de la ficha hay un <code>&lt;div class="pie"&gt;</code> con el precio y el botón apilados. Crea la regla <code>.pie</code> para ponerlos en fila: precio a un lado, botón al otro, centrados en vertical.',
      pista: 'Es la misma receta de la cabecera: flex + space-between + center. Las recetas buenas se repiten.',
      comprobar: comprobarVue({
        estilo: [
          declara('.pie', 'display', { patron: /flex/, falta: 'A .pie le falta display: flex.' }),
          declara('.pie', 'justify-content', { patron: /space-between|flex-end|space-around/, falta: 'A .pie le falta justify-content para repartir precio y botón.' }),
          declara('.pie', 'align-items', { patron: /center/, falta: 'A .pie le falta align-items: center.' }),
        ],
        exito: 'Precio a la izquierda, botón a la derecha, alineados. La misma receta sirve dentro de una tarjeta que en una cabecera: eso es tener herramientas.',
      }),
    },

    emparejar({
      id: '6-8',
      titulo: 'Cada propiedad, su eje',
      enunciado: 'Une cada propiedad de flexbox con lo que hace.',
      pista: 'Una activa, una reparte, una alinea, una separa.',
      pares: [
        { izquierda: 'display: flex', derecha: 'activa la fila en el contenedor' },
        { izquierda: 'justify-content', derecha: 'reparte el espacio a lo largo del eje principal' },
        { izquierda: 'align-items', derecha: 'alinea en el eje cruzado', porque: 'align-items trabaja perpendicular a la fila: en una fila normal, en vertical.' },
        { izquierda: 'gap', derecha: 'separa a los hijos entre sí' },
      ],
      porque: 'Cuatro propiedades y tienes el layout en una dirección resuelto. El resto de flexbox son refinamientos de estas.',
    }),

    ordenar({
      id: '6-9',
      titulo: 'Depurar una fila que no sale',
      enunciado: 'El menú no se pone en fila. Ordena los pasos de comprobación, del primero al último, como los haría alguien con oficio.',
      pista: 'Primero lo que activa, luego dónde está puesto, luego los detalles.',
      lineas: [
        'Mirar si el contenedor tiene display: flex',
        'Confirmar que la regla apunta al PADRE de lo que quieres mover',
        'Revisar justify-content y align-items',
        'Ajustar gap o wrap si hace falta',
      ],
      porque: 'Ese es el orden que ahorra tiempo: sin display: flex en el padre correcto, lo demás no existe. Actívalo, apunta bien, y luego afina.',
    }),

    {
      id: '6-10',
      titulo: 'Layout de una dirección, completo',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja las tres filas funcionando a la vez: <code>.cabecera</code> con flex + space-between + align-items center, <code>.menu</code> con flex + gap, y <code>.pie</code> con flex + space-between + align-items center. La página entera colocada con flexbox.',
      comprobar: comprobarVue({
        estilo: [
          declara('.cabecera', 'display', { patron: /flex/, falta: 'A .cabecera le falta display: flex.' }),
          declara('.cabecera', 'justify-content', { patron: /space-between/, falta: 'A .cabecera le falta justify-content: space-between.' }),
          declara('.cabecera', 'align-items', { patron: /center/, falta: 'A .cabecera le falta align-items: center.' }),
          declara('.menu', 'display', { patron: /flex/, falta: 'A .menu le falta display: flex.' }),
          declara('.menu', 'gap', { patron: /\S/, falta: 'A .menu le falta el gap.' }),
          declara('.pie', 'display', { patron: /flex/, falta: 'A .pie le falta display: flex.' }),
          declara('.pie', 'justify-content', { patron: /space-between|flex-end|space-around/, falta: 'A .pie le falta justify-content.' }),
          declara('.pie', 'align-items', { patron: /center/, falta: 'A .pie le falta align-items: center.' }),
        ],
        exito:
          'Cabecera, menú y pie de ficha: tres filas, cada una con su receta. Ya colocas cosas en una dirección como se hace en el oficio. Falta la rejilla, y el Acto II es tuyo.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en el patrón que se repite: activas en el padre, repartes con justify, alineas con align, separas con gap. ' +
      'Cuatro decisiones. Con ellas has montado la cabecera que llevan todas las webs serias. El mundo que viene añade la segunda dimensión.',
  },
}
