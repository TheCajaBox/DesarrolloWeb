// La apuesta de Wayne: las rondas.
//
// Wayne te enseña un trozo de plantilla con unos datos al lado y apuesta a que
// no aciertas qué sale pintado. No es un examen: no puntúa, no bloquea nada y
// se puede abandonar a media partida.
//
// Cada ronda declara desde qué mundo tiene sentido preguntarla. Así nunca se
// pregunta por algo que todavía no se ha dado: sería destripar la lección y
// además dar por perdido lo que aún no se ha explicado.
//
// LO IMPORTANTE: la respuesta correcta NO está escrita a mano. Las pruebas
// compilan cada plantilla con el compilador de Vue de verdad, la pintan con
// esos datos y comprueban que lo marcado como correcto es exactamente lo que
// sale. Un banco de preguntas con una respuesta mal puesta enseña lo contrario
// de lo que pretende, y eso no se ve leyendo.

const rondas = [
  // ---- Lo primero: la plantilla es HTML ----
  {
    id: 'texto-con-negrita',
    desde: 2,
    plantilla: '<p>Un <strong>bombín</strong> negro</p>',
    datos: {},
    opciones: ['Un bombín negro', 'Un <strong>bombín</strong> negro', 'bombín', 'Un negro'],
    correcta: 0,
    wayne:
      'Las etiquetas de dentro no se ven: cambian cómo se lee el texto, no lo que dice. Lo que sale es la frase entera.',
  },
  {
    id: 'lista-de-la-compra',
    desde: 2,
    plantilla: '<ul><li>Bombín</li><li>Panamá</li></ul>',
    datos: {},
    opciones: ['Bombín', 'BombínPanamá', 'ul li', '2'],
    correcta: 1,
    wayne:
      'Cada <li> es una cosa de la lista, y las dos salen. Los puntitos los pone el navegador, pero texto solo hay ese.',
  },
  {
    id: 'comentario-invisible',
    desde: 3,
    plantilla: '<p>Hola<!-- esto no sale -->mundo</p>',
    datos: {},
    opciones: ['Holamundo', 'Hola esto no sale mundo', 'Hola', 'mundo'],
    correcta: 0,
    wayne:
      'Un comentario es para quien lee el código, no para quien mira la página. El navegador lo lee y lo ignora.',
  },
  {
    id: 'etiqueta-vacia',
    desde: 3,
    plantilla: '<p>arriba<br>abajo</p>',
    datos: {},
    opciones: ['arribaabajo', 'arriba', 'arriba<br>abajo', 'abajo'],
    correcta: 0,
    wayne:
      'El <br> parte la línea pero no pone texto. Sigue habiendo las mismas letras; lo único que cambia es dónde caen.',
  },

  // ---- Interpolación y datos ----
  {
    id: 'suma-en-la-plantilla',
    desde: 7,
    plantilla: '<p>{{ 2 + 3 }}</p>',
    datos: {},
    opciones: ['2 + 3', '5', '23', 'nada'],
    correcta: 1,
    wayne: 'Entre las llaves no se escribe texto: se escribe algo que el ordenador calcula. Y él suma.',
  },
  {
    id: 'concatenar-texto',
    desde: 7,
    plantilla: '<p>{{ "2" + 3 }}</p>',
    datos: {},
    opciones: ['5', '23', '"2"3', 'error'],
    correcta: 1,
    wayne:
      'Ahí el 2 va entre comillas, o sea que es texto. Y sumar texto con un número no suma: pega. Esta trampa se la come todo el mundo una vez.',
  },
  {
    id: 'variable-pintada',
    desde: 7,
    plantilla: '<h1>{{ titulo }}</h1>',
    datos: { titulo: 'Sombreros Ladrian' },
    opciones: ['titulo', 'Sombreros Ladrian', '{{ titulo }}', 'nada'],
    correcta: 1,
    wayne: 'La plantilla no pinta el nombre de la variable, pinta lo que hay dentro.',
  },
  {
    id: 'propiedad-de-objeto',
    desde: 7,
    plantilla: '<p>{{ sombrero.nombre }}</p>',
    datos: { sombrero: { nombre: 'Bombín', precio: 40 } },
    opciones: ['Bombín', 'nombre', '[object Object]', '40'],
    correcta: 0,
    wayne: 'Con el punto se entra dentro del objeto y se saca una cosa concreta.',
  },
  {
    id: 'objeto-entero',
    desde: 7,
    plantilla: '<p>{{ sombrero }}</p>',
    datos: { sombrero: { nombre: 'Bombín' } },
    opciones: ['Bombín', '{\n  "nombre": "Bombín"\n}', 'sombrero', '[object Object]'],
    correcta: 1,
    wayne:
      'Vue es majo y, si le pides un objeto entero, te lo enseña como JSON en vez de soltarte el «[object Object]» de siempre.',
  },

  // ---- Condicionales ----
  {
    id: 'v-if-falso',
    desde: 9,
    plantilla: '<p v-if="hay">Quedan</p><p v-else>Agotado</p>',
    datos: { hay: false },
    opciones: ['Quedan', 'Agotado', 'QuedanAgotado', 'nada'],
    correcta: 1,
    wayne: 'Si la condición es falsa se pinta el otro. Solo uno de los dos, nunca los dos.',
  },
  {
    id: 'v-if-cero',
    desde: 9,
    plantilla: '<p v-if="cuantos">Hay existencias</p><p v-else>Sin existencias</p>',
    datos: { cuantos: 0 },
    opciones: ['Hay existencias', 'Sin existencias', '0', 'nada'],
    correcta: 1,
    wayne:
      'El cero cuenta como falso. Por eso preguntar por un número directamente es traicionero: mejor preguntar «> 0» y que se vea qué querías decir.',
  },
  {
    id: 'v-if-texto-vacio',
    desde: 9,
    plantilla: '<p v-if="nombre">{{ nombre }}</p><p v-else>Anónimo</p>',
    datos: { nombre: '' },
    opciones: ['Anónimo', 'nombre', 'nada', 'vacío'],
    correcta: 0,
    wayne: 'El texto vacío también cuenta como falso. Un texto con un espacio dentro, en cambio, no.',
  },
  {
    id: 'v-if-falso-del-todo',
    desde: 9,
    plantilla: '<p v-if="false">Oferta</p>',
    datos: {},
    opciones: ['Oferta', 'nada', 'false', 'error'],
    correcta: 1,
    wayne:
      'Con v-if el elemento ni se llega a crear. Ojo, porque con v-show sí existiría, solo que escondido con CSS: no se vería, pero estaría ahí y se podría encontrar.',
  },

  // ---- Listas ----
  {
    id: 'v-for-simple',
    desde: 11,
    plantilla: '<span v-for="s in lista" :key="s">{{ s }}</span>',
    datos: { lista: ['uno', 'dos', 'tres'] },
    opciones: ['uno', 'unodostres', 'lista', '3'],
    correcta: 1,
    wayne: 'Se repite el elemento una vez por cada cosa de la lista. Tres cosas, tres veces.',
  },
  {
    id: 'v-for-vacio',
    desde: 11,
    plantilla: '<span v-for="s in lista" :key="s">{{ s }}</span>',
    datos: { lista: [] },
    opciones: ['nada', '[]', 'undefined', 'error'],
    correcta: 0,
    wayne:
      'Una lista vacía se repite cero veces, y cero veces es nada. Sin error y sin aviso, que es lo que despista: parece que algo se ha roto y no.',
  },
  {
    id: 'v-for-indice',
    desde: 11,
    plantilla: '<span v-for="(s, i) in lista" :key="s">{{ i }}:{{ s }}</span>',
    datos: { lista: ['a', 'b'] },
    opciones: ['1:a2:b', '0:a1:b', 'a:0b:1', 'ab'],
    correcta: 1,
    wayne: 'El índice empieza en cero. Siempre. Es de las primeras cosas que hay que interiorizar.',
  },
  {
    id: 'v-for-objetos',
    desde: 11,
    plantilla: '<li v-for="s in lista" :key="s.nombre">{{ s.nombre }}</li>',
    datos: { lista: [{ nombre: 'Bombín' }, { nombre: 'Panamá' }] },
    opciones: ['BombínPanamá', 'nombre nombre', '[object Object]', 'Bombín'],
    correcta: 0,
    wayne: 'Cada vuelta trae un objeto entero, y de cada uno se saca lo que interesa.',
  },
  {
    id: 'v-for-filtrado',
    desde: 11,
    plantilla: '<span v-for="s in lista.filter(x => x.hay)" :key="s.nombre">{{ s.nombre }}</span>',
    datos: {
      lista: [
        { nombre: 'Bombín', hay: true },
        { nombre: 'Panamá', hay: false },
        { nombre: 'Canotier', hay: true },
      ],
    },
    opciones: ['BombínPanamáCanotier', 'BombínCanotier', 'Panamá', 'nada'],
    correcta: 1,
    wayne:
      'Se puede filtrar ahí mismo, aunque queda más limpio hacerlo arriba, en un computed. Funciona igual, se lee mejor.',
  },

  // ---- Atributos y clases ----
  {
    id: 'atributo-atado',
    desde: 10,
    plantilla: '<p :title="texto">pasa por encima</p>',
    datos: { texto: 'hola' },
    opciones: ['pasa por encima', 'hola', 'texto', 'pasa por encimahola'],
    correcta: 0,
    wayne:
      'Los dos puntos atan un atributo a un dato, pero un atributo no se pinta: se queda ahí dentro de la etiqueta, sin salir a la página.',
  },
  {
    id: 'clase-condicional',
    desde: 10,
    plantilla: '<p :class="{ oferta: rebajado }">Bombín</p>',
    datos: { rebajado: true },
    opciones: ['Bombín', 'oferta', 'Bombín oferta', 'true'],
    correcta: 0,
    wayne:
      'La clase se le pone al elemento, no se escribe en la página. Lo que se ve sigue siendo el texto de dentro; lo que cambia es cómo se ve.',
  },

  // ---- Métodos y cálculos ----
  {
    id: 'metodo-de-texto',
    desde: 8,
    plantilla: '<p>{{ nombre.toUpperCase() }}</p>',
    datos: { nombre: 'bombín' },
    opciones: ['bombín', 'BOMBÍN', 'toUpperCase', 'Bombín'],
    correcta: 1,
    wayne: 'En la plantilla se pueden llamar métodos. Con moderación: si crece, mejor arriba.',
  },
  {
    id: 'longitud-de-lista',
    desde: 11,
    plantilla: '<p>Hay {{ lista.length }}</p>',
    datos: { lista: ['a', 'b', 'c', 'd'] },
    opciones: ['Hay 4', 'Hay lista.length', 'Hay 3', 'Hay abcd'],
    correcta: 0,
    wayne: 'length no es una función: no lleva paréntesis. De las que más rabia dan.',
  },
  {
    id: 'ternario',
    desde: 9,
    plantilla: '<p>{{ hay ? "Quedan" : "Agotado" }}</p>',
    datos: { hay: true },
    opciones: ['Quedan', 'Agotado', 'true', 'QuedanAgotado'],
    correcta: 0,
    wayne:
      'Esto es un v-if de bolsillo, para elegir entre dos textos sin montar dos elementos enteros.',
  },
  {
    id: 'undefined-en-plantilla',
    desde: 8,
    plantilla: '<p>[{{ sombrero.color }}]</p>',
    datos: { sombrero: { nombre: 'Bombín' } },
    opciones: ['[undefined]', '[]', '[color]', 'error'],
    correcta: 1,
    wayne:
      'Pedir algo que no está no revienta: sale vacío. Cómodo y peligroso a la vez, porque parece que funciona.',
  },
]

export default rondas
