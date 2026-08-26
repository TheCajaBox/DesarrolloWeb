// Mundo 12 (Vue) — computed: datos que se calculan solos.
//
// Quinto mundo del Acto III. Con el catálogo en un array, aparecen las
// preguntas derivadas: ¿cuánto vale todo? ¿cuáles son baratos? computed las
// responde y las mantiene al día. Entran filter y la idea de derivar en vez
// de duplicar.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
])
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>{{ sombreros.length }} sombreros.</p>

    <section class="catalogo">
      <article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
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
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
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
  numero: 12,
  acto: 'Datos',
  titulo: 'Mundo 12 · Datos que se calculan solos',

  entradilla: {
    quien: 'wax',
    texto:
      'Cuánto vale el catálogo entero. Cuáles bajan de treinta euros. Cuál es el más caro. Todo eso ya está en tu array; ' +
      'solo hay que derivarlo. computed es la herramienta: defines el cálculo una vez, y Vue lo mantiene al día él solo, ' +
      'recalculando exactamente cuando hace falta y ni una vez más.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { computed, ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
])

const total = computed(() => {
  let suma = 0
  for (const sombrero of sombreros.value) suma += sombrero.precio
  return suma
})

const baratos = computed(() => sombreros.value.filter((sombrero) => sombrero.precio < 30))

