import { ExecutiveDashboardPremium } from '@/components/executive/executive-dashboard-premium'

export const dynamic = 'force-dynamic'

export default function ExecutiveDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <ExecutiveDashboardPremium />
    </main>
  )
}
