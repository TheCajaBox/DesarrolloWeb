// Mundo 15 — Del repositorio a internet.
//
// El ultimo. Cierra el circulo: explica como el codigo que se escribe en una
// carpeta acaba siendo una direccion que puede abrir cualquiera. Es teoria,
// como el 9, porque aqui no hay nada que teclear: hay cosas que entender.
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
    <p>Último mundo. Este es de entender cómo llega todo esto a internet.</p>
  </body>
</html>
`

export default {
  numero: 15,
  acto: 'Ponerlo en el mundo',
  titulo: 'Mundo 15 · Del repositorio a internet',

  entradilla: {
    quien: 'wayne',
    texto:
      'Último. Hasta ahora todo lo que has hecho existe solo para ti, que es como tener un sombrero buenísimo ' +
      'y no salir de casa. Vamos a ver cómo sale a la calle.',
  },

  ficheros: { 'index.html': HTML_BASE },
  solucion: { 'index.html': HTML_BASE },

  apunte: {
    quien: 'wax',
    titulo: 'De tu carpeta a una dirección que abre cualquiera',
    cuerpo: `Todo lo que has construido existe en una carpeta. Para que exista para los demás hacen falta tres cosas: guardar el historial, llevarlo a un servidor, y que un nombre apunte ahí.

**Git no es una copia de seguridad.** Es un registro de cambios. Guarda **qué cambió, cuándo y por qué**, y eso permite algo que una copia no permite: volver a un punto concreto, ver qué se rompió entre dos versiones, y trabajar dos personas a la vez sin pisarse.

Un **commit** es una foto del proyecto con un mensaje. El mensaje importa más de lo que parece: dentro de seis meses, "arreglos varios" no le sirve a nadie, y "corrige el conteo de votos cuando un sombrero no tiene ninguno" te ahorra media hora.

Las órdenes que se usan el noventa por ciento del tiempo:

    git status              qué he tocado
    git add .               preparo esto para guardarlo
    git commit -m "..."     lo guardo con su explicación
    git log                 qué se ha hecho hasta ahora
    git diff                qué ha cambiado exactamente

**Las ramas.** Una rama es una línea de trabajo paralela. Se abre una para cada cosa que se prueba, y si sale mal se tira sin haber tocado lo que funcionaba. Cuando sale bien, se junta con la principal.

