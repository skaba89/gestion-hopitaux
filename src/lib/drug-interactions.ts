import type { PatientContext, DrugInteractionAlert, DosageAdjustment, InteractionCheckResult } from '@/lib/data-store'

/* ─────────── Types ─────────── */

export interface InteractionCheckRequest {
  medications: string[]
  patientContext: PatientContext
}

/* ─────────── Build Prompts ─────────── */

export function buildInteractionPrompt(medications: string[], patientContext: PatientContext): { system: string; user: string } {
  const system = `Tu es un pharmacien clinicien IA spécialisé dans les interactions médicamenteuses, en particulier pour les médicaments disponibles en Afrique de l'Ouest et en Guinée.

Tu analyses les combinaisons de médicaments et identifies :
1. Les interactions médicamenteuses entre les produits listés
2. Les contre-indications liées au profil du patient
3. Les ajustements posologiques nécessaires

Tu réponds TOUJOURS en JSON valide avec cette structure :
{
  "interactions": [{ "drug1": "string", "drug2": "string", "severity": "MINEUR|MODÉRÉ|MAJEUR|CRITIQUE", "description": "string", "recommendation": "string" }],
  "contraindications": ["string"],
  "dosageAdjustments": [{ "medication": "string", "standardDosage": "string", "adjustedDosage": "string", "reason": "string" }]
}

Sévérité :
- MINEUR : pas d'action nécessaire, information
- MODÉRÉ : surveillance, ajustement possible
- MAJEUR : contre-indication relative, alternative recommandée
- CRITIQUE : contre-indication absolue, association à éviter`

  const user = `Vérifie les interactions entre ces médicaments : ${medications.join(', ')}

PROFIL PATIENT :
- Âge : ${patientContext.age} ans
- Sexe : ${patientContext.gender === 'M' ? 'Masculin' : 'Féminin'}
${patientContext.weight ? `- Poids : ${patientContext.weight} kg` : ''}
${patientContext.conditions.length > 0 ? `- Pathologies : ${patientContext.conditions.join(', ')}` : ''}
${patientContext.allergies.length > 0 ? `- Allergies : ${patientContext.allergies.join(', ')}` : ''}
${patientContext.isPregnant ? '- ENCEINTE : vérifier tératogénicité' : ''}
${patientContext.medications.length > 0 ? `- Traitements en cours : ${patientContext.medications.join(', ')}` : ''}

Fournis l'analyse au format JSON.`

  return { system, user }
}

/* ─────────── Parse AI Response ─────────── */

export function parseInteractionResponse(response: string): InteractionCheckResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        interactions: Array.isArray(parsed.interactions) ? parsed.interactions.map((i: Record<string, unknown>, idx: number) => ({
          id: `INT-${Date.now()}-${idx}`,
          drug1: String(i.drug1 || ''),
          drug2: String(i.drug2 || ''),
          severity: (['MINEUR', 'MODÉRÉ', 'MAJEUR', 'CRITIQUE'].includes(i.severity as string) ? i.severity : 'MODÉRÉ') as DrugInteractionAlert['severity'],
          description: String(i.description || ''),
          recommendation: String(i.recommendation || ''),
        })) : [],
        contraindications: Array.isArray(parsed.contraindications) ? parsed.contraindications.map(String) : [],
        dosageAdjustments: Array.isArray(parsed.dosageAdjustments) ? parsed.dosageAdjustments.map((d: Record<string, unknown>) => ({
          medication: String(d.medication || ''),
          standardDosage: String(d.standardDosage || ''),
          adjustedDosage: String(d.adjustedDosage || ''),
          reason: String(d.reason || ''),
        })) : [],
        isOffline: false,
      }
    }
  } catch {
    // Fall through to offline
  }
  return checkInteractionsOffline([])
}

/* ─────────── Offline Interaction Database ─────────── */

interface DrugInteractionEntry {
  drug1: string
  drug2: string
  severity: DrugInteractionAlert['severity']
  description: string
  recommendation: string
}

