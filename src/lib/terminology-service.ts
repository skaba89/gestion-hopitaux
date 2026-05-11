// HealthFlow Africa - Terminology Service
// ICD-10, LOINC, SNOMED CT, ATC code systems & Guinea-specific value sets

/* ─────────── Code System Definitions ─────────── */

export interface CodeSystem {
  id: string
  name: string
  system: string
  version: string
  description: string
  totalCodes: number
  language: string
  lastUpdated: string
}

export interface ConceptDefinition {
  code: string
  display: string
  displayFr: string
  definition: string
  parent: string | null
  children: string[]
  properties: Record<string, string>
}

export interface ValueSet {
  id: string
  name: string
  url: string
  status: 'active' | 'draft' | 'retired'
  description: string
  system: string
  concepts: { code: string; display: string; displayFr: string }[]
}

/* ─────────── Supported Code Systems ─────────── */

export const CODE_SYSTEMS: CodeSystem[] = [
  {
    id: 'icd10',
    name: 'ICD-10',
    system: 'http://hl7.org/fhir/sid/icd-10',
    version: '2019',
    description: 'Classification internationale des maladies, 10e révision — codes diagnostiques utilisés en Guinée',
    totalCodes: 14500,
    language: 'fr',
    lastUpdated: '2024-01-01',
  },
  {
    id: 'loinc',
    name: 'LOINC',
    system: 'http://loinc.org',
    version: '2.77',
    description: 'Logical Observation Identifiers Names and Codes — nomenclature des examens de laboratoire et observations cliniques',
    totalCodes: 99000,
    language: 'en',
    lastUpdated: '2024-06-01',
  },
  {
    id: 'snomed',
    name: 'SNOMED CT',
    system: 'http://snomed.info/sct',
    version: '2024-01-01',
    description: 'Systematized Nomenclature of Medicine — terminologie clinique exhaustive',
    totalCodes: 350000,
    language: 'en',
    lastUpdated: '2024-01-01',
  },
  {
    id: 'atc',
    name: 'ATC',
    system: 'http://www.whocc.no/atc',
    version: '2024',
    description: 'Classification Anatomique, Thérapeutique et Chimique — système de classification des médicaments OMS',
    totalCodes: 6200,
    language: 'fr',
    lastUpdated: '2024-01-01',
  },
  {
    id: 'guinea-diseases',
    name: 'Maladies Guinée',
    system: 'https://healthflow-gn.com/fhir/code-system/diseases',
    version: '1.0',
    description: 'Maladies endémiques et prioritaires en Guinée — codes spécifiques au contexte national',
    totalCodes: 85,
    language: 'fr',
    lastUpdated: '2026-01-01',
  },
  {
    id: 'guinea-establishments',
    name: 'Établissements Guinée',
    system: 'https://healthflow-gn.com/fhir/code-system/establishment',
    version: '1.0',
    description: 'Nomenclature des établissements de santé de Guinée (CHU, régionaux, centres de santé, postes)',
    totalCodes: 450,
    language: 'fr',
    lastUpdated: '2026-01-01',
  },
]

/* ─────────── Guinea-Specific Disease Codes ─────────── */

