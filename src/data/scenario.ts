import type {
  ConfidenceLevel,
  KpiSet,
  SlideReference,
  TeamRecord,
  TurnDefinition,
  WorkstreamId,
} from '../types'

export const INTRO_SLIDES: SlideReference[] = [
  {
    number: 1,
    title: 'Cyber Resilience Beyond Machine-Speed Attacks',
    hook: 'Open with the premise that speed, not perfect autonomy, is what changes executive risk.',
    takeaway: 'The room is not preparing for science fiction. It is preparing for compressed decision time.',
  },
  {
    number: 4,
    title: 'Module 01 | Capability shift',
    hook: 'Set up the three-part logic of the opening case for capability shift.',
    takeaway: 'Supervised AI operation plus exploit development is enough to pressure defenders now.',
  },
  {
    number: 5,
    title: 'AI crossed from assistant to supervised operator',
    hook: 'Use the Anthropic example to anchor the idea that most of the workflow can be delegated under human supervision.',
    takeaway: 'The threshold that matters is not flawless autonomy. It is operational leverage.',
  },
  {
    number: 6,
    title: 'AI vulnerability discovery crossed the human expert threshold',
    hook: 'Explain why frontier models are no longer only writing explanations. They are solving real exploit tasks.',
    takeaway: 'The capability floor for vulnerability work has shifted materially.',
  },
  {
    number: 7,
    title: 'AI can now build complete exploits, not just trigger crashes',
    hook: 'Reinforce that exploit development, not only crash reproduction, is the new concern.',
    takeaway: 'Patch windows can no longer be planned on historical human timelines alone.',
  },
  {
    number: 10,
    title: 'Module 02 | Exposure shift',
    hook: 'Move the conversation from model capability to enterprise exposure.',
    takeaway: 'The target is not only a server. It is the context that lets the attacker validate and act.',
  },
  {
    number: 11,
    title: 'Custom web and API applications lose the obscurity discount',
    hook: 'Make the room uncomfortable in the right way by focusing on bespoke apps and business logic.',
    takeaway: 'Custom app exposure is where AI reasoning creates asymmetric pressure.',
  },
  {
    number: 12,
    title: 'Discovery is not risk reduction',
    hook: 'Show why machine-speed finding volume without closure capacity increases stress rather than resilience.',
    takeaway: 'The closure factory matters more than the scanner headline.',
  },
  {
    number: 14,
    title: 'Separating Myth from Mythos',
    hook: 'Invite the room to hold both the signal and the skepticism at once.',
    takeaway: 'The exercise is not about hype acceptance. It is about operating-model consequence.',
  },
  {
    number: 15,
    title: 'What Cloudflare learned',
    hook: 'Use practitioner evidence to show that harness, scope, validation, and reachability matter.',
    takeaway: 'Broad prompts do not save you. Workflow design does.',
  },
  {
    number: 19,
    title: 'Module 04 | Resilience playbook',
    hook: 'Shift the room from threat description into action logic.',
    takeaway: 'The answer is an operating model that validates, contains, restores, and governs under time pressure.',
  },
  {
    number: 31,
    title: '30-60-90: start with evidence the executive team can see',
    hook: 'Set up the landing zone for the board-call ending.',
    takeaway: 'The winning response is visible evidence, ownership, and authority, not dashboard inflation.',
  },
]

export const RULES = [
  'Each table is the cyber steering group for SangamOne Group.',
  'Each team must assign all 60 coins across six workstreams before the first turn. You can put 0 to 60 coins on any workstream as long as the total is exactly 60.',
  'Each turn has 6 available actions. Teams must rank the top 4 in order.',
  'Confidence matters. High confidence amplifies upside and downside.',
  'The room is scored on enterprise resilience, not on finding one cyber-correct answer.',
]

const followUp = (number: number, title: string, hook: string, takeaway: string): SlideReference => ({
  number,
  title,
  hook,
  takeaway,
})

