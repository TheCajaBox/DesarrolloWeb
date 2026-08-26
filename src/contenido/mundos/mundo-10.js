// Mundo 10 — Diseñar una base de datos.
//
// El esquema se escribe en un FICHERO, no en la consola, y a proposito: es el
// habito que hay que coger. Un esquema tecleado a mano en una consola existe
// en una maquina y en la cabeza de una persona; en un fichero versionado
// existe para todo el mundo y se puede volver atras.
//
// Las comprobaciones ejecutan ese fichero contra SQLite de verdad y despues
// leen el esquema resultante con PRAGMA. Si SQLite entendio algo distinto de
// lo que el alumno creia escribir, aqui sale.
//
// Dialogos originales, en el registro de los personajes.

import { criticar } from '../../motor/critica-esquema.js'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
  </head>
  <body>
    <h1>Sombreros</h1>
    <p>En este mundo se trabaja en <code>esquema.sql</code> y en la pestaña SQL.</p>
  </body>
</html>
`

const SQL_BASE = `-- El esquema de la base, en un fichero.
--
-- Se escribe aquí y no en la consola por un motivo: un esquema tecleado a
-- mano vive en una máquina y en la cabeza de quien lo escribió. En un fichero
-- vive en el proyecto, se puede leer, comparar y deshacer.
--
-- Escribe aquí debajo y ejecútalo en la pestaña SQL para probarlo.
`

// Ejecuta el esquema del alumno en una base limpia y devuelve lo que quedó.
async function montarEsquema(ficheros) {
  const guion = String(ficheros?.['esquema.sql'] || '')
  const motor = await import('../../motor/sql.js')

  await motor.reiniciar('comprobacion')

  if (!guion.replace(/--[^\n]*/g, '').trim()) {
    return { vacio: true, tablas: [], error: null }
  }

  try {
    await motor.ejecutarGuion(guion, 'comprobacion')
  } catch (error) {
    return { vacio: false, tablas: [], error: error.message }
  }

  return { vacio: false, tablas: await motor.esquema('comprobacion'), error: null }
}

const tabla = (tablas, nombre) => tablas.find((t) => t.nombre.toLowerCase() === nombre)
const columna = (t, nombre) => t?.columnas.find((c) => c.nombre.toLowerCase() === nombre)

export default {
  numero: 10,
  acto: 'El otro lado',
  titulo: 'Mundo 10 · Diseñar la base',

  entradilla: {
    quien: 'wayne',
    texto:
      'Un fichero JSON vale hasta que dos personas quieren escribir a la vez. Entonces gana la última y la otra ' +
      'se queda sin nada, sin enterarse. Una base de datos existe básicamente para evitar esa discusión.',
  },

  ficheros: { 'index.html': HTML_BASE, 'esquema.sql': SQL_BASE },

  solucion: {
    'index.html': HTML_BASE,
    'esquema.sql': `${SQL_BASE}
CREATE TABLE sombreros (
  id          INTEGER PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE usuarios (
  id    INTEGER PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE
);

CREATE TABLE votos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  sombrero_id INTEGER NOT NULL REFERENCES sombreros(id) ON DELETE CASCADE,
  puntuacion  INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  creado_en   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, sombrero_id)
);

