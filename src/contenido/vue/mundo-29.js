// Mundo 29 (SQL) — Preguntarle bien a la base.
//
// Segundo del Acto IX: SELECT, WHERE, ORDER BY, LIMIT y DELETE. El problema
// didáctico de las consultas es que un SELECT no deja huella, así que no se
// puede comprobar... salvo que se pida guardarlo como VISTA. Eso resuelve dos
// cosas a la vez: es verificable, y las vistas son parte del oficio (una
// consulta que se repite acaba siendo una vista).
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobando,
  comprobarSql,
  hayFilas,
  hayTabla,
  hayVista,
  laVistaEquivaleA,
} from '../mundos/comprobaciones-sql.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

// La base de partida: el catálogo del mundo anterior, ya poblado. Precios
// pensados para que las consultas tengan respuestas claras.
const SEMILLA = `
  CREATE TABLE sombreros (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio INTEGER NOT NULL,
    material TEXT,
    agotado INTEGER NOT NULL DEFAULT 0
  );

  INSERT INTO sombreros (id, nombre, precio, material, agotado) VALUES
    (1, 'Bombín de fieltro', 42, 'fieltro', 0),
    (2, 'Panamá de verano', 35, 'paja', 0),
    (3, 'Gorra de leñador', 18, 'lana', 0),
    (4, 'Boina clásica', 22, 'lana', 0),
    (5, 'Sombrero de copa', 78, 'seda', 0),
    (6, 'Canotier de paja', 26, 'paja', 1),
    (7, 'Pamela de jardín', 31, 'paja', 0);
`

