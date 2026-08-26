<script setup>
// La pantalla de entrada: el mapa del temario.
//
// Existe porque antes se caía directamente en el editor del Mundo 1, sin saber
// qué había ni cuánto quedaba. Aquí se ve la estructura entera —cinco actos,
// quince mundos—, dónde estás, y qué hay cerrado todavía.
//
// El bloqueo se enseña, no se esconde: un candado con el motivo al lado. Que
// no se pueda adelantar no es un castigo, es que empezar el mundo 10 sin el 9
// es empezar por la mitad de una explicación.
import { computed } from 'vue'
import mundos from '../contenido/mundos/indice.js'
import { usarMundo } from '../almacen/mundo.js'
import wayneAvatar from '../recursos/wayne-avatar.webp'
import waxAvatar from '../recursos/wax-avatar.webp'
import sterisAvatar from '../recursos/steris-avatar.webp'
import armoniaAvatar from '../recursos/armonia-avatar.webp'

const emitir = defineEmits(['abrir', 'glosario'])

const mundo = usarMundo()

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

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
    })
  }

  return [...grupos.entries()].map(([nombre, lista], i) => ({
    nombre,
    romano: ROMANOS[i] || String(i + 1),
    lista,
  }))
})

const totalPasos = computed(() => mundos.reduce((n, m) => n + m.pasos.length, 0))
const hechos = computed(
  () => mundos.flatMap((m) => m.pasos).filter((p) => mundo.resultados[p.id]?.superado).length,
)
const porcentaje = computed(() => Math.round((hechos.value / totalPasos.value) * 100))

// El primero que no está terminado: es donde tiene sentido seguir.
const dondeSeguir = computed(() => {
  const pendiente = mundos.find((m) => mundo.estaAbierto(m.numero) && !mundo.mundoTerminado(m.numero))
  return pendiente || mundos[0]
})

const empezado = computed(() => hechos.value > 0)

const ELENCO = [
  { nombre: 'Wayne', avatar: wayneAvatar, hace: 'va comentando, y a veces ayuda' },
  { nombre: 'Wax', avatar: waxAvatar, hace: 'da las lecciones, en serio' },
  { nombre: 'Steris', avatar: sterisAvatar, hace: 'el glosario y los errores' },
  { nombre: 'Armonía', avatar: armoniaAvatar, hace: 'responde, sin dar la solución' },
]

function motivoCerrado(numero) {
  const indice = mundos.findIndex((m) => m.numero === numero)
  const anterior = mundos[indice - 1]
  return anterior ? `Termina antes ${anterior.titulo.replace(/^Mundo \d+ · /, '«') + '»'}` : ''
}
</script>

<template>
  <div class="mapa">
    <header class="portada">
      <img :src="wayneAvatar" alt="" class="retrato" width="96" height="96" />

      <div class="rotulo">
        <p class="encima">Un taller de Wayne</p>
        <h1>El Sombrero de Wayne</h1>
        <p class="lema">
          Aprender a construir una web desde cero, construyéndola. Sin dar nada por sabido.
        </p>
      </div>
    </header>

    <section class="arranque">
      <button class="empezar" @click="emitir('abrir', dondeSeguir.numero)">
        {{ empezado ? 'Seguir donde lo dejaste' : 'Empezar por el principio' }}
        <span class="destino">{{ dondeSeguir.titulo }}</span>
      </button>

      <div class="marcador">
        <div class="barra"><span :style="{ width: porcentaje + '%' }"></span></div>
        <p>{{ hechos }} de {{ totalPasos }} pasos · {{ porcentaje }}%</p>
      </div>
    </section>

    <section v-for="acto in actos" :key="acto.nombre" class="acto">
      <h2>
        <span class="romano">{{ acto.romano }}</span>
        {{ acto.nombre }}
      </h2>

      <ul class="mundos">
        <li v-for="m in acto.lista" :key="m.numero">
          <button
            class="ficha"
            :class="{ cerrado: !m.abierto, terminado: m.terminado, actual: m.actual }"
            :disabled="!m.abierto"
            :title="m.abierto ? m.titulo : motivoCerrado(m.numero)"
            @click="emitir('abrir', m.numero)"
          >
            <span class="numero">{{ m.terminado ? '✓' : m.abierto ? m.numero : '🔒' }}</span>

            <span class="cuerpo">
              <span class="nombre">{{ m.titulo }}</span>
              <span class="detalle">
                <template v-if="!m.abierto">{{ motivoCerrado(m.numero) }}</template>
                <template v-else-if="m.terminado">Terminado</template>
                <template v-else>{{ m.superados }} de {{ m.pasos }} pasos</template>
                <em v-if="m.soloLectura && m.abierto" class="marca">de leer</em>
              </span>
            </span>

            <span class="puntos" aria-hidden="true">
              <i v-for="n in m.pasos" :key="n" :class="{ hecho: n <= m.superados }"></i>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <section class="elenco">
      <h2><span class="romano">·</span> Quién te acompaña</h2>
      <ul>
        <li v-for="quien in ELENCO" :key="quien.nombre">
          <img :src="quien.avatar" :alt="`Retrato de ${quien.nombre}`" width="52" height="52" />
          <span class="quien">{{ quien.nombre }}</span>
          <span class="hace">{{ quien.hace }}</span>
        </li>
      </ul>
      <p class="nota">
        Los diálogos son originales. Nada copiado de los libros de Sanderson.
        <button class="enlace" @click="emitir('glosario')">Ver el glosario de Steris →</button>
      </p>
    </section>
  </div>
