// La traducción de errores de Steris.
//
// Un error como `Cannot read properties of null (reading 'textContent')` es
// perfectamente informativo... si ya sabes lo que significa. Si no, es una
// pared. Steris pone debajo, en cristiano, qué ha pasado y qué suele causarlo.
//
// NO se oculta el error original: se muestra siempre, porque aprender a
// leerlos es parte del temario. Esto va debajo, no en lugar de.
//
// El orden de la lista importa: lo específico va antes que lo genérico, y se
// devuelve la primera coincidencia. Hay una prueba que lo verifica.

const TRADUCCIONES = [
  // ---- JavaScript ----
  {
    patron: /Cannot read propert(?:y|ies) of null(?:\s*\(reading '([^']+)'\))?/i,
    titulo: 'Has intentado usar algo que no existe',
    explica: (coincidencia) =>
      `Buscaste un elemento, no se encontró, y luego intentaste leerle ${
        coincidencia[1] ? `«${coincidencia[1]}»` : 'algo'
      }. Cuando querySelector no encuentra nada devuelve null, y a null no se le puede pedir nada.`,
    revisa: [
      'Que el selector esté bien escrito: el punto de las clases se olvida mucho.',
      'Que el elemento exista de verdad en el HTML.',
      'Que tu <script> vaya al final del <body>: si va en el <head>, se ejecuta antes de que el elemento exista.',
    ],
  },
  {
    patron: /Cannot read propert(?:y|ies) of undefined(?:\s*\(reading '([^']+)'\))?/i,
    titulo: 'Has pedido algo dentro de algo que no tiene valor',
    explica: (coincidencia) =>
      `Intentaste leer ${
        coincidencia[1] ? `«${coincidencia[1]}»` : 'una propiedad'
      } de algo que vale undefined, que significa "esto no tiene valor asignado".`,
    revisa: [
      'Si vienes de una lista: puede que ese índice no exista.',
      'Si vienes de un objeto: puede que esa clave esté escrita de otra forma.',
      'Si vienes de una función: puede que no devuelva nada.',
    ],
  },
  {
    patron: /(\w+) is not defined/i,
    titulo: 'Ese nombre no existe',
    explica: (coincidencia) =>
      `Has usado «${coincidencia[1]}» pero en ningún sitio se ha creado con ese nombre.`,
    revisa: [
      'Una errata: mayúsculas y minúsculas cuentan, y las tildes también.',
      'Que lo hayas declarado con let o const antes de usarlo.',
      'Que no esté declarado dentro de otra función, donde desde aquí no se ve.',
    ],
  },
  {
    patron: /(\S+) is not a function/i,
    titulo: 'Eso no se puede llamar',
    explica: (coincidencia) => `Has escrito «${coincidencia[1]}» con paréntesis, pero no es una función.`,
    revisa: [
      'El nombre exacto: querySelector, addEventListener y textContent llevan mayúsculas dentro.',
      'Que no sea una propiedad en vez de una función: textContent se asigna, no se llama.',
    ],
  },
  {
    patron: /Assignment to constant variable/i,
    titulo: 'Has intentado cambiar algo declarado con const',
    explica: () => 'Lo que se declara con const no se puede volver a asignar después.',
    revisa: [
      'Si el valor tiene que cambiar, decláralo con let.',
      'Ojo: un objeto const sí puede cambiar por dentro; lo que no se puede es apuntarlo a otro objeto.',
    ],
  },
  {
    patron: /Unexpected (?:token|end of input|identifier)/i,
    titulo: 'El código no se entiende como está escrito',
    explica: () =>
      'Hay un error de sintaxis: al navegador se le corta la lectura y no llega ni a ejecutar nada.',
    revisa: [
      'Llaves, paréntesis y corchetes sin cerrar. El editor los empareja al poner el cursor encima.',
      'Comillas sin cerrar, o una comilla dentro de otra igual.',
      'Una coma de más al final de una lista de argumentos.',
    ],
  },

  // ---- SQL ----
  {
    patron: /no such table:?\s*(\S+)/i,
    titulo: 'Esa tabla no existe',
    explica: (coincidencia) => `La base no tiene ninguna tabla llamada «${coincidencia[1]}».`,
    revisa: [
      'Que la hayas creado en esta sesión: al vaciar la base se pierden todas.',
      'El nombre exacto, incluido el singular o plural.',
      'Que el CREATE TABLE se ejecutara sin error.',
    ],
  },
  {
    patron: /no such column:?\s*(\S+)/i,
    titulo: 'Esa columna no existe',
    explica: (coincidencia) => `Ninguna de las tablas de la consulta tiene una columna «${coincidencia[1]}».`,
    revisa: [
      'El nombre exacto: mira el esquema en la pestaña Esquema.',
      'Si el texto iba entre comillas dobles, SQLite lo toma por un nombre de columna. Los textos van entre comillas simples.',
    ],
  },
  {
    patron: /UNIQUE constraint failed:?\s*([\w.]+)/i,
    titulo: 'Ese valor ya estaba',
    explica: (coincidencia) =>
      `«${coincidencia[1]}» tiene que ser único y estás intentando meter uno repetido.`,
    revisa: [
      'Si querías cambiar la fila existente, es un UPDATE, no un INSERT.',
      'Si quieres meter o actualizar según toque, existe ON CONFLICT DO UPDATE.',
    ],
  },
  {
    patron: /FOREIGN KEY constraint failed/i,
    titulo: 'Estás apuntando a una fila que no existe',
    explica: () =>
      'Una clave ajena tiene que apuntar a una fila que exista de verdad en la otra tabla, y esa no está.',
    revisa: [
      'Que hayas creado antes la fila a la que apuntas.',
      'Si estabas borrando: hay otras filas que apuntan a esta y la base lo impide.',
    ],
  },
  {
    patron: /NOT NULL constraint failed:?\s*([\w.]+)/i,
    titulo: 'Falta un valor obligatorio',
    explica: (coincidencia) => `«${coincidencia[1]}» está declarada NOT NULL y no le has dado valor.`,
    revisa: [
      'Que la incluyas en la lista de columnas del INSERT.',
      'Si casi siempre vale lo mismo, puedes ponerle un DEFAULT al crear la tabla.',
    ],
  },
  {
    patron: /near "([^"]+)":\s*syntax error/i,
    titulo: 'La consulta está mal escrita',
    explica: (coincidencia) =>
      `SQLite se ha atascado justo en «${coincidencia[1]}». El fallo suele estar ahí o justo antes.`,
    revisa: [
      'Una palabra clave mal escrita: SELEC en vez de SELECT.',
      'Una coma de más antes del FROM, o de menos entre columnas.',
      'Paréntesis sin cerrar.',
    ],
  },
  {
    patron: /datatype mismatch/i,
    titulo: 'El valor no encaja con el tipo de la columna',
    explica: () => 'Has intentado meter algo que no corresponde al tipo declarado de esa columna.',
    revisa: ['Que no estés metiendo texto donde va un número.', 'Que la clave primaria de tipo INTEGER reciba un entero.'],
  },

  // ---- HTTP ----
  {
    patron: /\b401\b|sin_identidad/i,
    titulo: 'El servidor no sabe quién eres',
    explica: () => 'La petición ha llegado bien, pero hace falta estar identificado y no lo estás.',
    revisa: ['Que la sesión no haya caducado.', 'Que estés entrando por la dirección que pasa por el control de acceso.'],
  },
  {
    patron: /\b403\b/,
    titulo: 'Sabe quién eres, pero no te deja',
    explica: () => 'Estás identificado; lo que pasa es que no tienes permiso para esto.',
    revisa: ['Que tu cuenta esté en la lista de quienes pueden hacerlo.'],
  },
  {
    patron: /\b404\b/,
    titulo: 'Ahí no hay nada',
    explica: () => 'El servidor ha recibido la petición y no tiene nada en esa dirección.',
    revisa: [
      'La ruta, letra por letra: sobra o falta una barra más veces de las que parece.',
      'Que el fichero se llame exactamente así, con sus mayúsculas.',
    ],
  },
  {
    patron: /\b429\b|too many requests/i,
    titulo: 'Has pedido demasiado deprisa',
    explica: () => 'Se ha alcanzado un límite de peticiones. No es un fallo tuyo: es una cuota.',
    revisa: ['Esperar un poco.', 'Si es un límite diario, se reinicia solo.'],
  },
  {
    patron: /\b500\b/,
    titulo: 'Ha reventado el servidor',
    explica: () => 'La petición llegó bien y el fallo está en el código del servidor, no en lo que pediste.',
    revisa: ['Los registros del servidor, que es donde estará el error de verdad.'],
  },
]

/**
 * Traduce un mensaje de error. Devuelve null si no lo reconoce, que es
 * perfectamente válido: mejor no decir nada que decir algo genérico.
 */
export function traducir(mensaje) {
  const texto = String(mensaje ?? '')
  if (!texto.trim()) return null

  for (const entrada of TRADUCCIONES) {
    const coincidencia = texto.match(entrada.patron)
    if (coincidencia) {
      return {
        titulo: entrada.titulo,
        explicacion: entrada.explica(coincidencia),
        revisa: entrada.revisa,
        original: texto,
      }
    }
  }

  return null
}

export const totalTraducciones = TRADUCCIONES.length
