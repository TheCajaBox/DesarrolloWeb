-- El sandbox de cada persona: su proyecto en curso.
--
-- Va en su propia tabla y no en `ficheros`, que es para lo publicado. Son dos
-- cosas distintas: esto es tu carpeta de trabajo, que cambia cada minuto, y
-- aquello es una versión que decidiste publicar.
--
-- Sin esto, el proyecto vivía solo en IndexedDB: cambiabas de navegador y no
-- estaba, y el aviso de "solo en este navegador" era literal.

CREATE TABLE sandbox (
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ruta           TEXT NOT NULL,
  contenido      TEXT NOT NULL,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, ruta)
);

-- Para saber de un vistazo cuándo se tocó por última vez el sandbox de alguien,
-- que es lo que decide si manda la copia de la nube o la del navegador.
CREATE INDEX idx_sandbox_actualizado ON sandbox(usuario_id, actualizado_en);
