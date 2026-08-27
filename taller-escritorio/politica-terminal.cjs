// Qué puede y qué no puede hacer la terminal del taller.
//
// Decisión tomada: se ejecuta cualquier comando sobre el proyecto, pero NO se
// baja nada de internet. El taller entero se hace sin red (vue, vue-router y
// pinia ya están dentro), y así un copiar-pegar de un tutorial cualquiera no
// mete un paquete raro en el ordenador de quien aprende.
//
// Cuando se bloquea algo no se dice "no" y se calla: se explica cómo hacerlo
// bien, fuera de la app, y de quién es la responsabilidad.
//
// Vive en su propio fichero, y no dentro de main.cjs, para que se pueda probar:
// una regla de seguridad sin pruebas es una intención.

const PIDEN_INTERNET = [
  {
    // `npm install`, `npm i`, `npm add`, `npm ci`. Ojo al orden: hay que
    // dejar pasar `npm run install-algo` y `npm test`.
    patron: /^\s*npm\s+(i|in|ins|inst|install|add|ci)(\s|$)/i,
    que: 'instalar paquetes de npm',
  },
  {
    patron: /^\s*(npx|yarn|pnpm|bun)(\s|$)/i,
    que: 'descargar y ejecutar paquetes',
  },
  {
    patron: /^\s*git\s+(clone|push|pull|fetch|remote)(\s|$)/i,
    que: 'hablar con un repositorio remoto',
  },
  {
    patron: /(^|[\s|;&])(curl|wget|iwr|invoke-webrequest|bitsadmin|certutil)(\s|$)/i,
    que: 'descargar ficheros de internet',
  },
]

// Códigos de color, por nombre: en el fuente no se ponen caracteres invisibles.
const ESC = String.fromCharCode(27)
const c = {
  fin: `${ESC}[0m`,
  negrita: `${ESC}[1m`,
  tenue: `${ESC}[90m`,
  amarillo: `${ESC}[33m`,
  azul: `${ESC}[36m`,
  subrayado: `${ESC}[4m`,
}

/**
 * ¿Este comando necesita internet? Devuelve la regla que lo caza, o null.
 */
function pideInternet(comando) {
  const texto = String(comando || '')
  return PIDEN_INTERNET.find((regla) => regla.patron.test(texto)) || null
}

/**
 * El texto que se pinta en la terminal cuando algo se bloquea. Dice qué pasa,
 * cómo hacerlo bien y de quién es la responsabilidad.
 */
function avisoDeInternet(comando, que, carpetaDelProyecto) {
  return [
    '',
    `${c.amarillo}Aquí no.${c.fin} «${String(comando).trim()}» necesita internet, y esta terminal`,
    '   trabaja sin red a propósito.',
    '',
    `   Para el taller no hace falta: ${c.azul}vue${c.fin}, ${c.azul}vue-router${c.fin} y ${c.azul}pinia${c.fin} ya están`,
    '   en tu proyecto. Los treinta y seis mundos se hacen sin bajar nada.',
    '',
    `   Si de verdad necesitas ${que}, eso se hace ${c.negrita}fuera de esta aplicación${c.fin}:`,
    '',
    `     1. Instala Node.js desde su web oficial: ${c.subrayado}https://nodejs.org${c.fin} (versión LTS)`,
    '     2. Abre la terminal de Windows en la carpeta de tu proyecto:',
    `        ${c.tenue}${carpetaDelProyecto}${c.fin}`,
    '     3. Ejecuta ahí el comando.',
    '',
    `   ${c.amarillo}Ojo:${c.fin} lo que instales de internet entra bajo tu responsabilidad. Comprueba`,
    `   que el paquete es el oficial y que viene de ${c.subrayado}npmjs.com${c.fin} o de la web del`,
    '   proyecto, no del enlace de un tutorial: al instalarse, un paquete puede',
    '   ejecutar código en tu ordenador.',
    '',
  ].join('\r\n')
}

module.exports = { PIDEN_INTERNET, pideInternet, avisoDeInternet }
