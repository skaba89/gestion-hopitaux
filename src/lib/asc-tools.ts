// HealthFlow Africa - ASC (Agent de Santé Communautaire) Toolkit
// Step-by-step diagnostic guides, referral decision matrix, offline data collection

export type DiagnosticSeverity = 'vert' | 'jaune' | 'orange' | 'rouge'
export type ReferralDecision = 'Traiter sur place' | 'Référer au centre de santé' | 'Référer à l\'hôpital de district' | 'Référer aux urgences'

export interface DiagnosticStep {
  id: string
  question: string
  options: { label: string; value: string; nextStep?: string; severity?: DiagnosticSeverity }[]
  info?: string
}

export interface DiagnosticGuide {
  id: string
  name: string
  icon: string
  description: string
  steps: DiagnosticStep[]
  treatOnPlace: string[] // Instructions for treating on place
  referralRequired: string[] // When to refer
  redFlags: string[]
  medications?: { name: string; dosage: string; duration: string; notes: string }[]
}

export interface ASCVisit {
  id: string
  ascId: string
  ascName: string
  patientId?: string
  patientName: string
  patientAge?: number
  patientGender?: 'M' | 'F'
  visitDate: string
  location: { lat?: number; lng?: number; address: string }
  symptoms: string[]
  vitalSigns?: {
    temperature?: number
    bloodPressureSystolic?: number
    bloodPressureDiastolic?: number
    heartRate?: number
    respiratoryRate?: number
    weight?: number
    muac?: number // MUAC bracelet measurement in mm
    oxygenSaturation?: number
  }
  diagnosis?: string
  actionsTaken: string[]
  referral?: ASCReferral
  photos: string[]
  isOffline: boolean
  syncedAt?: string
  createdAt: string
}

export interface ASCReferral {
  id: string
  visitId: string
  patientId?: string
  patientName: string
  ascId: string
  ascName: string
  reason: string
  severity: DiagnosticSeverity
  destination: string
  status: 'En attente' | 'Accepté' | 'En route' | 'Arrivé' | 'Pris en charge' | 'Terminé'
  notes: string
  createdAt: string
  acceptedAt?: string
  completedAt?: string
}

export interface TrainingModule {
  id: string
  title: string
  description: string
  category: string
  duration: string
  lessons: { id: string; title: string; completed: boolean }[]
  quiz: { question: string; options: string[]; correctAnswer: number }[]
  progress: number // 0-100
  completedAt?: string
  certificateId?: string
}

// ─────────── Diagnostic Guides ───────────

