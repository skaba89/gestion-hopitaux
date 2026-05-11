# 🔌 Documentation API — HealthFlow Guinea

> API REST complète pour le Système d'Information Hospitalier HealthFlow Guinea

---

## Table des matières

1. [Informations Générales](#1-informations-générales)
2. [Patients](#2-patients)
3. [Rendez-vous](#3-rendez-vous)
4. [Consultations](#4-consultations)
5. [Laboratoire](#5-laboratoire)
6. [Pharmacie](#6-pharmacie)
7. [Hospitalisations](#7-hospitalisations)
8. [Urgences](#8-urgences)
9. [Maternité](#9-maternité)
10. [Vaccinations](#10-vaccinations)
11. [Facturation](#11-facturation)
12. [Paiements](#12-paiements)
13. [Téléconsultation](#13-téléconsultation)
14. [Dashboard](#14-dashboard)
15. [Alertes Santé](#15-alertes-santé)
16. [Établissements](#16-établissements)
17. [Utilisateurs](#17-utilisateurs)
18. [Rate Limiting](#18-rate-limiting)
19. [Webhooks](#19-webhooks)

---

## 1. Informations Générales

### Base URL

```
Production : https://healthflow.votredomaine.gn/api
Développement : http://localhost:3000/api
```

### Authentification

Toutes les requêtes API (sauf `/api/health`) nécessitent un token JWT Bearer :

```http
Authorization: Bearer <jwt_token>
```

**Obtention du token :**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.gn",
  "password": "votre-mot-de-passe",
  "mfaCode": "123456"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "expiresIn": 3600,
    "user": {
      "id": "clx...",
      "email": "doctor@hospital.gn",
      "firstName": "Mamadou",
      "lastName": "Diallo",
      "role": "DOCTOR"
    }
  }
}
```

### Format de Réponse Standard

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Codes d'Erreur

| Code HTTP | Signification | Description |
|-----------|--------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `400` | Bad Request | Paramètres invalides ou manquants |
| `401` | Unauthorized | Token JWT manquant ou invalide |
| `403` | Forbidden | Permissions insuffisantes |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Conflit (ex: email déjà utilisé) |
| `422` | Unprocessable Entity | Erreur de validation |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |

### Format d'Erreur

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Format d'email invalide"
  }
}
```

### Pagination

Tous les endpoints de liste supportent la pagination :

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `page` | integer | 1 | Numéro de page |
| `limit` | integer | 20 | Éléments par page (max: 100) |

---

## 2. Patients

### GET /api/patients

Liste des patients avec recherche et filtres.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `search` | string | Recherche globale (nom, prénom, téléphone) |
| `firstName` | string | Filtrer par prénom |
| `lastName` | string | Filtrer par nom |
| `phone` | string | Filtrer par téléphone |
| `qrCode` | string | Recherche par QR code |
| `nationalId` | string | Recherche par N° identité nationale |
| `gender` | string | `MALE` \| `FEMALE` \| `OTHER` |
| `bloodType` | string | Groupe sanguin (`A+`, `A-`, `B+`, etc.) |
| `establishmentId` | string | Filtrer par établissement |
| `status` | string | `active` \| `archived` |

**Exemple de requête :**

```http
GET /api/patients?search=Diallo&gender=FEMALE&page=1&limit=10
Authorization: Bearer <token>
```

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1a2b3c4d5",
      "qrCode": "HF-2026-001234",
      "firstName": "Aminata",
      "lastName": "Diallo",
      "dateOfBirth": "1998-03-15T00:00:00.000Z",
      "gender": "FEMALE",
      "phone": "+224 622 00 00 00",
      "email": "aminata.diallo@email.gn",
      "bloodType": "O+",
      "isActive": true,
      "establishment": {
        "id": "clx...",
        "name": "Hôpital Donka",
        "type": "HOSPITAL"
      },
      "_count": {
        "allergies": 2,
        "antecedents": 3,
        "appointments": 8,
        "consultations": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /api/patients

Créer un nouveau patient.

**Corps de la requête :**

```json
{
  "firstName": "Aminata",
  "lastName": "Diallo",
  "dateOfBirth": "1998-03-15",
  "gender": "FEMALE",
  "phone": "+224 622 00 00 00",
  "email": "aminata.diallo@email.gn",
  "address": "Conakry, Dixinn",
  "city": "Conakry",
  "region": "Conakry",
  "nationalId": "GN-1998-12345",
  "bloodType": "O+",
  "rhFactor": "POSITIVE",
  "maritalStatus": "SINGLE",
  "occupation": "Enseignante",
  "emergencyContactName": "Ibrahim Diallo",
  "emergencyContactPhone": "+224 622 11 11 11",
  "emergencyContactRelation": "PERE",
  "establishmentId": "clx_establishment_id"
}
```

**Réponse (201) :**

```json
{
  "success": true,
  "data": {
    "id": "clx_new_patient_id",
    "qrCode": "HF-2026-005678",
    "firstName": "Aminata",
    "lastName": "Diallo",
    "isActive": true,
    "createdAt": "2026-03-04T10:00:00.000Z"
  }
}
```

### GET /api/patients/:id

Détail complet d'un patient avec toutes les données liées.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5",
    "qrCode": "HF-2026-001234",
    "firstName": "Aminata",
    "lastName": "Diallo",
    "dateOfBirth": "1998-03-15T00:00:00.000Z",
    "gender": "FEMALE",
    "phone": "+224 622 00 00 00",
    "bloodType": "O+",
    "address": "Conakry, Dixinn",
    "emergencyContactName": "Ibrahim Diallo",
    "emergencyContactPhone": "+224 622 11 11 11",
    "allergies": [
      {
        "id": "clx...",
        "allergen": "Pénicilline",
        "type": "DRUG",
        "severity": "SEVERE",
        "reaction": "Urticaire, difficulté respiratoire"
      }
    ],
    "antecedents": [
      {
        "id": "clx...",
        "type": "MEDICAL",
        "description": "Paludisme sévère (2023)",
        "isChronic": false
      }
    ],
    "appointments": [...],
    "consultations": [...],
    "labRequests": [...],
    "admissions": [...],
    "emergencyCases": [...],
    "pregnancies": [...],
    "insurances": [...],
    "invoices": [...]
  }
}
```

### PUT /api/patients/:id

Mettre à jour un patient.

**Corps de la requête :**

```json
{
  "phone": "+224 622 22 22 22",
  "address": "Conakry, Kaloum",
  "bloodType": "A+"
}
```

### DELETE /api/patients/:id

Archiver un patient (soft delete).

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5",
    "isActive": false,
    "message": "Patient archivé avec succès"
  }
}
```

---

## 3. Rendez-vous

### GET /api/appointments

Liste des rendez-vous.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `doctorId` | string | Filtrer par médecin |
| `patientId` | string | Filtrer par patient |
| `status` | string | `SCHEDULED` \| `CONFIRMED` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED` \| `NO_SHOW` |
| `type` | string | `CONSULTATION` \| `FOLLOW_UP` \| `EMERGENCY` \| `TELECONSULTATION` \| `CHECKUP` |
| `date` | string | Date spécifique (YYYY-MM-DD) |
| `dateFrom` | string | Date début (YYYY-MM-DD) |
| `dateTo` | string | Date fin (YYYY-MM-DD) |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "appointmentDate": "2026-03-05T09:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "duration": 30,
      "type": "CONSULTATION",
      "status": "CONFIRMED",
      "reason": "Douleur abdominale",
      "patient": {
        "id": "clx...",
        "firstName": "Mamadou",
        "lastName": "Condé",
        "phone": "+224 622 00 00 00"
      },
      "doctor": {
        "id": "clx...",
        "firstName": "Dr. Aissatou",
        "lastName": "Bah",
        "specialization": "Médecine interne"
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/appointments

Créer un rendez-vous.

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "doctorId": "clx_doctor_id",
  "appointmentDate": "2026-03-05",
  "startTime": "09:00",
  "endTime": "09:30",
  "duration": 30,
  "type": "CONSULTATION",
  "reason": "Douleur abdominale",
  "notes": "Patient diabétique"
}
```

---

## 4. Consultations

### GET /api/consultations

Liste des consultations.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `doctorId` | string | Filtrer par médecin |
| `status` | string | `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED` |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "consultationDate": "2026-03-04T10:30:00.000Z",
      "chiefComplaint": "Céphalées persistantes",
      "diagnosis": "Hypertension artérielle",
      "vitals": "{\"temperature\":37.2,\"bloodPressure\":\"160/95\",\"heartRate\":88,\"weight\":78}",
      "status": "COMPLETED",
      "patient": {
        "id": "clx...",
        "firstName": "Mamadou",
        "lastName": "Condé"
      },
      "doctor": {
        "id": "clx...",
        "firstName": "Dr. Ibrahima",
        "lastName": "Souaré"
      },
      "prescriptions": [
        {
          "id": "clx...",
          "status": "ACTIVE",
          "items": [
            {
              "medicationName": "Amlodipine 5mg",
              "dosage": "5mg",
              "frequency": "1 fois par jour",
              "duration": "30 jours"
            }
          ]
        }
      ],
      "labRequests": [
        {
          "requestCode": "LAB-2026-00456",
          "status": "COMPLETED"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/consultations

Créer une consultation.

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "doctorId": "clx_doctor_id",
  "appointmentId": "clx_appointment_id",
  "chiefComplaint": "Céphalées persistantes",
  "historyOfPresentIllness": "Douleurs frontales depuis 3 jours...",
  "physicalExamination": "PA 160/95 mmHg, FC 88 bpm...",
  "diagnosis": "Hypertension artérielle",
  "treatmentPlan": "Amlodipine 5mg/jour, régime hyposalimé",
  "followUpInstructions": "Revoir dans 2 semaines",
  "vitals": {
    "temperature": 37.2,
    "bloodPressure": "160/95",
    "heartRate": 88,
    "respiratoryRate": 18,
    "weight": 78,
    "height": 175,
    "oxygenSaturation": 98
  }
}
```

---

## 5. Laboratoire

### GET /api/laboratory

Liste des demandes de laboratoire ou catalogue d'analyses.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `catalog` | boolean | `true` pour lister le catalogue d'analyses |
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `status` | string | `REQUESTED` \| `SAMPLE_COLLECTED` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED` |
| `priority` | string | `STAT` \| `URGENT` \| `ROUTINE` |
| `category` | string | `HEMATOLOGY` \| `BIOCHEMISTRY` \| `MICROBIOLOGY` \| `IMMUNOLOGY` |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse (demandes) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "requestCode": "LAB-2026-00456",
      "priority": "URGENT",
      "status": "IN_PROGRESS",
      "clinicalInfo": "Fièvre persistante, suspicion paludisme",
      "requestedAt": "2026-03-04T08:00:00.000Z",
      "patient": {
        "id": "clx...",
        "firstName": "Lamine",
        "lastName": "Kaba"
      },
      "requestingDoctor": {
        "id": "clx...",
        "firstName": "Dr. Mamadou",
        "lastName": "Diallo"
      },
      "items": [
        {
          "id": "clx...",
          "testCatalog": {
            "name": "Goutte épaisse",
            "code": "GE-001",
            "category": "MICROBIOLOGY"
          },
          "status": "IN_PROGRESS"
        },
        {
          "id": "clx...",
          "testCatalog": {
            "name": "NFS (Numération Formule Sanguine)",
            "code": "NFS-001",
            "category": "HEMATOLOGY"
          },
          "status": "COMPLETED"
        }
      ],
      "results": [
        {
          "id": "clx...",
          "resultValue": "Positif",
          "isAbnormal": true,
          "abnormalFlag": "CRITICAL_HIGH",
          "status": "FINAL",
          "validatedById": "clx_biologist_id",
          "validatedAt": "2026-03-04T10:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

**Réponse (catalogue, `?catalog=true`) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "NFS (Numération Formule Sanguine)",
      "code": "NFS-001",
      "category": "HEMATOLOGY",
      "specimenType": "BLOOD",
      "normalRangeMin": 4.0,
      "normalRangeMax": 11.0,
      "unit": "x10^9/L",
      "turnaroundHours": 4,
      "price": 25000,
      "isActive": true
    }
  ]
}
```

### POST /api/laboratory

Créer une demande de laboratoire.

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "requestingDoctorId": "clx_doctor_id",
  "consultationId": "clx_consultation_id",
  "priority": "URGENT",
  "clinicalInfo": "Fièvre persistante, suspicion paludisme",
  "testCatalogIds": ["clx_test1_id", "clx_test2_id"]
}
```

---

## 6. Pharmacie

### GET /api/pharmacy

Différentes vues selon le paramètre `view`.

| Paramètre `view` | Description |
|-----------------|-------------|
| `stock` (défaut) | Niveaux de stock par médicament |
| `alerts` | Alertes de pénurie actives |
| `expirations` | Suivi des expirations |
| `medications` | Catalogue des médicaments |

**Paramètres de requête (vue stock) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `establishmentId` | string | Filtrer par établissement |

**Réponse (vue stock) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "currentQuantity": 150,
      "reservedQuantity": 10,
      "availableQuantity": 140,
      "batchNumber": "LOT-2026-A001",
      "medication": {
        "id": "clx...",
        "name": "Paracétamol 500mg",
        "genericName": "Paracétamol",
        "code": "MED-PARA-500",
        "category": "ANALGESIC",
        "form": "TABLET",
        "unitPrice": 500,
        "sellingPrice": 750,
        "minimumStockLevel": 50
      }
    }
  ],
  "pagination": { ... }
}
```

**Réponse (vue alertes, `?view=alerts`) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "currentStock": 5,
      "minimumLevel": 50,
      "alertType": "CRITICAL",
      "status": "ACTIVE",
      "medication": {
        "name": "Artéméther/Luméfantrine",
        "category": "ANTIPALUDEEN"
      },
      "createdAt": "2026-03-03T14:00:00.000Z"
    }
  ]
}
```

### POST /api/pharmacy

Ajouter une entrée de stock.

**Corps de la requête :**

```json
{
  "establishmentId": "clx_establishment_id",
  "supplier": "Pharma Guinée SARL",
  "invoiceNumber": "INV-2026-0089",
  "items": [
    {
      "medicationId": "clx_medication_id",
      "batchNumber": "LOT-2026-B002",
      "quantity": 500,
      "unitPrice": 450,
      "expiryDate": "2027-06-30"
    }
  ]
}
```

---

## 7. Hospitalisations

### GET /api/hospitalizations

Liste des admissions.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `status` | string | `ADMITTED` \| `IN_TREATMENT` \| `DISCHARGED` \| `TRANSFERRED` \| `DECEASED` |
| `departmentId` | string | Filtrer par département |
| `establishmentId` | string | Filtrer par établissement |
| `admissionType` | string | `PLANNED` \| `EMERGENCY` \| `TRANSFER` \| `DAY_CASE` |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "admissionNumber": "ADM-2026-00123",
      "admissionDate": "2026-03-02T08:00:00.000Z",
      "admissionType": "EMERGENCY",
      "admissionReason": "Appendicite aiguë",
      "status": "IN_TREATMENT",
      "patient": {
        "id": "clx...",
        "firstName": "Abdoulaye",
        "lastName": "Souaré"
      },
      "bed": {
        "id": "clx...",
        "number": "CHIR-204-A",
        "status": "OCCUPIED",
        "room": {
          "number": "204",
          "name": "Chirurgie Hommes",
          "department": {
            "name": "Chirurgie"
          }
        }
      },
      "trackingRecords": [
        {
          "type": "VITAL_SIGNS",
          "trackingDate": "2026-03-04T06:00:00.000Z",
          "vitals": "{\"temperature\":37.8,\"bloodPressure\":\"120/80\",\"heartRate\":72}"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/hospitalizations

Créer une admission (le statut du lit passe automatiquement à `OCCUPIED`).

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "bedId": "clx_bed_id",
  "departmentId": "clx_department_id",
  "attendingDoctorId": "clx_doctor_id",
  "admissionType": "EMERGENCY",
  "admissionReason": "Appendicite aiguë",
  "diagnosisAtAdmission": "Appendicite aiguë suspectée"
}
```

---

## 8. Urgences

### GET /api/emergencies

Liste des cas d'urgence.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `status` | string | `TRIAGE` \| `WAITING` \| `IN_TREATMENT` \| `OBSERVATION` \| `DISCHARGED` \| `ADMITTED` |
| `triageLevel` | string | `RED` \| `ORANGE` \| `YELLOW` \| `GREEN` \| `BLUE` |
| `establishmentId` | string | Filtrer par établissement |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "caseNumber": "URG-2026-00045",
      "arrivalDate": "2026-03-04T07:30:00.000Z",
      "arrivalMode": "AMBULANCE",
      "chiefComplaint": "Douleur thoracique aiguë",
      "triageLevel": "RED",
      "status": "IN_TREATMENT",
      "vitalSigns": "{\"temperature\":36.8,\"bloodPressure\":\"90/60\",\"heartRate\":110,\"oxygenSaturation\":92}",
      "patient": {
        "id": "clx...",
        "firstName": "Ibrahim",
        "lastName": "Touré"
      },
      "doctor": {
        "id": "clx...",
        "firstName": "Dr. Mamadou",
        "lastName": "Diallo"
      },
      "triageAssessments": [
        {
          "triageLevel": "RED",
          "consciousness": "ALERT",
          "painLevel": 9,
          "bloodPressureSystolic": 90,
          "heartRate": 110,
          "oxygenSaturation": 92
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/emergencies

Créer un cas d'urgence (numéro de cas auto-généré, triage possible en même temps).

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "attendingDoctorId": "clx_doctor_id",
  "arrivalMode": "AMBULANCE",
  "chiefComplaint": "Douleur thoracique aiguë",
  "triageLevel": "RED",
  "vitalSigns": {
    "temperature": 36.8,
    "bloodPressure": "90/60",
    "heartRate": 110,
    "oxygenSaturation": 92
  },
  "triageAssessment": {
    "assessedById": "clx_nurse_id",
    "consciousness": "ALERT",
    "painLevel": 9,
    "bloodPressureSystolic": 90,
    "bloodPressureDiastolic": 60,
    "heartRate": 110,
    "respiratoryRate": 24,
    "oxygenSaturation": 92
  }
}
```

---

## 9. Maternité

### GET /api/maternity

Différentes vues selon le paramètre `view`.

| Paramètre `view` | Description |
|-----------------|-------------|
| `pregnancies` (défaut) | Suivi des grossesses |
| `deliveries` | Accouchements |
| `children` | Enfants nés |

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patiente |
| `status` | string | `ACTIVE` \| `COMPLETED` \| `MISCARRIAGE` |
| `riskLevel` | string | `LOW` \| `MEDIUM` \| `HIGH` \| `VERY_HIGH` |
| `establishmentId` | string | Filtrer par établissement |

**Réponse (vue grossesses) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "startDate": "2025-09-15T00:00:00.000Z",
      "expectedDueDate": "2026-06-22T00:00:00.000Z",
      "gravida": 2,
      "para": 1,
      "riskLevel": "MEDIUM",
      "status": "ACTIVE",
      "riskFactors": "[\"Age > 35\",\"Césarienne antérieure\"]",
      "patient": {
        "id": "clx...",
        "firstName": "Fatoumata",
        "lastName": "Camara",
        "dateOfBirth": "1990-05-20T00:00:00.000Z"
      },
      "visits": [
        {
          "visitDate": "2026-02-15T00:00:00.000Z",
          "visitType": "ROUTINE",
          "gestationalAge": 22,
          "weight": 72.5,
          "bloodPressureSystolic": 120,
          "fetalHeartRate": 140
        }
      ],
      "deliveries": []
    }
  ],
  "pagination": { ... }
}
```

### POST /api/maternity

Créer un suivi de grossesse.

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "startDate": "2025-09-15",
  "expectedDueDate": "2026-06-22",
  "gravida": 2,
  "para": 1,
  "bloodType": "A+",
  "rhFactor": "POSITIVE",
  "riskLevel": "MEDIUM",
  "riskFactors": ["Age > 35", "Césarienne antérieure"],
  "attendingDoctorId": "clx_doctor_id"
}
```

---

## 10. Vaccinations

### GET /api/vaccinations

Différentes vues selon le paramètre `view`.

| Paramètre `view` | Description |
|-----------------|-------------|
| `records` (défaut) | Enregistrements de vaccination |
| `schedules` | Calendrier vaccinal guinéen |
| `reminders` | Rappels de vaccination en attente |

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `childId` | string | Filtrer par enfant |
| `scheduleId` | string | Filtrer par vaccin du calendrier |
| `status` | string | `COMPLETED` \| `PENDING` \| `OVERDUE` \| `MISSED` |

**Réponse (vue calendrier, `?view=schedules`) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "vaccineName": "BCG",
      "targetDisease": "Tuberculose",
      "recommendedAge": "Naissance",
      "doseNumber": 1,
      "intervalWeeks": 0,
      "isMandatory": true
    },
    {
      "id": "clx...",
      "vaccineName": "DTC (Diphtérie-Tétanos-Coqueluche)",
      "targetDisease": "Diphtérie, Tétanos, Coqueluche",
      "recommendedAge": "6 semaines",
      "doseNumber": 1,
      "intervalWeeks": 6,
      "isMandatory": true
    }
  ]
}
```

**Réponse (vue enregistrements) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "vaccinationDate": "2026-01-15T00:00:00.000Z",
      "batchNumber": "VAC-BCG-2026-001",
      "lotNumber": "LOT-001",
      "status": "COMPLETED",
      "schedule": {
        "vaccineName": "BCG",
        "recommendedAge": "Naissance"
      },
      "child": {
        "id": "clx...",
        "firstName": "Mariama",
        "lastName": "Bah",
        "dateOfBirth": "2026-01-15T00:00:00.000Z"
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/vaccinations

Enregistrer une vaccination.

**Corps de la requête :**

```json
{
  "childId": "clx_child_id",
  "scheduleId": "clx_schedule_id",
  "vaccinationDate": "2026-03-04",
  "batchNumber": "VAC-DTC-2026-005",
  "lotNumber": "LOT-DTC-005",
  "administeredById": "clx_nurse_id",
  "notes": "Tolérance bonne, pas de réaction"
}
```

---

## 11. Facturation

### GET /api/billing

Liste des factures.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `status` | string | `DRAFT` \| `ISSUED` \| `PARTIALLY_PAID` \| `PAID` \| `OVERDUE` \| `CANCELLED` |
| `establishmentId` | string | Filtrer par établissement |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "invoiceNumber": "FAC-2026-00890",
      "invoiceDate": "2026-03-04T10:00:00.000Z",
      "subtotal": 250000,
      "discount": 0,
      "taxAmount": 0,
      "totalAmount": 250000,
      "insuranceCoverage": 175000,
      "patientResponsibility": 75000,
      "status": "PARTIALLY_PAID",
      "patient": {
        "id": "clx...",
        "firstName": "Aminata",
        "lastName": "Diallo"
      },
      "items": [
        {
          "description": "Consultation médecin généraliste",
          "category": "CONSULTATION",
          "quantity": 1,
          "unitPrice": 50000,
          "totalPrice": 50000
        },
        {
          "description": "NFS + Goutte épaisse",
          "category": "LABORATORY",
          "quantity": 1,
          "unitPrice": 75000,
          "totalPrice": 75000
        },
        {
          "description": "Artéméther/Luméfantrine (traitement paludisme)",
          "category": "PHARMACY",
          "quantity": 1,
          "unitPrice": 125000,
          "totalPrice": 125000
        }
      ],
      "payments": [
        {
          "amount": 50000,
          "paymentMethod": "MOBILE_MONEY",
          "provider": "ORANGE",
          "status": "COMPLETED",
          "paidAt": "2026-03-04T10:30:00.000Z"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/billing

Créer une facture (les montants sont calculés automatiquement).

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "establishmentId": "clx_establishment_id",
  "patientInsuranceId": "clx_insurance_id",
  "dueDate": "2026-03-18",
  "items": [
    {
      "description": "Consultation médecin généraliste",
      "category": "CONSULTATION",
      "quantity": 1,
      "unitPrice": 50000
    },
    {
      "description": "NFS + Goutte épaisse",
      "category": "LABORATORY",
      "quantity": 1,
      "unitPrice": 75000
    }
  ]
}
```

---

## 12. Paiements

### GET /api/payments

Liste des paiements.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `invoiceId` | string | Filtrer par facture |
| `status` | string | `PENDING` \| `COMPLETED` \| `FAILED` \| `REFUNDED` |
| `paymentMethod` | string | `CASH` \| `MOBILE_MONEY` \| `BANK_TRANSFER` \| `INSURANCE` |
| `establishmentId` | string | Filtrer par établissement |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "amount": 75000,
      "paymentMethod": "MOBILE_MONEY",
      "provider": "ORANGE",
      "transactionRef": "OM-2026-123456789",
      "status": "COMPLETED",
      "paidAt": "2026-03-04T10:30:00.000Z",
      "invoice": {
        "id": "clx...",
        "invoiceNumber": "FAC-2026-00890",
        "status": "PAID"
      },
      "patient": {
        "id": "clx...",
        "firstName": "Aminata",
        "lastName": "Diallo"
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/payments

Enregistrer un paiement (le statut de la facture est mis à jour automatiquement).

**Corps de la requête :**

```json
{
  "invoiceId": "clx_invoice_id",
  "amount": 75000,
  "paymentMethod": "MOBILE_MONEY",
  "provider": "ORANGE",
  "transactionRef": "OM-2026-123456789",
  "receivedById": "clx_user_id",
  "notes": "Paiement Orange Money confirmé"
}
```

**Méthodes de paiement supportées :**

| Méthode | Providers | Description |
|---------|-----------|-------------|
| `CASH` | — | Espèces |
| `MOBILE_MONEY` | `ORANGE`, `MTN`, `CELCOM` | Mobile Money guinéen |
| `BANK_TRANSFER` | — | Virement bancaire |
| `INSURANCE` | — | Couverture assurance |

---

## 13. Téléconsultation

### GET /api/teleconsultation

Liste des sessions de téléconsultation.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `patientId` | string | Filtrer par patient |
| `doctorId` | string | Filtrer par médecin |
| `status` | string | `SCHEDULED` \| `IN_PROGRESS` \| `COMPLETED` \| `CANCELLED` |
| `type` | string | `VIDEO` \| `AUDIO` \| `CHAT` |
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "meetingId": "TC-2026-00123",
      "meetingPassword": "abc123",
      "type": "VIDEO",
      "status": "IN_PROGRESS",
      "scheduledAt": "2026-03-04T14:00:00.000Z",
      "startedAt": "2026-03-04T14:02:00.000Z",
      "patient": {
        "id": "clx...",
        "firstName": "Kadiatou",
        "lastName": "Sylla"
      },
      "doctor": {
        "id": "clx...",
        "firstName": "Dr. Aissatou",
        "lastName": "Diallo"
      },
      "sharedDocuments": [
        {
          "id": "clx...",
          "fileName": "resultats_lab.pdf",
          "accessLevel": "VIEW"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/teleconsultation

Créer une session de téléconsultation (ID et mot de passe de réunion auto-générés).

**Corps de la requête :**

```json
{
  "patientId": "clx_patient_id",
  "doctorId": "clx_doctor_id",
  "type": "VIDEO",
  "scheduledAt": "2026-03-05T14:00:00.000Z",
  "notes": "Suivi hypertension"
}
```

---

## 14. Dashboard

### GET /api/dashboard

Statistiques agrégées pour le tableau de bord. Retourne des données réelles si la base contient des données, sinon des données mock pour la démonstration.

**Pas de paramètres de pagination** — retourne un objet unique.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "totalPatients": 12456,
    "newPatientsThisMonth": 342,
    "appointmentsToday": 24,
    "appointmentsThisWeek": 156,
    "availableBeds": 42,
    "totalBeds": 120,
    "bedOccupancyRate": 65,
    "criticalStockAlerts": 5,
    "pendingLabResults": 12,
    "emergencyCasesToday": 7,
    "revenueThisMonth": 125000000,
    "vaccinationCoverageRate": 78,
    "activePregnancies": 45,
    "recentActivities": [
      {
        "type": "PATIENT_REGISTERED",
        "description": "Nouveau patient enregistré : Aminata Diallo",
        "timestamp": "2026-03-04T09:30:00.000Z"
      },
      {
        "type": "APPOINTMENT_COMPLETED",
        "description": "Consultation terminée : Mamadou Condé",
        "timestamp": "2026-03-04T09:15:00.000Z"
      }
    ],
    "appointmentsByStatus": {
      "CONFIRMED": 18,
      "PENDING": 5,
      "CANCELLED": 1
    },
    "emergencyByTriage": {
      "RED": 1,
      "ORANGE": 2,
      "YELLOW": 2,
      "GREEN": 1,
      "BLUE": 1
    },
    "revenueByDay": [
      { "date": "2026-02-26", "revenue": 15000000 },
      { "date": "2026-02-27", "revenue": 18500000 },
      { "date": "2026-02-28", "revenue": 12300000 }
    ],
    "topDiseases": [
      { "name": "Paludisme", "count": 342, "percentage": 28 },
      { "name": "IRA", "count": 231, "percentage": 19 },
      { "name": "Diarrhée", "count": 183, "percentage": 15 }
    ]
  }
}
```

---

## 15. Alertes Santé

### GET /api/alerts

Différentes vues selon le paramètre `view`.

| Paramètre `view` | Description |
|-----------------|-------------|
| `alerts` (défaut) | Alertes épidémiologiques |
| `anomalies` | Anomalies détectées |
| `surveillance` | Surveillance des maladies |
| `reports` | Rapports de santé |

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `status` | string | `ACTIVE` \| `INVESTIGATING` \| `CONFIRMED` \| `RESOLVED` \| `DISMISSED` |
| `alertType` | string | `OUTBREAK` \| `EPIDEMIC` \| `NOTIFIABLE_DISEASE` \| `ANOMALY` |
| `severity` | string | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| `establishmentId` | string | Filtrer par établissement |
| `region` | string | Filtrer par région |

**Réponse (vue alertes) :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "title": "Suspicion épidémie de choléra - Conakry",
      "alertType": "OUTBREAK",
      "severity": "CRITICAL",
      "status": "INVESTIGATING",
      "region": "Conakry",
      "disease": "Choléra",
      "caseCount": 15,
      "deathCount": 2,
      "startDate": "2026-02-28T00:00:00.000Z",
      "whoNotified": false,
      "establishment": {
        "name": "Hôpital Donka"
      },
      "createdAt": "2026-03-01T08:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /api/alerts

Créer une alerte de santé publique.

**Corps de la requête :**

```json
{
  "title": "Suspicion épidémie de choléra - Conakry",
  "alertType": "OUTBREAK",
  "severity": "CRITICAL",
  "disease": "Choléra",
  "region": "Conakry",
  "caseCount": 15,
  "deathCount": 2,
  "startDate": "2026-02-28",
  "description": "Augmentation significative des cas de diarrhée aqueuse...",
  "establishmentId": "clx_establishment_id"
}
```

---

## 16. Établissements

### GET /api/establishments

Liste des établissements de santé.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `type` | string | `HOSPITAL` \| `CLINIC` \| `HEALTH_CENTER` \| `DISPENSARY` |
| `city` | string | Filtrer par ville |
| `region` | string | Filtrer par région |
| `search` | string | Recherche par nom |
| `isActive` | boolean | Filtrer par statut actif |

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Hôpital National Donka",
      "type": "HOSPITAL",
      "code": "DON",
      "address": "Avenue de la République",
      "city": "Conakry",
      "region": "Conakry",
      "phone": "+224 621 00 00 00",
      "email": "contact@hopital-donka.gn",
      "isActive": true,
      "parent": null,
      "children": [
        {
          "id": "clx...",
          "name": "Centre de Santé Donka-Est",
          "type": "HEALTH_CENTER"
        }
      ],
      "departments": [
        {
          "id": "clx...",
          "name": "Urgences",
          "type": "EMERGENCY"
        },
        {
          "id": "clx...",
          "name": "Maternité",
          "type": "MATERNITY"
        }
      ],
      "_count": {
        "patients": 4500,
        "beds": 120,
        "departments": 12
      }
    }
  ],
  "pagination": { ... }
}
```

### POST /api/establishments

Créer un établissement.

**Corps de la requête :**

```json
{
  "name": "Clinique Pasteur",
  "type": "CLINIC",
  "code": "PST",
  "address": "Boulevard du Commerce",
  "city": "Conakry",
  "region": "Conakry",
  "phone": "+224 621 11 11 11",
  "email": "contact@clinique-pasteur.gn",
  "parentId": "clx_parent_hospital_id"
}
```

---

## 17. Utilisateurs

### GET /api/users

Liste des utilisateurs.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `search` | string | Recherche globale (nom, prénom, email, téléphone, ID professionnel) |
| `firstName` | string | Filtrer par prénom |
| `lastName` | string | Filtrer par nom |
| `email` | string | Filtrer par email |
| `phone` | string | Filtrer par téléphone |
| `professionalId` | string | Filtrer par ID professionnel |
| `role` | string | Filtrer par rôle |
| `specialization` | string | Filtrer par spécialisation |
| `isActive` | boolean | Filtrer par statut actif |

> **Note** : Le champ `passwordHash` n'est jamais retourné dans les réponses.

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "email": "dr.diallo@hopital-donka.gn",
      "firstName": "Mamadou",
      "lastName": "Diallo",
      "phone": "+224 622 33 33 33",
      "professionalId": "MED-GN-2018-0456",
      "specialization": "Médecine interne",
      "isActive": true,
      "lastLoginAt": "2026-03-04T07:30:00.000Z",
      "roles": [
        {
          "role": {
            "name": "DOCTOR",
            "description": "Médecin"
          },
          "establishmentId": "clx_donka_id"
        }
      ],
      "establishments": [
        {
          "establishment": {
            "id": "clx_donka_id",
            "name": "Hôpital Donka"
          },
          "isDefault": true
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### POST /api/users

Créer un utilisateur.

**Corps de la requête :**

```json
{
  "email": "dr.bah@hopital-donka.gn",
  "password": "MotDePasseSecurise123!",
  "firstName": "Aissatou",
  "lastName": "Bah",
  "phone": "+224 622 44 44 44",
  "professionalId": "MED-GN-2020-0789",
  "specialization": "Gynécologie-obstétrique",
  "roleId": "clx_doctor_role_id",
  "establishmentId": "clx_donka_id"
}
```

---

## 18. Rate Limiting

### Limites par défaut

| Type de limite | Valeur | Fenêtre |
|---------------|--------|---------|
| **API globale** | 1000 requêtes | 15 minutes |
| **Authentification** | 5 tentatives | 15 minutes |
| **Création de ressources** | 100 requêtes | 15 minutes |
| **Export de données** | 10 requêtes | 1 heure |

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1709500800
```

### Réponse 429 (Rate Limit Dépassé)

```json
{
  "success": false,
  "error": "Trop de requêtes. Veuillez réessayer dans 15 minutes.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900
}
```

---

## 19. Webhooks

### Configuration des Webhooks

Les webhooks permettent de recevoir des notifications en temps réel lorsque certains événements se produisent.

**Enregistrement d'un webhook :**

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://votre-service.gn/webhooks/healthflow",
  "events": [
    "appointment.created",
    "appointment.cancelled",
    "lab.result.validated",
    "payment.completed",
    "alert.created"
  ],
  "secret": "votre-secret-webhook-pour-signature"
}
```

### Événements Disponibles

| Événement | Description | Données incluses |
|-----------|-------------|-----------------|
| `patient.created` | Nouveau patient | Patient |
| `patient.updated` | Patient modifié | Patient (ancien + nouveau) |
| `appointment.created` | Nouveau rendez-vous | Appointment |
| `appointment.confirmed` | RDV confirmé | Appointment |
| `appointment.cancelled` | RDV annulé | Appointment + raison |
| `consultation.completed` | Consultation terminée | Consultation |
| `lab.request.created` | Demande labo créée | LabRequest |
| `lab.result.validated` | Résultat validé | LabResult |
| `pharmacy.stock.critical` | Stock critique | ShortageAlert |
| `emergency.created` | Cas d'urgence | EmergencyCase |
| `payment.completed` | Paiement effectué | Payment |
| `invoice.overdue` | Facture en retard | Invoice |
| `alert.created` | Alerte santé publique | EpidemiologicalAlert |
| `vaccination.due` | Vaccination due | VaccinationReminder |
| `teleconsultation.started` | Téléconsultation démarrée | Teleconsultation |

### Format du Webhook

```json
{
  "id": "evt_clx_event_id",
  "type": "lab.result.validated",
  "timestamp": "2026-03-04T10:30:00.000Z",
  "data": {
    "id": "clx_result_id",
    "requestCode": "LAB-2026-00456",
    "patientId": "clx_patient_id",
    "testName": "Goutte épaisse",
    "resultValue": "Positif",
    "isAbnormal": true,
    "validatedAt": "2026-03-04T10:30:00.000Z"
  },
  "establishmentId": "clx_establishment_id"
}
```

### Vérification de Signature

Chaque webhook inclut une signature HMAC-SHA256 dans le header :

```http
X-HealthFlow-Signature: sha256=a1b2c3d4e5f6...
X-HealthFlow-Event: lab.result.validated
X-HealthFlow-Delivery: evt_clx_event_id
```

**Vérification côté serveur :**

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}
```

### Réessai en Cas d'Échec

| Tentative | Délai |
|-----------|-------|
| 1ère | Immédiat |
| 2ème | 1 minute |
| 3ème | 5 minutes |
| 4ème | 30 minutes |
| 5ème | 2 heures |

Après 5 échecs, le webhook est désactivé et une notification est envoyée à l'administrateur.

---

<div align="center">

**DataSphere Innovation** — Conakry, Guinée 🇬🇳

*API conçue pour la fiabilité, la sécurité et la facilité d'intégration*

</div>
