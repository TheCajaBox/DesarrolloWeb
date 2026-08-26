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
]

// Índice por término y por alias, todo en minúsculas, para buscar rápido.
export const porTermino = new Map()

for (const entrada of terminos) {
  porTermino.set(entrada.termino.toLowerCase(), entrada)
  for (const alias of entrada.alias || []) porTermino.set(alias.toLowerCase(), entrada)
}

export default terminos
