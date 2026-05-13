#!/bin/bash
# =============================================================================
# HealthFlow Guinea - Deployment Script
# DataSphere Innovation — Sekouna KABA
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║     HealthFlow Guinea - Deploy Script        ║"
echo "  ║     DataSphere Innovation                    ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Erreur: Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Erreur: Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Création du fichier .env depuis .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Veuillez éditer le fichier .env avec vos valeurs avant de continuer${NC}"
    echo -e "${YELLOW}  nano .env${NC}"
    exit 0
fi

# Parse arguments
MODE="${1:-production}"

case "$MODE" in
    dev|development)
        echo -e "${GREEN}🚀 Démarrage en mode DÉVELOPPEMENT...${NC}"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
        echo ""
        echo -e "${GREEN}✅ HealthFlow Guinea est démarré en mode développement${NC}"
        echo -e "  App:       http://localhost:3000"
        echo -e "  pgAdmin:   http://localhost:5050"
        echo -e "  Redis:     http://localhost:8081"
        echo -e "  PostgreSQL: localhost:5432"
        ;;
    prod|production)
        echo -e "${GREEN}🚀 Démarrage en mode PRODUCTION...${NC}"
        docker compose up --build -d
        echo ""
        echo -e "${GREEN}✅ HealthFlow Guinea est démarré en mode production${NC}"
        echo -e "  App:    http://localhost:3000"
        echo -e "  Nginx:  http://localhost:80"
        ;;
    stop)
        echo -e "${YELLOW}⏹ Arrêt des conteneurs...${NC}"
        docker compose -f docker-compose.yml -f docker-compose.dev.yml down 2>/dev/null || docker compose down
        echo -e "${GREEN}✅ Conteneurs arrêtés${NC}"
        ;;
    restart)
        echo -e "${YELLOW}🔄 Redémarrage...${NC}"
        docker compose restart
        echo -e "${GREEN}✅ Redémarré${NC}"
        ;;
    logs)
        docker compose logs -f ${2:-}
        ;;
    status)
        docker compose ps
        echo ""
        echo -e "${BLUE}Health check:${NC}"
        curl -s http://localhost:3000/api/health | python3 -m json.tool 2>/dev/null || echo -e "${RED}App non accessible${NC}"
        ;;
    build)
        echo -e "${GREEN}🔨 Build de l'image Docker...${NC}"
        docker compose build --no-cache
        echo -e "${GREEN}✅ Build terminé${NC}"
        ;;
    clean)
        echo -e "${YELLOW}🧹 Nettoyage complet...${NC}"
        docker compose down -v --rmi local 2>/dev/null
        echo -e "${GREEN}✅ Nettoyage terminé (volumes + images supprimés)${NC}"
        ;;
    *)
        echo -e "${BLUE}Usage: ./deploy.sh [command]${NC}"
        echo ""
        echo "  dev       Démarrer en mode développement (hot reload + outils)"
        echo "  prod      Démarrer en mode production"
        echo "  stop      Arrêter tous les conteneurs"
        echo "  restart   Redémarrer les conteneurs"
        echo "  logs      Voir les logs (optionnel: nom du service)"
        echo "  status    Vérifier le statut des services"
        echo "  build     Rebuilder les images (no cache)"
        echo "  clean     Supprimer conteneurs, volumes et images"
        ;;
esac
