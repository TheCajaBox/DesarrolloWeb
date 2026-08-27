// El puente entre la ventana y el proceso principal.
//
// El renderer NO tiene acceso a Node ni al disco. Solo ve este objeto
// `window.taller`, con las cuatro operaciones que necesita. Todo lo demás
// (comprobar rutas, tocar ficheros) ocurre en el proceso principal, que es el
// único con permisos.

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('taller', {
  // Marca que estamos en la app de escritorio real (no en el navegador con un
  // puente de mentira). La vista previa lo usa para decidir si pinta el webview.
  esEscritorio: true,
  leer: (ruta) => ipcRenderer.invoke('taller:leer', ruta),
  escribir: (ruta, contenido) => ipcRenderer.invoke('taller:escribir', ruta, contenido),
  borrar: (ruta) => ipcRenderer.invoke('taller:borrar', ruta),
  renombrar: (desde, hasta) => ipcRenderer.invoke('taller:renombrar', desde, hasta),
  listar: () => ipcRenderer.invoke('taller:listar'),
  urlVista: () => ipcRenderer.invoke('taller:url-vista'),
  // El build real de Vite sobre el proyecto: deja la web lista en dist/ y
  // abre la carpeta. Devuelve { ok, ruta } o { ok: false, error }.
  exportar: () => ipcRenderer.invoke('taller:exportar'),

  // La terminal. Ejecuta comandos de verdad sobre el proyecto (npm, node,
  // git) y devuelve su salida a trozos, como cualquier terminal.
  terminal: {
    ejecutar: (comando) => ipcRenderer.invoke('terminal:ejecutar', comando),
    escribir: (texto) => ipcRenderer.invoke('terminal:escribir', texto),
    parar: () => ipcRenderer.invoke('terminal:parar'),
    donde: () => ipcRenderer.invoke('terminal:donde'),

    // Se suscribe a la salida. Devuelve la función para darse de baja: sin
    // eso, cada vez que se remonta el panel se acumularía otro oyente.
    alSalir: (escuchar) => {
      const oyente = (_evento, dato) => escuchar(dato)
      ipcRenderer.on('terminal:salida', oyente)
      return () => ipcRenderer.removeListener('terminal:salida', oyente)
    },
  },
})
