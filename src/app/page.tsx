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
import { TeleconsultationPage } from '@/components/app/modules/teleconsultation'
import { AnalyticsPage } from '@/components/app/modules/analytics'
import { AdministrationPage } from '@/components/app/modules/administration'
import { SettingsPage } from '@/components/app/modules/settings'
import { PatientPortalPage } from '@/components/app/modules/patient-portal'
import { I18nProvider } from '@/i18n/provider'
import { QueryProvider } from '@/lib/query-provider'
import { PWARegistrar } from '@/components/app/pwa-registrar'

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
  teleconsultation: TeleconsultationPage,
  analytics: AnalyticsPage,
  administration: AdministrationPage,
  settings: SettingsPage,
  'patient-portal': PatientPortalPage,
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
