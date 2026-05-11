import type { PatientContext, PossibleDiagnosis, OrientationLevel } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface DiagnosticRequest {
  symptoms: string[]
  patientContext: PatientContext
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
}

export interface DiagnosticResponse {
  possibleDiagnoses: PossibleDiagnosis[]
  recommendedExams: string[]
  orientation: OrientationLevel
  redFlags: string[]
  questions: string[]
  isOffline: boolean
}

/* ─────────── Build Prompts ─────────── */

export function buildMedicalPrompt(symptoms: string[], patientContext: PatientContext): { system: string; user: string } {
  const system = `Tu es un assistant médical IA spécialisé dans les maladies tropicales et le contexte sanitaire africain, particulièrement en Guinée. Tu aides les professionnels de santé à analyser les symptômes et à orienter les patients.

RÈGLES STRICTES :
- Tu ne poses JAMAIS de diagnostic définitif. Tu proposes des hypothèses diagnostiques.
- Tu mentions TOUJOURS que c'est une aide au diagnostic, pas un remplacement du jugement médical.
- Tu considères les maladies endémiques de Guinée : paludisme, fièvre typhoïde, choléra, méningite, tuberculose, hépatite B, VIH, fièvre de Lassa, Ebola, dengue, rougeole.
- Tu évalues l'urgence et orientes vers le bon niveau de soins.
- Tu réponds TOUJOURS en JSON valide avec cette structure exacte :
{
  "possibleDiagnoses": [{ "name": "string", "confidence": number (0-100), "urgency": "Faible|Modéré|Élevé|Critique", "description": "string" }],
  "recommendedExams": ["string"],
  "orientation": "Centre de santé|Hôpital de district|Hôpital national|Urgences",
  "redFlags": ["string"],
  "questions": ["string"]
}

Maladies à considérer selon les symptômes :
- Fièvre : paludisme (priorité en zone endémique), typhoïde, dengue, Ebola, fièvre de Lassa, méningite
- Douleurs abdominales : appendicite, ulcère, hépatite, typhoïde, paludisme
- Difficultés respiratoires : pneumonie, asthme, tuberculose, COVID-19
- Symptômes neurologiques : méningite, AVC, paludisme cérébral, épilepsie
- Symptômes pédiatriques : rougeole, paludisme grave, malnutrition, infection respiratoire`

  const user = `Analyse les symptômes suivants pour un patient en Guinée :

SYMPTÔMES : ${symptoms.join(', ')}

CONTEXTE PATIENT :
- Âge : ${patientContext.age} ans
- Sexe : ${patientContext.gender === 'M' ? 'Masculin' : 'Féminin'}
${patientContext.weight ? `- Poids : ${patientContext.weight} kg` : ''}
${patientContext.height ? `- Taille : ${patientContext.height} cm` : ''}
${patientContext.conditions.length > 0 ? `- Antécédents : ${patientContext.conditions.join(', ')}` : ''}
${patientContext.medications.length > 0 ? `- Médicaments actuels : ${patientContext.medications.join(', ')}` : ''}
${patientContext.allergies.length > 0 ? `- Allergies : ${patientContext.allergies.join(', ')}` : ''}
${patientContext.isPregnant ? '- ENCEINTE : prendre en compte dans l\'analyse' : ''}
${patientContext.recentTravel ? `- Voyages récents : ${patientContext.recentTravel}` : ''}
${patientContext.vaccinationStatus ? `- Statut vaccinal : ${patientContext.vaccinationStatus}` : ''}

Fournis ton analyse au format JSON demandé.`

  return { system, user }
}

/* ─────────── Parse AI Response ─────────── */

export function parseDiagnosticResponse(response: string): DiagnosticResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        possibleDiagnoses: Array.isArray(parsed.possibleDiagnoses) ? parsed.possibleDiagnoses.map((d: Record<string, unknown>) => ({
          name: String(d.name || ''),
          confidence: Number(d.confidence || 0),
          urgency: (['Faible', 'Modéré', 'Élevé', 'Critique'].includes(d.urgency as string) ? d.urgency : 'Modéré') as PossibleDiagnosis['urgency'],
          description: String(d.description || ''),
        })) : [],
        recommendedExams: Array.isArray(parsed.recommendedExams) ? parsed.recommendedExams.map(String) : [],
        orientation: (['Centre de santé', 'Hôpital de district', 'Hôpital national', 'Urgences'].includes(parsed.orientation as string) ? parsed.orientation : 'Centre de santé') as OrientationLevel,
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.map(String) : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions.map(String) : [],
        isOffline: false,
      }
    }
  } catch {
    // Fall through to offline mode
  }
  return getOfflineDiagnostic([])
}

/* ─────────── Offline Diagnostic Trees ─────────── */

interface DiagnosticTree {
  symptoms: string[]
  diagnoses: PossibleDiagnosis[]
  exams: string[]
  orientation: OrientationLevel
  redFlags: string[]
  questions: string[]
}

