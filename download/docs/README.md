<div align="center">

# 🏥 HealthFlow Guinea

### Système d'Information Hospitalier de Nouvelle Génération

**La plateforme santé numérique conçue pour les établissements de santé guinéens**

[![Version](https://img.shields.io/badge/version-1.0.0-teal?style=for-the-badge&logo=semver)](https://github.com/datasphere-gn/healthflow-guinea)
[![Licence](https://img.shields.io/badge/licence-MIT-green?style=for-the-badge)](./LICENSE)
[![Statut](https://img.shields.io/badge/statut-Production-emerald?style=for-the-badge&logo=vercel)](https://healthflow.datasphere-gn.com)
[![Made in Guinea](https://img.shields.io/badge/Made%20in-Guinea%20🇬🇳-red?style=for-the-badge)](https://datasphere-gn.com)

---

> *« Le futur de la santé en Guinée commence ici »*

</div>

---

## 📋 À propos

**HealthFlow Guinea** est un Système d'Information Hospitalier (SIH) complet développé par **DataSphere Innovation**, une startup HealthTech guinéenne. Conçu spécifiquement pour le contexte des établissements de santé en Guinée, il couvre l'ensemble du parcours patient — de l'admission aux urgences jusqu'au suivi vaccinal — tout en respectant les standards internationaux de sécurité et de confidentialité des données de santé.

La plateforme offre une architecture multi-établissements, un système RBAC avancé avec MFA, un triage aux urgences conforme au système français à 5 couleurs, un programme de vaccination adapté au calendrier guinéen, et une intégration Mobile Money (Orange, MTN, Celcom) pour les paiements.

---

## ✨ Fonctionnalités clés — 10 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Gestion Patients** | Dossiers patients complets avec QR code, allergies, antécédents, documents médicaux, contacts d'urgence |
| 2 | **Rendez-vous & Consultations** | Agendas médicaux, prise de RDV, consultations avec constantes vitales, ordonnances, certificats |
| 3 | **Laboratoire** | Catalogue d'analyses, demandes avec priorité (STAT/URGENT/ROUTINE), résultats avec validation biologiste |
| 4 | **Pharmacie & Stock** | Catalogue médicaments avec DCI, gestion des stocks par lot, alertes de pénurie, suivi des expirations |
| 5 | **Hospitalisation & Urgences** | Admissions, suivi des lits, triage 5 couleurs (ROUGE/ORANGE/JAUNE/VERT/BLEU), file de priorité |
| 6 | **Maternité & Vaccination** | Suivi de grossesse avec évaluation des risques, accouchements, calendrier vaccinal guinéen (BCG, DTC, VPO…) |
| 7 | **Facturation & Paiements** | Factures, assurance maladie, paiements Mobile Money (Orange/MTN/Celcom), reçus PDF |
| 8 | **Téléconsultation** | Consultations vidéo/audio/chat, messagerie sécurisée, partage de documents chiffrés |
| 9 | **Dashboard Santé** | Tableaux de bord personnalisables, KPI en temps réel, widgets reconfigurables, indicateurs de santé |
| 10 | **Alertes Santé Publique** | Surveillance épidémiologique, détection d'anomalies, maladies à déclaration obligatoire, signalement OMS |

---

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **UI Components** | shadcn/ui (New York), Lucide Icons, Framer Motion |
| **Visualisations** | Recharts, Apache Superset (analytics avancés) |
| **Backend** | Next.js API Routes, TypeScript, Prisma ORM |
| **Base de données** | PostgreSQL 16 (prod) / SQLite (dev) |
| **Authentification** | NextAuth.js v4, JWT, RBAC, MFA (TOTP/SMS/Email) |
| **State Management** | Zustand (client), TanStack Query (server) |
| **Stockage fichiers** | MinIO (S3-compatible) |
| **Notifications** | SMS Gateway (Orange/MTN), Email (SMTP) |
| **DevOps** | Docker, Docker Compose, Kubernetes, GitHub Actions |
| **Monitoring** | Prometheus, Grafana, Sentry |

---

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/datasphere-gn/healthflow-guinea.git
cd healthflow-guinea

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DB, JWT_SECRET, etc.)

# 3. Lancer tous les services
docker compose up -d

# 4. Accéder à l'application
# Frontend : http://localhost:3000
# API : http://localhost:3000/api
# Superset : http://localhost:8088
# MinIO : http://localhost:9001
```

### Développement Local

```bash
# 1. Cloner le dépôt
git clone https://github.com/datasphere-gn/healthflow-guinea.git
cd healthflow-guinea

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env — DATABASE_URL, JWT_SECRET, etc.

# 4. Initialiser la base de données
bun run db:push

# 5. Lancer le serveur de développement
bun run dev

# 6. Ouvrir dans le navigateur
# http://localhost:3000
```

---

## 📁 Structure du Projet

```
healthflow-guinea/
├── prisma/
│   └── schema.prisma          # Schéma Prisma — 63 modèles
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (17 endpoints)
│   │   │   ├── patients/      # Gestion patients
│   │   │   ├── appointments/  # Rendez-vous
│   │   │   ├── consultations/ # Consultations
│   │   │   ├── laboratory/    # Laboratoire
│   │   │   ├── pharmacy/      # Pharmacie & Stock
│   │   │   ├── hospitalizations/ # Hospitalisations
│   │   │   ├── emergencies/   # Urgences
│   │   │   ├── maternity/     # Maternité
│   │   │   ├── vaccinations/  # Vaccinations
│   │   │   ├── billing/       # Facturation
│   │   │   ├── payments/      # Paiements
│   │   │   ├── teleconsultation/ # Téléconsultation
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── alerts/        # Alertes santé
│   │   │   ├── establishments/ # Établissements
│   │   │   └── users/         # Utilisateurs
│   │   ├── page.tsx           # Page d'accueil
│   │   └── layout.tsx         # Layout racine
│   ├── components/
│   │   ├── app/               # Composants application
│   │   │   ├── app-shell.tsx  # Shell principal (Sidebar + Header)
│   │   │   └── modules/      # Pages des 15 modules
│   │   ├── landing/           # Landing page premium
│   │   └── ui/                # Composants shadcn/ui
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/
│   │   ├── db.ts             # Client Prisma
│   │   ├── api-utils.ts      # Utilitaires API
│   │   └── store.ts          # Store Zustand
│   └── types/                 # Types TypeScript
├── docker/
│   ├── Dockerfile.frontend    # Image frontend
│   ├── Dockerfile.backend     # Image backend
│   ├── docker-compose.yml     # Production
│   ├── docker-compose.dev.yml # Développement
│   ├── nginx/nginx.conf       # Reverse proxy
│   ├── superset/              # Config Superset
│   └── k8s/                   # Manifests Kubernetes
├── docs/                      # Documentation
│   ├── README.md              # Ce fichier
│   ├── ARCHITECTURE.md        # Architecture système
│   ├── INSTALLATION.md        # Guide d'installation
│   ├── API.md                 # Documentation API
│   └── DATASPHERE-PORTFOLIO.md # Portfolio DataSphere
└── package.json
```

---

## 📸 Captures d'écran

> *Les captures d'écran seront ajoutées prochainement*

| | | |
|---|---|---|
| **Landing Page** | **Dashboard** | **Gestion Patients** |
| *[Placeholder]* | *[Placeholder]* | *[Placeholder]* |
| **Laboratoire** | **Pharmacie** | **Urgences** |
| *[Placeholder]* | *[Placeholder]* | *[Placeholder]* |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture Système](./ARCHITECTURE.md) | Architecture complète, design base de données, auth, sécurité |
| [Guide d'Installation](./INSTALLATION.md) | Installation dev, Docker, Kubernetes, troubleshooting |
| [API Reference](./API.md) | Documentation complète de l'API REST (17 endpoints) |
| [Portfolio DataSphere](./DATASPHERE-PORTFOLIO.md) | Présentation de DataSphere Innovation |

---

## 🏗 Architecture

Pour une vue détaillée de l'architecture système, consultez [ARCHITECTURE.md](./ARCHITECTURE.md).

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  Next.js 16  │     │  API Routes  │     │  Prisma ORM  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                   ┌────────┼────────┐
                   ▼        ▼        ▼
              ┌────────┐┌────────┐┌────────┐
              │ MinIO  ││Superset││  SMS   │
              │ Stockage││Analytics││Gateway │
              └────────┘└────────┘└────────┘
```

---

## 🤝 Contribuer

Nous accueillons les contributions de la communauté ! Pour contribuer :

1. **Fork** le dépôt
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Committer** les changements (`git commit -m 'feat: ajout nouvelle fonctionnalité'`)
4. **Pousser** la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Conventions

- **Commits** : Conventionnal Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Code** : TypeScript strict, ESLint + Prettier
- **Branches** : `main` (prod), `develop` (staging), `feature/*`
- **Tests** : Tout nouveau code doit être couvert par des tests

### Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](./CODE_OF_CONDUCT.md).

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2026 DataSphere Innovation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Contact

**DataSphere Innovation** — Startup HealthTech Guinéenne

| Canal | Détails |
|-------|---------|
| 📧 Email | [info@datasphere-gn.com](mailto:info@datasphere-gn.com) |
| 🌐 Site Web | [datasphere-gn.com](https://datasphere-gn.com) |
| 📍 Adresse | Conakry, République de Guinée |
| 🐦 Twitter | [@DataSphereGN](https://twitter.com/DataSphereGN) |
| 💼 LinkedIn | [DataSphere Innovation](https://linkedin.com/company/datasphere-gn) |

---

<div align="center">

**Construit avec ❤️ en Guinée 🇬🇳**

*HealthFlow Guinea — Transformer la santé, un établissement à la fois.*

</div>
