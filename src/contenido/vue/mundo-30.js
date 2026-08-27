// Mundo 30 (SQL) — Dos tablas y una relación.
//
// Tercero del Acto IX, y el corazón de "relacional": la clave ajena y el JOIN.
// Se parte de un catálogo con el material repetido como texto en cada fila
// (el error que comete todo el mundo) y se normaliza a dos tablas.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobando,
  comprobarSql,
  hayFilas,
  hayTabla,
  hayVista,
  laVistaEquivaleA,
  tieneClaveAjena,
  tieneClavePrimaria,
  tieneColumna,
} from '../mundos/comprobaciones-sql.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

// La base de partida tiene el material escrito a mano en cada fila, con una
// errata incluida ('Paja' con mayúscula): es justo el problema que la
// normalización resuelve.
const SEMILLA = `
  CREATE TABLE sombreros (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio INTEGER NOT NULL,
    material TEXT
  );

  INSERT INTO sombreros (id, nombre, precio, material) VALUES
    (1, 'Bombín de fieltro', 42, 'fieltro'),
    (2, 'Panamá de verano', 35, 'paja'),
    (3, 'Gorra de leñador', 18, 'lana'),
    (4, 'Boina clásica', 22, 'lana'),
    (5, 'Sombrero de copa', 78, 'seda'),
    (6, 'Pamela de jardín', 31, 'Paja');
`

