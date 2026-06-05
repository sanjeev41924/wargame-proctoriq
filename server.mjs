import express from 'express'
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer } from 'ws'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')
const indexHtmlPath = path.join(distDir, 'index.html')
const deckDir = path.join(__dirname, 'deck-serve')

const createDefaultSession = () => ({
  screen: 'intro',
  introIndex: 0,
  currentTurnIndex: 0,
  timerStatus: 'idle',
  timerEndsAt: null,
  pausedSecondsRemaining: null,
  teams: [],
})

const normalizeSession = (input) => {
  const fallback = createDefaultSession()

  if (!input || typeof input !== 'object') {
    return fallback
  }

  return {
    ...fallback,
    ...input,
    teams: Array.isArray(input.teams) ? input.teams : [],
  }
}

let sessionState = createDefaultSession()

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))

const CLEAN_DECK_CSS = `
html, body {
  overflow: hidden !important;
  scrollbar-width: none !important;
  overscroll-behavior: none !important;
}

body::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.bespoke-progress-parent,
.bespoke-marp-osc {
  display: none !important;
}
`

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/session', (_request, response) => {
  response.json(sessionState)
})

app.get('/deck/Mythos-Resilience-50min-clean.html', (_request, response) => {
  const deckHtmlPath = path.join(deckDir, 'Mythos-Resilience-50min.html')

  if (!existsSync(deckHtmlPath)) {
    response.status(404).send('Deck file not found.')
    return
  }

  const source = readFileSync(deckHtmlPath, 'utf8')
  const cleaned = source.replace('</head>', `<style id="coalesce-clean-deck-css">${CLEAN_DECK_CSS}</style></head>`)

  response.type('html').send(cleaned)
})

const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const broadcastSnapshot = () => {
  const payload = JSON.stringify({ type: 'snapshot', payload: sessionState })

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload)
    }
  })
}

app.post('/api/session', (request, response) => {
  sessionState = normalizeSession(request.body)
  broadcastSnapshot()
  response.json(sessionState)
})

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'snapshot', payload: sessionState }))
})

if (existsSync(distDir)) {
  app.use(express.static(distDir))
}

if (existsSync(deckDir)) {
  app.use('/deck', express.static(deckDir))
}

app.use((_request, response) => {
  if (!existsSync(indexHtmlPath)) {
    response.status(503).send('Production assets not found. Run "npm run build" first.')
    return
  }

  response.sendFile(indexHtmlPath)
})

const port = Number(process.env.PORT || 3000)

server.listen(port, () => {
  console.log(`Coalesce app server running at http://localhost:${port}`)
})