const diagnosticTrees: Record<string, DiagnosticTree> = {
  'Fièvre': {
    symptoms: ['Fièvre', 'fièvre', 'fievre'],
    diagnoses: [
      { name: 'Paludisme', confidence: 75, urgency: 'Élevé', description: 'Infection parasitaire transmis par l\'anophèle. Première cause de consultation en Guinée. Vérifier avec TDR.' },
      { name: 'Fièvre typhoïde', confidence: 45, urgency: 'Modéré', description: 'Infection bactérienne due à Salmonella typhi. Fréquente en zone tropicale avec mauvaise assainissement.' },
      { name: 'Dengue', confidence: 30, urgency: 'Modéré', description: 'Infection virale transmise par le moustique Aedes. Douleurs articulaires intenses caractéristiques.' },
      { name: 'Fièvre de Lassa', confidence: 15, urgency: 'Critique', description: 'Fièvre hémorragique virale transmise par les rongeurs. Endémique en Guinée forestière. Isolation requise.' },
    ],
    exams: ['TDR Paludisme', 'Hémogramme', 'CRP', 'Hémoculture', 'Sérologie Widal', 'Bilan hépatique'],
    orientation: 'Hôpital de district',
    redFlags: ['Fièvre > 40°C', 'Signes hémorragiques', 'Altération de la conscience', 'Ictère', 'Difficultés respiratoires'],
    questions: ['Depuis quand la fièvre a-t-elle commencé ?', 'Y a-t-il des frissons ?', 'Avez-vous pris des antipaludéens récemment ?', 'Y a-t-il des cas de paludisme dans l\'entourage ?', 'Voyage récent en zone forestière ?'],
  },
  'Douleurs abdominales': {
    symptoms: ['Douleur abdominale', 'douleurs abdominales', 'ventre'],
    diagnoses: [
      { name: 'Appendicite aiguë', confidence: 40, urgency: 'Élevé', description: 'Inflammation de l\'appendice. Urgence chirurgicale si suspicion. Douleur FID typique.' },
      { name: 'Ulcère gastroduodénal', confidence: 35, urgency: 'Modéré', description: 'Lésion de la muqueuse gastrique ou duodénale. Douleur épigastrique soulagée par l\'alimentation.' },
      { name: 'Hépatite', confidence: 30, urgency: 'Modéré', description: 'Inflammation du foie. Hépatite B très fréquente en Guinée. Ictère possible.' },
      { name: 'Paludisme viscéral', confidence: 25, urgency: 'Élevé', description: 'Le paludisme peut se manifester par des douleurs abdominales, surtout chez l\'enfant.' },
    ],
    exams: ['NFS', 'CRP', 'Amylasémie', 'Bilan hépatique', 'Échographie abdominale', 'TDR Paludisme'],
    orientation: 'Hôpital de district',
    redFlags: ['Défense abdominale', 'Fièvre élevée associée', 'Vomissements incoercibles', 'Saignement digestif', 'Ictère'],
    questions: ['Localisation exacte de la douleur ?', 'La douleur irradie-t-elle ?', 'Depuis quand ?', 'Nausées ou vomissements ?', 'Transit intestinal normal ?'],
  },
  'Difficultés respiratoires': {
    symptoms: ['Essoufflement', 'Toux', 'Douleur thoracique', 'difficultés respiratoires'],
    diagnoses: [
      { name: 'Pneumonie', confidence: 55, urgency: 'Élevé', description: 'Infection du parenchyme pulmonaire. Cause majeure de mortalité infantile en Afrique.' },
      { name: 'Asthme', confidence: 35, urgency: 'Modéré', description: 'Bronchospasme récurrent. Sibilants à l\'auscultation. Crises déclenchées par allergènes.' },
      { name: 'Tuberculose', confidence: 40, urgency: 'Élevé', description: 'Infection mycobactérienne. Endémique en Guinée. Toux > 2 semaines, sueurs nocturnes, amaigrissement.' },
      { name: 'COVID-19', confidence: 20, urgency: 'Modéré', description: 'Infection virale SARS-CoV-2. Perte de goût/odorat possible. Pneumonie bilatérale.' },
    ],
    exams: ['Radiographie thoracique', 'Saturométrie', 'NFS', 'CRP', 'BAAR (crachats)', 'TDR COVID-19'],
    orientation: 'Hôpital de district',
    redFlags: ['Détresse respiratoire', 'SpO2 < 90%', 'Hémoptysie', 'Cyanose', 'Confusion'],
    questions: ['Depuis quand la toux/essoufflement ?', 'Crachats ? Quelle couleur ?', 'Fièvre associée ?', 'Sueurs nocturnes ?', 'Perte de poids ?'],
  },
  'Symptômes neurologiques': {
    symptoms: ['Céphalées', 'Vertiges', 'Confusion', 'Convulsions', 'méningite', 'AVC'],
    diagnoses: [
      { name: 'Méningite', confidence: 50, urgency: 'Critique', description: 'Infection des méninges. Urgence vitale. Raideur de nuque, photophobie, fièvre.' },
      { name: 'AVC', confidence: 40, urgency: 'Critique', description: 'Accident vasculaire cérébral. Hypertension premier facteur de risque en Afrique. Fenêtre thérapeutique courte.' },
      { name: 'Paludisme cérébral', confidence: 35, urgency: 'Critique', description: 'Forme grave du paludisme avec atteinte neurologique. Urgence absolue.' },
      { name: 'Épilepsie', confidence: 25, urgency: 'Modéré', description: 'Trouble neurologique caractérisé par des crises récurrentes. Stigmatisé dans certaines communautés.' },
    ],
    exams: ['Ponction lombaire', 'Scanner cérébral', 'IRM', 'TDR Paludisme', 'Glycémie', 'Ionogramme'],
    orientation: 'Urgences',
    redFlags: ['Altération de la conscience', 'Raideur de nuque', 'Déficit neurologique focal', 'Crise convulsive', 'Fièvre élevée + confusion'],
    questions: ['Début brutal ou progressif ?', 'Raideur de nuque ?', 'Perte de connaissance ?', 'Déficit moteur ou sensitif ?', 'Antécédents d\'hypertension ?'],
  },
  'Symptômes pédiatriques': {
    symptoms: ['Convulsions', 'Léthargie', 'Refus de téter', 'rougeole', 'pédiatrique'],
    diagnoses: [
      { name: 'Rougeole', confidence: 50, urgency: 'Élevé', description: 'Maladie virale très contagieuse. Éruption maculopapuleuse. Complications pulmonaires possibles.' },
      { name: 'Paludisme grave', confidence: 45, urgency: 'Critique', description: 'Paludisme chez l\'enfant : anémie sévère, paludisme cérébral, détresse respiratoire.' },
      { name: 'Malnutrition', confidence: 40, urgency: 'Élevé', description: 'Insuffisance nutritionnelle majeure. Fréquente en Guinée. Œdèmes, apathie, perte de poids.' },
      { name: 'Infection respiratoire aiguë', confidence: 35, urgency: 'Élevé', description: 'Pneumonie ou bronchiolite. Première cause de mortalité infantile en Afrique subsaharienne.' },
    ],
    exams: ['TDR Paludisme', 'Hémogramme', 'Protéine C réactive', 'Radiographie thoracique', 'Poids/Taille (courbe)'],
    orientation: 'Hôpital de district',
    redFlags: ['Convulsions', 'Léthargie/inconscience', 'Difficulté à boire/téter', 'Vomissements tout', 'Fièvre > 39°C chez < 3 mois'],
    questions: ['Âge de l\'enfant ?', 'Vaccinations à jour ?', 'Poids et taille ?', 'Fièvre depuis quand ?', 'Difficulté à respirer ?'],
  },
}

