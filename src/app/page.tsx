'use client'

import { useStore, type AppView } from '@/lib/store'
import LandingPage from '@/components/landing/landing-page'
import { AppShell } from '@/components/app/app-shell'
import { DashboardPage } from '@/components/app/modules/dashboard'
import { PatientsPage } from '@/components/app/modules/patients'
import { AppointmentsPage } from '@/components/app/modules/appointments'
import { ConsultationsPage } from '@/components/app/modules/consultations'
import { LaboratoryPage } from '@/components/app/modules/laboratory'
import { PharmacyPage } from '@/components/app/modules/pharmacy'
import { HospitalizationPage } from '@/components/app/modules/hospitalization'
import { EmergenciesPage } from '@/components/app/modules/emergencies'
import { MaternityPage } from '@/components/app/modules/maternity'
import { VaccinationPage } from '@/components/app/modules/vaccination'
import { BillingPage } from '@/components/app/modules/billing'
import { PaymentsPage } from '@/components/app/modules/payments'
import { MessagingPage } from '@/components/app/modules/messaging'
import { InsurancePage } from '@/components/app/modules/insurance-module'
import { TeleconsultationPage } from '@/components/app/modules/teleconsultation'
import { AnalyticsPage } from '@/components/app/modules/analytics'
import { AdministrationPage } from '@/components/app/modules/administration'
import { SettingsPage } from '@/components/app/modules/settings'
import { PatientPortalPage } from '@/components/app/modules/patient-portal'
import { DiagnosticAssistant } from '@/components/ai/diagnostic-assistant'
import { InteractionChecker } from '@/components/ai/interaction-checker'
import { SurveillanceDashboard } from '@/components/ai/surveillance-dashboard'
import { VideoConsultation } from '@/components/telemedicine/video-consultation'
import { VirtualWaitingRoom } from '@/components/telemedicine/virtual-waiting-room'
import { ASCDashboard } from '@/components/asc/asc-dashboard'
import { AuditLogViewer } from '@/components/admin/audit-log-viewer'
import { SecurityDashboard } from '@/components/admin/security-dashboard'
import { PermissionMatrix } from '@/components/admin/permission-matrix'
import { FHIRExplorer } from '@/components/fhir/fhir-explorer'
import { ADTMessageCenter } from '@/components/fhir/adt-message-center'
import { TerminologyBrowser } from '@/components/fhir/terminology-browser'
import { MPIDashboard } from '@/components/fhir/mpi-dashboard'
import { DICOMViewer } from '@/components/fhir/dicom-viewer'
import { CrossBorderExchange } from '@/components/fhir/cross-border-exchange'
import { FHIRSubscriptions } from '@/components/fhir/fhir-subscriptions'
import { IntegrationDashboard } from '@/components/integrations/integration-dashboard'
import { NationalHealthIDPage } from '@/components/fhir/national-health-id-page'
import { DHIS2Connector } from '@/components/fhir/dhis2-connector'
import { FacilitiesManagement } from '@/components/deployment/facilities-management'
import { NationalSupervision } from '@/components/deployment/national-supervision'
import { NationalStatistics } from '@/components/deployment/national-statistics'
import { I18nProvider } from '@/i18n/provider'
import { QueryProvider } from '@/lib/query-provider'
import { PWARegistrar } from '@/components/app/pwa-registrar'
import { demoVideoSessions } from '@/lib/telemedicine'

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
