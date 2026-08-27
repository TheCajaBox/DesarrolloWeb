<script setup>
// El glosario de Steris, entero y buscable.
//
// Hasta ahora los términos solo existían subrayados dentro de una lección, así
// que para consultar algo había que recordar dónde lo habías visto. Aquí están
// todos, con su buscador.
//
// Steris es exhaustiva sin ser condescendiente: la definición completa, el
// «ojo» cuando hay una trampa, y nada de tono de manual para principiantes.
import { computed, ref, watch } from 'vue'
import terminos from '../contenido/glosario/terminos.js'
import sterisAvatar from '../recursos/steris-avatar.webp'
import { usarColeccion } from '../almacen/coleccion.js'

const emitir = defineEmits(['volver'])

const coleccion = usarColeccion()

const busqueda = ref('')

const sinAcentos = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const filtrados = computed(() => {
  const aguja = sinAcentos(busqueda.value.trim())
  if (!aguja) return terminos

  return terminos.filter((entrada) => {
    const donde = [entrada.termino, ...(entrada.alias || []), entrada.definicion, entrada.ojo || '']
    return donde.some((texto) => sinAcentos(texto).includes(aguja))
  })
})

// Una búsqueda de verdad: tres letras y que encuentre algo. Teclear una letra
// suelta y borrarla no es consultar nada.
watch([busqueda, filtrados], ([texto, lista]) => {
  if (sinAcentos(String(texto).trim()).length >= 3 && lista.length) {
    coleccion.encontrar('sombrero-de-steris')
  }
})

// Agrupados por letra inicial, que es como se busca en un glosario.
const porLetra = computed(() => {
  const grupos = new Map()

  for (const entrada of [...filtrados.value].sort((a, b) =>
    a.termino.localeCompare(b.termino, 'es'),
  )) {
    const letra = sinAcentos(entrada.termino[0]).toUpperCase()
    if (!grupos.has(letra)) grupos.set(letra, [])
    grupos.get(letra).push(entrada)
  }

  return [...grupos.entries()]
})
</script>

<template>
  <div class="glosario">
    <header class="cabecera">
      <img :src="sterisAvatar" alt="" class="retrato" width="72" height="72" />

      <div>
        <p class="encima">El glosario de Steris</p>
        <h1>Cada palabra, explicada</h1>
        <p class="lema">
          {{ terminos.length }} términos. Ninguna definición usa una palabra que no esté aquí
          también.
        </p>
      </div>
    </header>

    <div class="buscador">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar: clave ajena, especificidad, cookie…"
        aria-label="Buscar en el glosario"
      />
      <button v-if="busqueda" class="limpiar" aria-label="Limpiar" @click="busqueda = ''">×</button>
    </div>

    <p v-if="!filtrados.length" class="sin-nada">
      No hay ningún término que encaje con «{{ busqueda }}». Puede que todavía no esté escrito.
    </p>

    <section v-for="[letra, lista] in porLetra" :key="letra" class="letra">
      <h2>{{ letra }}</h2>

      <dl>
        <template v-for="entrada in lista" :key="entrada.termino">
          <dt>
            {{ entrada.termino }}
            <span v-if="entrada.alias?.length" class="alias">
              también: {{ entrada.alias.join(', ') }}
            </span>
          </dt>
          <dd>
            <p>{{ entrada.definicion }}</p>
            <p v-if="entrada.ojo" class="ojo"><strong>Ojo:</strong> {{ entrada.ojo }}</p>
          </dd>
        </template>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.glosario {
  height: 100%;
  overflow-y: auto;
  padding: 2.6rem 1.5rem 5rem;
}

.glosario > * {
  max-width: 46rem;
  margin-left: auto;
  margin-right: auto;
}

.cabecera {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid var(--borde);
}

.retrato {
  flex: none;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  border: 2px solid var(--verde);
  box-shadow: 0 0 0 5px rgb(127 160 90 / 0.08);
  object-fit: cover;
}

.encima {
  margin: 0;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--verde);
}

h1 {
  margin: 0.2rem 0 0.3rem;
  font-family: var(--titulos);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--texto);
}

.lema {
  margin: 0;
  color: var(--texto-tenue);
  font-size: 0.9rem;
}

.buscador {
  position: relative;
  margin: 1.4rem auto;
}

.buscador input {
  width: 100%;
  padding: 0.6rem 2.2rem 0.6rem 0.85rem;
  font-size: 0.95rem;
}

.limpiar {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  padding: 0.1rem 0.4rem;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.limpiar:hover {
  color: var(--texto);
  background: none;
  border-color: transparent;
}

.sin-nada {
  color: var(--texto-apagado);
  font-size: 0.9rem;
  padding: 2rem 0;
}

.letra {
  margin-top: 1.8rem;
}

.letra h2 {
  margin: 0 0 0.6rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--borde-suave);
  font-family: var(--titulos);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--laton-oscuro);
}

dl {
  margin: 0;
}

dt {
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--laton);
}

.alias {
  margin-left: 0.5rem;
  font-weight: 400;
  font-size: 0.72rem;
  color: var(--texto-apagado);
}

dd {
  margin: 0.2rem 0 0;
}

dd p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--texto-tenue);
}

.ojo {
  margin-top: 0.4rem !important;
  border-left: 2px solid var(--oxido);
  padding-left: 0.7rem;
}

.ojo strong {
  color: var(--oxido);
}

@media (max-width: 40rem) {
  .glosario {
    padding: 1.6rem 1rem 4rem;
  }

  .cabecera {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.9rem;
  }
}
</style>