const offlineInteractions: DrugInteractionEntry[] = [
  // Antipaludéens
  { drug1: 'Artéméther/Luméfantrine', drug2: 'Quinine', severity: 'MAJEUR', description: 'Risque de prolongation de l\'intervalle QTc. Allongement additif.', recommendation: 'Ne pas associser. Espacer de 7 jours minimum entre les deux traitements.' },
  { drug1: 'Artéméther/Luméfantrine', drug2: 'Primaquine', severity: 'MODÉRÉ', description: 'Risque hémolytique chez les patients déficitaires en G6PD.', recommendation: 'Vérifier le statut G6PD avant d\'associer.' },
  { drug1: 'Quinine', drug2: 'Métronidazole', severity: 'MODÉRÉ', description: 'Risque de neurotoxicité additive.', recommendation: 'Surveillance neurologique renforcée si association nécessaire.' },

  // Antibiotiques
  { drug1: 'Amoxicilline', drug2: 'Métronidazole', severity: 'MINEUR', description: 'Interaction pharmacodynamique favorable. Association synergique pour certaines infections.', recommendation: 'Association possible et souvent recommandée.' },
  { drug1: 'Ciprofloxacine', drug2: 'Amlodipine', severity: 'MODÉRÉ', description: 'La ciprofloxacine inhibe le CYP3A4, augmentant les concentrations d\'amlodipine.', recommendation: 'Surveillance tensionnelle. Envisager adaptation posologique.' },
  { drug1: 'Cotrimoxazole', drug2: 'Méthotrexate', severity: 'CRITIQUE', description: 'Augmentation majeure de la toxicité hématologique du méthotrexate.', recommendation: 'Association contre-indiquée.' },
  { drug1: 'Cotrimoxazole', drug2: 'Insuline', severity: 'MODÉRÉ', description: 'Risque majoré d\'hypoglycémie.', recommendation: 'Surveillance glycémique renforcée.' },
  { drug1: 'Rifampicine', drug2: 'Amlodipine', severity: 'MAJEUR', description: 'La rifampicine est un inducteur enzymatique puissant. Diminution de l\'efficacité de l\'amlodipine.', recommendation: 'Augmenter la dose d\'amlodipine ou changer d\'antihypertenseur.' },
  { drug1: 'Rifampicine', drug2: 'Efavirenz', severity: 'MAJEUR', description: 'Interaction métabolique complexe. Rifampicine diminue les concentrations d\'efavirenz.', recommendation: 'Augmenter efavirenz à 800mg/j si poids > 50kg. Surveillance virologique.' },
  { drug1: 'Isoniazide', drug2: 'Paracétamol', severity: 'MODÉRÉ', description: 'L\'isoniazide augmente la toxicité hépatique du paracétamol par induction du CYP2E1.', recommendation: 'Limiter le paracétamol à 2g/jour. Surveillance hépatique.' },

  // Antirétroviraux
  { drug1: 'Efavirenz', drug2: 'Amlodipine', severity: 'MODÉRÉ', description: 'L\'efavirenz induit le CYP3A4, réduisant les concentrations d\'amlodipine.', recommendation: 'Adapter la dose d\'amlodipine. Contrôle tensionnel fréquent.' },
  { drug1: 'Ténofovir', drug2: 'Ibuprofène', severity: 'MAJEUR', description: 'Risque de néphrotoxicité additive. Le ténofovir est néphrotoxique et les AINS réduisent la perfusion rénale.', recommendation: 'Éviter l\'association. Utiliser du paracétamol à la place.' },
  { drug1: 'Dolutégravir', drug2: 'Metformine', severity: 'MODÉRÉ', description: 'Le dolutégravir inhibe la sécrétion tubulaire de la metformine.', recommendation: 'Ne pas dépasser 1000mg/j de metformine avec dolutégravir.' },

  // Antihypertenseurs
  { drug1: 'Amlodipine', drug2: 'Losartan', severity: 'MINEUR', description: 'Association synergique et complémentaire pour le contrôle tensionnel.', recommendation: 'Association possible et souvent recommandée. Surveiller hypotension.' },
  { drug1: 'Hydrochlorothiazide', drug2: 'Insuline', severity: 'MODÉRÉ', description: 'Les diurétiques thiazidiques peuvent diminuer la tolérance au glucose.', recommendation: 'Surveillance glycémique. Adapter la dose d\'insuline si besoin.' },

  // Antidiabétiques
  { drug1: 'Metformine', drug2: 'Ibuprofène', severity: 'MODÉRÉ', description: 'Risque d\'acidose lactique en cas d\'insuffisance rénale aiguë provoquée par les AINS.', recommendation: 'Éviter si fonction rénale altérée. Paracétamol préféré.' },
  { drug1: 'Glibenclamide', drug2: 'Ciprofloxacine', severity: 'MODÉRÉ', description: 'Risque majoré d\'hypoglycémie par inhibition du CYP2C9.', recommendation: 'Surveillance glycémique renforcée.' },

  // Antalgiques/Anti-inflammatoires
  { drug1: 'Ibuprofène', drug2: 'Aspirine', severity: 'MODÉRÉ', description: 'Compétition pour la liaison à l\'albumine. Risque ulcérogène augmenté.', recommendation: 'Éviter l\'association. Utiliser le paracétamol comme alternative.' },
  { drug1: 'Paracétamol', drug2: 'Tramadol', severity: 'MINEUR', description: 'Association antalgique complémentaire.', recommendation: 'Association possible en respectant les posologies maximales.' },
  { drug1: 'Diclofénac', drug2: 'Amlodipine', severity: 'MODÉRÉ', description: 'Les AINS réduisent l\'effet antihypertenseur de l\'amlodipine.', recommendation: 'Surveillance tensionnelle. Paracétamol préféré.' },
  { drug1: 'Diclofénac', drug2: 'Hydrochlorothiazide', severity: 'MODÉRÉ', description: 'Risque d\'insuffisance rénale aiguë par diminution de la perfusion rénale.', recommendation: 'Hydratation suffisante. Surveillance de la fonction rénale.' },

  // Corticoïdes
  { drug1: 'Prednisone', drug2: 'Ibuprofène', severity: 'MAJEUR', description: 'Risque majoré d\'ulcère gastro-duodénal et d\'hémorragie digestive.', recommendation: 'Association déconseillée. Si nécessaire, protection gastrique par IPP.' },
  { drug1: 'Prednisone', drug2: 'Insuline', severity: 'MODÉRÉ', description: 'Les corticoïdes augmentent la glycémie (effet diabétogène).', recommendation: 'Adapter les doses d\'insuline. Surveillance glycémique renforcée.' },
]

