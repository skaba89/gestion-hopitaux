import { NextRequest, NextResponse } from 'next/server'
import { extractPrescriptionData } from '@/lib/smart-hospital/prescription-ocr'
import { auditEvent, getRequestAuditContext } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawText = body?.rawText

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json(
        { error: 'Le texte OCR est requis.' },
        { status: 400 },
      )
    }

    const extraction = extractPrescriptionData(rawText)

    await auditEvent({
      ...getRequestAuditContext(request),
      action: 'PRESCRIPTION_OCR_ANALYSIS',
      module: 'smart-hospital',
      entity: 'PrescriptionOCR',
      description: 'Analyse OCR d’une ordonnance médicale',
      severity: 'INFO',
      newValue: {
        medicationCount: extraction.medications.length,
        hasPatientName: Boolean(extraction.patientName),
      },
    })

    return NextResponse.json({
      success: true,
      data: extraction,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur OCR ordonnance.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
