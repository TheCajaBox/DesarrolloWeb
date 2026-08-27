<script setup>
// La interfaz de la app de escritorio. Reutiliza los componentes del taller
// web (mapa, panel de lección, tipos de paso, Steris, Wayne) y los conecta al
// almacén de escritorio (contenido Vue, progreso local) y a los ficheros reales
// del proyecto de la alumna.
import {
  computed,
  onBeforeUnmount,
  onErrorCaptured,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue'
import { usarTaller } from './almacen/taller.js'
import { usarCurso } from './almacen/curso.js'
import { usarWayne } from './almacen/wayne.js'
import { usarColeccion } from './almacen/coleccion.js'
import { usarDiagnostico } from './almacen/diagnostico.js'
import { usarSql } from './almacen/sql.js'
import mundos from './contenido/vue/indice.js'
import {
  novedadesDeLaVersion,
  novedadesDesde,
  yaHabiaTaller,
} from './contenido/novedades.js'
import ArbolFicheros from './componentes/ArbolFicheros.vue'
import Armonia from './componentes/Armonia.vue'
import AvisoActualizacion from './componentes/AvisoActualizacion.vue'
import ConsolaNavegador from './componentes/ConsolaNavegador.vue'
import ConsolaSql from './componentes/ConsolaSql.vue'
import Problemas from './componentes/Problemas.vue'
import VisorEsquema from './componentes/VisorEsquema.vue'
import Dialogo from './componentes/Dialogo.vue'
import Editor from './componentes/Editor.vue'
import Glosario from './componentes/Glosario.vue'
import Mapa from './componentes/Mapa.vue'
import Novedades from './componentes/Novedades.vue'
import PanelMundo from './componentes/PanelMundo.vue'
import SombreroEncontrado from './componentes/SombreroEncontrado.vue'
import Sombrerera from './componentes/Sombrerera.vue'
import Steris from './componentes/Steris.vue'
import TerminalIntegrada from './componentes/Terminal.vue'
import VistaPreviaEscritorio from './componentes/VistaPreviaEscritorio.vue'
import WayneCompanero from './componentes/WayneCompanero.vue'
import { sombreroDeLoQuePasa, sombrerosEnElCodigo } from './motor/escondites.js'
import { avisar, pedirTexto, preguntar } from './motor/dialogos.js'

const taller = usarTaller()
const curso = usarCurso()
const sql = usarSql()
const coleccion = usarColeccion()
const diagnostico = usarDiagnostico()

// Los componentes reutilizados (Mapa, PanelMundo) piden el almacén por
// inyección. Se lo damos aquí: el de escritorio.
provide('almacenCurso', curso)

const cargando = ref(true)
const vista = ref('mapa')
const pestana = ref('leccion')

// Si un panel se rompe, se queda roto ÉL, no la aplicación: el error se para
// aquí y el resto (mapa, lección, guardado) sigue respondiendo sin recargar.
onErrorCaptured((error, _instancia, donde) => {
  console.error(`[taller] un panel ha fallado (${donde}):`, error)
  return false
})

// ---- Los anchos de las tres columnas ----
//
// Antes eran fijos, y con una lección larga el panel quedaba angosto sin que
// se pudiera hacer nada. Ahora se arrastran las manillas, como en cualquier
// editor, y el ancho elegido se recuerda.
const CLAVE_ANCHOS = 'sombrero-anchos'
const LIMITES = { lateral: [320, 900], derecha: [300, 1000] }

// Por defecto se reparte a lo ancho de la ventana, no con números fijos: con
// 520 y 620 clavados, en una pantalla de 1280 al editor le quedaban 126px.
function porDefecto() {
  const ancho = typeof window === 'undefined' ? 1440 : window.innerWidth
  const entre = (minimo, parte, maximo) => Math.round(Math.min(maximo, Math.max(minimo, ancho * parte)))
  return { lateral: entre(340, 0.27, 560), derecha: entre(300, 0.3, 620) }
}

function leerAnchos() {
  const base = porDefecto()
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ANCHOS) || '{}')
    return {
      lateral: Number(guardado.lateral) || base.lateral,
      derecha: Number(guardado.derecha) || base.derecha,
    }
  } catch {
    return base
  }
}

const anchos = ref(leerAnchos())
const arrastrando = ref(null)

// El centro nunca baja de 24rem: si las otras dos columnas se pasan de
// anchas, se recortan ellas y no el editor.
const columnas = computed(
  () =>
    `minmax(0, ${anchos.value.lateral}px) 7px minmax(24rem, 1fr) 7px minmax(0, ${anchos.value.derecha}px)`,
)

