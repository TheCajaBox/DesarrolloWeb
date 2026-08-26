import { describe, expect, it } from 'vitest'
import {
  cambiadoRespectoA,
  comprobarVue,
  declara,
  hay,
  scriptContiene,
  textoDeAlMenos,
} from '../src/contenido/mundos/comprobaciones.js'

const vue = (contenido) => ({ 'src/App.vue': contenido })

const BASE = `<script setup>
</script>

<template>
  <main>
    <h1>Cambia esto</h1>
  </main>
</template>

<style scoped>
main { max-width: 40rem; }
</style>
`

describe('comprobarVue', () => {
  it('comprueba el template como HTML', () => {
    const comprobar = comprobarVue({
      template: [cambiadoRespectoA('h1', 'Cambia esto', { igual: 'sigue igual' })],
      exito: 'bien',
    })

    expect(comprobar(vue(BASE)).mensaje).toBe('sigue igual')
    expect(comprobar(vue(BASE.replace('Cambia esto', 'Sombreros'))).superado).toBe(true)
  })

  it('comprueba el estilo como CSS', () => {
    const comprobar = comprobarVue({
      estilo: [declara('main', 'padding', { falta: 'falta padding' })],
      exito: 'bien',
    })

    expect(comprobar(vue(BASE)).mensaje).toBe('falta padding')
    expect(comprobar(vue(BASE.replace('max-width: 40rem;', 'padding: 1rem;'))).superado).toBe(true)
  })

  it('comprueba el script con un patrón', () => {
    const comprobar = comprobarVue({
      script: [scriptContiene(/\bref\s*\(/, { falta: 'usa un ref' })],
      exito: 'bien',
    })

    expect(comprobar(vue(BASE)).mensaje).toBe('usa un ref')
    const conRef = BASE.replace('</script>', "const t = ref('x')\n</script>")
    expect(comprobar(vue(conRef)).superado).toBe(true)
  })

  it('los requisitos de template van en orden y gana el primero que falla', () => {
    const comprobar = comprobarVue({
      template: [hay('article'), hay('h2')],
      exito: 'bien',
    })
    expect(comprobar(vue(BASE)).mensaje).toContain('article')
  })

  // Lo pedagógicamente potente: si el .vue no compila, sale el error real de
  // Vue, no un mensaje genérico.
  it('un .vue roto devuelve el error del parser', () => {
    const roto = '<template><main><h1>sin cerrar el main</template>'
    const r = comprobarVue({ template: [hay('h1')], exito: 'bien' })(vue(roto))
    expect(r.superado).toBe(false)
    expect(r.mensaje.toLowerCase()).toMatch(/compila|tag|template/)
  })

  it('mezcla template y estilo, con el mensaje de éxito al final', () => {
    const comprobar = comprobarVue({
      template: [textoDeAlMenos('h1', 3)],
      estilo: [declara('main', 'max-width')],
      exito: (p) => `${p.estilos.length} bloque de estilo, y todo en su sitio.`,
    })
    const r = comprobar(vue(BASE.replace('Cambia esto', 'Los sombreros')))
    expect(r.superado).toBe(true)
    expect(r.mensaje).toContain('bloque de estilo')
  })

  it('con basura no revienta', () => {
    const comprobar = comprobarVue({ template: [hay('h1')], exito: 'bien' })
    for (const basura of [{}, vue(''), vue(null), vue('<<<')]) {
      expect(() => comprobar(basura)).not.toThrow()
      expect(comprobar(basura).superado).toBe(false)
    }
  })
})
