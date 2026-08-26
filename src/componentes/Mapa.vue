<script setup>
// La pantalla de entrada: el mapa del temario.
//
// Rehecho porque la primera versión era una columna estrecha con catorce barras
// grises en una pantalla de 1900 píxeles: parecía una página de móvil estirada.
// Ahora los mundos van en rejilla, cada acto tiene su color, y los cerrados no
// gritan.
import { computed, inject } from 'vue'
import { usarMundo } from '../almacen/mundo.js'
import wayneAvatar from '../recursos/wayne-avatar.webp'
import waxAvatar from '../recursos/wax-avatar.webp'
import sterisAvatar from '../recursos/steris-avatar.webp'
import armoniaAvatar from '../recursos/armonia-avatar.webp'

const emitir = defineEmits(['abrir', 'glosario'])

// El almacén se puede inyectar (la app de escritorio provee el suyo, con
// contenido Vue). Si nadie lo provee, se usa el del taller web. Así el mismo
// componente sirve para los dos sin duplicarlo.
const mundo = inject('almacenCurso', () => usarMundo(), true)

// La lista de mundos la da el almacén (web o escritorio), no un import fijo. Es
// estática —solo cambia el progreso—, así que se captura una vez.
const mundos = mundo.todos

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

// Los mismos colores que usa la cabecera del taller. Aquí se ven los cinco a
// la vez, y eso solo ya le da forma a la página.
const ACENTOS = {
  'Qué es todo esto': '#dfb96f',
  'Que se vea bien': '#c06840',
  'Que haga cosas': '#86a95e',
  'El otro lado': '#6f9bb5',
  'Ponerlo en el mundo': '#a986c0',
}

const actos = computed(() => {
  const grupos = new Map()

  for (const m of mundos) {
    const acto = m.acto || 'Otros'
    if (!grupos.has(acto)) grupos.set(acto, [])

    const superados = m.pasos.filter((p) => mundo.resultados[p.id]?.superado).length

    grupos.get(acto).push({
      numero: m.numero,
      titulo: m.titulo.replace(/^Mundo \d+ · /, ''),
      pasos: m.pasos.length,
      superados,
      terminado: superados === m.pasos.length,
      abierto: mundo.estaAbierto(m.numero),
      actual: m.numero === mundo.numero,
      soloLectura: m.pasos.every((p) => p.tipo === 'eleccion'),
      requiere: requisitoDe(m.numero),
    })
  }

  return [...grupos.entries()].map(([nombre, lista], i) => {
    const hechos = lista.reduce((n, m) => n + m.superados, 0)
    const total = lista.reduce((n, m) => n + m.pasos, 0)

    return {
      nombre,
      romano: ROMANOS[i] || String(i + 1),
      color: ACENTOS[nombre] || '#dfb96f',
      lista,
      hechos,
      total,
      abierto: lista.some((m) => m.abierto),
    }
  })
})

function requisitoDe(numero) {
  const indice = mundos.findIndex((m) => m.numero === numero)
  const anterior = mundos[indice - 1]
  return anterior ? anterior.titulo.replace(/^Mundo \d+ · /, '') : null
}

const totalPasos = computed(() => mundos.reduce((n, m) => n + m.pasos.length, 0))
const hechos = computed(
  () => mundos.flatMap((m) => m.pasos).filter((p) => mundo.resultados[p.id]?.superado).length,
)
const porcentaje = computed(() => Math.round((hechos.value / totalPasos.value) * 100))

const dondeSeguir = computed(() => {
  const pendiente = mundos.find(
    (m) => mundo.estaAbierto(m.numero) && !mundo.mundoTerminado(m.numero),
  )
  return pendiente || mundos[0]
})

const empezado = computed(() => hechos.value > 0)

