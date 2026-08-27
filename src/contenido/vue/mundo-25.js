// Mundo 25 (Vue) — El otro lado del cable: servidores, bases de datos y
// seguridad.
//
// Cierra el Acto VII. Se cruza (con la cabeza, no con el teclado) al lado del
// servidor: qué es una API, qué guarda una base de datos, cómo se habla SQL, y
// las dos reglas de seguridad que salvan webs: nunca confíes en lo que entra,
// nunca pintes HTML ajeno. Los pasos de código arreglan un XSS de libro y
// blindan un formulario de reseñas.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaSinPatron(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? mensaje : null)
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'

// Reseñas "llegadas del servidor". Una de ellas trae una sorpresa: HTML
// malicioso, como el que enviaría un atacante de verdad.
const resenas = ref([
  { id: 1, quien: 'Marta', texto: 'El bombín me cambió la cara. Para bien, creo.' },
  { id: 2, quien: 'Un tipo listo', texto: '<img src=x onerror="alert(\\'te he robado la sesión\\')"> Gran sombrero.' },
])

const nueva = ref('')

function publicar() {
  resenas.value.push({ id: resenas.value.length + 1, quien: 'Tú', texto: nueva.value })
  nueva.value = ''
}
</script>

<template>
  <main>
    <h1>Reseñas</h1>

    <!-- PELIGRO: v-html pinta el HTML que venga dentro del texto. -->
    <article v-for="r in resenas" :key="r.id" class="resena">
      <strong>{{ r.quien }}</strong>
      <p v-html="r.texto"></p>
    </article>

    <form @submit.prevent="publicar">
      <input v-model="nueva" placeholder="Tu reseña" />
      <button type="submit">Publicar</button>
    </form>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.resena {
  border-bottom: 1px solid #d8c9ad;
  padding: 0.6rem 0;
}
</style>
`

export default {
  numero: 25,
  acto: 'El servidor',
  titulo: 'Mundo 25 · El otro lado del cable',

  entradilla: {
    quien: 'wayne',
    texto:
      'Mira la vista previa: hay una reseña que trae un regalo envenenado, HTML con malas intenciones, como los que llegan ' +
      'a cualquier web con comentarios. Hoy toca entender el otro lado del cable (servidores, bases de datos) y aprender ' +
      'las dos reglas que evitan que un listillo te convierta la tienda en su patio. Ponte el sombrero de guardia.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'

const resenas = ref([
  { id: 1, quien: 'Marta', texto: 'El bombín me cambió la cara. Para bien, creo.' },
  { id: 2, quien: 'Un tipo listo', texto: '<img src=x onerror="alert(\\'te he robado la sesión\\')"> Gran sombrero.' },
])

const nueva = ref('')
const aviso = ref(null)

function publicar() {
  const texto = nueva.value.trim()

  if (texto.length < 10) {
    aviso.value = 'La reseña necesita al menos 10 caracteres. Cuéntanos algo.'
    return
  }
  if (texto.length > 300) {
    aviso.value = 'Máximo 300 caracteres. Resume, que se puede.'
    return
  }

  aviso.value = null
  resenas.value.push({ id: resenas.value.length + 1, quien: 'Tú', texto })
  nueva.value = ''
}
</script>

<template>
  <main>
    <h1>Reseñas</h1>

    <article v-for="r in resenas" :key="r.id" class="resena">
      <strong>{{ r.quien }}</strong>
      <p>{{ r.texto }}</p>
    </article>

    <form @submit.prevent="publicar">
      <input v-model="nueva" placeholder="Tu reseña" />
      <button type="submit">Publicar</button>
    </form>
    <p v-if="aviso" class="aviso">{{ aviso }}</p>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.resena {
  border-bottom: 1px solid #d8c9ad;
  padding: 0.6rem 0;
}

.aviso {
  color: #a03e2d;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Servidores, bases de datos y las dos reglas',
    cuerpo: `Llevas dos mundos hablando con "el servidor". Toca saber qué es. Un **servidor** es un ordenador encendido siempre, que escucha peticiones HTTP y contesta. Encima corre una **API** (el programa que atiende: recibe \`GET /sombreros\`, decide, responde JSON), y detrás casi siempre hay una **base de datos**: el archivo donde los datos duermen ordenados.

**La base de datos, en dos pinceladas.** Las más comunes (PostgreSQL, MySQL, SQLite) son **relacionales**: guardan **tablas**, como hojas de cálculo estrictas. Una tabla \`sombreros\` con columnas \`id\`, \`nombre\`, \`precio\`, y una fila por sombrero. Se les habla en **SQL**, un idioma de frases casi humanas:

\`\`\`
SELECT * FROM sombreros WHERE precio < 30;
INSERT INTO sombreros (nombre, precio) VALUES ('Boina', 22);
UPDATE sombreros SET precio = 19 WHERE id = 3;
DELETE FROM sombreros WHERE id = 3;
\`\`\`

Leer, crear, cambiar, borrar. ¿Te suena el cuarteto? Es el mismo de REST: \`GET/POST/PUT/DELETE\`. No es casualidad: **la API suele ser un traductor** entre los verbos HTTP que hablas tú y el SQL que habla la base de datos. El viaje completo de un dato: tu fetch → la API lo recibe → consulta SQL → la base responde filas → la API las convierte a JSON → tu await las recoge → un ref → la pantalla. Ocho eslabones, y ya conoces los dos extremos.

**Regla de seguridad nº 1: nunca confíes en lo que entra.** Todo lo que llega de fuera —un formulario, un parámetro de URL, un JSON ajeno— puede venir malformado o malintencionado. La validación del cliente (tu \`trim\`, tus límites) mejora la experiencia, pero **cualquiera puede saltársela** (las herramientas del navegador editan tu página en dos clics). Por eso el servidor revalida SIEMPRE, aunque el cliente ya validara. Doble puerta: la del cliente por amabilidad, la del servidor por seguridad. Y de esta regla sale también la defensa contra la **inyección SQL**: si la API pegara texto del usuario dentro de una consulta, un gracioso escribiría \`'; DELETE FROM sombreros; --\` en tu buscador y adiós tabla. La defensa (consultas parametrizadas) es cosa del servidor, pero la regla madre es la misma: lo que entra, ni se pega ni se ejecuta.

**Regla de seguridad nº 2: nunca pintes HTML ajeno.** Mira tu vista previa: la reseña del "tipo listo" trae una etiqueta con JavaScript dentro, y tu \`v-html\` la está EJECUTANDO. Eso se llama **XSS** (cross-site scripting) y es el ataque más común de la web: si un atacante logra que su HTML se pinte en tu página, su código corre con los permisos de tus usuarios —robo de sesión incluido—. La solución en Vue es de una belleza absoluta: **las llaves dobles escapan solas**. \`{{ r.texto }}\` pinta el ataque como TEXTO inofensivo, visible y ridículo. \`v-html\` existe para casos contadísimos de HTML propio y de confianza; con contenido de usuarios, jamás. La versión corta: **si dudas entre \`{{ }}\` y \`v-html\`, es \`{{ }}\`**.

**¿Y las contraseñas, los pagos, las claves de API?** Del lado del servidor, siempre: el código del cliente lo puede leer cualquiera (F12 y ahí está todo). Ninguna clave secreta viaja en tu JavaScript. Este taller no monta servidor —eso da para otro taller entero—, pero con este mapa ya sabes leer cualquier arquitectura web que te pongan delante, y sobre todo: sabes dónde NO poner las cosas.`,
  },

  pasos: [
    eleccion({
      id: '25-1',
      titulo: 'El reparto de papeles',
      enunciado: 'En una tienda online, ¿cuál es el reparto correcto de papeles?',
      pista: 'Quién pinta, quién decide y traduce, quién guarda.',
      opciones: [
        {
          texto: 'El navegador pinta (Vue), la API decide y traduce, la base de datos guarda.',
          correcta: true,
          porque: 'Ese es el trío: cliente para la experiencia, API para las reglas, base de datos para la memoria. Cada capa en su sitio.',
        },
        {
          texto: 'La base de datos pinta la página y el navegador guarda los datos.',
          porque: 'Al revés en ambos: la base guarda (y nunca pinta nada), el navegador pinta (y su almacenamiento local no es la memoria del negocio).',
        },
        {
          texto: 'Todo lo hace Vue, que para eso es un framework.',
          porque: 'Vue vive solo en el navegador. Los datos duraderos y las reglas serias necesitan el otro lado del cable.',
        },
      ],
    }),

    {
      id: '25-2',
      titulo: 'Desactiva la bomba',
      enunciado:
        'La reseña del atacante se está EJECUTANDO por culpa del <code>v-html</code>. Arréglalo: sustituye <code>&lt;p v-html="r.texto"&gt;&lt;/p&gt;</code> por un párrafo con interpolación normal: <code>&lt;p&gt;{{ r.texto }}&lt;/p&gt;</code>. Mira la vista previa: el ataque queda pintado como texto, ridículo e inofensivo.',
      pista: 'Las llaves dobles escapan el HTML solas. Es literalmente quitar el v-html y poner {{ }}.',
      comprobar: comprobarVue({
        template: [
          plantillaSinPatron(/v-html/, 'El v-html sigue ahí, y con él la puerta abierta. Quítalo del todo.'),
          plantillaContiene(/\{\{\s*r\.texto\s*\}\}/, 'Pinta la reseña con la interpolación: {{ r.texto }}.'),
        ],
        exito: 'XSS desactivado con dos llaves. El ataque ahora es texto a la vista: humillante para su autor, inofensivo para tus usuarios.',
      }),
    },

    verdaderoFalso({
      id: '25-3',
      titulo: 'Cierto o falso: la base de datos',
      enunciado: 'Cinco frases sobre el archivo del negocio. Todas.',
      pista: 'Tablas, SQL, y dónde duermen los datos.',
      afirmaciones: [
        { texto: 'Una base de datos relacional guarda tablas con columnas y filas.', cierto: true, porque: 'Cierto: como hojas de cálculo estrictas. Tabla sombreros, columna precio, una fila por sombrero.' },
        { texto: 'SQL es el idioma con el que se consulta y modifica esa base.', cierto: true, porque: 'Cierto: SELECT lee, INSERT crea, UPDATE cambia, DELETE borra.' },
        { texto: 'El localStorage del navegador sirve como base de datos de una tienda.', cierto: false, porque: 'Falso: vive en UN navegador de UN cliente. La memoria del negocio va en el servidor, compartida y respaldada.' },
        { texto: 'La API suele traducir entre los verbos HTTP y las consultas SQL.', cierto: true, porque: 'Cierto: GET→SELECT, POST→INSERT… la API es el traductor con criterio (y con seguridad) en medio.' },
        { texto: 'Apagar el servidor borra la base de datos.', cierto: false, porque: 'Falso: los datos están en disco. Apagado el servidor no atiende, pero al volver, los datos siguen.' },
      ],
    }),

    emparejar({
      id: '25-4',
      titulo: 'Dos idiomas, un cuarteto',
      enunciado: 'Une cada frase SQL con su verbo HTTP equivalente en una API REST.',
      pista: 'Leer, crear, cambiar, borrar: en los dos idiomas.',
      pares: [
        { izquierda: 'SELECT * FROM sombreros', derecha: 'GET /sombreros' },
        { izquierda: 'INSERT INTO sombreros …', derecha: 'POST /sombreros', porque: 'Crear: INSERT en SQL, POST en HTTP. La API traduce.' },
        { izquierda: 'UPDATE sombreros SET … WHERE id = 2', derecha: 'PUT /sombreros/2' },
        { izquierda: 'DELETE FROM sombreros WHERE id = 2', derecha: 'DELETE /sombreros/2' },
      ],
      porque: 'El mismo cuarteto en dos idiomas: HTTP por delante, SQL por detrás, y la API traduciendo con criterio.',
    }),

    completar({
      id: '25-5',
      titulo: 'Tu primera consulta',
      enunciado: 'Completa la consulta que pide las gangas: todos los sombreros de menos de 30 euros.',
      pista: 'La palabra de leer, la de "de qué tabla" y la del filtro.',
      plantilla: `___ * FROM sombreros ___ precio < 30;`,
      huecos: [
        { respuestas: ['SELECT', 'select'], porque: 'SELECT lee. El * significa "todas las columnas".' },
        { respuestas: ['WHERE', 'where'], porque: 'WHERE filtra las filas: solo las que cumplan la condición. Tu filter, en SQL.' },
      ],
    }),

    eleccion({
      id: '25-6',
      titulo: 'La validación saltada',
      enunciado: 'Tu formulario valida "mínimo 10 caracteres" en el cliente. Un listillo la esquiva con las herramientas del navegador y envía basura. ¿Qué la para?',
      pista: '¿Qué validación NO puede tocar el usuario?',
      opciones: [
        {
          texto: 'La revalidación en el servidor: la única que el usuario no puede editar.',
          correcta: true,
          porque: 'Exacto: la del cliente es amabilidad (avisa al instante), la del servidor es seguridad (nadie la esquiva). Doble puerta, siempre.',
        },
        {
          texto: 'Nada: si esquivó la validación, la basura entra.',
          porque: 'Solo si el servidor confía a ciegas en el cliente, que es exactamente el error. El servidor revalida TODO lo que entra.',
        },
        {
          texto: 'Poner la validación del cliente dos veces, por si acaso.',
          porque: 'Dos puertas del mismo lado siguen estando del lado editable. La segunda puerta tiene que estar donde el usuario no llega: el servidor.',
        },
      ],
    }),

    {
      id: '25-7',
      titulo: 'La puerta del cliente, bien puesta',
      enunciado:
        'Blinda <code>publicar</code>: un ref <code>aviso</code> (null), <code>trim()</code> del texto, corte con mensaje si tiene menos de 10 caracteres, corte si pasa de 300, y limpieza del aviso antes del push. Enseña el aviso bajo el formulario: <code>&lt;p v-if="aviso" class="aviso"&gt;{{ aviso }}&lt;/p&gt;</code>.',
      pista: 'Dos if con return temprano, cada uno dejando su mensaje en aviso.value. Si todo pasa, aviso.value = null y el push de siempre.',
      comprobar: comprobarVue({
        script: [
          (script) => (/const\s+aviso\s*=\s*ref\s*\(\s*null\s*\)/.test(script) ? null : 'Falta const aviso = ref(null).'),
          (script) => (/\.trim\s*\(\s*\)/.test(script) ? null : 'Falta el trim() del texto.'),
          (script) =>
            /length\s*<\s*10[\s\S]*?return/.test(script) ? null : 'Falta el corte de mínimo: if (texto.length < 10) con su aviso y su return.',
          (script) =>
            /length\s*>\s*300[\s\S]*?return/.test(script) ? null : 'Falta el tope: if (texto.length > 300) con su aviso y su return.',
        ],
        template: [
          plantillaContiene(/v-if\s*=\s*["']aviso["']/, 'Falta enseñar el aviso con v-if="aviso".'),
        ],
        exito: 'Mínimo, máximo, espacios fuera y mensajes claros. La puerta del cliente, con su letrero. (La del servidor, recuérdalo, iría además.)',
      }),
    },

    ordenar({
      id: '25-8',
      titulo: 'El viaje completo de un dato',
      enunciado: 'Ordena el viaje de una reseña desde el teclado hasta quedar guardada.',
      pista: 'Cliente valida, viaja, API revalida, SQL guarda, respuesta vuelve.',
      lineas: [
        'La persona escribe y tu formulario valida (trim, longitud)',
        'fetch envía un POST con el texto en JSON',
        'La API lo recibe y REVALIDA todo de nuevo',
        'Una consulta INSERT parametrizada lo guarda en la tabla',
        'La API responde 200 y tu await recoge la confirmación',
      ],
      porque: 'Teclado → validación → POST → revalidación → INSERT → confirmación. Cuando montes tu primer servidor, este mapa ya lo tendrás de serie.',
    }),

    {
      id: '25-9',
      titulo: 'La página que no se deja',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja las reseñas a prueba de listillos: ni un <code>v-html</code> en el template (todo con <code>{{ }}</code>), y el formulario blindado entero: <code>aviso</code>, <code>trim</code>, corte por corto (&lt;10), corte por largo (&gt;300), aviso visible con su estilo <code>.aviso</code>, y el push solo cuando todo pasa.',
      comprobar: comprobarVue({
        template: [
          plantillaSinPatron(/v-html/, 'Sigue habiendo un v-html. Con contenido de usuarios, jamás: {{ }} siempre.'),
          plantillaContiene(/\{\{\s*r\.texto\s*\}\}/, 'Las reseñas se pintan con {{ r.texto }}.'),
          plantillaContiene(/v-if\s*=\s*["']aviso["']/, 'Falta el aviso visible.'),
        ],
        script: [
          (script) => (/length\s*<\s*10/.test(script) ? null : 'Falta el mínimo de 10 caracteres.'),
          (script) => (/length\s*>\s*300/.test(script) ? null : 'Falta el tope de 300.'),
          (script) => (/\.trim\s*\(\s*\)/.test(script) ? null : 'Falta el trim.'),
        ],
        estilo: [
          (reglas) => (reglas.some((r) => /\.aviso/.test(r.selector)) ? null : 'Dale su estilo a .aviso.'),
        ],
        exito:
          'XSS neutralizado, entradas validadas, avisos con salida. Con el mapa del servidor en la cabeza y estas dos reglas tatuadas, cierras el acto más serio del taller. Queda lo mejor: enseñárselo al mundo.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Las dos reglas, para el bolsillo de siempre: nunca confíes en lo que entra, nunca pintes HTML ajeno. Todo lo demás de la seguridad ' +
      'web son variaciones con más letra. Tu tienda ya pide, espera, falla con elegancia y no se deja envenenar. Solo falta una cosa: que exista para el mundo. Último acto.',
  },
}
