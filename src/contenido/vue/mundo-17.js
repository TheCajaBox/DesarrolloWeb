// Mundo 17 (Vue) — Emits: los avisos suben.
//
// Tercer mundo del Acto IV. La mitad ascendente: el hijo tiene el botón de
// favorito, pero los favoritos viven en el padre. El hijo emite (defineEmits +
// emit con dato), el padre escucha (@favorito="...") y cambia SU dato. Con
// props + emits, el círculo padre-hijo queda cerrado.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

function ficheroContiene(ruta, patron, mensaje) {
  return (_doc, ficheros) => {
    const contenido = ficheros?.[ruta]
    if (contenido === undefined) return `Falta el fichero ${ruta}.`
    return patron.test(String(contenido)) ? null : mensaje
  }
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'
import FichaSombrero from './components/FichaSombrero.vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])

const favoritos = ref([])
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>Favoritos: {{ favoritos.length }}</p>

    <section class="catalogo">
      <FichaSombrero
        v-for="sombrero in sombreros"
        :key="sombrero.id"
        :sombrero="sombrero"
      />
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
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}
</style>
`

const FICHA_SEMBRADA = `<script setup>
const props = defineProps({
  sombrero: { type: Object, required: true },
})
</script>

<template>
  <article class="ficha">
    <h2>{{ sombrero.nombre }}</h2>
    <p>{{ sombrero.precio }} €</p>
    <button>☆ Favorito</button>
  </article>
</template>

<style scoped>
.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
`

export default {
  numero: 17,
  acto: 'Componentes que hablan',
  titulo: 'Mundo 17 · Los avisos suben: emits',

  entradilla: {
    quien: 'wayne',
    texto:
      'Situación: el botón de favorito está en el hijo, pero la lista de favoritos vive en el padre. Y el hijo tiene prohibido ' +
      'tocar datos ajenos, que para eso pusimos la norma. ¿Solución? La de toda familia funcional: el hijo AVISA y el padre decide. ' +
      'A eso se le llama emitir, y es la otra mitad del teléfono.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/components/FichaSombrero.vue': FICHA_SEMBRADA,
  },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'
import FichaSombrero from './components/FichaSombrero.vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])

const favoritos = ref([])

function alternarFavorito(id) {
  if (favoritos.value.includes(id)) {
    favoritos.value = favoritos.value.filter((f) => f !== id)
  } else {
    favoritos.value.push(id)
  }
}
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>Favoritos: {{ favoritos.length }}</p>

    <section class="catalogo">
      <FichaSombrero
        v-for="sombrero in sombreros"
        :key="sombrero.id"
        :sombrero="sombrero"
        :favorito="favoritos.includes(sombrero.id)"
        @favorito="alternarFavorito"
      />
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
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}
</style>
`,
    'src/components/FichaSombrero.vue': `<script setup>
const props = defineProps({
  sombrero: { type: Object, required: true },
  favorito: { type: Boolean, default: false },
})

const emit = defineEmits(['favorito'])

function avisar() {
  emit('favorito', props.sombrero.id)
}
</script>

<template>
  <article class="ficha">
    <h2>{{ sombrero.nombre }}</h2>
    <p>{{ sombrero.precio }} €</p>
    <button @click="avisar">{{ favorito ? '★ Favorito' : '☆ Marcar' }}</button>
  </article>
</template>

<style scoped>
.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Emits: avisar hacia arriba',
    cuerpo: `Regla de la casa, del mundo pasado: el hijo no toca datos del padre. Pero el botón está en el hijo y el dato en el padre. La solución de Vue es un **evento personalizado**: el hijo grita "¡me han pulsado, y soy el sombrero 3!", y el padre, que estaba escuchando, hace el cambio en SU dato. Tres piezas:

**1. El hijo declara qué avisos puede dar.**

