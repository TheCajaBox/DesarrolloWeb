<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { usarTaller } from './almacen/taller.js'
import { usarMundo } from './almacen/mundo.js'
import mundos, { panelDe } from './contenido/mundos/indice.js'
import {
  guardarMundo,
  guardarPaneles,
  leerMundo,
  leerPaneles,
} from './almacen/preferencias.js'
import { avisar, pedirTexto, preguntar } from './motor/dialogos.js'
import ArbolFicheros from './componentes/ArbolFicheros.vue'
import Armonia from './componentes/Armonia.vue'
import BocadilloFlotante from './componentes/BocadilloFlotante.vue'
import ConsolaSql from './componentes/ConsolaSql.vue'
import Dialogo from './componentes/Dialogo.vue'
import Editor from './componentes/Editor.vue'
import Glosario from './componentes/Glosario.vue'
import Mapa from './componentes/Mapa.vue'
import PanelMundo from './componentes/PanelMundo.vue'
import Steris from './componentes/Steris.vue'
import VisorEsquema from './componentes/VisorEsquema.vue'
import VistaPrevia from './componentes/VistaPrevia.vue'

const taller = usarTaller()
const mundo = usarMundo()

const cargando = ref(true)
// Tres pantallas: el mapa (donde se cae al entrar), el taller y el glosario.
const vista = ref('mapa')
const pestana = ref('mundo')
const panelDerecho = ref('vista')

const verEditor = ref(true)
const verDerecha = ref(true)

function leerPreferencias() {
  const guardado = leerPaneles()
  if (!guardado) return
  if (typeof guardado.editor === 'boolean') verEditor.value = guardado.editor
  if (typeof guardado.derecha === 'boolean') verDerecha.value = guardado.derecha
}

watch([verEditor, verDerecha], () =>
  guardarPaneles({ editor: verEditor.value, derecha: verDerecha.value }),
)

const modoLectura = computed(() => !verEditor.value && !verDerecha.value)

const columnas = computed(() => {
  if (modoLectura.value) return 'minmax(0, 1fr)'
  // Cada pestaña necesita un ancho distinto: la lección es para leer, el chat
  // de Armonía a 20rem es ilegible, y el árbol de ficheros no necesita nada.
  const ANCHOS = { mundo: '34rem', armonia: '36rem', ficheros: '20rem' }
  const lateral = ANCHOS[pestana.value] || '25rem'
  const resto = [verEditor.value && 'minmax(0, 1fr)', verDerecha.value && 'minmax(0, 1fr)'].filter(
    Boolean,
  )
  return [lateral, ...resto].join(' ')
})

const PESTANAS = [
  { id: 'mundo', etiqueta: 'Lección' },
  { id: 'ficheros', etiqueta: 'Ficheros' },
  { id: 'armonia', etiqueta: 'Armonía' },
]

const PANELES_DERECHA = [
  { id: 'vista', etiqueta: 'Vista previa' },
  { id: 'sql', etiqueta: 'SQL' },
  { id: 'esquema', etiqueta: 'Esquema' },
]

// Cada acto tiene su color. Así se nota en qué parte del temario estás sin
// tener que leer nada: cambia el acento de toda la interfaz.
const ACENTOS = {
  'Qué es todo esto': '#dfb96f',
  'Que se vea bien': '#c06840',
  'Que haga cosas': '#86a95e',
  'El otro lado': '#6f9bb5',
  'Ponerlo en el mundo': '#a986c0',
}

const acento = computed(() => ACENTOS[mundo.mundo?.acto] || '#dfb96f')

const progreso = computed(() => {
  const total = mundos.reduce((n, m) => n + m.pasos.length, 0)
  const hechos = mundos
    .flatMap((m) => m.pasos)
    .filter((p) => mundo.resultados[p.id]?.superado).length
  return { total, hechos, porcentaje: Math.round((hechos / total) * 100) }
})

// Steris. O explica un término del glosario, o traduce un error.
const steris = ref({ termino: null, error: null })
const explicarTermino = (termino) => (steris.value = { termino, error: null })
const explicarError = (error) => (steris.value = { termino: null, error })
const callarASteris = () => (steris.value = { termino: null, error: null })

const bocadillo = ref({ quien: 'wayne', texto: '' })

function decir(quien, texto) {
  if (bocadillo.value.texto === texto) bocadillo.value = { quien, texto: '' }
  setTimeout(() => {
    bocadillo.value = { quien, texto }
  }, 30)
}

