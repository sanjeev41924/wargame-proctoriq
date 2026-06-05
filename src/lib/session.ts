import { EMPTY_KPIS } from '../data/scenario'
import type { SessionState } from '../types'

const SESSION_ENDPOINT = '/api/session'
const RECONNECT_DELAY_MS = 1200
const DEFAULT_SESSION_TURN_TIMER_SECONDS = 300

const createDefaultSession = (): SessionState => ({
  screen: 'intro',
  introIndex: 0,
  currentTurnIndex: 0,
  turnTimerSeconds: DEFAULT_SESSION_TURN_TIMER_SECONDS,
  timerStatus: 'idle',
  timerEndsAt: null,
  pausedSecondsRemaining: null,
  teams: [],
})

const normalizeSession = (input: SessionState | null | undefined): SessionState => {
  if (!input) {
    return createDefaultSession()
  }

  return {
    ...createDefaultSession(),
    ...input,
    teams: (input.teams ?? []).map((team) => ({
      ...team,
      kpis: {
        ...EMPTY_KPIS,
        ...team.kpis,
      },
      submissions: team.submissions ?? {},
    })),
  }
}

let clientSession = createDefaultSession()
let socket: WebSocket | null = null
let reconnectTimer: number | null = null
let syncStarted = false
const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

const writeSession = (next: SessionState) => {
  clientSession = normalizeSession(next)
  notifyListeners()
  return clientSession
}

const getSocketUrl = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

const scheduleReconnect = () => {
  if (typeof window === 'undefined' || reconnectTimer !== null) {
    return
  }

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    connectSocket()
  }, RECONNECT_DELAY_MS)
}

const connectSocket = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  socket = new WebSocket(getSocketUrl())

  socket.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data) as { type?: string; payload?: SessionState }
      if (message.type === 'snapshot' && message.payload) {
        writeSession(message.payload)
      }
    } catch {
      // Ignore malformed realtime messages and keep the last known good session.
    }
  })

  socket.addEventListener('close', () => {
    socket = null
    scheduleReconnect()
  })

  socket.addEventListener('error', () => {
    socket?.close()
  })
}

const startSync = () => {
  if (typeof window === 'undefined' || syncStarted) {
    return
  }

  syncStarted = true
  connectSocket()
  void fetchSessionSnapshot()
}

export const fetchSessionSnapshot = async (): Promise<SessionState> => {
  if (typeof window === 'undefined') {
    return clientSession
  }

  try {
    const response = await fetch(SESSION_ENDPOINT, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to load session: ${response.status}`)
    }

    const payload = (await response.json()) as SessionState
    return writeSession(payload)
  } catch {
    return clientSession
  }
}

export const loadSession = (): SessionState => {
  return clientSession
}

export const persistSession = async (next: SessionState): Promise<SessionState> => {
  const normalized = normalizeSession(next)
  writeSession(normalized)

  if (typeof window === 'undefined') {
    return normalized
  }

  try {
    const response = await fetch(SESSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(normalized),
    })

    if (!response.ok) {
      throw new Error(`Failed to persist session: ${response.status}`)
    }

    const payload = (await response.json()) as SessionState
    return writeSession(payload)
  } catch {
    return normalized
  }
}

export const resetSession = async (): Promise<SessionState> => persistSession(createDefaultSession())

export const subscribeToSession = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  listeners.add(listener)
  startSync()
  void fetchSessionSnapshot()

  return () => {
    listeners.delete(listener)
  }
}
