// Mundo 31 (SQL) — Contar, sumar y agrupar.
//
// Cuarto del Acto IX: los agregados (COUNT, SUM, AVG, MIN, MAX), GROUP BY,
// HAVING y la trampa de contar con LEFT JOIN. Es el mundo de "sacar números
// del catálogo", que es lo que de verdad se le pide a una base en una tienda.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobando,
  comprobarSql,
  hayVista,
  laVistaEquivaleA,
} from '../mundos/comprobaciones-sql.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

// El catálogo ya normalizado del mundo anterior. Hay un material sin sombreros
// (la seda) a propósito: es la trampa del COUNT con JOIN interno.
const SEMILLA = `
  CREATE TABLE materiales (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
  );

  INSERT INTO materiales (id, nombre) VALUES
    (1, 'fieltro'), (2, 'paja'), (3, 'lana'), (4, 'seda');

  CREATE TABLE sombreros (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio INTEGER NOT NULL,
    material_id INTEGER REFERENCES materiales (id) ON DELETE RESTRICT
  );

  CREATE INDEX idx_sombreros_material ON sombreros (material_id);

  INSERT INTO sombreros (id, nombre, precio, material_id) VALUES
    (1, 'Bombín de fieltro', 42, 1),
    (2, 'Panamá de verano', 35, 2),
    (3, 'Gorra de leñador', 18, 3),
    (4, 'Boina clásica', 22, 3),
    (5, 'Pamela de jardín', 31, 2),
    (6, 'Canotier de paja', 26, 2);
`

