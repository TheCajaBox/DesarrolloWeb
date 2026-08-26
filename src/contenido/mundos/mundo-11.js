// Mundo 11 — Preguntarle a la base.
//
// Cada consulta va en su propio fichero. Es deliberado: si todos los pasos
// compartieran un fichero, al avanzar se romperia el anterior y el progreso
// se volveria mentira.
//
// Las comprobaciones montan la base con datos.sql, ejecutan la consulta del
// alumno de verdad, y miran las filas que devuelve. No se comprueba lo que
// escribio: se comprueba lo que contesta SQLite.
//
// Dialogos originales, en el registro de los personajes.

const DATOS = `-- Base de ejemplo, ya montada. No hace falta tocar este fichero.
CREATE TABLE sombreros (
  id          INTEGER PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT ''
);

CREATE TABLE usuarios (
  id    INTEGER PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE
);

CREATE TABLE votos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  sombrero_id INTEGER NOT NULL REFERENCES sombreros(id),
  puntuacion  INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  PRIMARY KEY (usuario_id, sombrero_id)
);

INSERT INTO sombreros (id, nombre, descripcion) VALUES
  (1, 'El de siempre',      'Marrón, con el ala vencida.'),
  (2, 'Hongo de contable',  'Duro, redondo y respetable.'),
  (3, 'El de las bodas',    'Gris perla, impecable.'),
  (4, 'Gorra de conductor', 'Con visera. Da autoridad injustificada.'),
  (5, 'El prestado',        'Nunca lo devolví. Fue un trueque.');

INSERT INTO usuarios (id, alias) VALUES
  (1, 'wayne'), (2, 'wax'), (3, 'steris'), (4, 'marasi');

INSERT INTO votos (usuario_id, sombrero_id, puntuacion) VALUES
  (1, 1, 5), (2, 1, 3), (3, 1, 4),
  (1, 2, 2), (2, 2, 4),
  (1, 3, 5),
  (4, 4, 3);
-- El sombrero 5 no tiene ningún voto, a propósito.
`

const VACIO = (numero) => `-- Escribe aquí la consulta del paso ${numero}.
`

// Monta la base con los datos y ejecuta la consulta del alumno.
async function preguntar(ficheros, fichero) {
  const consulta = String(ficheros?.[fichero] || '').replace(/--[^\n]*/g, '').trim()
  if (!consulta) return { vacia: true }

  const motor = await import('../../motor/sql.js')
  await motor.reiniciar('consultas')

  try {
    await motor.ejecutarGuion(String(ficheros?.['datos.sql'] || DATOS), 'consultas')
  } catch (error) {
    return { vacia: false, error: `El fichero datos.sql no se puede ejecutar: ${error.message}` }
  }

  try {
    const salida = await motor.ejecutar(consulta.replace(/;\s*$/, ''), [], 'consultas')
    return { vacia: false, ...salida, consulta }
  } catch (error) {
    return { vacia: false, error: error.message, consulta }
  }
}

// Busca una columna por nombre sin importar cómo la haya llamado el alumno.
const columnaComo = (columnas, patron) => columnas.find((nombre) => patron.test(nombre))