function arrastrar(cual, evento) {
  evento.preventDefault()
  arrastrando.value = cual

  const desdeX = evento.clientX
  const inicial = anchos.value[cual]
  const [minimo, maximo] = LIMITES[cual]

  const mover = (e) => {
    // La columna de la derecha crece hacia la izquierda: el signo se invierte.
    const avance = cual === 'lateral' ? e.clientX - desdeX : desdeX - e.clientX
    anchos.value = {
      ...anchos.value,
      [cual]: Math.min(maximo, Math.max(minimo, inicial + avance)),
    }
  }

  const soltar = () => {
    arrastrando.value = null
    // Al soltar, no al pulsar: un clic despistado en la manilla no cuenta como
    // haber reorganizado nada.
    if (Math.abs(anchos.value[cual] - inicial) > 8) {
      coleccion.encontrar('sombrero-del-que-ordena')
    }
    window.removeEventListener('pointermove', mover)
    window.removeEventListener('pointerup', soltar)
    try {
      localStorage.setItem(CLAVE_ANCHOS, JSON.stringify(anchos.value))
    } catch {
      /* sin persistencia; vale para esta sesión */
    }
  }

  window.addEventListener('pointermove', mover)
  window.addEventListener('pointerup', soltar)
}

// El acento cambia con el acto, como en el taller web.
const ACENTOS = {
  'Un componente': '#dfb96f',
  'Que se vea': '#c06840',
  Datos: '#86a95e',
  'Componentes que hablan': '#6f9bb5',
  'Varias pantallas': '#a986c0',
  'Estado compartido': '#5fae9e',
  'El servidor': '#7d89b0',
  Publicar: '#d9a13b',
  'La base de datos': '#6f9bb5',
  'Compilar y preparar': '#b0846f',
}
const acento = computed(() => ACENTOS[curso.mundo?.acto] || '#dfb96f')

const progreso = computed(() => {
  const total = mundos.reduce((n, m) => n + m.pasos.length, 0)
  const hechos = mundos
    .flatMap((m) => m.pasos)
    .filter((p) => curso.resultados[p.id]?.superado).length
  return { total, hechos, porcentaje: total ? Math.round((hechos / total) * 100) : 0 }
})

// Steris.
const steris = ref({ termino: null, error: null })
const explicarTermino = (t) => (steris.value = { termino: t, error: null })
const explicarError = (e) => (steris.value = { termino: null, error: e })
const callarASteris = () => (steris.value = { termino: null, error: null })

// ---- La terminal ----
//
// Vive debajo del editor, como en cualquier editor de código. El alto se
// arrastra y se recuerda; cerrarla no mata lo que esté corriendo.
const CLAVE_TERMINAL = 'sombrero-terminal'
// Qué se ve en el panel de abajo: 'terminal', 'problemas', 'consola' o nada.
// Antes solo estaba la terminal, y se guardaba un booleano; se sigue leyendo
// para no perderle a nadie el panel abierto al actualizar.
const panelAbajo = ref(null)

const terminalOcupada = ref(false)
const altoTerminal = ref(260)

// La terminal se esconde con v-show y no con v-if: cerrar el panel no debe
// matar el comando que esté corriendo ni perder lo que ya salió por pantalla.
// Por eso se pregunta si ALGUNA VEZ se abrió, para no montarla de balde.
const terminalUsada = ref(false)
const terminalAbierta = computed(() => panelAbajo.value === 'terminal')

function abrirAbajo(cual) {
  panelAbajo.value = panelAbajo.value === cual ? null : cual
  if (panelAbajo.value === 'terminal') terminalUsada.value = true
}

try {
  const guardado = JSON.parse(localStorage.getItem(CLAVE_TERMINAL) || '{}')
  // 'abierta' es de la versión en que abajo solo había terminal.
  panelAbajo.value = guardado.panel || (guardado.abierta ? 'terminal' : null)
  if (panelAbajo.value === 'terminal') terminalUsada.value = true
  altoTerminal.value = Number(guardado.alto) || 260
} catch {
  /* valores por defecto */
}

watch([panelAbajo, altoTerminal], () => {
  try {
    localStorage.setItem(
      CLAVE_TERMINAL,
      JSON.stringify({ panel: panelAbajo.value, alto: altoTerminal.value }),
    )
  } catch {
    /* sin persistencia; vale para esta sesión */
  }
})

function arrastrarAlto(evento) {
  evento.preventDefault()
  const desdeY = evento.clientY
  const inicial = altoTerminal.value

  const mover = (e) => {
    // Crece hacia arriba: el ratón sube, la terminal se hace más alta.
    altoTerminal.value = Math.min(700, Math.max(120, inicial + (desdeY - e.clientY)))
  }
  const soltar = () => {
    window.removeEventListener('pointermove', mover)
    window.removeEventListener('pointerup', soltar)
  }

  window.addEventListener('pointermove', mover)
  window.addEventListener('pointerup', soltar)
}

// ---- La columna de la derecha: resultado, base de datos o esquema ----
const salida = ref('vista')

async function abrirSql() {
  salida.value = 'sql'
  await sql.arrancar()
}

async function abrirEsquema() {
  salida.value = 'esquema'
  await sql.arrancar()
}

// Wayne acompañante: un almacén con memoria decide lo que dice, y el panel fijo
// lo muestra.
const wayne = usarWayne()

// Cuenta atrás de inactividad: si pasan minutos sin avanzar, Wayne se asoma.
let relojInactividad = null
function reiniciarInactividad() {
  clearTimeout(relojInactividad)
  relojInactividad = setTimeout(() => wayne.alInactividad(), 3 * 60 * 1000)
}