onMounted(async () => {
  leerPreferencias()

  // El progreso primero: de él depende qué mundos están abiertos y, por tanto,
  // dónde tiene sentido colocar a quien vuelve.
  await mundo.recuperarProgreso()

  const guardado = leerMundo()
  if (guardado && mundo.estaAbierto(guardado)) mundo.irAlMundo(guardado)

  await taller.cargar()

  // Se trae el sandbox guardado en la nube si va por delante del local. Así
  // cambiar de navegador o de ordenador no significa empezar de cero.
  await taller.sincronizarAlEntrar()

  // Solo crea lo que falte. Nunca pisa lo que ya hay: el proyecto es de quien
  // lo escribe, y cambiar de mundo no puede reescribirle su web.
  if (mundo.mundo) await taller.sembrar(mundo.mundo.ficheros)
  if (mundo.mundo) panelDerecho.value = panelDe(mundo.numero)

  cargando.value = false
})

// Wayne comenta cuando algo sale bien. Cuando sale mal se calla: para eso ya
// está el mensaje del paso, y un narrador que insiste en los fallos cansa.
watch(
  () => mundo.resultado,
  (nuevo) => {
    if (nuevo && nuevo.superado && nuevo.mensaje) decir('wayne', nuevo.mensaje)
  },
)

watch(
  () => mundo.completo,
  (completo) => {
    if (completo && mundo.mundo) decir(mundo.mundo.cierre.quien, mundo.mundo.cierre.texto)
  },
)

// Lo que dice la cabecera sobre si tu trabajo está a salvo. Importa que sea
// honesto: "solo en este navegador" es una advertencia de verdad, porque si
// cambias de ordenador no lo encontrarás.
const estado = computed(() => {
  if (taller.error) return { texto: taller.error, icono: '!', clase: 'malo' }
  if (taller.guardando) return { texto: 'guardando', icono: '·', clase: 'tenue' }

  switch (taller.nube) {
    case 'guardando':
      return { texto: 'subiendo', icono: '↑', clase: 'tenue' }
    case 'guardado':
      return { texto: 'a salvo', icono: '☁', clase: 'bien' }
    case 'solo-local':
      return { texto: 'solo aquí', icono: '⌂', clase: 'aviso' }
    case 'error':
      return { texto: 'sin subir', icono: '!', clase: 'aviso' }
    default:
      return { texto: 'guardado', icono: '·', clase: 'tenue' }
  }
})

