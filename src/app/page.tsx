'use client'

import { useStore, type AppView } from '@/lib/store'
import dynamic from 'next/dynamic'
import { AppShell } from '@/components/app/app-shell'
import { I18nProvider } from '@/i18n/provider'
import { QueryProvider } from '@/lib/query-provider'
import { PWARegistrar } from '@/components/app/pwa-registrar'
import { demoVideoSessions } from '@/lib/telemedicine'

// ─── Lazy-loaded view components ─────────────────────────────────
// Using next/dynamic to split each module into its own chunk.
// This prevents the massive monolithic bundle that causes ChunkLoadError
// with Turbopack (40+ eager imports = huge initial bundle with many
// interdependent chunks that all change hash on any code change).

// Core pages — loaded with SSR for initial paint performance
const LandingPage = dynamic(() => import('@/components/landing/landing-page'))
const DashboardPage = dynamic(() => import('@/components/app/modules/dashboard').then(m => ({ default: m.DashboardPage })))

// Clinical modules — lazy loaded on navigation
const PatientsPage = dynamic(() => import('@/components/app/modules/patients').then(m => ({ default: m.PatientsPage })))
const AppointmentsPage = dynamic(() => import('@/components/app/modules/appointments').then(m => ({ default: m.AppointmentsPage })))
const ConsultationsPage = dynamic(() => import('@/components/app/modules/consultations').then(m => ({ default: m.ConsultationsPage })))
const LaboratoryPage = dynamic(() => import('@/components/app/modules/laboratory').then(m => ({ default: m.LaboratoryPage })))
const PharmacyPage = dynamic(() => import('@/components/app/modules/pharmacy').then(m => ({ default: m.PharmacyPage })))
const HospitalizationPage = dynamic(() => import('@/components/app/modules/hospitalization').then(m => ({ default: m.HospitalizationPage })))
const EmergenciesPage = dynamic(() => import('@/components/app/modules/emergencies').then(m => ({ default: m.EmergenciesPage })))
const MaternityPage = dynamic(() => import('@/components/app/modules/maternity').then(m => ({ default: m.MaternityPage })))
const VaccinationPage = dynamic(() => import('@/components/app/modules/vaccination').then(m => ({ default: m.VaccinationPage })))

// Financial & admin modules
const BillingPage = dynamic(() => import('@/components/app/modules/billing').then(m => ({ default: m.BillingPage })))
const PaymentsPage = dynamic(() => import('@/components/app/modules/payments').then(m => ({ default: m.PaymentsPage })))
const MessagingPage = dynamic(() => import('@/components/app/modules/messaging').then(m => ({ default: m.MessagingPage })))
const InsurancePage = dynamic(() => import('@/components/app/modules/insurance-module').then(m => ({ default: m.InsurancePage })))
const TeleconsultationPage = dynamic(() => import('@/components/app/modules/teleconsultation').then(m => ({ default: m.TeleconsultationPage })))
const AnalyticsPage = dynamic(() => import('@/components/app/modules/analytics').then(m => ({ default: m.AnalyticsPage })))
const AdministrationPage = dynamic(() => import('@/components/app/modules/administration').then(m => ({ default: m.AdministrationPage })))
const SettingsPage = dynamic(() => import('@/components/app/modules/settings').then(m => ({ default: m.SettingsPage })))
const PatientPortalPage = dynamic(() => import('@/components/app/modules/patient-portal').then(m => ({ default: m.PatientPortalPage })))

// AI modules
const DiagnosticAssistant = dynamic(() => import('@/components/ai/diagnostic-assistant').then(m => ({ default: m.DiagnosticAssistant })))
const InteractionChecker = dynamic(() => import('@/components/ai/interaction-checker').then(m => ({ default: m.InteractionChecker })))
const SurveillanceDashboard = dynamic(() => import('@/components/ai/surveillance-dashboard').then(m => ({ default: m.SurveillanceDashboard })))

// Telemedicine modules
const VideoConsultation = dynamic(() => import('@/components/telemedicine/video-consultation').then(m => ({ default: m.VideoConsultation })))
const VirtualWaitingRoom = dynamic(() => import('@/components/telemedicine/virtual-waiting-room').then(m => ({ default: m.VirtualWaitingRoom })))

// ASC & Admin
const ASCDashboard = dynamic(() => import('@/components/asc/asc-dashboard').then(m => ({ default: m.ASCDashboard })))
const AuditLogViewer = dynamic(() => import('@/components/admin/audit-log-viewer').then(m => ({ default: m.AuditLogViewer })))
const SecurityDashboard = dynamic(() => import('@/components/admin/security-dashboard').then(m => ({ default: m.SecurityDashboard })))
const PermissionMatrix = dynamic(() => import('@/components/admin/permission-matrix').then(m => ({ default: m.PermissionMatrix })))

