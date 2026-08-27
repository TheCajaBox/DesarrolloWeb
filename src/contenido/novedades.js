// Las novedades de cada versión, contadas para quien usa el taller.
//
// No son las notas del repositorio ni los mensajes de los commits: eso está
// escrito para quien programa. Aquí se cuenta lo que cambia para ella, en su
// idioma y sin jerga. Si un arreglo no se nota al usarlo, no se menciona.
//
// La más nueva, arriba. La app compara su versión con la última que se vio y
// solo enseña lo que haya pasado desde entonces.

const novedades = [
  {
    version: '0.1.3',
    titulo: 'Este cartelito, y un fichero raro que sobraba',
    puntos: [
      'Cuando el taller se actualice solo, te saldrá un aviso como este contando qué ha cambiado. Se cierra con el botón o con la tecla Esc, y no vuelve a salir hasta la próxima versión.',
      'Si el taller tuvo que reparar alguno de tus ficheros, la copia de seguridad ya no se queda a la vista en tu carpeta. Sigue guardada, pero aparte.',
    ],
    wayne:
      'Resulta que arreglaban cosas y nadie te lo contaba. Ahora te lo cuento yo, que para eso estoy. Lo que no prometo es que sea interesante.',
  },
  {
    version: '0.1.2',
    titulo: 'El menú, en español y con lo que sirve',
    puntos: [
      'El menú de arriba ya no es el de fábrica en inglés.',
      'En «Taller» tienes dos atajos útiles: abrir la carpeta de tu proyecto en el explorador, y ver el registro de arranque (que es lo que hay que mandar si algo falla).',
      'F12 abre las herramientas de desarrollo del navegador, que en un taller de web viene de perlas.',
    ],
    wayne:
      'El menú estaba en inglés y decía «File». Ahora dice «Taller», que es lo que es. Cuatro palabras traducidas y parece otra casa.',
  },
  {
    version: '0.1.1',
    titulo: 'Terminal integrada, y arreglos que dolían',
    puntos: [
      'Hay una terminal de verdad debajo del editor (botón «Terminal»). Ejecuta npm run build, npm test, node -v o git status sobre tu proyecto, sin instalar nada.',
      'Trabaja sin internet a propósito: si un comando necesita descargar algo, te explica cómo hacerlo bien y fuera de la aplicación.',
      'Arreglado un fallo que podía escribir el contenido de un fichero dentro de otro al cambiar de uno a otro. Si te pasó, el taller lo repara solo al abrirse.',
      'Arreglado que la ventana pudiera quedarse en negro sin explicar nada: ahora, si el arranque falla, lo cuenta.',
    ],
    wayne:
      'Ya tienes terminal, esa cosa negra donde la gente escribe y parece que sabe mucho. Ahora tú también. De nada.',
  },
]

export default novedades

/**
 * Lo que hay de nuevo entre la versión que se vio la última vez y la actual.
 *
 * Sin `vista` (primera vez que se abre la aplicación) no se enseña nada: quien
 * acaba de instalar no tiene «novedades», tiene un taller entero por delante.
 */
export function novedadesDesde(vista, actual) {
  if (!vista || !actual) return []
  if (vista === actual) return []

  return novedades.filter(
    (entrada) => comparar(entrada.version, vista) > 0 && comparar(entrada.version, actual) <= 0,
  )
}

/**
 * Lo nuevo de UNA versión concreta, sin comparar con nada.
 *
 * Es para el caso raro pero real de quien ya usaba el taller antes de que
 * existiera este aviso: no hay «última versión vista» que comparar, pero
 * tampoco es una instalación nueva, así que merece saber qué trae la que le
 * acaba de llegar.
 */
export function novedadesDeLaVersion(actual) {
  return novedades.filter((entrada) => entrada.version === actual)
}

/**
 * Compara dos versiones tipo 0.1.10. Devuelve >0 si `a` es posterior, <0 si es
 * anterior, 0 si son la misma.
 *
 * Se compara número a número, no como texto: «0.1.10» es POSTERIOR a «0.1.9»,
 * aunque alfabéticamente vaya antes.
 */
export function comparar(a, b) {
  const trozos = (v) => String(v || '').split('.').map((n) => Number(n) || 0)
  const uno = trozos(a)
  const otro = trozos(b)

  for (let i = 0; i < Math.max(uno.length, otro.length); i += 1) {
    const diferencia = (uno[i] || 0) - (otro[i] || 0)
    if (diferencia !== 0) return diferencia
  }
  return 0
}
