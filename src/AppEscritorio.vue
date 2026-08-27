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
import ConsolaSql from './componentes/ConsolaSql.vue'
import VisorEsquema from './componentes/VisorEsquema.vue'
import Dialogo from './componentes/Dialogo.vue'
import Editor from './componentes/Editor.vue'
import Glosario from './componentes/Glosario.vue'
import Mapa from './componentes/Mapa.vue'
import Novedades from './componentes/Novedades.vue'
import PanelMundo from './componentes/PanelMundo.vue'
import Steris from './componentes/Steris.vue'
import TerminalIntegrada from './componentes/Terminal.vue'
import VistaPreviaEscritorio from './componentes/VistaPreviaEscritorio.vue'
import WayneCompanero from './componentes/WayneCompanero.vue'
import { avisar, pedirTexto, preguntar } from './motor/dialogos.js'

const taller = usarTaller()
const curso = usarCurso()
const sql = usarSql()

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
const terminalAbierta = ref(false)
const terminalOcupada = ref(false)
const altoTerminal = ref(260)

try {
  const guardado = JSON.parse(localStorage.getItem(CLAVE_TERMINAL) || '{}')
  terminalAbierta.value = Boolean(guardado.abierta)
  altoTerminal.value = Number(guardado.alto) || 260
} catch {
  /* valores por defecto */
}

watch([terminalAbierta, altoTerminal], () => {
  try {
    localStorage.setItem(
      CLAVE_TERMINAL,
      JSON.stringify({ abierta: terminalAbierta.value, alto: altoTerminal.value }),
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
})

// Reacciona a cada comprobación: acierto o fallo, y recuerda.
watch(
  () => curso.resultado,
  (nuevo, viejo) => {
    if (!nuevo || nuevo === viejo) return
    reiniciarInactividad()
    if (nuevo.superado) wayne.alAcertar()
    else if (curso.paso) wayne.alFallar(curso.paso.id)
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
        </div>
      </aside>

      <div
        class="manilla"
        title="Arrastra para ensanchar la lección"
        @pointerdown="arrastrar('lateral', $event)"
      ></div>

      <section class="centro">
        <div class="tira">
          <span>{{ taller.rutaActiva || 'sin fichero' }}</span>
          <button
            class="mini"
            :class="{ activa: terminalAbierta }"
            :title="terminalAbierta ? 'Cerrar la terminal' : 'Abrir la terminal (npm, node, git)'"
            @click="terminalAbierta = !terminalAbierta"
          >
            Terminal{{ terminalOcupada ? ' ·' : '' }}
          </button>
        </div>
        <Editor
          :contenido="taller.borrador"
          :extension="taller.extensionActiva"
          :ruta="taller.rutaActiva"
          @escribir="(contenido, ruta) => taller.escribir(contenido, ruta)"
        />

        <!-- La terminal, debajo del editor y con su manilla, como en VS Code.
             Se esconde con v-show y no con v-if: cerrarla no debe matar el
             comando que esté corriendo ni perder lo que ya salió. -->
        <div
          v-show="terminalAbierta"
          class="manilla horizontal"
          title="Arrastra para cambiar el alto de la terminal"
          @pointerdown="arrastrarAlto($event)"
        ></div>
        <div v-show="terminalAbierta" class="hueco-terminal" :style="{ height: `${altoTerminal}px` }">
          <TerminalIntegrada @ejecutando="terminalOcupada = $event" />
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

    <div v-if="actualizacion || novedades.length" class="avisos">
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