export const TURN_DEFINITIONS: TurnDefinition[] = [
  {
    id: 'turn-1',
    title: 'Paths to Tier 0 Before Launch',
    storyTime: 'Day -1 | 18:30 IST',
    subtitle: 'A BloodHound-style path review shows too many ways to cash out.',
    narrative:
      'A pentest team has just run a BloodHound-style identity path analysis and found multiple routes from the new partner-finance launch stack to material control: a supplier OAuth integration that can pivot into approvals, a weak privileged recovery path, and a route from exposed management access toward backup administration. Hundreds of other findings exist, but these few paths dominate the business blast radius.',
    stageNarrative:
      'A BloodHound-style attack-path review now shows multiple live routes from the launch stack into privileged control and recovery systems. The room must decide which choke points to break first.',
    stageSignals: [
      'Three viable paths now matter: supplier OAuth, weak privileged recovery, and the route toward backup administration.',
      'Most other findings do not materially change the business outcome before launch.',
    ],
    stagePressure: [
      'Product wants tomorrow\'s launch to continue if the few critical paths can be cut without a full freeze.',
      'The CISO wants the small set of changes that removes the most blast radius, not a week of list cleanup.',
    ],
    stageResolve: [
      'Which choke points do you break first?',
      'What can stay exposed until the next change window without unacceptable risk?',
    ],
    evidence: [
      'A BloodHound-style graph shows one route from a supplier portal admin token into an overbroad SaaS approval workflow.',
      'A second route chains weak recovery controls and standing privilege into a high-value admin tier.',
      'A third route still connects the current path toward backup and management systems through a segmentation gap.',
      'The remediation backlog is full of medium-severity findings, but only a few controls remove most routes to material business harm.',
    ],
    pressure: [
      'The CIO wants the smallest disruptive control set that actually changes the outcome.',
      'Business leaders want to preserve launch continuity if the dangerous paths can be cut quickly.',
      'The CISO wants route reduction and choke-point decisions, not another long remediation list.',
    ],
    timerSeconds: 120,
    workstreams: ['W2', 'W3', 'W5'],
    intelReveal:
      'Two of the three material paths share the same supplier OAuth trust path and one weak privileged recovery route. The backup route is the third choke point.',
    followUpSlide: followUp(
      21,
      'Fix the paths that reduce the most blast radius',
      'Use the slide to reinforce path-based prioritization over backlog theatre.',
      'The right move is not blanket patching. It is reducing the routes that matter most first.',
    ),
    actions: [
      {
        id: 'cut-supplier-oauth',
        title: 'Cut the supplier OAuth and delegated SaaS trust path first',
        summary: 'Shrink or suspend the supplier integration route that sits on multiple material attack paths.',
        rationale: 'This directly removes a shared choke point from the graph.',
        value: 31,
        effects: { continuity: -4, data: 5, financial: 3, regulatory: 2, trust: 1 },
        workstream: 'W3',
      },
      {
        id: 'remove-weak-recovery',
        title: 'Remove the weak privileged recovery path immediately',
        summary: 'Harden the one recovery and standing-privilege route that still leads to high-value control.',
        rationale: 'This closes a second dominant path without pretending the entire backlog matters equally.',
        value: 29,
        effects: { continuity: -3, data: 4, financial: 2, regulatory: 2, trust: 1 },
        workstream: 'W3',
      },
      {
        id: 'break-backup-segmentation',
        title: 'Break the route toward backup and management zones now',
        summary: 'Treat segmentation to recovery and management as a resilience control, not an infrastructure tidy-up.',
        rationale: 'This removes the path to the hardest-to-recover zone in the environment.',
        value: 28,
        effects: { continuity: -5, data: 4, financial: 3, regulatory: 2, trust: 1 },
        workstream: 'W2',
      },
      {
        id: 'restrict-management-access',
        title: 'Restrict internet-facing management and admin access paths first',
        summary: 'Reduce the externally reachable set tied to the launch stack and management plane.',
        rationale: 'Useful where those management routes feed one of the material graph paths.',
        value: 24,
        effects: { continuity: -3, data: 3, financial: 2, regulatory: 2, trust: 0 },
        workstream: 'W2',
      },
      {
        id: 'work-the-list',
        title: 'Drive down the long remediation list before touching the choke points',
        summary: 'Reduce the overall bug count first and assume the critical path will be covered as part of the list.',
        rationale: 'This is the exact anti-pattern the follow-up slide is warning against.',
        value: 5,
        effects: { continuity: 0, data: 10, financial: 4, regulatory: 6, trust: -4 },
        workstream: 'W1',
      },
      {
        id: 'protect-launch-optics',
        title: 'Protect launch optics now and revisit the paths after release',
        summary: 'Delay disruptive route-breaking changes in order to keep the launch narrative stable.',
        rationale: 'Comfort does not remove blast radius.',
        value: 2,
        effects: { continuity: 0, data: 12, financial: 5, regulatory: 7, trust: -6 },
      },
    ],
    contradictions: [
      {
        earlierActionId: 'work-the-list',
        laterActionId: 'cut-supplier-oauth',
        scorePenalty: 7,
        note: 'If you chase the long list first, the shared OAuth choke point stays open too long to matter later.',
      },
      {
        earlierActionId: 'protect-launch-optics',
        laterActionId: 'break-backup-segmentation',
        scorePenalty: 5,
        note: 'Choosing optics first nearly guarantees the route toward recovery systems is left intact too long.',
      },
    ],
    debrief:
      'Prioritize route breaks and choke points that remove the most blast radius, not the longest remediation list.',
  },
  {
    id: 'turn-2',
    title: 'The Canary Fires',
    storyTime: 'Day 0 | 06:50 IST',
    subtitle: 'A decoy touch turns broad discovery noise into high-confidence signal.',
    narrative:
      'During overnight validation, a decoy supplier API key planted in the build mirror is used from an unfamiliar cloud region. Minutes later, a canary document in the partner-onboarding folder is opened. No approved workflow should touch either asset. The room now has clean signal that broad AI-enabled exploration has become hostile touch.',
    stageNarrative:
      'A decoy credential and a canary document were both touched where no approved user, workflow, or agent should ever go. The question is no longer whether the discovery noise is real.',
    stageSignals: [
      'A seeded supplier API credential was used from an unexpected region.',
      'A canary document in a partner folder was opened minutes later.',
    ],
    stagePressure: [
      'The SOC wants to escalate immediately because neither asset has a legitimate touch path.',
      'Legal wants evidence preserved before broader action widens the incident.',
    ],
    stageResolve: [
      'Do you trust the deception touch enough to elevate the incident now?',
      'What do you preserve before broader containment or communication begins?',
    ],
    evidence: [
      'A decoy supplier API key placed in the validation mirror was used from an unfamiliar cloud region.',
      'A canary document in the partner-onboarding folder was opened within minutes of the credential touch.',
      'No approved workflow, scanner, or user should ever have touched either asset.',
      'The product team worries the signal may still be internal QA or validation noise.',
    ],
    pressure: [
      'The SOC wants to treat the touch as hostile until disproven.',
      'Product wants stronger proof before any launch-visible disruption is triggered.',
      'Legal wants the first response to preserve evidence, not just create more noise.',
    ],
    timerSeconds: 120,
    workstreams: ['W4', 'W6', 'W3'],
    intelReveal:
      'The credential touch came from infrastructure with no approved route into the validation mirror, and the canary document beacon used the same ASN family.',
    followUpSlide: followUp(
      23,
      'Deception turns noisy AI discovery into clean signal',
      'Use the slide to justify why deception and honeytokens are not gimmicks in a noisy environment.',
      'Well-placed deception assets raise confidence fast when the room is drowning in mixed telemetry.',
    ),
    actions: [
      {
        id: 'trust-deception',
        title: 'Treat the decoy touch as a high-confidence hostile signal and open containment',
        summary: 'Use the deception hit to move from broad hypothesis into controlled response.',
        rationale: 'A clean lure with near-zero legitimate traffic produces high-confidence signal when it finally fires.',
        value: 30,
        effects: { continuity: -2, data: 4, financial: 3, regulatory: 2, trust: 1 },
        workstream: 'W4',
      },
      {
        id: 'preserve-evidence',
        title: 'Preserve evidence and enrich adjacent identity, repo, and supplier paths first',
        summary: 'Protect the record and scope the nearby trust boundary before broader communications widen the problem.',
        rationale: 'Strong because it pairs clean signal with disciplined evidence handling.',
        value: 29,
        effects: { continuity: -2, data: 3, financial: 3, regulatory: 1, trust: 1 },
        workstream: 'W4',
      },
      {
        id: 'seed-more-decoys',
        title: 'Quietly seed more decoys before you trigger any containment action',
        summary: 'Try to squeeze more intelligence out of the touch before showing your hand.',
        rationale: 'Potentially useful later, but too passive if used as the first instinct.',
        value: 14,
        effects: { continuity: 0, data: 5, financial: 2, regulatory: 2, trust: -1 },
        workstream: 'W4',
      },
      {
        id: 'rotate-touch-only',
        title: 'Rotate only the touched credential and avoid widening the incident narrative',
        summary: 'Treat the event as a narrow anomaly instead of a path into the wider environment.',
        rationale: 'This contains one symptom but risks missing the adjacent route.',
        value: 12,
        effects: { continuity: -1, data: 6, financial: 2, regulatory: 3, trust: -1 },
        workstream: 'W3',
      },
      {
        id: 'dismiss-decoy',
        title: 'Dismiss the touch as likely validation noise until a second control confirms it',
        summary: 'Protect the room from reacting too quickly to one strong-looking signal.',
        rationale: 'This ignores the point of a lure designed to have almost no legitimate traffic.',
        value: 3,
        effects: { continuity: 0, data: 11, financial: 4, regulatory: 8, trust: -6 },
      },
      {
        id: 'notify-externally',
        title: 'Notify the board and customer owners before the internal path is scoped',
        summary: 'Move early on communications before the path is understood.',
        rationale: 'Premature signalling can outpace evidence and create the wrong narrative.',
        value: 6,
        effects: { continuity: 0, data: 2, financial: 2, regulatory: 4, trust: -2 },
        workstream: 'W4',
      },
    ],
    contradictions: [
      {
        earlierActionId: 'dismiss-decoy',
        laterActionId: 'trust-deception',
        scorePenalty: 7,
        note: 'Once you downgrade the decoy touch, the later escalation loses much of its time advantage.',
      },
      {
        earlierActionId: 'notify-externally',
        laterActionId: 'preserve-evidence',
        scorePenalty: 7,
        note: 'External signalling before preserving evidence and adjacent path context weakens both credibility and response quality.',
      },
    ],
    debrief:
      'When AI hunts broadly, the best lure should create almost no false traffic. Treat the touch, not the queue, as the high-priority signal.',
  },
  {
    id: 'turn-3',
    title: 'Events Without a Campaign',
    storyTime: 'Day 0 | 11:45 IST',
    subtitle: 'The SOC sees alerts, but not the sequence, when telemetry stays local.',
    narrative:
      'Even after the choke-point moves, the SOC still sees separate symptoms rather than a coherent campaign. Email lure, WAF/API hit, SaaS admin change, cloud token anomaly, and endpoint script all exist, but application telemetry, identity state, asset context, and policy changes remain trapped in different tools. The room must decide how to build a campaign view before the next attacker handoff arrives.',
    stageNarrative:
      'The SOC is drowning in events but still cannot explain the sequence. Without shared context, the room will catch symptoms instead of the campaign.',
    stageSignals: [
      'Email, cloud, endpoint, SaaS, and API alerts now exist, but none are bound together by shared context.',
      'Critical app and admin-plane telemetry still reaches the SOC as partial or non-correlatable logs.',
    ],
    stagePressure: [
      'The outsourced SOC wants one incident timeline before it recommends irreversible action.',
      'Operations wants to avoid major disruption on what still looks like scattered symptoms.',
    ],
    stageResolve: [
      'What telemetry must travel together before the SOC can see the campaign?',
      'How do you speed correlation without letting AI take irreversible action alone?',
    ],
    evidence: [
      'The WAF shows a path probe, but the application logs are not in the same detection flow.',
      'A suspicious SaaS admin change exists, but asset and policy context is still local to that platform.',
      'Endpoint telemetry suggests script activity, but it does not share identity context cleanly with the SaaS and API events.',
      'The SOC can explain each event separately, but not the sequence that links them into one campaign.',
    ],
    pressure: [
      'The outsourced SOC wants a single incident picture before it escalates containment decisions.',
      'Operations wants to avoid major disruption on events that still look disconnected.',
      'Leadership wants to know whether the room is seeing scattered alerts or a real multi-stage campaign.',
    ],
    timerSeconds: 120,
    workstreams: ['W4', 'W2', 'W6'],
    intelReveal:
      'The SaaS admin event, API probe, and endpoint activity all touch the same supplier onboarding workflow once app and identity context are joined.',
    followUpSlide: followUp(
      22,
      'The SOC misses the campaign when telemetry stays local',
      'Use the slide to show why locally siloed evidence makes machine-speed response slower and less confident.',
      'If telemetry remains trapped in local tools, the SOC cannot form a campaign view fast enough.',
    ),
    actions: [
      {
        id: 'centralize-telemetry',
        title: 'Unify application, identity, asset, and policy telemetry into one incident timeline now',
        summary: 'Treat shared context as an operational control, not a reporting afterthought.',
        rationale: 'Shared context across tools turns scattered alerts into a single campaign picture.',
        value: 31,
        effects: { continuity: -1, data: 4, financial: 2, regulatory: 2, trust: 1 },
        workstream: 'W4',
      },
      {
        id: 'instrument-business-layer',
        title: 'Instrument the critical business and admin layer into shared detection workflows',
        summary: 'Bring API, WAF, app, and admin-plane events into the same response view as identity and endpoint signals.',
        rationale: 'Without the business layer, the SOC only sees fragments.',
        value: 27,
        effects: { continuity: -1, data: 4, financial: 2, regulatory: 2, trust: 1 },
        workstream: 'W2',
      },
      {
        id: 'ai-assist-correlation',
        title: 'Use AI for triage, enrichment, and correlation with human action gates',
        summary: 'Speed the meaning-making, but keep irreversible response decisions governed by people.',
        rationale: 'AI speeds enrichment and correlation; human gates keep irreversible decisions governed.',
        value: 24,
        effects: { continuity: -1, data: 3, financial: 2, regulatory: 1, trust: 1 },
        workstream: 'W6',
      },
      {
        id: 'extend-log-paths',
        title: 'Forward missing admin and app logs into shared long-term storage now',
        summary: 'Remove the visibility blind spots that keep the sequence from forming.',
        rationale: 'Useful support move when paired with correlation and instrumentation.',
        value: 22,
        effects: { continuity: 0, data: 3, financial: 2, regulatory: 2, trust: 1 },
        workstream: 'W4',
      },
      {
        id: 'local-owner-summaries',
        title: 'Let each local owner investigate and summarize events separately',
        summary: 'Preserve local workflow instead of forcing shared context midstream.',
        rationale: 'This keeps the alerts local and the campaign invisible.',
        value: 4,
        effects: { continuity: 0, data: 10, financial: 4, regulatory: 6, trust: -4 },
      },
      {
        id: 'siem-more-alerts',
        title: 'Pour more alerts into the SIEM and wait for pattern convergence',
        summary: 'Assume additional alert volume will eventually reveal the campaign sequence.',
        rationale: 'Alerts are not context.',
        value: 2,
        effects: { continuity: 0, data: 11, financial: 4, regulatory: 7, trust: -6 },
      },
    ],
    contradictions: [
      {
        earlierActionId: 'local-owner-summaries',
        laterActionId: 'centralize-telemetry',
        scorePenalty: 7,
        note: 'If you keep the investigation local first, the later attempt at shared context arrives after the sequence is already lost in handoff delay.',
      },
      {
        earlierActionId: 'siem-more-alerts',
        laterActionId: 'ai-assist-correlation',
        scorePenalty: 5,
        note: 'More alerts without shared context only makes the later AI triage layer work harder against the same blind spot.',
      },
    ],
    debrief:
      'The SOC can miss the campaign even with plenty of alerts if application, identity, asset, and policy context do not travel together.',
  },
  {
    id: 'turn-4',
    title: 'Machine Identities Take Over',
    storyTime: 'Day 1 | 09:10 IST',
    subtitle: 'Service accounts, OAuth grants, and build tokens now carry the incident forward.',
    narrative:
      'Supplier notification now suggests the partner API was not the only route. The same incident zone includes service principals, app consents, workload identities, and build tokens that move data across workflows. Leadership has to decide whether to widen the incident to machine identities immediately or keep the current narrative narrow.',
    stageNarrative:
      'The campaign is widening from user accounts into service principals, app consents, workload identities, and supplier connectors. Machine identity is now live incident scope.',
    stageSignals: [
      'One supplier connector has broader consent than the documentation suggests.',
      'A service principal touches both claims processing and internal vendor approvals.',
    ],
    stagePressure: [
      'Finance wants settlement continuity protected.',
      'The board wants the incident story simplified, not widened again.',
    ],
    stageResolve: [
      'Which machine identities now move into incident scope?',
      'What can be suspended without breaking the business outright?',
    ],
    evidence: [
      'A supplier connector uses an app consent that is broader than the documentation suggests.',
      'One service principal touches both the claims workflow and internal vendor approvals.',
      'A build token can still mint actions across environments tied to the same business workflow.',
      'Operations worries that wide rotation could interrupt settlement and support services.',
    ],
    pressure: [
      'Identity leadership wants machine identities brought into scope now.',
      'Finance wants to protect settlement continuity.',
      'The board wants the incident story simplified, not widened again.',
    ],
    timerSeconds: 120,
    workstreams: ['W3', 'W5', 'W6'],
    intelReveal:
      'The supplier connector is not the original entry path, but it does widen the blast radius materially and links to one overbroad workload identity.',
    followUpSlide: followUp(
      24,
      'Identity resilience starts by removing weak trust paths',
      'Use the slide to show why identity resilience requires removing weak trust paths and binding access to device and session context.',
      'Identity is where the attacker cashes out. The first move is cutting phishable trust paths, not more training.',
    ),
    actions: [
      {
        id: 'scope-machine-identities',
        title: 'Scope and owner every machine identity in the affected path immediately',
        summary: 'Treat service principals, workload identities, connectors, and app consents as first-class incident artifacts.',
        rationale: 'Machine identities, service principals, and app consents are first-class incident artifacts, not IAM clean-up items.',
        value: 31,
        effects: { continuity: -3, data: 4, financial: 3, regulatory: 2, trust: 1 },
        workstream: 'W3',
      },
      {
        id: 'rotate-service-principals',
        title: 'Rotate the highest-risk service accounts, workload identities, and build tokens',
        summary: 'Close the most dangerous non-human routes even if some operational friction follows.',
        rationale: 'Strong if it is prioritized early enough to matter.',
        value: 28,
        effects: { continuity: -6, data: 3, financial: 4, regulatory: 2, trust: 0 },
      },
      {
        id: 'revoke-oauth-grants',
        title: 'Review and revoke dormant OAuth grants and overbroad app consents now',
        summary: 'Treat delegated SaaS access as a durable path, not a low-risk configuration issue.',
        rationale: 'This directly aligns the supplier connector story to the slide.',
        value: 27,
        effects: { continuity: -3, data: 3, financial: 3, regulatory: 2, trust: 1 },
      },
      {
        id: 'protect-break-glass',
        title: 'Protect recovery and break-glass identities separately from normal administration',
        summary: 'Stop the incident from carrying forward into the very accounts needed to recover.',
        rationale: 'This makes machine identity a resilience question, not just an IAM cleanup task.',
        value: 24,
        effects: { continuity: -2, data: 2, financial: 2, regulatory: 1, trust: 1 },
      },
      {
        id: 'keep-human-focus',
        title: 'Keep the incident focused on human credentials for now',
        summary: 'Avoid opening a second identity front mid-crisis.',
        rationale: 'This is how the room misses the durable access paths that now matter most.',
        value: 5,
        effects: { continuity: 0, data: 10, financial: 4, regulatory: 7, trust: -4 },
      },
      {
        id: 'defer-nhi-review',
        title: 'Send machine-identity cleanup to the post-incident backlog',
        summary: 'Treat today as a user-access problem and defer service identities until later.',
        rationale: 'This turns a current blast-radius issue into future hygiene.',
        value: 2,
        effects: { continuity: 0, data: 11, financial: 3, regulatory: 7, trust: -5 },
      },
    ],
    contradictions: [
      {
        earlierActionId: 'defer-nhi-review',
        laterActionId: 'scope-machine-identities',
        scorePenalty: 8,
        note: 'If machine identity is deferred first, later scoping arrives after durable access has already been left intact too long.',
      },
      {
        earlierActionId: 'keep-human-focus',
        laterActionId: 'rotate-service-principals',
        scorePenalty: 6,
        note: 'The room loses time when it insists the incident is only about human users before touching the machine routes.',
      },
    ],
    debrief:
      'Identity resilience starts by removing weak trust paths: human credentials, service accounts, workload identities, OAuth grants, and break-glass paths.',
    allowRebalance: true,
  },
  {
    id: 'turn-5',
    title: 'The Agent Inherits Too Much',
    storyTime: 'Day 1 | 15:00 IST',
    subtitle: 'The governance question is what the agent can see, call, and change.',
    narrative:
      'The immediate crisis is stabilizing, but the internal employee copilot and response agents were found to have broader connector permissions than leadership believed. They can see tickets, logs, code, and retrieval content, and some can call workflow tools directly. The board now wants a 90-day plan that treats AI control surfaces as a current privilege problem, not a future innovation discussion.',
    stageNarrative:
      'The crisis is stabilizing, but the copilot and response agents exposed a deeper issue: what the agent can see, call, and change today, and how fast the room can revoke it.',
    stageSignals: [
      'The copilot touched internal knowledge, workflow data, and documentation beyond what leaders expected.',
      'Regulators and major customers may ask for visible control improvements within weeks.',
    ],
    stagePressure: [
      'The board wants proof of control, not another dashboard program.',
      'Finance will not support a blank-cheque response.',
    ],
    stageResolve: [
      'What must start in the first 30 days, not in theory?',
      'Which control moves reduce future blast radius fastest?',
    ],
    evidence: [
      'The employee copilot touched internal knowledge, ticketing, and workflow data beyond what leaders believed it could reach.',
      'Some response agents can call workflow tooling directly through connected SaaS and automation surfaces.',
      'The connector sprawl did not create the first exploit, but it amplified context and potential action authority.',
      'Finance will not support a blank-cheque response and the board wants visible control improvement.',
    ],
    pressure: [
      'The board wants proof of control, not another dashboard plan.',
      'The CIO wants a program the operating model can actually absorb.',
      'The CISO wants fewer privilege paths, better authority, and a rehearsed revocation story.',
    ],
    timerSeconds: 120,
    workstreams: ['W6', 'W3', 'W4'],
    intelReveal:
      'Peer organizations are tightening agent connector approval, identity gates, and revocation controls before expanding production authority.',
    followUpSlide: followUp(
      26,
      'Every useful agent creates a new privilege path',
      'Convert the incident into an AI-governance and control-plane discussion.',
      'Agents and copilots are not neutral productivity features. They are new privilege paths that need ownership and policy.',
    ),
    actions: [
      {
        id: 'inventory-connectors',
        title: 'Inventory every agent and connector with named ownership and least privilege',
        summary: 'Make every agent identity, connector, and workflow permission visible and attributable.',
        rationale: 'This is the direct response to the slide’s “see, call, and change” question.',
        value: 31,
        effects: { continuity: 1, data: -2, financial: -1, regulatory: -1, trust: 3 },
      },
      {
        id: 'human-approval-gates',
        title: 'Add human approval for high-impact tool calls and production changes',
        summary: 'Keep agent acceleration where it helps, but put humans back in front of high-blast-radius actions.',
        rationale: 'This bounds agency rather than pretending it is harmless.',
        value: 29,
        effects: { continuity: 0, data: -1, financial: -1, regulatory: -1, trust: 2 },
      },
      {
        id: 'kill-switch-revoke',
        title: 'Create a kill switch with fast connector revocation and evidence logging',
        summary: 'Design for revoke and recovery before the next incident uses the same surface.',
        rationale: 'This directly maps to the slide’s executive control message.',
        value: 30,
        effects: { continuity: 1, data: -1, financial: -1, regulatory: -1, trust: 3 },
      },
      {
        id: 'sandbox-risky-connectors',
        title: 'Sandbox or suspend the riskiest connectors until reviewed',
        summary: 'Reduce context reach and tool authority where the blast radius is not yet defendable.',
        rationale: 'Good temporary control while the governance model catches up.',
        value: 28,
        effects: { continuity: -1, data: -2, financial: 0, regulatory: -1, trust: 2 },
      },
      {
        id: 'buy-scanner-first',
        title: 'Buy more AI scanning and dashboards first',
        summary: 'Lead with more visibility before changing connector or authority design.',
        rationale: 'This takes exactly the wrong lesson from the incident.',
        value: 3,
        effects: { continuity: 0, data: 4, financial: 4, regulatory: 3, trust: -4 },
      },
      {
        id: 'self-govern-locally',
        title: 'Let each product team self-govern its own agent permissions locally',
        summary: 'Keep control distributed and rely on local judgment instead of centralized policy.',
        rationale: 'This hides privilege paths rather than governing them.',
        value: 5,
        effects: { continuity: 0, data: 5, financial: 2, regulatory: 4, trust: -3 },
      },
    ],
    contradictions: [
      {
        earlierActionId: 'buy-scanner-first',
        laterActionId: 'inventory-connectors',
        scorePenalty: 8,
        note: 'Buying more visibility before inventorying the agent privilege paths repeats the same operating-model failure at larger scale.',
      },
      {
        earlierActionId: 'self-govern-locally',
        laterActionId: 'kill-switch-revoke',
        scorePenalty: 6,
        note: 'If each team governs agents locally first, the later kill-switch and revocation model arrives too late to be coherent enterprise control.',
      },
    ],
    debrief:
      'Every useful agent creates a new privilege path. The lasting question is what the agent can see, call, and change, and how fast the room can revoke it.',
  },
  {
    id: 'turn-6',
    title: 'Adversarial Recovery under Fire',
    storyTime: 'Day 2 | 09:00 IST',
    subtitle: 'Ransomware targets your virtualization and backup planes to deny recovery.',
    narrative:
      'The adversary has launched a destructive ransomware attack, targeting the virtualization layer and the backup administration console. Several databases are encrypted, and the production identity directory is corrupted. Standard restore procedures are blocked because the backup systems are under fire. The board wants to know how soon you can restore the minimum viable business on a clean recovery enclave and who has the authority to declare it safe.',
    stageNarrative:
      'Ransomware has targeted the backup infrastructure and virtualization management plane. The room must decide how to rebuild critical business services when production trust is completely unsafe.',
    stageSignals: [
      'Attacker activity is detected in the primary backup storage controllers.',
      'Offline backup vaults and IaC templates are intact but isolated.',
    ],
    stagePressure: [
      'The board demands an immediate timeline for restoring minimum viable business operations.',
      'Operations wants to reconnect restored virtual machines to production quickly.',
    ],
    stageResolve: [
      'How do you isolate and restore services when the production network is untrusted?',
      'Who has the pre-approved authority to declare a safe return to service?',
    ],
    evidence: [
      'Primary backup controllers show unauthorized admin logins and deletion scripts.',
      'Virtualization management planes are unresponsive, blocking standard VM recovery tools.',
      'Offline read-only backup vaults and golden images are verified clean but require network rebuild.',
      'Mandiant and CISA advisories confirm that modern ransomware groups target recovery planes first.',
    ],
    pressure: [
      'The CIO wants to restore directly into the existing production network to save time.',
      'Business leaders demand prioritizing customer KYC and payment clearing over system-wide rebuilds.',
      'Legal warns that premature connection of unvalidated databases could trigger regulatory penalties.',
    ],
    timerSeconds: 120,
    workstreams: ['W5', 'W3', 'W2'],
    intelReveal:
      'An isolated clean-room staging segment exists. Restoring naming, identity, and DNS from clean golden images there takes 4 hours but prevents immediate re-infection.',
    followUpSlide: followUp(
      27,
      'Restore services under adversarial conditions',
      'Explain why recovery under pressure is not a simple backup restore task.',
      'Recovery starts when production trust is unsafe. Focus on clean enclaves and service dependencies rather than server copies.',
    ),
    actions: [
      {
        id: 'clean-room-restore',
        title: 'Restore payment and KYC services in a clean, isolated enclave first',
        summary: 'Rebuild the core naming, identity, and database stacks on a clean network segment from golden images.',
        rationale: 'Recovery starts when production trust is unsafe. Rebuild critical services on a clean enclave, not inside the compromised environment.',
        value: 31,
        effects: { continuity: -2, data: -1, financial: 2, regulatory: 1, trust: 3 },
      },
      {
        id: 'validate-dependencies',
        title: 'Validate identity, DNS, and application naming dependencies before reconnecting data',
        summary: 'Prove the core directory and name resolution layers work in isolation before restoring transactional data.',
        rationale: 'Ensures the restored services can actually run and will not fail mid-process.',
        value: 28,
        effects: { continuity: -3, data: 0, financial: 2, regulatory: 2, trust: 2 },
      },
      {
        id: 'rehearse-safe-return',
        title: 'Establish a joint authority gate to sign off on safe-return criteria',
        summary: 'Formally define the security, legal, and business checkpoints required to declare a service active.',
        rationale: 'Pre-approved authority gates for safe resumption prevent ad-hoc return decisions under pressure.',
        value: 27,
        effects: { continuity: -4, data: -1, financial: 3, regulatory: 1, trust: 3 },
      },
      {
        id: 'offline-vaults',
        title: 'Secure remaining offline encrypted backups and golden images in read-only vaults',
        summary: 'Air-gap and isolate remaining data to prevent the attacker from deleting the last resort assets.',
        rationale: 'Useful supporting control to safeguard the recovery foundation.',
        value: 24,
        effects: { continuity: -1, data: -2, financial: 1, regulatory: 1, trust: 2 },
      },
      {
        id: 'restore-in-place',
        title: 'Restore databases directly into the compromised production segment to save time',
        summary: 'Attempt an in-place restore using standard automated scripts on the existing production network.',
        rationale: 'This ignores the unsafe state of the production trust plane and risks immediate re-infection.',
        value: 3,
        effects: { continuity: -6, data: 5, financial: 5, regulatory: 5, trust: -4 },
      },
      {
        id: 'rebuild-all-servers',
        title: 'Initiate a complete rebuild of all production servers before restoring any services',
        summary: 'Defer service restoration until the entire virtualization environment has been cleaned and re-imaged.',
        rationale: 'This treats all assets as equal and delays restoration of critical business services.',
        value: 2,
        effects: { continuity: -8, data: 3, financial: 6, regulatory: 4, trust: -5 },
      },
    ],
    contradictions: [
      {
        earlierActionId: 'restore-in-place',
        laterActionId: 'clean-room-restore',
        scorePenalty: 8,
        note: 'Attempting in-place restores in a compromised environment risks immediate re-encryption, ruining the clean-room timeline.',
      },
      {
        earlierActionId: 'rebuild-all-servers',
        laterActionId: 'rehearse-safe-return',
        scorePenalty: 6,
        note: 'Rebuilding all systems without a pre-defined sequence or safety gate creates business paralysis.',
      },
    ],
    debrief:
      'Recovery starts when production trust is unsafe. Restore minimum viable business operations from a clean recovery enclave, not in-place server copies under a compromised trust plane.',
  },
]

