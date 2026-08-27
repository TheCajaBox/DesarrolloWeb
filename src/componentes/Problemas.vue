<script setup>
// El panel de problemas: lo que Vite no consigue compilar.
//
// Vite ya avisa con un cartel rojo encima de la vista previa, pero ese cartel
// se va al siguiente cambio y no deja rastro. Aquí queda hasta que compile de
// verdad, con el fichero, la línea y el trozo de código señalado.
//
// El fichero es un enlace: pulsarlo lo abre en el editor, que es lo único que
// se quiere hacer al leer un error.
import { usarDiagnostico } from '../almacen/diagnostico.js'

const diagnostico = usarDiagnostico()

const emitir = defineEmits(['abrir'])
</script>

<template>
  <div class="problemas">
    <p v-if="!diagnostico.hayProblema" class="tranquilo">
      Nada roto. Todo lo que has escrito compila.
    </p>

    <div v-else class="problema">
      <p class="donde">
        <button
          v-if="diagnostico.problema.fichero"
          class="fichero"
          title="Abrirlo en el editor"
          @click="emitir('abrir', diagnostico.problema.fichero)"
        >
          {{ diagnostico.problema.fichero }}<template v-if="diagnostico.problema.linea"
            >:{{ diagnostico.problema.linea }}</template
          >
        </button>
        <span v-else class="fichero sin-sitio">sin fichero concreto</span>
      </p>

      <p class="mensaje">{{ diagnostico.problema.mensaje }}</p>

      <pre v-if="diagnostico.problema.trozo" class="trozo">{{ diagnostico.problema.trozo }}</pre>
    </div>
  </div>
</template>

<style scoped>
.problemas {
  height: 100%;
  overflow-y: auto;
  padding: 0.7rem 0.9rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.55;
}

.tranquilo {
  margin: 0;
  color: var(--texto-apagado);
  opacity: 0.8;
}

.donde {
  margin: 0 0 0.3rem;
}

.fichero {
  padding: 0;
  border: none;
  background: none;
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--laton);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.fichero:hover {
  color: var(--acento);
  background: none;
}

.fichero.sin-sitio {
  color: var(--texto-apagado);
  text-decoration: none;
}

.mensaje {
  margin: 0;
  color: var(--rojo, #d98b7a);
  white-space: pre-wrap;
  word-break: break-word;
}

.trozo {
  margin: 0.5rem 0 0;
  padding: 0.5rem 0.6rem;
  border-radius: 0.4rem;
  background: rgb(0 0 0 / 0.3);
  border: 1px solid var(--borde-suave);
  color: var(--texto-tenue);
  white-space: pre;
  overflow-x: auto;
}
</style>
