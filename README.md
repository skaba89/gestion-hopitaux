# 🏥 HealthFlow Guinée — Système d'Information Hospitalier

<p align="center">
  <strong>Système de Gestion Hospitalière complet pour la République de Guinée</strong><br>
  Développé par <a href="mailto:contact@datasphere-gn.com">DataSphere Innovation</a> (Sekouna KABA)
</p>

---

## 🇬🇳 À propos

HealthFlow Guinée est un système d'information hospitalier (SIH) conçu pour les établissements de santé guinéens — hôpitaux, cliniques, centres de santé et dispensaires. Il couvre l'ensemble du parcours patient, de l'admission à la facturation, en passant par les consultations, le laboratoire, la pharmacie et la téléconsultation.

### Caractéristiques principales

- 🏥 **Multi-établissements** — Gestion de plusieurs hôpitaux/cliniques sur une seule plateforme
- 📱 **Notifications gratuites** — Telegram Bot (100% gratuit), WhatsApp, SMS
- 💰 **Mobile Money** — Orange Money + MTN MoMo intégrés
- 🔬 **Standards internationaux** — HL7 FHIR R4, DICOM/Orthanc, DHIS2
- 🌍 **5 langues** — Français, English, Malinké, Soussou, Poular
- 📴 **Mode hors-ligne** — PWA avec IndexedDB et synchronisation automatique
- 🔐 **Sécurité** — AES-256-GCM, RBAC, CSRF, audit logging 10 ans
- 📊 **Signalement sanitaire** — Intégration DHIS2 pour le Ministère de la Santé

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- PostgreSQL 17+
- Redis 8+ (optionnel, fallback en mémoire)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/datasphere-innovation/healthflow-guinea.git
cd healthflow-guinea

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Base de données
npx prisma migrate deploy
npx prisma db seed

# Démarrer en développement
npm run dev

# Ou en production
npm run build && npm start
```

### Docker

```bash
docker-compose up -d
```

---

## 📋 Modules fonctionnels

| Module | Description | Statut |
|--------|-------------|--------|
| **Patients** | Admission, dossier médical, QR code | ✅ |
| **Consultations** | Médecine générale, spécialités | ✅ |
| **Laboratoire** | Demandes, résultats, validations | ✅ |
| **Pharmacie** | Stock, dispensation, inventaire | ✅ |
| **Hospitalisation** | Lits, admissions, transferts | ✅ |
| **Urgences** | Triage, code couleur, réanimation | ✅ |
| **Maternité** | Grossesse, accouchements, CPN | ✅ |
| **Vaccination** | Calendrier, campagnes, rappels | ✅ |
| **Facturation** | Factures, Mobile Money, assurances | ✅ |
| **Télémédecine** | Téléconsultation, visio, messagerie | ✅ |
| **Pharmacovigilance** | Déclaration effets indésirables | ✅ |
| **Épidémiologie** | Alertes, DHIS2, mTrac | ✅ |
| **Imagerie (DICOM)** | Orthanc PACS, visualisation | ✅ |
| **Notifications** | Telegram, WhatsApp, SMS | ✅ |
| **Analytiques** | Tableaux de bord, rapports | ✅ |

---

## 🏗 Architecture technique

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│   Next.js 16 + React 19 + Tailwind + shadcn/ui  │
│              PWA + 5 langues (i18n)              │
├─────────────────────────────────────────────────┤
│                   Backend                        │
│        API Routes + Prisma ORM + Zod             │
│     Auth OTP + RBAC + Audit Logging              │
├─────────────────────────────────────────────────┤
│                Base de données                   │
│     PostgreSQL 17 (66 tables) + Redis 8          │
├─────────────────────────────────────────────────┤
│              Intégrations                        │
│  FHIR R4 │ DHIS2 │ Orthanc │ Orange │ MTN       │
│  Telegram │ WhatsApp │ SMS │ Mobile Money       │
├─────────────────────────────────────────────────┤
│             Infrastructure                      │
│     Docker + Caddy │ PWA Offline │ CI/CD        │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité

| Mesure | Implémentation |
|--------|---------------|
| Chiffrement au repos | AES-256-GCM |
| Chiffrement en transit | TLS 1.3 |
| Mots de passe | bcrypt (coût 12) |
| Authentification | OTP (crypto.randomInt) + Redis |
| Contrôle d'accès | RBAC — 8 rôles, 17 ressources |
| Filtrage données | Par établissement + niveau de sensibilité |
| Audit trail | 15 types d'événements, conservation 10 ans |
| Protection web | CSRF, CORS, CSP, rate limiting |
| Conformité | RGPD + Loi guinéenne L/2022/014/AN |

---

## 📱 Notifications (100% gratuit avec Telegram)

HealthFlow envoie des notifications via :
1. **Telegram Bot** — 100% gratuit, illimité, format riche HTML
2. **WhatsApp** — Gratuit pour les conversations patient-initiées
3. **SMS** — Via Orange (Guinée), Twilio, Vonage

Chaque patient peut enregistrer son numéro de téléphone auprès du bot Telegram
pour recevoir automatiquement : OTP, rappels de rendez-vous, résultats d'analyses,
rappels de vaccination et confirmations de paiement.

---

## 📄 Licence

Propriété de DataSphere Innovation. Tous droits réservés.

---

## 📞 Contact

- **DataSphere Innovation** — Conakry, Guinée
- **Email** : contact@datasphere-gn.com
- **DPO** : dpo@healthflow-gn.com
- **Telegram** : @DataSibot
