-- CreateTable
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Guinea',
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "headDoctorId" TEXT,
    "floor" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT NOT NULL,
    "floor" TEXT,
    "establishmentId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "establishmentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "currentAdmissionId" TEXT,
    "lastSanitizedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "professionalId" TEXT,
    "specialization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastPasswordChangeAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaBackupCodes" TEXT,
    "mfaMethod" TEXT,
    "mfaVerifiedAt" TIMESTAMP(3),
    "mfaPhoneNumber" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "grantedById" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEstablishment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEstablishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "establishmentId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationalId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Guinea',
    "bloodType" TEXT,
    "rhFactor" TEXT,
    "maritalStatus" TEXT,
    "occupation" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "primaryLanguage" TEXT NOT NULL DEFAULT 'French',
    "profilePhotoUrl" TEXT,
    "notes" TEXT,
    "establishmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAllergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reaction" TEXT,
    "diagnosedAt" TIMESTAMP(3),
    "diagnosedBy" TEXT,
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAllergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAntecedent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT NOT NULL,
    "diagnosedDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "isChronic" BOOLEAN NOT NULL DEFAULT false,
    "isHereditary" BOOLEAN NOT NULL DEFAULT false,
    "treatingDoctor" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAntecedent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "description" TEXT,
    "documentDate" TIMESTAMP(3),
    "uploadedById" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorAgenda" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxAppointments" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "duration" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'CONSULTATION',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "cancellationReason" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "reminderType" TEXT,
    "consultationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "consultationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaint" TEXT NOT NULL,
    "historyOfPresentIllness" TEXT,
    "physicalExamination" TEXT,
    "diagnosis" TEXT,
    "differentialDiagnosis" TEXT,
    "treatmentPlan" TEXT,
    "followUpInstructions" TEXT,
    "notes" TEXT,
    "vitals" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "medicationId" TEXT,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "route" TEXT,
    "quantity" INTEGER,
    "instructions" TEXT,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "isDispensed" BOOLEAN NOT NULL DEFAULT false,
    "dispensedAt" TIMESTAMP(3),
    "dispensedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationReport" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    "signedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specimenType" TEXT NOT NULL,
    "normalRangeMin" DOUBLE PRECISION,
    "normalRangeMax" DOUBLE PRECISION,
    "unit" TEXT,
    "turnaroundHours" INTEGER,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "requestingDoctorId" TEXT NOT NULL,
    "consultationId" TEXT,
    "establishmentId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "clinicalInfo" TEXT,
    "notes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleCollectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabRequestItem" (
    "id" TEXT NOT NULL,
    "labRequestId" TEXT NOT NULL,
    "testCatalogId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "labRequestId" TEXT NOT NULL,
    "testCatalogId" TEXT NOT NULL,
    "resultValue" TEXT,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT,
    "isAbnormal" BOOLEAN NOT NULL DEFAULT false,
    "abnormalFlag" TEXT,
    "referenceRange" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3),
    "isSignedOff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResultHistory" (
    "id" TEXT NOT NULL,
    "labResultId" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "changedField" TEXT,
    "changedById" TEXT,
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResultHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "code" TEXT NOT NULL,
    "barcode" TEXT,
    "category" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "strength" TEXT,
    "manufacturer" TEXT,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT true,
    "controlledSubstance" BOOLEAN NOT NULL DEFAULT false,
    "minimumStockLevel" INTEGER,
    "unitPrice" DOUBLE PRECISION,
    "sellingPrice" DOUBLE PRECISION,
    "storageConditions" TEXT,
    "sideEffects" TEXT,
    "contraindications" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationStock" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "currentQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "location" TEXT,
    "lastCountedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntry" (
    "id" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION,
    "receivedById" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEntryItem" (
    "id" TEXT NOT NULL,
    "stockEntryId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "expiryDate" TIMESTAMP(3),
    "manufacturingDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockEntryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockExit" (
    "id" TEXT NOT NULL,
    "exitNumber" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "exitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "recipientType" TEXT,
    "recipientId" TEXT,
    "recipientName" TEXT,
    "authorizedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockExit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockExitItem" (
    "id" TEXT NOT NULL,
    "stockExitId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockExitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortageAlert" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "currentStock" INTEGER NOT NULL,
    "minimumLevel" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL DEFAULT 'LOW_STOCK',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedById" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortageAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpirationTracking" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantityAtExpiry" INTEGER,
    "daysUntilExpiry" INTEGER NOT NULL,
    "alertLevel" TEXT NOT NULL DEFAULT 'WARNING',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "disposedAt" TIMESTAMP(3),
    "disposedById" TEXT,
    "disposalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpirationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "bedId" TEXT,
    "departmentId" TEXT,
    "attendingDoctorId" TEXT,
    "admittingDoctorId" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDischargeDate" TIMESTAMP(3),
    "actualDischargeDate" TIMESTAMP(3),
    "admissionType" TEXT NOT NULL DEFAULT 'PLANNED',
    "admissionReason" TEXT NOT NULL,
    "diagnosisAtAdmission" TEXT,
    "diagnosisAtDischarge" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ADMITTED',
    "dischargeSummary" TEXT,
    "dischargeInstructions" TEXT,
    "dischargeCondition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalizationTracking" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "trackingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recordedById" TEXT,
    "vitals" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HospitalizationTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "attendingDoctorId" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivalMode" TEXT,
    "chiefComplaint" TEXT NOT NULL,
    "triageLevel" TEXT NOT NULL,
    "triageScore" INTEGER,
    "vitalSigns" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TRIAGE',
    "diagnosis" TEXT,
    "treatmentProvided" TEXT,
    "disposition" TEXT,
    "dischargeDate" TIMESTAMP(3),
    "bedAssignedId" TEXT,
    "admissionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriageAssessment" (
    "id" TEXT NOT NULL,
    "emergencyCaseId" TEXT NOT NULL,
    "assessedById" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaint" TEXT NOT NULL,
    "painLevel" INTEGER,
    "consciousness" TEXT,
    "temperature" DOUBLE PRECISION,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "heartRate" INTEGER,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "triageLevel" TEXT NOT NULL,
    "triageNotes" TEXT,
    "allergiesNoted" TEXT,
    "medicationsNoted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TriageAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyTracking" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expectedDueDate" TIMESTAMP(3) NOT NULL,
    "actualDueDate" TIMESTAMP(3),
    "gravida" INTEGER NOT NULL DEFAULT 1,
    "para" INTEGER NOT NULL DEFAULT 0,
    "miscarriages" INTEGER NOT NULL DEFAULT 0,
    "livingChildren" INTEGER NOT NULL DEFAULT 0,
    "bloodType" TEXT,
    "rhFactor" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "riskFactors" TEXT,
    "attendingDoctorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyVisit" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitType" TEXT NOT NULL DEFAULT 'ROUTINE',
    "gestationalAge" INTEGER,
    "weight" DOUBLE PRECISION,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "fundalHeight" DOUBLE PRECISION,
    "fetalHeartRate" INTEGER,
    "fetalMovement" TEXT,
    "edema" TEXT,
    "urineProtein" TEXT,
    "urineGlucose" TEXT,
    "hemoglobinLevel" DOUBLE PRECISION,
    "bloodGlucose" DOUBLE PRECISION,
    "ultrasoundFindings" TEXT,
    "notes" TEXT,
    "nextVisitDate" TIMESTAMP(3),
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "pregnancyId" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "deliveryPlace" TEXT,
    "complications" TEXT,
    "anesthesiaType" TEXT,
    "attendedById" TEXT,
    "establishmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "birthWeight" DOUBLE PRECISION,
    "birthLength" DOUBLE PRECISION,
    "headCircumference" DOUBLE PRECISION,
    "apgarScore1min" INTEGER,
    "apgarScore5min" INTEGER,
    "apgarScore10min" INTEGER,
    "bloodType" TEXT,
    "rhFactor" TEXT,
    "congenitalAnomalies" TEXT,
    "birthComplications" TEXT,
    "isBreastfeeding" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ALIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "recommendedAgeMinDays" INTEGER NOT NULL,
    "recommendedAgeMaxDays" INTEGER NOT NULL,
    "numberOfDoses" INTEGER NOT NULL DEFAULT 1,
    "intervalDays" INTEGER,
    "route" TEXT,
    "targetDisease" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT NOT NULL DEFAULT 'Guinea',
    "description" TEXT,
    "sideEffects" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "doseNumber" INTEGER NOT NULL DEFAULT 1,
    "vaccinationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administeredById" TEXT,
    "establishmentId" TEXT,
    "batchNumber" TEXT,
    "lotNumber" TEXT,
    "site" TEXT,
    "reaction" TEXT,
    "notes" TEXT,
    "nextDoseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationReminder" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "reminderType" TEXT NOT NULL DEFAULT 'SMS',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "parentPhone" TEXT,
    "parentEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "establishmentId" TEXT,
    "coveragePercentage" DOUBLE PRECISION,
    "contactPerson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientInsurance" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "coveragePercentage" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "admissionId" TEXT,
    "consultationId" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCoverageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patientResponsibility" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "insuranceId" TEXT,
    "notes" TEXT,
    "issuedById" TEXT,
    "issuedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "mobileMoneyProvider" TEXT,
    "mobileMoneyTransactionId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'GNF',
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "receiptPdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teleconsultation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'VIDEO',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "recordingUrl" TEXT,
    "chiefComplaint" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "technicalIssues" TEXT,
    "patientRating" INTEGER,
    "patientFeedback" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teleconsultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecureMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "patientId" TEXT,
    "teleconsultationId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "parentMessageId" TEXT,
    "deletedBySender" BOOLEAN NOT NULL DEFAULT false,
    "deletedByRecipient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecureMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedDocument" (
    "id" TEXT NOT NULL,
    "teleconsultationId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "patientId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'PARTICIPANTS',
    "downloadedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT,
    "filters" TEXT,
    "establishmentId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" TEXT,
    "dataSource" TEXT,
    "refreshInterval" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthKPI" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "previousValue" DOUBLE PRECISION,
    "targetValue" DOUBLE PRECISION,
    "notes" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpidemiologicalAlert" (
    "id" TEXT NOT NULL,
    "alertCode" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "diseaseCode" TEXT,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MODERATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "establishmentId" TEXT,
    "region" TEXT,
    "affectedCount" INTEGER NOT NULL DEFAULT 0,
    "suspectedCount" INTEGER NOT NULL DEFAULT 0,
    "confirmedCount" INTEGER NOT NULL DEFAULT 0,
    "deceasedCount" INTEGER NOT NULL DEFAULT 0,
    "recoveredCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "source" TEXT,
    "geographicArea" TEXT,
    "measuresTaken" TEXT,
    "reportedById" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "whoNotified" BOOLEAN NOT NULL DEFAULT false,
    "whoNotifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpidemiologicalAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthAnomaly" (
    "id" TEXT NOT NULL,
    "alertId" TEXT,
    "anomalyType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detectedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPoints" TEXT,
    "threshold" DOUBLE PRECISION,
    "observedValue" DOUBLE PRECISION,
    "deviation" DOUBLE PRECISION,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "establishmentId" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthAnomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "establishmentId" TEXT,
    "region" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT,
    "fileUrl" TEXT,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "nextScheduledAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthReportItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "category" TEXT,
    "indicator" TEXT NOT NULL,
    "value" TEXT,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT,
    "previousValue" TEXT,
    "targetValue" TEXT,
    "trend" TEXT,
    "commentary" TEXT,
    "dataSources" TEXT,
    "chartConfig" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSurveillance" (
    "id" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "diseaseCode" TEXT,
    "isNotifiable" BOOLEAN NOT NULL DEFAULT false,
    "surveillanceType" TEXT NOT NULL,
    "establishmentId" TEXT,
    "region" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newCases" INTEGER NOT NULL DEFAULT 0,
    "totalCases" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "recoveries" INTEGER NOT NULL DEFAULT 0,
    "hospitalized" INTEGER NOT NULL DEFAULT 0,
    "icuCases" INTEGER NOT NULL DEFAULT 0,
    "ageGroup" TEXT,
    "gender" TEXT,
    "dataSources" TEXT,
    "notes" TEXT,
    "reportedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseSurveillance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "sentVia" TEXT NOT NULL DEFAULT 'IN_APP',
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "establishmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientAccount" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "patientId" TEXT,
    "familyAccountId" TEXT,
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "preferredLanguage" TEXT NOT NULL DEFAULT 'fr',
    "notificationPrefs" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyAccount" (
    "id" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "primaryName" TEXT NOT NULL,
    "verificationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarePlan" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "establishmentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "goals" TEXT,
    "interventions" TEXT,
    "milestones" TEXT,
    "responsibleDoctorId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Establishment_code_key" ON "Establishment"("code");

-- CreateIndex
CREATE INDEX "Establishment_type_idx" ON "Establishment"("type");

-- CreateIndex
CREATE INDEX "Establishment_city_idx" ON "Establishment"("city");

-- CreateIndex
CREATE INDEX "Establishment_isActive_idx" ON "Establishment"("isActive");

-- CreateIndex
CREATE INDEX "Department_establishmentId_idx" ON "Department"("establishmentId");

-- CreateIndex
CREATE INDEX "Department_type_idx" ON "Department"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_establishmentId_key" ON "Department"("code", "establishmentId");

-- CreateIndex
CREATE INDEX "Room_departmentId_idx" ON "Room"("departmentId");

-- CreateIndex
CREATE INDEX "Room_type_idx" ON "Room"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_establishmentId_key" ON "Room"("number", "establishmentId");

-- CreateIndex
CREATE INDEX "Bed_roomId_idx" ON "Bed"("roomId");

-- CreateIndex
CREATE INDEX "Bed_status_idx" ON "Bed"("status");

-- CreateIndex
CREATE INDEX "Bed_establishmentId_idx" ON "Bed"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_number_establishmentId_key" ON "Bed"("number", "establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_professionalId_key" ON "User"("professionalId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_professionalId_idx" ON "User"("professionalId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_name_idx" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "Permission"("module");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_establishmentId_idx" ON "UserRole"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_establishmentId_key" ON "UserRole"("userId", "roleId", "establishmentId");

-- CreateIndex
CREATE INDEX "UserEstablishment_userId_idx" ON "UserEstablishment"("userId");

-- CreateIndex
CREATE INDEX "UserEstablishment_establishmentId_idx" ON "UserEstablishment"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEstablishment_userId_establishmentId_key" ON "UserEstablishment"("userId", "establishmentId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_establishmentId_idx" ON "AuditLog"("establishmentId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_qrCode_key" ON "Patient"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nationalId_key" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Patient_dateOfBirth_idx" ON "Patient"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_establishmentId_idx" ON "Patient"("establishmentId");

-- CreateIndex
CREATE INDEX "Patient_nationalId_idx" ON "Patient"("nationalId");

-- CreateIndex
CREATE INDEX "Patient_qrCode_idx" ON "Patient"("qrCode");

-- CreateIndex
CREATE INDEX "Patient_isActive_idx" ON "Patient"("isActive");

-- CreateIndex
CREATE INDEX "PatientAllergy_patientId_idx" ON "PatientAllergy"("patientId");

-- CreateIndex
CREATE INDEX "PatientAllergy_type_idx" ON "PatientAllergy"("type");

-- CreateIndex
CREATE INDEX "PatientAllergy_severity_idx" ON "PatientAllergy"("severity");

-- CreateIndex
CREATE INDEX "PatientAntecedent_patientId_idx" ON "PatientAntecedent"("patientId");

-- CreateIndex
CREATE INDEX "PatientAntecedent_type_idx" ON "PatientAntecedent"("type");

-- CreateIndex
CREATE INDEX "PatientAntecedent_isChronic_idx" ON "PatientAntecedent"("isChronic");

-- CreateIndex
CREATE INDEX "MedicalDocument_patientId_idx" ON "MedicalDocument"("patientId");

-- CreateIndex
CREATE INDEX "MedicalDocument_type_idx" ON "MedicalDocument"("type");

-- CreateIndex
CREATE INDEX "MedicalDocument_documentDate_idx" ON "MedicalDocument"("documentDate");

-- CreateIndex
CREATE INDEX "MedicalDocument_uploadedById_idx" ON "MedicalDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "DoctorAgenda_doctorId_idx" ON "DoctorAgenda"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorAgenda_dayOfWeek_idx" ON "DoctorAgenda"("dayOfWeek");

-- CreateIndex
CREATE INDEX "DoctorAgenda_establishmentId_idx" ON "DoctorAgenda"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAgenda_doctorId_dayOfWeek_startTime_key" ON "DoctorAgenda"("doctorId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_type_idx" ON "Appointment"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_appointmentId_key" ON "Consultation"("appointmentId");

-- CreateIndex
CREATE INDEX "Consultation_patientId_idx" ON "Consultation"("patientId");

-- CreateIndex
CREATE INDEX "Consultation_doctorId_idx" ON "Consultation"("doctorId");

-- CreateIndex
CREATE INDEX "Consultation_consultationDate_idx" ON "Consultation"("consultationDate");

-- CreateIndex
CREATE INDEX "Consultation_status_idx" ON "Consultation"("status");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "Prescription_prescriptionDate_idx" ON "Prescription"("prescriptionDate");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicationId_idx" ON "PrescriptionItem"("medicationId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_isDispensed_idx" ON "PrescriptionItem"("isDispensed");

-- CreateIndex
CREATE INDEX "ConsultationReport_consultationId_idx" ON "ConsultationReport"("consultationId");

-- CreateIndex
CREATE INDEX "ConsultationReport_type_idx" ON "ConsultationReport"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestCatalog_code_key" ON "LabTestCatalog"("code");

-- CreateIndex
CREATE INDEX "LabTestCatalog_category_idx" ON "LabTestCatalog"("category");

-- CreateIndex
CREATE INDEX "LabTestCatalog_specimenType_idx" ON "LabTestCatalog"("specimenType");

-- CreateIndex
CREATE INDEX "LabTestCatalog_isActive_idx" ON "LabTestCatalog"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LabRequest_requestCode_key" ON "LabRequest"("requestCode");

-- CreateIndex
CREATE INDEX "LabRequest_patientId_idx" ON "LabRequest"("patientId");

-- CreateIndex
CREATE INDEX "LabRequest_requestingDoctorId_idx" ON "LabRequest"("requestingDoctorId");

-- CreateIndex
CREATE INDEX "LabRequest_status_idx" ON "LabRequest"("status");

-- CreateIndex
CREATE INDEX "LabRequest_priority_idx" ON "LabRequest"("priority");

-- CreateIndex
CREATE INDEX "LabRequest_requestedAt_idx" ON "LabRequest"("requestedAt");

-- CreateIndex
CREATE INDEX "LabRequestItem_labRequestId_idx" ON "LabRequestItem"("labRequestId");

-- CreateIndex
CREATE INDEX "LabRequestItem_testCatalogId_idx" ON "LabRequestItem"("testCatalogId");

-- CreateIndex
CREATE INDEX "LabRequestItem_status_idx" ON "LabRequestItem"("status");

-- CreateIndex
CREATE INDEX "LabResult_labRequestId_idx" ON "LabResult"("labRequestId");

-- CreateIndex
CREATE INDEX "LabResult_testCatalogId_idx" ON "LabResult"("testCatalogId");

-- CreateIndex
CREATE INDEX "LabResult_isAbnormal_idx" ON "LabResult"("isAbnormal");

-- CreateIndex
CREATE INDEX "LabResult_status_idx" ON "LabResult"("status");

-- CreateIndex
CREATE INDEX "LabResult_validatedById_idx" ON "LabResult"("validatedById");

-- CreateIndex
CREATE INDEX "LabResultHistory_labResultId_idx" ON "LabResultHistory"("labResultId");

-- CreateIndex
CREATE INDEX "LabResultHistory_changedAt_idx" ON "LabResultHistory"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Medication_code_key" ON "Medication"("code");

-- CreateIndex
CREATE INDEX "Medication_name_idx" ON "Medication"("name");

-- CreateIndex
CREATE INDEX "Medication_category_idx" ON "Medication"("category");

-- CreateIndex
CREATE INDEX "Medication_genericName_idx" ON "Medication"("genericName");

-- CreateIndex
CREATE INDEX "Medication_isActive_idx" ON "Medication"("isActive");

-- CreateIndex
CREATE INDEX "MedicationStock_medicationId_idx" ON "MedicationStock"("medicationId");

-- CreateIndex
CREATE INDEX "MedicationStock_establishmentId_idx" ON "MedicationStock"("establishmentId");

-- CreateIndex
CREATE INDEX "MedicationStock_currentQuantity_idx" ON "MedicationStock"("currentQuantity");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationStock_medicationId_establishmentId_batchNumber_key" ON "MedicationStock"("medicationId", "establishmentId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StockEntry_entryNumber_key" ON "StockEntry"("entryNumber");

-- CreateIndex
CREATE INDEX "StockEntry_establishmentId_idx" ON "StockEntry"("establishmentId");

-- CreateIndex
CREATE INDEX "StockEntry_entryDate_idx" ON "StockEntry"("entryDate");

-- CreateIndex
CREATE INDEX "StockEntry_status_idx" ON "StockEntry"("status");

-- CreateIndex
CREATE INDEX "StockEntryItem_stockEntryId_idx" ON "StockEntryItem"("stockEntryId");

-- CreateIndex
CREATE INDEX "StockEntryItem_medicationId_idx" ON "StockEntryItem"("medicationId");

-- CreateIndex
CREATE INDEX "StockEntryItem_expiryDate_idx" ON "StockEntryItem"("expiryDate");

-- CreateIndex
CREATE INDEX "StockEntryItem_batchNumber_idx" ON "StockEntryItem"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StockExit_exitNumber_key" ON "StockExit"("exitNumber");

-- CreateIndex
CREATE INDEX "StockExit_establishmentId_idx" ON "StockExit"("establishmentId");

-- CreateIndex
CREATE INDEX "StockExit_exitDate_idx" ON "StockExit"("exitDate");

-- CreateIndex
CREATE INDEX "StockExit_reason_idx" ON "StockExit"("reason");

-- CreateIndex
CREATE INDEX "StockExitItem_stockExitId_idx" ON "StockExitItem"("stockExitId");

-- CreateIndex
CREATE INDEX "StockExitItem_medicationId_idx" ON "StockExitItem"("medicationId");

-- CreateIndex
CREATE INDEX "ShortageAlert_medicationId_idx" ON "ShortageAlert"("medicationId");

-- CreateIndex
CREATE INDEX "ShortageAlert_status_idx" ON "ShortageAlert"("status");

-- CreateIndex
CREATE INDEX "ShortageAlert_alertType_idx" ON "ShortageAlert"("alertType");

-- CreateIndex
CREATE INDEX "ShortageAlert_createdAt_idx" ON "ShortageAlert"("createdAt");

-- CreateIndex
CREATE INDEX "ExpirationTracking_medicationId_idx" ON "ExpirationTracking"("medicationId");

-- CreateIndex
CREATE INDEX "ExpirationTracking_expiryDate_idx" ON "ExpirationTracking"("expiryDate");

-- CreateIndex
CREATE INDEX "ExpirationTracking_alertLevel_idx" ON "ExpirationTracking"("alertLevel");

-- CreateIndex
CREATE INDEX "ExpirationTracking_status_idx" ON "ExpirationTracking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_admissionNumber_key" ON "Admission"("admissionNumber");

-- CreateIndex
CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");

-- CreateIndex
CREATE INDEX "Admission_bedId_idx" ON "Admission"("bedId");

-- CreateIndex
CREATE INDEX "Admission_status_idx" ON "Admission"("status");

-- CreateIndex
CREATE INDEX "Admission_admissionDate_idx" ON "Admission"("admissionDate");

-- CreateIndex
CREATE INDEX "Admission_departmentId_idx" ON "Admission"("departmentId");

-- CreateIndex
CREATE INDEX "HospitalizationTracking_admissionId_idx" ON "HospitalizationTracking"("admissionId");

-- CreateIndex
CREATE INDEX "HospitalizationTracking_trackingDate_idx" ON "HospitalizationTracking"("trackingDate");

-- CreateIndex
CREATE INDEX "HospitalizationTracking_type_idx" ON "HospitalizationTracking"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCase_caseNumber_key" ON "EmergencyCase"("caseNumber");

-- CreateIndex
CREATE INDEX "EmergencyCase_patientId_idx" ON "EmergencyCase"("patientId");

-- CreateIndex
CREATE INDEX "EmergencyCase_triageLevel_idx" ON "EmergencyCase"("triageLevel");

-- CreateIndex
CREATE INDEX "EmergencyCase_status_idx" ON "EmergencyCase"("status");

-- CreateIndex
CREATE INDEX "EmergencyCase_arrivalDate_idx" ON "EmergencyCase"("arrivalDate");

-- CreateIndex
CREATE INDEX "TriageAssessment_emergencyCaseId_idx" ON "TriageAssessment"("emergencyCaseId");

-- CreateIndex
CREATE INDEX "TriageAssessment_triageLevel_idx" ON "TriageAssessment"("triageLevel");

-- CreateIndex
CREATE INDEX "TriageAssessment_assessmentDate_idx" ON "TriageAssessment"("assessmentDate");

-- CreateIndex
CREATE INDEX "PregnancyTracking_patientId_idx" ON "PregnancyTracking"("patientId");

-- CreateIndex
CREATE INDEX "PregnancyTracking_expectedDueDate_idx" ON "PregnancyTracking"("expectedDueDate");

-- CreateIndex
CREATE INDEX "PregnancyTracking_status_idx" ON "PregnancyTracking"("status");

-- CreateIndex
CREATE INDEX "PregnancyTracking_riskLevel_idx" ON "PregnancyTracking"("riskLevel");

-- CreateIndex
CREATE INDEX "PregnancyVisit_pregnancyId_idx" ON "PregnancyVisit"("pregnancyId");

-- CreateIndex
CREATE INDEX "PregnancyVisit_visitDate_idx" ON "PregnancyVisit"("visitDate");

-- CreateIndex
CREATE INDEX "PregnancyVisit_visitType_idx" ON "PregnancyVisit"("visitType");

-- CreateIndex
CREATE INDEX "Delivery_pregnancyId_idx" ON "Delivery"("pregnancyId");

-- CreateIndex
CREATE INDEX "Delivery_deliveryDate_idx" ON "Delivery"("deliveryDate");

-- CreateIndex
CREATE INDEX "Delivery_deliveryType_idx" ON "Delivery"("deliveryType");

-- CreateIndex
CREATE INDEX "Child_patientId_idx" ON "Child"("patientId");

-- CreateIndex
CREATE INDEX "Child_deliveryId_idx" ON "Child"("deliveryId");

-- CreateIndex
CREATE INDEX "Child_motherId_idx" ON "Child"("motherId");

-- CreateIndex
CREATE UNIQUE INDEX "VaccinationSchedule_code_key" ON "VaccinationSchedule"("code");

-- CreateIndex
CREATE INDEX "VaccinationSchedule_name_idx" ON "VaccinationSchedule"("name");

-- CreateIndex
CREATE INDEX "VaccinationSchedule_isActive_idx" ON "VaccinationSchedule"("isActive");

-- CreateIndex
CREATE INDEX "VaccinationSchedule_isMandatory_idx" ON "VaccinationSchedule"("isMandatory");

-- CreateIndex
CREATE INDEX "Vaccination_childId_idx" ON "Vaccination"("childId");

-- CreateIndex
CREATE INDEX "Vaccination_scheduleId_idx" ON "Vaccination"("scheduleId");

-- CreateIndex
CREATE INDEX "Vaccination_vaccinationDate_idx" ON "Vaccination"("vaccinationDate");

-- CreateIndex
CREATE INDEX "Vaccination_status_idx" ON "Vaccination"("status");

-- CreateIndex
CREATE INDEX "VaccinationReminder_childId_idx" ON "VaccinationReminder"("childId");

-- CreateIndex
CREATE INDEX "VaccinationReminder_reminderDate_idx" ON "VaccinationReminder"("reminderDate");

-- CreateIndex
CREATE INDEX "VaccinationReminder_status_idx" ON "VaccinationReminder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_code_key" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE INDEX "InsuranceCompany_name_idx" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE INDEX "InsuranceCompany_isActive_idx" ON "InsuranceCompany"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PatientInsurance_policyNumber_key" ON "PatientInsurance"("policyNumber");

-- CreateIndex
CREATE INDEX "PatientInsurance_patientId_idx" ON "PatientInsurance"("patientId");

-- CreateIndex
CREATE INDEX "PatientInsurance_companyId_idx" ON "PatientInsurance"("companyId");

-- CreateIndex
CREATE INDEX "PatientInsurance_policyNumber_idx" ON "PatientInsurance"("policyNumber");

-- CreateIndex
CREATE INDEX "PatientInsurance_isActive_idx" ON "PatientInsurance"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");

-- CreateIndex
CREATE INDEX "Invoice_establishmentId_idx" ON "Invoice"("establishmentId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_category_idx" ON "InvoiceItem"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_paymentMethod_idx" ON "Payment"("paymentMethod");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Teleconsultation_patientId_idx" ON "Teleconsultation"("patientId");

-- CreateIndex
CREATE INDEX "Teleconsultation_doctorId_idx" ON "Teleconsultation"("doctorId");

-- CreateIndex
CREATE INDEX "Teleconsultation_scheduledAt_idx" ON "Teleconsultation"("scheduledAt");

-- CreateIndex
CREATE INDEX "Teleconsultation_status_idx" ON "Teleconsultation"("status");

-- CreateIndex
CREATE INDEX "SecureMessage_senderId_idx" ON "SecureMessage"("senderId");

-- CreateIndex
CREATE INDEX "SecureMessage_recipientId_idx" ON "SecureMessage"("recipientId");

-- CreateIndex
CREATE INDEX "SecureMessage_patientId_idx" ON "SecureMessage"("patientId");

-- CreateIndex
CREATE INDEX "SecureMessage_createdAt_idx" ON "SecureMessage"("createdAt");

-- CreateIndex
CREATE INDEX "SecureMessage_isRead_idx" ON "SecureMessage"("isRead");

-- CreateIndex
CREATE INDEX "SharedDocument_teleconsultationId_idx" ON "SharedDocument"("teleconsultationId");

-- CreateIndex
CREATE INDEX "SharedDocument_uploadedById_idx" ON "SharedDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "SharedDocument_patientId_idx" ON "SharedDocument"("patientId");

-- CreateIndex
CREATE INDEX "CustomDashboard_userId_idx" ON "CustomDashboard"("userId");

-- CreateIndex
CREATE INDEX "CustomDashboard_establishmentId_idx" ON "CustomDashboard"("establishmentId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- CreateIndex
CREATE INDEX "DashboardWidget_type_idx" ON "DashboardWidget"("type");

-- CreateIndex
CREATE INDEX "HealthKPI_establishmentId_idx" ON "HealthKPI"("establishmentId");

-- CreateIndex
CREATE INDEX "HealthKPI_metricName_idx" ON "HealthKPI"("metricName");

-- CreateIndex
CREATE INDEX "HealthKPI_category_idx" ON "HealthKPI"("category");

-- CreateIndex
CREATE INDEX "HealthKPI_periodStart_idx" ON "HealthKPI"("periodStart");

-- CreateIndex
CREATE INDEX "HealthKPI_period_idx" ON "HealthKPI"("period");

-- CreateIndex
CREATE UNIQUE INDEX "HealthKPI_establishmentId_metricName_period_periodStart_key" ON "HealthKPI"("establishmentId", "metricName", "period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "EpidemiologicalAlert_alertCode_key" ON "EpidemiologicalAlert"("alertCode");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_diseaseName_idx" ON "EpidemiologicalAlert"("diseaseName");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_alertType_idx" ON "EpidemiologicalAlert"("alertType");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_severity_idx" ON "EpidemiologicalAlert"("severity");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_status_idx" ON "EpidemiologicalAlert"("status");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_startDate_idx" ON "EpidemiologicalAlert"("startDate");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_establishmentId_idx" ON "EpidemiologicalAlert"("establishmentId");

-- CreateIndex
CREATE INDEX "EpidemiologicalAlert_region_idx" ON "EpidemiologicalAlert"("region");

-- CreateIndex
CREATE INDEX "HealthAnomaly_alertId_idx" ON "HealthAnomaly"("alertId");

-- CreateIndex
CREATE INDEX "HealthAnomaly_anomalyType_idx" ON "HealthAnomaly"("anomalyType");

-- CreateIndex
CREATE INDEX "HealthAnomaly_status_idx" ON "HealthAnomaly"("status");

-- CreateIndex
CREATE INDEX "HealthAnomaly_detectedDate_idx" ON "HealthAnomaly"("detectedDate");

-- CreateIndex
CREATE UNIQUE INDEX "HealthReport_reportNumber_key" ON "HealthReport"("reportNumber");

-- CreateIndex
CREATE INDEX "HealthReport_type_idx" ON "HealthReport"("type");

-- CreateIndex
CREATE INDEX "HealthReport_establishmentId_idx" ON "HealthReport"("establishmentId");

-- CreateIndex
CREATE INDEX "HealthReport_periodStart_idx" ON "HealthReport"("periodStart");

-- CreateIndex
CREATE INDEX "HealthReport_status_idx" ON "HealthReport"("status");

-- CreateIndex
CREATE INDEX "HealthReportItem_reportId_idx" ON "HealthReportItem"("reportId");

-- CreateIndex
CREATE INDEX "HealthReportItem_section_idx" ON "HealthReportItem"("section");

-- CreateIndex
CREATE INDEX "HealthReportItem_category_idx" ON "HealthReportItem"("category");

-- CreateIndex
CREATE INDEX "DiseaseSurveillance_diseaseName_idx" ON "DiseaseSurveillance"("diseaseName");

-- CreateIndex
CREATE INDEX "DiseaseSurveillance_isNotifiable_idx" ON "DiseaseSurveillance"("isNotifiable");

-- CreateIndex
CREATE INDEX "DiseaseSurveillance_establishmentId_idx" ON "DiseaseSurveillance"("establishmentId");

-- CreateIndex
CREATE INDEX "DiseaseSurveillance_reportDate_idx" ON "DiseaseSurveillance"("reportDate");

-- CreateIndex
CREATE INDEX "DiseaseSurveillance_region_idx" ON "DiseaseSurveillance"("region");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_category_idx" ON "SystemConfig"("category");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_phone_key" ON "PatientAccount"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_email_key" ON "PatientAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAccount_patientId_key" ON "PatientAccount"("patientId");

-- CreateIndex
CREATE INDEX "PatientAccount_phone_idx" ON "PatientAccount"("phone");

-- CreateIndex
CREATE INDEX "PatientAccount_email_idx" ON "PatientAccount"("email");

-- CreateIndex
CREATE INDEX "PatientAccount_patientId_idx" ON "PatientAccount"("patientId");

-- CreateIndex
CREATE INDEX "PatientAccount_familyAccountId_idx" ON "PatientAccount"("familyAccountId");

-- CreateIndex
CREATE INDEX "PatientAccount_isActive_idx" ON "PatientAccount"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyAccount_primaryPhone_key" ON "FamilyAccount"("primaryPhone");

-- CreateIndex
CREATE INDEX "FamilyAccount_primaryPhone_idx" ON "FamilyAccount"("primaryPhone");

-- CreateIndex
CREATE INDEX "CarePlan_patientId_idx" ON "CarePlan"("patientId");

-- CreateIndex
CREATE INDEX "CarePlan_status_idx" ON "CarePlan"("status");

-- CreateIndex
CREATE INDEX "CarePlan_startDate_idx" ON "CarePlan"("startDate");

-- AddForeignKey
ALTER TABLE "Establishment" ADD CONSTRAINT "Establishment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEstablishment" ADD CONSTRAINT "UserEstablishment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEstablishment" ADD CONSTRAINT "UserEstablishment_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAllergy" ADD CONSTRAINT "PatientAllergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAntecedent" ADD CONSTRAINT "PatientAntecedent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalDocument" ADD CONSTRAINT "MedicalDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAgenda" ADD CONSTRAINT "DoctorAgenda_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationReport" ADD CONSTRAINT "ConsultationReport_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_requestingDoctorId_fkey" FOREIGN KEY ("requestingDoctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequest" ADD CONSTRAINT "LabRequest_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequestItem" ADD CONSTRAINT "LabRequestItem_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES "LabRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabRequestItem" ADD CONSTRAINT "LabRequestItem_testCatalogId_fkey" FOREIGN KEY ("testCatalogId") REFERENCES "LabTestCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES "LabRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_testCatalogId_fkey" FOREIGN KEY ("testCatalogId") REFERENCES "LabTestCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResultHistory" ADD CONSTRAINT "LabResultHistory_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "LabResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationStock" ADD CONSTRAINT "MedicationStock_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationStock" ADD CONSTRAINT "MedicationStock_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntry" ADD CONSTRAINT "StockEntry_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntryItem" ADD CONSTRAINT "StockEntryItem_stockEntryId_fkey" FOREIGN KEY ("stockEntryId") REFERENCES "StockEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockEntryItem" ADD CONSTRAINT "StockEntryItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockExit" ADD CONSTRAINT "StockExit_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockExitItem" ADD CONSTRAINT "StockExitItem_stockExitId_fkey" FOREIGN KEY ("stockExitId") REFERENCES "StockExit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockExitItem" ADD CONSTRAINT "StockExitItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortageAlert" ADD CONSTRAINT "ShortageAlert_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpirationTracking" ADD CONSTRAINT "ExpirationTracking_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalizationTracking" ADD CONSTRAINT "HospitalizationTracking_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyCase" ADD CONSTRAINT "EmergencyCase_attendingDoctorId_fkey" FOREIGN KEY ("attendingDoctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageAssessment" ADD CONSTRAINT "TriageAssessment_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "EmergencyCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageAssessment" ADD CONSTRAINT "TriageAssessment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyTracking" ADD CONSTRAINT "PregnancyTracking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyVisit" ADD CONSTRAINT "PregnancyVisit_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "PregnancyTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "PregnancyTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_attendedById_fkey" FOREIGN KEY ("attendedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "VaccinationSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationReminder" ADD CONSTRAINT "VaccinationReminder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "VaccinationSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCompany" ADD CONSTRAINT "InsuranceCompany_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientInsurance" ADD CONSTRAINT "PatientInsurance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teleconsultation" ADD CONSTRAINT "Teleconsultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teleconsultation" ADD CONSTRAINT "Teleconsultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecureMessage" ADD CONSTRAINT "SecureMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecureMessage" ADD CONSTRAINT "SecureMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_teleconsultationId_fkey" FOREIGN KEY ("teleconsultationId") REFERENCES "Teleconsultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "CustomDashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpidemiologicalAlert" ADD CONSTRAINT "EpidemiologicalAlert_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAnomaly" ADD CONSTRAINT "HealthAnomaly_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "EpidemiologicalAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthReport" ADD CONSTRAINT "HealthReport_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthReportItem" ADD CONSTRAINT "HealthReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "HealthReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAccount" ADD CONSTRAINT "PatientAccount_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAccount" ADD CONSTRAINT "PatientAccount_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarePlan" ADD CONSTRAINT "CarePlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