async function sembrarMundo() {
  if (!curso.mundo) return

  // Los mundos de base de datos no tienen ficheros: tienen una base de
  // partida. Y se abren mirando a la consola, que es donde se trabaja.
  if (curso.mundo.sql) {
    await sql.sembrar(curso.mundo.semilla)
    salida.value = 'sql'
    return
  }

  await taller.sembrar(curso.mundo.ficheros)
  if (salida.value !== 'vista') salida.value = 'vista'
}

// ---- Los sombreros escondidos ----
//
// Los escondites que dependen de un componente concreto (la terminal, el
// glosario, la consola) los apunta ese componente llamando al almacén. Aquí
// quedan los que solo se ven desde arriba: la hora, la constancia, lo que se
// escribe en los ficheros y lo que pasa fuera de la ventana.
//
// Las reglas viven en motor/escondites.js. Aquí solo se llama.
let dejarDeEscucharSucesos = null
let dejarDeEscucharProblemas = null

function revisarElCodigo(codigo) {
  if (!codigo) return
  for (const id of sombrerosEnElCodigo(codigo, { mundoActual: curso.numero })) {
    coleccion.encontrar(id)
  }
}

/**
 * Abre en el editor el fichero que ha dado el problema.
 *
 * Vite da la ruta del proyecto entero; aquí solo se puede abrir lo que está en
 * la lista de ficheros de la alumna, así que si no cuadra no se hace nada en
 * vez de abrir un fichero vacío que no es.
 */
function abrirDesdeElProblema(ruta) {
  if (!ruta) return
  const suyo = taller.ficheros.find((fichero) => fichero.ruta === ruta)
  if (suyo) taller.abrir(suyo.ruta)
}

/** El nombre del fichero sin la carpeta: en una pestaña no cabe la ruta. */
function soloElNombre(ruta) {
  return String(ruta || '').split('/').pop()
}

function verLaSombrerera() {
  coleccion.olvidarUltimo()
  pestana.value = 'sombreros'
}

// ---- El aviso de «novedades de la versión» ----
//
// Cuando la app se actualiza sola, lo suyo es contar qué ha cambiado. Se
// compara la versión que corre con la última que se vio y solo se enseña lo
// que haya pasado entre medias. En una instalación nueva no sale nada: quien
// acaba de instalar no tiene novedades, tiene un taller por delante.
const CLAVE_VERSION_VISTA = 'sombrero-version-vista'

const versionActual = ref('')
const novedades = ref([])

function apuntarVersionVista(version) {
  try {
    localStorage.setItem(CLAVE_VERSION_VISTA, version)
  } catch {
    /* sin localStorage el aviso saldrá otra vez, y no pasa nada */
  }
}

function cerrarNovedades() {
  novedades.value = []
  if (versionActual.value) apuntarVersionVista(versionActual.value)
}

async function mirarNovedades() {
  if (!window.taller?.version) return

  const version = await window.taller.version()
  if (!version) return
  versionActual.value = version

  let vista = null
  try {
    vista = localStorage.getItem(CLAVE_VERSION_VISTA)
  } catch {
    return
  }

  // Sin clave guardada hay dos casos muy distintos: acabar de instalar (no
  // hay novedades, hay taller) o venir de una versión anterior a este aviso.
  // Se distinguen por los rastros que deja el taller al usarse.
  let hay = []
  if (vista) hay = novedadesDesde(vista, version)
  else if (yaHabiaTaller(localStorage)) hay = novedadesDeLaVersion(version)
  if (hay.length) novedades.value = hay
  // Sin nada que contar (primera instalación, o ya vista) se apunta y punto.
  else apuntarVersionVista(version)
}

// ---- La actualización, cuando ella diga ----
//
// La app no se cierra sola: eso es de mala educación. Se descarga en segundo
// plano y aquí sale una tarjeta con el botón. Aparcarla («luego») solo la
// esconde; se volverá a ofrecer al abrir el taller la próxima vez.
const actualizacion = ref(null)
let dejarDeEscucharActualizaciones = null

function aparcarActualizacion() {
  actualizacion.value = null
  wayne.decirTexto('Vale, la dejamos para luego. Te la vuelvo a ofrecer la próxima vez que abras.')
}

onMounted(() => {
  if (!window.taller?.alActualizar) return

  dejarDeEscucharActualizaciones = window.taller.alActualizar(({ estado, version }) => {
    // Mientras baja no se dice nada: la tarjeta sale cuando ya está lista y
    // hay algo que decidir.
    if (estado !== 'lista') return

    actualizacion.value = { version: version || '' }
    wayne.decirTexto(
      'Ha llegado una versión nueva del taller. Ahí abajo tienes el botón; yo no toco nada sin que me lo digas.',
    )
  })
})

onBeforeUnmount(() => {
  if (dejarDeEscucharActualizaciones) dejarDeEscucharActualizaciones()
  if (dejarDeEscucharSucesos) dejarDeEscucharSucesos()
  if (dejarDeEscucharProblemas) dejarDeEscucharProblemas()
})