export default {
  numero: 29,
  acto: 'La base de datos',
  titulo: 'Mundo 29 · Preguntarle bien',

  sql: true,
  semilla: SEMILLA,

  entradilla: {
    quien: 'wax',
    texto:
      'Una base de datos con siete sombreros no vale nada si no sabes preguntarle. Y preguntar bien es un oficio: ' +
      'los que bajan de treinta, los tres más caros, los que quedan disponibles. Hoy aprendes a preguntar, ' +
      'y a guardar las preguntas que se repiten para no volver a escribirlas.',
  },

  ficheros: {},

  solucionSql: `
    CREATE VIEW gangas AS
      SELECT nombre, precio FROM sombreros WHERE precio < 30;

    CREATE VIEW caros_primero AS
      SELECT nombre, precio FROM sombreros ORDER BY precio DESC LIMIT 3;

    CREATE VIEW de_paja AS
      SELECT nombre FROM sombreros WHERE material = 'paja' AND agotado = 0;

    DELETE FROM sombreros WHERE agotado = 1;
  `,

  apunte: {
    quien: 'wax',
    titulo: 'SELECT: elegir filas y columnas',
    cuerpo: `Toda consulta responde a dos preguntas: **qué columnas** quiero y **qué filas** me valen.

\`\`\`
SELECT nombre, precio FROM sombreros WHERE precio < 30;
\`\`\`

\`SELECT\` elige las columnas (\`*\` significa todas, cómodo para mirar y mala costumbre en código serio: si mañana añades una columna, tu consulta empieza a traer cosas que nadie pidió). \`FROM\` dice de qué tabla. \`WHERE\` filtra las filas: es el hermano de \`filter\` del Mundo 12.

**Comparar en WHERE.** Los operadores de siempre: \`=\` (aquí es comparar, no asignar), \`<>\` o \`!=\` (distinto), \`<\`, \`>\`, \`<=\`, \`>=\`. Y tres que valen oro:

- \`BETWEEN 20 AND 40\` — dentro de un rango, extremos incluidos.
- \`IN ('paja', 'lana')\` — uno de esos valores.
- \`LIKE '%paja%'\` — texto que contiene algo (\`%\` es "cualquier cosa"). Es el \`includes\` del buscador.

Y una trampa clásica: **para los vacíos no vale \`= NULL\`, se usa \`IS NULL\`** (o \`IS NOT NULL\`). \`NULL\` no es igual a nada, ni a sí mismo.

**Juntar condiciones: \`AND\` y \`OR\`.** \`WHERE material = 'paja' AND agotado = 0\` pide las dos cosas; con \`OR\` basta una. Cuando mezclas los dos, usa paréntesis: \`AND\` se evalúa antes que \`OR\`, y sin paréntesis la consulta hace algo que no habías pedido.

**Ordenar: \`ORDER BY\`.** \`ORDER BY precio DESC\` de mayor a menor; \`ASC\` (el valor por defecto) al contrario. Se puede ordenar por varias: \`ORDER BY material ASC, precio DESC\`.

**Recortar: \`LIMIT\`.** \`LIMIT 3\` devuelve tres filas. Casi siempre va con \`ORDER BY\`: sin ordenar, "las tres primeras" no significa nada, porque la base no promete ningún orden.

**Guardar una consulta: \`CREATE VIEW\`.**

\`\`\`
CREATE VIEW gangas AS
  SELECT nombre, precio FROM sombreros WHERE precio < 30;
\`\`\`

Una **vista** es una consulta con nombre. No copia datos: cada vez que la consultas (\`SELECT * FROM gangas\`) vuelve a ejecutarse por debajo, así que siempre está al día. Sirven para no repetir una consulta enrevesada por diez sitios, y en este mundo tienen otra virtud: dejan huella, así que puedo comprobar que tu consulta dice lo que tenía que decir.

**Borrar: \`DELETE FROM … WHERE …\`.** Con la misma advertencia del mundo anterior, que conviene oír dos veces: **sin \`WHERE\`, borra la tabla entera**. La costumbre sigue siendo la misma: primero el \`SELECT\` con ese \`WHERE\`, mirar, y luego cambiar la palabra.`,
  },

  pasos: [
    {
      id: '29-1',
      titulo: 'Las gangas, guardadas',
      enunciado:
        'Crea una vista llamada <code>gangas</code> que devuelva el <code>nombre</code> y el <code>precio</code> de los sombreros que cuestan <strong>menos de 30</strong>. (Antes, si quieres, prueba el SELECT a secas para ver qué sale.)',
      pista: '<code>CREATE VIEW gangas AS SELECT nombre, precio FROM sombreros WHERE precio &lt; 30;</code>',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          hayVista('gangas'),
          laVistaEquivaleA('gangas', 'SELECT nombre FROM sombreros WHERE precio < 30', {
            columna: 'nombre',
            mensaje:
              'La vista tiene que devolver exactamente los sombreros de menos de 30 €. Revisa el WHERE.',
          }),
          comprobando('SELECT * FROM gangas LIMIT 1', (filas, columnas) =>
            filas.length && !('precio' in filas[0])
              ? `La vista trae ${columnas.join(', ')}; este paso pide también el precio.`
              : null,
          ),
        ],
        exito:
          'Las gangas, guardadas con nombre. Cada vez que la mires estará al día: una vista no copia datos, vuelve a preguntar.',
      }),
    },

    eleccion({
      id: '29-2',
      titulo: 'Buscar un vacío',
      enunciado:
        'Quieres los sombreros a los que no les has puesto material (la columna está vacía). ¿Cuál es el WHERE correcto?',
      pista: 'NULL no es igual a nada, ni siquiera a sí mismo.',
      opciones: [
        {
          texto: 'WHERE material IS NULL',
          correcta: true,
          porque:
            'Eso es. Los vacíos se preguntan con IS NULL / IS NOT NULL, nunca con =. NULL no es igual a nada.',
        },
        {
          texto: "WHERE material = NULL",
          porque:
            'Es lo intuitivo y no devuelve NADA nunca, ni un error: NULL no es igual a NULL. De los fallos que más tiempo hacen perder.',
        },
        {
          texto: "WHERE material = ''",
          porque:
            'Eso busca la cadena vacía, que es OTRA cosa distinta de «no hay valor». Puede que existan las dos, y hay que saber cuál buscas.',
        },
      ],
    }),

    {
      id: '29-3',
      titulo: 'Los tres más caros',
      enunciado:
        'Crea la vista <code>caros_primero</code> con el <code>nombre</code> y el <code>precio</code> de los <strong>tres</strong> sombreros más caros, del más caro al más barato.',
      pista: '<code>ORDER BY precio DESC</code> ordena de mayor a menor, y <code>LIMIT 3</code> se queda con tres.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('caros_primero'),
          laVistaEquivaleA(
            'caros_primero',
            'SELECT nombre FROM sombreros ORDER BY precio DESC LIMIT 3',
            {
              columna: 'nombre',
              ordenado: true,
              mensaje:
                'La vista tiene que devolver los TRES más caros y del más caro al más barato. Revisa el ORDER BY … DESC y el LIMIT 3.',
            },
          ),
        ],
        exito:
          'ORDER BY y LIMIT trabajando juntos, que es como se usan casi siempre: sin ordenar, «los tres primeros» no significa nada.',
      }),
    },

    completar({
      id: '29-4',
      titulo: 'Las piezas de una consulta',
      enunciado: 'Completa la consulta que pide los sombreros de lana, del más barato al más caro.',
      pista: 'Elegir columnas, filtrar filas, ordenar.',
      plantilla: `___ nombre, precio
FROM sombreros
___ material = 'lana'
___ BY precio ASC;`,
      huecos: [
        { respuestas: ['select'], porque: 'SELECT elige las columnas.' },
        { respuestas: ['where'], porque: 'WHERE filtra las filas.' },
        { respuestas: ['order'], porque: 'ORDER BY ordena el resultado.' },
      ],
    }),

    {
      id: '29-5',
      titulo: 'Dos condiciones a la vez',
      enunciado:
        'Crea la vista <code>de_paja</code> con el <code>nombre</code> de los sombreros que son de <strong>paja</strong> <em>y</em> que <strong>no están agotados</strong> (<code>agotado = 0</code>).',
      pista: 'Dos condiciones unidas con <code>AND</code>: <code>WHERE material = \'paja\' AND agotado = 0</code>.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('de_paja'),
          laVistaEquivaleA(
            'de_paja',
            "SELECT nombre FROM sombreros WHERE material = 'paja' AND agotado = 0",
            {
              columna: 'nombre',
              mensaje:
                'Tienen que salir los de paja que NO estén agotados. El canotier es de paja, pero está agotado: no entra.',
            },
          ),
        ],
        exito:
          'Dos condiciones con AND, y el canotier agotado fuera. Así se preguntan las cosas cuando importan los detalles.',
      }),
    },

    verdaderoFalso({
      id: '29-6',
      titulo: 'Cierto o falso: consultar',
      enunciado: 'Cinco frases sobre SELECT y compañía. Todas.',
      pista: 'LIMIT sin ORDER BY, las vistas, y el DELETE sin WHERE.',
      afirmaciones: [
        {
          texto: 'Una vista guarda la consulta, no una copia de los datos: siempre está al día.',
          cierto: true,
          porque: 'Cierto: cada SELECT sobre la vista vuelve a ejecutar la consulta de dentro.',
        },
        {
          texto: 'LIMIT 3 sin ORDER BY devuelve siempre las tres primeras filas insertadas.',
          cierto: false,
          porque:
            'Falso: sin ORDER BY la base no promete ningún orden. Puede coincidir hoy y cambiar mañana.',
        },
        {
          texto: 'SELECT * en código serio es mala costumbre.',
          cierto: true,
          porque:
            'Cierto: el día que añadan una columna, tu consulta empieza a traer datos que nadie pidió. Nombra las columnas.',
        },
        {
          texto: 'DELETE FROM sombreros; borra solo la última fila.',
          cierto: false,
          porque: 'Falso: sin WHERE vacía la tabla entera. Y no hay papelera.',
        },
        {
          texto: "LIKE '%paja%' encuentra el texto que contenga «paja» en cualquier posición.",
          cierto: true,
          porque: 'Cierto: el % es «cualquier cosa». Es el includes del buscador, en SQL.',
        },
      ],
    }),

    {
      id: '29-7',
      titulo: 'Fuera lo agotado',
      enunciado:
        'El canotier está agotado y ya no se va a reponer. Bórralo con <code>DELETE</code>, filtrando por <code>agotado = 1</code>. Recuerda: primero el SELECT para ver qué se va a ir.',
      pista: '<code>DELETE FROM sombreros WHERE agotado = 1;</code> — el WHERE, otra vez, no es opcional.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          comprobando('SELECT COUNT(*) AS n FROM sombreros WHERE agotado = 1', (filas) =>
            Number(filas[0].n) > 0
              ? `Todavía quedan ${filas[0].n} agotados en la tabla. Bórralos con DELETE … WHERE agotado = 1.`
              : null,
          ),
          hayFilas('sombreros', 6, {
            pocas: (cuantas) =>
              `Quedan ${cuantas} sombreros y deberían quedar 6: parece que el DELETE se ha llevado más de lo que debía. Reinicia el mundo y prueba otra vez con el WHERE.`,
          }),
        ],
        exito:
          'Uno borrado, seis intactos. Y las vistas que hiciste antes ya lo reflejan sin que las toques: eso es lo bueno de que no copien datos.',
      }),
    },

    emparejar({
      id: '29-8',
      titulo: 'Cada cláusula, su trabajo',
      enunciado: 'Une cada palabra clave con lo que hace.',
      pista: 'Columnas, filas, orden, recorte.',
      pares: [
        { izquierda: 'SELECT', derecha: 'elige las columnas' },
        { izquierda: 'WHERE', derecha: 'filtra las filas' },
        {
          izquierda: 'ORDER BY',
          derecha: 'ordena el resultado',
          porque: 'Y con DESC, de mayor a menor.',
        },
        { izquierda: 'LIMIT', derecha: 'se queda con unas pocas' },
      ],
      porque:
        'Columnas, filas, orden y recorte: con esas cuatro se escribe la inmensa mayoría de las consultas que verás.',
    }),

    ordenar({
      id: '29-9',
      titulo: 'El orden de una consulta',
      enunciado: 'Ordena las cláusulas como tienen que escribirse en SQL.',
      pista: 'SQL es exigente con este orden: si lo cambias, da error de sintaxis.',
      lineas: ['SELECT nombre, precio', 'FROM sombreros', "WHERE material = 'lana'", 'ORDER BY precio DESC', 'LIMIT 3'],
      porque:
        'SELECT, FROM, WHERE, ORDER BY, LIMIT. Ese orden no es estilo: es la gramática. Escribirlas en otro orden da error.',
    }),

    {
      id: '29-10',
      titulo: 'El catálogo, preguntado',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja las tres vistas funcionando y la tabla limpia: <code>gangas</code> (nombre y precio de los de menos de 30), <code>caros_primero</code> (los tres más caros, en orden), <code>de_paja</code> (los de paja no agotados) y ningún sombrero agotado en la tabla.',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('gangas'),
          hayVista('caros_primero'),
          hayVista('de_paja'),
          laVistaEquivaleA('gangas', 'SELECT nombre FROM sombreros WHERE precio < 30', {
            columna: 'nombre',
          }),
          laVistaEquivaleA(
            'caros_primero',
            'SELECT nombre FROM sombreros ORDER BY precio DESC LIMIT 3',
            { columna: 'nombre', ordenado: true },
          ),
          laVistaEquivaleA(
            'de_paja',
            "SELECT nombre FROM sombreros WHERE material = 'paja' AND agotado = 0",
            { columna: 'nombre' },
          ),
          comprobando('SELECT COUNT(*) AS n FROM sombreros WHERE agotado = 1', (filas) =>
            Number(filas[0].n) > 0 ? 'Aún quedan agotados en la tabla.' : null,
          ),
        ],
        exito:
          'Tres preguntas guardadas y respondiéndose solas, y una tabla al día. Fíjate en que gangas ya devuelve dos, no tres: borraste el canotier y la vista se enteró sola.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Mira el detalle bueno: borraste el canotier y la vista de gangas se actualizó sola, sin que la tocaras. ' +
      'Eso es porque una vista no guarda datos, guarda la pregunta. Igualito que los computed de Vue, ¿te suena? Pues sí, la misma idea en otro sitio.',
  },
}
