import { describe, expect, it } from 'vitest'
import { avisoDeInternet, pideInternet } from '../taller-escritorio/politica-terminal.cjs'

// La terminal ejecuta comandos de verdad sobre el proyecto de quien aprende.
// La regla es: todo sí, bajar cosas de internet no. Y cuando se bloquea algo,
// se explica cómo hacerlo bien y de quién es la responsabilidad.
//
// Una regla de seguridad sin pruebas es una intención, así que aquí están.

describe('lo que se bloquea', () => {
  const bloqueados = [
    'npm install vue-router',
    'npm i axios',
    'npm  install',
    'NPM INSTALL algo',
    'npm add lodash',
    'npm ci',
    'npx create-vue@latest',
    'yarn add react',
    'pnpm install',
    'git clone https://github.com/algo/algo',
    'git push origin main',
    'git pull',
    'curl https://ejemplo.com/script.sh',
    'wget http://ejemplo.com/cosa.zip',
    'echo hola && curl https://malo.example',
  ]

  for (const comando of bloqueados) {
    it(`bloquea «${comando}»`, () => {
      expect(pideInternet(comando)).toBeTruthy()
    })
  }
})

describe('lo que se deja pasar', () => {
  const permitidos = [
    'npm run dev',
    'npm run build',
    'npm test',
    'npm run test',
    'npm -v',
    'npm ls',
    'node -v',
    'node src/precios.js',
    'git status',
    'git add .',
    'git commit -m "un cambio"',
    'git log --oneline',
    'git init',
    'git diff',
    'dir',
    'cls',
  ]

  for (const comando of permitidos) {
    it(`deja pasar «${comando}»`, () => {
      expect(pideInternet(comando)).toBe(null)
    })
  }

  it('no confunde un script que se LLAMA install con instalar', () => {
    // `npm run install-todo` es un script del proyecto, no una descarga.
    expect(pideInternet('npm run install-todo')).toBe(null)
  })

  it('no bloquea por una palabra dentro de otra', () => {
    expect(pideInternet('node curling.js')).toBe(null)
    expect(pideInternet('git status --short')).toBe(null)
  })
})

describe('el aviso cuando se bloquea', () => {
  const aviso = avisoDeInternet('npm install axios', 'instalar paquetes de npm', 'C:\\proyecto')

  it('dice qué comando y por qué', () => {
    expect(aviso).toContain('npm install axios')
    expect(aviso).toMatch(/necesita internet/i)
  })

  it('explica que para el taller no hace falta', () => {
    expect(aviso).toMatch(/no hace falta/i)
    expect(aviso).toContain('vue-router')
  })

  it('dice cómo hacerlo bien, fuera de la app, y de fuente fiable', () => {
    expect(aviso).toMatch(/fuera de esta aplicación/i)
    expect(aviso).toContain('https://nodejs.org')
    expect(aviso).toContain('npmjs.com')
    expect(aviso).toContain('C:\\proyecto')
  })

  it('avisa de que es bajo su responsabilidad', () => {
    expect(aviso).toMatch(/responsabilidad/i)
    expect(aviso).toMatch(/ejecutar código en tu ordenador/i)
  })

  it('no lleva caracteres de control escritos a mano', () => {
    // Los colores se construyen con String.fromCharCode(27). Si aquí apareciera
    // un carácter de control distinto del ESC, sería un despiste al escribirlo.
    const sospechosos = [...aviso].filter(
      (letra) => letra.charCodeAt(0) < 32 && !['\r', '\n', String.fromCharCode(27)].includes(letra),
    )
    expect(sospechosos).toEqual([])
  })
})
