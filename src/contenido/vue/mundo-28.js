// Mundo 28 (SQL) — La primera tabla.
//
// Abre el Acto IX. Aquí no se editan ficheros: se le habla a una base de datos
// SQLite de verdad, la misma que hay detrás de media web del mundo. Lo que
// escriba la alumna lo ejecuta el motor, y lo que se comprueba es el esquema
// REAL leído con PRAGMA: si su CREATE TABLE dijo otra cosa de la que creía,
// aquí sale.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarSql,
  hayFilas,
  hayTabla,
  tieneClavePrimaria,
  tieneColumna,
  comprobando,
} from '../mundos/comprobaciones-sql.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

export default {
  numero: 28,
  acto: 'La base de datos',
  titulo: 'Mundo 28 · La primera tabla',

  // Marca que este mundo va de base de datos: la app abre la consola en vez de
  // la vista previa, y el "reiniciar" borra la base en vez de los ficheros.
  sql: true,
  semilla: null,

  entradilla: {
    quien: 'wax',
    texto:
      'Los sombreros de tu catálogo viven dentro del código, y eso solo aguanta mientras sean cuatro. ' +
      'Una tienda de verdad los guarda en una base de datos. Tienes una a la derecha, SQLite, la misma que ' +
      'usan medio internet y tu propio móvil. Empieza por lo primero: decirle qué forma tienen tus datos.',
  },

  ficheros: {},

  // El guion que resuelve el mundo entero. Lo usan las pruebas para comprobar
  // que los pasos se pueden superar de verdad.
  solucionSql: `
    CREATE TABLE sombreros (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio INTEGER NOT NULL,
      material TEXT
    );

    INSERT INTO sombreros (nombre, precio, material) VALUES ('Bombín de fieltro', 42, 'fieltro');
    INSERT INTO sombreros (nombre, precio, material) VALUES ('Panamá de verano', 35, 'paja');
    INSERT INTO sombreros (nombre, precio, material) VALUES ('Gorra de leñador', 18, 'lana');
    INSERT INTO sombreros (nombre, precio, material) VALUES ('Boina clásica', 22, 'lana');

    UPDATE sombreros SET precio = 20 WHERE nombre = 'Gorra de leñador';
  `,

  apunte: {
    quien: 'wax',
    titulo: 'Tablas, tipos y la clave primaria',
    cuerpo: `Una base de datos relacional guarda **tablas**: rejillas con columnas fijas y una fila por cosa. La tabla de sombreros tiene una columna para el nombre, otra para el precio, y una fila por cada sombrero. Nada más, y ahí está su fuerza: la forma se declara una vez y la base la defiende siempre.

**Crear la tabla.** Se declara con \`CREATE TABLE\`, y dentro va una línea por columna: nombre, tipo y las condiciones que deba cumplir.

\`\`\`
CREATE TABLE sombreros (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL,
  material TEXT
);
\`\`\`

**Los tipos.** En SQLite son pocos y se aprenden de una vez: \`INTEGER\` (números enteros), \`REAL\` (con decimales), \`TEXT\` (texto), \`BLOB\` (bytes, para ficheros). No hay tipo booleano ni tipo fecha: los booleanos se guardan como \`INTEGER\` (0 y 1) y las fechas como \`TEXT\` en formato ISO (\`'2026-08-27'\`) o como \`INTEGER\`. Elegir el tipo no es papeleo: es lo que permite ordenar por precio de verdad en vez de alfabéticamente —donde "9" va después de "100"—.

**\`NOT NULL\`: lo que no puede faltar.** Sin ella, la base acepta una fila sin nombre y sin precio, y te encuentras el hueco meses después, en producción, cuando ya no sabes qué debía ir ahí. La regla práctica: si el dato es imprescindible para que la fila signifique algo, \`NOT NULL\`. Ojo: \`NULL\` no es cero ni cadena vacía; es "aquí no hay valor", y por eso se compara distinto.

**\`PRIMARY KEY\`: el DNI de cada fila.** Una columna que identifica la fila sin ambigüedad, única y que no cambia. En SQLite, \`INTEGER PRIMARY KEY\` tiene un regalo: si no le das valor al insertar, lo pone él, 1, 2, 3… Y esto es lo importante: sin clave primaria no puedes señalar una fila concreta —dos filas idénticas son indistinguibles, y actualizar una podría tocar la otra—, ni nadie puede apuntarla desde otra tabla. Es el mismo \`:key\` del \`v-for\` del Mundo 11, pero en la base: único y estable.

**Meter datos: \`INSERT\`.**

\`\`\`
INSERT INTO sombreros (nombre, precio, material) VALUES ('Bombín de fieltro', 42, 'fieltro');
\`\`\`

Se nombran las columnas que se rellenan y se dan sus valores en el mismo orden. El texto va entre comillas simples; los números, sin ellas. El \`id\` no se pone: lo pone la base.

**Y cambiar lo que ya está: \`UPDATE\`.**

\`\`\`
UPDATE sombreros SET precio = 20 WHERE nombre = 'Gorra de leñador';
\`\`\`

Aquí va la advertencia más importante de todo el acto: **un \`UPDATE\` sin \`WHERE\` cambia TODAS las filas de la tabla**. Lo mismo con \`DELETE FROM sombreros;\`, que la vacía entera. No hay ventana de confirmación ni papelera. Antes de ejecutar cualquiera de los dos, la costumbre que salva carreras es escribir primero el \`SELECT\` con ese mismo \`WHERE\` y mirar qué filas salen.

**Cómo se ejecuta aquí.** Escribes en la consola de la derecha y pulsas Ctrl+Enter. Si te equivocas, SQLite te lo dirá con sus propias palabras, sin retocar: aprender a leer esos mensajes es parte del oficio. Y en la pestaña Esquema tienes lo que la base ha entendido de verdad, con la revisión de lo que a mí me chirría.`,
  },

  pasos: [
    {
      id: '28-1',
      titulo: 'Crea la tabla',
      enunciado:
        'En la consola, crea la tabla <code>sombreros</code> con cuatro columnas: <code>id</code> (INTEGER PRIMARY KEY), <code>nombre</code> (TEXT, obligatorio), <code>precio</code> (INTEGER, obligatorio) y <code>material</code> (TEXT, este puede faltar). Ctrl+Enter para ejecutar.',
      pista:
        'La forma está en la lección de Wax. Recuerda el punto y coma al final, y que NOT NULL va detrás del tipo.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          tieneClavePrimaria('sombreros', 'id'),
          tieneColumna('sombreros', 'nombre', {
            tipo: /TEXT|CHAR|CLOB/i,
            obligatoria: true,
          }),
          tieneColumna('sombreros', 'precio', {
            tipo: /INT|REAL|NUM|DEC/i,
            obligatoria: true,
            malo: 'El precio está declarado como texto. Guárdalo como INTEGER, o al ordenar por precio el 9 irá detrás del 100.',
          }),
          tieneColumna('sombreros', 'material'),
        ],
        exito:
          'Tabla creada, y con la forma bien declarada: la base ya sabe qué es un sombrero y defenderá esa forma sola. Mírala en la pestaña Esquema.',
      }),
    },

    eleccion({
      id: '28-2',
      titulo: 'El tipo del precio',
      enunciado:
        'Un compañero declara <code>precio TEXT</code> porque «se va a mostrar como texto igualmente». ¿Qué se rompe?',
      pista: '¿Cómo se ordena el texto y cómo se ordenan los números?',
      opciones: [
        {
          texto: 'Ordenar y comparar: como texto, «9» va después de «100», y no se pueden sumar bien.',
          correcta: true,
          porque:
            'Eso es. El texto se ordena letra a letra: "100" < "9". Adiós a ordenar por precio y a sumar el total. El tipo no es papeleo, es lo que permite hacer cuentas.',
        },
        {
          texto: 'Nada, SQLite convierte solo cuando hace falta.',
          porque:
            'SQLite es flexible con lo que acepta, y ahí está la trampa: te deja guardarlo y el problema aparece al ordenar y al sumar, no al insertar.',
        },
        {
          texto: 'Ocupa más espacio en disco, y ya.',
          porque:
            'El espacio es lo de menos. El problema es de comportamiento: comparaciones y ordenaciones equivocadas.',
        },
      ],
    }),

    {
      id: '28-3',
      titulo: 'Mete cuatro sombreros',
      enunciado:
        'Inserta al menos <strong>cuatro</strong> sombreros con <code>INSERT INTO</code>, cada uno con su nombre y su precio. No pongas el <code>id</code>: eso lo pone la base.',
      pista:
        'Se puede una por una, o varias sentencias seguidas separadas por punto y coma. El texto entre comillas simples.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          hayFilas('sombreros', 4, {
            pocas: (cuantas, minimo) =>
              `Van ${cuantas} sombrero${cuantas === 1 ? '' : 's'} de ${minimo}. Sigue insertando.`,
          }),
          comprobando(
            'SELECT COUNT(*) AS n FROM sombreros WHERE id IS NULL',
            (filas) =>
              Number(filas[0].n) > 0
                ? 'Hay filas sin id. Deja que lo ponga la base: no incluyas la columna id en el INSERT.'
                : null,
          ),
          comprobando(
            'SELECT COUNT(DISTINCT nombre) AS distintos, COUNT(*) AS total FROM sombreros',
            (filas) =>
              Number(filas[0].distintos) < Number(filas[0].total)
                ? 'Hay nombres repetidos. Que cada sombrero sea uno distinto.'
                : null,
          ),
        ],
        exito:
          'Cuatro filas dentro, cada una con su id puesto por la base. Prueba a consultarlas: SELECT * FROM sombreros;',
      }),
    },

    completar({
      id: '28-4',
      titulo: 'Las piezas de un CREATE TABLE',
      enunciado: 'Completa la declaración (solo las palabras clave que faltan).',
      pista: 'Crear la tabla, el DNI de la fila, y lo que no admite vacíos.',
      plantilla: `___ TABLE clientes (
  id INTEGER ___ KEY,
  correo TEXT ___ NULL
);`,
      huecos: [
        { respuestas: ['create'], porque: 'CREATE TABLE declara una tabla nueva.' },
        { respuestas: ['primary'], porque: 'PRIMARY KEY marca la columna que identifica la fila.' },
        { respuestas: ['not'], porque: 'NOT NULL impide guardar la fila sin ese dato.' },
      ],
    }),

    verdaderoFalso({
      id: '28-5',
      titulo: 'Cierto o falso: la forma de los datos',
      enunciado: 'Cinco frases sobre tablas y tipos. Todas.',
      pista: 'NULL no es cero, y el UPDATE sin WHERE es de las que se recuerdan.',
      afirmaciones: [
        {
          texto: 'NULL significa «aquí no hay valor», y no es lo mismo que 0 ni que una cadena vacía.',
          cierto: true,
          porque: 'Cierto, y por eso se compara distinto (con IS NULL, no con = NULL).',
        },
        {
          texto: 'Un UPDATE sin WHERE cambia solo la última fila insertada.',
          cierto: false,
          porque:
            'Falso, y es peligroso creerlo: sin WHERE cambia TODAS las filas de la tabla. Sin papelera.',
        },
        {
          texto: 'En SQLite, una columna INTEGER PRIMARY KEY se rellena sola si no le das valor.',
          cierto: true,
          porque: 'Cierto: 1, 2, 3… Por eso el id no se pone en el INSERT.',
        },
        {
          texto: 'SQLite tiene un tipo BOOLEAN y un tipo DATE.',
          cierto: false,
          porque:
            'Falso: los booleanos van como INTEGER (0 y 1) y las fechas como TEXT en ISO o como INTEGER.',
        },
        {
          texto: 'Sin clave primaria, dos filas idénticas son indistinguibles para la base.',
          cierto: true,
          porque:
            'Cierto: no puedes actualizar una sin arriesgarte a tocar la otra, y nadie puede apuntarla desde otra tabla.',
        },
      ],
    }),

    {
      id: '28-6',
      titulo: 'Cambia un precio',
      enunciado:
        'Rebaja un sombrero concreto con <code>UPDATE</code>, usando <code>WHERE</code> para tocar <strong>solo ese</strong>. Antes de ejecutarlo, haz el <code>SELECT</code> con el mismo WHERE y mira qué fila sale: esa costumbre salva carreras.',
      pista:
        '<code>UPDATE sombreros SET precio = 20 WHERE nombre = \'Gorra de leñador\';</code> — el WHERE no es opcional aquí.',
      comprobar: comprobarSql({
        requisitos: [
          hayFilas('sombreros', 4),
          comprobando(
            'SELECT COUNT(DISTINCT precio) AS distintos, COUNT(*) AS total FROM sombreros',
            (filas) =>
              Number(filas[0].distintos) <= 1 && Number(filas[0].total) > 1
                ? 'Todos los sombreros tienen el mismo precio: parece un UPDATE sin WHERE. Vuelve a dejarlos distintos y usa WHERE.'
                : null,
          ),
          comprobando(
            "SELECT COUNT(*) AS n FROM sombreros WHERE precio <= 20",
            (filas) =>
              Number(filas[0].n) === 0
                ? 'Rebaja alguno hasta 20 € o menos con un UPDATE … WHERE, para que se vea el cambio.'
                : null,
          ),
        ],
        exito:
          'Una fila cambiada y las demás intactas. Ese WHERE es la diferencia entre una rebaja y un incendio.',
      }),
    },

    ordenar({
      id: '28-7',
      titulo: 'El orden seguro',
      enunciado: 'Ordena los pasos de alguien con oficio antes de ejecutar un UPDATE en serio.',
      pista: 'Mirar antes de tocar.',
      lineas: [
        'Escribir el SELECT con el WHERE que vas a usar',
        'Mirar qué filas devuelve y confirmar que son ESAS',
        'Cambiar el SELECT por el UPDATE, con el mismo WHERE',
        'Ejecutar y comprobar cuántas filas se han tocado',
      ],
      porque:
        'Mirar, confirmar, cambiar, comprobar. Cuesta veinte segundos y evita el «me he cargado la tabla» que todo el mundo cuenta una vez.',
    }),

    emparejar({
      id: '28-8',
      titulo: 'Cada dato con su tipo',
      enunciado: 'Une cada dato con el tipo que le toca en SQLite.',
      pista: 'Recuerda: no hay tipo booleano ni tipo fecha.',
      pares: [
        { izquierda: 'el nombre del sombrero', derecha: 'TEXT' },
        { izquierda: 'el precio en euros enteros', derecha: 'INTEGER' },
        {
          izquierda: '¿está agotado? (sí/no)',
          derecha: 'INTEGER (0 o 1)',
          porque: 'SQLite no tiene BOOLEAN: se guarda como 0 y 1.',
        },
        { izquierda: 'la fecha en que se añadió', derecha: 'TEXT en formato ISO' },
      ],
      porque:
        'Texto para texto, enteros para números y para los sí/no, e ISO para las fechas. Con eso cubres casi cualquier tabla.',
    }),

    {
      id: '28-9',
      titulo: 'El catálogo, en la base',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja la base así: la tabla <code>sombreros</code> con su <code>id</code> PRIMARY KEY, <code>nombre</code> y <code>precio</code> obligatorios y bien tipados, <code>material</code> opcional, al menos <strong>cuatro</strong> filas con nombres distintos, precios variados, y ninguna fila sin nombre ni sin precio.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('sombreros'),
          tieneClavePrimaria('sombreros', 'id'),
          tieneColumna('sombreros', 'nombre', { tipo: /TEXT|CHAR|CLOB/i, obligatoria: true }),
          tieneColumna('sombreros', 'precio', { tipo: /INT|REAL|NUM|DEC/i, obligatoria: true }),
          hayFilas('sombreros', 4),
          comprobando(
            "SELECT COUNT(*) AS n FROM sombreros WHERE nombre IS NULL OR nombre = '' OR precio IS NULL",
            (filas) =>
              Number(filas[0].n) > 0
                ? 'Hay filas sin nombre o sin precio. Con NOT NULL bien puesto, la base no debería haberlas dejado entrar: revisa la tabla.'
                : null,
          ),
          comprobando(
            'SELECT COUNT(DISTINCT precio) AS n FROM sombreros',
            (filas) =>
              Number(filas[0].n) < 2
                ? 'Todos los precios son iguales. Ponles precios variados, que luego hay que ordenar por ellos.'
                : null,
          ),
        ],
        exito:
          'Tu catálogo ya vive en una base de datos de verdad, con su forma declarada y defendida. Ahora toca preguntarle cosas.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Fíjate en lo que ha pasado: le has dicho a la base cómo es un sombrero UNA vez, y a partir de ahora ella no te deja meter uno sin nombre. ' +
      'Eso es tener un aliado, no un almacén. Ahora vamos a hacerle preguntas, que es cuando esto se pone bueno.',
  },
}