export const diagnosticGuides: DiagnosticGuide[] = [
  {
    id: 'paludisme',
    name: 'Paludisme',
    icon: '🦟',
    description: 'Guide diagnostique du paludisme — Simple vs Grave',
    steps: [
      {
        id: 'palu-1',
        question: 'Le patient a-t-il de la fièvre (≥37.5°C) ou des antécédents de fièvre ces 48h ?',
        options: [
          { label: 'Oui', value: 'yes', nextStep: 'palu-2' },
          { label: 'Non', value: 'no', severity: 'vert' },
        ],
        info: 'Utilisez un thermomètre si disponible. Sinon, demandez si le patient a eu des sensations de chaleur.',
      },
      {
        id: 'palu-2',
        question: 'Le patient présente-t-il des signes de gravité ? (Convulsions, confusion, vomissements persistants, ictère, saignements, urines foncées, prostration)',
        options: [
          { label: 'Oui — Signes de gravité présents', value: 'severe', severity: 'rouge' },
          { label: 'Non — Pas de signes de gravité', value: 'simple', nextStep: 'palu-3' },
        ],
        info: 'Le paludisme grave est une urgence médicale nécessitant un transfert immédiat.',
      },
      {
        id: 'palu-3',
        question: 'TDR (Test de Diagnostic Rapide) disponible ?',
        options: [
          { label: 'Oui, TDR positif', value: 'tdr_positive', nextStep: 'palu-4' },
          { label: 'Oui, TDR négatif', value: 'tdr_negative', severity: 'jaune' },
          { label: 'Non disponible', value: 'no_tdr', nextStep: 'palu-4' },
        ],
      },
      {
        id: 'palu-4',
        question: 'Le patient peut-il prendre des médicaments par voie orale ?',
        options: [
          { label: 'Oui', value: 'oral_ok', severity: 'jaune' },
          { label: 'Non', value: 'oral_no', severity: 'rouge' },
        ],
        info: 'Si le patient ne peut pas prendre de médicaments oraux, il s\'agit d\'un paludisme grave.',
      },
    ],
    treatOnPlace: [
      'Administrer Artéméther/Luméfantrine (ACT) selon le poids',
      'Adulte ≥35kg: 4 comprimés matin et soir pendant 3 jours',
      'Encourager l\'hydratation',
      'Donner Paracétamol pour la fièvre (500mg-1g toutes les 6h)',
      'Revoir le patient à J2 et J3',
    ],
    referralRequired: [
      'Paludisme grave (convulsions, confusion, vomissements persistants)',
      'Impossibilité de prise orale',
      'Ictère ou saignements',
      'Anémie sévère suspectée',
      'Patient ne s\'améliore pas après 48h de traitement',
    ],
    redFlags: ['Convulsions', 'Confusion/Prostration', 'Vomissements persistants', 'Saignements spontanés', 'Urines foncées (hémoglobinurie)', 'Détresse respiratoire'],
    medications: [
      { name: 'Artéméther/Luméfantrine', dosage: 'Selon poids', duration: '3 jours', notes: 'Prendre avec du lait ou repas gras' },
      { name: 'Paracétamol', dosage: '500mg-1g', duration: 'Selon besoin', notes: 'Max 4g/jour, toutes les 6h' },
    ],
  },
  {
    id: 'diarrhee',
    name: 'Diarrhée',
    icon: '💧',
    description: 'Évaluation de la déshydratation et prise en charge',
    steps: [
      {
        id: 'dia-1',
        question: 'Le patient a-t-il eu 3 selles liquides ou plus en 24h ?',
        options: [
          { label: 'Oui', value: 'yes', nextStep: 'dia-2' },
          { label: 'Non', value: 'no', severity: 'vert' },
        ],
      },
      {
        id: 'dia-2',
        question: 'Signes de déshydratation sévère ? (Yeux enfoncés, pli cutané très lent, boit mal ou ne peut pas boire, abattu/inconscient)',
        options: [
          { label: 'Oui — Déshydratation sévère', value: 'severe', severity: 'rouge' },
          { label: 'Non', value: 'no_severe', nextStep: 'dia-3' },
        ],
      },
      {
        id: 'dia-3',
        question: 'Signes de déshydratation modérée ? (Soif intense, yeux enfoncés, pli cutané lent, agité/irritable)',
        options: [
          { label: 'Oui — Déshydratation modérée', value: 'moderate', severity: 'orange' },
          { label: 'Non — Pas de déshydratation', value: 'mild', severity: 'jaune' },
        ],
      },
    ],
    treatOnPlace: [
      'Donner SRO (Sels de Réhydratation Orale) — 1 sachet dans 1L d\'eau propre',
      'Déshydratation modérée: 75ml/kg SRO en 4h',
      'Pas de déshydratation: SRO après chaque selle liquide',
      'Continuer l\'alimentation',
      'Zinc 20mg/jour pendant 10 jours (enfant: 10mg)',
    ],
    referralRequired: [
      'Déshydratation sévère — nécessite perfusion IV',
      'Sang dans les selles (dysenterie)',
      'Fièvre élevée associée',
      'Enfant <6 mois',
      'Pas d\'amélioration après 3 jours',
    ],
    redFlags: ['Déshydratation sévère', 'Sang dans les selles', 'Vomissements persistants', 'Enfant <6 mois', 'Malnutrition associée'],
    medications: [
      { name: 'SRO', dosage: '1 sachet/1L eau', duration: 'Selon besoin', notes: 'Préparer avec eau potable' },
      { name: 'Zinc', dosage: '20mg/jour (10mg enfant)', duration: '10 jours', notes: 'Réduit durée et sévérité' },
    ],
  },
  {
    id: 'ira',
    name: 'Infection Respiratoire Aiguë',
    icon: '🫁',
    description: 'Diagnostic des infections respiratoires chez l\'enfant et l\'adulte',
    steps: [
      {
        id: 'ira-1',
        question: 'Le patient tousse-t-il ou a-t-il des difficultés respiratoires ?',
        options: [
          { label: 'Oui', value: 'yes', nextStep: 'ira-2' },
          { label: 'Non', value: 'no', severity: 'vert' },
        ],
      },
      {
        id: 'ira-2',
        question: 'Signes de danger ? (Tirage respiratoire, geignement, FR >60/min enfant, cyanose, impossibilité de boire)',
        options: [
          { label: 'Oui — Pneumonie grave', value: 'severe', severity: 'rouge' },
          { label: 'Non', value: 'no_severe', nextStep: 'ira-3' },
        ],
      },
      {
        id: 'ira-3',
        question: 'Fréquence respiratoire élevée ? (Enfant 2-12 mois: >50/min, Enfant 1-5 ans: >40/min, Adulte: >30/min)',
        options: [
          { label: 'Oui — Pneumonie', value: 'pneumonia', severity: 'orange' },
          { label: 'Non — Rhume/Toux simple', value: 'cold', severity: 'jaune' },
        ],
      },
    ],
    treatOnPlace: [
      'Rhume/toux simple: Paracétamol, hydratation, repos',
      'Pneumonie: Amoxicilline 40-50mg/kg/jour en 2 prises pendant 5 jours',
      'Enfant: Amoxicilline 125mg 3x/jour pendant 5 jours',
    ],
    referralRequired: [
      'Pneumonie grave — nécessite oxygène et traitement IV',
      'Cyanose',
      'Enfant <2 mois avec détresse respiratoire',
      'Pas d\'amélioration après 48h d\'antibiotiques',
    ],
    redFlags: ['Tirage respiratoire', 'Cyanose', 'Geignement', 'FR très élevée', 'Impossibilité de boire'],
    medications: [
      { name: 'Amoxicilline', dosage: '40-50mg/kg/jour', duration: '5 jours', notes: 'En 2 prises' },
      { name: 'Paracétamol', dosage: '10-15mg/kg', duration: 'Selon besoin', notes: 'Max 4 prises/jour' },
    ],
  },
  {
    id: 'malnutrition',
    name: 'Malnutrition',
    icon: '📏',
    description: 'Dépistage malnutrition avec bracelet MUAC',
    steps: [
      {
        id: 'mn-1',
        question: 'Mesurer le périmètre brachial (MUAC). Quelle est la couleur du bracelet ?',
        options: [
          { label: 'Rouge (<115mm) — Malnutrition sévère', value: 'red', severity: 'rouge' },
          { label: 'Orange (115-124mm) — Malnutrition modérée', value: 'orange', severity: 'orange' },
          { label: 'Vert (≥125mm) — Normal', value: 'green', severity: 'vert' },
        ],
        info: 'Le bracelet MUAC se place au milieu du bras gauche, bras relâché. Pour enfants 6-59 mois.',
      },
      {
        id: 'mn-2',
        question: 'Présence d\'œdèmes bilatéraux des pieds ?',
        options: [
          { label: 'Oui — Malnutrition œdémateuse', value: 'edema', severity: 'rouge' },
          { label: 'Non', value: 'no_edema' },
        ],
      },
    ],
    treatOnPlace: [
      'Malnutrition modérée: Plumpy\'Sup ou alimentation enrichie',
      'Counseling nutritionnel pour la mère',
      'Vitamine A, déparasitage (Albendazole)',
      'Suivi hebdomadaire',
    ],
    referralRequired: [
      'Malnutrition sévère (MUAC <115mm ou œdèmes)',
      'Complications médicales associées',
      'Absence d\'appétit',
      'Enfant <6 mois avec malnutrition',
    ],
    redFlags: ['MUAC <115mm', 'Œdèmes bilatéraux', 'Absence d\'appétit', 'Fièvre associée', 'Vomissements'],
    medications: [
      { name: 'Albendazole', dosage: '400mg dose unique', duration: '1 prise', notes: 'Enfant >1 an' },
      { name: 'Vitamine A', dosage: 'Selon âge', duration: '1 dose', notes: 'Enfant 6-59 mois' },
    ],
  },
  {
    id: 'grossesse',
    name: 'Grossesse (CPN)',
    icon: '🤰',
    description: 'Consultation prénatale — Checklist',
    steps: [
      {
        id: 'preg-1',
        question: 'Âge gestationnel estimé ?',
        options: [
          { label: '1er trimestre (0-13 SA)', value: 't1', severity: 'vert' },
          { label: '2e trimestre (14-27 SA)', value: 't2', severity: 'vert' },
          { label: '3e trimestre (28-40 SA)', value: 't3', nextStep: 'preg-2' },
        ],
      },
      {
        id: 'preg-2',
        question: 'Signes de danger ? (Saignements, maux de tête intenses, vision trouble, douleurs abdominales, fièvre, œdèmes du visage)',
        options: [
          { label: 'Oui — Urgence', value: 'danger', severity: 'rouge' },
          { label: 'Non', value: 'no_danger', severity: 'vert' },
        ],
      },
    ],
    treatOnPlace: [
      'Fer/Folate: 1 comprimé/jour pendant toute la grossesse',
      'MII (Moustiquaire Imprégnée d\'Insecticide)',
      'TPI (Traitement Préventif Intermittent) au Sulfadoxine-Pyriméthamine',
      'Vaccination antitétanique',
      'Counseling sur signes de danger',
      'Planification de l\'accouchement',
    ],
    referralRequired: [
      'Saignements vaginaux',
      'Hypertension (TA ≥14/9)',
      'Présentation anormale',
      'Grossesse multiple',
      'Fièvre pendant la grossesse',
    ],
    redFlags: ['Saignements', 'Maux de tête intenses', 'Vision trouble', 'Convulsions (éclampsie)', 'Rupture prématurée des membranes'],
    medications: [
      { name: 'Fer/Folate', dosage: '200/0.4mg', duration: 'Toute la grossesse', notes: '1 comprimé/jour' },
      { name: 'Sulfadoxine-Pyriméthamine (TPI)', dosage: '3 comprimés', duration: '3 doses', notes: 'À partir de 16 SA, minimum 1 mois entre doses' },
    ],
  },
  {
    id: 'vaccination',
    name: 'Vaccination',
    icon: '💉',
    description: 'Vérification du statut vaccinal',
    steps: [
      {
        id: 'vac-1',
        question: 'L\'enfant a-t-il son carnet de vaccination ?',
        options: [
          { label: 'Oui', value: 'yes', nextStep: 'vac-2' },
          { label: 'Non', value: 'no', severity: 'jaune' },
        ],
      },
      {
        id: 'vac-2',
        question: 'Les vaccins sont-ils à jour selon le calendrier ?',
        options: [
          { label: 'Oui — À jour', value: 'up_to_date', severity: 'vert' },
          { label: 'Non — Vaccins manquants', value: 'missing', severity: 'orange' },
          { label: 'En retard', value: 'late', severity: 'jaune' },
        ],
      },
    ],
    treatOnPlace: [
      'Vérifier le carnet de vaccination',
      'Administrer les vaccins manquants si disponibles',
      'Éduquer sur l\'importance de la vaccination',
      'Planifier les prochains rendez-vous',
    ],
    referralRequired: [
      'Réaction vaccinale sévère',
      'Enfant non vacciné avec exposition à une maladie évitable',
    ],
    redFlags: ['Réaction anaphylactique', 'Fièvre >39°C après vaccination', 'Convulsions'],
    medications: [],
  },
]

