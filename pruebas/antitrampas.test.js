import { describe, expect, it } from 'vitest'
import mundos from '../src/contenido/vue/indice.js'

// Las comprobaciones del taller nacieron buscando texto con expresiones
// regulares, y eso se podía burlar de dos formas tontas:
//
//   // const sombreros = ref([])          ← comentar la respuesta
//   const nota = 'const sombreros = ref([])'   ← ponerla en una cadena
//
// Estas pruebas meten la solución ENTERA dentro de un comentario o de una
// cadena y exigen que el paso NO se apruebe. Si alguien vuelve a escribir una
// comprobación laxa, aquí se cae.

const deFicheros = mundos.filter((mundo) => !mundo.sql && mundo.solucion)

// Envuelve el <script> de un .vue: su contenido pasa a estar comentado.
function comentarScript(fuente) {
  return String(fuente).replace(
    /<script setup>([\s\S]*?)<\/script>/,
    (_todo, dentro) =>
      `<script setup>\n${dentro
        .split('\n')
        .map((linea) => `// ${linea}`)
        .join('\n')}\n</script>`,
  )
}

// Mete el script entero dentro de una cadena de texto.
function encadenarScript(fuente) {
  return String(fuente).replace(
    /<script setup>([\s\S]*?)<\/script>/,
    (_todo, dentro) => `<script setup>\nconst nota = ${JSON.stringify(dentro)}\n</script>`,
  )
}

function trasformarSolucion(solucion, transformar) {
  const copia = {}
  for (const [ruta, contenido] of Object.entries(solucion)) {
    copia[ruta] = ruta.endsWith('.vue') ? transformar(contenido) : contenido
  }
  return copia
}

// Solo interesan los pasos que comprueban el <script>: comentar el script no
// toca la plantilla, así que los de template y estilo siguen aprobando y no
// dicen nada de la laxitud. comprobarVue marca cada comprobador con lo que
// mira (usaScript), así que no hay que adivinarlo.
function pasosDeScript(mundo) {
  return mundo.pasos.filter((paso) => !paso.tipo && paso.comprobar?.usaScript)
}

describe('la respuesta comentada no aprueba', () => {
  for (const mundo of deFicheros) {
    const pasos = pasosDeScript(mundo)
    if (!pasos.length) continue

    it(`mundo ${mundo.numero}: comentar el script no supera sus pasos de script`, async () => {
      const trampa = trasformarSolucion(mundo.solucion, comentarScript)

      for (const paso of pasos) {
        const resultado = await paso.comprobar(trampa, paso.respuestaCorrecta ?? null)
        expect(
          resultado.superado,
          `${paso.id} se aprueba con la respuesta COMENTADA: la comprobación es laxa`,
        ).toBe(false)
      }
    })
  }
})

// La segunda trampa (meter el script dentro de una cadena) es menos realista
// —así la app de la alumna no funcionaría— y no se puede exigir en todas
// partes: hay comprobaciones que buscan legítimamente DENTRO de cadenas, como
// `from 'vue'`, el nombre de un evento en defineEmits o la ruta de un import.
// Se exige en el acto de los datos, donde todo el código vive en un fichero y
// las comprobaciones ya preguntan al árbol.
const CON_CADENA_ESTRICTA = deFicheros.filter((mundo) => mundo.acto === 'Datos')

describe('la respuesta dentro de una cadena no aprueba (acto de los datos)', () => {
  for (const mundo of CON_CADENA_ESTRICTA) {
    const pasos = pasosDeScript(mundo)
    if (!pasos.length) continue

    it(`mundo ${mundo.numero}: meter el script en una cadena no supera sus pasos`, async () => {
      const trampa = trasformarSolucion(mundo.solucion, encadenarScript)

      for (const paso of pasos) {
        const resultado = await paso.comprobar(trampa, paso.respuestaCorrecta ?? null)
        expect(
          resultado.superado,
          `${paso.id} se aprueba con la respuesta metida en una CADENA`,
        ).toBe(false)
      }
    })
  }
})