export default {
  numero: 30,
  acto: 'La base de datos',
  titulo: 'Mundo 30 · Dos tablas y una relación',

  sql: true,
  semilla: SEMILLA,

  entradilla: {
    quien: 'wax',
    texto:
      'Mira la columna material: «paja» en una fila y «Paja» en otra. Con seis sombreros es una errata; ' +
      'con seis mil es un catálogo con dos materiales que en realidad son el mismo. Esto se arregla de raíz: ' +
      'los materiales a su propia tabla, y cada sombrero apuntando al suyo. Eso es una base RELACIONAL.',
  },

  ficheros: {},

  solucionSql: `
    CREATE TABLE materiales (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE
    );

    INSERT INTO materiales (id, nombre) VALUES
      (1, 'fieltro'), (2, 'paja'), (3, 'lana'), (4, 'seda');

    CREATE TABLE sombreros_nuevos (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio INTEGER NOT NULL,
      material_id INTEGER REFERENCES materiales (id) ON DELETE RESTRICT
    );

    INSERT INTO sombreros_nuevos (id, nombre, precio, material_id)
      SELECT s.id, s.nombre, s.precio, m.id
      FROM sombreros s
      LEFT JOIN materiales m ON lower(s.material) = lower(m.nombre);

    DROP TABLE sombreros;
    ALTER TABLE sombreros_nuevos RENAME TO sombreros;

    CREATE INDEX idx_sombreros_material ON sombreros (material_id);

    CREATE VIEW catalogo AS
      SELECT s.nombre AS sombrero, m.nombre AS material, s.precio
      FROM sombreros s
      JOIN materiales m ON m.id = s.material_id;
  `,

  apunte: {
    quien: 'wax',
    titulo: 'Claves ajenas y JOIN',
    cuerpo: `El material escrito a mano en cada fila tiene tres problemas, y los tres son el mismo problema: **el dato está repetido**. Si se escribe con mayúscula en una fila, tienes dos materiales donde hay uno. Si mañana «paja» pasa a llamarse «paja natural», hay que cambiarlo en mil sitios. Y no hay forma de guardar nada MÁS del material (su origen, su precio por metro), porque no tiene sitio propio.

**La solución: cada cosa en su tabla.** Los materiales a una tabla de materiales, y en el sombrero solo una referencia:

\`\`\`
CREATE TABLE materiales (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE sombreros (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL,
  material_id INTEGER REFERENCES materiales (id)
);
\`\`\`

Eso es **normalizar**: que cada dato viva en un solo sitio. \`UNIQUE\` en el nombre del material impide meter «paja» dos veces. Y \`REFERENCES materiales (id)\` convierte \`material_id\` en una **clave ajena**: la base no te dejará poner un material que no existe. Deja de ser un número cualquiera y pasa a ser una relación de verdad.

**\`ON DELETE\`: qué pasa si borran lo apuntado.** Es una decisión, no un detalle:
- \`ON DELETE RESTRICT\` — no te deja borrar el material si algún sombrero lo usa. Es la opción prudente por defecto.
- \`ON DELETE CASCADE\` — al borrar el material se borran sus sombreros. Útil para cosas que no tienen sentido solas (las líneas de un pedido con su pedido), peligroso para lo demás.
- \`ON DELETE SET NULL\` — el sombrero se queda sin material, pero sigue existiendo.

**Volver a juntar lo separado: \`JOIN\`.** Los datos están en dos tablas y muchas veces los quieres juntos:

\`\`\`
SELECT s.nombre AS sombrero, m.nombre AS material, s.precio
FROM sombreros s
JOIN materiales m ON m.id = s.material_id;
\`\`\`

Se lee: "de sombreros (que llamaré \`s\`), únelos con materiales (\`m\`) donde el id del material coincida con el material_id del sombrero". El \`ON\` es la condición de unión, y esas letras (\`s\`, \`m\`) son **alias**, para no repetir el nombre entero. \`AS\` renombra columnas en el resultado: sin él tendrías dos columnas llamadas «nombre» y no sabrías cuál es cuál.

**\`JOIN\` contra \`LEFT JOIN\`.** El \`JOIN\` normal (interno) devuelve solo las filas que casan por los dos lados: un sombrero sin material se queda FUERA del resultado, y eso puede ser exactamente lo que no quieres. El \`LEFT JOIN\` devuelve todas las filas de la izquierda, y donde no hay pareja pone \`NULL\`. Regla práctica: si necesitas ver también los que no tienen pareja —para contarlos o para detectarlos—, \`LEFT JOIN\`.

**Cambiar una tabla que ya tiene datos.** SQLite no deja añadir una clave ajena a una tabla existente. La maniobra estándar, que es la misma que usa cualquier migración de verdad: crear la tabla nueva con la forma buena, copiar los datos con \`INSERT INTO … SELECT …\`, borrar la vieja con \`DROP TABLE\` y renombrar con \`ALTER TABLE … RENAME TO …\`. Hoy la vas a hacer entera, y de paso aprendes qué es una migración.

**Y un aviso que ya conoces:** una clave ajena sin índice es una trampa de rendimiento. Cada vez que busques los sombreros de un material, la base recorrerá la tabla entera. \`CREATE INDEX idx_sombreros_material ON sombreros (material_id);\` lo arregla, y el mundo siguiente entra en eso.`,
  },

  pasos: [
    {
      id: '30-1',
      titulo: 'La tabla de materiales',
      enunciado:
        'Crea la tabla <code>materiales</code> con <code>id</code> (INTEGER PRIMARY KEY) y <code>nombre</code> (TEXT, obligatorio y <strong>UNIQUE</strong>), y mete los cuatro materiales que hay en el catálogo: fieltro, paja, lana y seda (una sola vez cada uno, en minúsculas).',
      pista: 'El UNIQUE va detrás del tipo, junto al NOT NULL: <code>nombre TEXT NOT NULL UNIQUE</code>.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('materiales'),
          tieneClavePrimaria('materiales', 'id'),
          tieneColumna('materiales', 'nombre', { tipo: /TEXT|CHAR/i, obligatoria: true }),
          ({ tabla }) => {
            const m = tabla('materiales')
            const unico = m.indices.some((i) => i.unico && i.columnas[0] === 'nombre')
            return unico
              ? null
              : 'A «nombre» le falta UNIQUE. Sin eso, nada impide meter «paja» dos veces, que es el problema que veníamos a resolver.'
          },
          hayFilas('materiales', 4),
          comprobando(
            "SELECT COUNT(*) AS n FROM materiales WHERE nombre IN ('fieltro','paja','lana','seda')",
            (filas) =>
              Number(filas[0].n) < 4
                ? 'Faltan materiales: hacen falta los cuatro del catálogo (fieltro, paja, lana, seda), en minúsculas.'
                : null,
          ),
        ],
        exito:
          'Los materiales ya tienen casa propia, y el UNIQUE impide duplicarlos. Ahora hay que hacer que los sombreros apunten aquí.',
      }),
    },

    eleccion({
      id: '30-2',
      titulo: 'Qué gana una clave ajena',
      enunciado:
        'Podrías dejar <code>material_id INTEGER</code> a secas y apañarte. ¿Qué te da añadir <code>REFERENCES materiales (id)</code>?',
      pista: '¿Quién vigila que ese número signifique algo?',
      opciones: [
        {
          texto: 'Que la base rechace un material que no existe: la relación pasa a estar garantizada.',
          correcta: true,
          porque:
            'Eso es. Sin REFERENCES, un día alguien mete material_id = 99 y tienes un sombrero apuntando al vacío. La base es el único sitio donde esa regla no se puede saltar.',
        },
        {
          texto: 'Que las consultas con JOIN vayan más rápido.',
          porque:
            'La velocidad la da el ÍNDICE, no la clave ajena (y conviene tener los dos). Lo que da REFERENCES es integridad.',
        },
        {
          texto: 'Nada: es documentación para quien lea el esquema.',
          porque:
            'Documenta, sí, pero además OBLIGA: con las claves ajenas activadas, la base rechaza los datos que rompan la relación.',
        },
      ],
    }),

    {
      id: '30-3',
      titulo: 'La migración',
      enunciado:
        'Haz la maniobra completa: crea <code>sombreros_nuevos</code> igual que la vieja pero con <code>material_id INTEGER REFERENCES materiales (id) ON DELETE RESTRICT</code> en vez de <code>material</code>; copia los datos con <code>INSERT INTO … SELECT …</code> uniendo por el nombre del material (ojo a la errata de mayúsculas: usa <code>lower()</code>); borra la vieja con <code>DROP TABLE</code> y renombra la nueva a <code>sombreros</code>.',
      pista:
        'La copia: <code>INSERT INTO sombreros_nuevos (id, nombre, precio, material_id) SELECT s.id, s.nombre, s.precio, m.id FROM sombreros s LEFT JOIN materiales m ON lower(s.material) = lower(m.nombre);</code>',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          ({ tabla }) =>
            tabla('sombreros_nuevos')
              ? 'Todavía existe «sombreros_nuevos». Te falta el último paso: borrar la vieja y renombrar la nueva a «sombreros».'
              : null,
          tieneColumna('sombreros', 'material_id'),
          ({ columna }) =>
            columna('sombreros', 'material')
              ? 'La tabla sigue teniendo la columna «material» de texto. La idea es que ese dato viva solo en la tabla materiales.'
              : null,
          tieneClaveAjena('sombreros', 'material_id', 'materiales', { alBorrar: 'RESTRICT' }),
          hayFilas('sombreros', 6, {
            pocas: (cuantas) =>
              `Quedan ${cuantas} sombreros y deberían estar los 6: la copia se ha dejado filas por el camino.`,
          }),
          comprobando(
            'SELECT COUNT(*) AS n FROM sombreros WHERE material_id IS NULL',
            (filas) =>
              Number(filas[0].n) > 0
                ? `Hay ${filas[0].n} sombrero(s) sin material_id. Ojo a la errata: «Paja» con mayúscula no casa con «paja» salvo que compares con lower() en los dos lados.`
                : null,
          ),
        ],
        exito:
          'Migración hecha: tabla nueva, datos copiados, vieja fuera y renombrada. Eso que acabas de hacer, con otro nombre, es lo que se hace en producción cada vez que cambia un esquema.',
      }),
    },

    completar({
      id: '30-4',
      titulo: 'Las piezas de una relación',
      enunciado: 'Completa la columna que relaciona y su comportamiento al borrar.',
      pista: 'La palabra que apunta a otra tabla, y la que impide dejar huérfanos.',
      plantilla: `material_id INTEGER ___ materiales (id) ON ___ RESTRICT`,
      huecos: [
        { respuestas: ['references'], porque: 'REFERENCES declara la clave ajena: apunta a esa tabla.' },
        {
          respuestas: ['delete'],
          porque: 'ON DELETE dice qué pasa si se borra la fila apuntada. RESTRICT: no te deja.',
        },
      ],
    }),

    {
      id: '30-5',
      titulo: 'Volver a juntarlo: el JOIN',
      enunciado:
        'Crea la vista <code>catalogo</code> que devuelva, para cada sombrero, su nombre como <code>sombrero</code>, el nombre de su material como <code>material</code>, y su <code>precio</code>. Necesitas un <code>JOIN</code> entre las dos tablas y <code>AS</code> para renombrar.',
      pista:
        '<code>SELECT s.nombre AS sombrero, m.nombre AS material, s.precio FROM sombreros s JOIN materiales m ON m.id = s.material_id;</code>',
      comprobar: comprobarSql({
        requisitos: [
          hayVista('catalogo'),
          comprobando('SELECT * FROM catalogo LIMIT 1', (filas) => {
            if (!filas.length) return 'La vista «catalogo» no devuelve ninguna fila.'
            const columnas = Object.keys(filas[0])
            const faltan = ['sombrero', 'material', 'precio'].filter((c) => !columnas.includes(c))
            return faltan.length
              ? `A la vista le faltan columnas con esos nombres exactos: ${faltan.join(', ')}. Se renombran con AS.`
              : null
          }),
          laVistaEquivaleA(
            'catalogo',
            'SELECT s.nombre AS sombrero FROM sombreros s JOIN materiales m ON m.id = s.material_id',
            { columna: 'sombrero' },
          ),
          comprobando(
            "SELECT COUNT(*) AS n FROM catalogo WHERE material IS NULL OR material GLOB '[0-9]*'",
            (filas) =>
              Number(filas[0].n) > 0
                ? 'La columna «material» trae números o vacíos: tienes que traer el NOMBRE del material desde la tabla materiales, no su id.'
                : null,
          ),
        ],
        exito:
          'El JOIN devuelve lo que separaste, junto y legible. Los datos viven una vez y se leen como si estuvieran juntos: eso es lo que da nombre a «relacional».',
      }),
    },

    verdaderoFalso({
      id: '30-6',
      titulo: 'Cierto o falso: relaciones',
      enunciado: 'Cinco frases sobre normalizar y unir. Todas.',
      pista: 'Integridad, JOIN contra LEFT JOIN, y qué borra CASCADE.',
      afirmaciones: [
        {
          texto: 'Normalizar es que cada dato viva en un solo sitio.',
          cierto: true,
          porque: 'Cierto: así se cambia una vez y no hay dos versiones del mismo material.',
        },
        {
          texto: 'Un JOIN normal deja fuera las filas que no tienen pareja.',
          cierto: true,
          porque:
            'Cierto: por eso un sombrero sin material desaparecería del resultado. Si los necesitas, LEFT JOIN.',
        },
        {
          texto: 'ON DELETE CASCADE impide borrar la fila apuntada.',
          cierto: false,
          porque:
            'Falso, y confundirlo es caro: CASCADE borra en cadena lo que apunta. El que impide borrar es RESTRICT.',
        },
        {
          texto: 'Con las claves ajenas activadas, la base rechaza un material_id que no exista.',
          cierto: true,
          porque: 'Cierto: es la integridad referencial, y es la base quien la garantiza, no tu código.',
        },
        {
          texto: 'UNIQUE y PRIMARY KEY son lo mismo.',
          cierto: false,
          porque:
            'Falso: la primaria es una por tabla e identifica la fila; UNIQUE puede haber varias y solo impide repetidos (y admite NULL).',
        },
      ],
    }),

    ordenar({
      id: '30-7',
      titulo: 'La maniobra de la migración',
      enunciado: 'Ordena los pasos para cambiarle la forma a una tabla que ya tiene datos.',
      pista: 'Nueva, copiar, quitar la vieja, ponerle su nombre.',
      lineas: [
        'CREATE TABLE con la forma nueva y otro nombre',
        'INSERT INTO … SELECT … para copiar los datos',
        'DROP TABLE de la tabla vieja',
        'ALTER TABLE … RENAME TO … con el nombre de siempre',
      ],
      porque:
        'Crear, copiar, tirar, renombrar. Esa es la migración de manual, y es lo que hacen por debajo las herramientas que la automatizan.',
    }),

    emparejar({
      id: '30-8',
      titulo: 'Cada regla, su efecto',
      enunciado: 'Une cada cláusula con lo que garantiza.',
      pista: 'Identificar, no repetir, apuntar bien, no dejar huérfanos.',
      pares: [
        { izquierda: 'PRIMARY KEY', derecha: 'identifica la fila sin ambigüedad' },
        { izquierda: 'UNIQUE', derecha: 'impide valores repetidos' },
        {
          izquierda: 'REFERENCES',
          derecha: 'obliga a que lo apuntado exista',
          porque: 'Es la clave ajena: la base rechaza un id que no está.',
        },
        { izquierda: 'ON DELETE RESTRICT', derecha: 'no deja borrar lo que alguien usa' },
      ],
      porque:
        'Cuatro reglas declaradas una vez, defendidas para siempre y por todos: por tu app, por la consola y por quien venga detrás.',
    }),

    {
      id: '30-9',
      titulo: 'El catálogo relacional',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja la base normalizada: <code>materiales</code> con nombre único y sus cuatro filas; <code>sombreros</code> con <code>material_id</code> como clave ajena <code>ON DELETE RESTRICT</code>, sin la vieja columna de texto, con sus seis filas y ninguna sin material; y la vista <code>catalogo</code> uniendo las dos con los nombres <code>sombrero</code>, <code>material</code> y <code>precio</code>.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('materiales'),
          hayFilas('materiales', 4),
          hayTabla('sombreros'),
          tieneClaveAjena('sombreros', 'material_id', 'materiales', { alBorrar: 'RESTRICT' }),
          ({ columna }) =>
            columna('sombreros', 'material')
              ? 'Sigue estando la columna «material» de texto en sombreros.'
              : null,
          hayFilas('sombreros', 6),
          comprobando('SELECT COUNT(*) AS n FROM sombreros WHERE material_id IS NULL', (filas) =>
            Number(filas[0].n) > 0 ? 'Hay sombreros sin material asignado.' : null,
          ),
          hayVista('catalogo'),
          comprobando('SELECT COUNT(*) AS n FROM catalogo', (filas) =>
            Number(filas[0].n) !== 6
              ? `La vista catalogo devuelve ${filas[0].n} filas y deberían ser 6: revisa el JOIN.`
              : null,
          ),
          // La prueba de fuego de la integridad: intentar meter basura debe fallar.
          async ({ consultar }) => {
            try {
              await consultar('INSERT INTO sombreros (nombre, precio, material_id) VALUES (?, ?, ?)', [
                '__prueba de integridad__',
                1,
                99999,
              ])
              await consultar("DELETE FROM sombreros WHERE nombre = '__prueba de integridad__'")
              return 'He conseguido meter un sombrero con un material que no existe: la clave ajena no está funcionando. Revisa que la declaraste con REFERENCES.'
            } catch {
              return null
            }
          },
        ],
        exito:
          'Base relacional de verdad: cada dato en su sitio, la relación garantizada por la base (he intentado colarte un material inventado y no me ha dejado) y una vista que lo devuelve todo junto.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Lo mejor de este mundo no es el JOIN: es que he intentado colarte un sombrero de material inventado y la base me ha dicho que no. ' +
      'Esa regla ya no depende de que nadie se acuerde de comprobarla. Está escrita donde no se puede ignorar.',
  },
}