// ─────────── Training Modules ───────────

export const trainingModules: TrainingModule[] = [
  {
    id: 'train-palu',
    title: 'Prise en charge du Paludisme',
    description: 'Formation complète sur le diagnostic et traitement du paludisme au niveau communautaire',
    category: 'Maladies infectieuses',
    duration: '2 heures',
    lessons: [
      { id: 'l1', title: 'Introduction au paludisme', completed: true },
      { id: 'l2', title: 'Signes et symptômes', completed: true },
      { id: 'l3', title: 'Test de Diagnostic Rapide', completed: true },
      { id: 'l4', title: 'Traitement du paludisme simple', completed: false },
      { id: 'l5', title: 'Quand référer', completed: false },
    ],
    quiz: [
      { question: 'Quel est le traitement de première intention du paludisme simple ?', options: ['Chloroquine', 'Artéméther/Luméfantrine (ACT)', 'Quinine', 'Paracétamol'], correctAnswer: 1 },
      { question: 'Quel est un signe de paludisme grave ?', options: ['Fièvre modérée', 'Céphalées', 'Convulsions', 'Frissons'], correctAnswer: 2 },
    ],
    progress: 60,
  },
  {
    id: 'train-diarrhee',
    title: 'Prise en charge de la Diarrhée',
    description: 'Diagnostic et traitement de la diarrhée et déshydratation',
    category: 'Maladies diarrhéiques',
    duration: '1.5 heures',
    lessons: [
      { id: 'l1', title: 'Évaluation de la déshydratation', completed: true },
      { id: 'l2', title: 'Préparation et administration des SRO', completed: false },
      { id: 'l3', title: 'Quand référer', completed: false },
    ],
    quiz: [
      { question: 'Comment préparer les SRO ?', options: ['1 sachet dans 500ml d\'eau', '1 sachet dans 1L d\'eau', '2 sachets dans 1L d\'eau', '1 sachet dans 2L d\'eau'], correctAnswer: 1 },
    ],
    progress: 33,
  },
  {
    id: 'train-cpn',
    title: 'Consultation Prénatale',
    description: 'Soins prénatals au niveau communautaire',
    category: 'Santé maternelle',
    duration: '2 heures',
    lessons: [
      { id: 'l1', title: 'Signes de danger en grossesse', completed: true },
      { id: 'l2', title: 'Fer/Folate et TPI', completed: true },
      { id: 'l3', title: 'Planification de l\'accouchement', completed: true },
    ],
    quiz: [
      { question: 'Quand une femme enceinte doit-elle être référée ?', options: ['Fièvre', 'Saignements', 'Maux de tête intenses', 'Toutes ces réponses'], correctAnswer: 3 },
    ],
    progress: 100,
    completedAt: '2026-04-15',
    certificateId: 'CERT-ASC-2026-001',
  },
  {
    id: 'train-vaccination',
    title: 'Vaccination — Calendrier et Surveillance',
    description: 'Calendrier vaccinal PEV et suivi communautaire',
    category: 'Vaccination',
    duration: '1 heure',
    lessons: [
      { id: 'l1', title: 'Calendrier vaccinal PEV Guinée', completed: false },
      { id: 'l2', title: 'Surveillance des effets indésirables', completed: false },
    ],
    quiz: [],
    progress: 0,
  },
]

