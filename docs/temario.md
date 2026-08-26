# El Sombrero de Wayne — diseño del taller

Documento guía. Define qué se enseña, en qué orden, con qué voz y cómo se
comprueba. Lo que no esté aquí, no se implementa hasta que esté aquí.

## La regla que manda sobre todas

**Nadie llega sabiendo nada.** El primer paso del primer mundo lo tiene que
poder hacer alguien que no ha escrito una línea de código en su vida y no sabe
qué es una etiqueta. Si un paso exige saber algo que no se ha explicado antes,
el paso está mal.

Corolario: **no todo es teclear**. Hay mundos que son casi solo lectura, y está
bien. Se entiende primero y se construye después.

## Los cuatro personajes

Cada uno hace una cosa y solo una. Si dos se solapan, sobra uno.

| Quién | Para qué | Cómo aparece | Tono |
|---|---|---|---|
| **Wayne** | Narrador. Engancha, quita miedo, hace gracia | Bocadillo flotante, se va solo | Suelto, gamberro, se va por las ramas y vuelve con algo que resulta ser útil |
| **Wax** | Las lecciones de verdad | Panel de lectura, texto largo | Preciso, ordenado, sin adornos. Explica el porqué, no solo el cómo |
| **Steris** | Glosario y traducción de errores | Al pinchar un término subrayado, o bajo un error | Exhaustiva, literal, lo tiene todo previsto. Nunca condescendiente |
| **Armonía** | Responder preguntas sueltas | Panel de chat | Serena. Ayuda a pensar; la solución no la da |

**Todo el diálogo es original**, escrito en el registro de los personajes de
Brandon Sanderson. Ni una línea copiada de los libros. Los retratos vienen de
`croquetas-alomanticas`, del mismo autor.

### La voz de Wayne, en concreto

Wayne funciona si hace sonreír. Las reglas que lo consiguen:

- **Compara con cosas físicas.** Un servidor es un tío en una ventanilla. Una
  clave ajena es un recibo con el número de la mesa.
- **Se cuela en lo suyo.** Sombreros, trueques, acentos, y una relación
  flexible con la propiedad privada.
- **Nunca explica bien a propósito.** Da la intuición y remata con "pero eso te
  lo cuenta Wax, que yo me lío".
- **Nada de ánimos vacíos.** Ni "¡tú puedes!" ni "¡genial!". Si algo sale bien,
  lo reconoce a su manera y sigue.
- **Corto.** Dos o tres frases. El bocadillo flotante no aguanta más.

### La voz de Wax, en concreto

Cada lección sigue la misma forma, porque funciona:

1. **El problema** — qué duele si esto no existiera
2. **La idea** — la frase que hay que llevarse
3. **El modelo mental** — con qué compararlo para no olvidarlo
4. **Lo que casi todo el mundo entiende mal** — dicho explícitamente
5. **Ejemplo trabajado**, con su resultado real
6. **Cómo saber cuál usar** cuando toque decidir

Longitud: 3.000–7.000 caracteres. Todos los ejemplos, ejecutados antes de
escribirlos. Nada de código de memoria.

## Los mundos

Quince mundos en cinco actos. Cada mundo: entradilla de Wayne, lección de Wax,
entre tres y cinco pasos, y cierre.

### Acto I · Qué es todo esto

Casi todo lectura. Se toca poco código y el que se toca ya está escrito.

**1 · Esto es un papel**
Qué es una página web: un fichero de texto. Qué hace el navegador con él. Cómo
llega desde un ordenador que está en otro sitio hasta tu pantalla. Qué es una
URL, trozo a trozo.
*Pasos:* cambiar un texto que ya está escrito · añadir una línea · romperlo a
propósito y ver qué pasa.

**2 · Etiquetas: decir qué es cada cosa**
Una etiqueta no dibuja, significa. HTML semántico. Por qué `<div>` es la
etiqueta de cuando no sabes. Accesibilidad como consecuencia, no como añadido.
*Pasos:* primera ficha de sombrero, con `<article>`, `<h2>` y `<p>`.

**3 · Todo es un fichero que alguien pide**
Rutas relativas y absolutas. Cómo el navegador pide el CSS, las imágenes, las
fuentes. Qué es un 404 y por qué sale. Enlaces entre páginas.
*Pasos:* segunda página · enlazarlas · una imagen · provocar un 404 y
arreglarlo.

### Acto II · Que se vea bien

**4 · El navegador ya tiene opiniones**
La hoja de estilos por defecto. Selectores. La cascada y la especificidad —
por qué "no me hace caso" casi siempre es especificidad.
*Pasos:* cambiar colores y tipografía · un selector de clase · ganar una pelea
de especificidad.

**5 · El modelo de cajas**
Todo es un rectángulo. Padding, borde, margen. `box-sizing`. Colapso de
márgenes.
*Pasos:* dar aire a las fichas · arreglar una caja que se sale · `border-box`.

**6 · Repartir el espacio**
Flex y grid: cuándo cada uno. `gap`. Unidades relativas. Media queries y por
qué "móvil primero".
*Pasos:* rejilla de fichas · que aguante en móvil · alinear el interior.

### Acto III · Que haga cosas

**7 · JavaScript, por fin**
Variables, tipos, funciones, condicionales. El DOM como árbol. Eventos.
*Pasos:* un `console.log` · seleccionar un elemento · un click que cambia algo
· el botón de votar.

**8 · Los datos tienen forma**
Arrays y objetos. Recorrer y pintar. JSON: qué es y qué no. `fetch`, promesas,
`async`. Por qué la asincronía existe.
*Pasos:* array de sombreros · pintarlos desde el array · leer un JSON · pintar
lo que llega.

### Acto IV · El otro lado