CREATE INDEX idx_votos_sombrero ON votos(sombrero_id);
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Tablas, claves, y qué hay debajo de todo esto',
    cuerpo: `Tienes los datos en un fichero JSON. Funciona mientras seas tú solo. En cuanto haya dos personas votando a la vez, las dos leen el fichero, las dos escriben, y la última borra el trabajo de la primera sin que nadie se entere.

Una base de datos existe para eso, antes que para cualquier otra cosa: para que muchas cosas pasen a la vez sin destruirse.

**La estructura.** Una **tabla** guarda cosas del mismo tipo. Cada **fila** es una de esas cosas y cada **columna** un dato suyo. Una tabla de sombreros tiene una fila por sombrero.

**La clave primaria.** Cada fila necesita algo que la identifique sin ambigüedad:

    CREATE TABLE sombreros (
      id     INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL
    );

Sin clave primaria, dos filas idénticas son indistinguibles: no puedes actualizar una sin arriesgarte a tocar la otra, y nadie puede referirse a ella.

**La clave ajena, que es la idea potente.** Un voto tiene un sombrero y una persona. No copias el sombrero dentro del voto: guardas **su identificador**.

    CREATE TABLE votos (
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
      sombrero_id INTEGER NOT NULL REFERENCES sombreros(id),
      puntuacion  INTEGER NOT NULL,
      PRIMARY KEY (usuario_id, sombrero_id)
    );

Ese \`REFERENCES\` no es documentación: es una promesa que la base **hace cumplir**. No te dejará meter un voto de un sombrero que no existe, ni borrar un sombrero que tiene votos, salvo que digas explícitamente qué hacer con ellos.

Y fíjate en la clave primaria compuesta: al ser \`(usuario_id, sombrero_id)\`, la base garantiza **un voto por persona y sombrero**. No con código, no con comprobaciones que se te pueden olvidar: es imposible por construcción.

**Normalizar** es exactamente esto: cada dato en un solo sitio, y lo demás apuntando a él. Si guardaras el nombre del sombrero dentro de cada voto, al corregir una errata tendrías que corregirla en mil filas, y bastaría con olvidar una para que la base se contradiga a sí misma.

**Los índices.** Buscar en una tabla sin índice obliga a leerla entera. Un índice es una estructura extra que la base mantiene para encontrar deprisa. Cuesta un poco de espacio y hace las escrituras algo más lentas, y a cambio las búsquedas dejan de ser lineales.

Con una trampa que hay que saber: **SQLite crea índice para la clave primaria, pero no para las claves ajenas.** Hay que ponerlos a mano. Con diez filas no se nota; con cien mil, cada JOIN recorre la tabla entera.

**Y ahora, qué hay debajo de todo esto.**

Lo que estás usando es **SQLite**: una base de datos que es un solo fichero y una biblioteca dentro de tu programa. No hay ningún servicio corriendo. Es la base de datos más desplegada del mundo, porque va dentro de cada teléfono y cada navegador.

**MySQL** o **PostgreSQL** son otra cosa: programas separados que corren como servicio, escuchan en un puerto y atienden a varios clientes. En una máquina propia eso significa:

- **En Windows**: un instalador que registra un servicio, y ese servicio arranca con el sistema. Se ve en el panel de Servicios, se para y se arranca desde ahí.
- **En Linux**: \`sudo apt install postgresql\`, y se gestiona con \`systemctl start postgresql\`. Escucha en el 5432; MySQL, en el 3306.

Y en los dos casos tu programa se conecta con una **cadena de conexión**, que es dónde está, quién eres y a qué base quieres entrar:

    postgres://usuario:contraseña@localhost:5432/sombreros

Eso trae consigo lo que nadie cuenta en los tutoriales: copias de seguridad, actualizaciones de seguridad, ajustar cuánta memoria usa, y decidir qué pasa cuando se llena el disco.

**D1**, que es lo que usa este proyecto, es SQLite gestionado por Cloudflare. No instalas nada, no hay servicio, no hay cadena de conexión con contraseña: hay un enlace declarado en la configuración. A cambio, no puedes instalarle extensiones ni elegir la versión.

**El SQL es el mismo.** Un \`CREATE TABLE\` o un \`SELECT\` que escribas aquí funcionan casi igual en cualquiera de las tres. Lo que cambia son los detalles: los tipos exactos, cómo se hace un autoincremento, cómo se escriben las fechas. Lo que estás aprendiendo se traslada.`,
  },

  pasos: [
    {
      id: '10-1',
      titulo: 'La tabla de sombreros',
      enunciado:
        'En <code>esquema.sql</code>, escribe un <code>CREATE TABLE sombreros</code> con: <code>id</code> como <code>INTEGER PRIMARY KEY</code>, <code>nombre</code> de tipo <code>TEXT NOT NULL</code>, y una <code>descripcion</code>. Pruébalo pegándolo en la pestaña SQL.',
      pista: 'Las columnas van separadas por comas, dentro de paréntesis, y la sentencia termina en punto y coma.',
      async comprobar(ficheros) {
        const { vacio, tablas, error } = await montarEsquema(ficheros)

        if (vacio) return { superado: false, mensaje: 'El fichero esquema.sql sigue sin ninguna sentencia.' }
        if (error) return { superado: false, mensaje: `SQLite no acepta tu esquema: ${error}` }

        const sombreros = tabla(tablas, 'sombreros')
        if (!sombreros) {
          return {
            superado: false,
            mensaje: tablas.length
              ? `Has creado ${tablas.map((t) => t.nombre).join(', ')}, pero no una tabla llamada «sombreros».`
              : 'No se ha creado ninguna tabla.',
          }
        }

        const id = columna(sombreros, 'id')
        if (!id || !id.clavePrimaria) {
          return { superado: false, mensaje: 'A «sombreros» le falta una columna id que sea PRIMARY KEY.' }
        }

        const nombre = columna(sombreros, 'nombre')
        if (!nombre) return { superado: false, mensaje: 'Falta la columna «nombre».' }
        if (!nombre.obligatoria) {
          return {
            superado: false,
            mensaje: 'La columna «nombre» admite nulos. Un sombrero sin nombre no significa nada: ponle NOT NULL.',
          }
        }
        if (!columna(sombreros, 'descripcion')) {
          return { superado: false, mensaje: 'Falta la columna «descripcion».' }
        }

        return { superado: true, mensaje: 'Tabla creada, con su clave primaria. Ya se puede señalar cada fila.' }
      },
    },

    {
      id: '10-2',
      titulo: 'Los votos, apuntando de verdad',
      enunciado:
        'Añade una tabla <code>usuarios</code> (con <code>id</code> y <code>alias</code>) y otra <code>votos</code> con <code>usuario_id</code>, <code>sombrero_id</code> y <code>puntuacion</code>. Las dos primeras tienen que ser <strong>claves ajenas declaradas</strong> con <code>REFERENCES</code>.',
      pista: 'Se escribe en la propia columna: <code>usuario_id INTEGER NOT NULL REFERENCES usuarios(id)</code>',
      async comprobar(ficheros) {
        const { vacio, tablas, error } = await montarEsquema(ficheros)
        if (vacio) return { superado: false, mensaje: 'El fichero esquema.sql está vacío.' }
        if (error) return { superado: false, mensaje: `SQLite no acepta tu esquema: ${error}` }

        if (!tabla(tablas, 'sombreros')) {
          return { superado: false, mensaje: 'Se ha perdido la tabla «sombreros» del paso anterior.' }
        }
        if (!tabla(tablas, 'usuarios')) return { superado: false, mensaje: 'Falta la tabla «usuarios».' }

        const votos = tabla(tablas, 'votos')
        if (!votos) return { superado: false, mensaje: 'Falta la tabla «votos».' }

        for (const nombre of ['usuario_id', 'sombrero_id', 'puntuacion']) {
          if (!columna(votos, nombre)) {
            return { superado: false, mensaje: `A «votos» le falta la columna «${nombre}».` }
          }
        }

        const ajenas = votos.clavesAjenas.map((a) => a.columna.toLowerCase())
        const faltan = ['usuario_id', 'sombrero_id'].filter((c) => !ajenas.includes(c))

        if (faltan.length) {
          return {
            superado: false,
            mensaje: `${faltan.join(' y ')} guarda${faltan.length === 1 ? '' : 'n'} un identificador, pero sin REFERENCES la base no comprueba nada: podrías meter ahí un id que no existe.`,
          }
        }

        return {
          superado: true,
          mensaje: 'Ahora la base impide sola que un voto apunte a un sombrero que no existe. Eso ya no depende de que tú te acuerdes.',
        }
      },
    },

    {
      id: '10-3',
      titulo: 'Un voto por persona',
      enunciado:
        'Ahora mismo la misma persona puede votar cien veces el mismo sombrero. Arréglalo con una <strong>clave primaria compuesta</strong> en <code>votos</code>: <code>PRIMARY KEY (usuario_id, sombrero_id)</code>. Que sea la base la que lo impida, no tu código.',
      pista: 'Va como una línea más dentro del paréntesis, después de las columnas, separada por coma.',
      async comprobar(ficheros) {
        const { tablas, error, vacio } = await montarEsquema(ficheros)
        if (vacio) return { superado: false, mensaje: 'El fichero esquema.sql está vacío.' }
        if (error) return { superado: false, mensaje: `SQLite no acepta tu esquema: ${error}` }

        const votos = tabla(tablas, 'votos')
        if (!votos) return { superado: false, mensaje: 'Se ha perdido la tabla «votos».' }

        const enClave = votos.columnas
          .filter((c) => c.clavePrimaria)
          .sort((a, b) => a.ordenEnClave - b.ordenEnClave)
          .map((c) => c.nombre.toLowerCase())

        if (!enClave.length) {
          return { superado: false, mensaje: '«votos» no tiene clave primaria de ningún tipo.' }
        }
        if (enClave.length === 1) {
          return {
            superado: false,
            mensaje: `La clave primaria es solo «${enClave[0]}». Con una sola columna no se impide votar dos veces: hace falta que sean las dos.`,
          }
        }
        if (!enClave.includes('usuario_id') || !enClave.includes('sombrero_id')) {
          return {
            superado: false,
            mensaje: `La clave compuesta es (${enClave.join(', ')}) y tiene que incluir usuario_id y sombrero_id.`,
          }
        }

        return {
          superado: true,
          mensaje: 'Un voto por persona y sombrero, garantizado por construcción. Ya no hay forma de saltárselo.',
        }
      },
    },

    {
      id: '10-4',
      titulo: 'Pasa la revisión de Wax',
      enunciado:
        'Wax va a mirar tu esquema. Arregla todo lo que señale como <strong>grave</strong>: sobre todo, el índice que SQLite <em>no</em> crea solo para las claves ajenas. Míralo en la pestaña Esquema.',
      pista: 'Se crea aparte: <code>CREATE INDEX idx_votos_sombrero ON votos(sombrero_id);</code>',
      async comprobar(ficheros) {
        const { tablas, error, vacio } = await montarEsquema(ficheros)
        if (vacio) return { superado: false, mensaje: 'El fichero esquema.sql está vacío.' }
        if (error) return { superado: false, mensaje: `SQLite no acepta tu esquema: ${error}` }

        const avisos = criticar(tablas)
        const graves = avisos.filter((aviso) => aviso.gravedad === 'alta')

        if (graves.length) {
          return { superado: false, mensaje: `${graves[0].titulo}. ${graves[0].explicacion}` }
        }

        const sinIndice = avisos.filter((aviso) => aviso.tipo === 'ajena_sin_indice')
        if (sinIndice.length) {
          return {
            superado: false,
            mensaje: `${sinIndice[0].titulo}. Es la trampa clásica de SQLite: indexa la clave primaria, pero las ajenas no.`,
          }
        }

        const restantes = avisos.length
        return {
          superado: true,
          mensaje: restantes
            ? `Nada grave. Quedan ${restantes} detalle(s) menores en la pestaña Esquema, por si quieres afinar.`
            : 'Wax no le encuentra ningún pero. Y eso, viniendo de él, es bastante.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en lo que has conseguido sin escribir una línea de programa: que sea imposible votar dos veces, e imposible ' +
      'apuntar a un sombrero inexistente. Lo que garantiza la base no se te puede olvidar en un caso raro. Lo que garantiza tu código, sí.',
  },
}