const ELENCO = [
  { nombre: 'Wayne', avatar: wayneAvatar, hace: 'va comentando, y a veces ayuda' },
  { nombre: 'Wax', avatar: waxAvatar, hace: 'da las lecciones, en serio' },
  { nombre: 'Steris', avatar: sterisAvatar, hace: 'el glosario y los errores' },
  { nombre: 'Armonía', avatar: armoniaAvatar, hace: 'responde, sin dar la solución' },
]
</script>

<template>
  <div class="mapa">
    <!-- ---- Portada ---- -->
    <header class="portada">
      <div class="rotulo">
        <p class="encima">Un taller de Wayne</p>
        <h1>El Sombrero de Wayne</h1>
        <p class="lema">
          Aprender a construir una web desde cero, construyéndola. Sin dar nada por sabido: el
          primer paso es cambiar una palabra en un fichero.
        </p>

        <div class="arranque">
          <button class="empezar" @click="emitir('abrir', dondeSeguir.numero)">
            <span class="que">{{ empezado ? 'Seguir donde lo dejaste' : 'Empezar por el principio' }}</span>
            <span class="destino">{{ dondeSeguir.titulo.replace(/^Mundo \d+ · /, '') }} →</span>
          </button>

          <div class="marcador">
            <div class="barra">
              <span :style="{ width: porcentaje + '%' }"></span>
            </div>
            <p><strong>{{ hechos }}</strong> de {{ totalPasos }} pasos · {{ porcentaje }}%</p>
          </div>
        </div>
      </div>

      <figure class="retrato">
        <img :src="wayneAvatar" alt="Retrato de Wayne" width="150" height="150" />
        <figcaption>
          «Esto no es magia, es un papel.<br />Un papel con instrucciones.»
        </figcaption>
      </figure>
    </header>

    <!-- ---- Actos ---- -->
    <section
      v-for="acto in actos"
      :key="acto.nombre"
      class="acto"
      :class="{ cerrado: !acto.abierto }"
      :style="{ '--tono': acto.color }"
    >
      <header class="cabecera-acto">
        <span class="romano">{{ acto.romano }}</span>
        <h2>{{ acto.nombre }}</h2>
        <span class="cuenta">{{ acto.hechos }}/{{ acto.total }}</span>
      </header>

      <ul class="mundos escalonado">
        <li v-for="m in acto.lista" :key="m.numero">
          <button
            class="ficha"
            :class="{ cerrado: !m.abierto, terminado: m.terminado, actual: m.actual }"
            :disabled="!m.abierto"
            @click="emitir('abrir', m.numero)"
          >
            <span class="alto">
              <span class="numero">{{ m.numero }}</span>
              <span v-if="m.terminado" class="sello hecho">✓</span>
              <span v-else-if="!m.abierto" class="sello candado">cerrado</span>
              <span v-else-if="m.actual" class="sello aqui">aquí</span>
              <span v-else-if="m.soloLectura" class="sello leer">de leer</span>
            </span>

            <span class="nombre">{{ m.titulo }}</span>

            <span v-if="m.abierto" class="progreso">
              <span class="puntos" aria-hidden="true">
                <i v-for="n in m.pasos" :key="n" :class="{ hecho: n <= m.superados }"></i>
              </span>
              <span class="cifra">{{ m.superados }}/{{ m.pasos }}</span>
            </span>
            <span v-else class="requisito">Antes: {{ m.requiere }}</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- ---- Elenco ---- -->
    <section class="elenco">
      <header class="cabecera-acto">
        <span class="romano">·</span>
        <h2>Quién te acompaña</h2>
      </header>

      <ul>
        <li v-for="quien in ELENCO" :key="quien.nombre">
          <img :src="quien.avatar" :alt="`Retrato de ${quien.nombre}`" width="56" height="56" />
          <span class="quien">{{ quien.nombre }}</span>
          <span class="hace">{{ quien.hace }}</span>
        </li>
      </ul>

      <p class="nota">
        Los diálogos son originales, escritos en su registro. Nada copiado de los libros de
        Sanderson.
        <button class="enlace" @click="emitir('glosario')">Ver el glosario de Steris →</button>
      </p>
    </section>
  </div>
