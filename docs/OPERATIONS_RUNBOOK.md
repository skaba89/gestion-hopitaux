# HealthFlow Guinea - Operations Runbook

## Objectif
Documenter les procédures d’exploitation pour maintenir HealthFlow en production hospitalière.

---

# 1. Surveillance quotidienne

## À vérifier chaque matin
- Statut application
- Statut base PostgreSQL
- Statut Redis
- Espace disque
- Sauvegardes de la veille
- Erreurs API critiques
- Alertes sécurité
- Saturation urgences

---

# 2. Incident application

## Symptômes
- Application inaccessible
- Erreurs 5xx
- Latence élevée

## Actions
1. Vérifier les logs applicatifs
2. Vérifier l’état PostgreSQL
3. Vérifier Redis
4. Redémarrer le service applicatif si nécessaire
5. Escalader si l’incident dépasse 15 minutes

---

# 3. Incident base de données

## Symptômes
- Connexions refusées
- Requêtes lentes
- Erreurs Prisma

## Actions
1. Vérifier CPU, mémoire, disque
2. Vérifier connexions actives
3. Vérifier locks PostgreSQL
4. Lancer sauvegarde manuelle si risque élevé
5. Basculer vers procédure PRA si indisponibilité prolongée

---

# 4. Incident sécurité

## Symptômes
- Tentatives login massives
- Accès non autorisé
- Export massif suspect
- Modification rôles critique

## Actions
1. Geler le compte suspect
2. Exporter les audit logs
3. Informer l’administrateur sécurité
4. Rotation des secrets si nécessaire
5. Rapport incident

---

# 5. Incident métier critique

## Exemples
- Saturation urgences
- Rupture médicaments critiques
- Alertes patient critique
- Occupation lits > 95%

## Actions
1. Notifier responsable médical
2. Confirmer l’alerte dans le dashboard
3. Déclencher plan opérationnel
4. Journaliser l’action dans l’audit

---

# 6. Escalade

## Niveau 1
Support applicatif local

## Niveau 2
Administrateur plateforme

## Niveau 3
Équipe DevOps / CTO

## Niveau 4
Direction établissement / Ministère Santé

---

# Objectif production
Garantir une plateforme exploitable, traçable et réactive pour hôpitaux et supervision nationale.