Aquí empieza lo que no se ve, y hay mucha teoría antes de tocar nada.

**9 · Qué es un servidor de verdad**
Cliente y servidor. HTTP: petición, respuesta, verbos, cabeceras, códigos de
estado. Qué es un puerto, qué es `localhost`, qué es una IP y qué hace el DNS.
**Y cómo sería esto en tu ordenador**: instalar Node en Windows y en Linux,
levantar un servidor local, por qué `file://` no es lo mismo que `http://`, y
en qué se parece y en qué no a un XAMPP o a un nginx de verdad.
*Pasos:* leer códigos de estado reales · provocar un 404, un 500 y un 401 ·
mirar cabeceras.

**10 · Diseñar una base de datos**
Por qué no vale un fichero de texto. Tablas, filas, columnas. Tipos. Clave
primaria y clave ajena. Normalizar: qué es y hasta dónde. Índices y qué cuestan.
**Teoría del mundo real**: en qué se diferencia SQLite de MySQL o PostgreSQL,
qué significa instalar un motor en Windows o en Linux, qué es un servicio, qué
es un puerto de base de datos, qué es una cadena de conexión, y por qué en
Cloudflare no se instala nada.
*Pasos:* `CREATE TABLE` real · añadir claves ajenas · pasar la revisión de Wax.

**11 · Preguntarle a la base**
`SELECT`, `WHERE`, `ORDER BY`. `JOIN` y por qué existe. `GROUP BY` y agregados.
`NULL` y sus sorpresas. Índices y `EXPLAIN`.
*Pasos:* consultas sobre datos de verdad · un JOIN · la media por sombrero ·
arreglar una consulta lenta.

**12 · La API**
Qué es un endpoint. Diseñar rutas. Verbos y qué significa cada uno.
Idempotencia. Códigos de estado bien elegidos. Validar lo que entra.
*Pasos:* handler que devuelve JSON · leer parámetros · un POST · devolver el
código correcto cuando algo va mal.

**13 · Que no te la cuelen**
Inyección SQL, con demostración: la misma consulta, con y sin parámetros.
XSS. Validación en cliente y en servidor, y por qué la del cliente no cuenta.
Contraseñas, hasheo, sesiones y cookies. Qué es HTTPS.
*Pasos:* romper una consulta vulnerable · arreglarla · colar un `<script>` ·
taparlo.

### Acto V · Ponerlo en el mundo

**14 · Vue y que se mueva**
Por qué existen los frameworks. Componentes. Estado reactivo. Props y eventos.
Transiciones y animaciones que no marean.
*Pasos:* convertir la ficha en componente · una lista reactiva · una transición
al votar.

**15 · Del repositorio a Internet**
Qué es git y por qué no es una copia de seguridad. Commits, ramas, remoto.
**Cómo una web llega de tu carpeta a un dominio**: qué es un repositorio
remoto, qué es CI/CD, qué pasa exactamente cuando haces push y algo se
despliega solo. DNS, dominios, certificados, HTTPS. Qué es un CDN.
*Pasos:* leer un historial · entender un diff · un despliegue de verdad.

## Cómo se comprueba cada paso

Por orden de preferencia. Se baja un escalón solo cuando el de arriba no es
posible.

1. **Ejecutar y mirar el resultado.** SQL contra SQLite real; JavaScript en un
   Worker aislado. Lo que dice la máquina, no lo que parece el texto.
2. **Leer la estructura.** HTML y CSS se parsean (`motor/leer-css.js`) y se
   consulta el árbol. Nunca expresiones regulares sobre el fuente: un comentario
   o un salto de línea de más no puede tumbar un paso bien resuelto.
3. **Comparar contra un patrón**, solo para lo que no tiene estructura.

Cada comprobación devuelve `{ superado, mensaje }`. **El mensaje es la mitad del
ejercicio**: dice qué falta y por qué importa, nunca "incorrecto". Si se puede
decir cuánto falta ("llevas 2 de 3"), se dice.

### Reglas de las pruebas automáticas

Cada mundo trae su fichero en `pruebas/`, y como mínimo:

- El esqueleto sembrado **no** supera ningún paso (si no, el paso no enseña nada)
- Existe al menos una solución que **sí** los supera todos
- Cada mensaje de fallo se dispara con el caso que lo describe
- Ningún paso se supera "de rebote" por algo que estaba en el esqueleto
- Los ids de paso son únicos en todos los mundos

## La interfaz

**Que dé ganas de tocarla.** Tres zonas: lección, editor y resultado.

- **Los paneles se contraen.** La teoría se lee a pantalla ancha, sin un editor
  robando dos tercios. Es un botón, y se recuerda entre sesiones.
- **Wayne flota.** Bocadillo por encima, en una esquina, que se va solo. Nunca
  empuja el contenido ni obliga a cerrarlo para seguir.
- **Steris subraya.** Los términos del glosario llevan subrayado de puntos y se
  abren al pinchar, sin salir de donde estabas.
- **Los errores se traducen.** Debajo del error crudo, en cristiano, con la
  causa más probable primero.
- **Se ve dónde estás.** Mundos, actos y pasos, siempre a la vista. Nunca la
  sensación de que "no hay nada más".
- **Nada se pierde.** El progreso va a D1 y sobrevive a cambiar de ordenador.

## Lo que este proyecto no hace

- **No ejecuta el backend del alumno en el servidor.** Publicar sirve ficheros
  estáticos. Evaluar código ajeno en el Worker sería ejecución remota.
- **No guarda claves de API en el bundle.** Los estáticos son públicos.
- **No castiga.** No se pierde progreso por fallar. No hay tiempo límite.
- **No finge.** Si SQLite da un error, se enseña ese error. Aprender a leerlos
  es parte del temario.
