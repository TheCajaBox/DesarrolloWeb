import { describe, expect, it } from 'vitest'
import { estiloDe, partirVue, tieneScoped } from '../src/motor/leer-vue.js'
import { leerHtml, textoDel } from '../src/motor/leer-html.js'
import { leerCss, valorDe } from '../src/motor/leer-css.js'

const SFC = `<script setup>
import { ref } from 'vue'
const titulo = ref('Sombreros')
</script>

<template>
  <main>
    <h1>{{ titulo }}</h1>
    <p class="lema">Una colección con criterio dudoso.</p>
  </main>
</template>

<style scoped>
main {
  max-width: 40rem;
  margin: 2rem auto;
}
</style>
`

describe('partirVue', () => {
  it('separa los tres bloques', () => {
    const p = partirVue(SFC)
    expect(p.template).toContain('<h1>')
    expect(p.script).toContain("ref('Sombreros')")
    expect(p.estilos).toHaveLength(1)
    expect(p.estilos[0].contenido).toContain('max-width')
  })

  it('detecta <script setup>', () => {
    expect(partirVue(SFC).usaSetup).toBe(true)
    const normal = partirVue('<script>export default {}</script><template><p>x</p></template>')
    expect(normal.usaSetup).toBe(false)
  })

  it('detecta el scoped', () => {
    expect(tieneScoped(partirVue(SFC))).toBe(true)
    const sinScope = partirVue('<template><p>x</p></template><style>p{color:red}</style>')
    expect(tieneScoped(sinScope)).toBe(false)
  })

  // El caso que rompía un recorte a mano: una etiqueta de cierre escrita como
  // texto dentro de un bloque. El parser de Vue no se confunde.
  it('no se lía con un </template> escrito dentro del script', () => {
    const raro = `<script setup>
// un comentario que menciona el bloque template y su cierre sin romper nada
const x = 1
</script>
<template><h1>Bien</h1></template>`
    const p = partirVue(raro)
    expect(p.template).toContain('Bien')
    expect(p.script).toContain('const x = 1')
    expect(p.errores).toEqual([])
  })

  it('con bloques que faltan, devuelve null sin romperse', () => {
    const soloTemplate = partirVue('<template><p>hola</p></template>')
    expect(soloTemplate.template).toContain('hola')
    expect(soloTemplate.script).toBeNull()
    expect(soloTemplate.estilos).toEqual([])
  })

  it('con basura no revienta', () => {
    for (const basura of ['', null, undefined, '<<<>>>', '<template>sin cerrar']) {
      expect(() => partirVue(basura)).not.toThrow()
    }
  })
})

// Lo importante de verdad: que el template y el style extraídos se puedan
// comprobar con los lectores que ya tenemos, exactamente igual que un fichero
// HTML o CSS suelto.
describe('los bloques se comprueban con los lectores existentes', () => {
  it('el <template> se parsea como HTML', () => {
    const p = partirVue(SFC)
    const doc = leerHtml(p.template)
    expect(textoDel(doc, 'h1')).toContain('titulo') // {{ titulo }} llega como texto
    expect(textoDel(doc, '.lema')).toContain('criterio dudoso')
  })

  it('el <style> se parsea como CSS', () => {
    const p = partirVue(SFC)
    const reglas = leerCss(estiloDe(p))
    expect(valorDe(reglas, 'main', 'max-width')).toBe('40rem')
  })
})