export const GUINEA_DISEASES: ConceptDefinition[] = [
  { code: 'B50', display: 'Plasmodium falciparum malaria', displayFr: 'Paludisme à Plasmodium falciparum', definition: 'Forme la plus grave du paludisme, endémique en Guinée avec transmission toute l\'année', parent: 'B50-B54', children: ['B50.0', 'B50.8', 'B50.9'], properties: { priority: 'high', endemic: 'true' } },
  { code: 'B54', display: 'Unspecified malaria', displayFr: 'Paludisme, non précisé', definition: 'Paludisme non spécifié — code fréquemment utilisé dans les centres de santé ruraux', parent: 'B50-B54', children: [], properties: { priority: 'high', endemic: 'true' } },
  { code: 'A00', display: 'Cholera', displayFr: 'Choléra', definition: 'Maladie diarrhéique aiguë — épidémies récurrentes en Guinée, surveillance mTrac obligatoire', parent: 'A00-A09', children: ['A00.0', 'A00.1', 'A00.9'], properties: { priority: 'critical', notifiable: 'true', mTrac: 'true' } },
  { code: 'A01.0', display: 'Typhoid fever', displayFr: 'Fièvre typhoïde', definition: 'Infection systémique par Salmonella typhi — fréquente dans les zones à assainissement insuffisant', parent: 'A01', children: [], properties: { priority: 'medium', endemic: 'true' } },
  { code: 'B16', display: 'Acute hepatitis B', displayFr: 'Hépatite B aiguë', definition: 'Hépatite B — prévalence élevée en Guinée (8-12%), vaccination recommandée', parent: 'B15-B19', children: ['B16.0', 'B16.1', 'B16.9'], properties: { priority: 'high', endemic: 'true', vaccinePreventable: 'true' } },
  { code: 'B18.1', display: 'Chronic viral hepatitis B without delta-agent', displayFr: 'Hépatite virale chronique B sans agent delta', definition: 'Forme chronique de l\'hépatite B — charge importante sur le système de santé guinéen', parent: 'B15-B19', children: [], properties: { priority: 'high', endemic: 'true' } },
  { code: 'B20', display: 'HIV disease', displayFr: 'Maladie à VIH', definition: 'Infection par le VIH — programmes nationaux de dépistage et de traitement (ARV)', parent: 'B20-B24', children: ['B20.0', 'B20.1', 'B20.2'], properties: { priority: 'critical', notifiable: 'true' } },
  { code: 'A15', display: 'Respiratory tuberculosis', displayFr: 'Tuberculose respiratoire', definition: 'TB pulmonaire — la Guinée est parmi les pays à haute charge TB en Afrique de l\'Ouest', parent: 'A15-A19', children: ['A15.0', 'A15.1', 'A15.2'], properties: { priority: 'critical', notifiable: 'true' } },
  { code: 'J06.9', display: 'Acute upper respiratory infection, unspecified', displayFr: 'Infection respiratoire aiguë haute, non précisée', definition: 'IRA — une des causes les plus fréquentes de consultation en Guinée', parent: 'J00-J06', children: [], properties: { priority: 'medium', endemic: 'true' } },
  { code: 'I10', display: 'Essential (primary) hypertension', displayFr: 'Hypertension artérielle essentielle', definition: 'HTA — prévalence croissante en Guinée liée à la transition épidémiologique', parent: 'I10-I16', children: [], properties: { priority: 'high', ncd: 'true' } },
  { code: 'E11', display: 'Type 2 diabetes mellitus', displayFr: 'Diabète de type 2', definition: 'Diabète type 2 — en augmentation en Guinée, programme national de lutte contre le diabète', parent: 'E10-E14', children: ['E11.0', 'E11.1', 'E11.5'], properties: { priority: 'high', ncd: 'true' } },
  { code: 'I63.9', display: 'Cerebral infarction, unspecified', displayFr: 'AVC ischémique, non précisé', definition: 'Accident vasculaire cérébral — urgence neurologique majeure, prise en charge limitée hors Conakry', parent: 'I60-I69', children: [], properties: { priority: 'critical', emergency: 'true' } },
  { code: 'E46', display: 'Unspecified protein-calorie malnutrition', displayFr: 'Malnutrition protéino-calorique, non précisée', definition: 'Malnutrition — touche 30% des enfants de moins de 5 ans en Guinée', parent: 'E40-E46', children: [], properties: { priority: 'critical', childHealth: 'true' } },
  { code: 'O00', display: 'Ectopic pregnancy', displayFr: 'Grossesse extra-utérine', definition: 'GEU — cause majeure de mortalité maternelle en Guinée', parent: 'O00-O08', children: ['O00.0', 'O00.1', 'O00.9'], properties: { priority: 'critical', maternalHealth: 'true' } },
  { code: 'P23', display: 'Congenital pneumonia', displayFr: 'Pneumonie congénitale', definition: 'Infection néonatale — mortalité néonatale élevée en Guinée', parent: 'P20-P29', children: [], properties: { priority: 'high', neonatal: 'true' } },
  { code: 'B05', display: 'Measles', displayFr: 'Rougeole', definition: 'Rougeole — épidémies récurrentes, couverture vaccinale insuffisante dans certaines zones', parent: 'B00-B09', children: ['B05.0', 'B05.1', 'B05.2'], properties: { priority: 'critical', notifiable: 'true', vaccinePreventable: 'true', mTrac: 'true' } },
  { code: 'A87', display: 'Meningitis', displayFr: 'Méningite', definition: 'Méningite — épidémies dans la ceinture de la méningite (N\'Zérékoré)', parent: 'A80-A89', children: ['A87.0', 'A87.1', 'A87.9'], properties: { priority: 'critical', notifiable: 'true', mTrac: 'true' } },
  { code: 'A95', display: 'Yellow fever', displayFr: 'Fièvre jaune', definition: 'Fièvre jaune — endémique en Guinée, vaccination obligatoire', parent: 'A80-A89', children: [], properties: { priority: 'critical', notifiable: 'true', vaccinePreventable: 'true' } },
  { code: 'A82', display: 'Rabies', displayFr: 'Rage', definition: 'Rage — problème de santé publique en Guinée, chiens errants', parent: 'A80-A89', children: [], properties: { priority: 'high', notifiable: 'true' } },
  { code: 'L00', display: 'Staphylococcal scalded skin syndrome', displayFr: 'Syndrome de la peau ébouillantée staphylococcique', definition: 'Infection cutanée — fréquente chez les nouveau-nés en Guinée', parent: 'L00-L08', children: [], properties: { priority: 'medium' } },
]

