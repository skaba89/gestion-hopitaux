// Deterministic seed data utility - NO Math.random()
// Uses hash-based approach so same hospital always shows same stats

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

export function seededRandom(seed: string, index: number = 0): number {
  const h = hashString(`${seed}-${index}`)
  return (h % 10000) / 10000
}

export function seededInt(seed: string, min: number, max: number, index: number = 0): number {
  const r = seededRandom(seed, index)
  return Math.floor(r * (max - min + 1)) + min
}

export function seededFloat(seed: string, min: number, max: number, index: number = 0): number {
  const r = seededRandom(seed, index)
  return parseFloat((min + r * (max - min)).toFixed(1))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(n) + ' GNF'
}

export function formatPercent(n: number): string {
  return `${n}%`
}

// Generate deterministic weekly data for a hospital/service
export function generateWeeklyData(seed: string, baseValue: number, variance: number = 0.2) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  return days.map((day, i) => ({
    day,
    cetteSemaine: Math.round(baseValue * (1 + seededFloat(seed, -variance, variance, i))),
    semaineDerniere: Math.round(baseValue * (1 + seededFloat(seed, -variance, variance, i + 7)) * 0.85),
  }))
}

// Generate deterministic monthly data
export function generateMonthlyData(seed: string, baseValue: number, variance: number = 0.15) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return months.map((month, i) => ({
    mois: month,
    valeur: Math.round(baseValue * (1 + seededFloat(seed, -variance, variance, i + 20))),
  }))
}

// National pathologies data (deterministic)
export const NATIONAL_PATHOLOGIES = [
  { name: 'Paludisme', cases: 12450, trend: 8.2, color: '#dc2626' },
  { name: 'Infections respiratoires', cases: 8320, trend: -3.1, color: '#f59e0b' },
  { name: 'Maladies diarrhéiques', cases: 6780, trend: 2.5, color: '#0d9488' },
  { name: 'Hypertension', cases: 5450, trend: 12.4, color: '#7c3aed' },
  { name: 'Diabète', cases: 4120, trend: 15.7, color: '#ea580c' },
  { name: 'VIH/SIDA', cases: 3890, trend: -1.2, color: '#db2777' },
  { name: 'Tuberculose', cases: 2780, trend: -4.5, color: '#059669' },
  { name: 'Hépatite B', cases: 2150, trend: 6.3, color: '#2563eb' },
]

// Disease alerts data
export const DISEASE_ALERTS = [
  { id: 'ALR-001', disease: 'Choléra', region: 'Conakry' as const, status: 'Actif', cases: 45, deaths: 2, whoNotified: true, date: '2024-11-15' },
  { id: 'ALR-002', disease: 'Fièvre de Lassa', region: 'Nzérékoré' as const, status: 'Surveillance', cases: 12, deaths: 1, whoNotified: true, date: '2024-12-01' },
  { id: 'ALR-003', disease: 'Dengue', region: 'Kindia' as const, status: 'Confirmé', cases: 28, deaths: 0, whoNotified: false, date: '2024-12-10' },
  { id: 'ALR-004', disease: 'Méningite', region: 'Kankan' as const, status: 'Surveillance', cases: 18, deaths: 3, whoNotified: true, date: '2025-01-05' },
  { id: 'ALR-005', disease: 'Rougeole', region: 'Labé' as const, status: 'Actif', cases: 67, deaths: 1, whoNotified: true, date: '2025-01-12' },
]

// Critical medications for stock alerts
export const CRITICAL_MEDICATIONS = [
  { name: 'Arteméther/Luméfantrine', stock: 120, max: 800, unit: 'comprimés', severity: 'critique' as const },
  { name: 'Paracétamol 500mg', stock: 340, max: 2000, unit: 'comprimés', severity: 'faible' as const },
  { name: 'Amoxicilline 500mg', stock: 85, max: 600, unit: 'gélules', severity: 'critique' as const },
  { name: 'Oxytocine', stock: 15, max: 100, unit: 'ampoules', severity: 'critique' as const },
  { name: 'Sérum physiologique', stock: 45, max: 200, unit: 'flacons', severity: 'faible' as const },
  { name: 'Metformine 850mg', stock: 230, max: 500, unit: 'comprimés', severity: 'attention' as const },
]
