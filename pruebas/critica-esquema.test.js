import { describe, expect, it } from 'vitest'
import { criticar, veredicto } from '../src/motor/critica-esquema.js'

// Constructores de esquema con la misma forma que devuelve motor/sql.js.
const columna = (nombre, tipo = 'TEXT', extra = {}) => ({
  nombre,
  tipo,
  obligatoria: false,
  porDefecto: null,
  clavePrimaria: false,
  ordenEnClave: 0,
  ...extra,
})

const clave = (nombre, tipo = 'INTEGER') => columna(nombre, tipo, { clavePrimaria: true, ordenEnClave: 1 })

const tabla = (nombre, columnas, { clavesAjenas = [], indices = [] } = {}) => ({
  nombre,
  sql: '',
  columnas,
  clavesAjenas,
  indices,
})

const tiposDe = (avisos) => avisos.map((aviso) => aviso.tipo)

describe('clave primaria', () => {
  it('avisa si falta', () => {
    const avisos = criticar([tabla('sombreros', [columna('nombre')])])
    expect(tiposDe(avisos)).toContain('sin_clave_primaria')
    expect(avisos.find((a) => a.tipo === 'sin_clave_primaria').gravedad).toBe('alta')
  })

  it('calla si esta', () => {
    const avisos = criticar([tabla('sombreros', [clave('id'), columna('nombre', 'TEXT', { obligatoria: true })])])
    expect(tiposDe(avisos)).not.toContain('sin_clave_primaria')
  })
})

describe('claves ajenas', () => {
  const usuarios = tabla('usuarios', [clave('id'), columna('email', 'TEXT', { obligatoria: true })])

  it('detecta una columna _id que apunta a una tabla existente sin declararlo', () => {
    const votos = tabla('votos', [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true })])
    const avisos = criticar([usuarios, votos])

    const aviso = avisos.find((a) => a.tipo === 'ajena_sin_declarar')
    expect(aviso).toBeTruthy()
    expect(aviso.columna).toBe('usuario_id')
    expect(aviso.gravedad).toBe('alta')
  })

  it('no se inventa nada si la tabla destino no existe', () => {
    const votos = tabla('votos', [clave('id'), columna('cosa_id', 'INTEGER', { obligatoria: true })])
    expect(tiposDe(criticar([votos]))).not.toContain('ajena_sin_declarar')
  })

  it('acepta el plural: usuario_id contra la tabla usuarios', () => {
    const votos = tabla('votos', [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true })])
    expect(tiposDe(criticar([usuarios, votos]))).toContain('ajena_sin_declarar')
  })

  it('avisa de la ajena declarada pero sin indice', () => {
    const votos = tabla(
      'votos',
      [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true })],
      { clavesAjenas: [{ columna: 'usuario_id', tablaDestino: 'usuarios', columnaDestino: 'id', alBorrar: 'CASCADE' }] },
    )
    expect(tiposDe(criticar([usuarios, votos]))).toContain('ajena_sin_indice')
  })

  it('calla si la ajena si tiene indice', () => {
    const votos = tabla(
      'votos',
      [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true })],
      {
        clavesAjenas: [{ columna: 'usuario_id', tablaDestino: 'usuarios', columnaDestino: 'id', alBorrar: 'CASCADE' }],
        indices: [{ nombre: 'idx_votos_usuario', unico: false, automatico: false, columnas: ['usuario_id'] }],
      },
    )
    expect(tiposDe(criticar([usuarios, votos]))).not.toContain('ajena_sin_indice')
  })

  // El orden de las columnas de un indice importa: uno sobre (a, b) sirve
  // para buscar por a, pero uno sobre (b, a) no.
  it('un indice que no empieza por esa columna no cuenta', () => {
    const votos = tabla(
      'votos',
      [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true })],
      {
        clavesAjenas: [{ columna: 'usuario_id', tablaDestino: 'usuarios', columnaDestino: 'id', alBorrar: 'CASCADE' }],
        indices: [{ nombre: 'idx_raro', unico: false, automatico: false, columnas: ['sombrero_id', 'usuario_id'] }],
      },
    )
    expect(tiposDe(criticar([usuarios, votos]))).toContain('ajena_sin_indice')
  })

  it('no pide indice si la ajena ya es la clave primaria', () => {
    const perfil = tabla(
      'perfiles',
      [clave('usuario_id')],
      { clavesAjenas: [{ columna: 'usuario_id', tablaDestino: 'usuarios', columnaDestino: 'id', alBorrar: 'CASCADE' }] },
    )
    expect(tiposDe(criticar([usuarios, perfil]))).not.toContain('ajena_sin_indice')
  })
})

