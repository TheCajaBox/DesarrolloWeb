// Mundo 14 — Vue y que se mueva.
//
// NOTA HONESTA sobre este mundo: es de entender, no de teclear. Ejecutar Vue
// dentro del sandbox del taller es posible pero costoso, y hacerlo a medias
// —comprobando plantillas con expresiones regulares— seria justo lo que el
// documento de diseno prohibe: aprobar codigo que no funciona y suspender
// codigo que si.
//
// Asi que aqui se explica por que existen los frameworks y como piensan, con
// pasos de entender. Cuando el taller pueda montar componentes de verdad, este
// mundo se reescribe con pasos de escribir. Queda anotado.
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
    <p>Este mundo es de entender cómo piensa un framework.</p>
    <p>Lo que aprendas aquí se aplica a Vue, a React y a los que vengan.</p>
  </body>
</html>
`

export default {
  numero: 14,
  acto: 'Ponerlo en el mundo',
  titulo: 'Mundo 14 · Vue y que se mueva',

  entradilla: {
    quien: 'wayne',
    texto:
      'Llevas ocho mundos moviendo elementos a mano, uno por uno. Funciona. También funcionaría ir a Elendel andando. ' +
      'A veces conviene mirar si hay un tren.',
  },

  ficheros: { 'index.html': HTML_BASE },
  solucion: { 'index.html': HTML_BASE },

  apunte: {
    quien: 'wax',
    titulo: 'Por qué existen los frameworks, y qué te ahorran',
    cuerpo: `En el Mundo 8 escribiste esto, o algo muy parecido:

    rejilla.textContent = "";
    for (const s of sombreros) {
      const ficha = document.createElement("article");
      const titulo = document.createElement("h2");
      titulo.textContent = s.nombre;
      ficha.appendChild(titulo);
      rejilla.appendChild(ficha);
    }

Funciona. Y tiene un problema que no se ve con tres sombreros: **cada vez que cambia un solo dato, hay que repintarlo todo**.

Repintar todo es caro y, sobre todo, destruye estado. Si alguien estaba escribiendo en un campo, pierde lo escrito. Si había una animación a medias, se corta. Si había algo desplegado, se cierra.

La alternativa manual es peor: llevar la cuenta a mano de qué elemento corresponde a qué dato para tocar solo lo que cambió. Eso, en cuanto la interfaz crece, se convierte en el noventa por ciento del código y en el noventa por ciento de los fallos.

**Qué hace un framework.** Le das dos cosas: los datos, y una plantilla que describe **cómo se ven esos datos**. Él se encarga de que la pantalla coincida siempre con los datos.

    <article v-for="sombrero in sombreros" :key="sombrero.id">
      <h2>{{ sombrero.nombre }}</h2>
      <p>{{ sombrero.descripcion }}</p>
    </article>

Y en el código, los datos:

    const sombreros = ref([...]);

