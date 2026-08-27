// Mundo 33 — El proyecto por dentro: package.json, npm y semver.
//
// Abre el Acto X (compilar y preparar), que antes era teoría suelta en el
// mundo 26. Aquí se toca el fichero que gobierna el proyecto: dependencias,
// dependencias de desarrollo, scripts y versiones. Y se explica el lockfile,
// que es lo que hace que el proyecto se instale igual en otra máquina.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  jsonValido,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const PACKAGE_SEMBRADO = `{
  "name": "mi-sombrero",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "vue": "^3.5.41"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.8",
    "vite": "^8.2.2"
  }
}
`

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Mi tienda</h1>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}
</style>
`

export default {
  numero: 33,
  acto: 'Compilar y preparar',
  titulo: 'Mundo 33 · El proyecto por dentro',

  entradilla: {
    quien: 'wax',
    texto:
      'Llevas treinta y dos mundos escribiendo componentes y consultas, y no has abierto el fichero que manda: package.json. ' +
      'Ahí está declarado qué necesita tu proyecto para funcionar, qué necesita solo para desarrollarlo, y los atajos que ' +
      'se ejecutan con npm run. Es el documento de identidad del proyecto, y hoy lo entiendes entero.',
  },

  ficheros: {
    'package.json': PACKAGE_SEMBRADO,
    'src/App.vue': APP_SEMBRADA,
  },

  solucion: {
    'src/App.vue': APP_SEMBRADA,
    'package.json': `{
  "name": "mi-sombrero",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "pinia": "^4.0.3",
    "vue": "^3.5.41",
    "vue-router": "^4.6.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.8",
    "vite": "^8.2.2",
    "vitest": "^4.1.11"
  }
}
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'package.json: el documento de identidad',
    cuerpo: `Todo proyecto de JavaScript tiene en su raíz un \`package.json\`. Es un fichero **JSON** —comillas dobles en las claves, sin comentarios, y una coma de más lo rompe entero— y dentro está declarado lo que el proyecto es y lo que necesita.

**Los campos de cabecera.** \`name\` y \`version\` identifican el paquete. \`private: true\` dice "esto no se publica en el registro de npm", y conviene tenerlo en cualquier aplicación: evita publicar tu tienda por accidente. \`type: "module"\` declara que el proyecto usa los \`import\`/\`export\` modernos (los mismos que llevas usando desde el Mundo 8) y no el sistema antiguo de Node.

**\`dependencies\` frente a \`devDependencies\`.** Esta distinción es la que más se equivoca, y tiene consecuencias:

- **\`dependencies\`** es lo que tu aplicación necesita **para funcionar**: \`vue\`, \`vue-router\`, \`pinia\`. Su código acaba dentro de lo que se envía al navegador.
- **\`devDependencies\`** es lo que necesitas **para trabajar**: \`vite\`, el plugin de Vue, \`vitest\`. Herramientas que compilan y prueban, y que NO viajan a producción.

¿Por qué importa? Porque en el servidor de despliegue se instala a veces solo lo primero (\`npm ci --omit=dev\`), y si pones Vue en las de desarrollo, tu aplicación se queda sin Vue. Y al contrario: meter herramientas en \`dependencies\` engorda la instalación de producción sin necesidad.

**Las versiones: semver.** \`"vue": "^3.5.41"\` son tres números —**mayor.menor.parche**— y el símbolo delante decide cuánto te puedes mover:

- **parche** (3.5.41 → 3.5.42): correcciones. No cambia nada de cómo se usa.
- **menor** (3.5 → 3.6): cosas nuevas, sin romper lo anterior.
- **mayor** (3 → 4): cambios que **rompen**. Aquí hay que leer las notas antes de actualizar.

Y los símbolos: \`^3.5.41\` acepta cualquier 3.x.x posterior (menores y parches, no el 4). \`~3.5.41\` solo parches (3.5.x). \`3.5.41\` clavado, exacto. Lo habitual y sensato es \`^\`.

**Los scripts: tus atajos.**

\`\`\`
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
\`\`\`

Se ejecutan con \`npm run <nombre>\` (\`npm run build\`). Sirven para dos cosas: no acordarte de comandos largos, y **documentar** cómo se trabaja en el proyecto: quien lo abra por primera vez mira los scripts y ya sabe. Los cuatro de arriba son la base de cualquier proyecto Vite: desarrollar, compilar, ver el resultado compilado en local, y pasar las pruebas.

**\`npm install\` y el lockfile.** \`npm install <paquete>\` lo descarga a \`node_modules/\` y lo apunta en el \`package.json\`. Y además escribe el \`package-lock.json\`, que guarda la versión **exacta** de todo lo instalado, incluidas las dependencias de tus dependencias. Ese fichero **se sube al repositorio**: es lo que garantiza que en otra máquina se instale exactamente lo mismo. En un servidor de despliegue se usa \`npm ci\`, que instala clavado lo que dice el lockfile y no lo modifica.

**Y lo que nunca se sube:** \`node_modules/\`. Pesa cientos de megas y se reconstruye desde el \`package.json\` en un comando. Va en el \`.gitignore\`, siempre.`,
  },

  pasos: [
    {
      id: '33-1',
      titulo: 'Los scripts que faltan',
      enunciado:
        'Abre <code>package.json</code> (está en la raíz) y añade a <code>scripts</code> los tres que faltan: <code>build</code> (<code>vite build</code>), <code>preview</code> (<code>vite preview</code>) y <code>test</code> (<code>vitest run</code>). Ojo a las comas: es JSON.',
      pista:
        'Cada script es una pareja "nombre": "comando", separadas por comas. La última no lleva coma detrás.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) => {
            const scripts = datos.scripts || {}
            const faltan = ['build', 'preview', 'test'].filter((s) => !scripts[s])
            if (faltan.length) return `Faltan scripts: ${faltan.join(', ')}.`
            if (!/vite build/.test(scripts.build)) {
              return `El script build dice «${scripts.build}» y debería ejecutar «vite build».`
            }
            if (!/vitest/.test(scripts.test)) {
              return `El script test dice «${scripts.test}» y debería ejecutar «vitest run».`
            }
            return null
          }),
        ],
        exito:
          'Cuatro atajos: desarrollar, compilar, ver lo compilado y probar. Quien abra tu proyecto ya sabe cómo se trabaja en él.',
      }),
    },

    eleccion({
      id: '33-2',
      titulo: '¿Dónde va cada cosa?',
      enunciado:
        'Instalas <code>vue-router</code> (para las rutas de tu app) y <code>vitest</code> (para las pruebas). ¿Dónde va cada uno?',
      pista: '¿Cuál de los dos necesita tu aplicación cuando ya está funcionando en internet?',
      opciones: [
        {
          texto: 'vue-router en dependencies (la app lo necesita), vitest en devDependencies (solo para trabajar).',
          correcta: true,
          porque:
            'Eso es. Y no es cosmético: en producción se instala a veces solo dependencies, y una app sin su router no arranca.',
        },
        {
          texto: 'Los dos en dependencies: total, están instalados igual.',
          porque:
            'En tu máquina da igual, y en el servidor no: te llevas un framework de pruebas a producción sin ninguna necesidad.',
        },
        {
          texto: 'Los dos en devDependencies: al compilar ya se meten en el resultado.',
          porque:
            'El router sí acaba en el resultado, pero si lo declaras como de desarrollo, una instalación de producción (npm ci --omit=dev) no lo instalará y el build fallará.',
        },
      ],
    }),

    {
      id: '33-3',
      titulo: 'Declara lo que la app necesita',
      enunciado:
        'Tu tienda usa el router y Pinia. Añádelos a <code>dependencies</code>: <code>"vue-router": "^4.6.4"</code> y <code>"pinia": "^4.0.3"</code>. Y añade <code>vitest</code> (<code>^4.1.11</code>) a <code>devDependencies</code>, que es una herramienta.',
      pista:
        'Las dependencias van por orden alfabético por costumbre (no es obligatorio). Cuidado con la coma de la última línea.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) => {
            const dep = datos.dependencies || {}
            const dev = datos.devDependencies || {}

            const faltanDep = ['vue', 'vue-router', 'pinia'].filter((p) => !dep[p])
            if (faltanDep.length) {
              return `Faltan en dependencies: ${faltanDep.join(', ')}.`
            }
            if (!dev.vitest) return 'Falta vitest en devDependencies.'
            if (dep.vitest) {
              return 'vitest está en dependencies: es una herramienta de desarrollo, no la necesita la app en producción.'
            }
            if (dev.vue || dev['vue-router'] || dev.pinia) {
              return 'Vue, el router o Pinia están en devDependencies: la aplicación los necesita para funcionar, así que van en dependencies.'
            }
            return null
          }),
        ],
        exito:
          'Cada cosa en su lista: lo que la app necesita para funcionar, y lo que tú necesitas para trabajar. Eso es lo que instala (o no) un servidor.',
      }),
    },

    completar({
      id: '33-4',
      titulo: 'Los rangos de versión',
      enunciado: 'Completa qué acepta cada símbolo de semver (escribe el símbolo).',
      pista: 'Uno acepta menores y parches, otro solo parches, y el tercero no acepta nada.',
      plantilla: `___3.5.41  → cualquier 3.x.x posterior (menores y parches)
___3.5.41  → solo parches: 3.5.x
 3.5.41    → clavado, exactamente esa`,
      huecos: [
        { respuestas: ['^'], porque: 'El acento circunflejo acepta menores y parches, sin cambiar de mayor.' },
        { respuestas: ['~'], porque: 'La virgulilla acepta solo parches.' },
      ],
    }),

    {
      id: '33-5',
      titulo: 'Una versión que signifique algo',
      enunciado:
        'El proyecto está en <code>0.0.0</code>, que no dice nada. Súbelo a <code>0.1.0</code>: hay funcionalidad, aún no es estable. Y comprueba que <code>private</code> sigue en <code>true</code> (esto no se publica en npm).',
      pista: 'La versión es un texto: <code>"version": "0.1.0"</code>.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) => {
            if (datos.version === '0.0.0') {
              return 'La versión sigue en 0.0.0. Súbela a 0.1.0.'
            }
            if (!/^\d+\.\d+\.\d+$/.test(String(datos.version || ''))) {
              return `La versión «${datos.version}» no tiene la forma mayor.menor.parche (por ejemplo 0.1.0).`
            }
            if (datos.private !== true) {
              return 'Pon private: true. Sin eso, un npm publish despistado publicaría tu tienda en el registro público.'
            }
            return null
          }),
        ],
        exito:
          '0.1.0 y privado. Las versiones no son adorno: son el contrato con quien use tu código, aunque ese alguien seas tú en tres meses.',
      }),
    },

    verdaderoFalso({
      id: '33-6',
      titulo: 'Cierto o falso: npm y las versiones',
      enunciado: 'Cinco frases sobre el proyecto por dentro. Todas.',
      pista: 'El lockfile, node_modules y el salto de versión mayor.',
      afirmaciones: [
        {
          texto: 'package-lock.json se sube al repositorio.',
          cierto: true,
          porque:
            'Cierto: es lo que garantiza que en otra máquina se instale exactamente lo mismo, hasta las dependencias de tus dependencias.',
        },
        {
          texto: 'node_modules/ también se sube, por si acaso.',
          cierto: false,
          porque:
            'Falso: pesa cientos de megas y se reconstruye con un comando. Va en el .gitignore, siempre.',
        },
        {
          texto: 'Un cambio de versión mayor (3 → 4) puede romper tu código.',
          cierto: true,
          porque: 'Cierto: eso es lo que significa mayor en semver. Se lee las notas antes de subir.',
        },
        {
          texto: 'npm ci instala según el lockfile y no lo modifica.',
          cierto: true,
          porque: 'Cierto: por eso es el comando de los servidores de despliegue, y no npm install.',
        },
        {
          texto: 'Da igual si Vue está en dependencies o devDependencies.',
          cierto: false,
          porque:
            'Falso: si va en las de desarrollo, una instalación de producción no lo instala y el build se cae.',
        },
      ],
    }),

    emparejar({
      id: '33-7',
      titulo: 'Cada comando, su momento',
      enunciado: 'Une cada comando con para qué se usa.',
      pista: 'Desarrollar, compilar, mirar lo compilado, instalar clavado.',
      pares: [
        { izquierda: 'npm run dev', derecha: 'trabajar, con recarga al guardar' },
        { izquierda: 'npm run build', derecha: 'compilar la web a dist/' },
        {
          izquierda: 'npm run preview',
          derecha: 'ver en local el resultado ya compilado',
          porque: 'Sirve para pillar los fallos que solo aparecen en el build antes de publicar.',
        },
        { izquierda: 'npm ci', derecha: 'instalar exactamente lo que dice el lockfile' },
      ],
      porque:
        'Cuatro comandos y tienes el ciclo entero: desarrollar, compilar, comprobar y desplegar reproducible.',
    }),

    ordenar({
      id: '33-8',
      titulo: 'De cero a proyecto instalado',
      enunciado: 'Ordena lo que pasa cuando alguien clona tu proyecto y lo arranca.',
      pista: 'Traer el código, instalar según el lockfile, y a trabajar.',
      lineas: [
        'git clone del repositorio (sin node_modules)',
        'npm ci: instala las versiones exactas del lockfile',
        'npm run dev: arranca Vite con recarga en caliente',
        'npm run build: cuando toca publicar, compila a dist/',
      ],
      porque:
        'Clonar, instalar, desarrollar, compilar. Que esos cuatro pasos funcionen sin sorpresas es lo que hace un proyecto sano.',
    }),

    {
      id: '33-9',
      titulo: 'El package.json completo',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja el <code>package.json</code> como el de un proyecto serio: JSON válido, <code>version</code> con forma de semver (no 0.0.0), <code>private: true</code>, <code>type: "module"</code>, los cuatro scripts (<code>dev</code>, <code>build</code>, <code>preview</code>, <code>test</code>), <code>vue</code>, <code>vue-router</code> y <code>pinia</code> en <code>dependencies</code>, y <code>vite</code>, el plugin y <code>vitest</code> en <code>devDependencies</code>.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) => {
            if (datos.private !== true) return 'Falta private: true.'
            if (datos.type !== 'module') return 'Falta type: "module".'
            if (!/^\d+\.\d+\.\d+$/.test(String(datos.version || '')) || datos.version === '0.0.0') {
              return 'La versión tiene que tener forma de semver y no ser 0.0.0.'
            }

            const scripts = datos.scripts || {}
            const faltanScripts = ['dev', 'build', 'preview', 'test'].filter((s) => !scripts[s])
            if (faltanScripts.length) return `Faltan scripts: ${faltanScripts.join(', ')}.`

            const dep = datos.dependencies || {}
            const dev = datos.devDependencies || {}
            const faltanDep = ['vue', 'vue-router', 'pinia'].filter((p) => !dep[p])
            if (faltanDep.length) return `Faltan en dependencies: ${faltanDep.join(', ')}.`

            const faltanDev = ['vite', 'vitest'].filter((p) => !dev[p])
            if (faltanDev.length) return `Faltan en devDependencies: ${faltanDev.join(', ')}.`

            const rangos = Object.values({ ...dep, ...dev })
            if (!rangos.every((v) => /^[\^~]?\d+\.\d+\.\d+/.test(String(v)))) {
              return 'Alguna versión no tiene forma de semver (por ejemplo ^3.5.41).'
            }
            return null
          }),
        ],
        exito:
          'Un package.json que cualquiera puede leer para saber qué es tu proyecto, qué necesita y cómo se trabaja en él. Ahora, la herramienta que lo compila.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Ya sé que un fichero de configuración no emociona a nadie. Pero fíjate en lo que acabas de aprender a leer: cualquier proyecto ' +
      'de JavaScript del mundo empieza por este fichero, y ahora lo abres y sabes qué es, qué necesita y cómo se arranca. Eso vale para todos, no solo para el tuyo.',
  },
}
