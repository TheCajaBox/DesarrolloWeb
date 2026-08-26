-- Sombreros de arranque, para que el catalogo no nazca vacio.
-- Descripciones originales, escritas en el registro de Wayne. Nada copiado.
-- `propuesto_por` queda a NULL: los propone la casa.

INSERT INTO sombreros (nombre, descripcion) VALUES
  ('El de siempre',
   'Marron, con el ala vencida por el lado izquierdo. No es el mejor sombrero del mundo. Es el mio, que es distinto y es mas importante.'),

  ('Hongo de contable',
   'Duro, redondo y respetable. Te lo pones y la gente empieza a contarte cosas de impuestos sin que se las preguntes. Utilisimo. Insoportable.'),

  ('El de las bodas',
   'Gris perla, impecable, y con una mancha justo detras que nadie ha visto nunca porque nadie mira a un hombre por detras en una boda.'),

  ('Gorra de conductor',
   'Con visera. Te la calas y ya puedes aparcar donde te de la gana, porque pareces alguien que tiene permiso.'),

  ('El de ala anchisima',
   'Tan ancho que entra en las habitaciones tres segundos antes que tu. Da sombra a dos personas. Cabe en ninguna puerta.'),

  ('Sombrero de paja de los Aspreros',
   'Huele a polvo y a caballo. Ha visto cosas. Preferiria no hablar de ellas.'),

  ('El prestado',
   'Se lo cambie a un senor por un lapiz. Salio ganando el, porque era un lapiz muy bueno. Eso es lo que le digo a el, por lo menos.');