// FHIR / Interoperability
const FHIRExplorer = dynamic(() => import('@/components/fhir/fhir-explorer').then(m => ({ default: m.FHIRExplorer })))
const ADTMessageCenter = dynamic(() => import('@/components/fhir/adt-message-center').then(m => ({ default: m.ADTMessageCenter })))
const TerminologyBrowser = dynamic(() => import('@/components/fhir/terminology-browser').then(m => ({ default: m.TerminologyBrowser })))
const MPIDashboard = dynamic(() => import('@/components/fhir/mpi-dashboard').then(m => ({ default: m.MPIDashboard })))
const DICOMViewer = dynamic(() => import('@/components/fhir/dicom-viewer').then(m => ({ default: m.DICOMViewer })))
const CrossBorderExchange = dynamic(() => import('@/components/fhir/cross-border-exchange').then(m => ({ default: m.CrossBorderExchange })))
const FHIRSubscriptions = dynamic(() => import('@/components/fhir/fhir-subscriptions').then(m => ({ default: m.FHIRSubscriptions })))
const NationalHealthIDPage = dynamic(() => import('@/components/fhir/national-health-id-page').then(m => ({ default: m.NationalHealthIDPage })))
const DHIS2Connector = dynamic(() => import('@/components/fhir/dhis2-connector').then(m => ({ default: m.DHIS2Connector })))

// Integration & Deployment
const IntegrationDashboard = dynamic(() => import('@/components/integrations/integration-dashboard').then(m => ({ default: m.IntegrationDashboard })))
const FacilitiesManagement = dynamic(() => import('@/components/deployment/facilities-management').then(m => ({ default: m.FacilitiesManagement })))
const NationalSupervision = dynamic(() => import('@/components/deployment/national-supervision').then(m => ({ default: m.NationalSupervision })))
const NationalStatistics = dynamic(() => import('@/components/deployment/national-statistics').then(m => ({ default: m.NationalStatistics })))
const MultiHospitalDashboard = dynamic(() => import('@/components/hospital/multi-hospital-dashboard').then(m => ({ default: m.MultiHospitalDashboard })))
const AdaptiveDashboard = dynamic(() => import('@/components/app/modules/adaptive-dashboard').then(m => ({ default: m.AdaptiveDashboard })))

// Loading fallback for lazy components
function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    </div>
  )
}

const viewComponents: Record<AppView, React.ComponentType> = {
  landing: LandingPage,
  dashboard: DashboardPage,
  patients: PatientsPage,
  appointments: AppointmentsPage,
  consultations: ConsultationsPage,
  laboratory: LaboratoryPage,
  pharmacy: PharmacyPage,
  hospitalization: HospitalizationPage,
  emergencies: EmergenciesPage,
  maternity: MaternityPage,
  vaccination: VaccinationPage,
  billing: BillingPage,
  payments: PaymentsPage,
  messaging: MessagingPage,
  insurance: InsurancePage,
  teleconsultation: TeleconsultationPage,
  analytics: AnalyticsPage,
  administration: AdministrationPage,
  settings: SettingsPage,
  'patient-portal': PatientPortalPage,
  'ai-diagnostic': DiagnosticAssistant,
  'ai-interactions': InteractionChecker,
  'ai-surveillance': SurveillanceDashboard,
  'video-consultation': VideoConsultation,
  'virtual-waiting-room': () => <VirtualWaitingRoom session={demoVideoSessions[0]} onStartCall={() => {}} />,
  'asc-dashboard': ASCDashboard,
  'audit-log': AuditLogViewer,
  'security-dashboard': SecurityDashboard,
  'permission-matrix': PermissionMatrix,
  'fhir-explorer': FHIRExplorer,
  'adt-messages': ADTMessageCenter,
  'terminology-browser': TerminologyBrowser,
  'mpi-dashboard': MPIDashboard,
  'dicom-viewer': DICOMViewer,
  'cross-border': CrossBorderExchange,
  'fhir-subscriptions': FHIRSubscriptions,
  'national-health-id': NationalHealthIDPage,
  'integration-dashboard': IntegrationDashboard,
  'dhis2-connector': DHIS2Connector,
  'facilities-management': FacilitiesManagement,
  'national-supervision': NationalSupervision,
  'national-statistics': NationalStatistics,
  'multi-hospital': MultiHospitalDashboard,
  'adaptive-dashboard': AdaptiveDashboard,
}

function AppContent() {
  const { currentView } = useStore()

  if (currentView === 'landing') {
    return <LandingPage />
  }

  const PageComponent = viewComponents[currentView] || DashboardPage

  return (
    <AppShell>
      <PageComponent />
    </AppShell>
  )
}

export default function Home() {
  return (
    <I18nProvider>
      <QueryProvider>
        <PWARegistrar />
        <AppContent />
      </QueryProvider>
    </I18nProvider>
  )
}