\`\`\`
const emit = defineEmits(['favorito'])
\`\`\`

\`defineEmits\` es la gemela de \`defineProps\` (tampoco se importa): declara la lista de eventos que este componente puede emitir, y te devuelve la función \`emit\` para dispararlos. Igual que las props documentan qué ENTRA, los emits documentan qué SALE. Un componente bien hecho se lee entero por sus dos cabeceras.

**2. El hijo emite cuando pasa algo.**

\`\`\`
function avisar() {
  emit('favorito', props.sombrero.id)
}
\`\`\`

\`emit('favorito', dato)\` dispara el evento hacia arriba. El primer argumento es el nombre del evento; el segundo (opcional) es la **carga**: la información que el padre necesitará. Aquí, el id del sombrero pulsado —porque el padre tiene tres copias del hijo y necesita saber CUÁL le habla—. Fíjate también en \`props.sombrero.id\`: en el script del hijo, las props se leen a través del objeto \`props\`.

**3. El padre escucha con la arroba de siempre.**

\`\`\`
<FichaSombrero
  :sombrero="sombrero"
  @favorito="alternarFavorito"
/>
\`\`\`

La misma \`@\` que usas para \`@click\` en un botón escucha eventos personalizados en un componente: \`@favorito="alternarFavorito"\` significa "cuando esta copia emita 'favorito', llama a mi función". Y la carga del emit llega como argumento: \`alternarFavorito\` recibe el id automáticamente. El padre cambia su array, y como los datos bajan por props, todo lo que dependa se repinta.

**El circuito completo, que es el dibujo del acto:** el clic ocurre en el hijo → el hijo emite con el id → el padre escucha y cambia SU dato → el dato baja por props → el hijo se repinta. **Los datos bajan por props; los avisos suben por eventos.** Ese lema es la arquitectura de Vue en una frase. Cuélgalo donde lo veas.

**¿Y cómo sabe el hijo si ES favorito?** No lo sabe: lo recibe. El padre le baja otra prop, \`:favorito="favoritos.includes(sombrero.id)"\`, calculada al vuelo, y el hijo la pinta (\`★\` o \`☆\`) sin saber nada de la lista. Cada cual con lo suyo: el padre gobierna el estado, el hijo presenta y avisa. Los componentes así son tontos a propósito, y por eso se pueden reutilizar en cualquier parte.`,
  },

  pasos: [
    {
      id: '17-1',
      titulo: 'El hijo declara sus avisos',
      enunciado:
        'En el script de <code>FichaSombrero.vue</code>: <code>const emit = defineEmits([\'favorito\'])</code>.',
      pista: 'Como defineProps, sin importar. Recibe un array con los nombres de los eventos posibles.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        script: [
          (script) =>
            /const\s+emit\s*=\s*defineEmits\s*\(\s*\[\s*['"]favorito['"]\s*\]\s*\)/.test(script)
              ? null
              : "Falta const emit = defineEmits(['favorito']) en el script del hijo.",
        ],
        exito: 'Aviso declarado. El componente ya dice en su cabecera qué puede gritar hacia arriba.',
      }),
    },

    {
      id: '17-2',
      titulo: 'Emitir con carga',
      enunciado:
        'La función que avisa, en el hijo: <code>function avisar() { emit(\'favorito\', props.sombrero.id) }</code>. Y engánchala al botón: <code>@click="avisar"</code>.',
      pista: 'El segundo argumento del emit es la carga: el id, para que el padre sepa qué copia le habla. Las props en el script se leen con props.sombrero.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        script: [
          (script) =>
            /emit\s*\(\s*['"]favorito['"]\s*,\s*props\.sombrero\.id\s*\)/.test(script)
              ? null
              : "Falta el emit('favorito', props.sombrero.id) dentro de la función.",
        ],
        template: [
          plantillaContiene(/@click\s*=\s*["']avisar/, 'Al botón del hijo le falta el @click="avisar".'),
        ],
        exito: 'El hijo grita con nombre y apellido: evento «favorito», carga «id 3». Nadie escucha todavía, pero eso es cosa del padre.',
      }),
    },

    {
      id: '17-3',
      titulo: 'El padre escucha',
      enunciado:
        'En <code>App.vue</code>: la función <code>alternarFavorito(id)</code> que mete el id en <code>favoritos</code> si no está (push) y lo saca si está (filter). Y en la etiqueta del hijo, la escucha: <code>@favorito="alternarFavorito"</code>.',
      pista: 'El esqueleto: <code>if (favoritos.value.includes(id)) { favoritos.value = favoritos.value.filter((f) =&gt; f !== id) } else { favoritos.value.push(id) }</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/function\s+alternarFavorito\s*\(|const\s+alternarFavorito\s*=/, {
            falta: 'Falta la función alternarFavorito en App.vue.',
          }),
          scriptContiene(/favoritos\.value\.includes\s*\(/, { falta: 'La función necesita el includes para saber si ya es favorito.' }),
          scriptContiene(/\.filter\s*\(/, { falta: 'Para quitar un favorito, filter devolviendo los que no son ese id.' }),
          scriptContiene(/favoritos\.value\.push\s*\(/, { falta: 'Para añadirlo, el push del id.' }),
        ],
        template: [
          plantillaContiene(/@favorito\s*=\s*["']alternarFavorito/, 'A la etiqueta <FichaSombrero> le falta @favorito="alternarFavorito".'),
        ],
        exito: 'Pulsa las estrellas en la vista previa: el contador del padre sube y baja. El aviso subió, el dato cambió en su casa.',
      }),
    },

    eleccion({
      id: '17-4',
      titulo: 'Por qué no un atajo',
      enunciado: '¿Por qué el hijo no hace directamente <code>favoritos.value.push(id)</code>, si sería más corto?',
      pista: '¿De quién es el dato favoritos? ¿Y quién más podría estar cambiándolo?',
      opciones: [
        {
          texto: 'Porque favoritos es del padre: si cualquier hijo lo tocara, nadie sabría quién cambió qué.',
          correcta: true,
          porque: 'Exacto: un solo dueño por dato. Con veinte componentes escribiendo en la misma lista, depurar sería arqueología. El emit deja el cambio en manos del dueño.',
        },
        {
          texto: 'Porque técnicamente es imposible: el hijo no puede ver ese array.',
          porque: 'Podría llegar a verlo (pasándolo por prop), y ahí está el peligro: sería posible y aún así NO se hace. Es una norma de arquitectura, no una limitación.',
        },
        {
          texto: 'Por rendimiento: los emits son más rápidos.',
          porque: 'El coste es equivalente. La razón es de orden: saber siempre dónde se cambia cada dato.',
        },
      ],
    }),

    {
      id: '17-5',
      titulo: 'La estrella que baja',
      enunciado:
        'Cierra el círculo: el padre baja <code>:favorito="favoritos.includes(sombrero.id)"</code>, el hijo la declara (<code>favorito: { type: Boolean, default: false }</code>) y pinta el botón según: <code>{{ favorito ? \'★ Favorito\' : \'☆ Marcar\' }}</code>.',
      pista: 'Eso del interrogante es el operador ternario: condición ? siEsVerdad : siEsMentira. Perfecto para elegir entre dos textos.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /:favorito\s*=\s*["']favoritos\.includes\(\s*sombrero\.id\s*\)["']/,
            'El padre tiene que bajar :favorito="favoritos.includes(sombrero.id)".',
          ),
          ficheroContiene(
            'src/components/FichaSombrero.vue',
            /favorito\s*:\s*\{[^}]*type\s*:\s*Boolean/,
            'El hijo tiene que declarar la prop favorito con type: Boolean.',
          ),
          ficheroContiene(
            'src/components/FichaSombrero.vue',
            /favorito\s*\?/,
            'El botón del hijo tiene que pintar según la prop: {{ favorito ? … : … }}.',
          ),
        ],
        exito: 'Círculo cerrado: el aviso subió, el dato cambió arriba, y la estrella bajó pintada. El hijo ni sabe que existe una lista.',
      }),
    },

    verdaderoFalso({
      id: '17-6',
      titulo: 'Cierto o falso: el teléfono completo',
      enunciado: 'Cinco frases sobre props y emits juntos. Todas.',
      pista: 'Bajan datos, suben avisos, cada cual con lo suyo.',
      afirmaciones: [
        { texto: 'defineEmits declara los eventos que el componente puede emitir.', cierto: true, porque: 'Cierto: es la cabecera de salidas, gemela de defineProps.' },
        { texto: 'El segundo argumento de emit() es la carga que recibirá el padre.', cierto: true, porque: 'Cierto: emit(\'favorito\', id) hace que la función escuchadora reciba ese id.' },
        { texto: 'El padre escucha los eventos del hijo con la directiva v-model.', cierto: false, porque: 'Falso: escucha con @, la misma arroba de @click. (v-model es otra cosa: campos de formulario.)' },
        { texto: 'Que el hijo modifique un array del padre "porque funciona" es buena idea.', cierto: false, porque: 'Falso: funcionar funciona, y ahí está la trampa. Un solo dueño por dato o adiós a saber quién cambió qué.' },
        { texto: '"Los datos bajan por props, los avisos suben por eventos" resume la arquitectura de Vue.', cierto: true, porque: 'Cierto: es EL lema. Todo lo demás del acto son detalles de este dibujo.' },
      ],
    }),

    completar({
      id: '17-7',
      titulo: 'El aviso de memoria',
      enunciado: 'Completa el circuito de subida: declarar, emitir con carga, escuchar.',
      pista: 'La macro de salidas, la función que grita, y la arroba del padre.',
      plantilla: `// hijo:
const emit = ___(['favorito'])
emit('favorito', props.sombrero.___)

// padre:
// <FichaSombrero ___favorito="alternarFavorito" />`,
      huecos: [
        { respuestas: ['defineEmits'], porque: 'defineEmits declara las salidas y entrega la función emit.' },
        { respuestas: ['id'], porque: 'La carga es el id: el padre necesita saber QUÉ copia le habla.' },
        { respuestas: ['@', 'v-on:'], porque: 'El padre escucha con @ (v-on), la misma arroba de los clics.' },
      ],
    }),

    ordenar({
      id: '17-8',
      titulo: 'El viaje de un clic entre componentes',
      enunciado: 'Ordena el circuito completo, del clic a la estrella pintada.',
      pista: 'Sube el aviso, cambia el dato, baja la prop.',
      lineas: [
        'Clic en el botón del hijo',
        "El hijo emite: emit('favorito', id)",
        'El padre lo escucha con @favorito y llama a su función',
        'La función cambia el array favoritos (dato del padre)',
        'La prop :favorito baja recalculada y el hijo pinta ★',
      ],
      porque: 'Subir, cambiar, bajar: el ciclo completo de la comunicación en Vue. Cuando algo no funcione entre componentes, repásalo eslabón a eslabón.',
    }),

    {
      id: '17-9',
      titulo: 'El teléfono completo',
      sintesis: true,
      enunciado:
        'Sin pistas. El circuito entero funcionando: el hijo con <code>defineEmits</code>, emitiendo el id en el clic, y pintando la estrella según su prop <code>favorito</code> (Boolean); el padre con <code>alternarFavorito</code> (includes + filter + push), escuchando con <code>@favorito</code> y bajando <code>:favorito</code> calculado. El contador de favoritos, al día.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/function\s+alternarFavorito\s*\(|const\s+alternarFavorito\s*=/, { falta: 'Falta alternarFavorito en el padre.' }),
          scriptContiene(/favoritos\.value\.includes/, { falta: 'La función del padre necesita includes.' }),
        ],
        template: [
          plantillaContiene(/@favorito\s*=\s*["']alternarFavorito/, 'Falta la escucha @favorito en el padre.'),
          plantillaContiene(/:favorito\s*=/, 'Falta bajar la prop :favorito calculada.'),
          ficheroContiene('src/components/FichaSombrero.vue', /defineEmits\s*\(\s*\[\s*['"]favorito['"]/, 'El hijo necesita defineEmits.'),
          ficheroContiene('src/components/FichaSombrero.vue', /emit\s*\(\s*['"]favorito['"]\s*,/, 'El hijo tiene que emitir con carga.'),
          ficheroContiene('src/components/FichaSombrero.vue', /favorito\s*:\s*\{[^}]*Boolean/, 'El hijo necesita la prop favorito: Boolean.'),
        ],
        exito:
          'Props que bajan, emits que suben, y cada dato con su único dueño. Este dibujo es la arquitectura de cualquier app Vue del tamaño que sea. Te queda una pieza del acto: los slots.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'El lema del acto, una vez más, porque es de los que valen carrera: los datos bajan por props, los avisos suben por eventos. ' +
      'Si respetas eso, cualquier persona (tú incluida, dentro de seis meses) podrá abrir tu proyecto y seguir el hilo. Falta el tercer canal: el hueco. Los slots.',
  },
}