describe('tipos', () => {
  it('avisa de la columna sin tipo', () => {
    const t = tabla('cosas', [clave('id'), columna('nombre', '')])
    expect(tiposDe(criticar([t]))).toContain('tipo_ausente')
  })

  it('explica que el VARCHAR(50) de SQLite no limita nada', () => {
    const t = tabla('cosas', [clave('id'), columna('nombre', 'VARCHAR(50)', { obligatoria: true })])
    const aviso = criticar([t]).find((a) => a.tipo === 'longitud_ignorada')
    expect(aviso).toBeTruthy()
    expect(aviso.explicacion).toContain('CHECK')
  })

  it('senala fechas con tipo raro y respeta las razonables', () => {
    const malo = tabla('cosas', [clave('id'), columna('creado_en', 'REAL')])
    expect(tiposDe(criticar([malo]))).toContain('fecha_con_tipo_raro')

    const bueno = tabla('cosas', [clave('id'), columna('creado_en', 'TEXT', { obligatoria: true })])
    expect(tiposDe(criticar([bueno]))).not.toContain('fecha_con_tipo_raro')
  })

  it('senala booleanos guardados como texto', () => {
    const t = tabla('cosas', [clave('id'), columna('es_visible', 'TEXT')])
    expect(tiposDe(criticar([t]))).toContain('booleano_en_texto')
  })
})

describe('columnas obligatorias', () => {
  it('avisa si absolutamente todo es opcional', () => {
    const t = tabla('cosas', [columna('a'), columna('b')])
    expect(tiposDe(criticar([t]))).toContain('todo_opcional')
  })

  it('calla si hay al menos una obligatoria', () => {
    const t = tabla('cosas', [clave('id'), columna('nombre', 'TEXT', { obligatoria: true })])
    expect(tiposDe(criticar([t]))).not.toContain('todo_opcional')
  })
})

describe('orden y veredicto', () => {
  it('lo grave va primero', () => {
    const t = tabla('cosas', [columna('nombre', 'VARCHAR(10)')])
    const avisos = criticar([t])
    expect(avisos[0].gravedad).toBe('alta')
  })

  it('el veredicto cambia segun lo que haya', () => {
    expect(veredicto([])).toContain('ningun pero')
    expect(veredicto([{ gravedad: 'alta' }])).toContain('deberia estar impidiendo')
    expect(veredicto([{ gravedad: 'baja' }])).toContain('se sostiene')
  })

  it('un esquema bien hecho no genera nada', () => {
    const usuarios = tabla('usuarios', [clave('id'), columna('email', 'TEXT', { obligatoria: true })])
    const votos = tabla(
      'votos',
      [clave('id'), columna('usuario_id', 'INTEGER', { obligatoria: true }), columna('creado_en', 'TEXT', { obligatoria: true })],
      {
        clavesAjenas: [{ columna: 'usuario_id', tablaDestino: 'usuarios', columnaDestino: 'id', alBorrar: 'CASCADE' }],
        indices: [{ nombre: 'idx_votos_usuario', unico: false, automatico: false, columnas: ['usuario_id'] }],
      },
    )
    expect(criticar([usuarios, votos])).toEqual([])
  })
})
