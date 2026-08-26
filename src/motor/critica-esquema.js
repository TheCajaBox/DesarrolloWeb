// La revision de esquema de Wax.
//
// No corrige: senala. El alumno ha escrito un CREATE TABLE que funciona, y
// SQLite se lo ha aceptado sin rechistar. Wax le explica por que dentro de
// seis meses le va a doler.
//
// Es analisis del esquema real, leido de la base con PRAGMA. No hay
// expresiones regulares sobre el SQL que escribio: si SQLite entendio otra
// cosa de la que el creia estar diciendo, aqui sale.

export const GRAVEDADES = { alta: 3, media: 2, baja: 1 }

// Palabras con las que la gente nombra fechas.
const SUENA_A_FECHA = /(fecha|_en|_at|creado|actualizado|modificado|nacimiento|caducidad)$/i
// Y booleanos.
const SUENA_A_BOOLEANO = /^(es|esta|tiene|hay|activo|visible|borrado|publicado)(_|$)/i

const TIPOS_DE_FECHA = ['TEXT', 'INTEGER', 'NUMERIC', 'DATE', 'DATETIME']

function normalizar(tipo) {
  return String(tipo || '').trim().toUpperCase()
}

// Indices que empiezan por estas columnas. Un indice sobre (a, b) sirve para
// buscar por `a`, pero uno sobre (b, a) no: el orden importa.
function tieneIndicePor(tabla, columna) {
  return tabla.indices.some((indice) => indice.columnas[0] === columna)
}

function esClavePrimaria(tabla, columna) {
  return tabla.columnas.some((c) => c.nombre === columna && c.clavePrimaria)
}

