// Mundo 9 — Qué es un servidor de verdad.
//
// El mundo bisagra: se acaba lo que pasa en el navegador y empieza lo que pasa
// al otro lado. Es casi todo lectura, y esta bien que lo sea. Los pasos son de
// entender, no de teclear, porque aqui no hay nada que teclear todavia.
//
// Incluye a proposito la teoria de "y esto en mi ordenador cómo sería":
// instalar Node en Windows o en Linux, levantar un servidor local, y en qué se
// parece y en qué no a un XAMPP o a un nginx.
//
// Dialogos originales, en el registro de los personajes.

import { eleccion } from './tipos-de-paso.js'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
  </head>
  <body>
    <h1>Sombreros</h1>
    <p>Este mundo es de leer y entender. No hay nada que escribir aquí.</p>
    <p>Cuando termines, en el siguiente ya se toca la base de datos.</p>
  </body>
</html>
`

export default {
  numero: 9,
  acto: 'El otro lado',
  titulo: 'Mundo 9 · Qué es un servidor',

  entradilla: {
    quien: 'wayne',
    texto:
      'Este va de leer, así que ponte cómodo. Un servidor es un tío en una ventanilla: tú pides, él trae. ' +
      'No es más listo que tú, solo está siempre ahí. Que ya es mérito.',
  },

  ficheros: { 'index.html': HTML_BASE },
  solucion: { 'index.html': HTML_BASE },

  apunte: {
    quien: 'wax',
    titulo: 'El otro lado: servidores, HTTP y tu propio ordenador',
    cuerpo: `Todo lo que has hecho hasta ahora ocurre en el navegador de una persona. Los datos están en su pantalla y desaparecen al recargar. Para que un voto tuyo lo vea otra persona, tiene que haber algo en medio que lo guarde. Ese algo es un servidor.

**Qué es un servidor, sin misterio.** Un ordenador encendido con un programa escuchando. Nada más. No es más potente ni más listo: es un ordenador cuyo trabajo consiste en estar disponible y contestar cuando le preguntan. Tu propio portátil puede ser un servidor esta tarde, y en un rato lo verás.

**Cliente y servidor.** El navegador es el cliente: pregunta. El servidor contesta. Y hay una propiedad que sorprende: **el servidor no recuerda nada entre una petición y la siguiente**. Cada pregunta llega como si fuera la primera vez. Que un sitio te reconozca al recargar no es memoria del servidor: es que tu navegador le devuelve una cookie que lo identifica.

**HTTP: cómo se hablan.** Cada intercambio son dos mensajes. La petición dice qué se quiere:

    GET /api/sombreros HTTP/1.1
    Host: elsombrerodewayne.com
    Accept: application/json

Y la respuesta trae un número, unas cabeceras y el contenido:

    HTTP/1.1 200 OK
    Content-Type: application/json

    [{"nombre":"El de siempre"}]

**Los verbos** dicen qué clase de operación es. Los cuatro que se usan:

- **GET** — dame algo. No debe cambiar nada. Se puede repetir mil veces sin consecuencias.
- **POST** — crea algo nuevo. Repetirlo crea otro.
- **PUT** — deja esto así. Repetirlo con lo mismo no cambia nada más: es *idempotente*.
- **DELETE** — bórralo.

La diferencia entre POST y PUT importa de verdad: si alguien pulsa dos veces el botón de votar, con PUT su voto sigue siendo uno; con POST tendrías dos.

**Los números de la respuesta**, agrupados por su primera cifra:

- **2xx** — salió bien. 200 correcto, 201 creado.
- **3xx** — está en otro sitio. 301 mudanza definitiva, 302 temporal.
- **4xx** — **el problema está en la petición**. 400 mal escrita, 401 no sé quién eres, 403 sé quién eres y no puedes, 404 no existe, 429 demasiadas peticiones.
- **5xx** — **el problema está en el servidor**. 500 reventó su código.

Esa frontera entre 4xx y 5xx es lo más útil que te llevas de aquí: dice de quién es la culpa antes de mirar nada.

