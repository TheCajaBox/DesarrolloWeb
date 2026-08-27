<script setup>
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <section v-if="cesta.cuantos === 0">
    <h2>La cesta está vacía</h2>
    <RouterLink to="/catalogo">Ir al catálogo</RouterLink>
  </section>

  <section v-else>
    <h2>Tu cesta</h2>
    <ul>
      <li v-for="(linea, indice) in cesta.lineas" :key="indice">
        {{ linea.nombre }} — {{ linea.precio }} €
        <button @click="cesta.quitar(indice)">Quitar</button>
      </li>
    </ul>
    <p><strong>Total: {{ cesta.total }} €</strong></p>
  </section>
</template>

<style scoped>
</style>
