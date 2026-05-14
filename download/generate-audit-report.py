#!/usr/bin/env python3
# HealthFlow Guinea - Audit End-to-End Complet
# Generate PDF Report via ReportLab

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import hashlib

# ── Palette ──
ACCENT       = colors.HexColor('#2222cf')
TEXT_PRIMARY  = colors.HexColor('#211f1e')
TEXT_MUTED    = colors.HexColor('#8d8881')
BG_SURFACE   = colors.HexColor('#e0dbd4')
BG_PAGE      = colors.HexColor('#eeedeb')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Fonts ──
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ── Styles ──
PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm
AVAILABLE_W = PAGE_W - 2 * MARGIN

styles = {}
styles['Title'] = ParagraphStyle(
    'Title', fontName='NotoSerifSC', fontSize=24, leading=32,
    textColor=ACCENT, alignment=TA_CENTER, spaceAfter=12
)
styles['H1'] = ParagraphStyle(
    'H1', fontName='NotoSerifSC', fontSize=18, leading=26,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10
)
styles['H2'] = ParagraphStyle(
    'H2', fontName='NotoSerifSC', fontSize=14, leading=20,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8
)
styles['H3'] = ParagraphStyle(
    'H3', fontName='NotoSerifSC', fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6
)
styles['Body'] = ParagraphStyle(
    'Body', fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK',
    spaceAfter=6, firstLineIndent=21
)
styles['BodyNoIndent'] = ParagraphStyle(
    'BodyNoIndent', fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK', spaceAfter=6
)
styles['Bullet'] = ParagraphStyle(
    'Bullet', fontName='NotoSerifSC', fontSize=10, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK',
    leftIndent=20, spaceAfter=3, bulletIndent=8
)
styles['TableCell'] = ParagraphStyle(
    'TableCell', fontName='NotoSerifSC', fontSize=9, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK'
)
styles['TableHeader'] = ParagraphStyle(
    'TableHeader', fontName='NotoSerifSC', fontSize=9.5, leading=14,
    textColor=colors.white, alignment=TA_CENTER, wordWrap='CJK'
)
styles['Caption'] = ParagraphStyle(
    'Caption', fontName='NotoSerifSC', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=6
)
styles['Critical'] = ParagraphStyle(
    'Critical', fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=colors.HexColor('#cc0000'), alignment=TA_LEFT, wordWrap='CJK',
    spaceAfter=4, leftIndent=12, borderPadding=4,
    backColor=colors.HexColor('#fff0f0')
)
styles['High'] = ParagraphStyle(
    'High', fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=colors.HexColor('#cc6600'), alignment=TA_LEFT, wordWrap='CJK',
    spaceAfter=4, leftIndent=12
)
styles['Medium'] = ParagraphStyle(
    'Medium', fontName='NotoSerifSC', fontSize=10.5, leading=18,
    textColor=colors.HexColor('#cc9900'), alignment=TA_LEFT, wordWrap='CJK',
    spaceAfter=4, leftIndent=12
)
styles['Info'] = ParagraphStyle(
    'Info', fontName='NotoSerifSC', fontSize=10, leading=17,
    textColor=TEXT_MUTED, alignment=TA_LEFT, wordWrap='CJK',
    spaceAfter=4, leftIndent=12
)

# ── TOC DocTemplate ──
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

H1_ORPHAN_THRESHOLD = (PAGE_H - 2 * MARGIN) * 0.15

def add_heading(text, style_name, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>' % key + text, styles[style_name])
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def add_major_section(text):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, 'H1', level=0),
    ]

def make_table(headers, rows, col_ratios=None):
    """Create a styled table with headers and rows."""
    hdr = [Paragraph('<b>%s</b>' % h, styles['TableHeader']) for h in headers]
    data = [hdr]
    for row in rows:
        data.append([Paragraph(str(c), styles['TableCell']) for c in row])
    
    n_cols = len(headers)
    if col_ratios:
        col_widths = [r * AVAILABLE_W for r in col_ratios]
    else:
        col_widths = [AVAILABLE_W / n_cols] * n_cols
    
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def severity_badge(sev):
    return {
        'CRITIQUE': '<font color="#cc0000"><b>CRITIQUE</b></font>',
        'HAUT': '<font color="#cc6600"><b>HAUT</b></font>',
        'MOYEN': '<font color="#cc9900"><b>MOYEN</b></font>',
        'BAS': '<font color="#666666"><b>BAS</b></font>',
        'INFO': '<font color="#999999"><b>INFO</b></font>',
    }.get(sev, sev)

