// Mundo 18 (Vue) — Slots: el hueco del componente.
//
// Cierra el Acto IV. Un componente Tarjeta genérico con <slot>: el padre le
// mete dentro lo que quiera. Slots con nombre para cabecera y pie. Con props,
// emits y slots, la caja de herramientas de componentes está completa.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'
</script>

<template>
  <main>
    <h1>El Sombrero</h1>

    <section class="avisos">
      <div class="caja">
        <p>Envíos gratis a partir de 50 €.</p>
      </div>
      <div class="caja">
        <p>Devoluciones sin preguntas. Bueno, una: ¿por qué?</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.avisos {
  display: grid;
  gap: 1rem;
}

.caja {
  background: #f7f1e6;
  padding: 1rem 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
`

export default {
  numero: 18,
  acto: 'Componentes que hablan',
  titulo: 'Mundo 18 · El hueco: slots',

  entradilla: {
    quien: 'wayne',
    texto:
      'Mira esas dos cajas del template: el mismo borde, el mismo fondo, copiados. Podrías hacer un componente Caja… ' +
      'pero ¿cómo le dices lo que va DENTRO, si cada caja lleva una cosa distinta? ¿Cuarenta props? No: un hueco. ' +
      'Se llama slot, y es la pieza que le falta a tu caja de herramientas.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'
import Tarjeta from './components/Tarjeta.vue'
</script>

<template>
  <main>
    <h1>El Sombrero</h1>

    <section class="avisos">
      <Tarjeta>
        <template #titulo>Envíos</template>
        <p>Envíos gratis a partir de 50 €.</p>
      </Tarjeta>

      <Tarjeta>
        <template #titulo>Devoluciones</template>
        <p>Devoluciones sin preguntas. Bueno, una: ¿por qué?</p>
        <strong>Sin letra pequeña.</strong>
      </Tarjeta>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.avisos {
  display: grid;
  gap: 1rem;
}
</style>
`,
    'src/components/Tarjeta.vue': `<script setup>
</script>

<template>
  <div class="caja">
    <h3 class="titulo"><slot name="titulo">Aviso</slot></h3>
    <slot></slot>
  </div>
</template>

<style scoped>
.caja {
  background: #f7f1e6;
  padding: 1rem 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}

.titulo {
  margin: 0 0 0.4rem;
  color: #6b4a2b;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Slots: contenido que decide el padre',
    cuerpo: `Las props pasan DATOS (un objeto, un número). Pero a veces lo que quieres pasar es **contenido**: un párrafo, dos, un párrafo con negritas, lo que sea. Para eso el componente deja un hueco:

**El hueco básico.** En el hijo (\`Tarjeta.vue\`):

\`\`\`
<template>
  <div class="caja">
    <slot></slot>
  </div>
</template>
\`\`\`

Ese \`<slot></slot>\` significa: "aquí va lo que el padre escriba dentro de mi etiqueta". Y el padre, al usarlo:

\`\`\`
<Tarjeta>
  <p>Envíos gratis a partir de 50 €.</p>
</Tarjeta>
\`\`\`

Fíjate en que la etiqueta ya no se auto-cierra: se abre, se rellena y se cierra, como un \`<div>\`. Todo lo de dentro viaja al hueco del hijo. La tarjeta pone el marco (borde, fondo, padding, en SU style scoped); el padre pone el cuadro. Cada tarjeta, un contenido distinto, sin una sola prop.

**¿Prop o slot? La regla práctica:** si es un dato simple que el hijo formatea (un precio, un nombre), prop. Si es contenido libre con su propia estructura (párrafos, negritas, lo que surja), slot. La FichaSombrero usa props porque ELLA decide cómo pintar el sombrero; la Tarjeta usa slot porque el padre decide qué va dentro.

**Slots con nombre: más de un hueco.** Una tarjeta con zona de título y zona de cuerpo:

\`\`\`
<h3 class="titulo"><slot name="titulo">Aviso</slot></h3>
<slot></slot>
\`\`\`

El hijo pone dos huecos: uno bautizado (\`name="titulo"\`) y el hueco por defecto. ¿Y ese "Aviso" escrito dentro del slot? Es el **contenido de reserva**: lo que se pinta si el padre no manda nada para ese hueco. Los valores por defecto, versión slot.

El padre rellena el hueco con nombre usando \`<template #nombre>\`:

\`\`\`
<Tarjeta>
  <template #titulo>Envíos</template>
  <p>Envíos gratis a partir de 50 €.</p>
</Tarjeta>
\`\`\`

La almohadilla \`#titulo\` es la abreviatura de \`v-slot:titulo\`. Lo que va en ese \`<template>\` aterriza en el hueco bautizado; el resto, en el hueco por defecto. (Este \`<template>\` interior es una etiqueta agrupadora invisible, no confundir con el bloque \`<template>\` del fichero.)

**Con esto, el acto queda completo.** Tres canales entre componentes: **props** (datos que bajan), **emits** (avisos que suben) y **slots** (contenido que el padre inyecta). Casi cualquier componente que veas en cualquier proyecto Vue —botones, modales, tablas, menús— es una combinación de esos tres. Ya tienes el juego entero de piezas; lo que sigue es construir en grande: pantallas.`,
  },

  pasos: [
    {
      id: '18-1',
      titulo: 'La Tarjeta con hueco',
      enunciado:
        'Crea <code>src/components/Tarjeta.vue</code>: un <code>&lt;div class="caja"&gt;</code> con un <code>&lt;slot&gt;&lt;/slot&gt;</code> dentro, y llévate al <code>&lt;style scoped&gt;</code> la regla <code>.caja</code> del padre (el marco viaja con la tarjeta).',
      pista: 'Fichero nuevo desde el árbol. El slot es literal: <code>&lt;slot&gt;&lt;/slot&gt;</code>, ahí caerá lo que mande el padre.',
      comprobar: comprobarVue({
        fichero: 'src/components/Tarjeta.vue',
        template: [
          (_doc, ficheros) =>
            ficheros?.['src/components/Tarjeta.vue'] === undefined
              ? 'Todavía no existe src/components/Tarjeta.vue.'
              : null,
          plantillaContiene(/<slot\s*><\/slot>|<slot\s*\/>/, 'Al template de Tarjeta le falta el <slot></slot>.'),
          plantillaContiene(/class\s*=\s*["']caja["']/, 'La Tarjeta necesita su <div class="caja">.'),
        ],
        estilo: [
          (reglas) =>
            reglas.some((r) => /\.caja/.test(r.selector))
              ? null
              : 'Múdale la regla .caja al style scoped de la Tarjeta.',
        ],
        exito: 'Una tarjeta con marco propio y un hueco esperando. El cuadro lo pondrá quien la use.',
      }),
    },

    {
      id: '18-2',
      titulo: 'Rellena el hueco',
      enunciado:
        'En <code>App.vue</code>: importa <code>Tarjeta</code>, y sustituye las dos <code>&lt;div class="caja"&gt;</code> por <code>&lt;Tarjeta&gt;…&lt;/Tarjeta&gt;</code> con su párrafo dentro de cada una.',
      pista: 'La etiqueta se abre y se cierra: <code>&lt;Tarjeta&gt;&lt;p&gt;Envíos gratis…&lt;/p&gt;&lt;/Tarjeta&gt;</code>. Lo de dentro viaja al slot.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /import\s+Tarjeta\s+from\s+['"]\.\/components\/Tarjeta\.vue['"]/.test(script)
              ? null
              : 'A App.vue le falta el import de Tarjeta.',
        ],
        template: [
          plantillaContiene(/<Tarjeta[\s>]/, 'App.vue aún no usa <Tarjeta>.'),
          (_doc, _f, partido) => {
            const cuantas = (String(partido?.template || '').match(/<Tarjeta[\s>]/g) || []).length
            return cuantas < 2 ? `Hay ${cuantas} <Tarjeta> y hacen falta 2 (una por aviso).` : null
          },
          plantillaContiene(/<Tarjeta[\s>][\s\S]*?<p/, 'Cada Tarjeta lleva su contenido dentro: un <p> como mínimo.'),
        ],
        exito: 'Dos tarjetas, mismo marco, contenidos distintos, y ni una prop. El hueco hace el trabajo.',
      }),
    },

    eleccion({
      id: '18-3',
      titulo: '¿Prop o slot?',
      enunciado: 'Vas a hacer un componente <code>BotonGordo</code> reutilizable, y quieres decidir cómo recibe su texto. ¿Prop o slot?',
      pista: '¿El texto de un botón es un dato simple o contenido con estructura?',
      opciones: [
        {
          texto: 'Slot: <BotonGordo>Guardar</BotonGordo> se lee como HTML de toda la vida, y admite hasta un icono dentro.',
          correcta: true,
          porque: 'Es la convención: el contenido visible de un botón va por slot, como en <button>. Y si mañana quieres icono + texto, cabe sin cambiar nada.',
        },
        {
          texto: 'Prop: <BotonGordo :texto="\'Guardar\'" /> es más explícito.',
          porque: 'Funciona, pero es incómodo: para contenido visible y libre, el slot se lee mejor y es más flexible. Las props, para datos que el componente procesa.',
        },
        {
          texto: 'Ninguna: el texto se escribe fijo dentro del componente.',
          porque: 'Entonces todos tus botones dirían lo mismo, y adiós reutilización.',
        },
      ],
    }),

    {
      id: '18-4',
      titulo: 'El hueco con nombre',
      enunciado:
        'Dale a la Tarjeta una zona de título: en su template, encima del slot por defecto, <code>&lt;h3 class="titulo"&gt;&lt;slot name="titulo"&gt;Aviso&lt;/slot&gt;&lt;/h3&gt;</code>. Ese «Aviso» de dentro es el texto de reserva.',
      pista: 'Dos slots conviven: el bautizado (name="titulo") y el de siempre. El contenido de reserva va dentro del slot.',
      comprobar: comprobarVue({
        fichero: 'src/components/Tarjeta.vue',
        template: [
          plantillaContiene(/<slot\s+name\s*=\s*["']titulo["']\s*>/, 'Falta el <slot name="titulo"> en la Tarjeta.'),
          plantillaContiene(/<slot\s+name\s*=\s*["']titulo["']\s*>\s*\S/, 'Ponle contenido de reserva dentro del slot (por ejemplo, «Aviso»).'),
        ],
        exito: 'Dos huecos: título y cuerpo. Y si el padre no manda título, la reserva responde. Componente a prueba de olvidos.',
      }),
    },

    {
      id: '18-5',
      titulo: 'Rellenar el hueco bautizado',
      enunciado:
        'En <code>App.vue</code>, dale título a cada tarjeta con <code>&lt;template #titulo&gt;Envíos&lt;/template&gt;</code> (y el que quieras en la otra). El resto del contenido se queda como está: cae al hueco por defecto.',
      pista: 'El template interior con la almohadilla: <code>&lt;template #titulo&gt;…&lt;/template&gt;</code>, dentro de la Tarjeta.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/<template\s+#titulo\s*>|<template\s+v-slot:titulo\s*>/, 'Falta el <template #titulo> dentro de alguna Tarjeta.'),
        ],
        exito: 'Cada trozo a su hueco: el título al bautizado, el cuerpo al de por defecto. Así se hacen los componentes de verdad flexibles.',
      }),
    },

    verdaderoFalso({
      id: '18-6',
      titulo: 'Cierto o falso: slots',
      enunciado: 'Cinco frases sobre huecos. Todas.',
      pista: 'Quién pone el marco, quién el cuadro, y qué pasa si nadie manda nada.',
      afirmaciones: [
        { texto: 'Lo que el padre escribe entre <Tarjeta> y </Tarjeta> aterriza en el <slot> del hijo.', cierto: true, porque: 'Cierto: esa es la mecánica entera del slot por defecto.' },
        { texto: 'Un componente solo puede tener un slot.', cierto: false, porque: 'Falso: con name="…" puede tener varios; el padre los rellena con <template #nombre>.' },
        { texto: 'El contenido escrito dentro del <slot> del hijo es la reserva si el padre no manda nada.', cierto: true, porque: 'Cierto: es el valor por defecto de los huecos.' },
        { texto: 'Los slots sustituyen a las props: ya no hacen falta.', cierto: false, porque: 'Falso: conviven. Datos que el hijo procesa → props. Contenido libre → slots. Cada canal a lo suyo.' },
        { texto: 'El estilo del marco (borde, fondo) va en el style scoped del componente Tarjeta.', cierto: true, porque: 'Cierto: el marco es identidad de la tarjeta y viaja con ella a donde se use.' },
      ],
    }),

    completar({
      id: '18-7',
      titulo: 'Los tres canales',
      enunciado: 'El resumen del acto: completa el canal de cada necesidad.',
      pista: 'Bajan datos, suben avisos, se inyecta contenido.',
      plantilla: `pasar un dato al hijo        → ___
avisar de algo al padre      → ___
meter contenido libre dentro → ___`,
      huecos: [
        { respuestas: ['props', 'prop'], porque: 'Los datos bajan por props, declaradas con defineProps.' },
        { respuestas: ['emits', 'emit', 'eventos'], porque: 'Los avisos suben por eventos, declarados con defineEmits.' },
        { respuestas: ['slots', 'slot'], porque: 'El contenido libre entra por el hueco: el slot.' },
      ],
    }),

    emparejar({
      id: '18-8',
      titulo: 'Sintaxis de huecos',
      enunciado: 'Une cada trozo de sintaxis con lo que hace.',
      pista: 'Hueco, hueco bautizado, relleno, reserva.',
      pares: [
        { izquierda: '<slot></slot>', derecha: 'el hueco por defecto del hijo' },
        { izquierda: '<slot name="titulo">', derecha: 'un hueco bautizado' },
        { izquierda: '<template #titulo>', derecha: 'el relleno del padre para ese hueco', porque: 'La almohadilla es la abreviatura de v-slot:titulo.' },
        { izquierda: 'texto dentro del <slot>', derecha: 'la reserva si el padre no manda nada' },
      ],
      porque: 'Hueco, nombre, relleno y reserva: las cuatro piezas de los slots. Con ellas, un componente sirve en sitios que aún no imaginas.',
    }),

    {
      id: '18-9',
      titulo: 'La Tarjeta universal',
      sintesis: true,
      enunciado:
        'Sin pistas. La Tarjeta terminada: su <code>&lt;slot name="titulo"&gt;</code> con reserva y su <code>&lt;slot&gt;</code> por defecto, la regla <code>.caja</code> en su scoped; y en App.vue, <strong>dos</strong> <code>&lt;Tarjeta&gt;</code> como mínimo, al menos una con <code>&lt;template #titulo&gt;</code> y las dos con contenido en el cuerpo.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/components/Tarjeta.vue', /<slot\s+name\s*=\s*["']titulo["']\s*>\s*\S/, 'La Tarjeta necesita su slot titulo con reserva.'),
          ficheroContiene('src/components/Tarjeta.vue', /<slot\s*><\/slot>|<slot\s*\/>/, 'La Tarjeta necesita su slot por defecto.'),
          ficheroContiene('src/components/Tarjeta.vue', /\.caja\s*\{/, 'La regla .caja va en el scoped de la Tarjeta.'),
          (_doc, _f, partido) => {
            const cuantas = (String(partido?.template || '').match(/<Tarjeta[\s>]/g) || []).length
            return cuantas < 2 ? `Hacen falta 2 Tarjetas y hay ${cuantas}.` : null
          },
          plantillaContiene(/<template\s+#titulo\s*>|<template\s+v-slot:titulo\s*>/, 'Al menos una Tarjeta con su <template #titulo>.'),
        ],
        exito:
          'Marco del hijo, cuadro del padre, huecos con nombre y reserva. Props, emits y slots: la caja de herramientas de componentes, completa. El Acto IV es tuyo, y con él, la mitad del oficio de Vue.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Acto cerrado. Repasa tu arsenal: componentes con fichero propio, props vigiladas, eventos con carga, huecos con nombre. ' +
      'Con esas piezas se construye cualquier interfaz por grande que sea. Lo que no tienes todavía son pantallas: tu app es UNA página. El router llega en el próximo acto, y con él, las views.',
  },
}
