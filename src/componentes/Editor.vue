<script setup>
// CodeMirror 6. El resaltado cambia solo segun la extension del fichero.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { Annotation, Compartment, EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps({
  contenido: { type: String, default: '' },
  extension: { type: String, default: '' },
  ruta: { type: String, default: null },
})

const emitir = defineEmits(['escribir'])

const contenedor = ref(null)
let vista = null

const idioma = new Compartment()

// Marca los cambios que aplicamos nosotros al cargar otro fichero, para no
// confundirlos con lo que teclea el alumno y acabar en un bucle de guardado.
const cargaExterna = Annotation.define()

function idiomaDe(extension) {
  switch (extension) {
    case 'html':
    case 'htm':
      return html()
    case 'css':
      return css()
    case 'js':
    case 'mjs':
    case 'json':
      return javascript()
    case 'sql':
      return sql()
    default:
      return []
  }
}

onMounted(() => {
  vista = new EditorView({
    parent: contenedor.value,
    state: EditorState.create({
      doc: props.contenido,
      extensions: [
        basicSetup,
        oneDark,
        idioma.of(idiomaDe(props.extension)),
        EditorView.lineWrapping,
        EditorView.updateListener.of((actualizacion) => {
          if (!actualizacion.docChanged) return
          const esNuestro = actualizacion.transactions.some((t) => t.annotation(cargaExterna))
          if (esNuestro) return
          emitir('escribir', actualizacion.state.doc.toString())
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13.5px' },
          '.cm-scroller': { fontFamily: 'var(--mono)' },
          '&.cm-focused': { outline: 'none' },
        }),
      ],
    }),
  })
})

// Un solo observador para ruta y contenido. La comparacion con el documento
// actual evita reescribir el editor mientras se esta escribiendo en el.
watch(
  () => [props.ruta, props.contenido],
  () => {
    if (!vista) return
    if (vista.state.doc.toString() === props.contenido) {
      vista.dispatch({ effects: idioma.reconfigure(idiomaDe(props.extension)) })
      return
    }

    vista.dispatch({
      changes: { from: 0, to: vista.state.doc.length, insert: props.contenido },
      effects: idioma.reconfigure(idiomaDe(props.extension)),
      annotations: cargaExterna.of(true),
    })
  },
)

onBeforeUnmount(() => {
  if (vista) vista.destroy()
})
</script>

<template>
  <div class="editor">
    <div v-if="!ruta" class="vacio">
      <p>No hay ningun fichero abierto.</p>
      <p class="pista">Elige uno en la lista, o crea el primero.</p>
    </div>
    <div v-show="ruta" ref="contenedor" class="lienzo"></div>
  </div>
</template>

<style scoped>
.editor {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.lienzo {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.vacio {
  flex: 1;
  display: grid;
  place-content: center;
  text-align: center;
  color: var(--texto-apagado);
}

.pista {
  font-size: 0.85rem;
  margin-top: -0.5rem;
}
</style>
