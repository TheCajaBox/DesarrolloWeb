import { describe, expect, it } from 'vitest'
import { repararProyecto, revisar } from '../taller-escritorio/reparar-proyecto.cjs'

// La reparación toca ficheros de otra persona, así que tiene que ser cobarde:
// solo repone lo que NO puede ser obra de nadie (un .vue con un HTML dentro).
// Un fichero a medias, con errores o vacío es alguien trabajando, y no se toca.

const APP_BUENA = `<script setup>
const n = 1
</script>

<template>
  <main><h1>Hola</h1></main>
</template>
`

const HTML_DENTRO_DEL_VUE = `<!doctype html>
<html lang="es"><head><title>Cambia esto</title></head>
<body><div id="app"></div></body></html>
`

describe('qué se considera roto', () => {
  it('un .vue con un documento HTML dentro está roto', () => {
    expect(revisar('src/App.vue', HTML_DENTRO_DEL_VUE).hayQueReponer).toBe(true)
  })

  it('un .vue normal no', () => {
    expect(revisar('src/App.vue', APP_BUENA).hayQueReponer).toBe(false)
  })

  it('un .vue a medias, mientras se escribe, NO se toca', () => {
    // Alguien empezando: solo el template, y sin cerrar.
    expect(revisar('src/App.vue', '<template>\n  <main>').hayQueReponer).toBe(false)
  })

  it('un .vue con código mal escrito tampoco se toca: eso es aprender', () => {
    const conFallo = `<script setup>
const roto = (
</script>

<template><p>hola</p></template>
`
    expect(revisar('src/App.vue', conFallo).hayQueReponer).toBe(false)
  })

  it('un .vue vacío no se toca', () => {
    expect(revisar('src/App.vue', '').hayQueReponer).toBe(false)
    expect(revisar('src/App.vue', '  \n ').hayQueReponer).toBe(false)
  })

  it('un .vue que solo tiene estilos se respeta', () => {
    expect(revisar('src/App.vue', '<style>\np { color: red }\n</style>').hayQueReponer).toBe(false)
  })

  it('un index.html con un componente dentro está roto', () => {
    expect(revisar('index.html', APP_BUENA).hayQueReponer).toBe(true)
  })

  it('un index.html normal no', () => {
    expect(revisar('index.html', HTML_DENTRO_DEL_VUE).hayQueReponer).toBe(false)
  })

  it('un fichero que no está en la lista nunca se toca', () => {
    expect(revisar('src/componentes/Mio.vue', HTML_DENTRO_DEL_VUE).hayQueReponer).toBe(false)
    expect(revisar('src/lo-que-sea.js', '').hayQueReponer).toBe(false)
  })
})

// Un disco de mentira: así se prueba la reparación sin tocar ficheros.
function discoDeMentira(ficheros) {
  const disco = { ...ficheros }
  return {
    disco,
    ayudas: {
      leer: (ruta) => disco[ruta],
      escribir: (ruta, contenido) => {
        disco[ruta] = contenido
      },
      existe: (ruta) => ruta in disco,
      plantilla: (relativa) => `plantilla/${relativa}`,
      proyecto: (relativa) => `proyecto/${relativa}`,
    },
  }
}

describe('la reparación', () => {
  it('repone el fichero roto con el de la plantilla', () => {
    const { disco, ayudas } = discoDeMentira({
      'plantilla/src/App.vue': APP_BUENA,
      'proyecto/src/App.vue': HTML_DENTRO_DEL_VUE,
    })

    const reparados = repararProyecto(ayudas)

    expect(reparados).toHaveLength(1)
    expect(reparados[0].ruta).toBe('src/App.vue')
    expect(disco['proyecto/src/App.vue']).toBe(APP_BUENA)
  })

  it('guarda lo roto aparte, en .reparados, por si había algo aprovechable', () => {
    const { disco, ayudas } = discoDeMentira({
      'plantilla/src/App.vue': APP_BUENA,
      'proyecto/src/App.vue': HTML_DENTRO_DEL_VUE,
    })

    repararProyecto(ayudas)

    expect(disco['proyecto/.reparados/src-App.vue']).toBe(HTML_DENTRO_DEL_VUE)
  })

  it('NO toca el trabajo de la alumna', () => {
    const suyo = `<script setup>
import { ref } from 'vue'
const misSombreros = ref(['bombín', 'panamá'])
</script>

<template>
  <h1>Mi tienda</h1>
</template>
`
    const { disco, ayudas } = discoDeMentira({
      'plantilla/src/App.vue': APP_BUENA,
      'proyecto/src/App.vue': suyo,
    })

    const reparados = repararProyecto(ayudas)

    expect(reparados).toEqual([])
    expect(disco['proyecto/src/App.vue']).toBe(suyo)
  })

  it('si no existe el fichero, no inventa nada', () => {
    const { ayudas } = discoDeMentira({ 'plantilla/src/App.vue': APP_BUENA })
    expect(repararProyecto(ayudas)).toEqual([])
  })

  it('apunta lo que ha hecho, para que quede rastro', () => {
    const apuntes = []
    const { ayudas } = discoDeMentira({
      'plantilla/src/App.vue': APP_BUENA,
      'proyecto/src/App.vue': HTML_DENTRO_DEL_VUE,
    })

    repararProyecto({ ...ayudas, apuntar: (linea) => apuntes.push(linea) })

    expect(apuntes).toHaveLength(1)
    expect(apuntes[0]).toMatch(/reparado/i)
    expect(apuntes[0]).toMatch(/\.reparados/)
  })

  it('repara varios a la vez si hace falta', () => {
    const { disco, ayudas } = discoDeMentira({
      'plantilla/src/App.vue': APP_BUENA,
      'plantilla/index.html': HTML_DENTRO_DEL_VUE,
      // Los dos cruzados: cada uno tiene el contenido del otro.
      'proyecto/src/App.vue': HTML_DENTRO_DEL_VUE,
      'proyecto/index.html': APP_BUENA,
    })

    const reparados = repararProyecto(ayudas)

    expect(reparados.map((r) => r.ruta).sort()).toEqual(['index.html', 'src/App.vue'])
    expect(disco['proyecto/src/App.vue']).toBe(APP_BUENA)
    expect(disco['proyecto/index.html']).toBe(HTML_DENTRO_DEL_VUE)
  })
})
