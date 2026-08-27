// Las ayudas de Vue del editor.
//
// Monaco trae de fábrica el autocompletado de HTML, CSS y JavaScript. Lo que no
// sabe es de Vue: que `v-for` existe, que `ref` se importa de 'vue', o que
// `defineProps` va sin importar. Eso se le enseña aquí.
//
// Son plantillas con hueco (${1:...}): al aceptar una, el cursor cae donde hay
// que escribir y con Tab se salta al siguiente hueco. Cada una lleva su
// explicación de una línea, que es lo que sale en el panel de al lado: el
// autocompletado también enseña.

// Directivas y atributos, para cuando se escribe dentro de una etiqueta.
const DIRECTIVAS = [
  {
    etiqueta: 'v-if',
    inserta: 'v-if="${1:condicion}"',
    ayuda: 'El elemento existe solo si la condición es verdadera.',
  },
  {
    etiqueta: 'v-else',
    inserta: 'v-else',
    ayuda: 'Lo contrario del v-if de al lado. Va en el elemento inmediatamente siguiente.',
  },
  {
    etiqueta: 'v-else-if',
    inserta: 'v-else-if="${1:condicion}"',
    ayuda: 'Encadena otro caso, si el v-if anterior fue falso.',
  },
  {
    etiqueta: 'v-for',
    inserta: 'v-for="${1:cosa} in ${2:cosas}" :key="${1:cosa}.id"',
    ayuda: 'Repite el elemento por cada valor de la lista. Siempre con :key único y estable.',
  },
  {
    etiqueta: 'v-model',
    inserta: 'v-model="${1:dato}"',
    ayuda: 'Ata un campo de formulario a un dato, en las dos direcciones.',
  },
  {
    etiqueta: 'v-show',
    inserta: 'v-show="${1:condicion}"',
    ayuda: 'Esconde con CSS en vez de quitar del documento. Para lo que se alterna mucho.',
  },
  {
    etiqueta: 'v-html',
    inserta: 'v-html="${1:html}"',
    ayuda: 'CUIDADO: pinta HTML sin escapar. Jamás con texto de usuarios (XSS). Usa {{ }}.',
  },
  {
    etiqueta: '@click',
    inserta: '@click="${1:funcion}"',
    ayuda: 'Escucha el clic y llama a la función (sin paréntesis: la llama Vue).',
  },
  {
    etiqueta: '@submit.prevent',
    inserta: '@submit.prevent="${1:funcion}"',
    ayuda: 'Envía el formulario sin recargar la página.',
  },
  {
    etiqueta: '@input',
    inserta: '@input="${1:funcion}"',
    ayuda: 'Cada cambio en un campo de texto.',
  },
  {
    etiqueta: ':key',
    inserta: ':key="${1:cosa}.id"',
    ayuda: 'El DNI de cada copia de un v-for: único y estable.',
  },
  {
    etiqueta: ':class',
    inserta: ":class=\"{ ${1:clase}: ${2:condicion} }\"",
    ayuda: 'Pone la clase solo si la condición es verdadera.',
  },
  {
    etiqueta: ':disabled',
    inserta: ':disabled="${1:condicion}"',
    ayuda: 'Apaga el botón cuando la condición es verdadera.',
  },
  {
    etiqueta: ':src',
    inserta: ':src="${1:dato}"',
    ayuda: 'La ruta de la imagen sale de un dato.',
  },
]

