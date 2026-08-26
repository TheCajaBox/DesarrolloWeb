# El Sombrero de Wayne

Un taller donde se aprende a construir una web desde cero **construyéndola**: creas
los ficheros, diseñas las tablas, escribes los handlers, y ves el resultado en vivo
en una URL de verdad.

Guían cuatro personajes: **Wayne** narra desde un bocadillo flotante, **Wax** da las
lecciones, **Steris** lleva el glosario y traduce los errores, y **Armonía** responde
preguntas sin dar la solución.

Lo que se levanta paso a paso es un catálogo de sombreros con votaciones. Ese
catálogo existe de verdad en la web pública, funcionando, como modelo a imitar.

Los diálogos son **originales**, escritos en el registro de los personajes. No hay
texto copiado de los libros de Brandon Sanderson. Los retratos vienen de
`croquetas-alomanticas`, del mismo autor.

## El temario

Quince mundos en cinco actos, 54 pasos. El diseño completo está en
[docs/temario.md](docs/temario.md).

| Acto | Mundos |
|---|---|
| **Qué es todo esto** | 1 Esto es un papel · 2 Decir qué es cada cosa · 3 Todo es un fichero |
| **Que se vea bien** | 4 El navegador ya opina · 5 El modelo de cajas · 6 Repartir el espacio |
| **Que haga cosas** | 7 JavaScript, por fin · 8 Los datos tienen forma |
| **El otro lado** | 9 Qué es un servidor · 10 Diseñar la base · 11 Preguntarle a la base · 12 La API · 13 Que no te la cuelen |
| **Ponerlo en el mundo** | 14 Vue y que se mueva · 15 Del repositorio a internet |

**La regla que manda sobre todas**: el primer paso lo tiene que poder hacer alguien
que no ha escrito una línea de código en su vida. Los dos primeros pasos del Mundo 1
son cambiar texto que ya está escrito.

Y **no todo es teclear**. Los mundos 9, 14 y 15 son de entender, con pasos de elegir
entre opciones donde cada opción —también las equivocadas— explica por qué.

## Cómo se comprueba cada paso

Por orden de preferencia, bajando un escalón solo cuando el de arriba no es posible:

1. **Ejecutar y mirar el resultado.** El SQL corre contra SQLite de verdad. El
   JavaScript se ejecuta contra el HTML del alumno, y en el mundo del contador se
   pulsa el botón dos veces para comprobar que sigue subiendo. La inyección SQL del
   Mundo 13 funciona porque funciona: el alumno escribe el ataque y la tabla sale
   entera.
2. **Leer la estructura.** El HTML se parsea con `DOMParser` y el CSS con
   `motor/leer-css.js`. Se comprueba **lo que el navegador entendió**, no lo que se
   escribió: es lo mismo que hacer PRAGMA a la base en vez de analizar el CREATE
   TABLE.
3. **Comparar contra un patrón**, solo para lo que no tiene estructura.

Nunca expresiones regulares sobre el fuente para lo que sí tiene estructura: un
comentario o un salto de línea no pueden tumbar un paso bien resuelto.

**Cada mundo trae una solución de referencia** que las pruebas ejecutan contra todos
sus pasos. Un mundo imposible por una comprobación mal escrita es el peor fallo que
puede tener esto, porque quien lo sufre da por hecho que la que no sabe es ella.

## Cómo funciona

Dos Workers de Cloudflare que comparten una base D1:

| Worker | Qué sirve | Access |
|---|---|---|
| `el-sombrero-de-wayne` | Portada, catálogo real, páginas publicadas | No, público |
| `taller-sombrero` | El taller | Sí, PIN de un solo uso |

Están separados porque Access, a nivel de Worker, es todo o nada.

### La vista previa

Un **Service Worker** (`taller-estatico/sw-vista-previa.js`) intercepta
`/vista/<proyecto>/...` y sirve desde IndexedDB los ficheros que el alumno está
escribiendo.

Se hace así, y no con un `iframe srcdoc`, porque srcdoc no resuelve las rutas
relativas entre ficheros: un `<link href="estilos.css">` no encontraría nada. Con
Service Worker el proyecto se comporta como una web de verdad, tiene URL propia y se
puede abrir en otra pestaña.

Las llamadas a `/vista/<proyecto>/api/*` se las pasa por `postMessage` a la pestaña
del taller, que es donde vive SQLite y donde se ejecuta el backend del alumno.

