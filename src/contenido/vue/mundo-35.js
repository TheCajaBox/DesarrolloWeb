// Mundo 35 — Pruebas automáticas y publicar.
//
// Cierra el Acto X y el temario. Aquí se escribe una prueba de verdad con
// Vitest (una función pura y un componente montado), se entiende qué es
// integración continua, y se repasa el despliegue: build, SPA fallback, caché
// y el ciclo de trabajo real.
//
// Es el mundo que convierte "sé hacer webs" en "sé mantener una web".
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  jsonValido,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const PRECIOS_SEMBRADO = `// Las cuentas del dinero, en su propio fichero: así se pueden probar sin
// arrancar la interfaz.

export function totalCesta(lineas) {
  let suma = 0
  for (const linea of lineas) suma += linea.precio * (linea.unidades ?? 1)
  return suma
}

export function conDescuento(total, porcentaje) {
  return Math.round(total * (1 - porcentaje / 100))
}
`

const PACKAGE_SEMBRADO = `{
  "name": "mi-sombrero",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
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
`

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Mi tienda</h1>
    <RouterView />
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
  numero: 35,
  acto: 'Compilar y preparar',
  titulo: 'Mundo 35 · Pruebas y publicar',

  entradilla: {
    quien: 'wax',
    texto:
      'Último mundo, y el que separa a quien hace webs de quien las mantiene. Tu tienda funciona… hoy, y porque la has probado a mano. ' +
      'Dentro de tres meses cambiarás una línea del cálculo del total y no volverás a comprobar la cesta entera. ' +
      'Para eso están las pruebas automáticas: para que el ordenador compruebe por ti lo que ya sabías que funcionaba.',
  },

  ficheros: {
    'package.json': PACKAGE_SEMBRADO,
    'src/precios.js': PRECIOS_SEMBRADO,
    'src/App.vue': APP_SEMBRADA,
  },

  solucion: {
    'src/precios.js': PRECIOS_SEMBRADO,
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
    'pruebas/precios.test.js': `import { describe, expect, it } from 'vitest'
import { conDescuento, totalCesta } from '../src/precios.js'

describe('el total de la cesta', () => {
  it('suma los precios de las líneas', () => {
    const lineas = [{ precio: 42 }, { precio: 18 }]
    expect(totalCesta(lineas)).toBe(60)
  })

  it('cuenta las unidades cuando hay más de una', () => {
    expect(totalCesta([{ precio: 20, unidades: 3 }])).toBe(60)
  })

  it('con la cesta vacía da cero, no falla', () => {
    expect(totalCesta([])).toBe(0)
  })
})

describe('el descuento', () => {
  it('quita el porcentaje y redondea', () => {
    expect(conDescuento(100, 10)).toBe(90)
  })

  it('sin descuento deja el total igual', () => {
    expect(conDescuento(75, 0)).toBe(75)
  })
})
`,
    '.github/workflows/ci.yml': `name: pruebas

on: [push, pull_request]

jobs:
  probar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
      - run: npm run build
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Probar de verdad, y publicar sin miedo',
    cuerpo: `Una prueba automática es un trozo de código que comprueba otro trozo de código. Nada más. Y su valor no está en encontrar el fallo de hoy —ese lo ves tú—, sino en **avisarte del que vas a meter dentro de tres meses** cuando cambies algo que creías inofensivo.

**Vitest: la forma de una prueba.** Es el mismo motor de Vite, así que entiende tu proyecto sin configurar nada. Una prueba se lee casi como una frase:

\`\`\`
import { describe, expect, it } from 'vitest'
import { totalCesta } from '../src/precios.js'

describe('el total de la cesta', () => {
  it('suma los precios de las líneas', () => {
    expect(totalCesta([{ precio: 42 }, { precio: 18 }])).toBe(60)
  })
})
\`\`\`

\`describe\` agrupa, \`it\` (o \`test\`) es una prueba, y \`expect(algo).toBe(esperado)\` es la comprobación. Se ejecutan con \`npm test\` y salen en verde o en rojo. Los \`expect\` que más usarás: \`toBe\` (igual, para números y textos), \`toEqual\` (igual comparando por dentro, para arrays y objetos), \`toContain\` (que incluya), \`toBeTruthy\` / \`toBeNull\`, y \`toThrow\` (que dé error, cuando debe darlo).

**Qué se prueba primero: lo que puede estar mal sin que se vea.** Las cuentas, las reglas de negocio, lo que transforma datos. Ahí es donde un error pasa desapercibido y cuesta dinero. Por eso el cálculo del total vive en \`src/precios.js\` y no dentro de un componente: **una función pura —mismos datos, mismo resultado, sin tocar nada de fuera— es lo más fácil de probar del mundo**, y sacar las cuentas del componente es la mitad del trabajo de hacer un proyecto probable.

**Y los casos límite, que son los que fallan de verdad.** La cesta vacía, el descuento del cero por ciento, dos unidades del mismo artículo, un precio a cero. Escribir esos casos obliga a decidir qué debe pasar, y muchas veces ahí descubres que tu función no lo tenía claro. Una regla que funciona: por cada función, una prueba del caso normal y otra del caso raro.

**Probar un componente.** También se puede montar un componente y mirar qué pinta (con \`@vue/test-utils\`), pero el orden sensato es: primero las cuentas y las reglas, después los componentes, y de los componentes solo lo que de verdad importa —que muestre lo que tiene que mostrar y que avise cuando debe—, no el color del borde.

**La integración continua: que lo compruebe una máquina.** Está muy bien tener pruebas y está mucho mejor que se ejecuten solas en cada cambio. En GitHub, un fichero en \`.github/workflows/ci.yml\`:

\`\`\`
name: pruebas
on: [push, pull_request]
jobs:
  probar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test
      - run: npm run build
\`\`\`

Se lee de arriba abajo: en cada \`push\`, en una máquina limpia con Ubuntu, se trae el código, se instala Node, se instala el proyecto **con el lockfile** (\`npm ci\`), se pasan las pruebas y se compila. Si algo falla, te avisa. Fíjate en el último paso: **el build también es una prueba**, y de las buenas —hay errores que solo aparecen al compilar, y encontrarlos en tu máquina es mejor que en producción—.

**Publicar, con lo que ya sabes.** El ciclo real: escribir → \`npm test\` → \`git commit\` → \`git push\` → la integración continua comprueba → el hosting compila y publica. Y los tres detalles del despliegue de una SPA que conviene no olvidar: el **SPA fallback** (servir \`index.html\` en cualquier ruta, o \`/cesta\` dará 404 al entrar directo), los **nombres con hash** del build (permiten cachear los ficheros para siempre, porque si el contenido cambia el nombre cambia) y el \`index.html\`, que **no** se cachea, para que la siguiente visita vea la versión nueva.

Y ya está. Con esto tienes el ciclo completo: construir, comprobar y publicar. Lo que quede por aprender —y quedará siempre— lo aprenderás igual que esto: descomponiendo lo desconocido en piezas conocidas.`,
  },

  pasos: [
    {
      id: '35-1',
      titulo: 'El script de las pruebas',
      enunciado:
        'Añade a <code>package.json</code> el script <code>test</code> con <code>vitest run</code> (vitest ya está en devDependencies).',
      pista: 'Igual que los otros scripts: <code>"test": "vitest run"</code>.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) => {
            const test = datos.scripts?.test
            if (!test) return 'Falta el script test en package.json.'
            if (!/vitest/.test(test)) return `El script test dice «${test}» y debería ejecutar vitest run.`
            if (!datos.devDependencies?.vitest) {
              return 'vitest tiene que estar en devDependencies: es una herramienta de desarrollo.'
            }
            return null
          }),
        ],
        exito: 'Con eso, npm test ya sabe qué hacer. Ahora hay que darle algo que comprobar.',
      }),
    },

    {
      id: '35-2',
      titulo: 'Tu primera prueba',
      enunciado:
        'Crea <code>pruebas/precios.test.js</code> con una prueba del total: importa <code>totalCesta</code> de <code>../src/precios.js</code>, y comprueba con <code>expect(...).toBe(60)</code> que dos líneas de 42 y 18 suman 60. Usa <code>describe</code> e <code>it</code>.',
      pista:
        "Arriba: <code>import { describe, expect, it } from 'vitest'</code>. Y dentro del it, el expect con la llamada a totalCesta.",
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            'pruebas/precios.test.js',
            /import\s*\{[^}]*\b(it|test)\b[^}]*\}\s*from\s*['"]vitest['"]/,
            "A la prueba le falta el import de vitest: import { describe, expect, it } from 'vitest'.",
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /import\s*\{[^}]*totalCesta[^}]*\}\s*from\s*['"][^'"]*precios(\.js)?['"]/,
            'Falta importar totalCesta desde ../src/precios.js.',
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /(it|test)\s*\(\s*['"`]/,
            'Falta al menos un it(…) con la prueba dentro.',
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /expect\s*\([\s\S]*totalCesta[\s\S]*\)[\s\S]*\.toBe\s*\(\s*60\s*\)/,
            'Falta el expect: que totalCesta de dos líneas (42 y 18) sea 60.',
          ),
        ],
        exito:
          'Tu primera prueba automática. Ejecuta npm test en la terminal de tu proyecto cuando lo tengas fuera: saldrá en verde.',
      }),
    },

    eleccion({
      id: '35-3',
      titulo: 'Qué se prueba primero',
      enunciado: 'Tienes tiempo para escribir tres pruebas. ¿A qué se lo dedicas?',
      pista: '¿Dónde duele más un fallo que no se ve?',
      opciones: [
        {
          texto: 'A las cuentas y las reglas: el total, los descuentos, el stock. Lo que puede estar mal sin que se note.',
          correcta: true,
          porque:
            'Eso es. Un botón descolocado se ve; un total mal calculado se cobra. Las funciones puras son además lo más fácil de probar que existe.',
        },
        {
          texto: 'A que los colores y los márgenes sean los correctos.',
          porque:
            'Eso se ve a simple vista y cambia a menudo: probarlo da pruebas frágiles que se rompen cada vez que tocas el diseño.',
        },
        {
          texto: 'A que Vue funcione: que un ref cambie, que un computed derive.',
          porque:
            'Eso ya lo prueba el equipo de Vue. Tus pruebas son para TU lógica, no para la del framework.',
        },
      ],
    }),

    {
      id: '35-4',
      titulo: 'Los casos raros',
      enunciado:
        'Añade dos pruebas más al mismo fichero: una con <strong>unidades</strong> (un artículo de 20 por 3 unidades = 60) y otra con la <strong>cesta vacía</strong> (que dé 0 y no falle). Son los casos que se rompen de verdad.',
      pista:
        'Cada caso, su it: <code>expect(totalCesta([{ precio: 20, unidades: 3 }])).toBe(60)</code> y <code>expect(totalCesta([])).toBe(0)</code>.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          (_doc, ficheros) => {
            const prueba = String(ficheros?.['pruebas/precios.test.js'] || '')
            const cuantos = (prueba.match(/\b(it|test)\s*\(/g) || []).length
            return cuantos < 3
              ? `El fichero tiene ${cuantos} prueba${cuantos === 1 ? '' : 's'} y hacen falta 3.`
              : null
          },
          ficheroContiene(
            'pruebas/precios.test.js',
            /unidades\s*:\s*3/,
            'Falta la prueba de las unidades: un artículo de 20 por 3 unidades.',
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /totalCesta\s*\(\s*\[\s*\]\s*\)/,
            'Falta la prueba de la cesta vacía: totalCesta([]).',
          ),
        ],
        exito:
          'Caso normal, caso con unidades y caso vacío. Ese trío es el mínimo decente de cualquier función que haga cuentas.',
      }),
    },

    {
      id: '35-5',
      titulo: 'Que lo compruebe una máquina',
      enunciado:
        'Crea <code>.github/workflows/ci.yml</code> con el flujo del apunte: en cada <code>push</code>, instalar con <code>npm ci</code>, pasar <code>npm test</code> y hacer <code>npm run build</code>.',
      pista:
        'Cópialo del apunte de Wax entendiendo cada paso. El orden importa: primero instalar, luego probar, luego compilar.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            '.github/workflows/ci.yml',
            /on\s*:\s*\[?[^\n]*push/,
            'Al flujo le falta cuándo se ejecuta: on: [push, pull_request].',
          ),
          ficheroContiene('.github/workflows/ci.yml', /npm\s+ci/, 'Falta el paso npm ci (instalar según el lockfile).'),
          ficheroContiene('.github/workflows/ci.yml', /npm\s+(test|run\s+test)/, 'Falta el paso de las pruebas.'),
          ficheroContiene(
            '.github/workflows/ci.yml',
            /npm\s+run\s+build/,
            'Falta el paso del build: compilar también es una prueba, y de las buenas.',
          ),
          (_doc, ficheros) => {
            const flujo = String(ficheros?.['.github/workflows/ci.yml'] || '')
            const iInstalar = flujo.search(/npm\s+ci/)
            const iProbar = flujo.search(/npm\s+(test|run\s+test)/)
            return iInstalar > -1 && iProbar > -1 && iInstalar > iProbar
              ? 'Las pruebas se ejecutan antes de instalar: sin npm ci no hay nada instalado con lo que probar. Pon npm ci primero.'
              : null
          },
        ],
        exito:
          'Ahora cada push se comprueba en una máquina limpia. Eso caza el clásico «en mi ordenador funcionaba» antes de que llegue a producción.',
      }),
    },

    verdaderoFalso({
      id: '35-6',
      titulo: 'Cierto o falso: pruebas y despliegue',
      enunciado: 'Cinco frases sobre probar y publicar. Todas.',
      pista: 'Qué prueba qué, el SPA fallback y la caché.',
      afirmaciones: [
        {
          texto: 'Una función pura (mismos datos, mismo resultado) es lo más fácil de probar.',
          cierto: true,
          porque:
            'Cierto: no hay que montar nada ni simular nada. Por eso las cuentas se sacan del componente.',
        },
        {
          texto: 'Las pruebas sirven sobre todo para encontrar el fallo de hoy.',
          cierto: false,
          porque:
            'Falso: el de hoy lo ves tú. Sirven para avisarte del que meterás en tres meses tocando otra cosa.',
        },
        {
          texto: 'El build también es una prueba: hay errores que solo aparecen al compilar.',
          cierto: true,
          porque: 'Cierto, y por eso va en la integración continua.',
        },
        {
          texto: 'Sin SPA fallback, entrar directo a /cesta puede dar 404.',
          cierto: true,
          porque:
            'Cierto: el servidor busca un fichero en esa ruta y no existe. Hay que servirle el index.html.',
        },
        {
          texto: 'El index.html conviene cachearlo mucho tiempo, como el resto.',
          cierto: false,
          porque:
            'Falso: es justo el que NO se cachea. Es el que apunta a los ficheros con hash, y si se queda viejo nadie ve la versión nueva.',
        },
      ],
    }),

    completar({
      id: '35-7',
      titulo: 'La forma de una prueba',
      enunciado: 'Completa las tres piezas de una prueba con Vitest.',
      pista: 'Agrupar, una prueba, y la comprobación.',
      plantilla: `___('el total de la cesta', () => {
  ___('suma los precios', () => {
    ___(totalCesta([{ precio: 42 }])).toBe(42)
  })
})`,
      huecos: [
        { respuestas: ['describe'], porque: 'describe agrupa pruebas relacionadas.' },
        { respuestas: ['it', 'test'], porque: 'it (o test) es una prueba concreta.' },
        { respuestas: ['expect'], porque: 'expect(algo).toBe(esperado) es la comprobación.' },
      ],
    }),

    emparejar({
      id: '35-8',
      titulo: 'Cada comprobación, su caso',
      enunciado: 'Une cada expect con lo que comprueba.',
      pista: 'Igual, igual por dentro, que incluya, que falle.',
      pares: [
        { izquierda: 'toBe(60)', derecha: 'igual, para números y textos' },
        {
          izquierda: 'toEqual([1, 2])',
          derecha: 'igual por dentro, para arrays y objetos',
          porque: 'Dos arrays distintos con el mismo contenido no son «el mismo» objeto: toBe fallaría.',
        },
        { izquierda: 'toContain("paja")', derecha: 'que incluya ese elemento o texto' },
        { izquierda: 'toThrow()', derecha: 'que dé error, cuando debe darlo' },
      ],
      porque:
        'Cuatro comprobaciones y cubres casi todo. Y la distinción entre toBe y toEqual es de las que hacen perder una tarde una vez, y solo una.',
    }),

    ordenar({
      id: '35-9',
      titulo: 'El ciclo de trabajo real',
      enunciado: 'Ordena el ciclo completo, de escribir código a que esté publicado.',
      pista: 'Probar en local antes de subir; la máquina comprueba; el hosting publica.',
      lineas: [
        'Escribir el cambio y probarlo en local (npm test)',
        'git commit con un mensaje que explique el porqué',
        'git push al repositorio',
        'La integración continua instala, prueba y compila',
        'El hosting compila y publica la versión nueva',
      ],
      porque:
        'Escribir, probar, commit, push, comprobación automática, publicación. Cuando ese ciclo está engrasado, publicar deja de dar miedo: es rutina.',
    }),

    {
      id: '35-10',
      titulo: 'El proyecto que se mantiene',
      sintesis: true,
      enunciado:
        'Sin pistas, y es el último paso del taller. Deja el proyecto listo para durar: el script <code>test</code> en <code>package.json</code>; <code>pruebas/precios.test.js</code> con <strong>al menos cuatro</strong> pruebas (el total, las unidades, la cesta vacía y el descuento con <code>conDescuento</code>); y <code>.github/workflows/ci.yml</code> instalando, probando y compilando en cada push.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          jsonValido('package.json', (datos) =>
            /vitest/.test(datos.scripts?.test || '') ? null : 'Falta el script test con vitest run.',
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /import\s*\{[^}]*\}\s*from\s*['"]vitest['"]/,
            'Falta el fichero de pruebas con su import de vitest.',
          ),
          (_doc, ficheros) => {
            const prueba = String(ficheros?.['pruebas/precios.test.js'] || '')
            const cuantos = (prueba.match(/\b(it|test)\s*\(/g) || []).length
            return cuantos < 4 ? `Hay ${cuantos} pruebas y hacen falta 4.` : null
          },
          ficheroContiene(
            'pruebas/precios.test.js',
            /conDescuento\s*\(/,
            'Falta probar conDescuento: es la otra función de las cuentas.',
          ),
          ficheroContiene(
            'pruebas/precios.test.js',
            /totalCesta\s*\(\s*\[\s*\]\s*\)/,
            'Falta el caso de la cesta vacía.',
          ),
          ficheroContiene('.github/workflows/ci.yml', /npm\s+ci/, 'Al flujo le falta npm ci.'),
          ficheroContiene('.github/workflows/ci.yml', /npm\s+(test|run\s+test)/, 'Al flujo le faltan las pruebas.'),
          ficheroContiene('.github/workflows/ci.yml', /npm\s+run\s+build/, 'Al flujo le falta el build.'),
        ],
        exito:
          'Pruebas que vigilan las cuentas, una máquina que las ejecuta en cada cambio y un build que se comprueba solo. Has terminado el taller: sabes construir una web, y ahora también sabes MANTENERLA. Enhorabuena, de verdad.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Pues ya está. Mira atrás un segundo: empezaste cambiando un «Cambia esto» en un h1 y acabas con pruebas automáticas, una base de datos ' +
      'indexada y una tubería que publica sola. Yo no he escrito ni una línea: solo he estado aquí dando la lata. Todo esto lo has hecho tú. ' +
      'Ahora ve y hazte una web tuya, que ya no necesitas permiso de nadie.',
  },
}
