// Los sombreros escondidos por el taller.
//
// Un coleccionable no vale nada si se consigue haciendo clic en un píxel raro.
// Estos se ganan HACIENDO cosas: ejecutar las pruebas, exportar la web, abrir
// las herramientas del navegador, poner un `:key` sin que nadie te lo pida.
// Cada escondite enseña algo que la lección no llega a decir, o premia algo
// que ninguna comprobación puede medir, como la terquedad.
//
// Nada de lo que hay aquí es obligatorio ni bloquea el temario: si no encuentra
// ni uno, el curso funciona igual. Son un motivo para curiosear.
//
// La `pista` se enseña en la sombrerera junto a la silueta del que falta. Tiene
// que insinuar sin resolver: si al leerla ya sabes exactamente qué pulsar, está
// mal escrita.
//
// El `wayne` es lo que dice al encontrarlo. Diálogo original, como siempre.

const sombreros = [
  {
    id: 'bombin-de-la-terminal',
    nombre: 'El bombín de la terminal',
    pista: 'Hay una caja negra debajo del editor. Nadie ha comprobado nunca si esto se rompe.',
    wayne:
      'Has abierto la caja negra y encima has mirado si algo se rompía. Eso ya no es tocar botones, eso es oficio.',
  },
  {
    id: 'panama-del-que-publica',
    nombre: 'El panamá del que publica',
    pista: 'Una web que no sale de tu ordenador no es una web, es un secreto.',
    wayne:
      'Lo que acaba de salir de ahí es tuyo y funciona en cualquier sitio del mundo. Quédate el panamá, que es de los caros.',
  },
  {
    id: 'gorra-de-las-tripas',
    nombre: 'La gorra de las tripas',
    pista: 'Tu página tiene tripas. Hay una tecla, de las de arriba del todo, que las enseña.',
    wayne:
      'Ahí dentro está lo que el navegador piensa de verdad de tu página. Da cosa la primera vez, luego ya no lo cierras nunca.',
  },
  {
    id: 'sombrero-de-la-llave',
    nombre: 'El sombrero de la llave',
    pista: 'Cuando pintas una lista, cada cosa quiere su nombre propio. Pónselo antes de que te lo manden.',
    wayne:
      'Le has puesto la llave a la lista sin que nadie te lo pidiera. Eso es leerse las cosas por gusto, y eso ya me da hasta respeto.',
  },
  {
    id: 'sombrero-de-steris',
    nombre: 'El sombrero de Steris',
    pista: 'Steris tiene un cajón con todas sus fichas ordenadas. Búscale una tú, sin que ninguna lección te mande.',
    wayne:
      'Le has ido a buscar una ficha a Steris por tu cuenta. Dice que le parece estupendo, y viniendo de ella eso es una fiesta con confeti.',
  },
  {
    id: 'sombrero-del-terco',
    nombre: 'El sombrero del terco',
    pista: 'Este no se gana acertando.',
    wayne:
      'Cinco veces mal y a la sexta fuera. Mira, el talento está muy bien, pero yo apuesto por quien no se levanta de la silla.',
  },
  {
    id: 'sombrero-de-medianoche',
    nombre: 'El sombrero de medianoche',
    pista: 'Hay una hora a la que ya nadie programa por obligación.',
    wayne:
      'Ni mires el reloj. A estas horas el código sale distinto, y de vez en cuando sale mejor.',
  },
  {
    id: 'sombrero-de-dentro',
    nombre: 'El sombrero de dentro',
    pista: 'En un fichero se puede hablar sin que el ordenador conteste. Prueba a preguntar si hay alguien.',
    wayne:
      'Sí que hay alguien. Siempre hay alguien. Toma sombrero por preguntar, que preguntar es medio oficio.',
  },
  {
    id: 'sombrero-de-armonia',
    nombre: 'El sombrero de Armonía',
    pista: 'Aquí hay quien contesta preguntas y casi nunca da la respuesta.',
    wayne:
      'Le has preguntado a Armonía. Yo evito hacerlo, porque luego me deja pensando y así no se puede trabajar.',
  },
  {
    id: 'sombrero-del-que-ordena',
    nombre: 'El sombrero del que ordena',
    pista: 'Las columnas de esta ventana no son de piedra.',
    wayne:
      'Has movido los muebles de sitio. Muy bien. Esto es tu taller, no un museo con las sillas atornilladas.',
  },
  {
    id: 'sombrero-limpio',
    nombre: 'El sombrero limpio',
    pista: 'Un mundo entero, de principio a fin, sin fallar ni una sola vez.',
    wayne:
      'Un mundo entero sin un tropiezo. Sospechoso. ¿Seguro que no lo habías hecho antes en otra vida?',
  },
  {
    id: 'sombrero-de-las-tablas',
    nombre: 'El sombrero de las tablas',
    pista: 'Hay un sitio donde se le pregunta a los datos a la cara, sin intermediarios.',
    wayne:
      'Le has preguntado a la base de datos directamente. Se acabó lo de pedir las cosas por favor.',
  },
  {
    id: 'sombrero-del-que-vuelve',
    nombre: 'El sombrero del que vuelve',
    pista: 'Este no se gana en un día. Literalmente.',
    wayne:
      'Tres días distintos por aquí. Eso ya no es entusiasmo, eso es costumbre, y la costumbre es la que acaba construyendo cosas.',
  },
  {
    id: 'sombrero-del-gato',
    nombre: 'El sombrero del gato',
    pista: 'En otro taller hubo gatos y croquetas. Alguno se ha colado aquí; prueba a llamarlo.',
    wayne:
      'Anda, un gato. No preguntes de dónde ha salido, que la historia es larga y acaba en croquetas.',
  },
  {
    id: 'sombrero-de-la-apuesta',
    nombre: 'El sombrero de la apuesta',
    pista: 'A mí me gusta apostar. Gáname cinco seguidas y hablamos.',
    wayne:
      'Cinco seguidas. Vale, lo admito: me has ganado. Toma el sombrero y no lo vayas contando por ahí.',
  },
]

export default sombreros

/** Un sombrero por su identificador, o null si no existe. */
export function sombreroPorId(id) {
  return sombreros.find((s) => s.id === id) || null
}

/** Los identificadores válidos, para validar lo que llega de fuera. */
export const IDS = sombreros.map((s) => s.id)