export default {
  numero: 11,
  acto: 'El otro lado',
  titulo: 'Mundo 11 · Preguntarle a la base',

  entradilla: {
    quien: 'wayne',
    texto:
      'Guardar cosas es fácil. Lo difícil es encontrarlas después. Yo tengo un método para los sombreros y consiste ' +
      'en mirar dónde estuve. Funciona regular. Esto de aquí funciona mejor.',
  },

  ficheros: {
    'datos.sql': DATOS,
    'consulta-1.sql': VACIO(1),
    'consulta-2.sql': VACIO(2),
    'consulta-3.sql': VACIO(3),
  },

  solucion: {
    'datos.sql': DATOS,
    'consulta-1.sql': 'SELECT nombre, descripcion FROM sombreros ORDER BY nombre;',
    'consulta-2.sql': `SELECT s.nombre, COUNT(v.usuario_id) AS votos, AVG(v.puntuacion) AS media
FROM sombreros s
LEFT JOIN votos v ON v.sombrero_id = s.id
GROUP BY s.id;`,
    'consulta-3.sql': `SELECT s.nombre, COUNT(v.usuario_id) AS votos, AVG(v.puntuacion) AS media
FROM sombreros s
JOIN votos v ON v.sombrero_id = s.id
GROUP BY s.id
HAVING COUNT(v.usuario_id) >= 2
ORDER BY media DESC;`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Preguntar: JOIN, agrupar, y por qué NULL muerde',
    cuerpo: `Guardar los datos era la mitad. La otra mitad es poder preguntar cualquier cosa sobre ellos sin traértelos todos.

**Lo básico.** \`SELECT\` dice qué columnas quieres, \`FROM\` de dónde, \`WHERE\` filtra y \`ORDER BY\` ordena:

    SELECT nombre FROM sombreros WHERE nombre LIKE 'El%' ORDER BY nombre;

Un detalle que cuesta un rato la primera vez: los textos van entre **comillas simples**. Las dobles, en SQLite, significan "esto es un nombre de columna", así que \`WHERE nombre = "Wayne"\` no busca el texto Wayne: busca una columna llamada Wayne, y da un error de columna inexistente que despista mucho.

**JOIN: juntar dos tablas.** Los votos guardan \`sombrero_id\`, no el nombre. Para verlos juntos hay que emparejar:

    SELECT s.nombre, v.puntuacion
    FROM sombreros s
    JOIN votos v ON v.sombrero_id = s.id;

El \`ON\` dice cuál es la correspondencia. Si se te olvida, la base empareja **todo con todo**: cinco sombreros y siete votos dan treinta y cinco filas sin sentido. Cuando una consulta devuelva muchísimas más filas de las que esperabas, mira el ON.

**JOIN e LEFT JOIN, que no es lo mismo.** Un \`JOIN\` normal solo devuelve las filas que emparejan. Si un sombrero no tiene votos, desaparece del resultado.

\`LEFT JOIN\` conserva todas las filas de la izquierda aunque no haya pareja, rellenando con NULL lo que falta. Para un catálogo, casi siempre quieres LEFT JOIN: un sombrero sin votos sigue siendo un sombrero.

**Agrupar.** \`GROUP BY\` junta filas que comparten algo y las convierte en una sola, para poder contarlas o promediarlas:

    SELECT s.nombre,
           COUNT(v.usuario_id) AS votos,
           AVG(v.puntuacion)   AS media
    FROM sombreros s
    LEFT JOIN votos v ON v.sombrero_id = s.id
    GROUP BY s.id;

Las funciones que resumen un grupo son \`COUNT\`, \`AVG\`, \`SUM\`, \`MIN\` y \`MAX\`.

**Y aquí NULL muerde.** \`COUNT(*)\` cuenta filas; \`COUNT(columna)\` cuenta filas donde esa columna **no es NULL**. Con un LEFT JOIN, el sombrero sin votos produce una fila con todo a NULL: \`COUNT(*)\` diría 1 (¡tiene un voto!) y \`COUNT(v.usuario_id)\` dice 0, que es la verdad. Por eso, al contar después de un LEFT JOIN, **cuenta una columna de la tabla de la derecha**, nunca \`*\`.

\`AVG\` también ignora los NULL, así que la media de un sombrero sin votos es NULL, no cero. Eso es correcto: "no se sabe" no es lo mismo que "cero".

**WHERE contra HAVING.** \`WHERE\` filtra filas **antes** de agrupar; \`HAVING\` filtra grupos **después**. Si quieres solo los sombreros con dos o más votos, eso es una condición sobre el grupo:

    HAVING COUNT(v.usuario_id) >= 2

Ponerlo en el WHERE da error, y con razón: cuando el WHERE se ejecuta, los grupos todavía no existen.

**Índices y EXPLAIN.** Cuando algo va lento, no adivines. Pon \`EXPLAIN QUERY PLAN\` delante de tu consulta y SQLite te dirá cómo piensa resolverla. Si ves \`SCAN\`, está leyendo la tabla entera; si ves \`SEARCH ... USING INDEX\`, está usando un índice. Convertir un SCAN en un SEARCH suele ser añadir el índice que falta.

**El orden real de las cosas.** Se escribe SELECT primero, pero la base ejecuta antes el FROM, luego el JOIN, luego el WHERE, luego el GROUP BY, luego el HAVING, y **el SELECT casi al final**. Por eso no puedes usar en el WHERE un alias que definiste en el SELECT: cuando el WHERE corre, ese alias todavía no existe.`,
  },

  pasos: [
    {
      id: '11-1',
      titulo: 'Pregunta lo básico',
      enunciado:
        'En <code>consulta-1.sql</code>, escribe una consulta que devuelva el <code>nombre</code> y la <code>descripcion</code> de todos los sombreros, <strong>ordenados por nombre</strong>.',
      pista: '<code>SELECT columnas FROM tabla ORDER BY columna;</code>',
      async comprobar(ficheros) {
        const r = await preguntar(ficheros, 'consulta-1.sql')
        if (r.vacia) return { superado: false, mensaje: 'El fichero consulta-1.sql sigue sin consulta.' }
        if (r.error) return { superado: false, mensaje: `SQLite dice: ${r.error}` }

        if (r.filas.length !== 5) {
          return { superado: false, mensaje: `Devuelve ${r.filas.length} filas y hay 5 sombreros.` }
        }
        if (!columnaComo(r.columnas, /^nombre$/i) || !columnaComo(r.columnas, /^descripcion$/i)) {
          return {
            superado: false,
            mensaje: `Las columnas que devuelves son (${r.columnas.join(', ')}). Hacen falta nombre y descripcion.`,
          }
        }

        const nombres = r.filas.map((fila) => fila.nombre)
        const ordenados = [...nombres].sort((a, b) => String(a).localeCompare(String(b), 'es'))
        if (nombres.join('|') !== ordenados.join('|')) {
          return {
            superado: false,
            mensaje: `Salen en este orden: ${nombres.join(', ')}. Falta el ORDER BY nombre.`,
          }
        }

        return { superado: true, mensaje: 'Cinco filas, ordenadas. Eso es una consulta.' }
      },
    },

    {
      id: '11-2',
      titulo: 'Junta las dos tablas',
      enunciado:
        'En <code>consulta-2.sql</code>, devuelve <strong>cada sombrero</strong> con su número de votos y su media. Ojo: el sombrero sin votos <strong>tiene que aparecer igual</strong>, con 0 votos.',
      pista: 'Un JOIN normal lo dejaría fuera. Y para contar después de un LEFT JOIN, cuenta una columna de votos, no <code>*</code>.',
      async comprobar(ficheros) {
        const r = await preguntar(ficheros, 'consulta-2.sql')
        if (r.vacia) return { superado: false, mensaje: 'El fichero consulta-2.sql sigue sin consulta.' }
        if (r.error) return { superado: false, mensaje: `SQLite dice: ${r.error}` }

        if (r.filas.length !== 5) {
          return {
            superado: false,
            mensaje:
              r.filas.length === 4
                ? 'Salen 4 filas: falta el sombrero que no tiene votos. Con JOIN se cae; con LEFT JOIN se queda.'
                : `Salen ${r.filas.length} filas y tienen que ser 5, una por sombrero. Si salen muchas más, revisa el ON del JOIN.`,
          }
        }

        const claveVotos = columnaComo(r.columnas, /voto|count|cuenta|total/i)
        const claveMedia = columnaComo(r.columnas, /media|avg|puntuacion/i)
        if (!claveVotos || !claveMedia) {
          return {
            superado: false,
            mensaje: `Devuelves (${r.columnas.join(', ')}). Hacen falta una columna con el número de votos y otra con la media.`,
          }
        }

        const sinVotos = r.filas.find((fila) => /prestado/i.test(String(fila.nombre ?? '')))
        if (!sinVotos) {
          return { superado: false, mensaje: 'No encuentro «El prestado» en el resultado, que es el que no tiene votos.' }
        }
        if (Number(sinVotos[claveVotos]) !== 0) {
          return {
            superado: false,
            mensaje: `«El prestado» sale con ${sinVotos[claveVotos]} votos y no tiene ninguno. Eso pasa al contar con COUNT(*): la fila del LEFT JOIN existe aunque venga vacía. Cuenta una columna de votos.`,
          }
        }

        const deSiempre = r.filas.find((fila) => /siempre/i.test(String(fila.nombre ?? '')))
        if (Number(deSiempre?.[claveVotos]) !== 3) {
          return { superado: false, mensaje: `«El de siempre» debería tener 3 votos y sale con ${deSiempre?.[claveVotos]}.` }
        }
        if (Math.abs(Number(deSiempre?.[claveMedia]) - 4) > 0.01) {
          return { superado: false, mensaje: `La media de «El de siempre» debería ser 4 (5, 3 y 4) y sale ${deSiempre?.[claveMedia]}.` }
        }

        return {
          superado: true,
          mensaje: 'Cinco sombreros, con sus cuentas, y el que no tiene votos también. Eso es un LEFT JOIN bien hecho.',
        }
      },
    },

    {
      id: '11-3',
      titulo: 'Filtra los grupos',
      enunciado:
        'En <code>consulta-3.sql</code>, devuelve solo los sombreros con <strong>dos o más votos</strong>, ordenados de mejor a peor media. Filtrar un grupo no se hace con <code>WHERE</code>.',
      pista: '<code>HAVING</code> filtra después de agrupar; <code>WHERE</code> filtra antes, cuando los grupos aún no existen.',
      async comprobar(ficheros) {
        const r = await preguntar(ficheros, 'consulta-3.sql')
        if (r.vacia) return { superado: false, mensaje: 'El fichero consulta-3.sql sigue sin consulta.' }
        if (r.error) {
          return {
            superado: false,
            mensaje: /misuse of aggregate|aggregate/i.test(r.error)
              ? `SQLite dice: ${r.error}. Eso pasa al poner un COUNT en el WHERE: ahí todavía no hay grupos. Va en HAVING.`
              : `SQLite dice: ${r.error}`,
          }
        }

        if (r.filas.length !== 2) {
          return {
            superado: false,
            mensaje: `Salen ${r.filas.length} filas y tienen que ser 2: solo «El de siempre» (3 votos) y «Hongo de contable» (2) llegan a dos.`,
          }
        }

        const claveMedia = columnaComo(r.columnas, /media|avg|puntuacion/i)
        if (!claveMedia) {
          return { superado: false, mensaje: `Falta la columna de la media. Devuelves (${r.columnas.join(', ')}).` }
        }

        const medias = r.filas.map((fila) => Number(fila[claveMedia]))
        if (!(medias[0] >= medias[1])) {
          return {
            superado: false,
            mensaje: `Las medias salen ${medias.join(' y ')}: están de menor a mayor. Falta ORDER BY media DESC.`,
          }
        }

        return {
          superado: true,
          mensaje: 'Agrupado, filtrado por grupo y ordenado. Con esto ya se puede montar la portada del catálogo.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Lo que acabas de escribir es exactamente la consulta que usa el catálogo de verdad de este sitio. Ábrelo y mira: ' +
      'las medias que ves ahí salen de un LEFT JOIN con un GROUP BY, calculado por la base y no por el programa.',
  },
}