// Todos los mundos abiertos (para revisar el temario) o de uno en uno.
function alternarRevision() {
  const abierto = curso.alternarRevision()
  wayne.decirTexto(
    abierto
      ? 'Te he quitado los candados: entra donde quieras y cotillea el temario a gusto.'
      : 'Candados puestos otra vez. Cada mundo se abre al terminar el anterior, como debe ser.',
  )
}

// Exportar: el build real de Vite sobre el proyecto. En la app de escritorio
// compila y abre dist/; en el navegador (mock) solo explica qué haría.
const exportando = ref(false)

async function exportarWeb() {
  if (!window.taller?.exportar) return
  exportando.value = true
  try {
    const resultado = await window.taller.exportar()
    if (resultado?.ok) {
      coleccion.encontrar('panama-del-que-publica')
      wayne.decirTexto(
        'Exportada. Eso que se acaba de abrir es tu web de verdad, compilada y lista para cualquier hosting. Ha quedado apañada.',
      )
    } else {
      await avisar({
        titulo: 'La exportación no ha podido ser',
        texto: resultado?.error || 'Algo se ha torcido a mitad del build.',
      })
    }
  } finally {
    exportando.value = false
  }
}

onMounted(async () => {
  curso.recuperarProgreso()
  await taller.cargar()
  await sembrarMundo()
  if (await taller.ficheros.some((f) => f.ruta === 'src/App.vue')) {
    await taller.abrir('src/App.vue')
  }
  cargando.value = false

  // La primera vez de todas, Wayne se presenta; si no, la entradilla del mundo.
  if (wayne.primeraVez) wayne.alEntrar()
  else if (curso.mundo && curso.superados === 0) wayne.decirTexto(curso.mundo.entradilla.texto)
  else wayne.alEntrar()

  reiniciarInactividad()
  mirarNovedades()

  // Los que dependen del reloj y del calendario. La fecha entra por parámetro
  // para que las reglas se puedan probar sin tocar la hora del sistema.
  const ahora = new Date()
  coleccion.revisarLaHora(ahora)
  coleccion.apuntarVisita(ahora)

  // Y lo que ya hubiera escrito de antes en el fichero abierto.
  revisarElCodigo(taller.borrador)

  // Los problemas de compilación. Se pide el que haya ahora por si la interfaz
  // se ha recargado con un error ya vivo, y luego se escucha.
  if (window.taller?.problema) {
    diagnostico.ponerProblema(await window.taller.problema())
  }
  if (window.taller?.alHaberProblema) {
    dejarDeEscucharProblemas = window.taller.alHaberProblema((problema) => {
      diagnostico.ponerProblema(problema)
    })
  }

  if (window.taller?.alSuceder) {
    dejarDeEscucharSucesos = window.taller.alSuceder((que) => {
      const premio = sombreroDeLoQuePasa(que)
      if (premio) coleccion.encontrar(premio)
    })
  }
})

// Lo que va escribiendo. Es una comprobación de texto, barata, y el almacén
// ignora los que ya tenía, así que puede correr en cada tecla sin ruido.
watch(() => taller.borrador, revisarElCodigo)

// Reacciona a cada comprobación: acierto o fallo, y recuerda.
watch(
  () => curso.resultado,
  (nuevo, viejo) => {
    if (!nuevo || nuevo === viejo) return
    reiniciarInactividad()

    const idPaso = curso.paso?.id
    if (nuevo.superado) {
      wayne.alAcertar()
      // Insistir cuenta tanto como acertar a la primera, y a veces más.
      coleccion.revisarLaTerquedad(idPaso)
      if (curso.completo) coleccion.revisarElMundoLimpio(curso.pasos.map((paso) => paso.id))
    } else {
      if (idPaso) {
        coleccion.apuntarFallo(idPaso)
        wayne.alFallar(idPaso)
      }
    }
  },
)

// Mundo terminado: lo cuenta en su memoria y dice el cierre del mundo.
watch(
  () => curso.completo,
  (completo) => {
    if (completo && curso.mundo) {
      wayne.registrarMundoCompleto()
      wayne.decirTexto(curso.mundo.cierre.texto)
    }
  },
)

// Al teclear en el editor, el reloj de inactividad se reinicia.
watch(() => taller.revision, reiniciarInactividad)

const estado = computed(() => {
  if (taller.error) return { texto: taller.error, clase: 'malo' }
  if (taller.guardando) return { texto: 'guardando', clase: 'tenue' }
  return { texto: 'guardado', clase: 'tenue' }
})

async function abrirMundo(numero) {
  const destino = Number(numero)
  if (!curso.estaAbierto(destino)) return

  if (destino !== curso.numero) {
    curso.irAlMundo(destino)
    await sembrarMundo()
    pestana.value = 'leccion'
    wayne.decirTexto(curso.mundo.entradilla.texto)
  }
  vista.value = 'taller'
}

