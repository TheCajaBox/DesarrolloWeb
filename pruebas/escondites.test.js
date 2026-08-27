import { describe, expect, it } from 'vitest'
import {
  comentariosDe,
  hayListaConLlave,
  sombreroDelComando,
  sombrerosEnElCodigo,
} from '../src/motor/escondites.js'

// Un premio escondido tiene dos formas de salir mal: no darse nunca (y
// entonces la pista es una tomadura de pelo) o darse a quien no ha hecho nada
// (y entonces no vale nada). Estas pruebas van a por las dos.

describe('los comentarios de un fichero', () => {
  it('saca los de HTML, los de línea y los de bloque', () => {
    const codigo = `<!-- uno -->
<script setup>
// dos
/* tres */
const x = 1
</script>`
    const dentro = comentariosDe(codigo)
    expect(dentro).toContain('uno')
    expect(dentro).toContain('dos')
    expect(dentro).toContain('tres')
  })

  it('no saca el código de verdad', () => {
    expect(comentariosDe('const hola = "adios"')).not.toContain('adios')
  })

  it('con un fichero vacío o basura no revienta', () => {
    expect(comentariosDe('')).toBe('')
    expect(comentariosDe(null)).toBe('')
    expect(comentariosDe(undefined)).toBe('')
  })
})

describe('una lista con su llave', () => {
  it('la ve cuando v-for y :key van en el mismo elemento', () => {
    expect(hayListaConLlave('<li v-for="s in lista" :key="s.id">{{ s.nombre }}</li>')).toBe(true)
  })

  it('también con v-bind:key escrito largo', () => {
    expect(hayListaConLlave('<li v-for="s in lista" v-bind:key="s.id">x</li>')).toBe(true)
  })

  it('un v-for pelado no cuenta', () => {
    expect(hayListaConLlave('<li v-for="s in lista">{{ s }}</li>')).toBe(false)
  })

  it('y tenerlos en elementos distintos tampoco', () => {
    // Este es justo el error que se comete al aprenderlo: la llave puesta en el
    // padre en vez de en lo que se repite.
    expect(hayListaConLlave('<ul :key="algo"><li v-for="s in lista">{{ s }}</li></ul>')).toBe(false)
  })

  it('un :key suelto, sin lista, no cuenta', () => {
    expect(hayListaConLlave('<li :key="1">solo</li>')).toBe(false)
  })
})

describe('los sombreros que se ganan escribiendo', () => {
  it('preguntar dentro de un comentario cuenta', () => {
    const codigo = '<template>\n  <!-- ¿hay alguien ahí? -->\n  <p>hola</p>\n</template>'
    expect(sombrerosEnElCodigo(codigo)).toContain('sombrero-de-dentro')
  })

  it('sirve igual en un comentario de JavaScript', () => {
    expect(sombrerosEnElCodigo('// hay alguien?\nconst x = 1')).toContain('sombrero-de-dentro')
  })

  it('pero escribirlo en el texto de la página NO cuenta', () => {
    // Si contara, saldría solo al escribir una lección cualquiera sobre gente.
    const codigo = '<template><p>Aquí no hay alguien, hay muchos</p></template>'
    expect(sombrerosEnElCodigo(codigo)).not.toContain('sombrero-de-dentro')
  })

  it('la llave, solo si se pone antes de que se explique', () => {
    const conLlave = '<li v-for="s in lista" :key="s.id">x</li>'
    expect(sombrerosEnElCodigo(conLlave, { mundoActual: 6 })).toContain('sombrero-de-la-llave')
  })

  it('después de que te lo cuenten ya no tiene mérito', () => {
    const conLlave = '<li v-for="s in lista" :key="s.id">x</li>'
    expect(sombrerosEnElCodigo(conLlave, { mundoActual: 11 })).not.toContain('sombrero-de-la-llave')
    expect(sombrerosEnElCodigo(conLlave, { mundoActual: 20 })).not.toContain('sombrero-de-la-llave')
  })

  it('un fichero normal no da ningún sombrero', () => {
    const normal = `<script setup>
import { ref } from 'vue'
const sombreros = ref([])
</script>

<template>
  <h1>Mi tienda</h1>
</template>`
    expect(sombrerosEnElCodigo(normal, { mundoActual: 5 })).toEqual([])
  })

  it('sin opciones, se asume el primer mundo', () => {
    expect(sombrerosEnElCodigo('<li v-for="s in l" :key="s">x</li>')).toContain(
      'sombrero-de-la-llave',
    )
  })
})

describe('los sombreros de la terminal', () => {
  it('ejecutar las pruebas cuenta, en sus varias formas', () => {
    for (const orden of ['npm test', 'npm run test', 'npx vitest', 'vitest', '  npm test  ']) {
      expect(sombreroDelComando(orden), orden).toBe('bombin-de-la-terminal')
    }
  })

  it('el guiño a los gatos también', () => {
    for (const orden of ['gato', 'croquetas', 'miau', 'Gato']) {
      expect(sombreroDelComando(orden), orden).toBe('sombrero-del-gato')
    }
  })

  it('un comando normal no da nada', () => {
    for (const orden of ['npm run build', 'node -v', 'git status', 'dir', '']) {
      expect(sombreroDelComando(orden), orden).toBeNull()
    }
  })

  it('no se cuela por parecerse', () => {
    // `npm run testigo` no es ejecutar las pruebas, y `gatos.js` es un fichero.
    expect(sombreroDelComando('npm run testigo')).toBeNull()
    expect(sombreroDelComando('node gatos.js')).toBeNull()
  })
})
