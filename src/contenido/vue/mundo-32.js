// Mundo 32 (SQL) — Que siga siendo rápido: índices y esquema sano.
//
// Cierra el Acto IX. Índices (y por qué el orden de sus columnas importa),
// EXPLAIN QUERY PLAN para no adivinar, transacciones, y la revisión de
// esquema de Wax como examen final: el mundo no se supera hasta que la crítica
// automática no tiene nada grave que decir.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobando,
  comprobarSql,
  esquemaLimpio,
  hayFilas,
  hayTabla,
  tieneClaveAjena,
  tieneColumna,
  tieneIndice,
} from '../mundos/comprobaciones-sql.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

// Una base con problemas a propósito: pedidos sin índice en su clave ajena,
// una fecha guardada en una columna sin tipo y un booleano como texto. Son los
// tres avisos que la crítica de Wax detecta.
const SEMILLA = `
  CREATE TABLE materiales (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
  );

  INSERT INTO materiales (id, nombre) VALUES (1, 'fieltro'), (2, 'paja'), (3, 'lana');

  CREATE TABLE sombreros (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio INTEGER NOT NULL,
    material_id INTEGER REFERENCES materiales (id) ON DELETE RESTRICT
  );

  INSERT INTO sombreros (id, nombre, precio, material_id) VALUES
    (1, 'Bombín de fieltro', 42, 1),
    (2, 'Panamá de verano', 35, 2),
    (3, 'Gorra de leñador', 18, 3),
    (4, 'Boina clásica', 22, 3),
    (5, 'Pamela de jardín', 31, 2);

  CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY,
    sombrero_id INTEGER REFERENCES sombreros (id) ON DELETE RESTRICT,
    cliente TEXT NOT NULL,
    unidades INTEGER NOT NULL DEFAULT 1
  );

  INSERT INTO pedidos (sombrero_id, cliente, unidades) VALUES
    (1, 'Marta', 1), (3, 'Kim', 2), (3, 'Marta', 1), (2, 'Wayne', 4);
`

