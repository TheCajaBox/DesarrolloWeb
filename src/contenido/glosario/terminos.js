// El glosario de Steris.
//
// Regla de oro: **ninguna definicion puede usar jerga sin explicar**. Si para
// entender "atributo" hace falta saber qué es una "propiedad", entonces
// "propiedad" también está aquí, o no se usa.
//
// Steris es la que lo tiene todo previsto y anotado. No es condescendiente ni
// se disculpa por ser exhaustiva: es precisa porque la imprecisión cuesta
// tiempo después.
//
// `alias` recoge las otras formas en que aparece el término en los textos,
// para que el subrayado lo encuentre igual.

const terminos = [
  // ---- Lo básico de la web ----
  {
    termino: 'etiqueta',
    alias: ['etiquetas'],
    definicion:
      'La marca que rodea un trozo de contenido en HTML y dice qué es. Se escribe entre ángulos: <p> abre, </p> cierra. La barra del cierre es lo único que las distingue.',
    ojo: 'Una etiqueta no dice cómo se ve algo, dice qué es. Que un <h1> salga grande es una decisión del navegador, no parte del significado.',
  },
  {
    termino: 'atributo',
    alias: ['atributos'],
    definicion:
      'Información extra que se le pone a una etiqueta, dentro de los ángulos de apertura. En <a href="pagina.html">, href es el atributo y "pagina.html" su valor.',
  },
  {
    termino: 'HTML',
    definicion:
      'El lenguaje con el que se escribe qué contiene una página: títulos, párrafos, listas, imágenes. No decide colores ni posiciones.',
  },
  {
    termino: 'CSS',
    definicion:
      'El lenguaje con el que se decide cómo se ve lo que ya está escrito en HTML: colores, tamaños, tipografías y colocación.',
  },
  {
    termino: 'navegador',
    alias: ['navegadores'],
    definicion:
      'El programa con el que se ven páginas web: Firefox, Chrome, Safari, Edge. Su trabajo es pedir ficheros, leerlos y dibujarlos.',
  },
  {
    termino: 'servidor',
    alias: ['servidores'],
    definicion:
      'Un ordenador cuyo único trabajo es estar encendido esperando peticiones y contestarlas. No tiene nada de especial por dentro: es un ordenador con un programa escuchando.',
  },
  {
    termino: 'URL',
    alias: ['dirección web'],
    definicion:
      'La dirección completa de un recurso. Tiene tres partes: cómo se habla (https), con quién (ejemplo.com) y qué se pide (/catalogo/sombreros.html).',
  },
  {
    termino: '404',
    definicion:
      'La respuesta del servidor cuando le piden algo que no tiene. No es un fallo de tu programa: es que se pidió una dirección donde no hay nada.',
  },
  {
    termino: 'ruta relativa',
    alias: ['rutas relativas'],
    definicion:
      'Una dirección que se entiende desde donde está el fichero que la escribe. "estilos.css" significa "en esta misma carpeta"; "../foto.png" significa "sube una carpeta".',
    ojo: 'Se resuelve desde el fichero que la contiene, no desde la página que se está viendo. Es la causa de que las imágenes de un CSS no aparezcan.',
  },

  // ---- CSS ----
  {
    termino: 'selector',
    alias: ['selectores'],
    definicion:
      'La parte de una regla CSS que dice a qué elementos afecta. En "article p { … }", el selector es "article p".',
  },
  {
    termino: 'declaración',
    alias: ['declaraciones'],
    definicion:
      'Un par de propiedad y valor dentro de una regla CSS, separados por dos puntos y terminados en punto y coma: "color: red;".',
  },
  {
    termino: 'cascada',
    definicion:
      'El procedimiento por el que el navegador decide qué regla gana cuando dos dicen cosas distintas sobre lo mismo. Mira, por este orden: si alguna lleva !important, cuál es más específica, y cuál se escribió después.',
  },
  {
    termino: 'especificidad',
    definicion:
      'Cuánto pesa un selector en la cascada. Se cuenta en tres casillas —identificadores, clases y etiquetas— y se comparan de izquierda a derecha.',
    ojo: 'No se suman. Una sola clase gana a cualquier cantidad de etiquetas, porque su casilla se mira antes.',
  },
  {
    termino: 'padding',
    definicion:
      'El hueco entre el contenido de una caja y su borde. Va por dentro, así que se pinta del color de fondo del elemento.',
  },
  {
    termino: 'margin',
    alias: ['margen', 'márgenes'],
    definicion:
      'El hueco por fuera del borde de una caja, que la separa de las demás. Es transparente: nunca se pinta del color de fondo.',
  },
  {
    termino: 'box-sizing',
    definicion:
      'Decide si el ancho que pides incluye el padding y el borde o no. Con "border-box" sí los incluye, que es casi siempre lo que se quiere.',
  },
  {
    termino: 'grid',
    alias: ['rejilla'],
    definicion:
      'Una forma de colocar elementos en dos direcciones a la vez, en filas y columnas. Se le pone al contenedor, no a los hijos.',
  },
  {
    termino: 'flex',
    alias: ['flexbox'],
    definicion:
      'Una forma de colocar elementos en una sola dirección, en fila o en columna. Se le pone al contenedor, no a los hijos.',
  },
  {
    termino: 'media query',
    alias: ['media queries'],
    definicion:
      'Un bloque de CSS que solo se aplica cuando se cumple una condición sobre la pantalla, normalmente su anchura. Se escribe con @media.',
  },

  // ---- JavaScript ----
  {
    termino: 'DOM',
    definicion:
      'El árbol de objetos que el navegador construye al leer tu HTML. JavaScript modifica ese árbol, no el fichero. Por eso los cambios se pierden al recargar.',
  },
  {
    termino: 'variable',
    alias: ['variables'],
    definicion:
      'Un nombre al que se le asigna un valor para poder usarlo después. Con "let" el valor puede cambiar; con "const" no.',
  },
  {
    termino: 'función',
    alias: ['funciones'],
    definicion:
      'Un trozo de código con nombre que se guarda y se ejecuta cuando alguien lo llama, no cuando se escribe.',
  },
  {
    termino: 'evento',
    alias: ['eventos'],
    definicion:
      'Algo que ocurre en la página —una pulsación, una tecla, un desplazamiento— y a lo que se le puede asociar código para que se ejecute entonces.',
  },
  {
    termino: 'addEventListener',
    definicion:
      'La instrucción con la que se deja preparada una función para que se ejecute cada vez que ocurra un evento concreto sobre un elemento.',
  },
  {
    termino: 'null',
    definicion:
      'Un valor que significa "aquí no hay nada". En JavaScript, querySelector devuelve null cuando no encuentra el elemento que le pediste. En una base de datos, NULL significa "no se sabe": no es cero ni cadena vacía.',
    ojo: 'Dos avisos, uno por contexto. En JavaScript, casi todos los "Cannot read properties of null" son esto: buscaste algo, no estaba, y luego lo usaste. En SQL, NULL no es igual ni a sí mismo, así que "WHERE columna = NULL" nunca encuentra nada: se escribe "IS NULL".',
  },
  {
    termino: 'JSON',
    definicion:
      'Un formato de texto para representar datos: listas y pares de nombre y valor. Se parece a la sintaxis de objetos de JavaScript, pero es más estricto: las claves van siempre entre comillas dobles.',
  },
  {
    termino: 'asíncrono',
    alias: ['asincronía', 'asíncrona'],
    definicion:
      'Código que no da su resultado en el momento, sino más tarde: normalmente porque está esperando algo de fuera, como una respuesta de un servidor.',
  },

  // ---- Bases de datos ----
  {
    termino: 'tabla',
    alias: ['tablas'],
    definicion:
      'En una base de datos, un conjunto de filas con las mismas columnas. Una tabla guarda cosas del mismo tipo: sombreros, usuarios, votos.',
  },
  {
    termino: 'clave primaria',
    alias: ['claves primarias'],
    definicion:
      'La columna que identifica cada fila sin ambigüedad. Sin ella no hay forma de señalar una fila concreta ni de que otra tabla la apunte.',
  },
  {
    termino: 'clave ajena',
    alias: ['claves ajenas', 'clave foránea'],
    definicion:
      'Una columna que guarda la clave primaria de otra tabla, para decir "esta fila se refiere a aquella". Declararla hace que la base impida apuntar a filas que no existen.',
  },
  {
    termino: 'índice',
    alias: ['índices'],
    definicion:
      'Una estructura extra que la base mantiene para encontrar filas deprisa sin recorrer la tabla entera. Acelera las búsquedas y ralentiza un poco las escrituras.',
    ojo: 'SQLite crea índice para la clave primaria, pero NO para las claves ajenas. Hay que ponerlos a mano.',
  },
  {
    termino: 'SQL',
    definicion:
      'El lenguaje con el que se le pregunta a una base de datos. SELECT para leer, INSERT para meter, UPDATE para cambiar, DELETE para borrar.',
  },
  {
    termino: 'JOIN',
    definicion:
      'La operación que combina filas de dos tablas relacionadas, normalmente emparejando una clave ajena con la clave primaria a la que apunta.',
  },

  // ---- Servidor y despliegue ----
  {
    termino: 'HTTP',
    definicion:
      'Las reglas con las que un navegador y un servidor se hablan. Cada intercambio es una petición y una respuesta, y ninguno recuerda el anterior.',
  },
  {
    termino: 'endpoint',
    alias: ['endpoints'],
    definicion:
      'Una dirección concreta de un servidor que hace una cosa concreta cuando se la pide. Por ejemplo /api/sombreros para dar la lista de sombreros.',
  },
  {
    termino: 'API',
    definicion:
      'El conjunto de direcciones que un servidor ofrece para que otros programas le pidan datos o le manden cambios, normalmente en JSON en lugar de en páginas.',
  },
  {
    termino: 'cabecera',
    alias: ['cabeceras'],
    definicion:
      'Información añadida a una petición o a una respuesta, aparte del contenido: qué tipo de datos van, cuánto se pueden guardar en caché, quién pregunta.',
  },
  {
    termino: 'cookie',
    alias: ['cookies'],
    definicion:
      'Un dato pequeño que el servidor le pide al navegador que guarde y le devuelva en cada petición siguiente. Es lo que permite que un sitio te reconozca.',
  },
  {
    termino: 'despliegue',
    alias: ['desplegar'],
    definicion:
      'Llevar el código desde tu ordenador hasta el servidor donde lo va a ver la gente. Hasta que despliegas, tu trabajo solo existe para ti.',
  },
  {
    termino: 'repositorio',
    definicion:
      'La carpeta de un proyecto con todo su historial de cambios guardado. Permite ver qué cambió, cuándo, y volver atrás.',
  },
  {
    termino: 'commit',
    alias: ['commits'],
    definicion:
      'Una foto del proyecto en un momento dado, con un mensaje que explica qué cambió y por qué. El historial es la lista de esas fotos.',
  },
  {
    termino: 'inyección SQL',
    definicion:
      'El fallo que aparece cuando el texto que escribe alguien se pega dentro de una consulta: entonces esa persona puede escribir SQL y la base lo obedece. Se evita usando parámetros en vez de pegar texto.',
  },
  {
    termino: 'XSS',
    definicion:
      'El fallo que aparece cuando el texto que escribe alguien se inserta en la página como HTML: entonces puede meter un <script> que se ejecuta en el navegador de los demás.',
  },

  // ---- Vue ----
  {
    termino: 'componente',
    alias: ['componentes'],
    definicion:
      'Un fichero .vue con tres bloques: template (HTML, lo que se ve), style (CSS, cómo se ve) y script (JavaScript, la lógica). Es la pieza con la que se construye todo en Vue, y se usa como una etiqueta: <FichaSombrero />.',
    ojo: 'Un componente no es "otra cosa" distinta de HTML, CSS y JavaScript: es una forma de juntar los tres en una caja reutilizable.',
  },
  {
    termino: 'template',
    alias: ['plantilla'],
    definicion:
      'El bloque del componente donde va el HTML. Todo lo que sabe hacer el HTML funciona aquí, más las directivas de Vue (v-if, v-for) y las llaves dobles.',
  },
  {
    termino: 'scoped',
    alias: ['style scoped'],
    definicion:
      'La palabra que acompaña al bloque <style> de un componente y encierra sus reglas: solo afectan a este componente, nunca a los demás. Vue lo consigue marcando por debajo cada elemento del template.',
  },
  {
    termino: 'ref',
    alias: ['refs'],
    definicion:
      'La función de Vue que crea un dato reactivo: una caja que guarda un valor y avisa a Vue cuando cambia, para que la página se actualice sola. Se importa desde vue.',
    ojo: 'En el script se toca por su .value (contador.value = 3); en el template va a secas ({{ contador }}). Confundirlo es el despiste más común de Vue.',
  },
  {
    termino: 'reactividad',
    alias: ['reactivo', 'reactiva'],
    definicion:
      'El mecanismo central de Vue: los datos avisan cuando cambian, y Vue repinta exactamente las partes de la página que dependían de ellos. Tú tocas datos; la página va sola detrás.',
  },
  {
    termino: 'interpolación',
    alias: ['llaves dobles', '{{ }}'],
    definicion:
      'Las llaves dobles del template: {{ titulo }} escribe el valor actual del dato en ese hueco, y lo mantiene al día. Dentro cabe una expresión ({{ precio * 2 }}), pero conviene mantenerlas simples.',
    ojo: 'Las llaves dobles escapan el HTML: si el texto trae etiquetas, se pintan como texto inofensivo. Por eso son la defensa natural contra el XSS.',
  },
  {
    termino: 'directiva',
    alias: ['directivas'],
    definicion:
      'Los atributos especiales de Vue que empiezan por v-: v-if decide si algo existe, v-for repite, v-model ata un campo a un dato, v-show esconde. Los dos puntos (:) y la arroba (@) son abreviaturas de v-bind y v-on.',
  },
  {
    termino: 'v-if',
    definicion:
      'La directiva que hace que un elemento exista solo si su condición es verdadera. Con v-else (en el elemento inmediatamente siguiente) se cubre el caso contrario, y v-else-if encadena más casos.',
  },
  {
    termino: 'v-for',
    definicion:
      'La directiva que repite un elemento por cada valor de una lista: v-for="sombrero in sombreros". Exige un :key con un valor único y estable (el id) para saber qué copia es cuál cuando la lista cambie.',
    ojo: 'Usar la posición de la lista como key es la trampa clásica: al borrar o reordenar, las posiciones bailan y Vue confunde las copias.',
  },
  {
    termino: 'v-model',
    definicion:
      'La directiva que ata un campo de formulario a un ref en las dos direcciones: la persona teclea y el dato cambia; el script cambia el dato y el campo se actualiza.',
  },
  {
    termino: 'computed',
    alias: ['derivado', 'derivados'],
    definicion:
      'La función de Vue que crea un valor calculado a partir de otros datos, y lo mantiene al día solo: se recalcula cuando cambia algo de lo que depende, y entre cambios sirve el valor guardado.',
    ojo: 'A un computed no se le asigna: es una fórmula, no una caja. Si un valor se puede derivar de otros, computed; si nace nuevo, ref.',
  },
  {
    termino: 'watch',
    definicion:
      'La función de Vue que vigila un dato y ejecuta un efecto cuando cambia: guardar, avisar, registrar. Para vigilar arrays u objetos por dentro necesita { deep: true }.',
    ojo: '¿Un valor nuevo? computed. ¿Que pase algo? watch. Usar watch para calcular valores casi siempre es un computed disfrazado.',
  },
  {
    termino: 'onMounted',
    alias: ['ciclo de vida'],
    definicion:
      'El gancho del ciclo de vida que ejecuta código una vez, cuando el componente ya está montado en pantalla. Es el sitio de recuperar datos guardados o pedirlos a un servidor.',
  },
  {
    termino: 'prop',
    alias: ['props'],
    definicion:
      'Un dato que el padre le pasa al hijo. El hijo lo declara con defineProps (con su tipo y si es obligatorio) y el padre lo ata al usarlo: :sombrero="sombrero". Las props son de solo lectura para el hijo.',
    ojo: 'Los datos bajan por props y los avisos suben por eventos. Si un hijo modifica una prop, algo está torcido en el diseño.',
  },
  {
    termino: 'emit',
    alias: ['emits', 'emitir'],
    definicion:
      'El mecanismo con el que un hijo avisa a su padre: declara sus eventos con defineEmits, los dispara con emit(\'nombre\', carga), y el padre los escucha con la arroba: @nombre="suFuncion".',
  },
  {
    termino: 'slot',
    alias: ['slots', 'hueco'],
    definicion:
      'El hueco de un componente donde aterriza lo que el padre escriba entre sus etiquetas. Con name="..." puede haber varios, y lo escrito dentro del propio <slot> es la reserva si el padre no manda nada.',
  },
  {
    termino: 'router',
    alias: ['vue-router', 'ruta', 'rutas'],
    definicion:
      'El mapa que decide qué componente se enseña en cada dirección: una lista de parejas path → componente. La vista ganadora se monta en el <RouterView>, y se navega sin recargar con <RouterLink to="...">.',
  },
  {
    termino: 'vista',
    alias: ['views', 'view'],
    definicion:
      'Un componente que hace de pantalla completa. Por dentro es un componente normal; vive en src/views/ para comunicar su papel: estos son pantallas, los de components/ son piezas.',
  },
  {
    termino: 'SPA',
    alias: ['single page application'],
    definicion:
      'Una aplicación de una sola página: el navegador carga una vez, y a partir de ahí el router cambia el componente central sin recargar. La dirección cambia; la página, nunca entera.',
  },
  {
    termino: 'Pinia',
    alias: ['store', 'stores', 'almacén'],
    definicion:
      'La librería oficial de estado compartido de Vue. Un store tiene state (los datos), getters (los derivados, como computed) y actions (las funciones que cambian el state). Cualquier componente lo abre, esté donde esté.',
    ojo: 'El store es para datos que comparten pantallas lejanas. Un dato de un solo componente vive mejor en un ref local.',
  },
  {
    termino: 'fetch',
    definicion:
      'La función del navegador para hacer peticiones HTTP. Devuelve una promesa (un "te lo daré"), así que se usa con await: primero la respuesta, y con otro await, su cuerpo convertido (.json()).',
    ojo: 'Un 404 o un 500 NO lanzan error: para fetch, contestar ya es éxito. La comprobación respuesta.ok es trabajo tuyo.',
  },
  {
    // Ojo: "asincronía" y "asíncrono" ya son de la entrada de arriba, que
    // explica el concepto. Esta explica su gramática en JavaScript.
    termino: 'async',
    alias: ['await', 'promesa', 'promesas'],
    definicion:
      'La gramática de las esperas: async marca una función que puede esperar, y await pausa esa función hasta que una promesa entrega su valor, sin congelar la página.',
  },
  {
    termino: 'build',
    alias: ['dist', 'compilar', 'minificar'],
    definicion:
      'La compilación de verdad: junta los componentes, traduce los .vue, minifica y deja la web autosuficiente en la carpeta dist/, lista para servirse desde cualquier hosting estático.',
  },
]

// Índice por término y por alias, todo en minúsculas, para buscar rápido.
export const porTermino = new Map()

for (const entrada of terminos) {
  porTermino.set(entrada.termino.toLowerCase(), entrada)
  for (const alias of entrada.alias || []) porTermino.set(alias.toLowerCase(), entrada)
}

export default terminos