# ── Build Document ──
OUTPUT = '/home/z/my-project/download/HealthFlow-Guinea-Audit-E2E.pdf'

doc = TocDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN,
    title='HealthFlow Guinea - Audit End-to-End',
    author='DataSphere Innovation',
    creator='Z.ai',
)

story = []

# ─── Table des matieres ───
story.append(Paragraph('<b>Table des Matieres</b>', styles['Title']))
story.append(Spacer(1, 12))

toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle('TOC1', fontName='NotoSerifSC', fontSize=12, leftIndent=20, leading=20, spaceBefore=6),
    ParagraphStyle('TOC2', fontName='NotoSerifSC', fontSize=10, leftIndent=40, leading=17, spaceBefore=3),
]
story.append(toc)
story.append(PageBreak())

# ════════════════════════════════════════════════════════════════
# 1. RESUME EXECUTIF
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('1. Resume Executif'))
story.append(Paragraph(
    "HealthFlow Guinea est un Systeme d'Information Hospitalier (SIH) developpe par DataSphere Innovation (Sekouna KABA), "
    "destine aux etablissements de sante de Guinee. L'application est construite sur Next.js 16.1.3 avec React 19, TypeScript, "
    "Tailwind CSS, shadcn/ui, et Prisma ORM connecte a PostgreSQL 17. L'audit end-to-end couvre l'infrastructure, la securite, "
    "les API, la base de donnees, le frontend et les integrations.", styles['Body']))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Synthese des resultats</b>', styles['H3']))
