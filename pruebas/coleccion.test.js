import { readFileSync, readdirSync } from 'node:fs'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { diaDe, usarColeccion } from '../src/almacen/coleccion.js'
import sombreros, { IDS, sombreroPorId } from '../src/contenido/sombreros.js'

// Los sombreros escondidos no bloquean nada del curso, así que un fallo aquí no
// deja a nadie tirado. Pero sí puede dar el premio dos veces, dárselo a quien
// no ha hecho nada, o perderlo al cerrar la app: eso es peor que no tenerlos.

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('el catálogo', () => {
  it('cada sombrero tiene id, nombre, pista y su frase de Wayne', () => {
    for (const sombrero of sombreros) {
      expect(sombrero.id).toMatch(/^[a-z0-9-]+$/)
      expect(sombrero.nombre.length).toBeGreaterThan(5)
      expect(sombrero.pista.length).toBeGreaterThan(20)
      expect(sombrero.wayne.length).toBeGreaterThan(30)
    }
  })

  it('no hay dos con el mismo id', () => {
    expect(new Set(IDS).size).toBe(IDS.length)
  })

  it('ni dos con el mismo nombre', () => {
    const nombres = sombreros.map((s) => s.nombre)
    expect(new Set(nombres).size).toBe(nombres.length)
  })

  it('la pista no dice literalmente qué pulsar', () => {
    // Si la pista contiene la instrucción exacta, deja de ser una pista. No es
    // una prueba infalible, pero caza el descuido de escribirla como un manual.
    for (const sombrero of sombreros) {
      expect(sombrero.pista, sombrero.id).not.toMatch(/pulsa|haz clic|botón de/i)
    }
  })

  it('sombreroPorId encuentra y no inventa', () => {
    expect(sombreroPorId(IDS[0])?.id).toBe(IDS[0])
    expect(sombreroPorId('sombrero-que-no-existe')).toBeNull()
  })
})

describe('encontrar sombreros', () => {
  it('el primero es nuevo y el segundo intento ya no', () => {
    const coleccion = usarColeccion()

    expect(coleccion.encontrar('bombin-de-la-terminal')?.id).toBe('bombin-de-la-terminal')
    // La segunda vez devuelve null: quien llama no vuelve a celebrarlo, y así
    // se puede llamar sin miedo cada vez que se pasa por el mismo sitio.
    expect(coleccion.encontrar('bombin-de-la-terminal')).toBeNull()
    expect(coleccion.cuantos).toBe(1)
  })

  it('un id inventado no ensucia la colección', () => {
    const coleccion = usarColeccion()
    expect(coleccion.encontrar('sombrero-de-pega')).toBeNull()
    expect(coleccion.cuantos).toBe(0)
  })

  it('sobrevive a cerrar y abrir el taller', () => {
    const coleccion = usarColeccion()
    coleccion.encontrar('sombrero-de-armonia')

    // Otra sesión, mismo navegador.
    setActivePinia(createPinia())
    const otra = usarColeccion()
    expect(otra.tiene('sombrero-de-armonia')).toBe(true)
    expect(otra.cuantos).toBe(1)
  })

  it('lo guardado de una versión vieja no arrastra basura', () => {
    localStorage.setItem(
      'sombrero-coleccion',
      JSON.stringify(['sombrero-de-armonia', 'sombrero-retirado', 42, null]),
    )
    setActivePinia(createPinia())

    const coleccion = usarColeccion()
    expect(coleccion.encontrados).toEqual(['sombrero-de-armonia'])
  })

  it('la vitrina dice de cada uno si está o falta, y en orden', () => {
    const coleccion = usarColeccion()
    coleccion.encontrar(IDS[1])

    const vitrina = coleccion.vitrina
    expect(vitrina).toHaveLength(sombreros.length)
    expect(vitrina.map((v) => v.id)).toEqual(IDS)
    expect(vitrina[0].encontrado).toBe(false)
    expect(vitrina[1].encontrado).toBe(true)
    // La pista viaja con la silueta: es lo que se enseña de los que faltan.
    expect(vitrina[0].pista).toBeTruthy()
  })

  it('la colección está completa solo con todos', () => {
    const coleccion = usarColeccion()
    for (const id of IDS.slice(0, -1)) coleccion.encontrar(id)
    expect(coleccion.completa).toBe(false)

    coleccion.encontrar(IDS[IDS.length - 1])
    expect(coleccion.completa).toBe(true)
  })

  it('el último encontrado se recuerda para celebrarlo y luego se suelta', () => {
    const coleccion = usarColeccion()
    coleccion.encontrar('sombrero-del-gato')
    expect(coleccion.ultimo?.id).toBe('sombrero-del-gato')

    coleccion.olvidarUltimo()
    expect(coleccion.ultimo).toBeNull()
  })
})