async function reiniciarMundo() {
  const esSql = Boolean(curso.mundo?.sql)

  const seguro = await preguntar({
    titulo: 'Volver a empezar este mundo',
    texto: esSql
      ? 'La base de datos se borra entera y vuelve a como estaba al empezar el mundo. Se borra también tu progreso en él.'
      : 'Los ficheros de este mundo vuelven a como estaban, y se borra tu progreso en él. Lo que hayas creado tú por tu cuenta se queda.',
    confirmar: 'Empezar de nuevo',
    peligro: true,
  })
  if (!seguro) return

  if (esSql) await sql.reiniciarCon(curso.mundo.semilla)
  else await taller.restaurar(curso.mundo.ficheros)

  curso.reiniciar()
}

async function nuevoFichero() {
  const nombre = await pedirTexto({
    titulo: 'Un fichero nuevo',
    etiqueta: 'Nombre',
    valor: 'src/components/Ficha.vue',
    confirmar: 'Crear',
  })
  if (!nombre) return
  try {
    await taller.crear(nombre)
  } catch (fallo) {
    await avisar({ titulo: 'Ese nombre no vale', texto: fallo.message })
  }
}

async function borrar(ruta) {
  const seguro = await preguntar({ titulo: `¿Borrar ${ruta}?`, confirmar: 'Bórralo', peligro: true })
  if (seguro) await taller.borrar(ruta)
}
</script>

