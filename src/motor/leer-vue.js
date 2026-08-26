// Parte un fichero .vue en sus tres bloques, para poder comprobarlos por
// separado con los lectores que ya existen: el <template> con leer-html, el
// <style> con leer-css, el <script> con acorn.
//
// Usa el parser oficial de Vue (@vue/compiler-sfc), el MISMO que usa Vite. Así
// lo que comprobamos coincide exactamente con lo que compila: si el parser real
// se traga el fichero, nosotros vemos lo mismo; si no, nos enteramos igual.
//
// Nada de expresiones regulares para partirlo: un `</template>` escrito como
// texto dentro del propio template rompería un recorte a mano (nos pasó de
// verdad con un comentario), pero el parser de Vue lo entiende bien.

import { parse } from '@vue/compiler-sfc'

/**
 * Devuelve { template, script, usaSetup, estilos, errores }.
 *   template: el contenido del bloque <template>, o null
 *   script:   el contenido del <script setup> o del <script>, o null
 *   usaSetup: si el script es <script setup>
 *   estilos:  [{ contenido, scoped, lang }]
 *   errores:  mensajes de error del parser (si el .vue está mal formado)
 */
export function partirVue(fuente) {
  const { descriptor, errors } = parse(String(fuente ?? ''), { ignoreEmpty: false })

  return {
    template: descriptor.template ? descriptor.template.content : null,
    script: descriptor.scriptSetup
      ? descriptor.scriptSetup.content
      : descriptor.script
        ? descriptor.script.content
        : null,
    usaSetup: Boolean(descriptor.scriptSetup),
    estilos: descriptor.styles.map((estilo) => ({
      contenido: estilo.content,
      scoped: Boolean(estilo.scoped),
      lang: estilo.lang || 'css',
    })),
    errores: (errors || []).map((e) => e.message || String(e)),
  }
}

// El CSS de todos los bloques <style> juntos, para pasárselo al lector de CSS
// de una vez. Casi siempre hay uno solo, pero puede haber varios.
export function estiloDe(partido) {
  return partido.estilos.map((e) => e.contenido).join('\n')
}

// Si ALGÚN bloque <style> es scoped. El mundo del estilo insiste en que en Vue
// el CSS va scoped por defecto, así que hace falta saberlo.
export function tieneScoped(partido) {
  return partido.estilos.some((e) => e.scoped)
}
