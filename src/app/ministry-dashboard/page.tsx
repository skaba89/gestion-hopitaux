import { MinistryDashboardPremium } from '@/components/executive/ministry-dashboard-premium'

export const dynamic = 'force-dynamic'

export default function MinistryDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <MinistryDashboardPremium />
    </main>
  )
}