export function getDiagnosticTree(symptomCategory: string): DiagnosticResponse {
  const tree = diagnosticTrees[symptomCategory]
  if (tree) {
    return {
      possibleDiagnoses: tree.diagnoses,
      recommendedExams: tree.exams,
      orientation: tree.orientation,
      redFlags: tree.redFlags,
      questions: tree.questions,
      isOffline: true,
    }
  }
  return getOfflineDiagnostic([])
}

export function getOfflineDiagnostic(symptoms: string[]): DiagnosticResponse {
  // Try to match symptoms to a diagnostic tree
  const allSymptomsLower = symptoms.map(s => s.toLowerCase())

  for (const [category, tree] of Object.entries(diagnosticTrees)) {
    const matches = tree.symptoms.some(s => allSymptomsLower.some(sym => sym.includes(s.toLowerCase()) || s.toLowerCase().includes(sym)))
    if (matches) {
      return {
        possibleDiagnoses: tree.diagnoses,
        recommendedExams: tree.exams,
        orientation: tree.orientation,
        redFlags: tree.redFlags,
        questions: tree.questions,
        isOffline: true,
      }
    }
  }

  // Default fallback
  return {
    possibleDiagnoses: [
      { name: 'Paludisme', confidence: 40, urgency: 'Modéré', description: 'Pathologie endémique en Guinée. À vérifier systématiquement devant tout syndrome fébrile.' },
      { name: 'Infection bactérienne non spécifiée', confidence: 25, urgency: 'Modéré', description: 'Infection nécessitant des examens complémentaires pour identification.' },
      { name: 'Pathologie virale', confidence: 20, urgency: 'Faible', description: 'Syndrome viral pouvant correspondre à plusieurs pathologies.' },
    ],
    recommendedExams: ['TDR Paludisme', 'NFS', 'CRP', 'Consultation médicale'],
    orientation: 'Centre de santé',
    redFlags: ['Fièvre > 39°C', 'Altération de la conscience', 'Détresse respiratoire', 'Saignement'],
    questions: ['Depuis quand les symptômes ?', 'Fièvre associée ?', 'Médicaments pris ?'],
    isOffline: true,
  }
}

export function analyzeSymptoms(symptoms: string[], patientContext: PatientContext): DiagnosticResponse {
  // This is the main function called from the API route
  // In the API route, we try AI first, then fall back to offline
  return getOfflineDiagnostic(symptoms)
}