<template>
  <div class="app" :style="{ '--acento': acento }">
    <header class="cabecera">
      <button class="marca" title="Ir al mapa" @click="vista = 'mapa'">
        <span class="sombrero" aria-hidden="true">⌒</span> El Sombrero de Wayne
      </button>

      <nav class="nav">
        <button :class="{ activo: vista === 'mapa' }" @click="vista = 'mapa'">Mapa</button>
        <button :class="{ activo: vista === 'taller' }" @click="vista = 'taller'">Taller</button>
        <button :class="{ activo: vista === 'glosario' }" @click="vista = 'glosario'">
          Glosario
        </button>
      </nav>

      <button
        class="mini candado"
        :class="{ suelto: curso.revision }"
        :title="
          curso.revision
            ? 'Todos los mundos abiertos, para revisar el temario. Pulsa para volver a abrirlos por orden.'
            : 'Los mundos se abren al terminar el anterior. Pulsa para abrirlos todos y revisar.'
        "
        @click="alternarRevision"
      >
        {{ curso.revision ? 'Todo abierto' : 'Por orden' }}
      </button>

      <span class="hueco"></span>

      <div v-if="vista === 'taller' && curso.mundo" class="donde">
        <span class="acto">{{ curso.mundo.acto }}</span>
        <span class="mundo">{{ curso.mundo.titulo.replace(/^Mundo \d+ · /, '') }}</span>
      </div>

      <div class="aro" :title="`${progreso.hechos} de ${progreso.total} pasos`">
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle class="fondo" cx="18" cy="18" r="15.5" />
          <circle
            class="hecho"
            cx="18"
            cy="18"
            r="15.5"
            :style="{ strokeDashoffset: 97.4 - (97.4 * progreso.porcentaje) / 100 }"
          />
        </svg>
        <span>{{ progreso.porcentaje }}</span>
      </div>

      <template v-if="vista === 'taller'">
        <span class="estado" :class="estado.clase">{{ estado.texto }}</span>
        <button class="mini" @click="reiniciarMundo">Reiniciar mundo</button>
      </template>

      <button
        class="exportar"
        :disabled="exportando"
        title="El build real de Vite: deja tu web empaquetada en dist/ y abre la carpeta"
        @click="exportarWeb"
      >
        {{ exportando ? 'Exportando…' : 'Exportar mi web' }}
      </button>
    </header>

    <p v-if="cargando" class="cargando">Abriendo el taller&hellip;</p>

    <Mapa
      v-else-if="vista === 'mapa'"
      class="entra"
      @abrir="abrirMundo"
      @glosario="vista = 'glosario'"
    />

    <Glosario v-else-if="vista === 'glosario'" class="entra" @volver="vista = 'mapa'" />

    <main
      v-else
      class="paneles"
      :class="{ arrastrando: Boolean(arrastrando) }"
      :style="{ gridTemplateColumns: columnas }"
    >
      <aside class="lateral">
        <nav class="pestanas">
          <button class="pestana" :class="{ activa: pestana === 'leccion' }" @click="pestana = 'leccion'">
            Lección
          </button>
          <button class="pestana" :class="{ activa: pestana === 'ficheros' }" @click="pestana = 'ficheros'">
            Ficheros
          </button>
          <button class="pestana" :class="{ activa: pestana === 'armonia' }" @click="pestana = 'armonia'">
            Armonía
          </button>
          <button
            class="pestana"
            :class="{ activa: pestana === 'sombreros' }"
            title="Los sombreros escondidos por el taller"
            @click="pestana = 'sombreros'"
          >
            Sombreros
          </button>
        </nav>

        <!-- Armonía trae su propio scroll: si el contenedor también scrollea,
             salen dos barras peleándose. -->
        <div class="contenido-lateral" :class="{ 'sin-scroll': pestana === 'armonia' }">
          <PanelMundo
            v-show="pestana === 'leccion'"
            :proyecto="taller.proyecto"
            :revision="taller.revision"
            :panel-visible="true"
            panel-necesario="vista"
            @cambiar-mundo="abrirMundo"
            @explicar="explicarTermino"
          />

          <div v-show="pestana === 'ficheros'">
            <div class="titulo-lateral">
              <span>proyecto</span>
              <button class="mini" title="Fichero nuevo" @click="nuevoFichero">+</button>
            </div>
            <ArbolFicheros
              :nodo="taller.arbol"
              :ruta-activa="taller.rutaActiva"
              @abrir="taller.abrir($event)"
              @borrar="borrar"
              @renombrar="() => {}"
            />
          </div>

          <Armonia v-if="pestana === 'armonia'" />

          <Sombrerera v-if="pestana === 'sombreros'" :mundo-actual="curso.numero" />
        </div>
      </aside>

      <div
        class="manilla"
        title="Arrastra para ensanchar la lección"
        @pointerdown="arrastrar('lateral', $event)"
      ></div>

      <section class="centro">
        <div class="tira">
          <!-- Las pestañas de los ficheros abiertos, como en cualquier editor.
               Cerrar una pestaña no borra nada: solo la quita de aquí. -->
          <div class="fichas" role="tablist">
            <button
              v-for="ruta in taller.abiertos"
              :key="ruta"
              class="ficha"
              :class="{ activa: ruta === taller.rutaActiva }"
              role="tab"
              :aria-selected="ruta === taller.rutaActiva"
              :title="ruta"
              @click="taller.abrir(ruta)"
              @auxclick.middle.prevent="taller.cerrarPestana(ruta)"
            >
              <span class="nombre">{{ soloElNombre(ruta) }}</span>
              <span
                class="cerrar-ficha"
                title="Cerrar (también con el botón del medio)"
                @click.stop="taller.cerrarPestana(ruta)"
                >×</span
              >
            </button>
            <span v-if="!taller.abiertos.length" class="sin-fichas">sin ficheros abiertos</span>
          </div>
          <div class="botones-abajo">
            <button
              class="mini"
              :class="{ activa: panelAbajo === 'terminal' }"
              title="La terminal: npm, node, git sobre tu proyecto"
              @click="abrirAbajo('terminal')"
            >
              Terminal{{ terminalOcupada ? ' ·' : '' }}
            </button>
            <button
              class="mini"
              :class="{ activa: panelAbajo === 'problemas', avisa: diagnostico.hayProblema }"
              title="Lo que no compila"
              @click="abrirAbajo('problemas')"
            >
              Problemas<span v-if="diagnostico.hayProblema" class="chincheta">1</span>
            </button>
            <button
              class="mini"
              :class="{ activa: panelAbajo === 'consola', avisa: diagnostico.errores > 0 }"
              title="Lo que dice tu página: console.log y errores en marcha"
              @click="abrirAbajo('consola')"
            >
              Consola<span v-if="diagnostico.errores" class="chincheta">{{ diagnostico.errores }}</span>
            </button>
          </div>
        </div>
        <Editor
          :contenido="taller.borrador"
          :extension="taller.extensionActiva"
          :ruta="taller.rutaActiva"
          @escribir="(contenido, ruta) => taller.escribir(contenido, ruta)"
        />

        <!-- El panel de abajo, con su manilla, como en cualquier editor:
             terminal, problemas y consola de la vista previa.

             La terminal se esconde con v-show y no con v-if porque cerrar el
             panel no debe matar el comando que esté corriendo ni perder lo que
             ya salió por pantalla. Los otros dos leen del almacén, así que se
             pueden montar y desmontar sin perder nada. -->
        <div
          v-show="panelAbajo"
          class="manilla horizontal"
          title="Arrastra para cambiar el alto del panel"
          @pointerdown="arrastrarAlto($event)"
        ></div>
        <div v-show="panelAbajo" class="hueco-terminal" :style="{ height: `${altoTerminal}px` }">
          <div v-show="panelAbajo === 'terminal'" class="lleno">
            <TerminalIntegrada v-if="terminalUsada" @ejecutando="terminalOcupada = $event" />
          </div>
          <Problemas v-if="panelAbajo === 'problemas'" @abrir="abrirDesdeElProblema" />
          <ConsolaNavegador v-if="panelAbajo === 'consola'" />
        </div>
      </section>

      <div
        class="manilla"
        title="Arrastra para ensanchar la vista previa"
        @pointerdown="arrastrar('derecha', $event)"
      ></div>

      <section class="derecha">
        <nav class="pestanas">
          <button
            class="pestana"
            :class="{ activa: salida === 'vista' }"
            @click="salida = 'vista'"
          >
            Resultado
          </button>
          <button class="pestana" :class="{ activa: salida === 'sql' }" @click="abrirSql">
            Base de datos
          </button>
          <button class="pestana" :class="{ activa: salida === 'esquema' }" @click="abrirEsquema">
            Esquema
            <span v-if="sql.avisosGraves" class="chincheta">{{ sql.avisosGraves }}</span>
          </button>
        </nav>

        <!-- La vista previa se esconde, no se destruye: un v-if recargaría el
             proyecto de la alumna cada vez que se cambia de pestaña. -->
        <div class="hueco-salida">
          <div v-show="salida === 'vista'" class="lleno">
            <VistaPreviaEscritorio />
          </div>
          <div v-show="salida === 'sql'" class="lleno">
            <ConsolaSql @explicar-error="explicarError" />
          </div>
          <div v-show="salida === 'esquema'" class="lleno">
            <VisorEsquema />
          </div>
        </div>
      </section>
    </main>

    <div v-if="coleccion.ultimo || actualizacion || novedades.length" class="avisos">
      <SombreroEncontrado
        v-if="coleccion.ultimo"
        :sombrero="coleccion.ultimo"
        :cuantos="coleccion.cuantos"
        :total="coleccion.total"
        @cerrar="coleccion.olvidarUltimo()"
        @ver="verLaSombrerera"
      />
      <AvisoActualizacion
        v-if="actualizacion"
        :version="actualizacion.version"
        @luego="aparcarActualizacion"
      />
      <Novedades
        v-if="novedades.length"
        :entradas="novedades"
        :version="versionActual"
        @cerrar="cerrarNovedades"
      />
    </div>
    <WayneCompanero :texto="wayne.linea" />
    <Steris :termino="steris.termino" :error="steris.error" @cerrar="callarASteris" />
    <Dialogo />
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* La app es la que reparte el alto: nada puede empujar la página entera.
     Sin esto, una lección larga estiraba la fila del grid y aparecía un
     scroll de página sin tope. */
  overflow: hidden;
}