</template>

<style scoped>
.mapa {
  height: 100%;
  overflow-y: auto;
  padding: 2.6rem 2rem 5rem;
}

.mapa > * {
  /* Ancho de verdad: la versión anterior dejaba media pantalla vacía a cada
     lado y parecía una página de móvil estirada. */
  max-width: 78rem;
  margin-left: auto;
  margin-right: auto;
}

/* ---- Portada ---- */

.portada {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 3rem;
  padding-bottom: 2.4rem;
  border-bottom: 1px solid var(--borde);
}

.encima {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--laton-oscuro);
}

.portada h1 {
  margin: 0.3rem 0 0.6rem;
  font-family: var(--titulos);
  font-size: clamp(2.2rem, 4.6vw, 3.6rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.022em;
  color: var(--texto);
}

.lema {
  margin: 0;
  max-width: 34rem;
  color: var(--texto-tenue);
  font-size: 1.02rem;
  line-height: 1.6;
}

.arranque {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.4rem;
  margin-top: 1.6rem;
}

.empezar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  border: 1px solid var(--laton-oscuro);
  border-radius: var(--redondeo);
  background: linear-gradient(180deg, rgb(223 185 111 / 0.16), rgb(223 185 111 / 0.05));
  padding: 0.75rem 1.5rem;
  text-align: left;
  transition: transform 0.18s var(--curva), box-shadow 0.18s var(--curva),
    border-color 0.18s var(--curva);
}

.empezar:hover {
  transform: translateY(-2px);
  border-color: var(--laton);
  box-shadow: 0 6px 22px rgb(0 0 0 / 0.35);
  background: linear-gradient(180deg, rgb(223 185 111 / 0.24), rgb(223 185 111 / 0.1));
}

.que {
  font-family: var(--titulos);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--laton);
}

.destino {
  font-size: 0.8rem;
  color: var(--texto-apagado);
}

.marcador {
  flex: 1;
  min-width: 11rem;
  max-width: 20rem;
}

.barra {
  height: 5px;
  background: var(--borde-suave);
  border-radius: 3px;
  overflow: hidden;
}

.barra span {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #86a95e, #dfb96f);
  transition: width 0.6s var(--curva);
}

.marcador p {
  margin: 0.45rem 0 0;
  font-size: 0.78rem;
  color: var(--texto-apagado);
}

.marcador strong {
  color: var(--texto-tenue);
  font-variant-numeric: tabular-nums;
}

.retrato {
  margin: 0;
  text-align: center;
  max-width: 15rem;
}

.retrato img {
  width: 9.5rem;
  height: 9.5rem;
  border-radius: 50%;
  border: 3px solid var(--laton-oscuro);
  box-shadow: 0 0 0 9px rgb(223 185 111 / 0.06), var(--sombra-alta);
  object-fit: cover;
}

.retrato figcaption {
  margin-top: 0.9rem;
  font-family: var(--titulos);
  font-size: 0.86rem;
  font-style: italic;
  line-height: 1.45;
  color: var(--texto-apagado);
}

/* ---- Actos ---- */

.acto {
  margin-top: 2.4rem;
  /* Una banda del color del acto: es lo que hace que se lean como capítulos y
     no como una lista larga. */
  border-left: 3px solid var(--tono);
  padding-left: 1.3rem;
  transition: opacity 0.3s var(--curva);
}

.acto.cerrado {
  opacity: 0.55;
}

.cabecera-acto {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.romano {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  flex: none;
  border: 1px solid var(--tono, var(--laton-oscuro));
  border-radius: 50%;
  font-family: var(--titulos);
  font-size: 0.72rem;
  color: var(--tono, var(--laton));
}

.cabecera-acto h2 {
  flex: 1;
  margin: 0;
  font-family: var(--titulos);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--texto);
}