export default {
  numero: 31,
  acto: 'La base de datos',
  titulo: 'Mundo 31 · Contar, sumar y agrupar',

  sql: true,
  semilla: SEMILLA,

  entradilla: {
    quien: 'wax',
    texto:
      'Cuántos sombreros tienes, cuánto vale el catálogo entero, cuál es el precio medio por material, ' +
      'qué materiales usas poco. Esas preguntas no se responden mirando filas: se responden agrupándolas. ' +
      'Es la parte de SQL que más se paga y la que casi nadie domina, porque tiene dos trampas finas. Vamos con las dos.',
  },

  ficheros: {},

  solucionSql: `
    CREATE VIEW resumen AS
      SELECT COUNT(*) AS cuantos, SUM(precio) AS total, AVG(precio) AS media,
             MIN(precio) AS minimo, MAX(precio) AS maximo
      FROM sombreros;

    CREATE VIEW por_material AS
      SELECT m.nombre AS material, COUNT(s.id) AS cuantos
      FROM materiales m
      LEFT JOIN sombreros s ON s.material_id = m.id
      GROUP BY m.id, m.nombre;

    CREATE VIEW materiales_populares AS
      SELECT m.nombre AS material, COUNT(s.id) AS cuantos
      FROM materiales m
      JOIN sombreros s ON s.material_id = m.id
      GROUP BY m.id, m.nombre
      HAVING COUNT(s.id) >= 2;
  `,

  apunte: {
    quien: 'wax',
    titulo: 'Agregados, GROUP BY y sus dos trampas',
    cuerpo: `Un **agregado** es una función que mira muchas filas y devuelve un solo número. Son cinco y se aprenden de una vez:

- \`COUNT(*)\` — cuántas filas.
- \`SUM(precio)\` — la suma.
- \`AVG(precio)\` — la media.
- \`MIN(precio)\` / \`MAX(precio)\` — el menor y el mayor.

\`\`\`
SELECT COUNT(*) AS cuantos, SUM(precio) AS total, AVG(precio) AS media
FROM sombreros;
\`\`\`

Eso devuelve **una sola fila** con los tres números del catálogo entero. Fíjate en el \`AS\`: sin él, la columna se llamaría \`COUNT(*)\`, que es incomodísimo de usar después.

**Agrupar: \`GROUP BY\`.** Cuando quieres el número **por cada** algo —por material, por mes, por cliente— agrupas:

\`\`\`
SELECT m.nombre AS material, COUNT(s.id) AS cuantos
FROM materiales m
LEFT JOIN sombreros s ON s.material_id = m.id
GROUP BY m.id, m.nombre;
\`\`\`

Se lee: "haz un montón por cada material, y en cada montón cuenta". Devuelve una fila por grupo. La regla de oro del \`GROUP BY\`: **todo lo que pongas en el SELECT tiene que estar o en el GROUP BY o dentro de un agregado**. Si pides una columna suelta que no cumple eso, unas bases dan error y otras (SQLite entre ellas) te devuelven un valor cualquiera del grupo, que es peor: parece que funciona y miente.

**Trampa 1: \`COUNT(*)\` con \`LEFT JOIN\` cuenta de más.** Con \`LEFT JOIN\`, un material sin sombreros produce una fila con el sombrero a \`NULL\`. Si cuentas con \`COUNT(*)\`, esa fila cuenta 1 y el material «seda» aparece con un sombrero que no tiene. La solución es contar una columna del lado derecho: **\`COUNT(s.id)\`**, porque los agregados **ignoran los \`NULL\`**. Con eso, la seda sale con 0, que es la verdad. Esta distinción —\`COUNT(*)\` frente a \`COUNT(columna)\`— es una de las preguntas clásicas de entrevista, y ahora sabes por qué importa.

**Trampa 2: \`WHERE\` no filtra grupos, para eso está \`HAVING\`.** \`WHERE\` se aplica a las filas ANTES de agrupar; \`HAVING\`, a los grupos DESPUÉS:

\`\`\`
GROUP BY m.id, m.nombre
HAVING COUNT(s.id) >= 2;
\`\`\`

"Solo los materiales con dos o más sombreros". Si intentas poner eso en el \`WHERE\`, error: cuando el \`WHERE\` se evalúa, los grupos todavía no existen. El orden real de una consulta es: \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`. Sabiendo ese orden, casi todos los errores raros de SQL se explican solos.

**Y un detalle de la media:** \`AVG\` sobre enteros puede darte decimales largos (\`29.666666\`). Para presentarlo, \`ROUND(AVG(precio), 2)\`. En una tienda de verdad, además, los precios en euros se guardan **en céntimos como enteros**, no en decimales: los números con decimales binarios arrastran errores de redondeo que en dinero no se perdonan.`,
  },

  pasos: [
    {
      id: '31-1',
      titulo: 'Los números del catálogo',
      enunciado:
        'Crea la vista <code>resumen</code> con cinco columnas de una sola fila: <code>cuantos</code> (COUNT), <code>total</code> (SUM del precio), <code>media</code> (AVG), <code>minimo</code> (MIN) y <code>maximo</code> (MAX).',
      pista: 'Todos los agregados en un solo SELECT, cada uno con su <code>AS</code>. Sin GROUP BY: el catálogo entero es un solo grupo.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('resumen'),
          comprobando('SELECT * FROM resumen', (filas) => {
            if (filas.length !== 1) {
              return `La vista devuelve ${filas.length} filas y tiene que devolver una sola: son los números del catálogo entero.`
            }
            const faltan = ['cuantos', 'total', 'media', 'minimo', 'maximo'].filter(
              (c) => !(c in filas[0]),
            )
            return faltan.length
              ? `Faltan columnas con esos nombres exactos: ${faltan.join(', ')} (se ponen con AS).`
              : null
          }),
          comprobando('SELECT * FROM resumen', (filas) => {
            const f = filas[0]
            if (Number(f.cuantos) !== 6) return `«cuantos» dice ${f.cuantos} y hay 6 sombreros.`
            if (Number(f.total) !== 174) return `«total» dice ${f.total} y la suma de los precios es 174.`
            if (Number(f.minimo) !== 18) return `«minimo» dice ${f.minimo} y el más barato cuesta 18.`
            if (Number(f.maximo) !== 42) return `«maximo» dice ${f.maximo} y el más caro cuesta 42.`
            if (Math.abs(Number(f.media) - 29) > 0.01) {
              return `«media» dice ${f.media} y debería ser 29 (174 entre 6). ¿Estás usando AVG?`
            }
            return null
          }),
        ],
        exito:
          'Cinco números del catálogo entero en una sola fila. Eso es lo que va en la cabecera de cualquier panel de administración.',
      }),
    },

    eleccion({
      id: '31-2',
      titulo: 'COUNT(*) o COUNT(columna)',
      enunciado:
        'Cuentas sombreros por material con <code>LEFT JOIN</code>. La seda no tiene ninguno. Con <code>COUNT(*)</code>, ¿qué sale para la seda?',
      pista: 'El LEFT JOIN produce una fila con el sombrero a NULL. ¿Cuenta esa fila?',
      opciones: [
        {
          texto: '1, y es mentira: hay que contar COUNT(s.id), que ignora los NULL y da 0.',
          correcta: true,
          porque:
            'Exacto. COUNT(*) cuenta filas, y el LEFT JOIN fabricó una fila para la seda. COUNT(s.id) cuenta valores no nulos: 0. Esta es la pregunta clásica de entrevista.',
        },
        {
          texto: '0, porque COUNT(*) ya ignora los nulos.',
          porque:
            'Al revés: COUNT(*) cuenta FILAS sin mirar el contenido. Los que ignoran NULL son COUNT(columna) y los demás agregados.',
        },
        {
          texto: 'La seda no aparece en el resultado.',
          porque:
            'Eso pasaría con un JOIN interno. Con LEFT JOIN sí aparece, y por eso hay que contar con cuidado.',
        },
      ],
    }),

    {
      id: '31-3',
      titulo: 'Cuántos por material',
      enunciado:
        'Crea la vista <code>por_material</code> con <code>material</code> (el nombre) y <code>cuantos</code>, incluyendo <strong>todos</strong> los materiales, también los que no tienen sombreros (la seda debe salir con 0).',
      pista:
        'Empieza por <code>materiales</code> y trae los sombreros con <code>LEFT JOIN</code>. Cuenta con <code>COUNT(s.id)</code>, no con <code>COUNT(*)</code>. Y agrupa por el material.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('por_material'),
          comprobando('SELECT * FROM por_material', (filas) => {
            if (filas.length !== 4) {
              return `La vista devuelve ${filas.length} filas y deberían ser 4 (una por material, incluida la seda).`
            }
            const faltan = ['material', 'cuantos'].filter((c) => !(c in filas[0]))
            return faltan.length ? `Faltan las columnas: ${faltan.join(', ')}.` : null
          }),
          comprobando(
            "SELECT cuantos FROM por_material WHERE lower(material) = 'seda'",
            (filas) => {
              if (!filas.length) return 'La seda no aparece: con LEFT JOIN tiene que salir aunque no tenga sombreros.'
              return Number(filas[0].cuantos) === 0
                ? null
                : `La seda sale con ${filas[0].cuantos} y no tiene ninguno. Esa fila la fabrica el LEFT JOIN: cuenta con COUNT(s.id) para ignorar el NULL.`
            },
          ),
          comprobando("SELECT cuantos FROM por_material WHERE lower(material) = 'paja'", (filas) =>
            filas.length && Number(filas[0].cuantos) === 3
              ? null
              : `La paja debería salir con 3 sombreros (panamá, pamela y canotier), y sale con ${filas[0]?.cuantos}.`,
          ),
        ],
        exito:
          'Cuatro materiales, la seda con 0 y la paja con 3. Has esquivado la trampa del COUNT: ese detalle separa un informe correcto de uno que miente.',
      }),
    },

    completar({
      id: '31-4',
      titulo: 'Agrupar y filtrar grupos',
      enunciado: 'Completa la consulta que devuelve los materiales con dos o más sombreros.',
      pista: 'Lo que hace los montones, y lo que filtra montones (no filas).',
      plantilla: `SELECT m.nombre, COUNT(s.id) AS cuantos
FROM materiales m
JOIN sombreros s ON s.material_id = m.id
___ BY m.id, m.nombre
___ COUNT(s.id) >= 2;`,
      huecos: [
        { respuestas: ['group'], porque: 'GROUP BY hace un montón por cada material.' },
        {
          respuestas: ['having'],
          porque: 'HAVING filtra los grupos ya formados. El WHERE no puede: cuando se evalúa, los grupos no existen.',
        },
      ],
    }),

    {
      id: '31-5',
      titulo: 'Los materiales que más usas',
      enunciado:
        'Crea la vista <code>materiales_populares</code> con <code>material</code> y <code>cuantos</code>, pero <strong>solo</strong> los materiales con <strong>dos o más</strong> sombreros.',
      pista: 'Aquí sí conviene el JOIN normal (los que tienen 0 no interesan) y el filtro va en <code>HAVING</code>.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('materiales_populares'),
          laVistaEquivaleA(
            'materiales_populares',
            `SELECT m.nombre AS material FROM materiales m
             JOIN sombreros s ON s.material_id = m.id
             GROUP BY m.id, m.nombre HAVING COUNT(s.id) >= 2`,
            {
              columna: 'material',
              mensaje:
                'Deberían salir solo los materiales con 2 o más sombreros: paja (3) y lana (2). Revisa el HAVING.',
            },
          ),
          comprobando('SELECT * FROM materiales_populares LIMIT 1', (filas) =>
            filas.length && !('cuantos' in filas[0])
              ? 'Falta la columna «cuantos» con la cuenta de cada material.'
              : null,
          ),
        ],
        exito:
          'Paja y lana. HAVING filtra grupos, WHERE filtra filas: son dos cosas distintas y hoy ya no se te van a confundir.',
      }),
    },

    verdaderoFalso({
      id: '31-6',
      titulo: 'Cierto o falso: agregados',
      enunciado: 'Cinco frases sobre contar y agrupar. Todas.',
      pista: 'NULL, HAVING, y la regla de oro del GROUP BY.',
      afirmaciones: [
        {
          texto: 'SUM, AVG y COUNT(columna) ignoran los valores NULL.',
          cierto: true,
          porque: 'Cierto, y es justo lo que salva el conteo por material con LEFT JOIN.',
        },
        {
          texto: 'WHERE puede filtrar por el resultado de un COUNT.',
          cierto: false,
          porque:
            'Falso: cuando el WHERE se evalúa, los grupos no existen todavía. Eso es cosa de HAVING.',
        },
        {
          texto: 'GROUP BY devuelve una fila por grupo.',
          cierto: true,
          porque: 'Cierto: de muchas filas por material a una fila por material.',
        },
        {
          texto:
            'En el SELECT de una consulta agrupada puedes poner cualquier columna, aunque no esté en el GROUP BY.',
          cierto: false,
          porque:
            'Falso: tiene que estar en el GROUP BY o dentro de un agregado. SQLite te deja y devuelve un valor cualquiera del grupo, que es peor que un error.',
        },
        {
          texto: 'Para dinero es mejor guardar céntimos como enteros que euros con decimales.',
          cierto: true,
          porque:
            'Cierto: los decimales binarios arrastran errores de redondeo, y en dinero eso no se perdona.',
        },
      ],
    }),

    ordenar({
      id: '31-7',
      titulo: 'El orden real de una consulta',
      enunciado: 'Ordena las cláusulas por el orden en que la base las EJECUTA (que no es el que se escribe).',
      pista: 'Primero se cogen filas, luego se filtran, luego se agrupan…',
      lineas: [
        'FROM y los JOIN: de dónde salen las filas',
        'WHERE: se descartan filas',
        'GROUP BY: se hacen los montones',
        'HAVING: se descartan montones',
        'SELECT y ORDER BY: se calcula y se ordena el resultado',
      ],
      porque:
        'Ese es el orden de ejecución, y explica solo casi todos los errores raros: por qué el WHERE no ve un COUNT, o por qué el alias del SELECT no vale en el WHERE.',
    }),

    emparejar({
      id: '31-8',
      titulo: 'Cada pregunta, su función',
      enunciado: 'Une cada pregunta con lo que la responde.',
      pista: 'Cuántos, cuánto en total, cuánto de media, el mayor.',
      pares: [
        { izquierda: '¿cuántos sombreros hay?', derecha: 'COUNT(*)' },
        { izquierda: '¿cuánto vale el catálogo?', derecha: 'SUM(precio)' },
        {
          izquierda: '¿cuál es el precio medio?',
          derecha: 'AVG(precio)',
          porque: 'Y con ROUND(AVG(precio), 2) para presentarlo sin decimales infinitos.',
        },
        { izquierda: '¿cuál es el más caro?', derecha: 'MAX(precio)' },
      ],
      porque:
        'Cinco funciones para las preguntas que hace cualquier negocio. Con GROUP BY, las mismas cinco responden «por cada» lo que quieras.',
    }),

    {
      id: '31-9',
      titulo: 'El panel de administración',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja las tres vistas: <code>resumen</code> (los cinco números del catálogo en una fila), <code>por_material</code> (los cuatro materiales, con la seda a 0) y <code>materiales_populares</code> (solo los de 2 o más). Con eso tienes los datos de un panel de administración de verdad.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('resumen'),
          hayVista('por_material'),
          hayVista('materiales_populares'),
          comprobando('SELECT * FROM resumen', (filas) => {
            if (filas.length !== 1) return 'La vista resumen tiene que devolver una sola fila.'
            const f = filas[0]
            return Number(f.cuantos) === 6 && Number(f.total) === 174
              ? null
              : `Los números de resumen no cuadran: cuantos=${f.cuantos} (deben ser 6), total=${f.total} (debe ser 174).`
          }),
          comprobando('SELECT COUNT(*) AS n FROM por_material', (filas) =>
            Number(filas[0].n) === 4
              ? null
              : `por_material devuelve ${filas[0].n} filas y deben ser 4 (todos los materiales).`,
          ),
          comprobando("SELECT cuantos FROM por_material WHERE lower(material) = 'seda'", (filas) =>
            filas.length && Number(filas[0].cuantos) === 0
              ? null
              : 'La seda debe salir con 0 sombreros: LEFT JOIN y COUNT(s.id).',
          ),
          comprobando('SELECT COUNT(*) AS n FROM materiales_populares', (filas) =>
            Number(filas[0].n) === 2
              ? null
              : `materiales_populares devuelve ${filas[0].n} y deben ser 2 (paja y lana).`,
          ),
        ],
        exito:
          'Totales, desglose por material sin mentiras y filtro de grupos. Esto es exactamente lo que alimenta los paneles que ves en cualquier tienda por dentro.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Quédate con las dos trampas, que son las que separan un informe correcto de uno que miente: COUNT(*) cuenta filas y ' +
      'COUNT(columna) ignora los vacíos; el WHERE filtra filas y el HAVING filtra grupos. El último mundo del acto va de que todo esto siga siendo rápido cuando haya cien mil sombreros.',
  },
}