export default {
  numero: 32,
  acto: 'La base de datos',
  titulo: 'Mundo 32 · Que siga siendo rápido',

  sql: true,
  semilla: SEMILLA,

  entradilla: {
    quien: 'wax',
    texto:
      'Con cinco sombreros todo va rápido, incluso lo que está mal hecho. El problema llega a los cien mil, ' +
      'y entonces ya hay datos dentro y arreglarlo cuesta el triple. Hoy aprendes a ver de antemano lo que va a doler: ' +
      'índices donde hacen falta, tipos que dicen la verdad, y una consulta que te explica qué piensa hacer la base.',
  },

  ficheros: {},

  solucionSql: `
    CREATE INDEX idx_sombreros_material ON sombreros (material_id);
    CREATE INDEX idx_pedidos_sombrero ON pedidos (sombrero_id);
    CREATE INDEX idx_pedidos_cliente ON pedidos (cliente);

    ALTER TABLE pedidos ADD COLUMN hecho_en TEXT;
    UPDATE pedidos SET hecho_en = '2026-08-27' WHERE hecho_en IS NULL;

    ALTER TABLE pedidos ADD COLUMN entregado INTEGER NOT NULL DEFAULT 0;
  `,

  apunte: {
    quien: 'wax',
    titulo: 'Índices, planes y transacciones',
    cuerpo: `Un **índice** es, literalmente, el índice de un libro: en vez de leerlo entero para encontrar una palabra, vas a la página que te dice. Sin índice, buscar los pedidos de un sombrero obliga a la base a mirar **todas** las filas —eso se llama *full scan*—. Con cinco filas no se nota; con cien mil, sí.

\`\`\`
CREATE INDEX idx_pedidos_sombrero ON pedidos (sombrero_id);
\`\`\`

**Dónde hacen falta, en orden de importancia:**
1. **En toda clave ajena.** Buscar «los pedidos de este sombrero» es la consulta más repetida de cualquier esquema relacional, y muchas bases (SQLite entre ellas) **no** crean ese índice solas. Es el olvido más común y más caro.
2. **En las columnas por las que filtras** mucho (\`WHERE cliente = …\`).
3. **En las que ordenas** con frecuencia.

**El orden de las columnas del índice importa.** Un índice sobre \`(cliente, hecho_en)\` sirve para buscar por cliente, y también por cliente + fecha. Pero **no** sirve para buscar solo por fecha: es como buscar en la guía telefónica por nombre de pila. La regla: primero la columna por la que filtras con igualdad.

**Los índices no son gratis.** Cada uno ocupa espacio y hay que mantenerlo en cada \`INSERT\`, \`UPDATE\` y \`DELETE\`: escribir se vuelve un poco más lento. Poner índices «por si acaso» en todo es tan malo como no poner ninguno. Se ponen donde hay preguntas.

**Dejar de adivinar: \`EXPLAIN QUERY PLAN\`.**

\`\`\`
EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE sombrero_id = 3;
\`\`\`

La base te cuenta qué piensa hacer. Si ves \`SCAN pedidos\`, va a leer la tabla entera. Si ves \`SEARCH pedidos USING INDEX …\`, está usando el índice. Créalo, vuelve a pedir el plan y mira cómo cambia la respuesta: es la forma de comprobar que tu índice sirve para algo, en vez de suponerlo.

**Añadir columnas a una tabla con datos: \`ALTER TABLE\`.** \`ALTER TABLE pedidos ADD COLUMN hecho_en TEXT;\` añade la columna, y las filas que ya estaban la tienen a \`NULL\`. Ojo con esto: si la quieres \`NOT NULL\`, necesita un \`DEFAULT\` (la base no puede inventar el valor de las filas viejas). Por eso el orden habitual es: añadir la columna, rellenar las filas viejas con un \`UPDATE\`, y solo entonces exigir que no esté vacía.

**Todo o nada: las transacciones.**

\`\`\`
BEGIN;
  UPDATE pedidos SET unidades = unidades - 1 WHERE id = 3;
  UPDATE almacen SET quedan = quedan + 1 WHERE sombrero_id = 3;
COMMIT;
\`\`\`

Entre \`BEGIN\` y \`COMMIT\`, o pasa todo o no pasa nada. Si algo falla en medio, \`ROLLBACK\` deja la base como estaba. Es imprescindible en cuanto una operación son dos cambios que tienen que ir juntos: cobrar y entregar, restar del almacén y sumar al pedido. Sin transacción, un fallo a mitad deja la base en un estado imposible.

**Y el examen de este mundo: la revisión de esquema.** En la pestaña Esquema tienes mi lista de peros. No corrige nada: señala lo que funciona hoy y va a doler dentro de seis meses. Este mundo no se cierra hasta que ahí no quede ningún aviso grave: claves ajenas sin índice, fechas en columnas sin tipo, booleanos guardados como texto. Que la base pase esa revisión es, de todo lo que has hecho en el acto, lo que más se parece a trabajar en serio.`,
  },

  pasos: [
    {
      id: '32-1',
      titulo: 'El índice que falta',
      enunciado:
        'La tabla <code>pedidos</code> apunta a <code>sombreros</code> y no tiene índice: cada «pedidos de este sombrero» lee la tabla entera. Créalo, y crea también el de <code>sombreros.material_id</code>.',
      pista: '<code>CREATE INDEX idx_pedidos_sombrero ON pedidos (sombrero_id);</code> y otro igual para material_id.',
      comprobar: comprobarSql({
        requisitos: [
          tieneIndice('pedidos', 'sombrero_id', {
            falta:
              'A «pedidos.sombrero_id» le falta su índice. Es una clave ajena: SQLite no lo crea solo, y es el olvido más caro del oficio.',
          }),
          tieneIndice('sombreros', 'material_id'),
        ],
        exito:
          'Las dos claves ajenas indexadas. Pide ahora el plan de una consulta por sombrero_id: donde antes decía SCAN, ahora dirá SEARCH USING INDEX.',
      }),
    },

    {
      id: '32-2',
      titulo: 'Que la base te lo cuente',
      enunciado:
        'Ejecuta <code>EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente = \'Marta\';</code> y mira la respuesta: dirá SCAN, porque no hay índice por cliente. Créalo (<code>idx_pedidos_cliente</code>), vuelve a pedir el plan y comprueba que ya dice SEARCH.',
      pista: 'El índice: <code>CREATE INDEX idx_pedidos_cliente ON pedidos (cliente);</code>. El plan es solo para que lo veas con tus ojos.',
      comprobar: comprobarSql({
        requisitos: [
          tieneIndice('pedidos', 'cliente', {
            falta: 'Falta el índice por «cliente» en pedidos.',
          }),
          comprobando(
            "EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente = 'Marta'",
            (filas) => {
              const plan = filas.map((f) => f.detail || '').join(' ')
              return /USING INDEX/i.test(plan)
                ? null
                : `El plan sigue diciendo: «${plan}». Con el índice creado debería usar un índice; comprueba que es sobre la columna cliente.`
            },
          ),
        ],
        exito:
          'Ahí lo tienes, dicho por la propia base: SEARCH … USING INDEX. Con EXPLAIN QUERY PLAN dejas de suponer y compruebas.',
      }),
    },

    eleccion({
      id: '32-3',
      titulo: 'El orden de las columnas',
      enunciado:
        'Tienes un índice sobre <code>(cliente, hecho_en)</code>. ¿Para qué búsqueda NO sirve?',
      pista: 'Piensa en la guía telefónica: ordenada por apellido y luego por nombre.',
      opciones: [
        {
          texto: 'Para buscar solo por hecho_en: el índice empieza por cliente.',
          correcta: true,
          porque:
            'Eso es. Es como buscar en la guía por nombre de pila: el orden del índice empieza por otra cosa. Si buscas mucho por fecha, necesitas su propio índice.',
        },
        {
          texto: 'Para buscar solo por cliente.',
          porque: 'Para eso sí sirve: es la primera columna del índice, que es justo el caso que cubre.',
        },
        {
          texto: 'Para buscar por cliente y fecha a la vez.',
          porque: 'Ese es su caso ideal: usa las dos columnas en el orden en que están.',
        },
      ],
    }),

    {
      id: '32-4',
      titulo: 'La fecha, con su sitio y su tipo',
      enunciado:
        'Los pedidos no guardan cuándo se hicieron. Añade la columna <code>hecho_en</code> con <code>ALTER TABLE</code>, de tipo <code>TEXT</code> (fechas en ISO: <code>2026-08-27</code>), y rellena con un <code>UPDATE</code> las filas que ya existían para que ninguna quede vacía.',
      pista:
        '<code>ALTER TABLE pedidos ADD COLUMN hecho_en TEXT;</code> y luego <code>UPDATE pedidos SET hecho_en = \'2026-08-27\' WHERE hecho_en IS NULL;</code>',
      comprobar: comprobarSql({
        requisitos: [
          tieneColumna('pedidos', 'hecho_en', {
            tipo: /TEXT|INT|NUM|DATE/i,
            malo: 'La columna de fecha se ha quedado sin tipo. Una fecha va como TEXT en ISO o como INTEGER; si no, no se puede ni ordenar ni comparar bien.',
          }),
          comprobando('SELECT COUNT(*) AS n FROM pedidos WHERE hecho_en IS NULL', (filas) =>
            Number(filas[0].n) > 0
              ? `Quedan ${filas[0].n} pedidos sin fecha. Rellénalos con un UPDATE … WHERE hecho_en IS NULL.`
              : null,
          ),
          comprobando(
            "SELECT COUNT(*) AS n FROM pedidos WHERE hecho_en NOT GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'",
            (filas) =>
              Number(filas[0].n) > 0
                ? 'Alguna fecha no está en formato ISO (2026-08-27). Ese formato importa: es el único que se ordena bien como texto.'
                : null,
          ),
        ],
        exito:
          'Fecha con tipo y en ISO, que es el único formato que se ordena bien siendo texto. Añadir columna, rellenar lo viejo: ese es el orden.',
      }),
    },

    {
      id: '32-5',
      titulo: 'El booleano, como entero',
      enunciado:
        'Añade a <code>pedidos</code> la columna <code>entregado</code> como <code>INTEGER NOT NULL DEFAULT 0</code>. En SQLite los sí/no van así, con 0 y 1, no como texto.',
      pista:
        'El DEFAULT es imprescindible aquí: sin él, las filas que ya existen no podrían cumplir el NOT NULL.',
      comprobar: comprobarSql({
        requisitos: [
          tieneColumna('pedidos', 'entregado', {
            tipo: /INT|NUM|BOOL/i,
            obligatoria: true,
            malo: 'Guarda el sí/no como INTEGER (0 y 1). Como texto («si»/«no», «true»/«false») acabas con cuatro formas de decir lo mismo.',
          }),
          comprobando(
            'SELECT COUNT(*) AS n FROM pedidos WHERE entregado NOT IN (0, 1)',
            (filas) =>
              Number(filas[0].n) > 0
                ? 'Hay valores que no son 0 ni 1 en «entregado». Un booleano solo tiene dos estados.'
                : null,
          ),
        ],
        exito:
          'Entero, obligatorio y con valor por defecto: las filas viejas quedan en 0 sin dramas. Así se añade una columna a una tabla con datos.',
      }),
    },

    verdaderoFalso({
      id: '32-6',
      titulo: 'Cierto o falso: rendimiento y seguridad',
      enunciado: 'Cinco frases sobre índices y transacciones. Todas.',
      pista: 'Los índices cuestan, el orden importa, y las transacciones son todo o nada.',
      afirmaciones: [
        {
          texto: 'Un índice hace las lecturas más rápidas y las escrituras un poco más lentas.',
          cierto: true,
          porque:
            'Cierto: hay que mantenerlo en cada INSERT, UPDATE y DELETE. Por eso se ponen donde hay preguntas, no en todo.',
        },
        {
          texto: 'SQLite crea solo un índice para cada clave ajena.',
          cierto: false,
          porque:
            'Falso, y es el olvido más caro: crea el de la clave primaria y el de los UNIQUE, pero el de la clave ajena lo tienes que crear tú.',
        },
        {
          texto: 'Un índice sobre (a, b) sirve para buscar solo por b.',
          cierto: false,
          porque: 'Falso: empieza por a. Es como buscar en la guía telefónica por nombre de pila.',
        },
        {
          texto: 'Entre BEGIN y COMMIT, o se aplican todos los cambios o ninguno.',
          cierto: true,
          porque:
            'Cierto: y si algo falla, ROLLBACK deja la base como estaba. Imprescindible cuando dos cambios tienen que ir juntos.',
        },
        {
          texto: 'EXPLAIN QUERY PLAN ejecuta la consulta y devuelve sus filas.',
          cierto: false,
          porque:
            'Falso: no la ejecuta, cuenta qué PIENSA hacer. Es la forma de comprobar si tu índice se está usando.',
        },
      ],
    }),

    completar({
      id: '32-7',
      titulo: 'Todo o nada',
      enunciado: 'Completa la transacción que mueve una unidad de un sitio a otro.',
      pista: 'Abrir, cerrar bien, y deshacer si algo falla.',
      plantilla: `___;
  UPDATE pedidos SET unidades = unidades - 1 WHERE id = 3;
  UPDATE almacen SET quedan = quedan + 1 WHERE sombrero_id = 3;
___;
-- y si algo hubiera fallado en medio: ___;`,
      huecos: [
        { respuestas: ['begin', 'begin transaction'], porque: 'BEGIN abre la transacción.' },
        { respuestas: ['commit'], porque: 'COMMIT confirma los dos cambios a la vez.' },
        { respuestas: ['rollback'], porque: 'ROLLBACK deshace todo y deja la base como estaba.' },
      ],
    }),

    emparejar({
      id: '32-8',
      titulo: 'Cada síntoma, su causa',
      enunciado: 'Une cada cosa que ves con lo que significa.',
      pista: 'Plan de consulta, avisos de esquema y decisiones de tipo.',
      pares: [
        { izquierda: 'SCAN pedidos', derecha: 'está leyendo la tabla entera' },
        {
          izquierda: 'SEARCH pedidos USING INDEX',
          derecha: 'está usando un índice',
          porque: 'Eso es lo que quieres ver en las consultas que se repiten.',
        },
        { izquierda: 'clave ajena sin índice', derecha: 'lento en cuanto la tabla crezca' },
        { izquierda: 'fecha guardada sin tipo', derecha: 'no se puede ordenar ni comparar bien' },
      ],
      porque:
        'Leer el plan y leer la revisión del esquema son la misma habilidad: ver hoy el problema que llegará dentro de seis meses.',
    }),

    ordenar({
      id: '32-9',
      titulo: 'Cuando una consulta va lenta',
      enunciado: 'Ordena lo que hace alguien con oficio ante una consulta lenta.',
      pista: 'Medir antes de tocar; comprobar después.',
      lineas: [
        'Pedir EXPLAIN QUERY PLAN y ver qué hace la base',
        'Mirar por qué columnas filtra y ordena la consulta',
        'Crear el índice que cubra esas columnas, en ese orden',
        'Volver a pedir el plan y confirmar que ahora usa el índice',
      ],
      porque:
        'Medir, entender, cambiar, volver a medir. Sin el último paso no sabes si has arreglado algo o solo has añadido un índice que nadie usa.',
    }),

    {
      id: '32-10',
      titulo: 'La revisión de Wax',
      sintesis: true,
      enunciado:
        'Sin pistas, y es el examen del acto: deja la base con las dos claves ajenas indexadas, el índice por cliente, la fecha con tipo y sin vacíos, el booleano como entero con su defecto… y sobre todo, <strong>sin ningún aviso grave en la pestaña Esquema</strong>. Cuando mi lista de peros esté limpia, este mundo se cierra.',
      comprobar: comprobarSql({
        requisitos: [
          hayTabla('pedidos'),
          hayFilas('pedidos', 4),
          tieneIndice('pedidos', 'sombrero_id'),
          tieneIndice('pedidos', 'cliente'),
          tieneIndice('sombreros', 'material_id'),
          tieneClaveAjena('pedidos', 'sombrero_id', 'sombreros'),
          tieneColumna('pedidos', 'hecho_en', { tipo: /TEXT|INT|NUM|DATE/i }),
          tieneColumna('pedidos', 'entregado', { tipo: /INT|NUM|BOOL/i, obligatoria: true }),
          comprobando('SELECT COUNT(*) AS n FROM pedidos WHERE hecho_en IS NULL', (filas) =>
            Number(filas[0].n) > 0 ? 'Quedan pedidos sin fecha.' : null,
          ),
          esquemaLimpio(),
        ],
        exito:
          'Esquema sin un solo pero: claves ajenas indexadas, tipos que dicen la verdad y nada que vaya a doler en seis meses. Con esto cierras el acto de la base de datos, y es el trozo del taller que más se parece a un trabajo de verdad.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en lo que ha cambiado desde el primer mundo del acto: ya no escribes SQL para que funcione, lo escribes para que ' +
      'siga funcionando con cien mil filas y para que la base defienda sola las reglas. Eso es diseñar datos. Y se paga bien, por cierto.',
  },
}