</template>

<style scoped>
.mapa {
  height: 100%;
  overflow-y: auto;
  padding: 3rem 1.5rem 5rem;
}

.mapa > * {
  max-width: 58rem;
  margin-left: auto;
  margin-right: auto;
}

/* ---- Portada ---- */

.portada {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--borde);
}

.retrato {
  flex: none;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  border: 3px solid var(--laton-oscuro);
  box-shadow: 0 0 0 6px rgb(216 178 106 / 0.07), var(--sombra);
  object-fit: cover;
}

.encima {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--laton-oscuro);
}

.portada h1 {
  margin: 0.25rem 0 0.4rem;
  font-family: var(--titulos);
  font-size: clamp(1.9rem, 5vw, 2.9rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--texto);
}

.lema {
  margin: 0;
  max-width: 32rem;
  color: var(--texto-tenue);
  font-size: 1rem;
  line-height: 1.55;
}

/* ---- Arranque ---- */

.arranque {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
  margin: 2rem auto;
}

.empezar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  border: 1px solid var(--laton-oscuro);
  border-radius: var(--redondeo);
  background: linear-gradient(180deg, rgb(216 178 106 / 0.14), rgb(216 178 106 / 0.06));
  padding: 0.7rem 1.3rem;
  color: var(--laton);
  font-size: 1rem;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.empezar:hover {
  transform: translateY(-1px);
  border-color: var(--laton);
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
  background: linear-gradient(180deg, rgb(216 178 106 / 0.2), rgb(216 178 106 / 0.1));
}

.destino {
  font-size: 0.78rem;
  color: var(--texto-apagado);
}

.marcador {
  flex: 1;
  min-width: 12rem;
}

.barra {
  height: 4px;
  background: var(--borde-suave);
  border-radius: 2px;
  overflow: hidden;
}

.barra span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--verde), var(--laton));
  transition: width 0.5s ease;
}

.marcador p {
  margin: 0.4rem 0 0;
  font-size: 0.76rem;
  color: var(--texto-apagado);
}

/* ---- Actos ---- */

.acto {
  margin-top: 2.6rem;
}

.acto h2,
.elenco h2 {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0 0 0.9rem;
  font-family: var(--titulos);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--texto-tenue);
}

.romano {
  display: grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  flex: none;
  border: 1px solid var(--laton-oscuro);
  border-radius: 50%;
  font-size: 0.68rem;
  color: var(--laton);
  letter-spacing: 0;
}

.mundos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.ficha {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-panel);
  padding: 0.7rem 0.9rem;
  text-align: left;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}

.ficha:hover:not(:disabled) {
  transform: translateX(3px);
  border-color: var(--laton-oscuro);
  background: var(--fondo-hueco);
}

.ficha:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ficha.actual {
  border-color: var(--laton);
  box-shadow: inset 3px 0 0 var(--laton);
}

.ficha.terminado .numero {
  color: var(--verde);
  border-color: var(--verde);
}

.numero {
  flex: none;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--borde);
  border-radius: 50%;
  font-family: var(--titulos);
  font-size: 0.85rem;
  color: var(--texto-tenue);
}

.cuerpo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nombre {
  font-size: 0.95rem;
  color: var(--texto);
}

.ficha:disabled .nombre {
  color: var(--texto-tenue);
}

.detalle {
  font-size: 0.75rem;
  color: var(--texto-apagado);
}

.marca {
  margin-left: 0.4rem;
  padding: 0 0.3rem;
  border: 1px solid var(--borde);
  border-radius: 3px;
  font-style: normal;
  font-size: 0.68rem;
  color: var(--oxido);
}

.puntos {
  display: flex;
  gap: 3px;
  flex: none;
}

.puntos i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--borde);
}

.puntos i.hecho {
  background: var(--verde);
}

/* ---- Elenco ---- */

.elenco {
  margin-top: 3rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--borde);
}

.elenco ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem;
}

.elenco li {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 0 0.7rem;
  align-items: center;
}

.elenco img {
  grid-row: span 2;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  border: 1px solid var(--borde);
  object-fit: cover;
}

.quien {
  font-size: 0.9rem;
  color: var(--texto);
  align-self: end;
}

.hace {
  font-size: 0.75rem;
  color: var(--texto-apagado);
  align-self: start;
  line-height: 1.35;
}

.nota {
  margin: 1.6rem 0 0;
  font-size: 0.78rem;
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

@media (max-width: 40rem) {
  .mapa {
    padding: 1.8rem 1rem 4rem;
  }

  .portada {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .retrato {
    width: 4.5rem;
    height: 4.5rem;
  }
}
</style>
