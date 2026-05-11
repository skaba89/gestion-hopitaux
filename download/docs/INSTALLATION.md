# 📦 Guide d'Installation — HealthFlow Guinea

> Guide complet d'installation et de déploiement de HealthFlow Guinea

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Développement Local](#2-développement-local)
3. [Déploiement Docker](#3-déploiement-docker)
4. [Déploiement Kubernetes](#4-déploiement-kubernetes)
5. [Dépannage](#5-dépannage)

---

## 1. Prérequis

### Environnement de Développement

| Outil | Version Minimale | Recommandée | Installation |
|-------|-----------------|-------------|--------------|
| **Node.js** | 20.x | 20.x LTS | [nodejs.org](https://nodejs.org) |
| **Bun** | 1.0+ | Dernière | `curl -fsSL https://bun.sh/install \| bash` |
| **Docker** | 24.x | Dernière | [docker.com](https://docker.com) |
| **Docker Compose** | 2.20+ | Dernière | Inclus avec Docker Desktop |
| **PostgreSQL** | 16.x | 16.x | [postgresql.org](https://postgresql.org) |
| **Git** | 2.40+ | Dernière | [git-scm.com](https://git-scm.com) |

### Environnement de Production

| Outil | Version | Notes |
|-------|---------|-------|
| **Docker** | 24.x+ | Obligatoire |
| **Kubernetes** | 1.28+ | Optionnel, pour orchestration |
| **NGINX** | 1.25+ | Reverse proxy + SSL |
| **Certbot** | Dernière | Certificats Let's Encrypt |
| **PostgreSQL** | 16.x | Base de données principale |
| **MinIO** | Dernière | Stockage fichiers S3-compatible |

### Vérification des Prérequis

```bash
# Vérifier les versions installées
node --version      # v20.x+
bun --version       # 1.x+
docker --version    # 24.x+
docker compose version  # 2.20+
psql --version      # 16.x+
git --version       # 2.40+
```

---

## 2. Développement Local

### Étape 1 : Cloner le Dépôt

```bash
# Cloner depuis GitHub
git clone https://github.com/datasphere-gn/healthflow-guinea.git
cd healthflow-guinea

# Ou avec SSH
git clone git@github.com:datasphere-gn/healthflow-guinea.git
cd healthflow-guinea
```

### Étape 2 : Installer les Dépendances

```bash
# Installer toutes les dépendances avec Bun
bun install

# Vérifier l'installation
bun run lint
```

### Étape 3 : Configurer l'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Éditer le fichier `.env` avec vos valeurs :

```env
# ═══════════════════════════════════════════════
# BASE DE DONNÉES
# ═══════════════════════════════════════════════
# Développement (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
# DATABASE_URL="postgresql://healthflow:password@localhost:5432/healthflow?schema=public"

# ═══════════════════════════════════════════════
# AUTHENTIFICATION
# ═══════════════════════════════════════════════
JWT_SECRET="votre-secret-jwt-tres-securise-minimum-32-caracteres"
NEXTAUTH_SECRET="votre-secret-nextauth-tres-securise"
NEXTAUTH_URL="http://localhost:3000"

# ═══════════════════════════════════════════════
# STOCKAGE FICHIERS (MinIO)
# ═══════════════════════════════════════════════
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="healthflow"
MINIO_USE_SSL="false"

# ═══════════════════════════════════════════════
# SMS GATEWAY
# ═══════════════════════════════════════════════
SMS_GATEWAY_URL="https://api.sms-gateway.gn"
SMS_GATEWAY_API_KEY="votre-cle-api-sms"
SMS_GATEWAY_SENDER="HealthFlow"

# ═══════════════════════════════════════════════
# EMAIL (SMTP)
# ═══════════════════════════════════════════════
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-app"

# ═══════════════════════════════════════════════
# SUPERSET
# ═══════════════════════════════════════════════
SUPERSET_URL="http://localhost:8088"
SUPERSET_API_KEY="votre-cle-api-superset"

# ═══════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="HealthFlow Guinea"
NODE_ENV="development"
```

### Étape 4 : Initialiser la Base de Données

```bash
# Générer le client Prisma
bun run db:generate

# Pousser le schéma vers la base de données
bun run db:push

# (Optionnel) Remplir avec des données de démon
# bun run db:seed
```

### Étape 5 : Lancer le Serveur de Développement

```bash
# Lancer en mode développement
bun run dev

# L'application est accessible sur :
# http://localhost:3000
```

### Scripts Disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| **Dev** | `bun run dev` | Serveur de développement avec hot reload |
| **Build** | `bun run build` | Build de production |
| **Start** | `bun run start` | Lancer le build de production |
| **Lint** | `bun run lint` | Vérification ESLint |
| **DB Push** | `bun run db:push` | Synchroniser le schéma Prisma |
| **DB Generate** | `bun run db:generate` | Générer le client Prisma |
| **DB Migrate** | `bun run db:migrate` | Créer et appliquer une migration |
| **DB Reset** | `bun run db:reset` | Réinitialiser la base de données |

---

## 3. Déploiement Docker

### Docker Compose Production

Le fichier `docker/docker-compose.yml` contient tous les services nécessaires :

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  # ─── Application Next.js ─────────────────────────
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile.frontend
    container_name: healthflow-app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://healthflow:${DB_PASSWORD}@postgres:5432/healthflow
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://${DOMAIN}
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - healthflow-network

  # ─── PostgreSQL ───────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: healthflow-postgres
    environment:
      POSTGRES_DB: healthflow
      POSTGRES_USER: healthflow
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U healthflow"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - healthflow-network

  # ─── MinIO (Stockage S3-compatible) ──────────────
  minio:
    image: minio/minio:latest
    container_name: healthflow-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - healthflow-network

  # ─── Apache Superset (Analytics) ─────────────────
  superset:
    image: apache/superset:latest
    container_name: healthflow-superset
    environment:
      - SUPERSET_SECRET_KEY=${SUPERSET_SECRET_KEY}
      - DATABASE_URI=postgresql://superset:${DB_PASSWORD}@postgres:5432/superset
    volumes:
      - ./superset/superset_config.py:/app/pythonpath/superset_config.py
      - superset-data:/app/superset_home
    ports:
      - "8088:8088"
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - healthflow-network

  # ─── NGINX (Reverse Proxy + SSL) ─────────────────
  nginx:
    image: nginx:alpine
    container_name: healthflow-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot-data:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - healthflow-network

volumes:
  postgres-data:
  minio-data:
  superset-data:
  certbot-data:

networks:
  healthflow-network:
    driver: bridge
```

### Déploiement Étape par Étape

```bash
# 1. Se placer dans le dossier docker
cd docker

# 2. Créer le fichier .env de production
cp .env.example .env.production

# 3. Éditer les variables de production
# IMPORTANT : Changer tous les mots de passe et secrets !
nano .env.production

# 4. Lancer tous les services
docker compose --env-file .env.production up -d

# 5. Vérifier que tous les services sont actifs
docker compose ps

# 6. Voir les logs
docker compose logs -f app

# 7. Initialiser la base de données (première fois uniquement)
docker compose exec app bun run db:push
```

### Configuration SSL avec Let's Encrypt

```bash
# 1. Installer Certbot
apt-get update && apt-get install -y certbot

# 2. Obtenir un certificat
certbot certonly --standalone -d healthflow.votredomaine.gn

# 3. Les certificats sont dans /etc/letsencrypt/live/healthflow.votredomaine.gn/

# 4. Configurer le renouvellement automatique
echo "0 0 1 * * certbot renew --quiet && docker compose restart nginx" | crontab -
```

### Configuration NGINX

Le fichier `docker/nginx/nginx.conf` doit inclure :

```nginx
server {
    listen 443 ssl http2;
    server_name healthflow.votredomaine.gn;

    ssl_certificate /etc/letsencrypt/live/healthflow.votredomaine.gn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/healthflow.votredomaine.gn/privkey.pem;

    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy vers Next.js
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Limite de taille pour les uploads
    client_max_body_size 50M;
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name healthflow.votredomaine.gn;
    return 301 https://$server_name$request_uri;
}
```

### Stratégie de Sauvegarde

```bash
#!/bin/bash
# backup.sh — Script de sauvegarde quotidienne

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/healthflow"

# 1. Sauvegarder PostgreSQL
docker compose exec -T postgres pg_dump -U healthflow healthflow \
  | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# 2. Sauvegarder MinIO
docker compose exec minio mc mirror local/healthflow \
  "$BACKUP_DIR/minio_$DATE/"

# 3. Sauvegarder la configuration
tar czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  .env.production nginx/ superset/

# 4. Nettoyer les sauvegardes de plus de 30 jours
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "✅ Sauvegarde terminée : $DATE"
```

```bash
# Programmer la sauvegarde quotidienne à 2h du matin
echo "0 2 * * * /path/to/backup.sh >> /var/log/healthflow-backup.log 2>&1" | crontab -
```

---

## 4. Déploiement Kubernetes

### Namespace et Prérequis

```bash
# Créer le namespace
kubectl create namespace healthflow-prod

# Définir le namespace par défaut
kubectl config set-context --current --namespace=healthflow-prod
```

### Secrets Management

```bash
# Créer les secrets Kubernetes
kubectl create secret generic healthflow-secrets \
  --from-literal=DATABASE_URL='postgresql://healthflow:PASSWORD@postgres-svc:5432/healthflow' \
  --from-literal=JWT_SECRET='votre-secret-jwt-32-caracteres' \
  --from-literal=NEXTAUTH_SECRET='votre-secret-nextauth' \
  --from-literal=MINIO_ACCESS_KEY='minio-access-key' \
  --from-literal=MINIO_SECRET_KEY='minio-secret-key' \
  --from-literal=DB_PASSWORD='mot-de-passe-postgres-securise' \
  -n healthflow-prod
```

### Manifests Kubernetes

Les manifests se trouvent dans `docker/k8s/` :

#### Deployment (`docker/k8s/deployment.yml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthflow-app
  namespace: healthflow-prod
  labels:
    app: healthflow
    component: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: healthflow
      component: frontend
  template:
    metadata:
      labels:
        app: healthflow
        component: frontend
    spec:
      containers:
        - name: healthflow-app
          image: dataspheregn/healthflow-guinea:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
          envFrom:
            - secretRef:
                name: healthflow-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: healthflow-svc
  namespace: healthflow-prod
spec:
  selector:
    app: healthflow
    component: frontend
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

#### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: healthflow-hpa
  namespace: healthflow-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: healthflow-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: healthflow-ingress
  namespace: healthflow-prod
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - healthflow.votredomaine.gn
      secretName: healthflow-tls
  rules:
    - host: healthflow.votredomaine.gn
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: healthflow-svc
                port:
                  number: 80
```

### PostgreSQL StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: healthflow-prod
spec:
  serviceName: postgres-svc
  replicas: 1
  selector:
    matchLabels:
      app: healthflow
      component: database
  template:
    metadata:
      labels:
        app: healthflow
        component: database
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: healthflow
            - name: POSTGRES_USER
              value: healthflow
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: healthflow-secrets
                  key: DB_PASSWORD
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
```

### Déploiement Kubernetes Étape par Étape

```bash
# 1. Appliquer les manifests dans l'ordre
kubectl apply -f docker/k8s/namespace.yml
kubectl apply -f docker/k8s/secrets.yml
kubectl apply -f docker/k8s/postgres-statefulset.yml
kubectl apply -f docker/k8s/deployment.yml
kubectl apply -f docker/k8s/hpa.yml
kubectl apply -f docker/k8s/ingress.yml

# 2. Vérifier le déploiement
kubectl get pods -n healthflow-prod
kubectl get svc -n healthflow-prod
kubectl get ingress -n healthflow-prod

# 3. Vérifier les logs
kubectl logs -f deployment/healthflow-app -n healthflow-prod

# 4. Scale manuellement si nécessaire
kubectl scale deployment healthflow-app --replicas=5 -n healthflow-prod

# 5. Rolling update (nouvelle version)
kubectl set image deployment/healthflow-app \
  healthflow-app=dataspheregn/healthflow-guinea:v1.1.0 \
  -n healthflow-prod

# 6. Rollback en cas de problème
kubectl rollout undo deployment/healthflow-app -n healthflow-prod
```

---

## 5. Dépannage

### Problèmes Courants

#### ❌ Erreur : `Cannot connect to database`

```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker compose ps postgres

# Vérifier les logs PostgreSQL
docker compose logs postgres

# Vérifier la connexion
docker compose exec postgres pg_isready -U healthflow

# Solution : Redémarrer PostgreSQL
docker compose restart postgres
```

#### ❌ Erreur : `Prisma Client is not initialized`

```bash
# Régénérer le client Prisma
bun run db:generate

# Vérifier le schéma
bunx prisma validate

# Repousser le schéma
bun run db:push
```

#### ❌ Erreur : `Port 3000 already in use`

```bash
# Trouver le processus utilisant le port
lsof -i :3000

# Tuer le processus
kill -9 $(lsof -t -i:3000)

# Ou utiliser un autre port
PORT=3001 bun run dev
```

#### ❌ Erreur : `Module not found` après git pull

```bash
# Réinstaller les dépendances
rm -rf node_modules
bun install

# Régénérer le client Prisma
bun run db:generate
```

#### ❌ Erreur : `Docker compose up` échoue

```bash
# Vérifier les logs détaillés
docker compose up --build

# Nettoyer les conteneurs et volumes
docker compose down -v

# Reconstruire sans cache
docker compose build --no-cache
docker compose up -d
```

#### ❌ Erreur : `SSL certificate verification failed`

```bash
# Vérifier les certificats
ls -la /etc/letsencrypt/live/healthflow.votredomaine.gn/

# Renouveler manuellement
certbot renew --force-renewal

# Redémarrer NGINX
docker compose restart nginx
```

#### ❌ Performance lente en développement

```bash
# Vérifier la taille de la base de données SQLite
ls -la prisma/dev.db

# Optimisation : Utiliser PostgreSQL en dev
# Changer DATABASE_URL dans .env
DATABASE_URL="postgresql://healthflow:password@localhost:5432/healthflow_dev"

# Désactiver le source map en dev
# Dans next.config.js :
# productionBrowserSourceMaps: false
```

#### ❌ Erreur : `MinIO connection refused`

```bash
# Vérifier que MinIO est actif
docker compose ps minio

# Vérifier la santé de MinIO
curl http://localhost:9000/minio/health/live

# Recréer le bucket
docker compose exec minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker compose exec minio mc mb local/healthflow
```

### Vérifications de Santé

```bash
# Vérifier tous les services
docker compose ps

# Vérifier les endpoints de santé
curl http://localhost:3000/api/health
curl http://localhost:9000/minio/health/live
curl http://localhost:8088/healthcheck

# Vérifier l'utilisation des ressources
docker stats --no-stream

# Vérifier l'espace disque
df -h
```

### Logs Utiles

```bash
# Logs de l'application
docker compose logs -f app

# Logs PostgreSQL
docker compose logs -f postgres

# Logs NGINX
docker compose logs -f nginx

# Logs MinIO
docker compose logs -f minio

# Tous les logs
docker compose logs -f
```

### Support

En cas de problème non résolu :

1. Consulter les [Issues GitHub](https://github.com/datasphere-gn/healthflow-guinea/issues)
2. Vérifier la [Documentation API](./API.md)
3. Contacter le support : [support@datasphere-gn.com](mailto:support@datasphere-gn.com)

---

<div align="center">

**DataSphere Innovation** — Conakry, Guinée 🇬🇳

*Installation simplifiée pour un déploiement robuste*

</div>