### Los motores

| Fichero | Qué hace |
|---|---|
| `motor/sfv.js` | Sistema de ficheros virtual sobre IndexedDB |
| `motor/sql.js` | SQLite en WebAssembly, carga diferida |
| `motor/ejecutar-js.js` | Ejecuta el JS del alumno; instrumenta los bucles con acorn para que uno infinito no cuelgue la pestaña |
| `motor/shim-d1.js` | Imita la API de D1 sobre SQLite, para que el código del Worker sea el mismo que se despliega |
| `motor/leer-html.js` | Lee el HTML con DOMParser |
| `motor/leer-css.js` | Lee el CSS: reglas, selectores, especificidad |
| `motor/critica-esquema.js` | La revisión de esquema de Wax |
| `motor/glosario.js` | Subrayado de términos de Steris |
| `motor/traducir-errores.js` | Traducción de errores de Steris |

### Lo que no se hace, y a propósito

- **El backend del alumno nunca se ejecuta en el servidor.** Publicar sube sus
  ficheros a D1 y se sirven estáticos. Evaluar código ajeno dentro del Worker sería
  ejecución remota.
- **Las páginas publicadas van con `Content-Security-Policy: sandbox`**, que las mete
  en un origen opaco: su JavaScript funciona, pero no alcanza cookies ni sesión.
- **El código del alumno nunca sale a la red.** `ejecutar-js.js` siempre define un
  `fetch` propio, aunque nadie lo pida.
- **Ninguna clave de API en el bundle.** Armonía corre sobre Workers AI con un
  binding, sin clave.

## Puesta en marcha

```bash
npm install
npm run dev:taller
```

Para trabajar contra la base, autenticarse una vez (**lo hace una persona**, abre el
navegador):

```bash
npx wrangler login
```

Y después `npm run bbdd:local` y `npm run servidor:taller`.

## Órdenes

| Orden | Qué hace |
|---|---|
| `npm run dev:taller` | Taller en desarrollo (5274) |
| `npm run dev:publico` | Web pública en desarrollo (5273) |
| `npm test` | 302 pruebas |
| `npm run bbdd:local` / `bbdd:remota` | Migraciones |
| `npm run publicar:taller` / `publicar:publico` | Compila y despliega |

## Cuentas del plan gratuito

Con dos personas no se roza ningún límite:

- **Peticiones**: 100.000/día. Los estáticos son **gratis e ilimitados** y ni
  invocan al Worker, así que solo cuentan las llamadas a `/api/*`.
- **CPU**: 10 ms por petición, **no ampliables** en gratuito (`limits.cpu_ms` es de
  pago). Por eso los ejercicios corren en el navegador.
- **D1**: 5 GB, 5 millones de lecturas y 100.000 escrituras al día.
- **Workers AI**: 10.000 Neurons diarios, que se reinician a las 00:00 UTC.

> Workers AI gasta Neurons **también en desarrollo local**. Conviene simular Armonía
> mientras se trabaja.

> El nombre del modelo hay que comprobarlo con `npx wrangler ai models`: algunos que
> aparecen en la documentación ya no están en el catálogo.

## Lo que falta

- **El Mundo 14 (Vue) es de entender, no de teclear.** Ejecutar Vue en el sandbox es
  posible pero costoso, y comprobar plantillas con expresiones regulares sería justo
  lo que el documento de diseño prohíbe. Queda anotado en el propio fichero.
- **No hay botón de publicar** en la interfaz. La ruta del servidor existe y está
  protegida.
- **`motor/sql.js` corre en el hilo principal.** Va de sobra para el temario, pero un
  CTE recursivo mal escrito congelaría la pestaña. Debe moverse a un Web Worker.
- **El bundle inicial es de ~1 MB** (300 KB comprimido). Las lecciones podrían
  cargarse bajo demanda, como hace croquetas con los cuerpos de los retos.

## Estructura

```
docs/temario.md     el diseño: qué se enseña, con qué voz y cómo se comprueba
migraciones/        esquema de D1, versionado
servidor/           los dos Workers y sus rutas (Hono)
src/motor/          los motores de ejecución y análisis
src/componentes/    editor, árbol, consola SQL, Steris, bocadillo de Wayne
src/contenido/      los 15 mundos, el glosario, las frases
taller-estatico/    el Service Worker de la vista previa
pruebas/            vitest
```