export const TOTAL_ALLOCATION_COINS = 60
export const MAX_COINS_PER_WORKSTREAM = 60
export const REBALANCE_COIN_LIMIT = 10

export const DEFAULT_CHIPS: Record<WorkstreamId, number> = {
  W1: 0,
  W2: 0,
  W3: 0,
  W4: 0,
  W5: 0,
  W6: 0,
}

export const EMPTY_KPIS: KpiSet = {
  continuity: 100,
  data: 0,
  financial: 0,
  regulatory: 0,
  trust: 100,
}

export const SLOT_WEIGHTS = [1, 0.7, 0.45, 0.25]

export const WORKSTREAM_LABELS: Record<WorkstreamId, string> = {
  W1: 'Vulnerability and patch resilience',
  W2: 'Exposure and attack-path reduction',
  W3: 'Identity and access resilience',
  W4: 'SOC, IR, and deception',
  W5: 'Crown jewels and recovery',
  W6: 'Secure AI and agent governance',
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Low confidence',
  medium: 'Medium confidence',
  high: 'High confidence',
}

export const DEMO_TEAM_NAMES = [
  ['Team Monsoon', '1', 'BFSI'],
  ['Team Atlas', '2', 'Conglomerate'],
  ['Team Meridian', '3', 'Technology'],
  ['Team Signal', '4', 'Manufacturing'],
  ['Team Juniper', '5', 'Public sector'],
  ['Team Torch', '6', 'Telecom'],
] as const