Cuando cambias \`sombreros\`, la pantalla se actualiza sola. No hay \`createElement\` ni \`appendChild\`: hay una descripción de cómo debe verse, y el framework calcula la diferencia mínima entre lo que hay y lo que debería haber, y solo toca eso.

**El cambio mental.** Dejas de escribir *"cuando pase esto, modifica aquello"* y pasas a escribir *"esto siempre se ve así"*. Es la misma clase de salto que dio el CSS respecto a colocar cosas a mano: describir el resultado en vez de los pasos.

**Reactividad.** \`ref\` envuelve un valor para que el framework se entere cuando cambia. Se lee y se escribe con \`.value\` en el código, y sin él en la plantilla:

    const votos = ref(0);
    votos.value = votos.value + 1;   // la pantalla se actualiza sola

**La clave, \`:key\`.** Ese \`:key="sombrero.id"\` no es decorativo. Es cómo el framework sabe qué elemento de la pantalla corresponde a qué dato cuando la lista cambia de orden o se borra algo del medio.

Sin clave —o con el índice del array como clave, que es el error clásico— al borrar el primer elemento el framework cree que todos han cambiado de contenido en vez de que uno ha desaparecido. Resultado: el estado interno se queda en el elemento equivocado, y si había un campo de texto escrito, el texto salta a otra fila. Usa siempre algo que identifique al dato, no su posición.

**Componentes.** Una ficha de sombrero es una plantilla más su comportamiento, en un solo fichero, reutilizable. La página deja de ser un HTML enorme y pasa a ser componentes que se componen.

Se comunican en dos direcciones, y solo dos:

- **Props**, hacia abajo: el padre le pasa datos al hijo.
- **Eventos**, hacia arriba: el hijo avisa de que ha pasado algo, y el padre decide qué hacer.

Un hijo **no** modifica los datos de su padre. Avisa. Eso parece burocracia y es lo que permite entender una interfaz grande: para saber quién cambió un dato, basta con mirar dónde vive ese dato.

**Animaciones que no marean.** Un framework sabe cuándo un elemento entra y sale, y eso permite animarlo sin escribir la coreografía a mano. Dos reglas: que sean cortas —150 a 300 milisegundos— y que **respeten a quien ha pedido que no se mueva nada**:

    @media (prefers-reduced-motion: reduce) {
      * { transition-duration: 0.01ms !important; }
    }

Esa regla no es un detalle de accesibilidad opcional. Hay gente a la que el movimiento le provoca mareo de verdad, y lo ha configurado en su sistema. Ignorarlo es decidir que su malestar importa menos que tu animación.

**¿Y hace falta siempre?** No. Para una página de tres fichas, no. El framework se paga solo cuando hay estado que mantener y muchas partes que dependen de él. Lo importante es que ahora sabes hacerlo a mano, así que puedes decidir con criterio en vez de por costumbre.`,
  },

  pasos: [
    eleccion({
      id: '14-1',
      titulo: 'Qué te ahorra exactamente',
      enunciado:
        'En el Mundo 8 vaciabas la rejilla y la repintabas entera cada vez. ¿Cuál es el problema real de hacerlo así?',
      pista: 'Piensa en qué había en pantalla justo antes de repintar.',
      opciones: [
        {
          texto: 'Que destruye el estado: lo escrito en un campo, lo desplegado, una animación a medias.',
          correcta: true,
          porque:
            'Eso es lo grave. La lentitud se nota con listas enormes, pero el estado se pierde con tres elementos. Un framework calcula la diferencia mínima y solo toca lo que cambió.',
        },
        {
          texto: 'Que el código queda más largo.',
          porque:
            'Queda más largo, sí, pero eso es una molestia, no un fallo. Podrías vivir con código largo; no puedes vivir con que a la gente se le borre lo que está escribiendo.',
        },
        {
          texto: 'Que no funciona en móviles.',
          porque: 'Funciona igual en cualquier navegador. El problema no es de compatibilidad.',
        },
        {
          texto: 'Que no se puede usar CSS con elementos creados desde JavaScript.',
          porque:
            'Sí se puede: al navegador le da igual quién creó un elemento. El CSS se aplica exactamente igual.',
        },
      ],
    }),

    eleccion({
      id: '14-2',
      titulo: 'La clave de la lista',
      enunciado:
        'Escribes <code>v-for="s in sombreros" :key="indice"</code> usando la posición en el array. Borras el <strong>primer</strong> sombrero. ¿Qué pasa?',
      pista: 'Al borrar el primero, todos los demás cambian de posición.',
      opciones: [
        {
          texto: 'El framework cree que todos cambiaron de contenido, y el estado se queda en la fila equivocada.',
          correcta: true,
          porque:
            'Exacto. La clave le dice qué elemento de pantalla es cada dato. Si la clave es la posición, al borrar el primero todas las posiciones se desplazan y el framework no ve una baja: ve que todos cambiaron. Lo que hubiera escrito en un campo salta de fila.',
        },
        {
          texto: 'Nada: el índice sirve igual que el id.',
          porque:
            'Sirve mientras la lista no cambie de orden ni pierda elementos del medio. Es decir, mientras no pase nada interesante.',
        },
        {
          texto: 'Da un error y no se pinta la lista.',
          porque:
            'Ojalá: un error se ve y se arregla. Lo malo es que funciona en apariencia y falla de forma sutil, que es mucho más difícil de encontrar.',
        },
        {
          texto: 'Se pinta la lista al revés.',
          porque: 'El orden se respeta. Lo que se descoloca es el estado interno de cada elemento, no su posición.',
        },
      ],
    }),

    eleccion({
      id: '14-3',
      titulo: 'Quién cambia los datos',
      enunciado:
        'Una ficha de sombrero tiene su botón de votar. Al pulsarlo hay que actualizar la lista, que vive en el componente padre. ¿Qué hace la ficha?',
      pista: 'Props hacia abajo, eventos hacia arriba. Y solo eso.',
      opciones: [
        {
          texto: 'Emite un evento diciendo que se ha votado, y el padre decide qué hacer.',
          correcta: true,
          porque:
            'Eso es. El hijo avisa y el padre manda, porque el dato es suyo. Gracias a eso, para saber quién cambia una lista basta con mirar el componente donde vive, en vez de rastrear toda la aplicación.',
        },
        {
          texto: 'Modifica directamente la lista que le llegó por props.',
          porque:
            'Funcionaría a veces, y ese "a veces" es lo peor. Cuando cinco componentes puedan modificar el mismo dato, averiguar quién lo dejó mal se vuelve imposible. Por eso las props son de solo lectura.',
        },
        {
          texto: 'Guarda el voto en una variable global que lean todos.',
          porque:
            'Una variable global es el mismo problema sin ninguna de las ventajas: cualquiera escribe y nadie sabe quién. Existen almacenes compartidos como Pinia justo para hacer eso de forma ordenada.',
        },
        {
          texto: 'Recarga la página para que se vea el cambio.',
          porque:
            'Eso deshace todo el trabajo: se pierde el estado, la posición del scroll y cualquier cosa a medias. Es volver al punto de partida.',
        },
      ],
    }),

    eleccion({
      id: '14-4',
      titulo: 'La animación y quien no puede con ella',
      enunciado:
        'Añades una transición al votar. ¿Qué tienes que hacer para no perjudicar a quien tiene configurado en su sistema que no quiere movimiento?',
      pista: 'El sistema operativo ya lo dice; el CSS puede preguntarlo.',
      opciones: [
        {
          texto: 'Respetar prefers-reduced-motion y dejar las transiciones prácticamente en cero.',
          correcta: true,
          porque:
            'Eso es. El sistema ya expone esa preferencia y el CSS puede consultarla. Hay gente a la que el movimiento le provoca mareo real, y lo ha configurado a propósito. Son tres líneas.',
        },
        {
          texto: 'Poner un botón de "desactivar animaciones" en los ajustes.',
          porque:
            'Mejor que nada, pero obliga a buscarlo en cada web. Esa persona ya lo dijo una vez, en su sistema, y su navegador lo transmite. Basta con escucharlo.',
        },
        {
          texto: 'Usar animaciones cortas, de menos de 300 ms.',
          porque:
            'Que sean cortas está bien y es buena práctica, pero no resuelve esto: el problema es el movimiento en sí, no su duración.',
        },
        {
          texto: 'Nada: es cosa del navegador, que ya las desactiva solo.',
          porque:
            'El navegador no desactiva nada por su cuenta: solo expone la preferencia. Si tu CSS no la consulta, tus animaciones se ejecutan igual.',
        },
      ],
    }),
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Lo importante no es Vue: es la idea de describir el resultado en vez de los pasos. React lo hace distinto y piensa igual. ' +
      'Y como sabes hacerlo a mano, ahora puedes decidir cuándo compensa y cuándo es matar moscas a cañonazos.',
  },
}