describe('el de la madrugada', () => {
  const aLas = (hora) => new Date(2026, 7, 25, hora, 30)

  it('se gana de madrugada', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarLaHora(aLas(2))?.id).toBe('sombrero-de-medianoche')
  })

  it('a media tarde no', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarLaHora(aLas(17))).toBeNull()
    expect(coleccion.cuantos).toBe(0)
  })

  it('a las cinco ya no es madrugada, es madrugar', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarLaHora(aLas(5))).toBeNull()
  })

  it('no se da dos veces aunque se abra varias noches', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarLaHora(aLas(1))).not.toBeNull()
    expect(coleccion.revisarLaHora(aLas(1))).toBeNull()
    expect(coleccion.cuantos).toBe(1)
  })
})

describe('el del que vuelve', () => {
  const elDia = (dia) => new Date(2026, 7, dia, 18, 0)

  it('hacen falta tres días distintos', () => {
    const coleccion = usarColeccion()
    expect(coleccion.apuntarVisita(elDia(1))).toBeNull()
    expect(coleccion.apuntarVisita(elDia(2))).toBeNull()
    expect(coleccion.apuntarVisita(elDia(3))?.id).toBe('sombrero-del-que-vuelve')
  })

  it('abrir diez veces el mismo día no es constancia', () => {
    const coleccion = usarColeccion()
    for (let i = 0; i < 10; i += 1) coleccion.apuntarVisita(elDia(1))
    expect(coleccion.cuantos).toBe(0)
    expect(coleccion.dias).toEqual(['2026-08-01'])
  })

  it('los días sobreviven entre sesiones', () => {
    const coleccion = usarColeccion()
    coleccion.apuntarVisita(elDia(1))

    setActivePinia(createPinia())
    const otra = usarColeccion()
    otra.apuntarVisita(elDia(2))
    expect(otra.apuntarVisita(elDia(3))?.id).toBe('sombrero-del-que-vuelve')
  })

  it('no guarda el historial entero de por vida', () => {
    const coleccion = usarColeccion()
    for (let dia = 1; dia <= 10; dia += 1) coleccion.apuntarVisita(elDia(dia))
    expect(coleccion.dias.length).toBeLessThanOrEqual(3)
  })
})

