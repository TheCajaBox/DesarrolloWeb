-- Esquema inicial de El Sombrero de Wayne.
--
-- Este fichero es tambien material didactico: el Mundo 5 ensena a disenar
-- justo esto, asi que aqui se hacen las cosas bien a proposito. Claves ajenas
-- declaradas, indices donde toca, y restricciones que impiden datos absurdos.

-- Personas. El email lo aporta Cloudflare Access, asi que aqui no se guarda
-- ninguna contrasena ni nada parecido.
CREATE TABLE usuarios (
  id        INTEGER PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  alias     TEXT NOT NULL,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sombreros (
  id            INTEGER PRIMARY KEY,
  nombre        TEXT NOT NULL,
  descripcion   TEXT NOT NULL DEFAULT '',
  imagen        TEXT,
  propuesto_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en     TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Sin este indice, "damelos sombreros de tal persona" recorre la tabla entera.
CREATE INDEX idx_sombreros_propuesto_por ON sombreros(propuesto_por);

-- Un voto por persona y sombrero: eso lo garantiza la clave primaria
-- compuesta, no el codigo de la aplicacion.
CREATE TABLE votos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  sombrero_id INTEGER NOT NULL REFERENCES sombreros(id) ON DELETE CASCADE,
  puntuacion  INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  creado_en   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, sombrero_id)
);
-- La media por sombrero es la consulta mas frecuente del catalogo.
CREATE INDEX idx_votos_sombrero ON votos(sombrero_id);

CREATE TABLE progreso (
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mundo          INTEGER NOT NULL,
  paso           INTEGER NOT NULL,
  estado         TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_curso', 'superado')),
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, mundo, paso)
);

CREATE TABLE proyectos (
  id         INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  creado_en  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (usuario_id, nombre)
);

-- El sistema de ficheros virtual del alumno, una vez publicado.
CREATE TABLE ficheros (
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  ruta        TEXT NOT NULL,
  contenido   TEXT NOT NULL,
  PRIMARY KEY (proyecto_id, ruta)
);

-- Cuota diaria de Armonia, para que una tarde de preguntas no deje sin
-- Neurons a la otra persona.
CREATE TABLE uso_armonia (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  dia        TEXT NOT NULL,
  consultas  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (usuario_id, dia)
);