**El repositorio remoto.** Tu repositorio vive en tu ordenador. Un remoto —GitHub, GitLab— es una copia en un servidor que hace de punto de encuentro. \`git push\` sube tus commits; \`git pull\` se trae los de los demás.

Y aquí está la palanca: **un remoto puede reaccionar a que subas algo**.

**CI/CD, sin la jerga.** Configuras que, cada vez que llegue un commit a la rama principal, un servidor haga automáticamente esto:

1. Se descarga tu código.
2. Instala lo que hace falta.
3. **Ejecuta las pruebas.**
4. Si pasan, construye la versión final y la despliega.
5. Si fallan, para y avisa. Nadie despliega nada roto.

Ese tercer paso es la razón de que merezca la pena escribir pruebas. Una prueba que se ejecuta cuando te acuerdas no protege nada; una que corre sola en cada commit no deja pasar el error.

**Cómo un nombre llega a un servidor.** Alguien escribe \`elsombrerodewayne.com\`. Entonces:

1. Su navegador pregunta al **DNS**: ¿qué número tiene ese nombre?
2. El DNS contesta una IP.
3. El navegador abre una conexión con esa IP, al puerto 443.
4. Antes de pedir nada, comprueba el **certificado**: que quien contesta es de verdad quien dice ser, y cifra la conversación. Eso es la "s" de HTTPS.
5. Ya sí, pide la página.

**Qué es un CDN.** Una red de servidores repartidos por el mundo con copias de tus ficheros. Quien entra desde Lisboa recibe la copia de Lisboa, no la de Virginia. Menos distancia, menos espera. Y como los ficheros estáticos se sirven desde ahí, tu servidor de verdad se despierta muchas menos veces.

Cuando en este proyecto se dice que los ficheros estáticos son gratis e ilimitados, es por esto: los sirve la red de reparto y nunca llegan a invocar el Worker.

**Qué pasa exactamente al desplegar esto.** Cuando alguien ejecuta \`wrangler deploy\`:

1. Se empaqueta tu código en un solo fichero.
2. Se sube junto con los ficheros estáticos.
3. Cloudflare lo distribuye por sus servidores de todo el mundo.
4. En unos segundos, la versión nueva contesta en todas partes.

No hay una máquina que reiniciar ni un servicio que arrancar. Y hay una consecuencia importante: **cada despliegue queda registrado y se puede volver atrás**. Si algo sale mal en producción, lo primero no es arreglarlo con prisa: es volver a la versión anterior, y arreglarlo con calma después.

**Lo que nunca sube al repositorio.** Contraseñas, claves de API, ficheros de configuración con datos privados. Para eso está \`.gitignore\`. Y ojo: borrar una clave y hacer un commit **no la borra del historial**, que es precisamente lo que un repositorio guarda para siempre. Si se sube una clave, hay que darla por comprometida y cambiarla.`,
  },

  pasos: [
    eleccion({
      id: '15-1',
      titulo: 'El mensaje del commit',
      enunciado:
        'Has arreglado que los sombreros sin votos salieran con media 0 en vez de sin nota. ¿Cuál de estos mensajes de commit sirve de algo dentro de seis meses?',
      pista: 'Piensa en quién va a leerlo: alguien buscando cuándo se rompió algo, sin recordar nada de este día.',
      opciones: [
        {
          texto: '"Los sombreros sin votos ahora muestran «sin nota» en vez de 0"',
          correcta: true,
          porque:
            'Eso es. Dice qué cambió el comportamiento, en lenguaje de quien usa la web. Es lo que sirve al leer el historial buscando cuándo apareció algo.',
        },
        {
          texto: '"arreglos"',
          porque:
            'Todos los commits son arreglos. En un historial de doscientos, este no distingue nada, y encontrar el cambio obliga a mirar el código de todos.',
        },
        {
          texto: '"cambio AVG por COALESCE en la línea 42 de catalogo.js"',
          porque:
            'Eso ya lo dice el diff, y con más precisión. El mensaje debe decir el porqué, que es lo único que el código no puede contar por sí mismo. Además, la línea 42 dejará de serlo mañana.',
        },
        {
          texto: '"por fin funciona!!!"',
          porque:
            'Cuenta cómo te sentías, que es legítimo, pero no qué hiciste. Dentro de seis meses no te va a ayudar a encontrar nada.',
        },
      ],
    }),

    eleccion({
      id: '15-2',
      titulo: 'La clave que se subió',
      enunciado:
        'Alguien subió por error una clave de API en un commit. Se da cuenta, la borra del fichero y hace otro commit. ¿Está resuelto?',
      pista: 'Piensa en qué es exactamente lo que guarda un repositorio.',
      opciones: [
        {
          texto: 'No: sigue en el historial, y hay que dar la clave por comprometida y cambiarla.',
          correcta: true,
          porque:
            'Exacto. Un repositorio guarda todas las versiones: la clave está en el commit anterior y ahí seguirá. Se puede reescribir el historial, pero si el repositorio es público hay que asumir que alguien ya la copió. Lo único seguro es revocarla.',
        },
        {
          texto: 'Sí: en la versión actual del fichero ya no está.',
          porque:
            'La versión actual no es lo único que hay. Todo el sentido de git es conservar las anteriores, y en una de ellas está la clave, a un solo comando de distancia.',
        },
        {
          texto: 'Sí, siempre que el repositorio sea privado.',
          porque:
            'Que sea privado reduce el riesgo, no lo elimina: sigue estando ahí para todo el que tenga o llegue a tener acceso, hoy o dentro de tres años. Y los repositorios cambian de visibilidad.',
        },
        {
          texto: 'Basta con añadir el fichero al .gitignore.',
          porque:
            '.gitignore evita que se suba lo que todavía no se ha subido. No toca lo que ya está en el historial.',
        },
      ],
    }),

    eleccion({
      id: '15-3',
      titulo: 'Rojo en producción',
      enunciado:
        'Acabas de desplegar y el catálogo devuelve error a todo el mundo. Tienes el arreglo medio escrito y crees que en diez minutos lo tienes. ¿Qué haces primero?',
      pista: 'Cada minuto que pasa, el sitio está caído para todos.',
      opciones: [
        {
          texto: 'Vuelvo a la versión anterior, y arreglo con calma después.',
          correcta: true,
          porque:
            'Eso es. El sitio vuelve a funcionar en segundos y el arreglo deja de tener prisa. Arreglar con la web caída es cuando se cometen los errores de verdad. Por eso los despliegues quedan registrados y se puede volver atrás.',
        },
        {
          texto: 'Termino el arreglo y despliego. Son diez minutos.',
          porque:
            'Diez minutos estimados con prisa suelen ser treinta reales, y el sitio caído todo ese rato. Además, un arreglo escrito con urgencia es justo el que introduce el siguiente fallo.',
        },
        {
          texto: 'Miro los registros para entenderlo bien antes de tocar nada.',
          porque:
            'Entenderlo es imprescindible, pero no antes de restaurar el servicio. Vuelve atrás primero y luego investiga todo lo que haga falta, ya sin nadie esperando.',
        },
        {
          texto: 'Aviso a la gente de que está caído y sigo con lo mío.',
          porque:
            'Avisar está bien y no sustituye a arreglarlo. Si hay una versión anterior que funciona, dejarlo caído es una decisión, no una fatalidad.',
        },
      ],
    }),

    eleccion({
      id: '15-4',
      titulo: 'Por qué los estáticos son gratis',
      enunciado:
        'En este proyecto, los ficheros estáticos no cuentan contra el límite de 100.000 peticiones diarias. ¿Por qué?',
      pista: 'Piensa en quién contesta realmente esas peticiones.',
      opciones: [
        {
          texto: 'Porque los sirve la red de reparto y nunca llegan a invocar tu código.',
          correcta: true,
          porque:
            'Eso es. Un CDN tiene copias repartidas por el mundo y responde desde la más cercana. Tu Worker ni se entera. Por eso solo cuentan las llamadas a /api/*, que sí ejecutan código tuyo.',
        },
        {
          texto: 'Porque son ficheros pequeños y no cuesta servirlos.',
          porque:
            'El tamaño no es la razón: un vídeo grande tampoco contaría. Lo que decide es si hay que ejecutar tu código o no.',
        },
        {
          texto: 'Porque Cloudflare los cachea en el navegador de quien entra.',
          porque:
            'La caché del navegador ayuda a quien repite, pero no explica la primera visita de cada persona. Lo que las hace gratis es que las responde la red, no tu Worker.',
        },
        {
          texto: 'Porque es una promoción del plan gratuito y puede cambiar.',
          porque:
            'No es una promoción, es una consecuencia de cómo funciona: si nadie ejecuta código, no hay nada que cobrar por ejecutarlo.',
        },
      ],
    }),
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Y ya está. Empezaste cambiando una palabra en un fichero de texto y has acabado sabiendo cómo llega eso a la pantalla de otro. ' +
      'No es poco. Ahora ve y construye algo tuyo, que para eso era todo esto. Yo me quedo con los sombreros.',
  },
}