describe('el día de una fecha', () => {
  it('sale con ceros delante, para que ordene bien como texto', () => {
    expect(diaDe(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(diaDe(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('el del terco y el limpio', () => {
  it('insistir cinco veces y sacarlo cuenta', () => {
    const coleccion = usarColeccion()
    for (let i = 0; i < 5; i += 1) coleccion.apuntarFallo('paso-duro')
    expect(coleccion.revisarLaTerquedad('paso-duro')?.id).toBe('sombrero-del-terco')
  })

  it('cuatro fallos todavía no', () => {
    const coleccion = usarColeccion()
    for (let i = 0; i < 4; i += 1) coleccion.apuntarFallo('paso-duro')
    expect(coleccion.revisarLaTerquedad('paso-duro')).toBeNull()
  })

  it('los fallos son de cada paso, no de todos juntos', () => {
    // Fallar cinco pasos distintos una vez cada uno no es insistir.
    const coleccion = usarColeccion()
    for (const id of ['a', 'b', 'c', 'd', 'e']) coleccion.apuntarFallo(id)
    expect(coleccion.revisarLaTerquedad('a')).toBeNull()
  })

  it('la cuenta de fallos sobrevive a cerrar el taller', () => {
    // Si no, «insistir cinco veces» no se conseguiría nunca en varias sesiones
    // y «un mundo sin fallar» se conseguiría reiniciando la aplicación.
    const coleccion = usarColeccion()
    for (let i = 0; i < 3; i += 1) coleccion.apuntarFallo('paso-duro')

    setActivePinia(createPinia())
    const otra = usarColeccion()
    otra.apuntarFallo('paso-duro')
    otra.apuntarFallo('paso-duro')
    expect(otra.revisarLaTerquedad('paso-duro')?.id).toBe('sombrero-del-terco')
  })

  it('un mundo sin un solo fallo da el limpio', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarElMundoLimpio(['p1', 'p2', 'p3'])?.id).toBe('sombrero-limpio')
  })

  it('con un solo tropiezo, no', () => {
    const coleccion = usarColeccion()
    coleccion.apuntarFallo('p2')
    expect(coleccion.revisarElMundoLimpio(['p1', 'p2', 'p3'])).toBeNull()
  })

  it('un mundo sin pasos no cuenta como limpio', () => {
    const coleccion = usarColeccion()
    expect(coleccion.revisarElMundoLimpio([])).toBeNull()
    expect(coleccion.revisarElMundoLimpio(null)).toBeNull()
  })

  it('un fallo sin paso no ensucia la cuenta', () => {
    const coleccion = usarColeccion()
    coleccion.apuntarFallo(null)
    coleccion.apuntarFallo('')
    expect(coleccion.fallos).toEqual({})
  })
})

const BARRA_INVERTIDA = String.fromCharCode(92)

describe('el catálogo y el código no se separan', () => {
  // Dos formas silenciosas de romper esto: premiar un id que ya no existe (el
  // sombrero no se da nunca y nadie se entera) o dejar en el catálogo uno que
  // ningún sitio otorga (una pista que es mentira). Las dos se cazan leyendo
  // el código.
  const ficheros = readdirSync('src', { recursive: true })
    .map(String)
    .filter((f) => /\.(js|vue)$/.test(f) && !f.endsWith('sombreros.js'))

  // readdirSync devuelve las rutas con la barra de Windows; readFileSync se
  // apaña igual, pero se normaliza para que la comparación sea la misma en
  // cualquier sistema.
  const fuentes = ficheros.map((f) => readFileSync(`src/${f.split(BARRA_INVERTIDA).join('/')}`, 'utf8'))
  const todoElCodigo = fuentes.join('\n')

  it('nadie premia un sombrero que no está en el catálogo', () => {
    const usados = new Set()
    for (const codigo of fuentes) {
      for (const encaje of codigo.matchAll(/encontrar\(\s*'([^']+)'\s*\)/g)) usados.add(encaje[1])
      for (const encaje of codigo.matchAll(/return '((?:sombrero|bombin|gorra|panama)-[a-z-]+)'/g)) {
        usados.add(encaje[1])
      }
    }

    expect(usados.size).toBeGreaterThan(4)
    for (const id of usados) {
      expect(IDS, `se premia «${id}», que no existe en el catálogo`).toContain(id)
    }
  })

  it('todos los del catálogo se pueden encontrar en algún sitio', () => {
    for (const id of IDS) {
      expect(
        todoElCodigo.includes(`'${id}'`),
        `«${id}» está en la sombrerera con su pista, pero nada en el taller lo otorga`,
      ).toBe(true)
    }
  })
})
