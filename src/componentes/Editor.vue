<script setup>
// Monaco: el editor de VS Code, el mismo motor, corriendo dentro del taller.
//
// Antes esto era CodeMirror pelado: resaltaba y poco más. Sin autocompletado,
// sin ayuda al escribir, sin errores de sintaxis a la vista. Para aprender a
// escribir Vue eso es trabajar a ciegas.
//
// Lo que aporta Monaco: autocompletado de etiquetas, atributos y CSS,
// diagnósticos de sintaxis, plegado, multicursor, búsqueda, los atajos de VS
// Code, y un historial de deshacer POR FICHERO (un modelo por ruta).
//
// Los workers se importan con `?worker` de Vite. Sin ellos, Monaco cae a un
// modo tonto sin autocompletado, así que si algún día desaparece el
// autocompletado, es aquí donde hay que mirar.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
// Ojo a las rutas: desde monaco 0.56 el mapa de `exports` es "./*" →
// "./esm/vs/*.js", así que se importa SIN el prefijo esm/vs. Con el prefijo,
// Vite responde "Failed to resolve import".
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
import CssWorker from 'monaco-editor/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker'
import JsonWorker from 'monaco-editor/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker'
import { registrarAyudasVue } from '../motor/ayudas-editor.js'

const props = defineProps({
  contenido: { type: String, default: '' },
  extension: { type: String, default: '' },
  ruta: { type: String, default: null },
})

const emitir = defineEmits(['escribir'])

const contenedor = ref(null)
let editor = null
// Mientras cargamos otro fichero, lo que cambia no lo ha escrito la alumna:
// sin esta bandera, cada apertura dispararía un guardado.
let cargandoFuera = false

self.MonacoEnvironment = {
  getWorker(_id, etiqueta) {
    if (etiqueta === 'json') return new JsonWorker()
    if (etiqueta === 'css' || etiqueta === 'scss' || etiqueta === 'less') return new CssWorker()
    if (etiqueta === 'html' || etiqueta === 'handlebars' || etiqueta === 'razor') return new HtmlWorker()
    if (etiqueta === 'typescript' || etiqueta === 'javascript') return new TsWorker()
    return new EditorWorker()
  },
}

// Un .vue se edita como HTML: así se autocompletan etiquetas y atributos, y
// el CSS y el JS de dentro también se entienden. (El soporte pleno de SFC es
// cosa de Volar, que necesita un servidor de lenguaje aparte.)
function lenguajeDe(extension) {
  switch (extension) {
    case 'vue':
    case 'html':
    case 'htm':
      return 'html'
    case 'css':
      return 'css'
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript'
    case 'json':
      return 'json'
    case 'sql':
      return 'sql'
    case 'md':
      return 'markdown'
    default:
      return 'plaintext'
  }
}

// El tema del taller: los colores de la casa, no el azul de fábrica.
monaco.editor.defineTheme('sombrero', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '7d7565', fontStyle: 'italic' },
    { token: 'tag', foreground: 'dfb96f' },
    { token: 'attribute.name', foreground: 'c9a227' },
    { token: 'attribute.value', foreground: '86a95e' },
    { token: 'string', foreground: '86a95e' },
    { token: 'keyword', foreground: 'c06840' },
    { token: 'number', foreground: 'a986c0' },
  ],
  colors: {
    'editor.background': '#1b1a17',
    'editor.foreground': '#e8e2d4',
    'editorLineNumber.foreground': '#5c554a',
    'editorLineNumber.activeForeground': '#dfb96f',
    'editor.lineHighlightBackground': '#221f1a',
    'editor.selectionBackground': '#3d3628',
    'editorCursor.foreground': '#dfb96f',
    'editorIndentGuide.background1': '#2b2721',
    'editorSuggestWidget.background': '#211e1a',
    'editorSuggestWidget.selectedBackground': '#3d3628',
    'editorHoverWidget.background': '#211e1a',
  },
})

// El JS del proyecto importa de 'vue' y de ficheros que Monaco no resuelve.
// Los errores de tipos ahí serían mentira, así que se deja la sintaxis (que sí
// ayuda: una coma que falta se ve al momento) y se quita lo semántico.
//
// OJO: en monaco 0.56 esta API se mudó de `monaco.languages.typescript` a
// `monaco.typescript`. Se buscan las dos y, si no aparece ninguna, el editor
// sigue funcionando sin diagnósticos en vez de no arrancar.
const ts = monaco.typescript || monaco.languages?.typescript

if (ts?.javascriptDefaults) {
  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  })
  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    allowJs: true,
  })
}

registrarAyudasVue(monaco)