// Estructuras de plantilla y de script.
const BLOQUES = [
  {
    etiqueta: 'vue-componente',
    inserta: [
      '<script setup>',
      "import { ref } from 'vue'",
      '',
      "const ${1:dato} = ref('${2:valor}')",
      '</' + 'script>',
      '',
      '<template>',
      '  <div>{{ ${1:dato} }}</div>',
      '</template>',
      '',
      '<style scoped>',
      '</style>',
    ].join('\n'),
    ayuda: 'Un componente entero con sus tres bloques.',
  },
  {
    etiqueta: 'ref',
    inserta: "const ${1:dato} = ref(${2:valor})",
    ayuda: 'Un dato reactivo. En el script se toca con .value; en el template, sin él.',
  },
  {
    etiqueta: 'computed',
    inserta: 'const ${1:derivado} = computed(() => ${2:calculo})',
    ayuda: 'Un valor derivado de otros datos, siempre al día. No se le asigna.',
  },
  {
    etiqueta: 'watch',
    inserta: 'watch(${1:dato}, (nuevo, viejo) => {\n  ${2:}\n})',
    ayuda: 'Ejecuta un efecto cuando el dato cambia. Con { deep: true } para arrays y objetos.',
  },
  {
    etiqueta: 'onMounted',
    inserta: 'onMounted(() => {\n  ${1:}\n})',
    ayuda: 'Se ejecuta una vez, cuando el componente ya está en pantalla.',
  },
  {
    etiqueta: 'defineProps',
    inserta:
      'const props = defineProps({\n  ${1:nombre}: { type: ${2:String}, required: true },\n})',
    ayuda: 'Declara lo que el componente recibe del padre. No se importa.',
  },
  {
    etiqueta: 'defineEmits',
    inserta: "const emit = defineEmits(['${1:evento}'])",
    ayuda: 'Declara los avisos que el componente puede lanzar hacia el padre.',
  },
  {
    etiqueta: 'store',
    inserta: [
      "import { defineStore } from 'pinia'",
      '',
      "export const usar${1:Cosa} = defineStore('${2:cosa}', {",
      '  state: () => ({',
      '    ${3:lineas}: [],',
      '  }),',
      '',
      '  getters: {',
      '    cuantos: (state) => state.${3:lineas}.length,',
      '  },',
      '',
      '  actions: {',
      '    meter(algo) {',
      '      this.${3:lineas}.push(algo)',
      '    },',
      '  },',
      '})',
    ].join('\n'),
    ayuda: 'Un almacén de Pinia con sus tres pisos: state, getters y actions.',
  },
  {
    etiqueta: 'fetch',
    inserta: [
      'async function ${1:pedir}() {',
      '  cargando.value = true',
      '  error.value = null',
      '  try {',
      "    const respuesta = await fetch('${2:/datos.json}')",
      "    if (!respuesta.ok) throw new Error('El servidor respondió ' + respuesta.status)",
      '    ${3:datos}.value = await respuesta.json()',
      '  } catch (fallo) {',
      '    error.value = fallo.message',
      '  } finally {',
      '    cargando.value = false',
      '  }',
      '}',
    ].join('\n'),
    ayuda: 'Una petición completa: con su comprobación de ok, su catch y su finally.',
  },
]

/**
 * Registra las ayudas en Monaco. Se llama una sola vez, desde el Editor.
 */
export function registrarAyudasVue(monaco) {
  if (registrarAyudasVue.hecho) return
  registrarAyudasVue.hecho = true

  const clase = monaco.languages.CompletionItemKind
  const plantilla = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet

  // Las directivas se ofrecen en los ficheros que se editan como HTML (.vue y
  // .html); los bloques, también en JavaScript.
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['-', ':', '@', 'v'],
    provideCompletionItems(modelo, posicion) {
      const palabra = modelo.getWordUntilPosition(posicion)
      const rango = {
        startLineNumber: posicion.lineNumber,
        endLineNumber: posicion.lineNumber,
        startColumn: palabra.startColumn,
        endColumn: palabra.endColumn,
      }

      return {
        suggestions: [
          ...DIRECTIVAS.map((entrada) => ({
            label: entrada.etiqueta,
            kind: clase.Property,
            detail: 'Vue',
            documentation: entrada.ayuda,
            insertText: entrada.inserta,
            insertTextRules: plantilla,
            range: rango,
          })),
          ...BLOQUES.map((entrada) => ({
            label: entrada.etiqueta,
            kind: clase.Snippet,
            detail: 'Vue',
            documentation: entrada.ayuda,
            insertText: entrada.inserta,
            insertTextRules: plantilla,
            range: rango,
          })),
        ],
      }
    },
  })

  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems(modelo, posicion) {
      const palabra = modelo.getWordUntilPosition(posicion)
      const rango = {
        startLineNumber: posicion.lineNumber,
        endLineNumber: posicion.lineNumber,
        startColumn: palabra.startColumn,
        endColumn: palabra.endColumn,
      }

      return {
        suggestions: BLOQUES.map((entrada) => ({
          label: entrada.etiqueta,
          kind: clase.Snippet,
          detail: 'Vue',
          documentation: entrada.ayuda,
          insertText: entrada.inserta,
          insertTextRules: plantilla,
          range: rango,
        })),
      }
    },
  })
}

// Se exportan para poder probarlas sin arrancar Monaco.
export const AYUDAS = { DIRECTIVAS, BLOQUES }
