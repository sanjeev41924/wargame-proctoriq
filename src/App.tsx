import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import {
  CONFIDENCE_LABELS,
  INTRO_SLIDES,
  MAX_COINS_PER_WORKSTREAM,
  REBALANCE_COIN_LIMIT,
  SLOT_WEIGHTS,
  TOTAL_ALLOCATION_COINS,
  TURN_DEFINITIONS,
  WORKSTREAM_LABELS,
  createTeamRecord,
  seedDemoTeams,
} from './data/scenario'
import {
  fetchSessionSnapshot,
  loadSession,
  persistSession,
  resetSession,
  subscribeToSession,
} from './lib/session'
import type {
  ConfidenceLevel,
  KpiSet,
  SessionState,
  SlideReference,
  TeamRecord,
  TurnDefinition,
  WorkstreamId,
} from './types'

const TEAM_STORAGE_KEY = 'coalesce-demo-team-id'
const DECK_HTML_PATH = '/deck/Mythos-Resilience-50min-clean.html'
const SESSION_TIMER_MINUTE_OPTIONS = [5, 6, 7, 8, 9, 10] as const
type RuleKind = 'steer' | 'chips' | 'rank' | 'resilience'

const RULE_PRESENTATION: Array<{
  kind: RuleKind
  eyebrow: string
  title: string
  body: string
}> = [
  {
    kind: 'steer',
    eyebrow: 'Table role',
    title: 'Steer as one executive team',
    body: "Debate as one steering committee. One device submits for the whole table.",
  },
  {
    kind: 'chips',
    eyebrow: 'Opening posture',
    title: 'Assign all 60 coins across six workstreams',
    body: 'Allocate 0 to 60 coins per workstream using sliders. All 60 must be assigned before registering.',
  },
  {
    kind: 'rank',
    eyebrow: 'Turn mechanic',
    title: 'Rank the top 4 actions out of 6',
    body: 'When the timer opens, rank 4 of 6 actions in strict order before the lock.',
  },
  {
    kind: 'resilience',
    eyebrow: 'Winning logic',
    title: 'Score on resilience, not optics',
    body: 'Confidence matters, but the scoreboard rewards resilience over comfort and optics.',
  },
]

const TURN_DECISION_GUIDES: Record<string, string[]> = {
  'turn-1': [
    'What must change immediately to reduce reachable exposure?',
    'What can stay in motion without widening the blast radius?',
    'How much commercial pain are you willing to accept before certainty arrives?',
  ],
  'turn-2': [
    'Who has authority to narrow business scope right now?',
    'What evidence threshold is enough to justify disruption?',
    'Which path matters most before market open?',
  ],
  'turn-3': [
    'What identity signal is strong enough to act on now?',
    'Which controls prevent self-inflicted outage while revoking trust?',
    'What must be unified before the SOC can see the full campaign?',
  ],
  'turn-4': [
    'Which signal now deserves executive trust?',
    'What must be preserved before broader recovery starts?',
    'How early do you prepare the board for likely reporting pressure?',
  ],
  'turn-5': [
    'Which machine identities now move into incident scope?',
    'What can be suspended without breaking the business outright?',
    'How much reserve do you spend on a second-wave problem?',
  ],
  'turn-6': [
    'How do you isolate and restore services when the production network is untrusted?',
    'What is the minimum viable business sequence for critical application recovery?',
    'Who holds the ultimate authority to declare a safe return to service under fire?',
  ],
}
const KPI_LABELS = {
  continuity: 'Service continuity',
  data: 'Data exposure',
  financial: 'Financial loss',
  regulatory: 'Regulatory heat',
  trust: 'Stakeholder trust',
} as const

function App() {
  const [session, setSession] = useState<SessionState>(() => loadSession())
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => subscribeToSession(() => setSession(loadSession())), [])

  useEffect(() => {
    const timerId = window.setInterval(() => setClock(Date.now()), 500)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (session.screen !== 'turn-live' || session.timerStatus !== 'running' || !session.timerEndsAt) {
      return
    }

    if (session.timerEndsAt <= clock) {
      commitSession((current) => {
        if (
          current.screen !== 'turn-live' ||
          current.timerStatus !== 'running' ||
          !current.timerEndsAt ||
          current.timerEndsAt > Date.now()
        ) {
          return current
        }

        return {
          ...current,
          screen: 'turn-review',
          timerStatus: 'idle',
          timerEndsAt: null,
          pausedSecondsRemaining: null,
        }
      }, setSession)
    }
  }, [clock, session.screen, session.timerEndsAt, session.timerStatus])

  return (
    <Routes>
      <Route path="/" element={<LandingPage session={session} />} />
      <Route
        path="/admin"
        element={<AdminPage session={session} clock={clock} onSessionChange={setSession} />}
      />
      <Route
        path="/team"
        element={<TeamPage session={session} clock={clock} onSessionChange={setSession} />}
      />
      <Route path="/display" element={<DisplayPage session={session} clock={clock} />} />
      <Route path="/display/leaderboard" element={<SideLeaderboardPage session={session} clock={clock} />} />
    </Routes>
  )
}