.cabecera {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--borde);
  background: linear-gradient(180deg, var(--fondo-panel), var(--fondo-hueco));
  box-shadow: inset 0 -2px 0 var(--acento);
  transition: box-shadow 0.5s var(--curva);
}

.marca {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  padding: 0.15rem 0.3rem;
  font-family: var(--titulos);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--laton);
  white-space: nowrap;
}
.marca:hover {
  background: none;
  color: var(--texto);
}
.sombrero {
  font-size: 1.1rem;
  line-height: 0.6;
  color: var(--acento);
}

.nav {
  display: flex;
  gap: 0.15rem;
}
.nav button {
  border: none;
  border-radius: 99px;
  padding: 0.25rem 0.65rem;
  font-size: 0.82rem;
  color: var(--texto-apagado);
}
.nav button:hover {
  background: rgb(255 255 255 / 0.04);
  color: var(--texto-tenue);
}
.nav button.activo {
  background: color-mix(in srgb, var(--acento) 16%, transparent);
  color: var(--acento);
}

.hueco {
  flex: 1;
}

.donde {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
}
.acto {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--acento);
}
.mundo {
  font-size: 0.82rem;
  color: var(--texto-tenue);
}

.aro {
  position: relative;
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
}
.aro svg {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}
.aro circle {
  fill: none;
  stroke-width: 3;
}
.aro .fondo {
  stroke: var(--borde);
}
.aro .hecho {
  stroke: var(--acento);
  stroke-linecap: round;
  stroke-dasharray: 97.4;
  transition: stroke-dashoffset 0.7s var(--curva), stroke 0.5s var(--curva);
}
.aro span {
  font-size: 0.6rem;
  color: var(--texto-tenue);
  font-variant-numeric: tabular-nums;
}

.estado {
  font-size: 0.72rem;
  white-space: nowrap;
}
.estado.tenue {
  color: var(--texto-apagado);
}
.estado.malo {
  color: var(--rojo);
}

.paneles {
  flex: 1;
  min-height: 0;
  display: grid;
  /* Las columnas las pone el estilo en línea (son arrastrables). */
  /* La única fila mide lo que quede de ventana, nunca lo que pida el
     contenido: cada columna hace su propio scroll por dentro. */
  grid-template-rows: minmax(0, 1fr);
}

/* Mientras se arrastra una manilla, ni se selecciona texto ni el iframe de la
   vista previa se come el puntero. */
.paneles.arrastrando {
  user-select: none;
  cursor: col-resize;
}

.paneles.arrastrando .derecha {
  pointer-events: none;
}

.manilla {
  cursor: col-resize;
  background: var(--borde);
  transition: background 0.15s var(--curva);
  position: relative;
}

/* La zona sensible es más ancha que la línea que se ve: agarrar 1px es un
   suplicio. */
.manilla::after {
  content: '';
  position: absolute;
  inset: 0 -4px;
}

.manilla:hover,
.paneles.arrastrando .manilla {
  background: var(--laton);
}

/* La de la terminal separa arriba y abajo, no izquierda y derecha. */
.manilla.horizontal {
  cursor: row-resize;
  height: 5px;
  flex: none;
}

.manilla.horizontal::after {
  inset: -4px 0;
}

.botones-abajo {
  display: flex;
  gap: 0.3rem;
  flex: none;
}

