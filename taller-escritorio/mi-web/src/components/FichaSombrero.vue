<script setup>
const props = defineProps({
  sombrero: { type: Object, required: true },
})
</script>

<template>
  <article class="ficha">
    <h2>{{ sombrero.nombre }}</h2>
    <p>{{ sombrero.precio }} €</p>
    <button>☆ Favorito</button>
  </article>
</template>

<style scoped>
.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