const DEMO_TEAM_CHIPS: Array<Record<WorkstreamId, number>> = [
  { W1: 15, W2: 12, W3: 10, W4: 8, W5: 8, W6: 7 },
  { W1: 8, W2: 10, W3: 15, W4: 12, W5: 8, W6: 7 },
  { W1: 10, W2: 15, W3: 6, W4: 10, W5: 12, W6: 7 },
  { W1: 7, W2: 8, W3: 12, W4: 15, W5: 10, W6: 8 },
  { W1: 6, W2: 8, W3: 10, W4: 10, W5: 16, W6: 10 },
  { W1: 8, W2: 10, W3: 9, W4: 8, W5: 10, W6: 15 },
]

export const createTeamRecord = (
  name: string,
  tableNumber: string,
  sector?: string,
  chips: Record<WorkstreamId, number> = DEFAULT_CHIPS,
): TeamRecord => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${name}-${Date.now()}`,
  name,
  tableNumber,
  sector: sector ?? 'Cross-sector',
  chips: { ...chips },
  kpis: { ...EMPTY_KPIS },
  score: 100,
  statusTag: 'Ready to brief',
  submissions: {},
})

export const seedDemoTeams = (): TeamRecord[] =>
  DEMO_TEAM_NAMES.map(([name, tableNumber, sector], index) =>
    createTeamRecord(name, tableNumber, sector, DEMO_TEAM_CHIPS[index] ?? DEFAULT_CHIPS),
  )