**Cómo llega tu petición hasta allí.** Escribes \`elsombrerodewayne.com\`, pero las máquinas se localizan por números (una IP). El **DNS** es la guía telefónica que traduce el nombre al número. Después, la petición llega a un **puerto** de esa máquina: un mismo ordenador puede tener varios programas escuchando, y el puerto dice a cuál va. El 80 es HTTP, el 443 es HTTPS, y por eso no hace falta escribirlos.

**Y ahora lo importante: cómo sería esto en tu ordenador.**

\`localhost\` es un nombre especial que significa "esta misma máquina". Cuando abres \`http://localhost:5274\`, tu navegador pide algo a un programa que corre en tu propio ordenador, en el puerto 5274. Nada sale a internet.

Para montar un servidor en casa, el camino habitual hoy es Node:

- **En Windows**: se descarga el instalador de nodejs.org y se pulsa siguiente, o desde la terminal con \`winget install OpenJS.NodeJS.LTS\`. Después hay que **abrir una terminal nueva**: la que ya estaba abierta no se entera de que Node existe, porque el listado de programas disponibles se lee al arrancarla.
- **En Linux**: \`sudo apt install nodejs npm\` en Debian o Ubuntu, o el gestor que traiga tu distribución. Conviene mirar la versión, porque algunos repositorios van muy por detrás.

Con Node instalado, un servidor de ficheros es una orden:

    npx serve

Y ya tienes tu carpeta publicada en \`http://localhost:3000\`.

**Por qué esto no es lo mismo que abrir el fichero.** Si haces doble clic en tu \`index.html\`, se abre con \`file:///C:/…\`. La página se ve, pero no hay servidor: no hay peticiones, no hay códigos de estado, y \`fetch\` no funciona porque el navegador prohíbe leer ficheros del disco desde una página. Por eso todo lo que hemos hecho va por \`http://\` aunque sea en tu propia máquina.

**Y el mundo de antes.** Durante años, montar esto en casa significaba instalar **XAMPP** (Apache, MySQL y PHP de golpe) o configurar **nginx** a mano. Sigue siendo perfectamente válido, y en muchas empresas es lo que hay. La diferencia con lo que usamos aquí es que en Cloudflare **no se instala nada**: no hay una máquina tuya que mantener, ni un servicio que arrancar, ni actualizaciones de seguridad que aplicar. Tú entregas código y ellos lo ejecutan cuando alguien pregunta.

Eso tiene un precio, y conviene saberlo: no puedes instalar lo que te dé la gana, y algunas cosas —como hashear contraseñas en condiciones— no caben en el tiempo de CPU que te dan. Todo son intercambios.`,
  },

  pasos: [
    eleccion({
      id: '9-1',
      titulo: 'Un 404 en el registro',
      enunciado:
        'Estás mirando el registro de tu servidor y ves esta línea: <code>GET /css/estilo.css 404</code>. ¿Qué ha pasado?',
      pista: 'Fíjate en la primera cifra del número. Dice de quién es el problema.',
      opciones: [
        {
          texto: 'Alguien pidió ese fichero y el servidor no lo tiene en esa ruta.',
          correcta: true,
          porque:
            'Eso es. Y fíjate en el nombre: si tu fichero se llama estilos.css, en plural, esta petición nunca lo encontrará. Los 404 en el registro son la mejor pista de un enlace mal escrito.',
        },
        {
          texto: 'El servidor ha reventado al intentar servirlo.',
          porque:
            'No: eso sería un 500. La familia 4xx dice que el problema está en la petición; la 5xx, que está en el servidor. Esa frontera te ahorra mucho tiempo de búsqueda.',
        },
        {
          texto: 'El fichero existe pero quien lo pidió no tiene permiso.',
          porque:
            'Eso sería un 403. El 404 dice que no hay nada ahí; el 403 dice que sí lo hay pero no es para ti.',
        },
        {
          texto: 'El CSS tiene un error de sintaxis.',
          porque:
            'El servidor no lee el CSS: solo lo entrega. Un error dentro del fichero no cambiaría el código de la respuesta, que seguiría siendo 200.',
        },
      ],
    }),

    eleccion({
      id: '9-2',
      titulo: 'Doble clic en el fichero',
      enunciado:
        'Abres tu <code>index.html</code> haciendo doble clic. La página se ve bien, pero el <code>fetch</code> del mundo anterior ya no carga los datos. ¿Por qué?',
      pista: 'Mira la barra de direcciones del navegador y compárala con la de la vista previa.',
      opciones: [
        {
          texto: 'Al abrirlo así va por file:// y no hay ningún servidor al que pedirle nada.',
          correcta: true,
          porque:
            'Exacto. Sin servidor no hay peticiones HTTP, y el navegador además prohíbe que una página lea ficheros del disco. Por eso todo esto va por http:// aunque sea en tu propio ordenador.',
        },
        {
          texto: 'Porque hace falta internet y no estás conectado.',
          porque:
            'No hace falta internet: localhost es tu propia máquina y funciona sin conexión. Lo que falta es un servidor, no la red.',
        },
        {
          texto: 'Porque el fichero JSON está mal escrito.',
          porque:
            'Si fuera eso, también fallaría en la vista previa. La diferencia entre los dos casos es cómo se abre la página, no su contenido.',
        },
        {
          texto: 'Porque el navegador no sabe leer JSON desde el disco.',
          porque:
            'Sabría, técnicamente. Lo que ocurre es que tiene prohibido hacerlo por seguridad: si no, cualquier página que abrieras podría leerse tus ficheros.',
        },
      ],
    }),

    eleccion({
      id: '9-3',
      titulo: 'Los dos puntos y el número',
      enunciado: '¿Qué significa exactamente el <code>:3000</code> de <code>http://localhost:3000</code>?',
      pista: 'Una misma máquina puede tener varios programas escuchando a la vez.',
      opciones: [
        {
          texto: 'El puerto: cuál de los programas que escuchan en esa máquina tiene que atender.',
          correcta: true,
          porque:
            'Eso es. Por eso puedes tener el taller en el 5274 y el servidor en el 8787 a la vez, en el mismo ordenador, sin que se pisen.',
        },
        {
          texto: 'Cuántos milisegundos hay que esperar antes de darse por vencido.',
          porque: 'No: eso sería un tiempo de espera, y no se pone en la dirección.',
        },
        {
          texto: 'La versión del servidor.',
          porque: 'La versión no viaja en la dirección. Si acaso, en una cabecera de la respuesta.',
        },
        {
          texto: 'Un identificador que Node inventa al arrancar.',
          porque:
            'El número lo eliges tú al arrancar el programa. Que 3000 sea tan común es pura costumbre, no una regla.',
        },
      ],
    }),

    eleccion({
      id: '9-4',
      titulo: 'Dos pulsaciones al botón',
      enunciado:
        'Vas a montar el botón de votar. Alguien va a pulsarlo dos veces seguidas sin querer. ¿Qué verbo hace que su voto siga siendo uno?',
      pista: 'La palabra que buscas es "idempotente": repetirlo no cambia el resultado.',
      opciones: [
        {
          texto: 'PUT, porque significa "deja esto así" y repetirlo no añade nada.',
          correcta: true,
          porque:
            'Correcto. PUT describe un estado final, no una acción que se acumula. Por eso el catálogo de este taller usa PUT para votar: pulses las veces que pulses, tu voto es uno.',
        },
        {
          texto: 'POST, porque es el que se usa para enviar datos.',
          porque:
            'POST vale para enviar, pero significa "crea algo nuevo". Dos pulsaciones, dos votos. Es justo lo que hay que evitar aquí.',
        },
        {
          texto: 'GET, porque es el más rápido.',
          porque:
            'GET no debe cambiar nada nunca. Si votar fuera un GET, cualquier cosa que recorra enlaces —un buscador, el navegador precargando— podría votar sin querer.',
        },
        {
          texto: 'Da igual el verbo: eso se arregla desactivando el botón.',
          porque:
            'Desactivar el botón ayuda, pero solo protege del ratón. La petición se puede repetir desde otro sitio, y la red reintenta sola. La garantía tiene que estar en el servidor.',
        },
      ],
    }),
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Quédate con la frontera entre el 4 y el 5. Cuando algo falle, ese primer dígito te dice si tienes que mirar lo que pediste ' +
      'o lo que hay al otro lado. Empezar buscando en el sitio correcto es la mitad del trabajo.',
  },
}