const LandingPage = ({ session }: { session: SessionState }) => (
  <div className="page-shell landing-shell">
    <header className="hero-banner">
      <div>
        <p className="eyebrow">Mythos Resilience</p>
        <h1>Mythos-era executive game control room</h1>
        <p className="lede">
          A locally testable facilitation app for the Mythos resilience workshop with real cross-browser
          sync. Run one local server, then open admin, team, and display in different browsers to
          simulate the room.
        </p>
      </div>
      <div className="hero-metrics">
        <div className="metric-card">
          <span>Intro slides</span>
          <strong>{INTRO_SLIDES.length}</strong>
          <small>Facilitator-led opening arc</small>
        </div>
        <div className="metric-card">
          <span>Live turns</span>
          <strong>{TURN_DEFINITIONS.length}</strong>
          <small>Each mapped to a debrief slide</small>
        </div>
        <div className="metric-card">
          <span>Current state</span>
          <strong>{labelForScreen(session.screen)}</strong>
          <small>Ready for DNS-backed static hosting</small>
        </div>
      </div>
    </header>

    <section className="route-grid">
      <RouteCard
        title="Admin console"
        href="/admin"
        body="Run the briefing deck plan, launch turns, control the timer, seed demo teams, and reveal debrief slides and leaderboard states."
      />
      <RouteCard
        title="Team screen"
        href="/team"
        body="Register a table, assign exactly 60 coins across six workstreams using sliders, and rank the top four actions under time pressure."
      />
      <RouteCard
        title="Public display"
        href="/display"
        body="Use this on the center stage screen for full-screen intro slides, turn briefings, timer states, and post-turn debrief slides."
      />
      <RouteCard
        title="Side leaderboard"
        href="/display/leaderboard"
        body="Use this on the two side screens. It shows a clean holding slide until the game starts, then stays on the live leaderboard."
      />
    </section>

    <section className="landing-grid">
      <article className="panel-card">
        <h2>Intro briefing deck plan</h2>
        <div className="slide-list compact">
          {INTRO_SLIDES.map((slide) => (
            <SlideCard key={slide.number} slide={slide} compact />
          ))}
        </div>
      </article>

      <article className="panel-card">
        <h2>Scenario handoff</h2>
        <p>
          After the intro, the facilitator explains the rules, then each turn follows the same rhythm:
          story briefing, timer-based team submission, one-slide debrief from the resilience playbook,
          then the next turn.
        </p>
        <ul className="clean-list">
          {TURN_DEFINITIONS.map((turn) => (
            <li key={turn.id}>
              <strong>{turn.title}</strong>
              <span>
                {' '}
                → slide {turn.followUpSlide.number}: {turn.followUpSlide.title}
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article className="panel-card hosting-card">
        <h2>Cheap hosting path</h2>
        <p>
          This build now includes a lightweight realtime Node server. For local testing, build and run
          the production server on one machine, then open separate browsers against the same local URL.
          For cheap hosting, deploy the same Node app to a low-cost host and point your DNS there.
        </p>
        <div className="pill-row">
          <span className="pill">Realtime Node app</span>
          <span className="pill">Cross-browser local sync</span>
          <span className="pill">Single deploy target</span>
        </div>
      </article>
    </section>
  </div>
)

const AdminPage = ({
  session,
  clock,
  onSessionChange,
}: {
  session: SessionState
  clock: number
  onSessionChange: (session: SessionState) => void
}) => {
  const activeTurn = TURN_DEFINITIONS[session.currentTurnIndex]
  const remaining = getRemainingSeconds(session, clock)
  const submittedCount = countSubmittedTeams(session, activeTurn?.id)
  const timerMinutes = Math.round(session.turnTimerSeconds / 60)

  const moveIntro = (direction: -1 | 1) => {
    commitSession(
      (current) => ({
        ...current,
        screen: 'intro',
        introIndex: clamp(current.introIndex + direction, 0, INTRO_SLIDES.length - 1),
      }),
      onSessionChange,
    )
  }

  const openRules = () => {
    commitSession(
      (current) => ({
        ...current,
        screen: 'rules',
        timerStatus: 'idle',
        timerEndsAt: null,
        pausedSecondsRemaining: null,
      }),
      onSessionChange,
    )
  }

  const openTurnBrief = (index: number) => {
    commitSession(
      (current) => ({
        ...current,
        currentTurnIndex: clamp(index, 0, TURN_DEFINITIONS.length - 1),
        screen: 'turn-brief',
        timerStatus: 'idle',
        timerEndsAt: null,
        pausedSecondsRemaining: null,
      }),
      onSessionChange,
    )
  }

  const startTurn = () => {
    const duration = session.turnTimerSeconds

    commitSession(
      (current) => ({
        ...current,
        screen: 'turn-live',
        timerStatus: 'running',
        timerEndsAt: Date.now() + duration * 1000,
        pausedSecondsRemaining: null,
      }),
      onSessionChange,
    )
  }

  const updateSessionTimer = (minutes: number) => {
    commitSession(
      (current) => ({
        ...current,
        turnTimerSeconds: minutes * 60,
        timerStatus: current.timerStatus === 'idle' ? 'idle' : current.timerStatus,
      }),
      onSessionChange,
    )
  }

  const pauseTimer = () => {
    commitSession(
      (current) => {
        if (current.timerStatus !== 'running' || !current.timerEndsAt) {
          return current
        }

        return {
          ...current,
          timerStatus: 'paused',
          pausedSecondsRemaining: Math.max(0, Math.ceil((current.timerEndsAt - Date.now()) / 1000)),
          timerEndsAt: null,
        }
      },
      onSessionChange,
    )
  }

  const resumeTimer = () => {
    commitSession(
      (current) => {
        if (current.timerStatus !== 'paused' || current.pausedSecondsRemaining === null) {
          return current
        }

        return {
          ...current,
          timerStatus: 'running',
          timerEndsAt: Date.now() + current.pausedSecondsRemaining * 1000,
          pausedSecondsRemaining: null,
        }
      },
      onSessionChange,
    )
  }

  const lockTurn = () => {
    commitSession(
      (current) => ({
        ...current,
        screen: 'turn-review',
        timerStatus: 'idle',
        timerEndsAt: null,
        pausedSecondsRemaining: null,
      }),
      onSessionChange,
    )
  }

  const showLeaderboard = () => {
    commitSession((current) => ({ ...current, screen: 'leaderboard' }), onSessionChange)
  }

  const nextTurn = () => {
    commitSession(
      (current) => ({
        ...current,
        currentTurnIndex: clamp(current.currentTurnIndex + 1, 0, TURN_DEFINITIONS.length - 1),
        screen:
          current.currentTurnIndex + 1 >= TURN_DEFINITIONS.length ? 'leaderboard' : 'turn-brief',
        timerStatus: 'idle',
        timerEndsAt: null,
        pausedSecondsRemaining: null,
      }),
      onSessionChange,
    )
  }

  const seedTeams = () => {
    commitSession(
      (current) => ({
        ...current,
        teams: current.teams.length === 0 ? seedDemoTeams() : current.teams,
      }),
      onSessionChange,
    )
  }

  const reset = () => {
    void resetSession().then(onSessionChange)
  }

  return (
    <div className="page-shell admin-shell-v2">
      <header className="admin-header-v2">
        <div>
          <p className="eyebrow">Facilitator console</p>
          <h1>Run of show</h1>
        </div>
        <div className="admin-header-actions">
          <button className="ghost-button compact" type="button" onClick={seedTeams}>
            Seed 6 demo teams
          </button>
          <button className="ghost-button compact danger" type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </header>

      {/* ── Step 1: Timer ── */}
      <section className="admin-step-card">
        <div className="admin-step-num">1</div>
        <div className="admin-step-body">
          <h3>Set session timer</h3>
          <p className="admin-step-hint">Every turn will use this duration. Choose once before you start.</p>
          <div className="timer-option-row">
            {SESSION_TIMER_MINUTE_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                className={`timer-option-chip ${timerMinutes === minutes ? 'is-active' : ''}`}
                type="button"
                onClick={() => updateSessionTimer(minutes)}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Step 2: Intro deck ── */}
      <section className="admin-step-card">
        <div className="admin-step-num">2</div>
        <div className="admin-step-body">
          <div className="admin-step-head-row">
            <h3>Intro briefing deck</h3>
            <div className="admin-step-pills">
              <span className="admin-mini-chip">{INTRO_SLIDES.length} slides</span>
              <span className="admin-mini-chip">Current: slide {INTRO_SLIDES[session.introIndex]?.number ?? '?'}</span>
            </div>
          </div>
          <div className="admin-intro-controls">
            <button className="ghost-button compact" type="button" onClick={() => moveIntro(-1)}>
              ← Prev
            </button>
            <div className="admin-intro-preview-inline">
              <BroadcastSurface session={session} clock={clock} immersive={false} />
            </div>
            <button className="ghost-button compact" type="button" onClick={() => moveIntro(1)}>
              Next →
            </button>
          </div>
          <button className="primary-button" type="button" onClick={openRules}>
            Open game rules on stage
          </button>
        </div>
      </section>

      {/* ── Step 3: Turn sequence ── */}
      <section className="admin-step-card">
        <div className="admin-step-num">3</div>
        <div className="admin-step-body">
          <h3>Turn sequence</h3>
          <div className="admin-turn-tabs">
            {TURN_DEFINITIONS.map((turn, index) => (
              <button
                key={turn.id}
                className={`admin-turn-tab ${session.currentTurnIndex === index ? 'is-active' : ''}`}
                type="button"
                onClick={() => openTurnBrief(index)}
              >
                <span className="admin-turn-tab-num">{index + 1}</span>
                <span className="admin-turn-tab-title">{turn.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Step 4: Live controls ── */}
      <section className="admin-step-card admin-controls-card">
        <div className="admin-step-num">4</div>
        <div className="admin-step-body">
          <div className="admin-step-head-row">
            <h3>Live controls</h3>
            <div className="countdown-chip">{formatCountdown(remaining)}</div>
          </div>

          <div className="admin-controls-flow">
            <div className="admin-control-group">
              <span className="admin-control-arrow">→</span>
              <button className="primary-button" type="button" onClick={() => openTurnBrief(session.currentTurnIndex)}>
                Show turn briefing
              </button>
            </div>
            <div className="admin-control-group">
              <span className="admin-control-arrow">→</span>
              <button className="primary-button" type="button" onClick={startTurn}>
                Launch timed turn
              </button>
            </div>
            <div className="admin-control-group-row">
              <button className="ghost-button compact" type="button" onClick={pauseTimer}>Pause</button>
              <button className="ghost-button compact" type="button" onClick={resumeTimer}>Resume</button>
            </div>
            <div className="admin-control-group">
              <span className="admin-control-arrow">→</span>
              <button className="ghost-button" type="button" onClick={lockTurn}>
                Reveal follow-up slide
              </button>
            </div>
            <div className="admin-control-group">
              <span className="admin-control-arrow">→</span>
              <button className="ghost-button" type="button" onClick={showLeaderboard}>
                Show leaderboard
              </button>
            </div>
            <div className="admin-control-group">
              <span className="admin-control-arrow">→</span>
              <button className="ghost-button" type="button" onClick={nextTurn}>
                Advance to next turn
              </button>
            </div>
          </div>

          {activeTurn && (
            <div className="admin-live-pulse">
              <span className="admin-pulse-dot" />
              <strong>{activeTurn.title}</strong>
              <span className="admin-pulse-sep">·</span>
              <span>{submittedCount} / {session.teams.length || 0} teams submitted</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const TeamPage = ({
  session,
  clock,
  onSessionChange,
}: {
  session: SessionState
  clock: number
  onSessionChange: (session: SessionState) => void
}) => {
  const location = useLocation()
  const activeTurn = TURN_DEFINITIONS[session.currentTurnIndex]
  const queryTeamId = getQueryTeamId(location.search)
  const storedTeamId = getStoredTeamId()
  const preferredTeamId =
    (queryTeamId && session.teams.some((entry) => entry.id === queryTeamId) && queryTeamId) ||
    (storedTeamId && session.teams.some((entry) => entry.id === storedTeamId) && storedTeamId) ||
    queryTeamId ||
    storedTeamId ||
    ''
  const team = session.teams.find((entry) => entry.id === preferredTeamId)

  const [draftName, setDraftName] = useState('')
  const [draftTable, setDraftTable] = useState('')
  const [draftChips, setDraftChips] = useState<Record<WorkstreamId, number>>(() => defaultChipDraft())
  const [ranking, setRanking] = useState<string[]>([])
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium')
  const [draftRebalance, setDraftRebalance] = useState<Record<WorkstreamId, number>>(() => defaultChipDraft())

  useEffect(() => {
    if (team) {
      setDraftRebalance({ ...team.chips })
    }
  }, [team])

  useEffect(() => {
    if (!team || !activeTurn) {
      return
    }

    const submission = team.submissions[activeTurn.id]
    if (submission) {
      setRanking(submission.ranking)
      setConfidence(submission.confidence)
      return
    }

    setRanking([])
    setConfidence('medium')
  }, [activeTurn, team])

  const remaining = getRemainingSeconds(session, clock)
  const canEditChips = session.screen === 'rules'
  const canRebalance = session.screen === 'turn-brief' && activeTurn?.allowRebalance === true

  const registerTeam = () => {
    const teamRecord = createTeamRecord(
      draftName.trim() || `Table ${draftTable || 'X'}`,
      draftTable.trim() || 'TBD',
    )

    teamRecord.chips = { ...draftChips }

    commitSession(
      (current) => ({
        ...current,
        teams: [...current.teams, teamRecord],
      }),
      onSessionChange,
    )

    window.localStorage.setItem(TEAM_STORAGE_KEY, teamRecord.id)
    window.history.replaceState(null, '', `/team?team=${teamRecord.id}`)
  }

  const saveChips = () => {
    if (!team) {
      return
    }

    commitSession(
      (current) => ({
        ...current,
        teams: current.teams.map((entry) =>
          entry.id === team.id
            ? {
                ...entry,
                chips: { ...draftRebalance },
                statusTag: canRebalance ? 'Mid-crisis posture adjusted' : 'Pre-game posture locked',
              }
            : entry,
        ),
      }),
      onSessionChange,
    )
  }

  const submitRanking = () => {
    if (!team || !activeTurn || ranking.length !== 4) {
      return
    }

    commitSession(
      (current) => ({
        ...current,
        teams: current.teams.map((entry) => {
          if (entry.id !== team.id || entry.submissions[activeTurn.id]) {
            return entry
          }

          return applyTurnOutcome(entry, activeTurn, ranking, confidence)
        }),
      }),
      onSessionChange,
    )
  }

  if (!team) {
    return (
      <div className="page-shell team-shell register-shell-full">
        <div className="register-hero">
          <div className="register-hero-orb register-hero-orb-left" />
          <div className="register-hero-orb register-hero-orb-right" />

          <div className="register-hero-content">
            <p className="eyebrow">Table onboarding</p>
            <h1>Set your table's strategic posture</h1>
            <p className="lede">
              Allocate 60 coins across six resilience workstreams. Each coin represents
              a pre-crisis investment that will determine how effective your actions are
              when the crisis hits. You must assign all 60 coins to proceed.
            </p>
          </div>

          <div className="register-form-row">
            <label className="register-field">
              <span>Team name</span>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="e.g. Team Monsoon"
              />
            </label>
            <label className="register-field">
              <span>Table number</span>
              <input
                value={draftTable}
                onChange={(event) => setDraftTable(event.target.value)}
                placeholder="e.g. 3"
              />
            </label>
          </div>
        </div>

        <section className="register-allocator-section">
          <ChipAllocator chips={draftChips} onChange={setDraftChips} />
        </section>

        <div className="register-action-row">
          <button
            className="primary-button register-submit-button"
            type="button"
            disabled={sumChipCount(draftChips) !== TOTAL_ALLOCATION_COINS}
            onClick={registerTeam}
          >
            {sumChipCount(draftChips) === TOTAL_ALLOCATION_COINS
              ? 'Lock posture and enter the game'
              : `Assign ${TOTAL_ALLOCATION_COINS - sumChipCount(draftChips)} more coins to continue`}
          </button>
        </div>
      </div>
    )
  }

  const activeSubmission = activeTurn ? team.submissions[activeTurn.id] : undefined
  const moveLimit = calculateChipMoveCount(team.chips, draftRebalance)

  return (
    <div className="page-shell team-focus-shell-v2">
      <TeamFocusHeaderV2
        team={team}
        activeTurn={activeTurn}
        remaining={remaining}
        screen={session.screen}
        submitted={!!activeSubmission}
        submissionCount={activeTurn ? countSubmittedTeams(session, activeTurn.id) : 0}
        totalTeams={session.teams.length}
      />

      <div className="team-focus-body">
        {/* Game-phase views */}
        {session.screen !== 'turn-live' && session.screen !== 'turn-review' && (
          <section className="team-stage-preview-card">
            <BroadcastSurface session={session} clock={clock} immersive={false} teamView />
          </section>
        )}

        {(canEditChips || canRebalance) && (
          <section className="team-posture-card-v2">
            <div className="posture-card-head">
              <h3>{canRebalance ? 'Mid-crisis rebalance' : 'Your strategic posture'}</h3>
              {canRebalance && <span className="posture-limit-badge">Max {REBALANCE_COIN_LIMIT} shifts</span>}
            </div>
            <ChipAllocator chips={draftRebalance} onChange={setDraftRebalance} />
            {canRebalance && <p className="posture-hint">Current rebalance cost: {moveLimit} of {REBALANCE_COIN_LIMIT} coin shifts used.</p>}
            <button
              className="primary-button posture-save-btn"
              type="button"
              disabled={sumChipCount(draftRebalance) !== TOTAL_ALLOCATION_COINS || (canRebalance && moveLimit > REBALANCE_COIN_LIMIT)}
              onClick={saveChips}
            >
              Save posture
            </button>
          </section>
        )}

        {session.screen === 'turn-live' && activeTurn && (
          <section className="team-turn-panel-v2">
            {activeSubmission ? (
              <OutcomeCardV2 team={team} submission={activeSubmission} turn={activeTurn} />
            ) : (
              <>
                <div className="turn-panel-banner">
                  <div>
                    <p className="eyebrow">Turn {session.currentTurnIndex + 1}</p>
                    <h2>{activeTurn.title}</h2>
                  </div>
                  <div className="countdown-chip">{formatCountdown(remaining)}</div>
                </div>
                <p className="turn-instruction">Rank the top 4 actions in priority order before the timer ends.</p>
                <RankingBoard actions={activeTurn.actions} ranking={ranking} onChange={setRanking} />
                <div className="turn-submit-row">
                  <div className="confidence-row">
                    {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level) => (
                      <button
                        key={level}
                        className={`confidence-chip-v2 ${confidence === level ? 'is-active' : ''}`}
                        type="button"
                        onClick={() => setConfidence(level)}
                      >
                        {CONFIDENCE_LABELS[level]}
                      </button>
                    ))}
                  </div>
                  <button className="primary-button submit-lock-btn" type="button" disabled={ranking.length !== 4} onClick={submitRanking}>
                    Lock table answer
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {session.screen === 'turn-review' && activeSubmission && activeTurn && (
          <section className="team-turn-panel-v2">
            <OutcomeCardV2 team={team} submission={activeSubmission} turn={activeTurn} />
          </section>
        )}

        {session.screen !== 'turn-live' && (
          <section className="team-standing-panel-v2">
            <div className="standing-hero">
              <p className="eyebrow">Enterprise resilience</p>
              <strong className="standing-score">{team.score}</strong>
              <span className="standing-status">{team.statusTag}</span>
            </div>
            <KpiStripV2 kpis={team.kpis} />
            <div className="standing-meta-row">
              <span className="standing-meta-chip">{sumChipCount(team.chips)} / {TOTAL_ALLOCATION_COINS} coins deployed</span>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

const TeamFocusHeaderV2 = ({
  team,
  activeTurn,
  remaining,
  screen,
  submitted,
  submissionCount,
  totalTeams,
}: {
  team: TeamRecord
  activeTurn?: TurnDefinition
  remaining: number
  screen: SessionState['screen']
  submitted: boolean
  submissionCount: number
  totalTeams: number
}) => {
  const isLive = screen === 'turn-live'
  return (
    <header className="team-header-v2">
      <div className="team-header-v2-orb" />
      <div className="team-header-v2-left">
        <p className="eyebrow">{team.name} · Table {team.tableNumber}</p>
        <h1>{activeTurn ? activeTurn.title : 'Stand by'}</h1>
        <p className="team-header-phase">
          {isLive
            ? `${submitted ? 'Answer locked' : 'Answering'} · ${submissionCount} of ${totalTeams} tables submitted`
            : `Phase: ${labelForScreen(screen).toLowerCase()}`}
        </p>
      </div>
      <div className="team-header-v2-right">
        <div className="team-header-score-ring">
          <span className="team-header-score-num">{team.score}</span>
          <span className="team-header-score-label">Score</span>
        </div>
        {isLive && (
          <div className="countdown-chip live-chip">{formatCountdown(remaining)}</div>
        )}
      </div>
    </header>
  )
}

const OutcomeCardV2 = ({
  team,
  submission,
  turn,
}: {
  team: TeamRecord
  submission: NonNullable<TeamRecord['submissions'][string]>
  turn: TurnDefinition
}) => (
  <article className="outcome-card-v2">
    <div className="outcome-head">
      <div>
        <p className="eyebrow">Submission locked</p>
        <h3>{CONFIDENCE_LABELS[submission.confidence]}</h3>
      </div>
      <div className="outcome-score-badge">
        <span>{formatSignedNumber(submission.scoreDelta)}</span>
        <small>score delta</small>
      </div>
    </div>

    <ol className="outcome-ranking">
      {submission.ranking.map((actionId, index) => {
        const action = turn.actions.find((entry) => entry.id === actionId)
        return action ? (
          <li key={action.id}>
            <span className="outcome-rank-num">{index + 1}</span>
            <span>{action.title}</span>
          </li>
        ) : null
      })}
    </ol>

    <p className="outcome-rationale">{submission.rationale}</p>

    <div className="outcome-deltas">
      {(Object.keys(submission.kpiDelta) as (keyof KpiSet)[]).map((key) => {
        const delta = submission.kpiDelta[key]
        const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
        return (
          <div key={key} className={`outcome-delta-chip ${direction}`}>
            <span className="outcome-delta-label">{KPI_LABELS[key]}</span>
            <strong>{formatSignedNumber(delta)}</strong>
          </div>
        )
      })}
    </div>

    <div className="outcome-footer">
      <span className="outcome-footer-chip">Resilience score {team.score}</span>
      <span className="outcome-footer-chip">{sumChipCount(team.chips)} / {TOTAL_ALLOCATION_COINS} coins</span>
    </div>
  </article>
)

const KpiStripV2 = ({ kpis }: { kpis: KpiSet }) => (
  <div className="kpi-strip-v2">
    {(Object.keys(kpis) as (keyof KpiSet)[]).map((key) => (
      <div key={key} className="kpi-tile-v2">
        <div className="kpi-tile-v2-bar" style={{ width: `${kpis[key]}%` }} data-kpi={key} />
        <span className="kpi-tile-v2-label">{KPI_LABELS[key]}</span>
        <strong className="kpi-tile-v2-value">{kpis[key]}</strong>
      </div>
    ))}
  </div>
)

const DisplayPage = ({ session, clock }: { session: SessionState; clock: number }) => (
  <div className="display-shell stage-display-shell">
    <BroadcastSurface session={session} clock={clock} immersive />
  </div>
)

const SideLeaderboardPage = ({ session, clock }: { session: SessionState; clock: number }) => (
  <div className="display-shell side-display-shell">
    <SideLeaderboardSurface session={session} clock={clock} />
  </div>
)

const RouteCard = ({ title, href, body }: { title: string; href: string; body: string }) => (
  <Link to={href} className="route-card">
    <span>Open route</span>
    <strong>{title}</strong>
    <p>{body}</p>
  </Link>
)

const RulesExperience = ({ stageMode }: { stageMode: boolean }) => {
  if (stageMode) {
    return (
      <div className="rules-stage-v2">
        <div className="rules-stage-orb rules-stage-orb-top" />
        <div className="rules-stage-orb rules-stage-orb-bot" />

        <AutoFitFrame className="rules-stage-fit-v2">
          <div className="rules-stage-content">
            <header className="rules-stage-hero">
              <p className="eyebrow">Facilitator handoff</p>
              <h1>How this game works</h1>
              <p className="rules-stage-tagline">Trade-offs first. Answers second.</p>
            </header>

            <div className="rules-stage-cards">
              {RULE_PRESENTATION.map((rule, index) => (
                <article key={rule.title} className="rules-card-v2" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="rules-card-icon-v2">
                    <RuleIcon kind={rule.kind} />
                  </div>
                  <div className="rules-card-text-v2">
                    <span>{rule.eyebrow}</span>
                    <strong>{rule.title}</strong>
                    <p>{rule.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </AutoFitFrame>
      </div>
    )
  }

  return (
    <div className="rules-team-v2">
      <header className="rules-team-head-v2">
        <p className="eyebrow">Team instructions</p>
        <h2>What your table will do</h2>
        <p className="rules-team-sub">Assign all 60 coins, then debate, rank, and lock before the timer ends.</p>
      </header>

      <div className="rules-team-cards-v2">
        {RULE_PRESENTATION.map((rule) => (
          <article key={rule.title} className="rules-card-v2 rules-card-team-v2">
            <div className="rules-card-icon-v2">
              <RuleIcon kind={rule.kind} />
            </div>
            <div className="rules-card-text-v2">
              <span>{rule.eyebrow}</span>
              <strong>{rule.title}</strong>
              <p>{rule.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

const RuleIcon = ({ kind }: { kind: RuleKind }) => {
  if (kind === 'steer') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="rgba(184,230,90,0.2)" strokeWidth="1.2" fill="none" />
        <path d="M6 23h20" stroke="rgba(184,230,90,0.8)" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 20V9l7-3 7 3v11" stroke="rgba(184,230,90,0.7)" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(134,188,37,0.1)" />
        <path d="M16 14v9" stroke="rgba(184,230,90,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'chips') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="rgba(184,230,90,0.2)" strokeWidth="1.2" fill="none" />
        <circle cx="16" cy="10" r="5" stroke="rgba(184,230,90,0.6)" strokeWidth="1.5" fill="rgba(134,188,37,0.1)" />
        <circle cx="16" cy="10" r="2" fill="rgba(184,230,90,0.7)" />
        <circle cx="10" cy="20" r="4" stroke="rgba(0,163,161,0.6)" strokeWidth="1.5" fill="rgba(0,163,161,0.08)" />
        <circle cx="22" cy="20" r="4" stroke="rgba(0,163,161,0.5)" strokeWidth="1.5" fill="rgba(0,163,161,0.06)" />
        <circle cx="10" cy="20" r="1.5" fill="rgba(0,163,161,0.6)" />
        <circle cx="22" cy="20" r="1.5" fill="rgba(0,163,161,0.5)" />
      </svg>
    )
  }

  if (kind === 'rank') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="rgba(184,230,90,0.2)" strokeWidth="1.2" fill="none" />
        <rect x="8" y="20" width="16" height="1.5" rx="0.75" fill="rgba(184,230,90,0.2)" />
        <rect x="8" y="14" width="12" height="1.5" rx="0.75" fill="rgba(184,230,90,0.3)" />
        <rect x="8" y="8" width="8" height="1.5" rx="0.75" fill="rgba(184,230,90,0.45)" />
        <circle cx="25" cy="7" r="4" stroke="rgba(0,163,161,0.7)" strokeWidth="1.5" fill="rgba(0,163,161,0.12)" />
        <path d="M23 7l1.5 1.5L27 6" stroke="rgba(0,163,161,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="rgba(184,230,90,0.2)" strokeWidth="1.2" fill="none" />
      <path d="M7 16a9 9 0 1 0 18 0 9 9 0 1 0-18 0Z" stroke="rgba(184,230,90,0.5)" strokeWidth="1.5" fill="rgba(134,188,37,0.06)" />
      <path d="M12 16l3 3 5-6" stroke="rgba(184,230,90,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const AutoFitFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const recalc = () => {
      if (!outerRef.current || !innerRef.current) {
        return
      }

      const outer = outerRef.current.getBoundingClientRect()
      const innerWidth = innerRef.current.scrollWidth
      const innerHeight = innerRef.current.scrollHeight

      if (innerWidth === 0 || innerHeight === 0) {
        return
      }

      const widthRatio = outer.width / innerWidth
      const heightRatio = outer.height / innerHeight
      const scale = Math.min(widthRatio, heightRatio, 1)

      innerRef.current.style.setProperty('--auto-fit-scale', String(scale))
    }

    recalc()

    const resizeObserver = new ResizeObserver(() => recalc())
    if (outerRef.current) {
      resizeObserver.observe(outerRef.current)
    }

    window.addEventListener('resize', recalc)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', recalc)
    }
  }, [children])

  return (
    <div ref={outerRef} className={`auto-fit-frame ${className ?? ''}`.trim()}>
      <div ref={innerRef} className="auto-fit-frame-inner">
        {children}
      </div>
    </div>
  )
}

const BroadcastSurface = ({
  session,
  clock,
  immersive,
  teamView = false,
}: {
  session: SessionState
  clock: number
  immersive: boolean
  teamView?: boolean
}) => {
  const activeTurn = TURN_DEFINITIONS[session.currentTurnIndex]
  const remaining = getRemainingSeconds(session, clock)
  const currentIntro = INTRO_SLIDES[session.introIndex]
  const submittedCount = countSubmittedTeams(session, activeTurn?.id)
  const stageMode = !teamView
  const deckOnlyMode = stageMode && ((session.screen === 'intro' && currentIntro) || session.screen === 'turn-review')

  return (
    <div
      className={`broadcast-surface ${immersive ? 'immersive' : ''} ${stageMode ? 'stage-mode' : 'team-mode'} ${deckOnlyMode ? 'deck-only-mode' : ''}`}
    >
      {session.screen === 'intro' && currentIntro ? (
        <div className="broadcast-panel intro-panel">
          <DeckSlideFrame slideNumber={currentIntro.number} fullBleed={stageMode} />
        </div>
      ) : null}

      {session.screen === 'rules' ? (
        <RulesExperience stageMode={stageMode} />
      ) : null}

      {session.screen === 'turn-brief' && activeTurn ? (
        <TurnBriefingExperience turn={activeTurn} turnIndex={session.currentTurnIndex} stageMode={stageMode} />
      ) : null}

      {session.screen === 'turn-live' && activeTurn ? (
        stageMode ? (
          <div className="broadcast-panel stage-live-overlay-panel">
            <TurnBriefingExperience turn={activeTurn} turnIndex={session.currentTurnIndex} stageMode />
            <div className="live-turn-overlay-chip">
              <span>{formatCountdown(remaining)}</span>
              <small>{submittedCount} of {session.teams.length || 0} answered</small>
            </div>
          </div>
        ) : (
          <div className={`broadcast-panel live-panel ${stageMode ? 'stage-live-panel' : 'team-live-panel'}`}>
            <div className="countdown-ring">
              <span>{formatCountdown(remaining)}</span>
              <small>{stageMode ? 'Tables are answering' : 'Answer now'}</small>
            </div>
            <div className="live-meta">
              <p className="eyebrow">{stageMode ? 'Live turn' : 'Table action'}</p>
              <h2>{activeTurn.title}</h2>
              <p>{stageMode ? activeTurn.subtitle : 'Rank your top four actions before the timer ends.'}</p>
              <div className="live-progress">
                <div className="progress-bar">
                  <span className={progressWidthClass(submittedCount, session.teams.length)} />
                </div>
                <strong>
                  {submittedCount} / {session.teams.length || 0} tables submitted
                </strong>
              </div>
            </div>
          </div>
        )
      ) : null}

      {session.screen === 'turn-review' && activeTurn ? (
        <div className={`broadcast-panel review-panel ${stageMode ? 'stage-review-panel' : 'team-review-panel'}`}>
          {!stageMode ? <p className="eyebrow">Facilitator debrief</p> : null}
          <div className="review-grid">
            <DeckSlideFrame slideNumber={activeTurn.followUpSlide.number} fullBleed={stageMode} />
            {!stageMode ? (
              <article className="review-note">
                <h3>What this turn was testing</h3>
                <p>{activeTurn.debrief}</p>
              </article>
            ) : null}
          </div>
        </div>
      ) : null}

      {session.screen === 'leaderboard' ? (
        <div className="broadcast-panel leaderboard-panel">
          <p className="eyebrow">Room scoreboard</p>
          <h2>Enterprise resilience leaderboard</h2>
          <LeaderboardTable teams={session.teams} displayMode="display" />
        </div>
      ) : null}
    </div>
  )
}

const SideLeaderboardSurface = ({ session, clock }: { session: SessionState; clock: number }) => {
  const activeTurn = TURN_DEFINITIONS[session.currentTurnIndex]
  const remaining = getRemainingSeconds(session, clock)
  const leaderboardLive = shouldShowSideLeaderboard(session)
  const submittedCount = countSubmittedTeams(session, activeTurn?.id)

  if (!leaderboardLive) {
    return (
      <div className="side-screen-placeholder">
        <DeckSlideFrame slideNumber={1} fullBleed />
      </div>
    )
  }

  return (
    <div className="side-leaderboard-surface">
      <AutoFitFrame className="side-leaderboard-fit">
        <div className="side-leaderboard-shell">
          <div className="side-leaderboard-header">
            <div>
              <p className="eyebrow">Live leaderboard</p>
              <h1>{activeTurn ? activeTurn.title : 'Enterprise resilience'}</h1>
              <p className="top-nav-copy">
                {session.screen === 'turn-live'
                  ? `${submittedCount} of ${session.teams.length} teams submitted · ${formatCountdown(remaining)} remaining`
                  : 'Scores update after each lock and reveal.'}
              </p>
            </div>
            <div className="team-focus-meta">
              <span className="status-pill">Teams {session.teams.length}</span>
              <span className="status-pill">Phase {labelForScreen(session.screen)}</span>
            </div>
          </div>
          <LeaderboardTable teams={session.teams} displayMode="side" />
        </div>
      </AutoFitFrame>
    </div>
  )
}

const TurnBriefingExperience = ({
  turn,
  turnIndex,
  stageMode,
}: {
  turn: TurnDefinition
  turnIndex: number
  stageMode: boolean
}) => {
  const evidence = turn.evidence.slice(0, 3)
  const pressure = turn.pressure.slice(0, 3)
  const stageEvidence = turn.stageSignals ?? turn.evidence.slice(0, 2)
  const stagePressure = turn.stagePressure ?? turn.pressure.slice(0, 2)
  const guides = TURN_DECISION_GUIDES[turn.id] ?? [
    'What moves now?',
    'What can wait?',
    'What business pain is acceptable?',
  ]
  const stageGuides = turn.stageResolve ?? guides.slice(0, 2)
  const stageNarrative = turn.stageNarrative ?? turn.narrative

  if (stageMode) {
    return (
      <div className="turn-brief-stage-v2">
        <div className="turn-brief-orb turn-brief-orb-top" />
        <div className="turn-brief-orb turn-brief-orb-bot" />

        <AutoFitFrame className="turn-brief-fit-v2">
          <div className="turn-brief-stage-content">
            <header className="turn-brief-stage-head">
              <p className="eyebrow">Turn {turnIndex + 1}</p>
              <h1>{turn.title}</h1>
              <span className="turn-brief-stage-time">{turn.storyTime}</span>
            </header>

            <div className="turn-brief-stage-grid">
              <article className="turn-brief-narrative-card">
                <svg className="turn-brief-card-icon" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" stroke="rgba(255,107,87,0.4)" strokeWidth="1.5" fill="none" />
                  <path d="M16 10v8M16 22h0" stroke="rgba(255,107,87,0.8)" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span className="turn-brief-card-label">What changed</span>
                <p className="turn-brief-narrative-text">{stageNarrative}</p>
                <div className="turn-brief-pressure-row">
                  {stagePressure.map((item) => (
                    <span key={item} className="turn-brief-pressure-tag">{item}</span>
                  ))}
                </div>
              </article>

              <article className="turn-brief-signals-card">
                <svg className="turn-brief-card-icon" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" stroke="rgba(255,204,0,0.4)" strokeWidth="1.5" fill="none" />
                  <circle cx="16" cy="10" r="3" fill="rgba(255,204,0,0.5)" />
                  <path d="M16 13v4M16 19v2" stroke="rgba(255,204,0,0.6)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 24l2-2M24 24l-2-2" stroke="rgba(255,204,0,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="turn-brief-card-label">Key signals</span>
                <ul className="turn-brief-list">
                  {stageEvidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="turn-brief-resolve-card">
                <svg className="turn-brief-card-icon" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" stroke="rgba(0,163,161,0.4)" strokeWidth="1.5" fill="none" />
                  <path d="M10 20l4 4 8-8" stroke="rgba(0,163,161,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="turn-brief-card-label">Your table must resolve</span>
                <ul className="turn-brief-list turn-brief-list-emphasis">
                  {stageGuides.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </AutoFitFrame>
      </div>
    )
  }

  return (
    <div className="turn-brief-team-v2">
      <header className="turn-brief-team-head">
        <div>
          <p className="eyebrow">Turn {turnIndex + 1}</p>
          <h2>{turn.title}</h2>
        </div>
        <span className="turn-brief-team-time">{turn.storyTime}</span>
      </header>

      <p className="turn-brief-team-narrative">{turn.narrative}</p>

      <div className="turn-brief-team-cards">
        <article className="turn-brief-team-card">
          <span className="turn-brief-card-label">Key signals</span>
          <ul className="turn-brief-list">
            {evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="turn-brief-team-card">
          <span className="turn-brief-card-label">Room pressure</span>
          <ul className="turn-brief-list">
            {pressure.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <p className="turn-brief-team-hint">Your table will rank the top four actions when the timer opens.</p>
    </div>
  )
}

const DeckSlideFrame = ({ slideNumber, fullBleed = false }: { slideNumber: number; fullBleed?: boolean }) => (
  <div className={`deck-frame-wrap ${fullBleed ? 'full-bleed' : ''}`}>
    <iframe
      className="deck-frame"
      src={`${DECK_HTML_PATH}#${slideNumber}`}
      title={`Deck slide ${slideNumber}`}
      loading="eager"
    />
  </div>
)

const SlideCard = ({
  slide,
  compact = false,
  hero = false,
}: {
  slide: SlideReference
  compact?: boolean
  hero?: boolean
}) => (
  <article className={`slide-card ${compact ? 'compact' : ''} ${hero ? 'hero' : ''}`}>
    <span>Slide {slide.number}</span>
    <strong>{slide.title}</strong>
    <p>{slide.hook}</p>
    <small>{slide.takeaway}</small>
  </article>
)

const LeaderboardTable = ({
  teams,
  compact = false,
  displayMode = 'default',
}: {
  teams: TeamRecord[]
  compact?: boolean
  displayMode?: 'default' | 'display' | 'side'
}) => {
  const sortedTeams = [...teams].sort((left, right) => right.score - left.score)

  if (sortedTeams.length === 0) {
    return <p className="helper-text">No teams registered yet.</p>
  }

  return (
    <div className={`leaderboard-table ${compact ? 'compact' : ''} leaderboard-table-${displayMode}`}>
      {sortedTeams.map((team, index) => (
        <div key={team.id} className={`leaderboard-row leaderboard-row-${displayMode} ${index < 3 ? 'leaderboard-row-top' : ''}`}>
          <strong className="leaderboard-rank">{index + 1}</strong>
          <div>
            <span>{team.name}</span>
            <small>{team.statusTag}</small>
          </div>
          <b className="leaderboard-score">{team.score}</b>
        </div>
      ))}
    </div>
  )
}

const ChipAllocator = ({
  chips,
  onChange,
}: {
  chips: Record<WorkstreamId, number>
  onChange: (value: Record<WorkstreamId, number>) => void
}) => {
  const spent = sumChipCount(chips)
  const remaining = TOTAL_ALLOCATION_COINS - spent

  const setWorkstreamValue = (workstream: WorkstreamId, rawValue: number) => {
    const clamped = clamp(rawValue, 0, TOTAL_ALLOCATION_COINS)
    const delta = clamped - (chips[workstream] ?? 0)
    if (spent + delta > TOTAL_ALLOCATION_COINS) return
    onChange({ ...chips, [workstream]: clamped })
  }

  return (
    <div className="chip-grid">
      {(Object.keys(chips) as WorkstreamId[]).map((workstream) => (
        <article key={workstream} className="chip-card">
          <div className="chip-card-head">
            <span className="chip-ws-code">{workstream}</span>
            <strong>{WORKSTREAM_LABELS[workstream]}</strong>
          </div>
          <div className="chip-slider-row">
            <input
              type="range"
              min={0}
              max={TOTAL_ALLOCATION_COINS}
              value={chips[workstream] ?? 0}
              onChange={(e) => setWorkstreamValue(workstream, Number(e.target.value))}
              className="chip-slider"
            />
            <b className="chip-value">{chips[workstream] ?? 0}</b>
          </div>
        </article>
      ))}
      <div className={`chip-total ${spent === TOTAL_ALLOCATION_COINS ? 'chip-total-done' : ''}`}>
        <span className="chip-total-spent">{spent}</span>
        <span className="chip-total-sep">/</span>
        <span className="chip-total-max">{TOTAL_ALLOCATION_COINS}</span>
        <span className="chip-total-label">coins assigned</span>
        {spent < TOTAL_ALLOCATION_COINS && (
          <span className="chip-total-remaining">{remaining} remaining</span>
        )}
        {spent === TOTAL_ALLOCATION_COINS && (
          <span className="chip-total-ready">✓ ready</span>
        )}
      </div>
    </div>
  )
}

const RankCard = ({
  action,
  rank,
  onRemove,
}: {
  action: TurnDefinition['actions'][number]
  rank?: number
  onRemove?: () => void
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ actionId: action.id, fromRanked: rank !== undefined, fromIndex: rank !== undefined ? rank - 1 : -1 }))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className={`rank-card-v3 ${rank !== undefined ? 'is-ranked' : 'is-unranked'}`}
      draggable
      onDragStart={handleDragStart}
    >
      {rank !== undefined && (
        <>
          <span className="rank-card-drag" aria-hidden="true">⠿</span>
          <span className="rank-card-num">{rank}</span>
        </>
      )}
      {rank === undefined && (
        <span className="rank-card-plus" aria-hidden="true">+</span>
      )}
      <div className="rank-card-body">
        <strong>{action.title}</strong>
        <span className="rank-card-summary">{action.summary}</span>
      </div>
      {rank !== undefined && onRemove && (
        <button className="rank-card-remove" type="button" onClick={onRemove} aria-label="Remove from ranking">×</button>
      )}
    </div>
  )
}

const RankingBoard = ({
  actions,
  ranking,
  onChange,
}: {
  actions: TurnDefinition['actions']
  ranking: string[]
  onChange: (value: string[]) => void
}) => {
  const ranked = ranking.map((id) => actions.find((a) => a.id === id)).filter(Boolean) as TurnDefinition['actions']
  const unranked = actions.filter((a) => !ranking.includes(a.id))

  const addToRanking = (actionId: string) => {
    if (ranking.length >= 4) return
    onChange([...ranking, actionId])
  }

  const removeFromRanking = (actionId: string) => {
    onChange(ranking.filter((id) => id !== actionId))
  }

  const moveWithinRanking = (fromIndex: number, toIndex: number) => {
    const next = [...ranking]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    onChange(next)
  }

  const handleDropOnRanked = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return
    try {
      const { actionId, fromRanked, fromIndex } = JSON.parse(raw) as { actionId: string; fromRanked: boolean; fromIndex: number }
      if (fromRanked) {
        moveWithinRanking(fromIndex, dropIndex)
      } else {
        if (ranking.length >= 4) return
        const next = [...ranking]
        next.splice(dropIndex, 0, actionId)
        onChange(next)
      }
    } catch { /* ignore malformed drag data */ }
  }

  const handleDropOnUnranked = (e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return
    try {
      const { actionId, fromRanked } = JSON.parse(raw) as { actionId: string; fromRanked: boolean }
      if (fromRanked) {
        removeFromRanking(actionId)
      }
    } catch { /* ignore */ }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div className="ranking-v3">
      <div className="ranking-v3-zone" onDragOver={handleDragOver}>
        <div className="ranking-v3-zone-head">
          <span>Your ranking</span>
          <span className="ranking-v3-count">{ranking.length} / 4</span>
        </div>
        <div className="ranking-v3-slots">
          {[0, 1, 2, 3].map((index) => {
            const action = ranked[index]
            return action ? (
              <div
                key={action.id}
                className="ranking-v3-slot"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnRanked(e, index)}
              >
                <RankCard action={action} rank={index + 1} onRemove={() => removeFromRanking(action.id)} />
              </div>
            ) : (
              <div
                key={`empty-${index}`}
                className="ranking-v3-slot ranking-v3-slot-empty"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnRanked(e, index)}
              >
                <span className="ranking-v3-slot-num">{index + 1}</span>
                <span className="ranking-v3-slot-hint">Drop an action here</span>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="ranking-v3-zone ranking-v3-zone-unranked"
        onDragOver={handleDragOver}
        onDrop={handleDropOnUnranked}
      >
        <div className="ranking-v3-zone-head">
          <span>Remaining options</span>
          <span className="ranking-v3-count">{unranked.length}</span>
        </div>
        <div className="ranking-v3-unranked-list">
          {unranked.map((action) => (
            <div
              key={action.id}
              className="ranking-v3-slot"
              onClick={() => addToRanking(action.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.stopPropagation()
                addToRanking(action.id)
              }}
            >
              <RankCard action={action} />
            </div>
          ))}
          {unranked.length === 0 && (
            <p className="ranking-v3-empty-msg">All 6 actions ranked. Drag to reorder above.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const commitSession = (
  updater: (current: SessionState) => SessionState,
  onSessionChange: (session: SessionState) => void,
) => {
  return fetchSessionSnapshot().then((baseSession) => {
    const next = updater(baseSession)
    return persistSession(next).then((savedSession) => {
      onSessionChange(savedSession)
      return savedSession
    })
  })
}

const getQueryTeamId = (search: string) => new URLSearchParams(search).get('team')

const getStoredTeamId = () => window.localStorage.getItem(TEAM_STORAGE_KEY) ?? ''

const labelForScreen = (screen: SessionState['screen']) => {
  if (screen === 'turn-brief') return 'Turn briefing'
  if (screen === 'turn-live') return 'Live turn'
  if (screen === 'turn-review') return 'Post-turn slide'
  return screen.charAt(0).toUpperCase() + screen.slice(1)
}

const shouldShowSideLeaderboard = (session: SessionState) => {
  const gameStarted =
    session.screen === 'turn-brief' ||
    session.screen === 'turn-live' ||
    session.screen === 'turn-review' ||
    session.screen === 'leaderboard'

  return session.teams.length > 0 && gameStarted
}

const getRemainingSeconds = (session: SessionState, clock: number) => {
  if (session.timerStatus === 'paused' && session.pausedSecondsRemaining !== null) {
    return session.pausedSecondsRemaining
  }

  if (session.timerStatus === 'running' && session.timerEndsAt) {
    return Math.max(0, Math.ceil((session.timerEndsAt - clock) / 1000))
  }

  return session.turnTimerSeconds
}

const countSubmittedTeams = (session: SessionState, turnId?: string) => {
  if (!turnId) {
    return 0
  }

  return session.teams.filter((team) => team.submissions[turnId]).length
}

const defaultChipDraft = () => ({ W1: 0, W2: 0, W3: 0, W4: 0, W5: 0, W6: 0 })

const sumChipCount = (chips: Record<WorkstreamId, number>) =>
  Object.values(chips).reduce((total, value) => total + value, 0)

const calculateChipMoveCount = (
  current: Record<WorkstreamId, number>,
  draft: Record<WorkstreamId, number>,
) => {
  const absoluteShift = (Object.keys(current) as WorkstreamId[]).reduce(
    (total, workstream) => total + Math.abs(current[workstream] - draft[workstream]),
    0,
  )
  return absoluteShift / 2
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum)

const roundKpiDelta = (delta: KpiSet): KpiSet => ({
  continuity: Math.round(delta.continuity),
  data: Math.round(delta.data),
  financial: Math.round(delta.financial),
  regulatory: Math.round(delta.regulatory),
  trust: Math.round(delta.trust),
})

const addScaledEffects = (current: KpiSet, incoming: KpiSet, weight: number): KpiSet => ({
  continuity: current.continuity + incoming.continuity * weight,
  data: current.data + incoming.data * weight,
  financial: current.financial + incoming.financial * weight,
  regulatory: current.regulatory + incoming.regulatory * weight,
  trust: current.trust + incoming.trust * weight,
})

const applyTurnOutcome = (
  team: TeamRecord,
  turn: TurnDefinition,
  ranking: string[],
  confidence: ConfidenceLevel,
): TeamRecord => {
  let qualityScore = 0
  let draftDelta: KpiSet = { continuity: 0, data: 0, financial: 0, regulatory: 0, trust: 0 }

  ranking.forEach((actionId, index) => {
    const action = turn.actions.find((entry) => entry.id === actionId)
    if (!action) {
      return
    }

    const weight = SLOT_WEIGHTS[index] ?? 0

    // Per-action workstream matching: coins amplify actions aligned with the team's investment
    let wsMultiplier = 1.0
    if (action.workstream) {
      const coinsInWs = team.chips[action.workstream] ?? 0
      if (coinsInWs >= Math.ceil(MAX_COINS_PER_WORKSTREAM * 0.7)) {
        wsMultiplier = 1.25
      } else if (coinsInWs >= Math.ceil(MAX_COINS_PER_WORKSTREAM * 0.4)) {
        wsMultiplier = 1.10
      } else if (coinsInWs > 0) {
        wsMultiplier = 1.0
      } else {
        wsMultiplier = 0.85
      }
    }

    qualityScore += action.value * weight * wsMultiplier
    draftDelta = addScaledEffects(draftDelta, action.effects, weight)
  })

  const contradictionNotes = turn.contradictions.filter((rule) => {
    const earlierIndex = ranking.indexOf(rule.earlierActionId)
    const laterIndex = ranking.indexOf(rule.laterActionId)
    return earlierIndex !== -1 && laterIndex !== -1 && earlierIndex < laterIndex
  })

  qualityScore -= contradictionNotes.reduce((total, rule) => total + rule.scorePenalty, 0)

  if (confidence === 'high') {
    if (qualityScore >= 60) {
      draftDelta.trust += 2
    } else {
      draftDelta.trust -= 3
      draftDelta.regulatory += 1
    }
  }

  if (confidence === 'medium') {
    if (qualityScore >= 60) {
      draftDelta.trust += 1
    } else {
      draftDelta.trust -= 1
    }
  }

  const kpiDelta = roundKpiDelta(draftDelta)
  const nextKpis: KpiSet = {
    continuity: clamp(team.kpis.continuity + kpiDelta.continuity, 0, 100),
    data: clamp(team.kpis.data + kpiDelta.data, 0, 100),
    financial: clamp(team.kpis.financial + kpiDelta.financial, 0, 100),
    regulatory: clamp(team.kpis.regulatory + kpiDelta.regulatory, 0, 100),
    trust: clamp(team.kpis.trust + kpiDelta.trust, 0, 100),
  }

  const nextScore = computeEnterpriseScore(nextKpis)
  const firstAction = turn.actions.find((entry) => entry.id === ranking[0])

  return {
    ...team,
    kpis: nextKpis,
    score: nextScore,
    statusTag: deriveStatusTag(nextKpis, qualityScore),
    submissions: {
      ...team.submissions,
      [turn.id]: {
        ranking,
        confidence,
        scoreDelta: nextScore - team.score,
        kpiDelta,
        rationale: buildRationale(
          turn,
          firstAction?.title ?? 'No first move selected',
          contradictionNotes.map((entry) => entry.note),
          confidence,
          team.chips,
          ranking.map((id) => turn.actions.find((a) => a.id === id)).filter(Boolean) as TurnDefinition['actions'],
        ),
        submittedAt: Date.now(),
      },
    },
  }
}

const computeEnterpriseScore = (kpis: KpiSet) =>
  Math.round(
    0.3 * kpis.continuity +
      0.25 * kpis.trust +
      0.15 * (100 - kpis.data) +
      0.15 * (100 - kpis.financial) +
      0.15 * (100 - kpis.regulatory),
  )

const deriveStatusTag = (kpis: KpiSet, qualityScore: number) => {
  if (kpis.regulatory >= 15) {
    return 'Fast decisions, rising regulatory heat'
  }

  if (kpis.data >= 18) {
    return 'Exposure rising faster than control'
  }

  if (kpis.continuity <= 78) {
    return 'Containment helped, continuity strained'
  }

  if (qualityScore >= 65) {
    return 'Balanced play, low signal drift'
  }

  return 'Holding the line under pressure'
}

const buildRationale = (
  turn: TurnDefinition,
  firstMove: string,
  contradictions: string[],
  confidence: ConfidenceLevel,
  teamChips?: Record<WorkstreamId, number>,
  rankedActions?: TurnDefinition['actions'],
) => {
  const parts = [
    `Opened with ${firstMove}.`,
    turn.debrief,
    contradictions.length > 0 ? contradictions.join(' ') : 'Sequencing stayed coherent across the top four choices.',
    `Confidence call: ${CONFIDENCE_LABELS[confidence]}.`,
  ]

  // Workstream leverage summary: shows which coin investments drove the action effectiveness
  if (teamChips && rankedActions) {
    const leveraged: string[] = []
    const weak: string[] = []
    rankedActions.forEach((action) => {
      if (!action.workstream) return
      const coinsInWs = teamChips[action.workstream] ?? 0
      if (coinsInWs >= Math.ceil(MAX_COINS_PER_WORKSTREAM * 0.4)) {
        if (!leveraged.includes(action.workstream)) leveraged.push(action.workstream)
      } else if (coinsInWs === 0) {
        if (!weak.includes(action.workstream)) weak.push(action.workstream)
      }
    })
    if (leveraged.length > 0) {
      parts.push(`Coin leverage: ${leveraged.map((ws) => `${WORKSTREAM_LABELS[ws as WorkstreamId]} ${teamChips[ws as WorkstreamId]}/${MAX_COINS_PER_WORKSTREAM}`).join(', ')}.`)
    }
    if (weak.length > 0) {
      parts.push(`Unfunded workstreams: ${weak.map((ws) => `${WORKSTREAM_LABELS[ws as WorkstreamId]} (0 coins)`).join(', ')}.`)
    }
  }

  return parts.join(' ')
}

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatSignedNumber = (value: number) => {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}

const progressWidthClass = (submittedCount: number, totalTeams: number) => {
  if (totalTeams === 0) {
    return 'progress-fill progress-w-0'
  }

  const percentage = Math.round((submittedCount / totalTeams) * 100)
  const bucket = Math.min(100, Math.max(0, Math.round(percentage / 10) * 10))
  return `progress-fill progress-w-${bucket}`
}

export default App