story.append(make_table(
    ['Domaine', 'Statut', 'Problemes critiques'],
    [
        ['Infrastructure', 'Fonctionnel', 'Secrets en dur, env.example obsolete'],
        ['API (55 routes)', 'A risque', '40+ routes sans auth, 40+ sans validation Zod'],
        ['Securite', 'A risque', 'JWT fallback divergent, RBAC non applique, CORS bypass'],
        ['Base de donnees', 'Fonctionnel', '42 relations sans onDelete, 0 enums Prisma'],
        ['Frontend', 'Partiel', 'Stores localStorage, pas de error boundaries, i18n incomplete'],
        ['Integrations', 'Partiel', 'Mode sandbox/demo uniquement, webhooks non verifies'],
        ['Build & Tests', 'Operationnel', 'Build OK, 352 tests passent'],
    ],
    [0.22, 0.18, 0.60]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 1 : Synthese des resultats par domaine', styles['Caption']))

story.append(Spacer(1, 10))
story.append(Paragraph('<b>Repartition des problemes par severite</b>', styles['H3']))
story.append(make_table(
    ['Severite', 'Nombre', 'Exemples cles'],
    [
        [severity_badge('CRITIQUE'), '3', 'JWT fallback, routes sans auth, pas de RBAC'],
        [severity_badge('HAUT'), '8', 'CORS bypass, validation manquante, ENCRYPTION_KEY placeholder'],
        [severity_badge('MOYEN'), '12', 'Rate limiting memoire, erreur leakage, stores localStorage'],
        [severity_badge('BAS'), '6', 'CSRF dev bypass, IV length, console.log残留'],
        [severity_badge('INFO'), '25', 'Bonne implementation OTP, bcryptjs, headers securite'],
    ],
    [0.15, 0.10, 0.75]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 2 : Repartition des problemes par severite', styles['Caption']))

# ════════════════════════════════════════════════════════════════
# 2. INFRASTRUCTURE
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('2. Infrastructure'))
story.append(add_heading('2.1 PostgreSQL', 'H2', 1))
story.append(Paragraph(
    "PostgreSQL 17 fonctionne correctement sur le port 5433 avec la base healthflow (67 tables, 12 Mo). "
    "La connexion Prisma est operationnelle. L'authentification est en mode trust (sans mot de passe), acceptable "
    "uniquement pour le developpement local. Le seed minimal charge 5 patients et 5 utilisateurs, laissant 50+ tables vides. "
    "Un probleme critique a ete identifie : la variable d'environnement systeme DATABASE_URL pointait vers SQLite "
    "(file:/home/z/my-project/db/custom.db), ecrasant la valeur PostgreSQL du fichier .env. Ce probleme a ete "
    "corrige dans db.ts et instrumentation.ts avec une detection et override automatique.", styles['Body']))

story.append(add_heading('2.2 Redis', 'H2', 1))
story.append(Paragraph(
    "Redis 8.0.2 fonctionne sur le port 6380 avec 767 Ko de memoire utilisee. Le keyspace est vide (0 cles), "
    "indiquant qu'aucune session ou OTP n'a ete stocke recemment. Le RedisRateLimiter existe dans redis.ts "
    "mais n'est PAS utilise par le middleware, qui utilise un Map en memoire. En deploiement multi-instance, "
    "chaque instance aura son propre compteur de rate limiting, permettant a un attaquant de multiplier son budget.", styles['Body']))

story.append(add_heading('2.3 Variables Environnement', 'H2', 1))
story.append(Paragraph(
    "Le fichier .env contient des secrets en dur qui doivent etre regeneres avant toute mise en production. "
    "Le fichier .env.example est obsolete avec des ports incorrects (5432 au lieu de 5433, 6379 au lieu de 6380) "
    "et omet JWT_SECRET. Les variables critiques identifiees sont les suivantes :", styles['Body']))

story.append(make_table(
    ['Variable', 'Probleme', 'Severite', 'Action'],
    [
        ['NEXTAUTH_SECRET', 'Placeholder faible', severity_badge('CRITIQUE'), 'openssl rand -base64 32'],
        ['JWT_SECRET', 'Placeholder faible', severity_badge('CRITIQUE'), 'openssl rand -base64 32'],
        ['ENCRYPTION_KEY', '0123456789abcdef...', severity_badge('CRITIQUE'), 'openssl rand -hex 32'],
        ['DEMO_MODE', 'true desactive auth', severity_badge('HAUT'), 'Mettre false en prod'],
        ['.env.example', 'Ports incorrects', severity_badge('HAUT'), 'Mettre a jour 5433/6380'],
    ],
    [0.20, 0.30, 0.15, 0.35]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 3 : Problemes de variables environnement', styles['Caption']))

# ════════════════════════════════════════════════════════════════
# 3. AUDIT API
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('3. Audit API'))
story.append(add_heading('3.1 Vue d\'ensemble', 'H2', 1))
story.append(Paragraph(
    "L'application compte 55 fichiers de route API avec environ 125 gestionnaires HTTP. Seuls 5 fichiers "
    "(14 gestionnaires) utilisent secureApiHandler. Environ 46 fichiers (105 gestionnaires) n'ont AUCUNE "
    "authentification. L'audit a revele 3 problemes critiques, 8 de severite haute et 12 de severite moyenne.", styles['Body']))

story.append(add_heading('3.2 Problemes critiques API', 'H2', 1))

story.append(Paragraph('<b>CRIT-1 : Divergence JWT_SECRET</b>', styles['H3']))
story.append(Paragraph(
    "Le fichier patient-auth/me/route.ts utilise un fallback JWT_SECRET different de tous les autres endpoints d'authentification "
    "('healthflow-guinea-jwt-secret-key-2024' vs 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'). "
    "Si JWT_SECRET n'est pas defini dans l'environnement, les tokens emis par /patient-auth/verify ne peuvent PAS "
    "etre verifies par /patient-auth/me, causant un echec complet de l'authentification du portail patient.", styles['Critical']))

story.append(Paragraph('<b>CRIT-2 : ~40 endpoints CRUD sans authentification</b>', styles['H3']))
story.append(Paragraph(
    "Les endpoints sensibles suivants n'ont aucune authentification : /api/patients (donnees PHI completes), "
    "/api/consultations, /api/billing, /api/payments, /api/hospitalizations, /api/laboratory, /api/emergencies, "
    "/api/pharmacy, /api/maternity, /api/vaccinations, /api/alerts, /api/establishments, /api/users, "
    "/api/fhir/*, /api/messaging/sms, /api/messaging/whatsapp. Toute requete non authentifiee peut lire, "
    "creer, modifier ou supprimer des donnees de sante protegees.", styles['Critical']))

story.append(Paragraph('<b>CRIT-3 : Webhook WhatsApp sans verification</b>', styles['H3']))
story.append(Paragraph(
    "Le endpoint GET /api/messaging/whatsapp ne valide jamais le hub.verify_token. Toute requete avec "
    "hub.mode=subscribe et un challenge sera acceptee, permettant a un attaquant d'enregistrer des URLs "
    "de webhook arbitraires.", styles['Critical']))

story.append(add_heading('3.3 Validation Zod manquante', 'H2', 1))
story.append(Paragraph(
    "Des schemas Zod existent dans src/lib/validations/ mais seulement ~12 des 50+ endpoints mutables les utilisent. "
    "Les endpoints critiques sans validation incluent : consultations, emergencies, hospitalizations, laboratory, "
    "pharmacy, billing, payments, maternity, vaccinations, insurance, messaging/sms, messaging/whatsapp, "
    "fhir/*, integrations, telemedicine/*, ai/*, et patient-auth/me (PUT). L'endpoint /api/patient-auth/me PUT "
    "passe les donnees directement a db.patient.update() sans AUCUNE validation de schema.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 4. SECURITE
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('4. Securite'))
story.append(add_heading('4.1 Authentification', 'H2', 1))
story.append(Paragraph(
    "L'authentification presente des fondations solides (bcryptjs 12 rounds, crypto.randomInt pour OTP, "
    "compteur de verrouillage apres 5 echecs, JWT HS256 avec expiration 12h) mais des lacunes critiques "
    "dans l'application homogene. Les IDs d'utilisateurs invites utilisent guest-${Date.now()} qui est "
    "previsible. Le fallback NEXTAUTH_SECRET dans auth.ts est un string statique potentiellement mal configure.", styles['Body']))

story.append(add_heading('4.2 CSRF et CORS', 'H2', 1))
story.append(Paragraph(
    "La protection CSRF est implementee en dual (middleware origin/referer + double-submit cookie). "
    "Cependant, isAllowedOrigin() utilise .includes() pour les sous-domaines, permettant a "
    "evil-space.chatglm.site.attacker.com de matcher .space.chatglm.site. De plus, corsHeaders() dans "
    "api-utils.ts revient silencieusement a allowedOrigins[0] quand l'origine n'est pas autorisee, "
    "accordant potentiellement un acces CORS involontaire.", styles['Body']))

story.append(add_heading('4.3 RBAC', 'H2', 1))
story.append(Paragraph(
    "Le systeme RBAC est complet (8 roles, 30 permissions, scope ownDataOnly pour les patients) mais "
    "n'est PAS applique sur les routes API. Seul /api/audit utilise secureApiHandler avec RBAC. "
    "Le module RLS (Row-Level Security) dans rls.ts n'est importe dans AUCUNE route. "
    "DEMO_MODE=true fait confiance aux headers x-user-id/x-user-role du client, permettant "
    "l'usurpation d'identite si cette configuration fuite en production.", styles['Body']))

story.append(add_heading('4.4 Chiffrement', 'H2', 1))
story.append(Paragraph(
    "L'implementation AES-256-GCM est correcte (IV 12 octets, auth tag verifie). Cependant, "
    "security.ts contient un fallback ENCRYPTION_KEY en dur ('healthflow-guinea-32byte-encrypt-k'), "
    "et le .env contient le placeholder 0123456789abcdef... Ces cles compromettraient toutes les donnees "
    "chiffrees si utilisees en production. Le module de sanitization XSS (sanitizeInput/sanitizeObject) "
    "existe mais n'est JAMAIS appele dans aucune route API.", styles['Body']))

story.append(add_heading('4.5 Points positifs', 'H2', 1))
story.append(Paragraph(
    "Plusieurs mecanismes de securite sont bien implementes : OTP avec crypto.randomInt (pas Math.random), "
    "stockage Redis avec TTL 5min et usage unique, OTP jamais retourne dans les reponses API, "
    "headers de securite complets (X-Frame-Options DENY, HSTS 1 an, CSP nonce en production, "
    "X-Content-Type-Options nosniff), anti-enumeration sur login, hash bcryptjs 12 rounds, "
    "et audit logging persiste en PostgreSQL avec buffer Redis.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 5. BASE DE DONNEES
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('5. Base de Donnees'))
story.append(add_heading('5.1 Schema Prisma', 'H2', 1))
story.append(Paragraph(
    "Le schema comporte 45 modeles, ~89 relations, 66 indexes et 22 contraintes uniques. "
    "Zero enums Prisma sont definis ; les 56 champs de type enum sont stockes en String brut, "
    "sans validation au niveau base. Cela permet des valeurs invalides et des incoherences.", styles['Body']))

story.append(add_heading('5.2 Relations sans onDelete', 'H2', 1))
story.append(Paragraph(
    "42 relations n'ont pas de regle onDelete, creant un risque d'enregistrements orphelins. "
    "Les plus dangereuses : Establishment vers Patient/Department/Room/Bed (suppression d'un "
    "hopital orphelinne tous les patients), User vers Consultation/LabRequest (suppression d'un "
    "medecin orphelinne les consultations), et Medication vers StockEntryItem/StockExitItem.", styles['Body']))

story.append(add_heading('5.3 Champs d\'audit manquants', 'H2', 1))
story.append(Paragraph(
    "Aucun modele n'a de champs createdBy/updatedBy. L'AuditLog capture qui a effectue les actions, "
    "mais les enregistrements individuels (Patient, Consultation, Prescription) ne suivent pas qui les "
    "a crees ou modifies. C'est un deficit de conformite majeur pour un systeme de dossiers medicaux.", styles['Body']))

story.append(add_heading('5.4 Index manquants', 'H2', 1))
story.append(Paragraph(
    "Les colonnes establishmentId de 7+ modeles (Appointment, Consultation, Admission, EmergencyCase, "
    "LabRequest, PregnancyTracking, Notification) n'ont pas d'index, alors qu'elles sont filtreees "
    "dans presque toutes les requetes. Cela cause des scans sequentielles sur des tables qui "
    "grossiront en production.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 6. FRONTEND
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('6. Frontend'))
story.append(add_heading('6.1 Stores Zustand', 'H2', 1))
story.append(Paragraph(
    "Les 4 stores Zustand utilisent tous localStorage avec zustand/persist, ce qui signifie que "
    "toutes les donnees medicales sont stockees dans le navigateur. AUCUN store ne fait d'appel "
    "API reel au backend. Le data-store.ts contient ~700 lignes de donnees demo en dur en francais. "
    "Les tokens d'authentification dans localStorage sont vulnerables aux attaques XSS. "
    "La migration vers des appels API reels est la priorite numero 1 du frontend.", styles['Body']))

story.append(make_table(
    ['Store', 'localStorage', 'Migration DB', 'Risque'],
    [
        ['auth-store.ts', 'Oui', 'Requise', 'Token XSS'],
        ['patient-auth-store.ts', 'Oui', 'Requise', 'Token XSS'],
        ['data-store.ts', 'Oui', 'Requise', 'Donnees medicales'],
        ['hospital-store.ts', 'Oui', 'Requise', 'Donnees hopital'],
    ],
    [0.25, 0.15, 0.20, 0.40]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 4 : Etat des stores Zustand', styles['Caption']))

story.append(add_heading('6.2 Error Boundaries et PWA', 'H2', 1))
story.append(Paragraph(
    "Il n'existe AUCUN fichier error.tsx dans l'application. Tout crash de composant dynamique "
    "fait planter l'ensemble de l'application. Le manifest.json est complet mais les icones PWA "
    "dans /public/icons/ sont absentes (repertoire vide), rendant l'installation PWA impossible. "
    "Le service worker est correctement implemente avec cache strategies, sync queue et push notifications.", styles['Body']))

story.append(add_heading('6.3 i18n', 'H2', 1))
story.append(Paragraph(
    "L'application supporte 5 langues mais les traductions sont inegales : Francais 100%, "
    "Anglais 100%, Maninka 37%, Fulfulde 27%, Susu 27%. De nombreuses chaines sont en dur en "
    "francais dans les stores, le service worker et le manifest.json. Les locuteurs des langues "
    "autochtones ne peuvent pas utiliser le systeme de maniere adequate.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 7. INTEGRATIONS
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('7. Integrations'))
story.append(Paragraph(
    "Toutes les integrations sont en mode sandbox/demo car les credentiels API ne sont pas configures. "
    "Orange Money et MTN MoMo sont implementees avec OAuth2, HMAC-SHA256 pour les webhooks, et "
    "auto-detection du provider par prefixe telephonique. DHIS2 supporte la collecte de donnees "
    "depuis PostgreSQL et la soumission DataValueSets. DICOM/Orthanc gere le multi-serveur PACS. "
    "WhatsApp Business supporte Twilio et Meta Cloud API avec 7 templates.", styles['Body']))
story.append(Paragraph(
    "Le callback Mobile Money /api/payments/mobile-money/callback verifie correctement la signature "
    "HMAC-SHA256 en mode production, mais le mode sandbox retourne systematiquement true. "
    "Le webhook WhatsApp n'a aucune verification de signature ni validation du hub.verify_token.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 8. BUILD ET TESTS
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('8. Build et Tests'))
story.append(Paragraph(
    "Le build de production reussit sans erreur TypeScript. 352 tests passent sur 13 suites de test. "
    "La couverture couvre le service OTP, le fournisseur SMS, les schemas de validation, la securite, "
    "les routes API d'authentification et Redis. Les tests ne couvrent PAS les routes CRUD cliniques "
    "(patients, consultations, etc.) ni les integrations. Le pipeline CI/CD GitHub Actions est configure "
    "avec lint, test, build, security scan et deploy. Sentry est configure pour le monitoring client+serveur.", styles['Body']))

# ════════════════════════════════════════════════════════════════
# 9. PLAN D'ACTION PRIORISE
# ════════════════════════════════════════════════════════════════
story.extend(add_major_section('9. Plan d\'Action Priorise'))
story.append(add_heading('9.1 Actions immediates (avant production)', 'H2', 1))

story.append(make_table(
    ['#', 'Action', 'Severite', 'Fichier(s)'],
    [
        ['1', 'Corriger la divergence JWT_SECRET dans patient-auth/me', severity_badge('CRITIQUE'), 'patient-auth/me/route.ts'],
        ['2', 'Ajouter secureApiHandler a tous les endpoints CRUD', severity_badge('CRITIQUE'), '46 fichiers route'],
        ['3', 'Ajouter validation Zod a tous les POST/PUT', severity_badge('CRITIQUE'), '40+ handlers'],
        ['4', 'Appliquer RBAC sur toutes les routes API', severity_badge('CRITIQUE'), 'api-middleware.ts'],
        ['5', 'Regenerer les secrets (NEXTAUTH, JWT, ENCRYPTION)', severity_badge('CRITIQUE'), '.env'],
        ['6', 'Mettre DEMO_MODE=false en production', severity_badge('HAUT'), '.env'],
        ['7', 'Ajouter rate limiting sur auth/login et messaging', severity_badge('HAUT'), 'routes specifiques'],
        ['8', 'Valider le hub.verify_token du webhook WhatsApp', severity_badge('HAUT'), 'messaging/whatsapp'],
        ['9', 'Remplacer Math.random() par crypto.randomInt()', severity_badge('HAUT'), '6+ fichiers'],
        ['10', 'Corriger CORS .includes() par URL parsing', severity_badge('HAUT'), 'middleware.ts'],
    ],
    [0.05, 0.45, 0.15, 0.35]
))
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 5 : Plan d\'action immediat', styles['Caption']))

story.append(add_heading('9.2 Actions a court terme (1 sprint)', 'H2', 1))
story.append(Paragraph(
    "Migrer les stores Zustand vers des appels API reels (priorite 1 frontend). Ajouter les indexes "
    "manquants sur establishmentId pour 7+ modeles. Ajouter les regles onDelete sur les 42 relations "
    "critiques. Convertir les 56 champs String en enums Prisma. Ajouter les champs createdBy/updatedBy "
    "aux modeles medicaux. Migrer le rate limiting du middleware vers Redis. Appliquer les filtres RLS "
    "aux requetes de donnees patient. Ajouter des error boundaries a toutes les pages. Completer les "
    "icones PWA et les traductions i18n.", styles['Body']))

story.append(add_heading('9.3 Actions a moyen terme (backlog)', 'H2', 1))
story.append(Paragraph(
    "Standardiser les formats de reponse API (successResponse/paginatedResponse). Nettoyer les "
    "console.log en production (~70 instances). Reduire les types any (~40 instances). Deplacer les "
    "tokens du localStorage vers des cookies httpOnly. Ajouter la verification de signature JWT "
    "dans verifyJwtSession avec jose.jwtVerify. Completer les traductions Fulfulde et Susu (27%). "
    "Nettoyer les fichiers orphelins (.deb, db/custom.db, upload/). Mettre a jour .env.example.", styles['Body']))

# ── Build ──
doc.multiBuild(story)
print(f"PDF genere : {OUTPUT}")
