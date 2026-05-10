# 🏗 Architecture Système — HealthFlow Guinea

> Documentation complète de l'architecture technique de HealthFlow Guinea

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture Frontend](#2-architecture-frontend)
3. [Architecture Backend](#3-architecture-backend)
4. [Conception Base de Données](#4-conception-base-de-données)
5. [Authentification & Autorisation](#5-authentification--autorisation)
6. [Multi-tenancy](#6-multi-tenancy)
7. [Mesures de Sécurité](#7-mesures-de-sécurité)
8. [Architecture de Déploiement](#8-architecture-de-déploiement)
9. [Monitoring & Observabilité](#9-monitoring--observabilité)
10. [Flux de Données](#10-flux-de-données)
11. [Points d'Intégration](#11-points-dintégration)

---

## 1. Vue d'ensemble

### Diagramme d'Architecture Système

```
                              ┌──────────────────────────────────────────────────┐
                              │                  INTERNET / CDN                   │
                              └──────────────────────┬───────────────────────────┘
                                                     │
                                                     ▼
                              ┌──────────────────────────────────────────────────┐
                              │              NGINX / REVERSE PROXY               │
                              │         (SSL Termination, Load Balancing)        │
                              └──────────┬─────────────────────┬─────────────────┘
                                         │                     │
                          ┌──────────────▼──────┐   ┌─────────▼────────────────┐
                          │   FRONTEND (SSR)    │   │    API GATEWAY           │
                          │   Next.js 16        │   │    Next.js API Routes    │
                          │   React 19          │   │    Port 3000             │
                          │   Port 3000         │   │                          │
                          └─────────────────────┘   └──────────┬──────────────┘
                                                               │
                                    ┌──────────────────────────┼──────────────────────────┐
                                    │                          │                          │
                             ┌──────▼───────┐          ┌──────▼───────┐          ┌──────▼───────┐
                             │  PostgreSQL  │          │    MinIO     │          │  SMS Gateway │
                             │  Prisma ORM  │          │  (S3-compat) │          │ Orange/MTN   │
                             │  Port 5432   │          │  Port 9000   │          │              │
                             └──────────────┘          └─────────────┘          └──────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │  Apache Superset  │
                          │  Analytics        │
                          │  Port 8088        │
                          └───────────────────┘
```

### Principes Architecturaux

| Principe | Description |
|----------|-------------|
| **Modularité** | 10 modules fonctionnels indépendants, faiblement couplés |
| **Multi-tenancy** | Isolation des données par établissement via `establishmentId` |
| **API-First** | Toute la logique métier accessible via API REST |
| **Sécurité by Design** | Chiffrement, RBAC, MFA, audit logging |
| **Offline-First Ready** | Architecture préparée pour le mode hors-ligne (zones rurales) |
| **Extensibilité** | Architecture plugin pour intégrations tierces |

---

## 2. Architecture Frontend

### Stack Frontend

```
┌─────────────────────────────────────────────────┐
│                  NEXT.JS 16                      │
│              (App Router, RSC)                   │
├─────────────────────────────────────────────────┤
│  React 19  │  TypeScript 5  │  Tailwind CSS 4   │
├─────────────────────────────────────────────────┤
│           shadcn/ui (New York Style)             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ Card │ │Table │ │ Sheet│ │ Dialog│ │ Form │  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────────────┤
│        Framer Motion │ Recharts │ Zustand        │
├─────────────────────────────────────────────────┤
│         TanStack Query │ React Hook Form         │
└─────────────────────────────────────────────────┘
```

### Structure des Composants

```
src/components/
├── landing/
│   └── landing-page.tsx          # Landing page premium (10 sections)
├── app/
│   ├── app-shell.tsx             # Shell principal (Sidebar + Header)
│   └── modules/                 # 15 pages de modules
│       ├── dashboard.tsx         # Dashboard avec KPI, Recharts
│       ├── patients.tsx          # Gestion patients (table, détail, CRUD)
│       ├── appointments.tsx      # Rendez-vous (liste, calendrier)
│       ├── consultations.tsx     # Consultations (constantes, ordonnances)
│       ├── laboratory.tsx        # Laboratoire (requêtes, résultats)
│       ├── pharmacy.tsx          # Pharmacie (stocks, alertes)
│       ├── hospitalization.tsx   # Hospitalisation (lits, admissions)
│       ├── emergencies.tsx       # Urgences (triage 5 couleurs)
│       ├── maternity.tsx         # Maternité (grossesses, accouchements)
│       ├── vaccination.tsx       # Vaccination (calendrier guinéen)
│       ├── billing.tsx           # Facturation (factures, paiements)
│       ├── teleconsultation.tsx  # Téléconsultation (vidéo, chat)
│       ├── analytics.tsx         # Analytics (Superset)
│       ├── administration.tsx    # Administration (établissements, users)
│       └── settings.tsx          # Paramètres système
└── ui/                           # 30+ composants shadcn/ui
    ├── button.tsx
    ├── card.tsx
    ├── table.tsx
    ├── dialog.tsx
    ├── sheet.tsx
    ├── tabs.tsx
    ├── select.tsx
    ├── calendar.tsx
    ├── badge.tsx
    └── ...
```

### Navigation & State Management

```
┌──────────────────────────────────────┐
│         Zustand Store                │
│  ┌─────────────────────────────────┐ │
│  │ currentView: AppView            │ │  ← 16 vues possibles
│  │ sidebarOpen: boolean            │ │  ← État sidebar
│  │ user: MockUser                  │ │  ← Utilisateur courant
│  └─────────────────────────────────┘ │
│         │                            │
│    ┌────▼─────┐                      │
│    │  Landing │──── setCurrentView() │
│    │   Page   │     ────────────────►│  App Shell
│    └──────────┘                      │  ┌─────────────────┐
│                                      │  │  Sidebar + 15   │
│                                      │  │  Module Pages   │
│                                      │  └─────────────────┘
└──────────────────────────────────────┘
```

**AppView** : `landing | dashboard | patients | appointments | consultations | laboratory | pharmacy | hospitalization | emergencies | maternity | vaccination | billing | teleconsultation | analytics | administration | settings`

### Stratégie de Rendu

| Page | Rendu | Raison |
|------|-------|--------|
| Landing Page | CSR (`'use client'`) | Animations Framer Motion, interactivité |
| App Shell | CSR | Navigation Zustand, sidebar interactive |
| Module Pages | CSR | Tables, formulaires, dialogs interactifs |
| API Routes | SSR | Server-side logic, Prisma DB access |

---

## 3. Architecture Backend

### API Routes (Next.js)

```
src/app/api/
├── patients/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/route.ts     # GET (detail), PUT (update), DELETE (archive)
├── appointments/route.ts # GET (list), POST (create)
├── consultations/route.ts# GET (list), POST (create)
├── laboratory/route.ts   # GET (list/catalog), POST (create request)
├── pharmacy/route.ts     # GET (stock/alerts/expirations), POST (add stock)
├── hospitalizations/route.ts # GET (list), POST (create admission)
├── emergencies/route.ts  # GET (list), POST (create emergency case)
├── maternity/route.ts    # GET (pregnancies/deliveries/children), POST (create)
├── vaccinations/route.ts # GET (records/schedules/reminders), POST (record)
├── billing/route.ts      # GET (invoices), POST (create invoice)
├── payments/route.ts     # GET (list), POST (record payment)
├── teleconsultation/route.ts # GET (list), POST (create session)
├── dashboard/route.ts    # GET (aggregate stats + mock fallback)
├── alerts/route.ts       # GET (alerts/anomalies/surveillance/reports), POST (create)
├── establishments/route.ts  # GET (list), POST (create)
└── users/route.ts        # GET (list), POST (create)
```

### Utilitaires API Partagés (`src/lib/api-utils.ts`)

```typescript
// Réponse standardisée
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fonctions utilitaires
corsHeaders()        → Headers CORS pour toutes les réponses
successResponse(data) → ApiResponse avec success: true
errorResponse(msg, status) → ApiResponse avec success: false
paginatedResponse(data, page, limit, total) → ApiResponse avec pagination
getPaginationParams(url) → { page, limit, skip, take }
```

### Patterns API Consistants

| Pattern | Description |
|---------|-------------|
| **Pagination** | `page` (défaut: 1), `limit` (défaut: 20) sur tous les GET |
| **Recherche** | Paramètres `search`, `firstName`, `lastName`, etc. |
| **Filtres** | `status`, `establishmentId`, `dateFrom`, `dateTo`, etc. |
| **Auto-génération** | QR code, codes de requête, numéros de dossier |
| **Inclusions** | Données liées via Prisma `include` |
| **Tri** | Résultats triés par `createdAt` descendant |
| **Soft Delete** | `isActive: false` au lieu de suppression physique |

---

## 4. Conception Base de Données

### Schéma Prisma — 63 Modèles

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE INFRASTRUCTURE (11)                  │
│  Establishment → Department → Room → Bed                    │
│  User → UserRole → Role → Permission → RolePermission       │
│  UserEstablishment │ AuditLog                                │
├─────────────────────────────────────────────────────────────┤
│  1. PATIENTS (4)                                             │
│  Patient → PatientAllergy                                   │
│  Patient → PatientAntecedent                                │
│  Patient → MedicalDocument                                  │
├─────────────────────────────────────────────────────────────┤
│  2. RENDEZ-VOUS & CONSULTATIONS (6)                         │
│  DoctorAgenda │ Appointment                                  │
│  Consultation → Prescription → PrescriptionItem              │
│  Consultation → ConsultationReport                          │
├─────────────────────────────────────────────────────────────┤
│  3. LABORATOIRE (5)                                         │
│  LabTestCatalog → LabRequestItem                            │
│  LabRequest → LabRequestItem → LabResult → LabResultHistory │
├─────────────────────────────────────────────────────────────┤
│  4. PHARMACIE & STOCK (8)                                   │
│  Medication → MedicationStock                               │
│  StockEntry → StockEntryItem                                │
│  StockExit → StockExitItem                                  │
│  ShortageAlert │ ExpirationTracking                         │
├─────────────────────────────────────────────────────────────┤
│  5. HOSPITALISATION & URGENCES (5)                          │
│  Admission → HospitalizationTracking                        │
│  EmergencyCase → TriageAssessment                           │
│  Bed (Core) avec Admission                                  │
├─────────────────────────────────────────────────────────────┤
│  6. MATERNITE & VACCINATION (7)                             │
│  PregnancyTracking → PregnancyVisit                         │
│  PregnancyTracking → Delivery → Child                       │
│  VaccinationSchedule │ Vaccination │ VaccinationReminder    │
├─────────────────────────────────────────────────────────────┤
│  7. FACTURATION & PAIEMENTS (6)                             │
│  InsuranceCompany → PatientInsurance                        │
│  Invoice → InvoiceItem                                      │
│  Payment (Mobile Money: Orange/MTN/Celcom)                  │
├─────────────────────────────────────────────────────────────┤
│  8. TELECONSULTATION (3)                                    │
│  Teleconsultation │ SecureMessage │ SharedDocument           │
├─────────────────────────────────────────────────────────────┤
│  9. DASHBOARD SANTE (3)                                     │
│  CustomDashboard → DashboardWidget │ HealthKPI              │
├─────────────────────────────────────────────────────────────┤
│  10. ALERTES SANTE PUBLIQUE (5)                             │
│  EpidemiologicalAlert │ HealthAnomaly                       │
│  HealthReport → HealthReportItem │ DiseaseSurveillance      │
├─────────────────────────────────────────────────────────────┤
│  SYSTEM CONFIG (2)                                          │
│  SystemConfig │ Notification                                │
└─────────────────────────────────────────────────────────────┘
```

### Diagramme Entité-Relation (extrait)

```
Establishment (1) ──── (N) Department (1) ──── (N) Room (1) ──── (N) Bed
      │                                                         │
      │ (1:N)                                                   │ (1:N)
      ▼                                                         ▼
  Patient (1) ──── (N) Admission ◄──────────────────────────────┘
      │
      ├── (1:N) PatientAllergy
      ├── (1:N) PatientAntecedent
      ├── (1:N) MedicalDocument
      ├── (1:N) Appointment ──── User (doctor)
      ├── (1:N) Consultation ── User (doctor)
      │       ├── (1:N) Prescription → PrescriptionItem
      │       └── (1:N) ConsultationReport
      ├── (1:N) LabRequest → LabRequestItem → LabResult
      ├── (1:N) EmergencyCase → TriageAssessment
      ├── (1:N) PregnancyTracking → PregnancyVisit
      │       └── (1:N) Delivery → Child
      ├── (1:N) Invoice → InvoiceItem
      │       └── (1:N) Payment
      ├── (1:N) Teleconsultation
      └── (1:N) PatientInsurance → InsuranceCompany

User (1) ──── (N) UserRole ──── Role (1) ──── (N) RolePermission ──── Permission
      │
      ├── (1:N) UserEstablishment ──── Establishment
      └── (1:N) AuditLog
```

### Décisions de Design Clés

| Décision | Justification |
|----------|---------------|
| `String` pour les enums | Compatibilité SQLite en dev |
| JSON strings pour données flexibles | Constantes vitales, facteurs de risque |
| Indexation extensive | Performance sur les requêtes fréquentes |
| `Cascade Delete` sur dépendants | Intégrité référentielle |
| `SetNull` sur AuditLog | Conservation de la traçabilité |
| Unique constraints sur clés naturelles | Codes, numéros, policy numbers |
| `establishmentId` partout | Multi-tenancy par isolation |
| `isActive` soft delete | Conservation de l'historique |

---

## 5. Authentification & Autorisation

### Flux d'Authentification

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│  Verify  │────▶│  JWT     │────▶│  Access  │
│  Email + │     │  MFA     │     │  Token   │     │  Granted │
│  Password│     │  TOTP/   │     │  +Refresh│     │          │
│          │     │  SMS/    │     │  Token   │     │          │
│          │     │  Email   │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │
     ▼                ▼
┌──────────┐     ┌──────────┐
│  Failed  │     │  Backup  │
│  Lockout │     │  Codes   │
│  (5 min) │     │  (10)    │
└──────────┘     └──────────┘
```

### JWT Token Structure

```json
{
  "sub": "user_cuid_id",
  "email": "doctor@hospital.gn",
  "role": "DOCTOR",
  "establishmentId": "est_cuid_id",
  "permissions": ["patient:read", "patient:write", "lab:read", "lab:validate"],
  "iat": 1700000000,
  "exp": 1700003600
}
```

### Système RBAC (Role-Based Access Control)

```
Rôles Système (isSystem: true):
┌─────────────────┬───────────────────────────────────────────┐
│ Rôle            │ Permissions                               │
├─────────────────┼───────────────────────────────────────────┤
│ ADMIN           │ * (accès complet)                          │
│ DOCTOR          │ patient:*, consultation:*, lab:read,       │
│                 │ prescription:*, teleconsultation:*         │
│ NURSE           │ patient:read, consultation:read,          │
│                 │ triage:*, vaccination:*                    │
│ PHARMACIST      │ pharmacy:*, medication:*, stock:*         │
│ LAB_TECHNICIAN  │ lab:*, lab:validate (superviseur)         │
│ RECEPTIONIST    │ patient:read, appointment:*, billing:read │
│ BIOLOGIST       │ lab:*, lab:validate                       │
│ ACCOUNTANT      │ billing:*, payment:*, invoice:*           │
└─────────────────┴───────────────────────────────────────────┘

Permissions Format: module:action
  module: patients, appointments, lab, pharmacy, billing, etc.
  action: read, write, delete, validate, export, print
```

### MFA (Multi-Factor Authentication)

| Méthode | Description | Configuration |
|---------|-------------|---------------|
| **TOTP** | App d'authentification (Google Authenticator, Authy) | Secret chiffré dans `User.mfaSecret` |
| **SMS** | Code OTP par SMS | `User.mfaPhoneNumber` + SMS Gateway |
| **Email** | Code OTP par email | Via SMTP configuré |

### Politique de Sécurité des Mots de Passe

- Longueur minimale : 8 caractères
- Complexité : Majuscule + minuscule + chiffre + spécial
- Historique : 5 derniers mots de passe interdits
- Expiration : 90 jours
- Verrouillage : 5 tentatives échouées → 30 min de verrouillage

---

## 6. Multi-tenancy

### Stratégie d'Isolation

```
┌──────────────────────────────────────────────┐
│              Shared Database                  │
│  (Isolation par establishmentId)             │
│                                              │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Hôpital     │  │ Clinique    │           │
│  │ Donka       │  │ Pasteur     │           │
│  │ (est_001)   │  │ (est_002)   │           │
│  │             │  │             │           │
│  │ patients    │  │ patients    │           │
│  │ beds        │  │ beds        │           │
│  │ stock       │  │ stock       │           │
│  └─────────────┘  └─────────────┘           │
│                                              │
│  ┌─────────────┐  ┌─────────────┐           │
│  │ Centre de   │  │ Dispensaire │           │
│  │ Santé       │  │ Rural       │           │
│  │ (est_003)   │  │ (est_004)   │           │
│  └─────────────┘  └─────────────┘           │
└──────────────────────────────────────────────┘
```

### Hiérarchie d'Établissements

```
Establishment
├── type: HOSPITAL | CLINIC | HEALTH_CENTER | DISPENSARY
├── parentId: Établissement parent (optionnel)
├── children: Établissements enfants
└── Toutes les données sont filtrées par establishmentId
```

### Rôles Scopés par Établissement

```
User ─── UserRole ─── Role ─── establishmentId

Exemple:
- Dr. Diallo a le rôle DOCTOR à l'Hôpital Donka
- Dr. Diallo a le rôle CONSULTANT à la Clinique Pasteur
- Les permissions sont évaluées dans le contexte de l'établissement courant
```

---

## 7. Mesures de Sécurité

### Chiffrement

| Couche | Méthode | Détails |
|--------|---------|---------|
| **En transit** | TLS 1.3 | HTTPS obligatoire, HSTS |
| **Au repos (DB)** | AES-256 | Champs sensibles chiffrés |
| **Mots de passe** | bcrypt | Hash avec sel, coût 12 |
| **MFA Secrets** | AES-256-GCM | Chiffrés avec clé maître |
| **Backup Codes** | AES-256-GCM | Chiffrés avec clé maître |
| **Fichiers** | SSE-S3 | Chiffrement côté serveur MinIO |

### Audit Logging

```
AuditLog {
  userId          → Qui a effectué l'action
  action          → CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT | PRINT | EXPORT
  module          → patients | appointments | lab | pharmacy | billing | etc.
  entity          → Nom du modèle (Patient, Invoice, etc.)
  entityId        → ID de l'enregistrement
  establishmentId → Contexte établissement
  ipAddress       → Adresse IP source
  userAgent       → Navigateur/client
  oldValue        → État précédent (JSON)
  newValue        → Nouvel état (JSON)
  severity        → INFO | WARNING | CRITICAL
  createdAt       → Horodatage
}
```

### Conformité GDPR-Like

| Exigence | Implémentation |
|----------|----------------|
| **Droit d'accès** | API endpoint pour exporter toutes les données d'un patient |
| **Droit à l'effacement** | Anonymisation des données (pas suppression pour traçabilité médicale) |
| **Portabilité** | Export JSON/CSV des données patient |
| **Consentement** | Enregistrement du consentement dans le dossier patient |
| **Minimisation** | Collecte limitée aux données nécessaires |
| **Rétention** | Politique de rétention configurable par type de données |
| **Notification de violation** | Alertes automatiques en cas d'accès non autorisé détecté |
| **DPO** | Rôle Data Protection Officer dans le RBAC |

### Protection contre les attaques

| Attaque | Protection |
|---------|------------|
| **SQL Injection** | Prisma ORM (requêtes paramétrées) |
| **XSS** | React (échappement automatique), CSP Headers |
| **CSRF** | SameSite cookies, tokens CSRF |
| **Brute Force** | Verrouillage après 5 tentatives, rate limiting |
| **DDoS** | Rate limiting API, Cloudflare (prod) |
| **Privilege Escalation** | RBAC strict, vérification côté serveur |

---

## 8. Architecture de Déploiement

### Docker Compose (Production)

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Network                         │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  NGINX   │  │ Next.js  │  │PostgreSQL│              │
│  │  (443)   │──│ (3000)   │──│ (5432)   │              │
│  │  SSL     │  │ SSR + API│  │  Data    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│       │              │                                   │
│       │        ┌─────┼─────┐                            │
│       │        ▼     ▼     ▼                            │
│       │  ┌────────┐┌────────┐┌────────┐                │
│       │  │ MinIO  ││Superset││ Redis  │                │
│       │  │(9000)  ││(8088)  ││(6379)  │                │
│       │  │Stockage││Analyse ││Cache   │                │
│       │  └────────┘└────────┘└────────┘                │
│       │                                                  │
│  ┌────▼─────┐                                           │
│  │Prometheus│                                           │
│  │ +Grafana │                                           │
│  │(9090)    │                                           │
│  └──────────┘                                           │
└──────────────────────────────────────────────────────────┘
```

### Kubernetes

```
┌─────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                       │
│                                                          │
│  Namespace: healthflow-prod                              │
│  ┌────────────────────────────────────────────────┐     │
│  │                                                 │     │
│  │  ┌─────────────────┐  ┌─────────────────┐     │     │
│  │  │ Ingress         │  │ Cert-Manager     │     │     │
│  │  │ (NGINX)         │  │ (Let's Encrypt)  │     │     │
│  │  └────────┬────────┘  └─────────────────┘     │     │
│  │           │                                    │     │
│  │  ┌────────▼────────────────────────────┐      │     │
│  │  │ Service: nextjs-app                 │      │     │
│  │  │ Deployment: 3 replicas              │      │     │
│  │  │ HPA: 2-10 pods (CPU 70%)           │      │     │
│  │  └─────────────────────────────────────┘      │     │
│  │                                                │     │
│  │  ┌─────────────────┐  ┌─────────────────┐    │     │
│  │  │ PostgreSQL      │  │ MinIO           │    │     │
│  │  │ StatefulSet     │  │ StatefulSet     │    │     │
│  │  │ PVC: 50Gi       │  │ PVC: 100Gi      │    │     │
│  │  └─────────────────┘  └─────────────────┘    │     │
│  │                                                │     │
│  │  ┌─────────────────────────────────────┐      │     │
│  │  │ Secrets:                            │      │     │
│  │  │ - db-credentials                    │      │     │
│  │  │ - jwt-secret                        │      │     │
│  │  │ - minio-credentials                 │      │     │
│  │  │ - smtp-credentials                  │      │     │
│  │  │ - sms-gateway-api-key               │      │     │
│  │  └─────────────────────────────────────┘      │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Monitoring & Observabilité

### Stack de Monitoring

```
┌────────────────────────────────────────────────┐
│               Observabilité                     │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Prometheus  │  │   Grafana    │            │
│  │  Métriques   │──│  Dashboards  │            │
│  │  (15s scrape)│  │  Alertes     │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Sentry     │  │  Winston     │            │
│  │  Erreurs     │  │  Logs        │            │
│  │  Performance  │  │  Structurés  │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Uptime      │  │  Health      │            │
│  │  Robot       │  │  Checks      │            │
│  │  (5 min)     │  │  /api/health │            │
│  └──────────────┘  └──────────────┘            │
└────────────────────────────────────────────────┘
```

### Métriques Clés

| Catégorie | Métrique | Seuil d'Alerte |
|-----------|----------|----------------|
| **Performance** | Temps de réponse API (p95) | > 500ms |
| **Performance** | Temps de rendu page (FCP) | > 2s |
| **Disponibilité** | Uptime | < 99.5% |
| **Erreurs** | Taux d'erreur API | > 1% |
| **Base de données** | Connexions actives | > 80% pool |
| **Base de données** | Temps de requête lent | > 1s |
| **Business** | Rendez-vous ratés | > 5% |
| **Business** | Alertes stock critique | > 0 non traitées |

### Health Check Endpoint

```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2026-03-04T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "minio": "connected",
    "superset": "connected"
  },
  "uptime": 86400
}
```

---

## 10. Flux de Données

### Flux Patient — Du RDV au Paiement

```
[1] Prise de RDV          [2] Consultation           [3] Ordonnance
┌──────────────┐          ┌──────────────┐           ┌──────────────┐
│ Appointment  │─────────▶│ Consultation │──────────▶│ Prescription │
│ SCHEDULED    │          │ IN_PROGRESS  │           │ ACTIVE       │
│ → CONFIRMED  │          │ → COMPLETED  │           │ → COMPLETED  │
└──────────────┘          └──────┬───────┘           └──────┬───────┘
                                 │                          │
                    ┌────────────┼────────────┐             │
                    ▼            ▼            ▼             ▼
              ┌──────────┐┌──────────┐┌──────────┐   ┌──────────┐
              │Lab Request││Billing   ││Emergency │   │Pharmacy  │
              │→ Results ││→ Invoice ││(si urgent)│   │Dispensing│
              └──────────┘└────┬─────┘└──────────┘   └──────────┘
                                │
                          ┌─────▼──────┐
                          │  Payment   │
                          │  Mobile $  │
                          │  Cash      │
                          │  Insurance │
                          └────────────┘
```

### Flux Urgences — Triage 5 Couleurs

```
[Arrivée Patient]
       │
       ▼
┌──────────────┐     ┌─────────────────────────────────────────┐
│ Triage       │     │ Classification du Triage                 │
│ Assessment   │     │                                          │
│              │     │  🔴 ROUGE  → Absolu    (immédiat)       │
│ AVPU Scale   │     │  🟠 ORANGE → Urgent   (< 15 min)       │
│ Vitals       │────▶│  🟡 JAUNE  → Semi-urgent (< 60 min)    │
│ Pain Level   │     │  🟢 VERT   → Moins urgent (< 120 min)  │
│ Chief Compl. │     │  🔵 BLEU   → Non urgent (< 240 min)    │
└──────────────┘     └─────────────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ File d'attente│────▶│  Traitement  │────▶│  Orientation │
│ priorisée     │     │  Médecin     │     │  Domicile    │
│ par triage    │     │              │     │  Hospitalis. │
│               │     │              │     │  Transfert   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Flux Vaccination — Calendrier Guinéen

```
[Nouveau-né]
     │
     ▼
┌──────────────────────────────────────────────────┐
│ Calendrier Vaccinal Guinéen                       │
│                                                   │
│ Naissance  → BCG + VPO0                          │
│ 6 semaines → DTC1 + VPO1 + Hib1 + Rotavirus1    │
│ 10 semaines→ DTC2 + VPO2 + Hib2 + Rotavirus2    │
│ 14 semaines→ DTC3 + VPO3 + Hib3                 │
│ 9 mois     → Rougeole1 + Fièvre Jaune            │
│ 15 mois    → Rougeole2                           │
│ 18 mois    → Rappel DTC + VPO4                   │
│ 5 ans      → Rappel DTC + VPO5                   │
└──────────────────────────────────────────────────┘
     │
     ▼
┌──────────────┐     ┌──────────────┐
│ Vaccination  │────▶│  Rappel      │
│ Record       │     │  SMS/Email   │
│ (lot, date)  │     │  Automatique │
└──────────────┘     └──────────────┘
```

---

## 11. Points d'Intégration

### Apache Superset — Analytics Avancés

```
┌──────────────┐          ┌──────────────┐
│  PostgreSQL  │─────────▶│  Superset    │
│  (lecture)   │  SQL     │  Dashboards  │
│              │ Alchemy  │  Rapports    │
└──────────────┘          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │  Embed       │
                          │  Iframe      │
                          │  in App      │
                          └──────────────┘

Configuration: docker/superset/superset_config.py
- Connexion PostgreSQL en lecture seule
- Dashboards prédéfinis par module
- Rôles Superset mappés aux rôles HealthFlow
- Rafraîchissement automatique des données
```

### MinIO — Stockage de Fichiers

```
┌──────────────┐          ┌──────────────┐
│  Upload API  │─────────▶│  MinIO       │
│  /api/upload │  S3 SDK  │  Buckets:    │
│              │          │  - documents  │
│              │          │  - avatars    │
│              │          │  - exports    │
│              │          │  - receipts   │
└──────────────┘          └──────────────┘

Cas d'usage:
- Documents médicaux (PDF, images DICOM)
- Photos de profil patients/utilisateurs
- Reçus de paiement PDF
- Rapports exportés
- Certificats numériques
```

### SMS Gateway — Notifications

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  HealthFlow  │─────────▶│  SMS Gateway │─────────▶│  Orange /    │
│  Backend     │  REST API│  (Middleware) │  SMPP    │  MTN /       │
│              │          │              │          │  Celcom      │
└──────────────┘          └──────────────┘          └──────────────┘

Types de notifications SMS:
- Rappel de rendez-vous (24h avant)
- Rappel de vaccination (7j et 1j avant)
- Code OTP pour MFA
- Alerte de résultat labo disponible
- Confirmation de paiement
- Alerte de rupture de stock (pharmacien)
```

### Intégrations Futures (Roadmap)

| Intégration | Statut | Description |
|-------------|--------|-------------|
| **DHIS2** | Planifié | Synchronisation avec le système national guinéen |
| **OpenMRS** | Planifié | Interopérabilité avec d'autres SIH |
| **HL7 FHIR** | Planifié | Standard d'échange de données de santé |
| **WHO IWOS** | Planifié | Notification internationale des maladies |
| **Orange Money API** | En cours | Paiement Mobile Money direct |
| **MTN Mobile Money** | En cours | Paiement Mobile Money direct |
| **WhatsApp Business** | Planifié | Notifications et chatbot patient |

---

<div align="center">

**DataSphere Innovation** — Conakry, Guinée 🇬🇳

*Architecture conçue pour la résilience, la sécurité et l'extensibilité*

</div>
