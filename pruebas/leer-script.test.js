import { describe, expect, it } from 'vitest'
import {
  analizar,
  cuerpoDe,
  funciones,
  importa,
  importaciones,
  llama,
  llamadas,
  sinComentariosNiCadenas,
  variables,
} from '../src/motor/leer-script.js'

// Lo que importa de este módulo es que NO se deje engañar: un comentario no
// declara nada y una cadena no llama a nada. Cada prueba de aquí es una trampa
// que antes colaba con expresiones regulares.

describe('analizar', () => {
  it('dice que sí con código válido', () => {
    expect(analizar('const a = 1').ok).toBe(true)
  })

  it('dice qué falla y en qué línea, sin lanzar', () => {
    const r = analizar('const a = \nfunction (')
    expect(r.ok).toBe(false)
    expect(r.error).toBeTruthy()
    expect(r.linea).toBeGreaterThan(0)
  })

  it('acepta sintaxis moderna (import, await de nivel superior, opcional)', () => {
    const codigo = `
      import { ref } from 'vue'
      const datos = await fetch('/x')
      const n = objeto?.campo ?? 0
    `
    expect(analizar(codigo).ok).toBe(true)
  })

  it('con vacío o nulo no revienta', () => {
    expect(analizar('').ok).toBe(false)
    expect(analizar(null).ok).toBe(false)
  })
})

describe('variables declaradas', () => {
  it('encuentra la variable y con qué se inicializa', () => {
    const encontradas = variables("const sombreros = ref([])")
    expect(encontradas[0]).toMatchObject({ nombre: 'sombreros', tipo: 'const', llamando: 'ref' })
  })

  it('NO se cree un comentario', () => {
    const encontradas = variables("// const sombreros = ref([])\nconst otra = 1")
    expect(encontradas.map((v) => v.nombre)).toEqual(['otra'])
  })

  it('NO se cree una cadena de texto', () => {
    const encontradas = variables("const nota = 'usa const sombreros = ref([]) aquí'")
    expect(encontradas).toHaveLength(1)
    expect(encontradas[0].llamando).toBe(null)
  })

  it('distingue una función asignada a una constante', () => {
    const encontradas = variables('const saludar = () => 1')
    expect(encontradas[0].esFuncion).toBe(true)
  })
})

describe('funciones declaradas', () => {
  it('las encuentra de las tres formas', () => {
    const codigo = `
      function unaDeclarada() {}
      const unaFlecha = () => {}
      const almacen = { unMetodo() {} }
    `
    const nombres = funciones(codigo)
    expect(nombres).toContain('unaDeclarada')
    expect(nombres).toContain('unaFlecha')
    expect(nombres).toContain('unMetodo')
  })

  it('no cuela una función comentada', () => {
    expect(funciones('// function fantasma() {}')).toEqual([])
  })
})

describe('llamadas', () => {
  it('encuentra llamadas simples y con punto', () => {
    const codigo = "sombreros.value.push({}); localStorage.setItem('a', 'b'); ref(0)"
    const nombres = llamadas(codigo).map((l) => l.nombre)
    expect(nombres).toContain('sombreros.value.push')
    expect(nombres).toContain('localStorage.setItem')
    expect(nombres).toContain('ref')
  })

  it('llama() responde por nombre completo', () => {
    expect(llama("localStorage.setItem('a','b')", 'localStorage.setItem')).toBe(true)
    expect(llama("// localStorage.setItem('a','b')", 'localStorage.setItem')).toBe(false)
  })

  it('no cuela una llamada escrita dentro de una cadena', () => {
    expect(llama("const t = 'localStorage.setItem(1)'", 'localStorage.setItem')).toBe(false)
  })
})

describe('importaciones', () => {
  it('lee los nombres y de dónde vienen', () => {
    const codigo = "import { ref, computed } from 'vue'\nimport Ficha from './components/Ficha.vue'"
    const leidas = importaciones(codigo)
    expect(leidas[0]).toMatchObject({ de: 'vue', nombres: ['ref', 'computed'] })
    expect(leidas[1].porDefecto).toBe('Ficha')
  })

  it('importa() acepta rutas relativas equivalentes', () => {
    const codigo = "import { usarCesta } from '../stores/cesta.js'"
    expect(importa(codigo, 'usarCesta', 'stores/cesta')).toBe(true)
    expect(importa(codigo, 'usarCesta', './stores/cesta.js')).toBe(true)
    expect(importa(codigo, 'otraCosa', 'stores/cesta')).toBe(false)
  })

  it('no cuela un import comentado', () => {
    expect(importa("// import { ref } from 'vue'", 'ref', 'vue')).toBe(false)
  })
})

describe('cuerpo de una función', () => {
  it('devuelve lo que hay dentro, para poder preguntar', () => {
    const codigo = 'function meter(x) { this.lineas.push(x); this.persistir() }'
    const cuerpo = cuerpoDe(codigo, 'meter')
    expect(cuerpo).toContain('persistir')
  })

  it('lo encuentra también en un método de objeto', () => {
    const codigo = 'const s = { actions: { meter(x) { this.persistir() } } }'
    expect(cuerpoDe(codigo, 'meter')).toContain('persistir')
  })

  it('devuelve null si no existe', () => {
    expect(cuerpoDe('const a = 1', 'meter')).toBe(null)
  })
})

describe('limpiar comentarios y cadenas', () => {
  it('borra el contenido pero mantiene las posiciones', () => {
    const codigo = "const a = 1 // ref(0)\nconst b = 'ref(0)'"
    const limpio = sinComentariosNiCadenas(codigo)
    expect(limpio).not.toMatch(/ref\(0\)/)
    expect(limpio.length).toBe(codigo.length)
    expect(limpio).toContain('const a = 1')
  })

  it('deja en paz el código de verdad', () => {
    const codigo = 'watch(favoritos, () => {}, { deep: true })'
    expect(sinComentariosNiCadenas(codigo)).toContain('deep: true')
  })

  it('si no compila, devuelve el texto tal cual', () => {
    const roto = 'const a = ('
    expect(sinComentariosNiCadenas(roto)).toBe(roto)
  })
})
