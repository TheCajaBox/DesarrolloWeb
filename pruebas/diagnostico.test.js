import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { traducirNivel, usarDiagnostico } from '../src/almacen/diagnostico.js'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('el nivel de un mensaje de consola', () => {
  // Electron ha cambiado esto de versión en versión: antes era un número y
  // ahora es texto. Si se lee mal, todo sale como «info» y los errores dejan
  // de verse, que es justo lo único que importaba.
  it('entiende el texto de las versiones nuevas', () => {
    expect(traducirNivel('error')).toBe('error')
    expect(traducirNivel('warning')).toBe('aviso')
    expect(traducirNivel('info')).toBe('info')
    expect(traducirNivel('debug')).toBe('detalle')
  })

  it('y los números de las viejas', () => {
    expect(traducirNivel(3)).toBe('error')
    expect(traducirNivel(2)).toBe('aviso')
    expect(traducirNivel(1)).toBe('info')
    expect(traducirNivel(0)).toBe('detalle')
  })

  it('con algo que no reconoce, lo trata como información', () => {
    expect(traducirNivel(undefined)).toBe('info')
    expect(traducirNivel('vete a saber')).toBe('info')
  })
})

describe('los problemas de compilación', () => {
  it('empieza sin ninguno', () => {
    expect(usarDiagnostico().hayProblema).toBe(false)
  })

  it('se guarda el que llega', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.ponerProblema({ mensaje: 'Unexpected token', fichero: 'src/App.vue', linea: 4 })

    expect(diagnostico.hayProblema).toBe(true)
    expect(diagnostico.problema.linea).toBe(4)
  })

  it('y se va cuando vuelve a compilar', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.ponerProblema({ mensaje: 'roto' })
    diagnostico.ponerProblema(null)

    expect(diagnostico.hayProblema).toBe(false)
  })
})

describe('la consola de la vista previa', () => {
  it('apunta lo que llega, en orden', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.apuntarMensaje({ nivel: 'info', texto: 'primero' })
    diagnostico.apuntarMensaje({ nivel: 'info', texto: 'segundo' })

    expect(diagnostico.mensajes.map((m) => m.texto)).toEqual(['primero', 'segundo'])
  })

  it('cada mensaje tiene identificador propio', () => {
    // Sin identificador estable, la lista de Vue reordena mal al llegar uno.
    const diagnostico = usarDiagnostico()
    for (let i = 0; i < 5; i += 1) diagnostico.apuntarMensaje({ nivel: 'info', texto: 'x' })

    const ids = diagnostico.mensajes.map((m) => m.id)
    expect(new Set(ids).size).toBe(5)
  })

  it('cuenta los errores y los avisos por separado', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.apuntarMensaje({ nivel: 'error', texto: 'a' })
    diagnostico.apuntarMensaje({ nivel: 3, texto: 'b' })
    diagnostico.apuntarMensaje({ nivel: 'warning', texto: 'c' })
    diagnostico.apuntarMensaje({ nivel: 'info', texto: 'd' })

    expect(diagnostico.errores).toBe(2)
    expect(diagnostico.avisos).toBe(1)
  })

  it('no crece sin fin: un taller abierto toda la tarde no se come la memoria', () => {
    const diagnostico = usarDiagnostico()
    for (let i = 0; i < 500; i += 1) diagnostico.apuntarMensaje({ nivel: 'info', texto: `n${i}` })

    expect(diagnostico.mensajes.length).toBeLessThanOrEqual(300)
    // Y lo que se tira es lo viejo, no lo último, que es lo que se está mirando.
    expect(diagnostico.mensajes[diagnostico.mensajes.length - 1].texto).toBe('n499')
  })

  it('un mensaje sin texto no revienta la lista', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.apuntarMensaje({ nivel: 'info' })
    expect(diagnostico.mensajes[0].texto).toBe('')
  })

  it('limpiar la deja vacía', () => {
    const diagnostico = usarDiagnostico()
    diagnostico.apuntarMensaje({ nivel: 'info', texto: 'algo' })
    diagnostico.limpiarConsola()
    expect(diagnostico.mensajes).toEqual([])
  })
})

// Lo de dónde salen los problemas y si Vite los manda por donde se le escucha
// se prueba en pruebas/problemas.test.js, contra un servidor de Vite de verdad
// con un componente roto: leer el código no habría demostrado nada de eso.