// ─────────── Demo Data ───────────

export const demoVisits: ASCVisit[] = [
  {
    id: 'VIS-001',
    ascId: 'ASC-001',
    ascName: 'Aminata Condé',
    patientId: 'P-2024-001',
    patientName: 'Aminata Diallo',
    patientAge: 28,
    patientGender: 'F',
    visitDate: '2026-05-10',
    location: { lat: 9.5092, lng: -13.7122, address: 'Conakry, Kaloum' },
    symptoms: ['Fièvre', 'Céphalées', 'Frissons'],
    vitalSigns: { temperature: 38.5, heartRate: 90, bloodPressureSystolic: 12, bloodPressureDiastolic: 8 },
    diagnosis: 'Paludisme simple',
    actionsTaken: ['TDR positif', 'ACT administré', 'Paracétamol donné', 'RDV suivi J3'],
    photos: [],
    isOffline: false,
    syncedAt: '2026-05-10T10:30:00Z',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'VIS-002',
    ascId: 'ASC-001',
    ascName: 'Aminata Condé',
    patientName: 'Enfant de M. Camara',
    patientAge: 3,
    patientGender: 'M',
    visitDate: '2026-05-10',
    location: { lat: 9.5250, lng: -13.6877, address: 'Conakry, Matam' },
    symptoms: ['Diarrhée', 'Vomissements'],
    vitalSigns: { temperature: 37.8, heartRate: 110, muac: 130 },
    diagnosis: 'Diarrhée sans déshydratation',
    actionsTaken: ['SRO administré', 'Zinc prescrit', 'Conseils nutritionnels'],
    photos: [],
    isOffline: true,
    createdAt: '2026-05-10T14:00:00Z',
  },
]

export const demoReferrals: ASCReferral[] = [
  {
    id: 'REF-001',
    visitId: 'VIS-003',
    patientId: 'P-2024-005',
    patientName: 'Mariama Sow',
    ascId: 'ASC-001',
    ascName: 'Aminata Condé',
    reason: 'Grossesse — Signes de pré-éclampsie (TA 15/9, œdèmes)',
    severity: 'rouge',
    destination: 'Hôpital Donka — Maternité',
    status: 'En route',
    notes: 'Enceinte de 32 SA, TA 15/9, œdèmes des membres inférieurs',
    createdAt: '2026-05-10T11:00:00Z',
  },
  {
    id: 'REF-002',
    visitId: 'VIS-004',
    patientName: 'Enfant de F. Touré',
    ascId: 'ASC-002',
    ascName: 'Ibrahima Diallo',
    reason: 'Pneumonie grave — Détresse respiratoire',
    severity: 'rouge',
    destination: 'Centre de santé Dixinn',
    status: 'Accepté',
    notes: 'Enfant 2 ans, FR 65/min, tirage respiratoire, geignement',
    createdAt: '2026-05-09T16:00:00Z',
    acceptedAt: '2026-05-09T16:15:00Z',
  },
]
