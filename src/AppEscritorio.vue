<script setup>
// La interfaz de la app de escritorio. Reutiliza los componentes del taller
// web (mapa, panel de lección, tipos de paso, Steris, Wayne) y los conecta al
// almacén de escritorio (contenido Vue, progreso local) y a los ficheros reales
// del proyecto de la alumna.
import { computed, onMounted, provide, ref, watch } from 'vue'
import { usarTaller } from './almacen/taller.js'
import { usarCurso } from './almacen/curso.js'
import mundos from './contenido/vue/indice.js'
import ArbolFicheros from './componentes/ArbolFicheros.vue'
import BocadilloFlotante from './componentes/BocadilloFlotante.vue'
import Dialogo from './componentes/Dialogo.vue'
import Editor from './componentes/Editor.vue'
import Mapa from './componentes/Mapa.vue'
import PanelMundo from './componentes/PanelMundo.vue'
import Steris from './componentes/Steris.vue'
import VistaPreviaEscritorio from './componentes/VistaPreviaEscritorio.vue'
import { avisar, pedirTexto, preguntar } from './motor/dialogos.js'

const taller = usarTaller()
const curso = usarCurso()

// Los componentes reutilizados (Mapa, PanelMundo) piden el almacén por
// inyección. Se lo damos aquí: el de escritorio.
provide('almacenCurso', curso)

const cargando = ref(true)
const vista = ref('mapa')
const pestana = ref('leccion')

// El acento cambia con el acto, como en el taller web.
const ACENTOS = {
  'Un componente': '#dfb96f',
  'Que se vea': '#c06840',
  Datos: '#86a95e',
  'Componentes que hablan': '#6f9bb5',
  'Varias pantallas': '#a986c0',
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
const callarASteris = () => (steris.value = { termino: null, error: null })

// Wayne, en bocadillo flotante.
const bocadillo = ref({ quien: 'wayne', texto: '' })
function decir(quien, texto) {
  if (bocadillo.value.texto === texto) bocadillo.value = { quien, texto: '' }
  setTimeout(() => (bocadillo.value = { quien, texto }), 30)
}

async function sembrarMundo() {
  if (curso.mundo) await taller.sembrar(curso.mundo.ficheros)
}

onMounted(async () => {
  curso.recuperarProgreso()
  await taller.cargar()
  await sembrarMundo()
  // Abrir App.vue de entrada: es donde ocurre casi todo.
  if (await taller.ficheros.some((f) => f.ruta === 'src/App.vue')) {
    await taller.abrir('src/App.vue')
  }
  cargando.value = false

  if (curso.mundo && curso.superados === 0) {
    decir(curso.mundo.entradilla.quien, curso.mundo.entradilla.texto)
  }
})

watch(
  () => curso.resultado,
  (nuevo) => {
    if (nuevo?.superado && nuevo.mensaje) decir('wayne', nuevo.mensaje)
  },
)
watch(
  () => curso.completo,
  (completo) => {
    if (completo && curso.mundo) decir(curso.mundo.cierre.quien, curso.mundo.cierre.texto)
  },
)

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
    decir(curso.mundo.entradilla.quien, curso.mundo.entradilla.texto)
  }
  vista.value = 'taller'
}

async function reiniciarMundo() {
  const seguro = await preguntar({
    titulo: 'Volver a empezar este mundo',
    texto:
      'Los ficheros de este mundo vuelven a como estaban, y se borra tu progreso en él. Lo que hayas creado tú por tu cuenta se queda.',
    confirmar: 'Empezar de nuevo',
    peligro: true,
  })
  if (!seguro) return
  await taller.restaurar(curso.mundo.ficheros)
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
      </nav>

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
    </header>

    <p v-if="cargando" class="cargando">Abriendo el taller&hellip;</p>

    <Mapa v-else-if="vista === 'mapa'" class="entra" @abrir="abrirMundo" />

    <main v-else class="paneles">
      <aside class="lateral">
        <nav class="pestanas">
          <button class="pestana" :class="{ activa: pestana === 'leccion' }" @click="pestana = 'leccion'">
            Lección
          </button>
          <button class="pestana" :class="{ activa: pestana === 'ficheros' }" @click="pestana = 'ficheros'">
            Ficheros
          </button>
        </nav>

        <div class="contenido-lateral">
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
        </div>
      </aside>

      <section class="centro">
        <div class="tira">{{ taller.rutaActiva || 'sin fichero' }}</div>
        <Editor
          :contenido="taller.borrador"
          :extension="taller.extensionActiva"
          :ruta="taller.rutaActiva"
          @escribir="taller.escribir($event)"
        />
      </section>

      <section class="derecha">
        <VistaPreviaEscritorio />
      </section>
    </main>

    <BocadilloFlotante :quien="bocadillo.quien" :texto="bocadillo.texto" />
    <Steris :termino="steris.termino" :error="steris.error" @cerrar="callarASteris" />
    <Dialogo />
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  grid-template-columns: 30rem minmax(0, 1fr) minmax(0, 1fr);
}

.lateral {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--borde);
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
</style>
