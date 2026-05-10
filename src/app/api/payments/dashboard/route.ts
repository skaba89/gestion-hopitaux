import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real app, aggregate from database
    // For demo, return calculated stats based on demo data

    const now = new Date()
    const thisMonth = now.toISOString().slice(0, 7)

    // Simulated aggregated data
    const stats = {
      revenue: {
        today: 125000,
        thisWeek: 680000,
        thisMonth: 2450000,
        lastMonth: 2100000,
      },
      paymentMethods: {
        mobileMoney: 45,
        cash: 35,
        insurance: 20,
      },
      mobileMoneySplit: {
        orangeMoney: 62,
        mtnMomo: 38,
      },
      outstanding: {
        total: 490000,
        count: 3,
      },
      revenueByService: {
        consultations: 380000,
        laboratory: 150000,
        pharmacy: 220000,
        hospitalization: 950000,
        emergency: 350000,
        maternity: 180000,
      },
      topDebtors: [
        { patientId: 'P-2024-010', patientName: 'Ousmane Camara', amount: 450000 },
        { patientId: 'P-2024-003', patientName: 'Fatoumata Camara', amount: 25000 },
        { patientId: 'P-2024-001', patientName: 'Aminata Diallo', amount: 40000 },
      ],
      dailyRevenue: [
        { date: '2026-05-04', amount: 180000 },
        { date: '2026-05-05', amount: 220000 },
        { date: '2026-05-06', amount: 195000 },
        { date: '2026-05-07', amount: 310000 },
        { date: '2026-05-08', amount: 275000 },
        { date: '2026-05-09', amount: 340000 },
        { date: '2026-05-10', amount: 290000 },
      ],
      monthlyRevenue: [
        { month: '2025-11', amount: 1800000 },
        { month: '2025-12', amount: 2100000 },
        { month: '2026-01', amount: 1950000 },
        { month: '2026-02', amount: 2200000 },
        { month: '2026-03', amount: 2400000 },
        { month: '2026-04', amount: 2100000 },
        { month: '2026-05', amount: 2450000 },
      ],
      cashFlowProjection: {
        nextWeek: 750000,
        nextMonth: 2600000,
      },
      period: thisMonth,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    )
  }
}