/* Un panel con algo que contar se nota sin gritar. */
.mini.avisa {
  color: var(--rojo, #d98b7a);
}

.hueco-terminal {
  flex: none;
  min-height: 0;
  border-top: 1px solid var(--borde);
  overflow: hidden;
}

/* La tira del nombre de fichero ahora lleva el botón de la terminal. */
.tira {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mini.activa {
  color: var(--laton);
}

/* Sin border-right: ahora el separador es la manilla arrastrable. */
.lateral {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: var(--fondo-panel);
}

.pestanas {
  display: flex;
  border-bottom: 1px solid var(--borde);
  background: var(--fondo-hueco);
}
.pestana {
  flex: 1;
  border: none;
  border-radius: 0;
  padding: 0.55rem 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--texto-apagado);
  position: relative;
}
.pestana::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -1px;
  height: 2px;
  background: var(--acento);
  transition: left 0.24s var(--curva), right 0.24s var(--curva);
}
.pestana.activa {
  color: var(--acento);
  font-weight: 600;
  background: color-mix(in srgb, var(--acento) 10%, transparent);
}
.pestana.activa::after {
  left: 0;
  right: 0;
}

.contenido-lateral {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* Armonía scrollea por dentro; aquí sobra la barra. */
.contenido-lateral.sin-scroll {
  overflow: hidden;
}

.titulo-lateral {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.5rem 0.5rem 0.7rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--texto-apagado);
}

.centro {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
/* Las pestañas de ficheros. Se encogen antes de desbordar, y si hay muchas la
   tira scrollea en horizontal en vez de romper la fila. */
.fichas {
  display: flex;
  align-items: stretch;
  gap: 0.15rem;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.ficha {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 13rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.35rem 0.35rem 0 0;
  background: none;
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--texto-apagado);
  white-space: nowrap;
}

.ficha:hover {
  color: var(--texto-tenue);
  background: rgb(255 255 255 / 0.04);
}

.ficha.activa {
  color: var(--acento);
  background: color-mix(in srgb, var(--acento) 12%, transparent);
  box-shadow: inset 0 -2px 0 var(--acento);
}

.ficha .nombre {
  overflow: hidden;
  text-overflow: ellipsis;
}

.cerrar-ficha {
  flex: none;
  width: 1rem;
  text-align: center;
  border-radius: 0.25rem;
  opacity: 0.45;
  font-size: 0.9rem;
  line-height: 1;
}

.ficha:hover .cerrar-ficha,
.ficha.activa .cerrar-ficha {
  opacity: 0.85;
}

.cerrar-ficha:hover {
  opacity: 1;
  background: rgb(255 255 255 / 0.12);
}

.sin-fichas {
  padding: 0.25rem 0.2rem;
  opacity: 0.6;
}

.tira {
  padding: 0.35rem 0.8rem;
  border-bottom: 1px solid var(--borde-suave);
  background: var(--fondo-hueco);
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--texto-tenue);
}

.derecha {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hueco-salida {
  flex: 1;
  min-height: 0;
  position: relative;
}

/* Cada panel de salida ocupa el hueco entero; los que no toca, escondidos
   (no destruidos: la vista previa no debe recargarse al cambiar de pestaña). */
.lleno {
  position: absolute;
  inset: 0;
  min-height: 0;
}

/* Los avisos que se apilan abajo a la izquierda: novedades, actualización.
   Van en columna para que dos a la vez no se pisen, y no capturan el ratón
   fuera de sus tarjetas. */
.avisos {
  position: fixed;
  left: 1.2rem;
  bottom: 1.2rem;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: flex-start;
  pointer-events: none;
}

.avisos > * {
  pointer-events: auto;
}

/* El número de avisos graves del esquema, sobre la pestaña. */
.chincheta {
  display: inline-grid;
  place-items: center;
  min-width: 1.05rem;
  height: 1.05rem;
  margin-left: 0.35rem;
  padding: 0 0.2rem;
  border-radius: 99px;
  background: color-mix(in srgb, var(--rojo, #a03e2d) 75%, transparent);
  color: #fff;
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
}

.mini {
  border: none;
  padding: 0.15rem 0.45rem;
  font-size: 0.76rem;
  color: var(--texto-apagado);
  white-space: nowrap;
}
.mini:hover {
  color: var(--acento);
  background: none;
}

/* El interruptor de los candados. Apagado es lo normal (curso por orden);
   encendido se nota, porque es un estado de revisión, no el de siempre. */
.candado {
  border: 1px solid var(--borde);
  border-radius: 99px;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  white-space: nowrap;
}

.candado::before {
  content: '🔒 ';
}

.candado.suelto {
  border-color: color-mix(in srgb, var(--verde) 55%, transparent);
  color: var(--verde);
}

.candado.suelto::before {
  content: '🔓 ';
}

.candado:hover {
  border-color: var(--laton);
  background: none;
}

.exportar {
  border: 1px solid var(--laton-oscuro);
  border-radius: 99px;
  padding: 0.3rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--laton);
  background: linear-gradient(180deg, rgb(223 185 111 / 0.14), rgb(223 185 111 / 0.04));
  white-space: nowrap;
  transition: border-color 0.2s var(--curva), box-shadow 0.2s var(--curva);
}

.exportar:hover:not(:disabled) {
  border-color: var(--laton);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.3);
}

.exportar:disabled {
  opacity: 0.6;
  cursor: progress;
}

.cargando {
  margin: auto;
  color: var(--texto-apagado);
}
</style>