.cuenta {
  font-size: 0.76rem;
  color: var(--texto-apagado);
  font-variant-numeric: tabular-nums;
}

.mundos {
  list-style: none;
  margin: 0;
  padding: 0;
  /* En rejilla, no en barras de ancho completo: tres por fila en una pantalla
     grande, una en el móvil. */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.7rem;
}

.ficha {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: linear-gradient(180deg, var(--fondo-panel), var(--fondo-hueco));
  padding: 0.85rem 0.95rem 0.8rem;
  text-align: left;
  transition: transform 0.16s var(--curva), border-color 0.16s var(--curva),
    box-shadow 0.16s var(--curva);
}

.ficha:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: var(--tono);
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.32);
}

.ficha:disabled {
  cursor: not-allowed;
  background: none;
  border-style: dashed;
}

.ficha.actual {
  border-color: var(--tono);
  box-shadow: inset 0 0 0 1px var(--tono);
}

.alto {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.numero {
  font-family: var(--titulos);
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1;
  color: var(--tono);
  opacity: 0.9;
}

.ficha:disabled .numero {
  color: var(--texto-apagado);
  opacity: 0.6;
}

.sello {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.15rem 0.45rem;
  border-radius: 99px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.sello.hecho {
  color: var(--verde);
  border-color: color-mix(in srgb, var(--verde) 50%, transparent);
  font-size: 0.75rem;
  letter-spacing: 0;
}

.sello.aqui {
  color: var(--tono);
  border-color: var(--tono);
  background: color-mix(in srgb, var(--tono) 12%, transparent);
}

.sello.leer {
  color: var(--texto-apagado);
  border-color: var(--borde);
}

.sello.candado {
  color: var(--texto-apagado);
  border-color: var(--borde-suave);
}

.nombre {
  flex: 1;
  font-family: var(--titulos);
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--texto);
}

.ficha:disabled .nombre {
  color: var(--texto-tenue);
  font-weight: 500;
}

.progreso {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.puntos {
  display: flex;
  gap: 4px;
}

.puntos i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--borde);
  transition: background 0.3s var(--curva);
}

.puntos i.hecho {
  background: var(--verde);
}

.cifra {
  font-size: 0.7rem;
  color: var(--texto-apagado);
  font-variant-numeric: tabular-nums;
}

.requisito {
  font-size: 0.72rem;
  color: var(--texto-apagado);
  line-height: 1.3;
}

/* ---- Elenco ---- */

.elenco {
  margin-top: 3.2rem;
  padding-top: 1.8rem;
  border-top: 1px solid var(--borde);
  --tono: var(--laton-oscuro);
}

.elenco ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.2rem;
}

.elenco li {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 0 0.8rem;
  align-items: center;
}

.elenco img {
  grid-row: span 2;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 1px solid var(--borde);
  object-fit: cover;
}

.quien {
  font-family: var(--titulos);
  font-size: 0.98rem;
  color: var(--texto);
  align-self: end;
}

.hace {
  font-size: 0.78rem;
  color: var(--texto-apagado);
  align-self: start;
  line-height: 1.35;
}

.nota {
  margin: 1.8rem 0 0;
  font-size: 0.8rem;
  color: var(--texto-apagado);
}

.enlace {
  border: none;
  padding: 0;
  margin-left: 0.5rem;
  font: inherit;
  color: var(--verde);
  background: none;
}

.enlace:hover {
  color: var(--laton);
  background: none;
  border-color: transparent;
  text-decoration: underline;
}

@media (max-width: 62rem) {
  .portada {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.6rem;
  }

  .retrato {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    text-align: left;
    max-width: none;
  }

  .retrato img {
    width: 5.5rem;
    height: 5.5rem;
  }
}

@media (max-width: 40rem) {
  .mapa {
    padding: 1.6rem 1rem 4rem;
  }

  .acto {
    padding-left: 0.9rem;
  }
}
</style>