async function nuevoFichero() {
  const nombre = await pedirTexto({
    titulo: 'Un fichero nuevo',
    texto: 'Ponle el nombre con su extensión. Si escribes una carpeta en la ruta, se crea sola.',
    etiqueta: 'Nombre',
    valor: 'pagina.html',
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
  const seguro = await preguntar({
    titulo: `¿Borrar ${ruta}?`,
    texto: 'Esto no se puede deshacer.',
    confirmar: 'Bórralo',
    peligro: true,
  })
  if (seguro) await taller.borrar(ruta)
}

async function renombrar(ruta) {
  const nombre = await pedirTexto({
    titulo: 'Cambiar el nombre',
    texto: 'Si le pones una carpeta delante, el fichero se mueve ahí.',
    etiqueta: 'Nuevo nombre',
    valor: ruta,
    confirmar: 'Cambiar',
  })
  if (!nombre || nombre === ruta) return

  try {
    await taller.renombrar(ruta, nombre)
  } catch (fallo) {
    await avisar({ titulo: 'No se puede', texto: fallo.message })
  }
}

// Cambiar de mundo NO toca tus ficheros. Solo crea lo que falte para poder
// empezar, así que no hace falta avisar de nada ni pedir permiso.
async function abrirMundo(numero) {
  const destino = Number(numero)

  if (!mundo.estaAbierto(destino)) return

  if (destino !== mundo.numero) {
    mundo.irAlMundo(destino)
    guardarMundo(destino)
    await taller.sembrar(mundo.mundo.ficheros)
    pestana.value = 'mundo'
    decir(mundo.mundo.entradilla.quien, mundo.mundo.entradilla.texto)
  }

  abrirPanelNecesario()
  vista.value = 'taller'
}

// Los enunciados dicen cosas como "mira la vista previa". Si ese panel está
// cerrado, están hablando de algo que no se ve. Al entrar a un mundo se abre el
// que le hace falta; después puedes cerrarlo si quieres.
function abrirPanelNecesario() {
  const cual = panelDe(mundo.numero)
  panelDerecho.value = cual
  verDerecha.value = true
}

// Lo único destructivo del taller, y es explícito: devuelve los ficheros de
// ESTE mundo a como estaban. Lo que hayas creado tú se queda.
async function reiniciarMundo() {
  const seguro = await preguntar({
    titulo: 'Volver a empezar este mundo',
    texto:
      'Los ficheros de este mundo vuelven a como estaban, y se borra tu progreso en él. Lo que hayas creado tú por tu cuenta se queda donde está.',
    confirmar: 'Empezar de nuevo',
    peligro: true,
  })
  if (!seguro) return

  await taller.restaurar(mundo.mundo.ficheros)
  mundo.reiniciar()
}
</script>

<template>
  <div class="taller" :style="{ '--acento': acento }">
    <header class="cabecera">
      <button class="marca" title="Ir al mapa" @click="vista = 'mapa'">
        <span class="sombrero" aria-hidden="true">⌒</span>
        El Sombrero de Wayne
      </button>

      <nav class="navegacion">
        <button :class="{ activo: vista === 'mapa' }" @click="vista = 'mapa'">Mapa</button>
        <button
          :class="{ activo: vista === 'taller' }"
          :disabled="!mundo.mundo"
          @click="vista = 'taller'"
        >
          Taller
        </button>
        <button :class="{ activo: vista === 'glosario' }" @click="vista = 'glosario'">
          Glosario
        </button>
      </nav>

      <span class="hueco"></span>

      <div v-if="vista === 'taller' && mundo.mundo" class="donde">
        <span class="acto">{{ mundo.mundo.acto }}</span>
        <span class="mundo-actual">{{ mundo.mundo.titulo.replace(/^Mundo \d+ · /, '') }}</span>
      </div>

      <div class="global" :title="`${progreso.hechos} de ${progreso.total} pasos en todo el taller`">
        <div class="aro">
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
      </div>

      <template v-if="vista === 'taller'">
        <div class="conmutadores" role="group" aria-label="Paneles">
          <button
            :class="{ activo: verEditor }"
            :aria-pressed="verEditor"
            title="Mostrar u ocultar el editor"
            @click="verEditor = !verEditor"
          >
            Editor
          </button>
          <button
            :class="{ activo: verDerecha }"
            :aria-pressed="verDerecha"
            title="Mostrar u ocultar el resultado"
            @click="verDerecha = !verDerecha"
          >
            Resultado
          </button>
        </div>

        <span
          class="estado"
          :class="estado.clase"
          :title="
            taller.nube === 'solo-local'
              ? 'Tu proyecto se guarda en este navegador, pero no en la nube: no lo encontrarás desde otro ordenador'
              : taller.nube === 'guardado'
                ? 'Guardado aquí y en la nube'
                : ''
          "
        >
          <i aria-hidden="true">{{ estado.icono }}</i>
          {{ estado.texto }}
        </span>
        <button class="mini" @click="reiniciarMundo">Reiniciar mundo</button>
      </template>
    </header>

    <p v-if="cargando" class="cargando">Abriendo el taller&hellip;</p>

    <Mapa v-else-if="vista === 'mapa'" class="entra" @abrir="abrirMundo" @glosario="vista = 'glosario'" />

    <Glosario v-else-if="vista === 'glosario'" class="entra" @volver="vista = 'mapa'" />

    <main v-else class="paneles" :style="{ gridTemplateColumns: columnas }">
      <aside class="lateral" :class="{ lectura: modoLectura }">
        <nav class="pestanas">
          <button
            v-for="p in PESTANAS"
            :key="p.id"
            class="pestana"
            :class="{ activa: pestana === p.id }"
            @click="pestana = p.id"
          >
            {{ p.etiqueta }}
          </button>
        </nav>

        <div class="contenido-lateral">
          <div v-show="pestana === 'mundo'" class="centrado">
            <PanelMundo
              :proyecto="taller.proyecto"
              :revision="taller.revision"
              :ancho="modoLectura"
              :panel-visible="verDerecha"
              :panel-necesario="panelDe(mundo.numero)"
              @cambiar-mundo="abrirMundo"
              @explicar="explicarTermino"
              @abrir-panel="abrirPanelNecesario"
            />
          </div>

          <div v-show="pestana === 'ficheros'">
            <div class="titulo-lateral">
              <span>{{ taller.proyecto }}</span>
              <button class="mini" title="Fichero nuevo" @click="nuevoFichero">+</button>
            </div>
            <ArbolFicheros
              :nodo="taller.arbol"
              :ruta-activa="taller.rutaActiva"
              @abrir="taller.abrir($event)"
              @borrar="borrar"
              @renombrar="renombrar"
            />
          </div>

          <Armonia v-if="pestana === 'armonia'" />
        </div>
      </aside>

      <section v-if="verEditor" class="centro">
        <div class="tira">{{ taller.rutaActiva || 'sin fichero' }}</div>
        <Editor
          :contenido="taller.borrador"
          :extension="taller.extensionActiva"
          :ruta="taller.rutaActiva"
          @escribir="(contenido, ruta) => taller.escribir(contenido, ruta)"
        />
      </section>

      <section v-if="verDerecha" class="derecha">
        <nav class="pestanas">
          <button
            v-for="p in PANELES_DERECHA"
            :key="p.id"
            class="pestana"
            :class="{ activa: panelDerecho === p.id }"
            @click="panelDerecho = p.id"
          >
            {{ p.etiqueta }}
          </button>
        </nav>

        <div class="cuerpo-derecha">
          <!-- v-show y no v-if: si se desmonta, el iframe se recarga entero
               cada vez que se vuelve a la pestaña. -->
          <VistaPrevia
            v-show="panelDerecho === 'vista'"
            :proyecto="taller.proyecto"
            :revision="taller.revision"
          />
          <ConsolaSql v-if="panelDerecho === 'sql'" @explicar-error="explicarError" />
          <VisorEsquema v-if="panelDerecho === 'esquema'" />
        </div>
      </section>
    </main>

    <BocadilloFlotante :quien="bocadillo.quien" :texto="bocadillo.texto" />
    <Steris :termino="steris.termino" :error="steris.error" @cerrar="callarASteris" />
    <Dialogo />
  </div>
</template>

<style scoped>
.taller {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ---- Cabecera ---- */

.cabecera {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--borde);
  background: linear-gradient(180deg, var(--fondo-panel), var(--fondo-hueco));
  /* Una línea del color del acto: dice en qué parte del temario estás. */
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
  border-color: transparent;
  color: var(--texto);
}

.sombrero {
  font-size: 1.1rem;
  line-height: 0.6;
  color: var(--acento);
  transition: transform 0.25s var(--curva);
}

.marca:hover .sombrero {
  transform: translateY(-2px) rotate(-8deg);
}

.navegacion {
  display: flex;
  gap: 0.15rem;
}

.navegacion button {
  border: none;
  padding: 0.25rem 0.65rem;
  font-size: 0.82rem;
  color: var(--texto-apagado);
  border-radius: 99px;
}

.navegacion button:hover:not(:disabled) {
  background: rgb(255 255 255 / 0.04);
  color: var(--texto-tenue);
}

.navegacion button.activo {
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
  min-width: 0;
}

.acto {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--acento);
}

.mundo-actual {
  font-size: 0.82rem;
  color: var(--texto-tenue);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 15rem;
}

/* ---- Aro de progreso global ---- */

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

.conmutadores {
  display: flex;
  gap: 0.25rem;
}

.conmutadores button {
  font-size: 0.74rem;
  padding: 0.22rem 0.55rem;
  color: var(--texto-apagado);
}

.conmutadores button.activo {
  color: var(--acento);
  border-color: color-mix(in srgb, var(--acento) 55%, transparent);
  background: color-mix(in srgb, var(--acento) 10%, transparent);
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

.estado.bien {
  color: var(--verde);
}

.estado.aviso {
  color: var(--oxido);
}

.estado i {
  font-style: normal;
  opacity: 0.8;
}

/* ---- Paneles ---- */

.paneles {
  flex: 1;
  min-height: 0;
  display: grid;
}

.lateral {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--borde);
  background: var(--fondo-panel);
}

.lateral.lectura {
  border-right: none;
  background: transparent;
}

.lectura .centrado {
  max-width: 46rem;
  margin: 0 auto;
  width: 100%;
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
  transition: color 0.18s var(--curva), background 0.18s var(--curva);
}

/* La raya inferior crece desde el centro al activarse. */
.pestana::after {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: -1px;
  height: 2px;
  background: var(--acento);
  border-radius: 2px 2px 0 0;
  transition: left 0.24s var(--curva), right 0.24s var(--curva);
}

.pestana:hover:not(.activa) {
  background: rgb(255 255 255 / 0.035);
  border-color: transparent;
  color: var(--texto-tenue);
}

/* La activa se distingue de verdad: fondo, color, peso y raya. Antes era una
   rayita de dos píxeles y no se veía. */
.pestana.activa {
  color: var(--acento);
  font-weight: 600;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--acento) 13%, transparent),
    color-mix(in srgb, var(--acento) 4%, transparent)
  );
}

.pestana.activa::after {
  left: 0;
  right: 0;
}

.contenido-lateral {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.contenido-lateral > * {
  min-height: 0;
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
  border-right: 1px solid var(--borde);
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
  display: flex;
  flex-direction: column;
}

.cuerpo-derecha {
  flex: 1;
  min-height: 0;
}

.cuerpo-derecha > * {
  height: 100%;
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

.cargando {
  margin: auto;
  color: var(--texto-apagado);
}

@media (max-width: 74rem) {
  .donde {
    display: none;
  }
}

@media (max-width: 56rem) {
  .marca {
    font-size: 0;
    gap: 0;
  }

  .sombrero {
    font-size: 1.3rem;
  }
}

@media (max-width: 68rem) {
  .paneles {
    grid-template-columns: minmax(0, 1fr) !important;
    grid-auto-rows: minmax(0, auto);
  }

  .cabecera {
    flex-wrap: wrap;
  }
}
</style>