/* ─────────── LOINC Codes for Guinea ─────────── */

export const GUINEA_LOINC_CODES: ConceptDefinition[] = [
  { code: '11502-2', display: 'Laboratory report', displayFr: 'Rapport de laboratoire', definition: 'Rapport d\'examen de laboratoire standard', parent: null, children: [], properties: { category: 'Laboratory' } },
  { code: '58410-2', display: 'Complete blood count', displayFr: 'Hémogramme complet', definition: 'Numération formule sanguine complète — examen le plus prescrit en Guinée', parent: '11502-2', children: [], properties: { category: 'Hematology', frequency: 'very-high' } },
  { code: '2345-7', display: 'Glucose', displayFr: 'Glycémie', definition: 'Dosage du glucose sanguin — dépistage du diabète', parent: '11502-2', children: [], properties: { category: 'Chemistry', frequency: 'high' } },
  { code: '2160-0', display: 'Creatinine', displayFr: 'Créatinine', definition: 'Dosage de la créatinine — fonction rénale', parent: '11502-2', children: [], properties: { category: 'Chemistry', frequency: 'high' } },
  { code: '6768-6', display: 'Alkaline phosphatase', displayFr: 'Phosphatases alcalines', definition: 'Dosage des PAL — fonction hépatique', parent: '11502-2', children: [], properties: { category: 'Chemistry', frequency: 'medium' } },
  { code: '1743-4', display: 'ALT', displayFr: 'ALAT (Transaminases)', definition: 'Alanine aminotransférase — hépatite B', parent: '11502-2', children: [], properties: { category: 'Chemistry', frequency: 'high' } },
  { code: '5794-3', display: 'HBsAg', displayFr: 'Antigène HBs', definition: 'Dépistage hépatite B — obligatoire en Guinée', parent: '11502-2', children: [], properties: { category: 'Serology', frequency: 'high', mandatory: 'true' } },
  { code: '16128-1', display: 'HIV 1+2 Ab', displayFr: 'Anticorps VIH 1+2', definition: 'Sérologie VIH — dépistage systématique', parent: '11502-2', children: [], properties: { category: 'Serology', frequency: 'high', mandatory: 'true' } },
  { code: '94309-2', display: 'SARS-CoV-2 RNA', displayFr: 'ARN SARS-CoV-2 (COVID-19)', definition: 'Test PCR COVID-19 — utilisé aux points d\'entrée', parent: '11502-2', children: [], properties: { category: 'Microbiology', frequency: 'medium' } },
  { code: '11268-0', display: 'Thick smear for malaria', displayFr: 'Frottis épais paludisme', definition: 'Examen de référence pour le paludisme', parent: '11502-2', children: [], properties: { category: 'Parasitology', frequency: 'very-high' } },
]

/* ─────────── ATC Drug Codes for Guinea ─────────── */

