// Estado del taller: que proyecto esta abierto, que ficheros tiene y cual se
// esta editando. El contenido de verdad vive en IndexedDB (ver motor/sfv.js);
// esto es la capa que la interfaz consulta.

import { defineStore } from 'pinia'
// Los ficheros van por el adaptador, que elige disco real (escritorio) o el
// sistema virtual (navegador). Se mantiene el nombre `sfv` para no tocar el
// resto del fichero.
import * as sfv from '../motor/ficheros.js'

const RETARDO_GUARDADO_MS = 400
// La subida a la nube va mucho más espaciada que el guardado local: escribir en
// D1 con cada pulsación sería absurdo, y el local ya protege del cierre de
// pestaña.
const RETARDO_NUBE_MS = 2500

export const usarTaller = defineStore('taller', {
  state: () => ({
    proyecto: 'catalogo',
    ficheros: [],
    rutaActiva: null,
    borrador: '',
    guardando: false,
    error: null,
    // Estado de la copia en la nube: 'sin-probar', 'guardando', 'guardado',
    // 'solo-local' (no hay sesión) o 'error'.
    nube: 'sin-probar',
    // Sube cada vez que hay un cambio guardado; la vista previa lo observa
    // para saber cuando recargarse.
    revision: 0,
  }),

  getters: {
    arbol: (estado) => sfv.construirArbol(estado.ficheros),
    hayFicheros: (estado) => estado.ficheros.length > 0,
    extensionActiva: (estado) => (estado.rutaActiva ? sfv.extensionDe(estado.rutaActiva) : ''),
  },

  actions: {
    async refrescarLista() {
      this.ficheros = await sfv.listar(this.proyecto)
    },

    async cargar(proyecto = this.proyecto) {
      this.proyecto = proyecto
      this.error = null
      await this.refrescarLista()

      if (!this.ficheros.length) {
        this.rutaActiva = null
        this.borrador = ''
        return
      }

      // Al abrir, lo mas util es ver el index.html si existe.
      const preferido =
        this.ficheros.find((fichero) => fichero.ruta === 'index.html') || this.ficheros[0]
      await this.abrir(preferido.ruta)
    },

    async abrir(ruta) {
      // Lo que haya sin guardar se guarda antes de cambiar de fichero.
      await this.guardarYa()
      this.rutaActiva = ruta
      this.borrador = (await sfv.leer(this.proyecto, ruta)) ?? ''
      this.error = null
    },

    // Se llama en cada pulsacion. No escribe en disco: solo agenda.
    escribir(contenido) {
      this.borrador = contenido
      this.agendarGuardado()
    },

    agendarGuardado() {
      clearTimeout(this._reloj)
      this.guardando = true
      this._reloj = setTimeout(() => this.guardarYa(), RETARDO_GUARDADO_MS)
    },

    async guardarYa() {
      clearTimeout(this._reloj)
      if (!this.rutaActiva) {
        this.guardando = false
        return
      }

      try {
        await sfv.guardar(this.proyecto, this.rutaActiva, this.borrador)
        this.revision += 1
        this.agendarSubida()
        this.error = null
      } catch (fallo) {
        this.error = fallo.message
      } finally {
        this.guardando = false
      }
    },

    async crear(ruta, contenido = '') {
      try {
        await sfv.crear(this.proyecto, ruta, contenido)
        await this.refrescarLista()
        await this.abrir(sfv.normalizarRuta(ruta))
        this.revision += 1
        this.agendarSubida()
      } catch (fallo) {
        this.error = fallo.message
        throw fallo
      }
    },

    async borrar(ruta) {
      await sfv.borrar(this.proyecto, ruta)
      await this.refrescarLista()

      if (this.rutaActiva === ruta) {
        this.rutaActiva = null
        this.borrador = ''
        if (this.ficheros.length) await this.abrir(this.ficheros[0].ruta)
      }

      this.revision += 1
      this.agendarSubida()
    },

    async renombrar(desde, hasta) {
      try {
        await sfv.renombrar(this.proyecto, desde, hasta)
        await this.refrescarLista()
        if (this.rutaActiva === desde) await this.abrir(sfv.normalizarRuta(hasta))
        this.revision += 1
        this.agendarSubida()
      } catch (fallo) {
        this.error = fallo.message
        throw fallo
      }
    },

    // Tira lo que haya en el editor sin guardarlo, y cancela el guardado que
    // estuviera agendado.
    descartarBorrador() {
      clearTimeout(this._reloj)
      this.guardando = false
      this.rutaActiva = null
      this.borrador = ''
    },

    // ---- Sincronización con la nube ----
    //
    // El proyecto vive en IndexedDB, que es rápido y funciona sin conexión, y
    // se copia a D1 para que sobreviva a cambiar de navegador o de ordenador.
    //
    // Conflictos: manda la copia más reciente, comparando la fecha del último
    // cambio de cada lado. No hay fusión línea a línea y no la va a haber; si
    // dos sitios editan a la vez, se pierde el trabajo del que iba atrasado.
    // Se dice claro en vez de disimularlo.
    async sincronizarAlEntrar() {
      let deLaNube

      try {
        const respuesta = await fetch('/api/sandbox')
        if (!respuesta.ok) {
          // 401 sin sesión, o el Worker no está levantado en local.
          this.nube = 'solo-local'
          return
        }
        deLaNube = await respuesta.json()
      } catch {
        this.nube = 'solo-local'
        return
      }

      const locales = await sfv.listar(this.proyecto)
      const ultimoLocal = locales.reduce((mayor, f) => Math.max(mayor, f.actualizado || 0), 0)
      // D1 devuelve "2026-08-26 07:12:03", en UTC y sin la Z.
      const ultimoNube = deLaNube.actualizado
        ? Date.parse(`${String(deLaNube.actualizado).replace(' ', 'T')}Z`)
        : 0

      if (deLaNube.cuantos && ultimoNube > ultimoLocal) {
        // La nube va por delante: se adopta tal cual, incluidos los borrados.
        await sfv.reemplazar(this.proyecto, deLaNube.ficheros)
        this.descartarBorrador()
        await this.cargar()
        this.revision += 1
        this.agendarSubida()
      } else if (locales.length) {
        await this.subirALaNube()
      }

      this.nube = 'guardado'
    },

    agendarSubida() {
      if (this.nube === 'solo-local') return
      clearTimeout(this._relojNube)
      this._relojNube = setTimeout(() => this.subirALaNube(), RETARDO_NUBE_MS)
    },

    async subirALaNube() {
      clearTimeout(this._relojNube)
      if (this.nube === 'solo-local') return

      this.nube = 'guardando'

      try {
        const ficheros = Object.fromEntries(
          (await sfv.listar(this.proyecto)).map((f) => [f.ruta, f.contenido]),
        )

        const respuesta = await fetch('/api/sandbox', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ficheros }),
        })

        if (respuesta.status === 401) {
          this.nube = 'solo-local'
          return
        }
        this.nube = respuesta.ok ? 'guardado' : 'error'
      } catch {
        this.nube = 'error'
      }
    },

    // Crea lo que falte para poder empezar un mundo, sin tocar nada de lo que
    // ya existe. Es TU proyecto: un mundo nuevo puede necesitar que haya un
    // fichero, pero no puede reescribirte el que tenías.
    async sembrar(ficheros) {
      const creados = await sfv.sembrar(this.proyecto, ficheros)

      // Si no hay nada nuevo y ya se estaba editando algo, no se toca el
      // editor: cambiar de mundo no debe mover el cursor de sitio.
      if (!creados.length && this.rutaActiva) return creados

      await this.refrescarLista()

      if (!this.rutaActiva && this.ficheros.length) {
        const preferido =
          this.ficheros.find((fichero) => fichero.ruta === 'index.html') || this.ficheros[0]
        await this.abrir(preferido.ruta)
      }

      this.revision += 1
        this.agendarSubida()
      return creados
    },

    // Destructivo y explícito: devuelve los ficheros de un mundo a su estado
    // inicial. Solo esos; lo que hayas creado tú por tu cuenta se queda.
    //
    // Se descarta el borrador antes por un motivo real: `abrir()` empieza
    // guardando lo pendiente, y si no, el contenido viejo del editor volvería
    // a escribirse encima de lo que acabamos de restaurar.
    async restaurar(ficheros) {
      this.descartarBorrador()
      await sfv.restaurar(this.proyecto, ficheros)
      await this.cargar()
      this.revision += 1
        this.agendarSubida()
    },
  },
})
