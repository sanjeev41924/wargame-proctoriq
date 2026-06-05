export type WorkstreamId = 'W1' | 'W2' | 'W3' | 'W4' | 'W5' | 'W6'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

export type ScreenMode =
  | 'intro'
  | 'rules'
  | 'turn-brief'
  | 'turn-live'
  | 'turn-review'
  | 'leaderboard'

export interface SlideReference {
  number: number
  title: string
  hook: string
  takeaway: string
}

export interface KpiSet {
  continuity: number
  data: number
  financial: number
  regulatory: number
  trust: number
}

export interface ActionOption {
  id: string
  title: string
  summary: string
  rationale: string
  value: number
  effects: KpiSet
  workstream?: WorkstreamId
}

export interface ContradictionRule {
  earlierActionId: string
  laterActionId: string
  scorePenalty: number
  note: string
}

export interface TurnDefinition {
  id: string
  title: string
  storyTime: string
  subtitle: string
  narrative: string
  stageNarrative?: string
  stageSignals?: string[]
  stagePressure?: string[]
  stageResolve?: string[]
  evidence: string[]
  pressure: string[]
  timerSeconds: number
  workstreams: WorkstreamId[]
  intelReveal?: string
  followUpSlide: SlideReference
  actions: ActionOption[]
  contradictions: ContradictionRule[]
  debrief: string
  allowRebalance?: boolean
}

export interface TeamSubmission {
  ranking: string[]
  confidence: ConfidenceLevel
  scoreDelta: number
  kpiDelta: KpiSet
  rationale: string
  submittedAt: number
}

export interface TeamRecord {
  id: string
  name: string
  tableNumber: string
  sector: string
  chips: Record<WorkstreamId, number>
  kpis: KpiSet
  score: number
  statusTag: string
  submissions: Partial<Record<string, TeamSubmission>>
}

export interface SessionState {
  screen: ScreenMode
  introIndex: number
  currentTurnIndex: number
  turnTimerSeconds: number
  timerStatus: 'idle' | 'running' | 'paused'
  timerEndsAt: number | null
  pausedSecondsRemaining: number | null
  teams: TeamRecord[]
}