export const GUINEA_ATC_CODES: ConceptDefinition[] = [
  { code: 'P01BE01', display: 'Artemisinin', displayFr: 'Artémisinine', definition: 'Combinaisons thérapeutiques à base d\'artémisinine (ACT) — traitement de première intention du paludisme simple en Guinée', parent: 'P01B', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'J01CA04', display: 'Amoxicillin', displayFr: 'Amoxicilline', definition: 'Antibiotique de la famille des pénicillines — le plus prescrit en Guinée', parent: 'J01C', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'B05AA01', display: 'Albumin', displayFr: 'Albumine', definition: 'Solutions pour perfusion — essentielles pour la réanimation', parent: 'B05A', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'C09AA02', display: 'Enalapril', displayFr: 'Énalapril', definition: 'IEC — traitement de l\'hypertension artérielle, disponible en générique', parent: 'C09A', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'A10BA02', display: 'Metformin', displayFr: 'Metformine', definition: 'Biguanide — traitement de première intention du diabète type 2', parent: 'A10B', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'N02BA01', display: 'Acetylsalicylic acid', displayFr: 'Acide acétylsalicylique (Aspirine)', definition: 'Anti-inflammatoire et antiagrégant plaquettaire — usage large', parent: 'N02B', children: [], properties: { essential: 'true', guineaFormulary: 'true' } },
  { code: 'J05AF01', display: 'Zidovudine', displayFr: 'Zidovudine (AZT)', definition: 'Antirétroviral — traitement du VIH dans le cadre du programme national', parent: 'J05A', children: [], properties: { essential: 'true', guineaFormulary: 'true', hivProgram: 'true' } },
  { code: 'J04AM02', display: 'Rifampicin + Isoniazid', displayFr: 'Rifampicine + Isoniazide', definition: 'Combinaison fixe antituberculeuse — programme national TB', parent: 'J04A', children: [], properties: { essential: 'true', guineaFormulary: 'true', tbProgram: 'true' } },
]

/* ─────────── Guinea Value Sets ─────────── */

export const GUINEA_VALUE_SETS: ValueSet[] = [
  {
    id: 'guinea-notifiable-diseases',
    name: 'Maladies à déclaration obligatoire (MADO) Guinée',
    url: 'https://healthflow-gn.com/fhir/ValueSet/notifiable-diseases',
    status: 'active',
    description: 'Liste des maladies à déclaration obligatoire en République de Guinée — déclaration immédiate à la DNS via mTrac',
    system: 'http://hl7.org/fhir/sid/icd-10',
    concepts: [
      { code: 'A00', display: 'Cholera', displayFr: 'Choléra' },
      { code: 'B05', display: 'Measles', displayFr: 'Rougeole' },
      { code: 'A87', display: 'Meningitis', displayFr: 'Méningite' },
      { code: 'A95', display: 'Yellow fever', displayFr: 'Fièvre jaune' },
      { code: 'A82', display: 'Rabies', displayFr: 'Rage' },
      { code: 'B20', display: 'HIV disease', displayFr: 'VIH/SIDA' },
      { code: 'A15', display: 'Respiratory TB', displayFr: 'Tuberculose' },
      { code: 'U07.1', display: 'COVID-19', displayFr: 'COVID-19' },
      { code: 'A90', display: 'Dengue fever', displayFr: 'Dengue' },
      { code: 'A98.4', display: 'Ebola virus disease', displayFr: 'Maladie à virus Ebola' },
    ],
  },
  {
    id: 'guinea-establishment-types',
    name: 'Types d\'établissements de santé Guinée',
    url: 'https://healthflow-gn.com/fhir/ValueSet/establishment-types',
    status: 'active',
    description: 'Classification des établissements de santé selon le système national guinéen',
    system: 'https://healthflow-gn.com/fhir/code-system/establishment-type',
    concepts: [
      { code: 'CHU', display: 'University Hospital Center', displayFr: 'Centre Hospitalier Universitaire' },
      { code: 'CHR', display: 'Regional Hospital Center', displayFr: 'Centre Hospitalier Régional' },
      { code: 'CS', display: 'Health Center', displayFr: 'Centre de Santé' },
      { code: 'PS', display: 'Health Post', displayFr: 'Poste de Santé' },
      { code: 'UG', display: 'Health Unit', displayFr: 'Unité de Santé' },
      { code: 'CLINIC', display: 'Private Clinic', displayFr: 'Clinique privée' },
    ],
  },
  {
    id: 'guinea-blood-types',
    name: 'Groupes sanguins Guinée',
    url: 'https://healthflow-gn.com/fhir/ValueSet/blood-types',
    status: 'active',
    description: 'Groupes sanguins ABO et Rhésus utilisés en Guinée',
    system: 'http://loinc.org',
    concepts: [
      { code: 'O+', display: 'O Positive', displayFr: 'O Positif' },
      { code: 'O-', display: 'O Negative', displayFr: 'O Négatif' },
      { code: 'A+', display: 'A Positive', displayFr: 'A Positif' },
      { code: 'A-', display: 'A Negative', displayFr: 'A Négatif' },
      { code: 'B+', display: 'B Positive', displayFr: 'B Positif' },
      { code: 'B-', display: 'B Negative', displayFr: 'B Négatif' },
      { code: 'AB+', display: 'AB Positive', displayFr: 'AB Positif' },
      { code: 'AB-', display: 'AB Negative', displayFr: 'AB Négatif' },
    ],
  },
  {
    id: 'guinea-insurance-providers',
    name: 'Assureurs santé Guinée',
    url: 'https://healthflow-gn.com/fhir/ValueSet/insurance-providers',
    status: 'active',
    description: 'Compagnies d\'assurance santé opérant en Guinée',
    system: 'https://healthflow-gn.com/fhir/code-system/insurance-provider',
    concepts: [
      { code: 'SONAR', display: 'SONAR Assurance', displayFr: 'SONAR Assurance' },
      { code: 'CGM', display: 'CGM Guinée', displayFr: 'CGM Guinée' },
      { code: 'SAHAM', display: 'Saham Assurance', displayFr: 'Saham Assurance' },
      { code: 'NSIA', display: 'NSIA Assurance', displayFr: 'NSIA Assurance' },
    ],
  },
  {
    id: 'guinea-mobile-money',
    name: 'Services Mobile Money Guinée',
    url: 'https://healthflow-gn.com/fhir/ValueSet/mobile-money',
    status: 'active',
    description: 'Opérateurs Mobile Money en Guinée',
    system: 'https://healthflow-gn.com/fhir/code-system/mobile-money',
    concepts: [
      { code: 'ORANGE', display: 'Orange Money', displayFr: 'Orange Money' },
      { code: 'MTN', display: 'MTN Mobile Money', displayFr: 'MTN Mobile Money' },
    ],
  },
]