export function criticar(esquema) {
  const avisos = []
  const nombresDeTabla = new Set(esquema.map((tabla) => tabla.nombre.toLowerCase()))

  const anotar = (aviso) => avisos.push(aviso)

  for (const tabla of esquema) {
    const tieneClave = tabla.columnas.some((columna) => columna.clavePrimaria)

    if (!tieneClave) {
      anotar({
        tabla: tabla.nombre,
        columna: null,
        tipo: 'sin_clave_primaria',
        gravedad: 'alta',
        titulo: `"${tabla.nombre}" no tiene clave primaria`,
        explicacion:
          'Sin clave primaria no hay forma de senalar una fila concreta. Dos filas identicas son ' +
          'indistinguibles, y no puedes actualizar una sin arriesgarte a tocar la otra. Tampoco ' +
          'puede apuntarla nadie con una clave ajena.',
      })
    }

    const declaradas = new Set(tabla.clavesAjenas.map((ajena) => ajena.columna))

    for (const columna of tabla.columnas) {
      const tipo = normalizar(columna.tipo)

      if (!tipo) {
        anotar({
          tabla: tabla.nombre,
          columna: columna.nombre,
          tipo: 'tipo_ausente',
          gravedad: 'media',
          titulo: `"${columna.nombre}" no declara tipo`,
          explicacion:
            'SQLite te deja no ponerlo, y entonces admite cualquier cosa en esa columna: el numero 5 ' +
            'y la cadena "cinco" conviven tan tranquilos. El dia que sumes, no cuadrara.',
        })
      }

      // VARCHAR(50) en SQLite admite 5.000 caracteres. La longitud se ignora.
      const conLongitud = tipo.match(/^(VARCHAR|CHAR|NVARCHAR)\s*\((\d+)\)/)
      if (conLongitud) {
        anotar({
          tabla: tabla.nombre,
          columna: columna.nombre,
          tipo: 'longitud_ignorada',
          gravedad: 'baja',
          titulo: `El (${conLongitud[2]}) de "${columna.nombre}" no hace nada`,
          explicacion:
            'SQLite acepta la sintaxis por compatibilidad, pero no comprueba la longitud: en un ' +
            `VARCHAR(${conLongitud[2]}) caben ${conLongitud[2]} caracteres o cincuenta mil. Si quieres un limite ` +
            'de verdad, es un CHECK: CHECK (length(' + columna.nombre + ') <= ' + conLongitud[2] + ').',
        })
      }

      // Clave ajena por el nombre, pero sin declarar.
      const pareceAjena = /_id$/i.test(columna.nombre) && !columna.clavePrimaria
      if (pareceAjena && !declaradas.has(columna.nombre)) {
        const destino = columna.nombre.replace(/_id$/i, '').toLowerCase()
        const plural = destino + 's'
        const existe = nombresDeTabla.has(destino) || nombresDeTabla.has(plural)

        if (existe) {
          anotar({
            tabla: tabla.nombre,
            columna: columna.nombre,
            tipo: 'ajena_sin_declarar',
            gravedad: 'alta',
            titulo: `"${columna.nombre}" apunta a otra tabla, pero no lo dice`,
            explicacion:
              'Por el nombre se ve que quiere ser una clave ajena, pero no esta declarada como tal. ' +
              'Nada impide meter ahi un id que no existe, ni borrar la fila apuntada y dejar esta ' +
              'senalando al vacio. Con REFERENCES, la base lo impide sola.',
          })
        }
      }

      if (SUENA_A_FECHA.test(columna.nombre) && tipo && !TIPOS_DE_FECHA.includes(tipo)) {
        anotar({
          tabla: tabla.nombre,
          columna: columna.nombre,
          tipo: 'fecha_con_tipo_raro',
          gravedad: 'media',
          titulo: `"${columna.nombre}" parece una fecha guardada como ${tipo}`,
          explicacion:
            'SQLite no tiene tipo fecha. Lo habitual es TEXT en formato ISO (2026-08-26), que se ' +
            'ordena bien alfabeticamente, o INTEGER con segundos desde 1970. Otros tipos se ordenan ' +
            'de formas sorprendentes.',
        })
      }

      if (SUENA_A_BOOLEANO.test(columna.nombre) && tipo === 'TEXT') {
        anotar({
          tabla: tabla.nombre,
          columna: columna.nombre,
          tipo: 'booleano_en_texto',
          gravedad: 'baja',
          titulo: `"${columna.nombre}" parece un si/no guardado como texto`,
          explicacion:
            'Acabaras con "si", "SI", "true", "1" y "" conviviendo en la misma columna. Con INTEGER ' +
            'y CHECK (' + columna.nombre + ' IN (0, 1)) solo caben dos valores.',
        })
      }
    }

    // SQLite indexa la clave primaria, pero NO las claves ajenas. Es la
    // sorpresa clasica: los JOIN y los DELETE en cascada recorren la tabla
    // entera sin que nadie avise.
    for (const ajena of tabla.clavesAjenas) {
      if (!tieneIndicePor(tabla, ajena.columna) && !esClavePrimaria(tabla, ajena.columna)) {
        anotar({
          tabla: tabla.nombre,
          columna: ajena.columna,
          tipo: 'ajena_sin_indice',
          gravedad: 'media',
          titulo: `La clave ajena "${ajena.columna}" no tiene indice`,
          explicacion:
            'SQLite indexa la clave primaria sola, pero las ajenas no. Cada JOIN con ' +
            `"${ajena.tablaDestino}" recorre la tabla entera, y borrar una fila de alli obliga a ` +
            'revisarla toda para ver quien la apuntaba. Con diez filas no se nota; con cien mil, si.',
        })
      }
    }

    const obligatorias = tabla.columnas.filter((columna) => columna.obligatoria || columna.clavePrimaria)
    if (tabla.columnas.length > 1 && obligatorias.length === 0) {
      anotar({
        tabla: tabla.nombre,
        columna: null,
        tipo: 'todo_opcional',
        gravedad: 'baja',
        titulo: `En "${tabla.nombre}" todo es opcional`,
        explicacion:
          'Ninguna columna es NOT NULL, asi que cabe una fila entera de nulos. Piensa cual es el ' +
          'minimo sin el que esa fila no significa nada, y marcalo.',
      })
    }
  }

  return avisos.sort((a, b) => GRAVEDADES[b.gravedad] - GRAVEDADES[a.gravedad])
}

// Frase de cierre de Wax, segun lo que haya encontrado.
export function veredicto(avisos) {
  if (!avisos.length) {
    return 'No le veo ningun pero. Las claves estan donde tienen que estar y los tipos dicen lo que guardan.'
  }

  const altas = avisos.filter((aviso) => aviso.gravedad === 'alta').length
  if (altas) {
    return `Funciona, pero hay ${altas === 1 ? 'algo' : altas + ' cosas'} que la base deberia estar impidiendo y no impide. Eso se arregla ahora, no cuando haya datos dentro.`
  }

  return 'La estructura se sostiene. Lo que queda son detalles que se pagan mas adelante, cuando la tabla crezca.'
}
