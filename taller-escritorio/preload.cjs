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
})