// La URI de un fichero del proyecto. Una sola función, para que el modelo y la
// comprobación de "¿este modelo es de esta ruta?" no puedan discrepar.
function uriDe(ruta) {
  return `inmemory://proyecto/${ruta || 'sin-nombre'}`
}

// Un modelo por ruta: al volver a un fichero, el deshacer sigue donde estaba.
function modeloDe(ruta, contenido, extension) {
  const uri = monaco.Uri.parse(uriDe(ruta))
  const existente = monaco.editor.getModel(uri)

  if (existente) {
    if (existente.getValue() !== contenido) {
      cargandoFuera = true
      existente.setValue(contenido)
      cargandoFuera = false
    }
    return existente
  }

  return monaco.editor.createModel(contenido, lenguajeDe(extension), uri)
}

// Si Monaco se rompe (una versión que mueve una API, un worker que no carga),
// el taller NO se cae: se dice aquí y lo demás sigue funcionando.
const fallo = ref(null)

onMounted(() => {
  try {
    montar()
  } catch (error) {
    fallo.value = String(error.message || error)
    console.error('[editor] Monaco no ha podido arrancar:', error)
  }
})

function montar() {
  editor = monaco.editor.create(contenedor.value, {
    model: props.ruta ? modeloDe(props.ruta, props.contenido, props.extension) : null,
    theme: 'sombrero',
    automaticLayout: true,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Cascadia Code, JetBrains Mono, Consolas, monospace',
    fontLigatures: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 14, bottom: 40 },
    renderLineHighlight: 'line',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    suggestOnTriggerCharacters: true,
    quickSuggestions: { other: true, comments: false, strings: true },
    acceptSuggestionOnEnter: 'smart',
    tabCompletion: 'on',
    formatOnPaste: true,
    autoClosingBrackets: 'languageDefined',
    autoClosingQuotes: 'languageDefined',
    autoSurround: 'languageDefined',
    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
    overviewRulerLanes: 0,
  })

  editor.onDidChangeModelContent(() => {
    if (cargandoFuera) return

    // Guarda contra el peor fallo posible de un editor: escribir el contenido
    // de un fichero encima de OTRO. Si el modelo activo no es el de la ruta
    // que nos han pasado (puede pasar mientras se cambia de fichero, cuando
    // ruta y contenido llegan en momentos distintos), no se emite nada.
    if (editor.getModel()?.uri.toString() !== uriDe(props.ruta)) return

    // Se emite CON la ruta: así el almacén puede descartar un aviso que llegue
    // a destiempo en vez de guardarlo en el fichero equivocado.
    emitir('escribir', editor.getValue(), props.ruta)
  })

  refrescar()
}

// Monaco pinta en el siguiente frame. Si el editor se crea con el contenedor a
// cero, o con la ventana oculta o minimizada (donde no hay frames), monta pero
// se queda en blanco. Un render síncrono lo asegura, y se repite en el
// siguiente frame para cuando el tamaño definitivo llega después.
function refrescar() {
  if (!editor) return
  editor.layout()
  editor.render(true)
  requestAnimationFrame(() => {
    editor?.layout()
    editor?.render(true)
  })
}

watch(
  () => [props.ruta, props.contenido, props.extension],
  () => {
    if (!editor) return
    if (!props.ruta) return

    const modelo = modeloDe(props.ruta, props.contenido, props.extension)
    if (editor.getModel() !== modelo) editor.setModel(modelo)
    monaco.editor.setModelLanguage(modelo, lenguajeDe(props.extension))
    refrescar()
  },
)

onBeforeUnmount(() => {
  if (editor) editor.dispose()
  for (const modelo of monaco.editor.getModels()) modelo.dispose()
})
</script>

<template>
  <div class="editor">
    <!-- El lienzo va SIEMPRE en el árbol y con tamaño: si se crea oculto,
         Monaco monta sin pintar. Los avisos se superponen encima. -->
    <div ref="contenedor" class="lienzo"></div>

    <div v-if="fallo" class="encima aviso">
      <p>El editor no ha podido arrancar.</p>
      <p class="pista">{{ fallo }}</p>
    </div>

    <div v-else-if="!ruta" class="encima vacio">
      <p>No hay ningún fichero abierto.</p>
      <p class="pista">Elige uno en la lista, o crea el primero.</p>
    </div>
  </div>
</template>

<style scoped>
.editor {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #1b1a17;
}

.lienzo {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.encima {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  gap: 0.3rem;
  background: #1b1a17;
  color: var(--texto-apagado);
}

.aviso {
  color: var(--rojo, #a03e2d);
}

.pista {
  font-size: 0.85rem;
  margin: 0;
  color: var(--texto-apagado);
}
</style>
