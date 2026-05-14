// ============================================================================
// HealthFlow Guinea - Validation Schemas Barrel Export
// Central export point for all validation schemas
// ============================================================================

// ---- Common shared schemas ----
export {
  guineaPhone,
  optionalGuineaPhone,
  paginationSchema,
  paginationWithOffsetSchema,
  idParamSchema,
  dateRangeSchema,
  sortSchema,
  searchSchema,
  establishmentFilterSchema,
  severitySchema,
  actionSchema,
  statusSchema,
  timeStringSchema,
  gnfPriceSchema,
  optionalGnfPriceSchema,
  positiveIntSchema,
  idRefSchema,
  listQuerySchema,
  dateTransform,
  optionalDateTransform,
  emailSchema,
  optionalEmailSchema,
} from './common'

// ---- Patient (existing) ----
export {
  patientRegistrationSchema,
  patientAccountRegistrationSchema,
  patientAccountLoginSchema,
  patientAccountVerifySchema,
  patientUpdateSchema,
  notificationPrefsSchema,
} from './patient'

// ---- Appointment (existing) ----
export {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  doctorSlotsQuerySchema,
} from './appointment'

// ---- Consultation ----
export {
  consultationCreateSchema,
  consultationUpdateSchema,
  prescriptionCreateSchema,
  prescriptionUpdateSchema,
  prescriptionItemSchema,
  prescriptionWithItemsCreateSchema,
  consultationReportCreateSchema,
  consultationReportUpdateSchema,
} from './consultation'

// ---- Laboratory ----
export {
  labRequestCreateSchema,
  labRequestUpdateSchema,
  labRequestItemSchema,
  labResultCreateSchema,
  labResultUpdateSchema,
  labResultValidateSchema,
  labTestCatalogCreateSchema,
  labTestCatalogUpdateSchema,
} from './laboratory'

// ---- Pharmacy ----
export {
  medicationCreateSchema,
  medicationUpdateSchema,
  stockEntryItemSchema,
  stockEntryCreateSchema,
  stockExitItemSchema,
  stockExitCreateSchema,
  medicationStockUpdateSchema,
} from './pharmacy'

// ---- Hospitalization ----
export {
  admissionCreateSchema,
  admissionUpdateSchema,
  hospitalizationTrackingCreateSchema,
  emergencyCaseCreateSchema,
  emergencyCaseUpdateSchema,
  triageAssessmentCreateSchema,
} from './hospitalization'

// ---- Maternity ----
export {
  pregnancyTrackingCreateSchema,
  pregnancyTrackingUpdateSchema,
  pregnancyVisitCreateSchema,
  deliveryCreateSchema,
} from './maternity'

// ---- Vaccination ----
export {
  vaccinationScheduleCreateSchema,
  vaccinationScheduleUpdateSchema,
  vaccinationCreateSchema,
  vaccinationUpdateSchema,
} from './vaccination'

// ---- Billing ----
export {
  insuranceCompanyCreateSchema,
  insuranceCompanyUpdateSchema,
  patientInsuranceCreateSchema,
  patientInsuranceUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceItemCreateSchema,
  paymentCreateSchema,
  paymentUpdateSchema,
} from './billing'

// ---- Auth ----
export {
  otpSendSchema,
  otpVerifySchema,
  csrfTokenSchema,
  loginSchema,
  patientLoginSchema,
  mfaSetupSchema,
  mfaVerifySchema,
  mfaBackupCodeSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  authUserCreateSchema,
  authUserUpdateSchema,
} from './auth'

// ---- User ----
export {
  userCreateSchema,
  userUpdateSchema,
  passwordChangeSchema,
  roleAssignmentSchema,
  roleRemovalSchema,
  userProfileUpdateSchema,
} from './user'

// ---- Establishment ----
export {
  establishmentCreateSchema,
  establishmentUpdateSchema,
  departmentCreateSchema,
  roomCreateSchema,
  bedCreateSchema,
  bedUpdateSchema,
} from './establishment'

// ---- Telemedicine ----
export {
  teleconsultationCreateSchema,
  teleconsultationUpdateSchema,
  secureMessageCreateSchema,
  sharedDocumentCreateSchema,
} from './telemedicine'

// ---- Health ----
export {
  epidemiologicalAlertCreateSchema,
  epidemiologicalAlertUpdateSchema,
  healthAnomalyCreateSchema,
  healthReportCreateSchema,
  healthReportUpdateSchema,
  diseaseSurveillanceCreateSchema,
} from './health'