/* ─────────── Terminology Search Service ─────────── */

class TerminologyService {
  search(systemId: string, query: string, limit: number = 20): ConceptDefinition[] {
    const q = query.toLowerCase()
    let source: ConceptDefinition[] = []

    switch (systemId) {
      case 'icd10':
      case 'guinea-diseases':
        source = GUINEA_DISEASES
        break
      case 'loinc':
        source = GUINEA_LOINC_CODES
        break
      case 'atc':
        source = GUINEA_ATC_CODES
        break
      default:
        source = [...GUINEA_DISEASES, ...GUINEA_LOINC_CODES, ...GUINEA_ATC_CODES]
    }

    return source
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.display.toLowerCase().includes(q) ||
          c.displayFr.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q)
      )
      .slice(0, limit)
  }

  getCodeSystem(id: string): CodeSystem | undefined {
    return CODE_SYSTEMS.find((cs) => cs.id === id)
  }

  getValueSet(id: string): ValueSet | undefined {
    return GUINEA_VALUE_SETS.find((vs) => vs.id === id)
  }

  lookup(system: string, code: string): ConceptDefinition | undefined {
    const allConcepts = [...GUINEA_DISEASES, ...GUINEA_LOINC_CODES, ...GUINEA_ATC_CODES]
    return allConcepts.find((c) => c.code === code)
  }

  validateCode(system: string, code: string): { valid: boolean; display?: string; message?: string } {
    const concept = this.lookup(system, code)
    if (concept) return { valid: true, display: concept.displayFr || concept.display }
    return { valid: false, message: `Code '${code}' non trouvé dans le système '${system}'` }
  }

  getSubTree(systemId: string, parentCode: string | null): ConceptDefinition[] {
    switch (systemId) {
      case 'icd10':
      case 'guinea-diseases':
        return GUINEA_DISEASES.filter((c) => c.parent === parentCode)
      case 'loinc':
        return GUINEA_LOINC_CODES.filter((c) => c.parent === parentCode)
      case 'atc':
        return GUINEA_ATC_CODES.filter((c) => c.parent === parentCode)
      default:
        return []
    }
  }
}

export const terminologyService = new TerminologyService()