function rebajar() {
  for (const sombrero of sombreros.value) sombrero.precio -= 2
}
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>{{ sombreros.length }} sombreros, {{ total }} € en total.</p>
    <p>Gangas (menos de 30 €): {{ baratos.length }}</p>
    <button @click="rebajar">Rebajas: 2 € menos en todo</button>

    <section class="catalogo">
      <article v-for="sombrero in baratos" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
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
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}

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
    titulo: 'computed y el arte de no duplicar',
    cuerpo: `Hay una tentación cuando necesitas el total del catálogo: crear otro ref, \`const total = ref(117)\`, y acordarte de actualizarlo cada vez que algo cambie. Esa tentación tiene nombre —**duplicar el dato**— y es la madre de la mitad de los bugs del mundo: el día que se te olvide actualizarlo en un sitio, el total mentirá. La solución de Vue es no guardar el total en ningún sitio, sino **calcularlo**:

\`\`\`
import { computed, ref } from 'vue'

const total = computed(() => {
  let suma = 0
  for (const sombrero of sombreros.value) suma += sombrero.precio
  return suma
})
\`\`\`

**Cómo leerlo.** \`computed(...)\` recibe una función —esa flecha \`() =>\` es la forma corta de escribir funciones, la verás en todas partes— que **devuelve** el valor calculado (\`return\`). El \`for...of\` recorre el array sombrero a sombrero, acumulando en \`suma\`. Y el resultado se usa como un ref más: \`{{ total }}\` en el template, \`total.value\` en el script. Pero **nunca se le asigna**: no es una caja donde guardas, es una fórmula que responde.

**La parte lista: sabe de qué depende.** Vue observa qué datos usa el cálculo (aquí, \`sombreros\`) y lo rehace **solo cuando alguno cambia**. ¿Un push al array? El total se actualiza. ¿No cambia nada? Vue sirve el valor guardado sin recalcular (eso se llama **caché**, y es lo que hace a computed mejor que llamar a una función en el template). Tú defines la fórmula; Vue decide cuándo ejecutarla.

**filter: el derivado más útil.**

\`\`\`
const baratos = computed(() => sombreros.value.filter((s) => s.precio < 30))
\`\`\`

\`filter\` es un método de todo array: recibe una función-pregunta y devuelve **un array nuevo** con los elementos que respondieron que sí. El original queda intacto —esto importa: filter no borra nada, selecciona—. Su hermano \`map\` transforma cada elemento en otra cosa. Con \`filter\`, \`map\` y \`length\` derivas casi cualquier cosa de una lista.

**Y el remate: un v-for sobre un computed.** Cambia \`v-for="s in sombreros"\` por \`v-for="s in baratos"\` y el catálogo enseña solo las gangas. Cuando en el próximo mundo el buscador escriba su texto, un computed filtrará por nombre y la rejilla se pondrá al día tecla a tecla. Ese trío —dato bruto, computed que deriva, v-for que pinta— es la arquitectura de casi toda interfaz seria.

**La regla para elegir:** ¿el valor se **deriva** de otros datos? computed. ¿Es un dato **nuevo**, que nace de la persona o del servidor? ref. Si te sorprendes actualizando dos refs a la vez para que cuadren, uno de los dos quería ser computed.`,
  },

  pasos: [
    {
      id: '12-1',
      titulo: 'Importa computed',
      enunciado: 'Amplía el import de Vue para traer también <code>computed</code>: <code>import { computed, ref } from \'vue\'</code>.',
      pista: 'Dentro de las mismas llaves del import que ya tienes, separado por coma.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/import\s*\{[^}]*\bcomputed\b[^}]*\}\s*from\s*['"]vue['"]/, {
            falta: 'Falta computed en el import de vue.',
          }),
        ],
        exito: 'Herramienta a bordo. Ahora, la primera fórmula.',
      }),
    },

    {
      id: '12-2',
      titulo: 'El total del catálogo',
      enunciado:
        'Crea el computed del total: una función flecha que recorra <code>sombreros.value</code> con <code>for...of</code> sumando los precios, y que haga <code>return</code> de la suma. Enséñalo en el template: <code>{{ total }} €</code>.',
      pista: 'El esqueleto: <code>const total = computed(() =&gt; { let suma = 0; for (const s of sombreros.value) suma += s.precio; return suma })</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+total\s*=\s*computed\s*\(/, { falta: 'Falta const total = computed(…).' }),
          scriptContiene(/for\s*\(\s*const\s+\w+\s+of\s+sombreros\.value\s*\)|sombreros\.value\.reduce/, {
            falta: 'El cálculo tiene que recorrer sombreros.value (con for...of, o reduce si lo conoces).',
          }),
          scriptContiene(/return\s+\w+/, { falta: 'A la fórmula le falta el return con la suma.' }),
        ],
        template: [plantillaContiene(/\{\{\s*total\s*\}\}/, 'Falta enseñar {{ total }} en el template.')],
        exito: 'El total sale de la fórmula, no de una caja. Añade un sombrero al array y guarda: se actualiza sin que lo toques.',
      }),
    },

    eleccion({
      id: '12-3',
      titulo: '¿ref o computed?',
      enunciado: 'Necesitas la cuenta de sombreros que bajan de 30 €. ¿Cómo la guardas?',
      pista: '¿Ese número es información nueva, o se puede sacar de lo que ya tienes?',
      opciones: [
        {
          texto: 'Un computed que filtre el array y cuente: se deriva de lo que ya existe.',
          correcta: true,
          porque: 'Eso es. Si se puede calcular de otros datos, se calcula. Un solo origen de verdad, cero desincronizaciones.',
        },
        {
          texto: 'Un ref aparte, y me acuerdo de actualizarlo en cada cambio de precio.',
          porque: 'Ahí está la trampa: "me acuerdo". El día que no te acuerdes (y llegará), el número mentirá. Derivar > duplicar.',
        },
        {
          texto: 'Contarlos a mano y escribir el número en el template.',
          porque: 'Eso es la versión aún más frágil del ref duplicado: un número muerto que nadie actualiza.',
        },
      ],
    }),

    {
      id: '12-4',
      titulo: 'Las gangas',
      enunciado:
        'Crea el computed <code>baratos</code> usando <code>filter</code>: los sombreros con <code>precio &lt; 30</code>. Y enseña la cuenta: <code>Gangas: {{ baratos.length }}</code>.',
      pista: 'Una línea: <code>const baratos = computed(() =&gt; sombreros.value.filter((s) =&gt; s.precio &lt; 30))</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+baratos\s*=\s*computed\s*\(/, { falta: 'Falta const baratos = computed(…).' }),
          scriptContiene(/sombreros\.value\.filter\s*\(/, { falta: 'baratos tiene que usar sombreros.value.filter(…).' }),
          scriptContiene(/precio\s*<\s*30/, { falta: 'El filtro es precio < 30.' }),
        ],
        template: [plantillaContiene(/\{\{\s*baratos\.length\s*\}\}/, 'Falta enseñar {{ baratos.length }}.')],
        exito: 'filter pregunta a cada sombrero y se queda con los que dicen sí. El original ni se inmuta: seleccionar, no borrar.',
      }),
    },

    verdaderoFalso({
      id: '12-5',
      titulo: 'Cierto o falso: derivar',
      enunciado: 'Cinco frases sobre computed y filter. Todas.',
      pista: 'Fórmula contra caja; seleccionar contra borrar.',
      afirmaciones: [
        { texto: 'Un computed se recalcula solo cuando cambia algún dato del que depende.', cierto: true, porque: 'Cierto, y entre cambios sirve el valor cacheado. Eficiencia gratis.' },
        { texto: 'A un computed se le puede asignar un valor: total.value = 99.', cierto: false, porque: 'Falso: es una fórmula, no una caja. Se lee, no se escribe.' },
        { texto: 'filter devuelve un array nuevo y deja el original intacto.', cierto: true, porque: 'Cierto: filter selecciona, no destruye. El catálogo completo sigue ahí.' },
        { texto: 'Duplicar un dato en dos refs y sincronizarlos a mano es buena práctica.', cierto: false, porque: 'Falso: es la receta del desajuste. Un origen de verdad y derivados computed.' },
        { texto: 'Un v-for puede recorrer un computed igual que un ref.', cierto: true, porque: 'Cierto: para el template son iguales. v-for="s in baratos" pinta la lista filtrada.' },
      ],
    }),

    completar({
      id: '12-6',
      titulo: 'La fórmula de memoria',
      enunciado: 'Completa el derivado: la función que envuelve, el método que selecciona y la palabra que entrega el resultado.',
      pista: 'Envolver el cálculo, filtrar el array, devolver el valor.',
      plantilla: `const caros = ___(() => {
  const lista = sombreros.value.___((s) => s.precio >= 30)
  ___ lista
})`,
      huecos: [
        { respuestas: ['computed'], porque: 'computed envuelve la fórmula y la mantiene al día.' },
        { respuestas: ['filter'], porque: 'filter selecciona los que cumplen la condición.' },
        { respuestas: ['return'], porque: 'return entrega el valor calculado; sin él, el computed no vale nada.' },
      ],
    }),

    {
      id: '12-7',
      titulo: 'La rejilla filtrada',
      enunciado:
        'Ahora el golpe de efecto: cambia el <code>v-for</code> del catálogo para que recorra <code>baratos</code> en vez de <code>sombreros</code>. La rejilla pasa a enseñar solo las gangas.',
      pista: 'Solo cambia la palabra del v-for: <code>v-for="sombrero in baratos"</code>. El resto de la ficha queda igual.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+baratos\s*["']/, 'El v-for aún no recorre baratos.'),
        ],
        exito: 'Dato bruto → computed que filtra → v-for que pinta. Acabas de montar la arquitectura de todo buscador y todo filtro que hayas usado jamás.',
      }),
    },

    emparejar({
      id: '12-8',
      titulo: 'Cada herramienta, su pregunta',
      enunciado: 'Une cada pieza con la pregunta que responde.',
      pista: 'Contar, seleccionar, transformar, derivar.',
      pares: [
        { izquierda: '.length', derecha: '¿cuántos hay?' },
        { izquierda: '.filter(...)', derecha: '¿cuáles cumplen esto?', porque: 'filter devuelve el sub-array de los que pasan la prueba.' },
        { izquierda: '.map(...)', derecha: '¿cómo sería cada uno transformado?' },
        { izquierda: 'computed(...)', derecha: '¿qué valor se deriva y se mantiene al día?' },
      ],
      porque: 'length cuenta, filter selecciona, map transforma y computed lo envuelve todo para que viva actualizado.',
    }),

    {
      id: '12-9',
      titulo: 'Rebajas con cabeza',
      sintesis: true,
      enunciado:
        'Sin pistas. Monta el escaparate completo: el computed <code>total</code> (con su recorrido y su <code>return</code>), el computed <code>baratos</code> (con <code>filter</code> de <code>precio &lt; 30</code>), el <code>v-for</code> recorriendo <code>baratos</code>, los dos marcadores <code>{{ total }}</code> y <code>{{ baratos.length }}</code> a la vista, y un botón «Rebajas» con una función <code>rebajar</code> que reste 2 al precio de <strong>todos</strong> los sombreros (un <code>for...of</code>). Púlsalo y mira cómo total, cuenta y rejilla se recolocan solos.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+total\s*=\s*computed\s*\(/, { falta: 'Falta el computed total.' }),
          scriptContiene(/const\s+baratos\s*=\s*computed\s*\(/, { falta: 'Falta el computed baratos.' }),
          scriptContiene(/sombreros\.value\.filter\s*\(/, { falta: 'baratos necesita su filter.' }),
          scriptContiene(/function\s+rebajar\s*\(|const\s+rebajar\s*=/, { falta: 'Falta la función rebajar.' }),
          scriptContiene(/for\s*\(\s*const\s+\w+\s+of\s+sombreros\.value\s*\)[\s\S]*?precio\s*-=|precio\s*-=\s*2/, {
            falta: 'rebajar tiene que recorrer los sombreros restando 2 al precio (precio -= 2).',
          }),
        ],
        template: [
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+baratos\s*["']/, 'El v-for tiene que recorrer baratos.'),
          plantillaContiene(/\{\{\s*total\s*\}\}/, 'Falta {{ total }}.'),
          plantillaContiene(/\{\{\s*baratos\.length\s*\}\}/, 'Falta {{ baratos.length }}.'),
          plantillaContiene(/@click\s*=\s*["']rebajar/, 'Falta el botón con @click="rebajar".'),
        ],
        exito:
          'Tocas UN dato (los precios) y todo lo derivado —total, cuenta de gangas, rejilla— se recoloca en cadena. Cero sincronización manual. Esto es programar declarativo, y ya lo haces.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'El botón de rebajas es mi favorito: tocas los precios y media página se reorganiza sola, como fichas de dominó bien puestas. ' +
      'Tú ya no mueves fichas: diseñas cómo caen. El próximo mundo le da la entrada al público: formularios, para que escriban ellos.',
  },
}
