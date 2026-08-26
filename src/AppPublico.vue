<script setup>
// La web pública: el catálogo de sombreros de verdad.
//
// Es a la vez el producto y el ejemplo: lo que se aprende a construir en el
// taller es esto. Quien llega de fuera solo ve un catálogo y puede votar; quien
// viene del taller lo mira sabiendo de dónde sale cada número.
import { computed, onMounted, ref } from 'vue'
import FichaSombrero from './componentes/FichaSombrero.vue'

const sombreros = ref([])
const cargando = ref(true)
const fallo = ref(null)
const orden = ref('nota')

const ORDENES = [
  { id: 'nota', etiqueta: 'Mejor valorados' },
  { id: 'votos', etiqueta: 'Más votados' },
  { id: 'nombre', etiqueta: 'Por nombre' },
]

const ordenados = computed(() => {
  const lista = [...sombreros.value]

  if (orden.value === 'nombre') {
    return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }
  if (orden.value === 'votos') {
    return lista.sort((a, b) => b.votos - a.votos || a.nombre.localeCompare(b.nombre, 'es'))
  }
  // Los que no tienen nota van al final: un sombrero sin votos no es peor que
  // uno con un 1, simplemente no se sabe.
  return lista.sort((a, b) => {
    if (a.media === null && b.media === null) return b.votos - a.votos
    if (a.media === null) return 1
    if (b.media === null) return -1
    return b.media - a.media
  })
})

const totalVotos = computed(() => sombreros.value.reduce((n, s) => n + s.votos, 0))

async function cargar() {
  try {
    const respuesta = await fetch('/api/sombreros')
    if (!respuesta.ok) throw new Error(`El servidor ha contestado ${respuesta.status}`)
    sombreros.value = (await respuesta.json()).sombreros
  } catch (error) {
    fallo.value = error.message
  } finally {
    cargando.value = false
  }
}

async function votar({ id, puntuacion }) {
  const respuesta = await fetch(`/api/sombreros/${id}/voto`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puntuacion }),
  })

  if (!respuesta.ok) {
    fallo.value = 'No se ha podido registrar el voto. Inténtalo otra vez.'
    return
  }

  // La media la recalcula la base de datos; aquí solo se refleja.
  const { votos, media } = await respuesta.json()
  const sombrero = sombreros.value.find((s) => s.id === id)
  if (sombrero) {
    sombrero.votos = Number(votos)
    sombrero.media = media === null ? null : Number(media)
    sombrero.miVoto = puntuacion
  }
}

onMounted(cargar)
</script>

<template>
  <div class="pagina">
    <header class="portada">
      <p class="encima">Catálogo abierto · vota lo que quieras</p>
      <h1>El Sombrero de Wayne</h1>
      <p class="lema">
        Una colección de sombreros con opiniones encontradas. Por debajo, exactamente la web
        que se aprende a construir en el taller: una base de datos, una API y esta página.
      </p>

      <p v-if="!cargando && !fallo" class="cifras">
        <strong>{{ sombreros.length }}</strong> sombreros ·
        <strong>{{ totalVotos }}</strong> {{ totalVotos === 1 ? 'voto' : 'votos' }} contados
      </p>
    </header>

    <main>
      <p v-if="cargando" class="aviso">Sacando los sombreros del armario&hellip;</p>

      <div v-else-if="fallo" class="aviso malo">
        <p>{{ fallo }}</p>
        <button class="principal" @click="((fallo = null), (cargando = true), cargar())">
          Volver a intentarlo
        </button>
      </div>

      <p v-else-if="!sombreros.length" class="aviso">
        No hay ningún sombrero todavía. Cosa rara, en esta casa.
      </p>

      <template v-else>
        <nav class="ordenar">
          <button
            v-for="o in ORDENES"
            :key="o.id"
            :class="{ activo: orden === o.id }"
            @click="orden = o.id"
          >
            {{ o.etiqueta }}
          </button>
        </nav>

        <div class="rejilla escalonado">
          <FichaSombrero
            v-for="sombrero in ordenados"
            :key="sombrero.id"
            :sombrero="sombrero"
            @votar="votar"
          />
        </div>
      </template>
    </main>

    <footer>
      <p>
        Un voto por persona y sombrero, y se puede cambiar de opinión. Los nombres y las
        descripciones son originales; nada sale de los libros de Sanderson.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.pagina {
  max-width: 64rem;
  margin: 0 auto;
  padding: 3.5rem 1.2rem 4rem;
}

.portada {
  border-bottom: 1px solid var(--borde);
  padding-bottom: 1.6rem;
  margin-bottom: 1.6rem;
}

.encima {
  margin: 0 0 0.35rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--laton-oscuro);
}

h1 {
  margin: 0 0 0.5rem;
  font-family: var(--titulos);
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--texto);
}

.lema {
  margin: 0;
  max-width: 40rem;
  color: var(--texto-tenue);
  line-height: 1.6;
}

.cifras {
  margin: 1rem 0 0;
  font-size: 0.82rem;
  color: var(--texto-apagado);
}

.cifras strong {
  color: var(--laton);
  font-variant-numeric: tabular-nums;
}

.ordenar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 1.1rem;
}

.ordenar button {
  border: none;
  border-radius: 99px;
  padding: 0.28rem 0.8rem;
  font-size: 0.8rem;
  color: var(--texto-apagado);
}

.ordenar button:hover {
  background: rgb(255 255 255 / 0.04);
  color: var(--texto-tenue);
}

.ordenar button.activo {
  background: rgb(223 185 111 / 0.14);
  color: var(--laton);
}

.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17.5rem, 1fr));
  gap: 0.9rem;
}

.aviso {
  color: var(--texto-apagado);
  padding: 3rem 0;
  text-align: center;
}

.aviso.malo {
  color: var(--rojo);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

footer {
  margin-top: 3rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--borde-suave);
  color: var(--texto-apagado);
  font-size: 0.8rem;
}

footer p {
  margin: 0;
  max-width: 40rem;
}
</style>