export function checkInteractionsOffline(medications: string[]): InteractionCheckResult {
  const medsLower = medications.map(m => m.toLowerCase())

  const foundInteractions: DrugInteractionAlert[] = []
  const foundContraindications: string[] = []
  const foundAdjustments: DosageAdjustment[] = []

  for (const interaction of offlineInteractions) {
    const d1 = interaction.drug1.toLowerCase()
    const d2 = interaction.drug2.toLowerCase()

    const match1 = medsLower.some(m => m.includes(d1) || d1.includes(m))
    const match2 = medsLower.some(m => m.includes(d2) || d2.includes(m))

    if (match1 && match2) {
      foundInteractions.push({
        id: `INT-${Date.now()}-${foundInteractions.length}`,
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        severity: interaction.severity,
        description: interaction.description,
        recommendation: interaction.recommendation,
      })

      if (interaction.severity === 'CRITIQUE') {
        foundContraindications.push(`Association ${interaction.drug1} + ${interaction.drug2} : ${interaction.description}`)
      }
    }

    // Check single drug interactions with patient conditions
    if (match1 || match2) {
      // Adjustments for age/weight
      const medName = match1 ? interaction.drug1 : interaction.drug2
      if (medName === 'Metformine' && medsLower.some(m => m.includes('metformine'))) {
        foundAdjustments.push({
          medication: 'Metformine',
          standardDosage: '500-1000mg x2/jour',
          adjustedDosage: '500mg x2/jour',
          reason: 'Ajustement en cas d\'insuffisance rénale ou patients âgés',
        })
      }
    }
  }

  return {
    interactions: foundInteractions,
    contraindications: foundContraindications,
    dosageAdjustments: foundAdjustments,
    isOffline: true,
  }
}

export function checkInteractions(medications: string[], patientContext: PatientContext): InteractionCheckResult {
  // This is the main function. API routes will try AI first then fallback
  void patientContext // used in API route with AI
  return checkInteractionsOffline(medications)
}
