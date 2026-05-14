#!/usr/bin/env python3
"""HealthFlow Guinea - Production Readiness Audit Report PDF Generator"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Fonts ━━
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))

pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')

# ━━ Cascade Palette ━━
PAGE_BG       = colors.HexColor('#efeff0')
CARD_BG       = colors.HexColor('#edeff0')
TABLE_STRIPE  = colors.HexColor('#e9eaeb')
HEADER_FILL   = colors.HexColor('#485765')
COVER_BLOCK   = colors.HexColor('#3f5368')
BORDER        = colors.HexColor('#aab5c1')
ICON          = colors.HexColor('#4e77a0')
ACCENT        = colors.HexColor('#4a28b0')
ACCENT_2      = colors.HexColor('#5967cb')
TEXT_PRIMARY   = colors.HexColor('#161719')
TEXT_MUTED     = colors.HexColor('#72777c')
SEM_SUCCESS   = colors.HexColor('#428157')
SEM_WARNING   = colors.HexColor('#9b8049')
SEM_ERROR     = colors.HexColor('#ad5048')
SEM_INFO      = colors.HexColor('#4b749d')

# ━━ Styles ━━
styles = getSampleStyleSheet()

title_style = ParagraphStyle('MainTitle', fontName='DejaVuSans', fontSize=28, leading=34,
    alignment=TA_LEFT, textColor=COVER_BLOCK, spaceAfter=6)

subtitle_style = ParagraphStyle('SubTitle', fontName='DejaVuSans', fontSize=16, leading=22,
    alignment=TA_LEFT, textColor=ACCENT, spaceAfter=12)

h1_style = ParagraphStyle('H1', fontName='DejaVuSans', fontSize=20, leading=26,
    alignment=TA_LEFT, textColor=COVER_BLOCK, spaceBefore=18, spaceAfter=10)

h2_style = ParagraphStyle('H2', fontName='DejaVuSans', fontSize=14, leading=20,
    alignment=TA_LEFT, textColor=ACCENT, spaceBefore=12, spaceAfter=6)

h3_style = ParagraphStyle('H3', fontName='DejaVuSans', fontSize=12, leading=17,
    alignment=TA_LEFT, textColor=HEADER_FILL, spaceBefore=8, spaceAfter=4)

body_style = ParagraphStyle('Body', fontName='DejaVuSans', fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=6, firstLineIndent=0)

body_indent = ParagraphStyle('BodyIndent', fontName='DejaVuSans', fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=6, leftIndent=18)

bullet_style = ParagraphStyle('Bullet', fontName='DejaVuSans', fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=4, leftIndent=24, bulletIndent=12)

caption_style = ParagraphStyle('Caption', fontName='DejaVuSans', fontSize=9, leading=14,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)

meta_style = ParagraphStyle('Meta', fontName='DejaVuSans', fontSize=10, leading=15,
    alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=4)

callout_style = ParagraphStyle('Callout', fontName='DejaVuSans', fontSize=11, leading=17,
    alignment=TA_LEFT, textColor=ACCENT, leftIndent=24, borderPadding=8, spaceAfter=8)

header_cell_style = ParagraphStyle('HeaderCell', fontName='DejaVuSans', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=colors.white)

cell_style = ParagraphStyle('Cell', fontName='DejaVuSans', fontSize=9.5,
    leading=14, alignment=TA_LEFT, textColor=TEXT_PRIMARY)

cell_center = ParagraphStyle('CellCenter', fontName='DejaVuSans', fontSize=9.5,
    leading=14, alignment=TA_CENTER, textColor=TEXT_PRIMARY)

# ━━ Helpers ━━
def make_table(headers, rows, col_widths=None):
    page_w = A4[0]
    margin = 1.0 * inch
    avail = page_w - 2 * margin
    if col_widths is None:
        n = len(headers)
        col_widths = [avail / n] * n
    else:
        total = sum(col_widths)
        if total < avail * 0.85:
            scale = (avail * 0.92) / total
            col_widths = [w * scale for w in col_widths]

    data = [[Paragraph(f'<b>{h}</b>', header_cell_style) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), cell_style) for c in row])

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def risk_badge(level):
    mapping = {
        'Critique': SEM_ERROR,
        'Eleve': SEM_WARNING,
        'Moyen': SEM_INFO,
        'Faible': SEM_SUCCESS,
    }
    c = mapping.get(level, TEXT_MUTED)
    return f'<font color="{c.hexval()}">{level}</font>'

def section_divider():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6, spaceBefore=6)

# ━━ Build Document ━━
output_path = '/home/z/my-project/download/healthflow-production-readiness-audit.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4,
    leftMargin=1.0*inch, rightMargin=1.0*inch,
    topMargin=0.8*inch, bottomMargin=0.8*inch)

story = []

# ━━━━ COVER PAGE ━━━━
story.append(Spacer(1, 2.0*inch))
story.append(Paragraph('HealthFlow Guinea', title_style))
story.append(Spacer(1, 8))
story.append(Paragraph('Audit de Production Readiness', subtitle_style))
story.append(Spacer(1, 12))
story.append(HRFlowable(width="40%", thickness=2, color=ACCENT, spaceAfter=18))
story.append(Paragraph('Evaluation de la maturite du systeme pour un deploiement en production et une commercialisation', body_style))
story.append(Spacer(1, 24))
story.append(Paragraph('DataSphere Innovation - Sekouna KABA', meta_style))
story.append(Paragraph('14 Mai 2026', meta_style))
story.append(Spacer(1, 12))
story.append(Paragraph('Score global : 7.3 / 10 (Prototype avance)', ParagraphStyle('Score', fontName='DejaVuSans',
    fontSize=18, leading=24, textColor=ACCENT, alignment=TA_LEFT)))
story.append(Spacer(1, 6))
story.append(Paragraph('Niveau Production Ready : ~30% - NON PRET POUR LA PRODUCTION', ParagraphStyle('ScoreNote',
    fontName='DejaVuSans', fontSize=12, leading=18, textColor=SEM_ERROR, alignment=TA_LEFT)))

story.append(PageBreak())

# ━━━━ EXECUTIVE SUMMARY ━━━━
story.append(Paragraph('<b>Resume Executif</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'HealthFlow Guinea est un systeme d\'information hospitalier (SIH) ambitieux et bien concu, couvrant plus de 40 modules cliniques et administratifs. '
    'Le projet presente une architecture impressionnante avec une interface utilisateur moderne (Next.js 16, React 19, Tailwind CSS, shadcn/ui), '
    'un support PWA offline-first, une internationalisation en 5 langues (Francais, Anglais, Malinke, Soussou, Poular), '
    'et une conformite HL7 FHIR R4 pour l\'interoperabilite. Cependant, l\'audit revele que le systeme est actuellement au stade de prototype avance '
    'et presente des lacunes critiques qui empechent tout deploiement en production avec de vraies donnees patients. '
    'Les problemes majeurs incluent une base de donnees SQLite non adaptee a la production, l\'absence de tests automatises, '
    'des routes API sans authentification ni validation, des integrations simulees (Orange Money, MTN MoMo, DHIS2), '
    'et des secrets codes en dur dans le code source. Ce rapport detaille chaque domaine, evalue les risques, '
    'et propose une feuille de route priorisee pour atteindre le niveau production-ready.',
    body_style))

story.append(Spacer(1, 12))

# Score summary table
story.append(Paragraph('<b>Matrice des Risques par Domaine</b>', h2_style))
story.append(Spacer(1, 6))

risk_data = [
    ['Securite', risk_badge('Critique'), 'Non', '3-5 jours'],
    ['Base de donnees', risk_badge('Critique'), 'Non (SQLite)', '5-7 jours'],
    ['Routes API', risk_badge('Critique'), 'Non', '10-15 jours'],
    ['Authentification', risk_badge('Eleve'), 'Partiel', '3-5 jours'],
    ['Tests', risk_badge('Critique'), 'Non (0%)', '15-20 jours'],
    ['Integrations', risk_badge('Eleve'), 'Non (simulees)', '2-3 mois'],
    ['Gestion d\'erreurs', risk_badge('Eleve'), 'Non', '1-2 jours'],
    ['Configuration Env', risk_badge('Eleve'), 'Partiel', '1 jour'],
    ['Performance', risk_badge('Moyen'), 'Partiel', '3-5 jours'],
    ['i18n', risk_badge('Moyen'), 'Partiel (30%)', '5-7 jours'],
    ['PWA', risk_badge('Moyen'), 'Non (pas d\'icones)', '1-2 jours'],
    ['Deploiement', risk_badge('Moyen'), 'Partiel', '3-5 jours'],
    ['Dependances', risk_badge('Moyen'), 'Partiel', '1 jour'],
    ['Typage', risk_badge('Faible'), 'Oui (95%)', '0.5 jour'],
    ['Logs & Monitoring', risk_badge('Eleve'), 'Non', '3-5 jours'],
]

story.append(make_table(
    ['Domaine', 'Risque', 'Production Ready', 'Effort de correction'],
    risk_data,
    [180, 80, 100, 90]
))

story.append(PageBreak())

# ━━━━ SECTION 1: SECURITY ━━━━
story.append(Paragraph('<b>1. Securite</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'Le module de securite de HealthFlow Guinea presente une base solide avec le chiffrement AES-256-GCM, '
    'le hachage de mots de passe bcryptjs (cost factor 12), la protection CSRF avec double-submit cookie, '
    'et une politique CSP stricte en production. Cependant, des vulnerabilites critiques subsistent qui '
    'compromettent gravement la securite du systeme en cas de deploiement reel. Ces problemes doivent etre '
    'resolus en priorite avant toute mise en production, car ils exposeraient les donnees sensibles des patients '
    'a des risques d\'acces non autorise, de fuite de donnees, et de compromission du systeme.',
    body_style))

story.append(Spacer(1, 8))
story.append(Paragraph('<b>Points forts</b>', h3_style))
story.append(Paragraph('Chiffrement AES-256-GCM avec Web Crypto API ; Hachage bcryptjs cost-12 avec fallback PBKDF2 ; '
    'Protection CSRF double-submit + origin validation ; CSP stricte avec nonces en production ; '
    'CORS restrictif sans wildcard ; Comparaison a temps constant anti-timing attacks', bullet_style))

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Vulnerabilites critiques</b>', h3_style))

vuln_data = [
    ['Cle de chiffrement en dur', 'security.ts:8', 'ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || \'healthflow-guinea-32byte-encrypt-k\'', 'Si la variable d\'environnement est manquante, toutes les donnees sont chiffrees avec une cle publique'],
    ['NEXTAUTH_SECRET fallback', 'auth.ts:123', 'Secret de dev codé en dur comme fallback', 'Une config prod manquante utiliserait silencieusement ce secret'],
    ['Rate limiting en memoire', 'middleware.ts', 'Map() pour le rate limiting', 'Perdu au redemarrage, ne passe pas a l\'echelle horizontalement'],
    ['Sessions en memoire', 'security.ts', 'Map() pour les sessions actives', 'Perdues au redemarrage, non partagees entre instances'],
    ['secureApiHandler non applique', '40+ routes', 'Seulement 5 routes sur 40+ utilisent le middleware securise', '85%+ des routes API n\'ont aucune authentification ni controle RBAC'],
    ['OTP store en memoire', 'auth.ts', 'Map() pour les codes OTP', 'Tous les OTP actifs perdus au redemarrage'],
    ['Demo user fallback', 'otp/route.ts', 'Fallback vers Dr. Mamadou Diallo si DB indisponible', 'Pourrait etre exploite pour obtenir un acces non autorise'],
]

story.append(make_table(
    ['Vulnerabilite', 'Fichier', 'Detail', 'Impact'],
    vuln_data,
    [100, 65, 155, 130]
))

story.append(Spacer(1, 12))

# ━━━━ SECTION 2: DATABASE ━━━━
story.append(Paragraph('<b>2. Base de Donnees</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'Le schema Prisma est remarquablement complet avec plus de 50 modeles couvrant patients, rendez-vous, consultations, '
    'laboratoire, pharmacie, hospitalisation, urgences, maternite, vaccination, facturation, paiements, assurance, '
    'teleconsultation, et bien plus. Les index et contraintes sont bien definis. Cependant, le choix de SQLite comme '
    'provider de base de donnees est un bloqueur absolu pour la production. SQLite utilise un verrouillage mono-ecrivain '
    'qui empeche les ecritures concurrentes, ne supporte pas l\'acces reseau, et ne dispose d\'aucun mecanisme de '
    'replication. Pour un systeme hospitalier multi-utilisateurs avec des donnees de vie ou de mort, PostgreSQL est '
    'le minimum requis. Le docker-compose.yml reference deja PostgreSQL 16, mais le schema Prisma est configure pour '
    'SQLite, creant une incoherence critique qui empechera tout deploiement Docker de fonctionner.',
    body_style))

story.append(Spacer(1, 6))
db_issues = [
    ['SQLite en production', 'Critique', 'Verrou mono-ecrivain, pas d\'acces reseau, pas de replication'],
    ['Incoherence Prisma/Docker', 'Critique', 'Schema SQLite mais Docker attend PostgreSQL'],
    ['Pas de migrations', 'Eleve', 'Seulement prisma db push (dev-only), pas de prisma migrate deploy'],
    ['Enums en String', 'Moyen', 'Pas de validation au niveau DB (status String au lieu d\'enum)'],
    ['Vitals en JSON String', 'Moyen', 'Donnees vitales non queryables, pas type-safe'],
    ['Pas de soft-delete', 'Moyen', 'Seul Patient.isActive existe, les autres utilisent onDelete: Cascade'],
]
story.append(make_table(['Probleme', 'Risque', 'Detail'], db_issues, [130, 70, 250]))

story.append(PageBreak())

# ━━━━ SECTION 3: API ROUTES ━━━━
story.append(Paragraph('<b>3. Routes API</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'Le projet comporte plus de 40 fichiers de routes API couvrant l\'ensemble des fonctionnalites hospitalieres. '
    'Cependant, l\'audit revele des lacunes systemiques majeures : seuls 8 routes sur plus de 40 disposent d\'une '
    'validation Zod des entrees, et seulement 5 routes utilisent le middleware secureApiHandler qui assure '
    'l\'authentification JWT, la verification CSRF, et le controle RBAC. La majorite des routes acceptent directement '
    'le body JSON sans aucune validation, ce qui expose le systeme a des injections de donnees malveillantes, des '
    'corruptions de donnees, et des acces non autorises. Dans un contexte hospitalier ou la precision des donnees '
    'patients est critique, cette absence de validation est un risque juridique et clinique majeur.',
    body_style))

story.append(Spacer(1, 6))
api_audit = [
    ['/api/patients', 'Non', 'Zod (POST)', 'Non', 'Try/catch'],
    ['/api/billing', 'Non', 'Aucune', 'Non', 'Try/catch'],
    ['/api/emergencies', 'Non', 'Aucune', 'Non', 'Try/catch'],
    ['/api/payments/mobile-money', 'Non', 'Partielle', 'Non', 'Try/catch'],
    ['/api/auth/otp', 'Non', 'Basique', 'Non', 'Try/catch'],
    ['/api/audit', 'Oui', 'Aucune', 'Oui', 'Oui'],
    ['/api/ai/preconsultation', 'Oui', 'Zod', 'Oui', 'Oui'],
    ['/api/telemedicine/sessions', 'Oui', 'Partielle', 'Oui', 'Oui'],
]
story.append(make_table(
    ['Route', 'Auth', 'Validation', 'RBAC', 'Erreurs'],
    api_audit,
    [120, 45, 65, 45, 75]
))

story.append(Spacer(1, 12))

# ━━━━ SECTION 4: TESTING ━━━━
story.append(Paragraph('<b>4. Tests Automatises</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'Le constat est sans appel : le projet a un taux de couverture de tests de 0%. Il n\'existe aucun fichier de test '
    '(ni .test.ts, ni .spec.ts, ni repertoire __tests__/), aucun runner de test configure (ni Jest, ni Vitest, ni '
    'Playwright), et aucun pipeline CI/CD pour l\'execution automatisee des tests. Pour un systeme d\'information '
    'hospitalier qui gere des donnees de sante sensibles et des processus critiques (ordonnances, resultats de '
    'laboratoire, urgences), cette absence de tests est le risque le plus eleve. Toute modification du code, meme '
    'mineure, pourrait introduire des regressions dans les workflows cliniques sans qu\'aucun signal d\'alerte ne '
    'soit declenche. La mise en place d\'une infrastructure de test et l\'ecriture de tests pour les chemins '
    'critiques (authentification, creation de patients, prescriptions, facturation) doit etre une priorite absolue.',
    body_style))

story.append(Spacer(1, 12))

# ━━━━ SECTION 5: INTEGRATIONS ━━━━
story.append(Paragraph('<b>5. Integrations Externes</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'Toutes les integrations externes du systeme sont actuellement simulees. Orange Money et MTN MoMo utilisent '
    'Math.random() pour determiner le succes ou l\'echec des paiements, ce qui signifie qu\'un paiement peut '
    '"reussir" ou "echouer" de maniere totalement aleatoire sans aucune transaction reelle. Le connecteur DHIS2 '
    'genere des rapports JSON mais ne les envoie jamais au systeme DHIS2 national. Les alertes mTrac, les rapports '
    'SNIS, les cartes SANTEP, et le registre national sont tous des tableaux de donnees de demonstration en dur '
    'dans le code. Cette situation est acceptable pour un prototype de demonstration mais rend le systeme '
    'inutilisable dans un contexte clinique reel. Chaque integration necessitera un travail significatif pour '
    'se connecter aux veritables API des partenaires guineens, obtenir les certifications necessaires, et mettre '
    'en place les mecanismes de gestion des erreurs et de retry pour assurer la fiabilite des echanges.',
    body_style))

story.append(Spacer(1, 6))
integ_data = [
    ['Orange Money', 'Simulee', 'Math.random() pour succes/echec, delay() pour la latence'],
    ['MTN MoMo', 'Simulee', 'Meme simulation qu\'Orange Money'],
    ['DHIS2', 'Types uniquement', 'generateDHIS2Report() genere du JSON sans l\'envoyer'],
    ['SNIS', 'Donnees demo', 'demoSNISReports - tableau en dur'],
    ['mTrac', 'Donnees demo', 'demoMTracAlerts - tableau en dur'],
    ['SANTEP Card', 'Donnees demo', 'demoSANTEPCards - tableau en dur'],
    ['Registre National', 'Donnees demo', 'demoNationalRegistry - tableau en dur'],
    ['SMS (Orange)', 'Code existe', 'Requiert ORANGE_SMS_TOKEN (non configure)'],
    ['SMS (Twilio)', 'Code existe', 'Requiert identifiants Twilio (non configures)'],
]
story.append(make_table(['Integration', 'Statut', 'Detail'], integ_data, [100, 90, 260]))

story.append(PageBreak())

# ━━━━ SECTION 6: OTHER DOMAINS ━━━━
story.append(Paragraph('<b>6. Autres Domaines</b>', h1_style))
story.append(section_divider())

# Auth
story.append(Paragraph('<b>6.1 Authentification</b>', h2_style))
story.append(Paragraph(
    'L\'authentification repose sur NextAuth v4 avec un fournisseur Credentials (telephone + OTP). '
    'Le systeme OTP est bien concu (6 chiffres, expiration 5 min, max 3 tentatives, rate limiting), mais le stockage '
    'des OTP en memoire (Map()) et le fallback vers un utilisateur demo lorsque la base de donnees est indisponible '
    'sont des risques critiques. Il n\'existe pas de mecanisme de verrouillage de compte, pas d\'authentification MFA '
    'active (bien que le schema la supporte), pas d\'authentification par mot de passe (uniquement OTP, ce qui pose '
    'probleme si la passerelle SMS est indisponible), et aucune possibilite de revoquer une session JWT active.',
    body_style))

story.append(Spacer(1, 8))

# Error handling
story.append(Paragraph('<b>6.2 Gestion d\'Erreurs</b>', h2_style))
story.append(Paragraph(
    'Le projet ne dispose d\'aucune page error.tsx, not-found.tsx, ou global-error.tsx. Les erreurs React non '
    'gerees provoquent le plantage complet de l\'application sans aucun message utilisateur. Cote API, les erreurs '
    'peuvent fuir des details internes (err.message expose directement), ce qui constitue un risque de securite. '
    'L\'absence de service de suivi des erreurs (Sentry, Datadog) signifie que les erreurs en production ne seraient '
    'detectees que par les plaintes des utilisateurs, ce qui est inacceptable pour un systeme hospitalier.',
    body_style))

story.append(Spacer(1, 8))

# Environment
story.append(Paragraph('<b>6.3 Configuration Environnement</b>', h2_style))
story.append(Paragraph(
    'Le fichier .env ne contient que DATABASE_URL. Il n\'existe pas de fichier .env.example pour guider les nouveaux '
    'developpeurs, pas de .env.production ou .env.staging, et aucune validation des variables d\'environnement au '
    'demarrage. Les secrets critiques (ENCRYPTION_KEY, NEXTAUTH_SECRET) ont des fallbacks codes en dur, ce qui '
    'signifie que l\'application demarre silencieusement avec des valeurs insecure si les variables ne sont pas '
    'definies. Cette situation est particulierement dangereuse car aucune alerte n\'est emise pour signaler la '
    'configuration insecure.',
    body_style))

story.append(Spacer(1, 8))

# Performance
story.append(Paragraph('<b>6.4 Performance</b>', h2_style))
story.append(Paragraph(
    'Les routes API supportent la pagination via getPaginationParams() et PrismaClient est correctement singletonise. '
    'Cependant, Redis est configure dans Docker Compose mais jamais utilise dans le code pour le cache. Chaque requete '
    'API atteint directement la base de donnees sans aucune mise en cache. Le logging Prisma est actif dans tous les '
    'environnements (log: [\'query\']), ce qui ajoute un overhead significatif en production. Le store Zustand '
    'data-store.ts charge toutes les donnees de demonstration en memoire d\'un coup, ce qui ne passe pas a l\'echelle '
    'avec des donnees reelles.',
    body_style))

story.append(Spacer(1, 8))

# i18n
story.append(Paragraph('<b>6.5 Internationalisation (i18n)</b>', h2_style))
story.append(Paragraph(
    'Le systeme supporte 5 langues, mais les langues autochtones (Malinke, Soussou, Poular) ne sont completes '
    'qu\'a environ 30% (136-184 lignes contre 499 pour le Francais et l\'Anglais). Les sections analytics, '
    'administration, settings, et patient-portal sont particulierement incompletes dans les langues locales. '
    'La bibliotheque next-intl est listee comme dependance mais n\'est pas utilisee ; un systeme i18n personnalise '
    'est implemente a la place. Il n\'existe pas de validation des cles de traduction manquantes, ce qui signifie '
    'que les cles absentes s\'affichent telles quelles ou sont remplacees silencieusement.',
    body_style))

story.append(Spacer(1, 8))

# Deployment
story.append(Paragraph('<b>6.6 Deploiement</b>', h2_style))
story.append(Paragraph(
    'Le Dockerfile est bien structure (multi-stage, utilisateur non-root, health check, standalone output). '
    'Le docker-compose.yml configure PostgreSQL 16, Redis 7, et Nginx avec des health checks. Cependant, '
    'l\'incoherence critique entre le schema Prisma (SQLite) et l\'infrastructure Docker (PostgreSQL) signifie que '
    'le deploiement echouera immediatement. Il n\'y a pas d\'etape de migration de base de donnees dans le Dockerfile '
    'ou le script de demarrage. Le Caddyfile n\'a pas de configuration HTTPS/TLS, et il n\'existe pas de procedure '
    'de backup/restore des donnees, ce qui est inacceptable pour un systeme de sante.',
    body_style))

story.append(Spacer(1, 8))

# Logs
story.append(Paragraph('<b>6.7 Logs et Monitoring</b>', h2_style))
story.append(Paragraph(
    'Le endpoint /api/health retourne l\'uptime, l\'utilisation memoire, et l\'environnement. Le module audit-logger.ts '
    'offre des types d\'evenements comprehensifs et des fonctions de journalisation. Cependant, les journaux d\'audit '
    'sont stockes uniquement en memoire (max 10 000 entrees, perdus au redemarrage), le code indique explicitement '
    '"remplacer par une base de donnees en production". Il n\'y a pas de logging structure (uniquement console.log/warn/error), '
    'pas de service de monitoring externe (Sentry, Datadog), pas de verification de la connectivite base de donnees '
    'dans le health check, pas d\'endpoint de metriques Prometheus, et pas de systeme d\'alerte pour les evenements critiques.',
    body_style))

story.append(PageBreak())

# ━━━━ ROADMAP ━━━━
story.append(Paragraph('<b>7. Feuille de Route vers la Production</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'La feuille de route suivante presente les phases priorises pour transformer HealthFlow Guinea d\'un prototype '
    'avance en un systeme production-ready. L\'estimation totale est de 2 a 3 mois avec une equipe dediee de 2 a 3 '
    'developpeurs. Les phases sont organisees par ordre de priorite, chaque phase construisant sur la precedente. '
    'Il est imperatif de ne pas sauter de phase : la securite et la base de donnees doivent etre resolues avant '
    'de travailler sur les integrations ou les tests avances.',
    body_style))

story.append(Spacer(1, 10))

# Phase 1
story.append(Paragraph('<b>Phase 1 : Durcissement Securitaire (1 semaine)</b>', h2_style))
phase1 = [
    ['Supprimer tous les fallbacks de secrets en dur', 'Critique', '0.5 jour'],
    ['Ajouter le rate limiting Redis', 'Critique', '1 jour'],
    ['Appliquer secureApiHandler a toutes les routes API', 'Critique', '2 jours'],
    ['Migrer le store OTP vers Redis', 'Eleve', '0.5 jour'],
    ['Ajouter la validation Zod a toutes les routes POST/PUT', 'Critique', '1.5 jours'],
    ['Supprimer le fallback utilisateur demo', 'Critique', '0.5 jour'],
]
story.append(make_table(['Action', 'Priorite', 'Effort'], phase1, [250, 70, 130]))

story.append(Spacer(1, 10))

# Phase 2
story.append(Paragraph('<b>Phase 2 : Migration Base de Donnees (1 semaine)</b>', h2_style))
phase2 = [
    ['Basculer Prisma de SQLite vers PostgreSQL', 'Critique', '1 jour'],
    ['Creer les migrations prisma migrate dev', 'Critique', '1 jour'],
    ['Ajouter la verification DB au health check', 'Eleve', '0.5 jour'],
    ['Convertir les enums String en enums Prisma', 'Moyen', '1 jour'],
    ['Configurer les sauvegardes automatiques', 'Eleve', '1 jour'],
    ['Mettre en place le connection pooling', 'Moyen', '0.5 jour'],
]
story.append(make_table(['Action', 'Priorite', 'Effort'], phase2, [250, 70, 130]))

story.append(Spacer(1, 10))

# Phase 3
story.append(Paragraph('<b>Phase 3 : Fiabilite (2 semaines)</b>', h2_style))
phase3 = [
    ['Ajouter error.tsx, not-found.tsx, global-error.tsx', 'Eleve', '0.5 jour'],
    ['Implementer le logging structure (pino/winston)', 'Eleve', '1 jour'],
    ['Migrer les audits logs en base de donnees', 'Eleve', '1 jour'],
    ['Integrer Sentry pour le suivi des erreurs', 'Eleve', '0.5 jour'],
    ['Configurer Vitest + tests unitaires chemins critiques', 'Critique', '5 jours'],
    ['Generer les icones PWA et la page offline', 'Moyen', '0.5 jour'],
    ['Ajouter les tests E2E Playwright (5 scenarios)', 'Eleve', '3 jours'],
]
story.append(make_table(['Action', 'Priorite', 'Effort'], phase3, [250, 70, 130]))

story.append(Spacer(1, 10))

# Phase 4
story.append(Paragraph('<b>Phase 4 : Integrations Reelles (2-3 mois)</b>', h2_style))
phase4 = [
    ['Integrer l\'API reelle Orange Money', 'Critique', '2 semaines'],
    ['Integrer l\'API reelle MTN MoMo', 'Critique', '2 semaines'],
    ['Integrer la passerelle SMS reelle', 'Eleve', '1 semaine'],
    ['Connecter au DHIS2 national pour les rapports', 'Eleve', '2 semaines'],
    ['Ajouter la verification de signature webhook', 'Critique', '1 semaine'],
    ['Mettre en place les mecanismes de retry', 'Eleve', '1 semaine'],
]
story.append(make_table(['Action', 'Priorite', 'Effort'], phase4, [250, 70, 130]))

story.append(PageBreak())

# ━━━━ CONCLUSION ━━━━
story.append(Paragraph('<b>8. Conclusion et Recommandations</b>', h1_style))
story.append(section_divider())

story.append(Paragraph(
    'HealthFlow Guinea presente un potentiel considerable comme systeme d\'information hospitalier pour la Guinee et '
    'l\'Afrique de l\'Ouest. L\'architecture est moderne, les modules sont comprehensifs, l\'interface utilisateur '
    'est soignee, et la conformite HL7 FHIR R4 est un atout majeur pour l\'interoperabilite regionale. Cependant, '
    'le systeme est actuellement au stade de prototype avance avec un niveau de maturite production d\'environ 30%. '
    'Les 4 bloqueurs absolus pour la production sont : (1) la base de donnees SQLite qui ne supporte pas la '
    'concurrence, (2) l\'absence de tests automatises qui rend chaque modification risquee, (3) les routes API sans '
    'authentification qui exposent les donnees patients, et (4) les integrations simulees qui empechent les '
    'transactions reelles.',
    body_style))

story.append(Spacer(1, 8))
story.append(Paragraph(
    'La recommandation principale est de suivre la feuille de route en 4 phases, en commencant imperativement par '
    'le durcissement securitaire et la migration PostgreSQL. Avec un investissement de 2 a 3 mois et une equipe '
    'dediee, HealthFlow Guinea peut atteindre le niveau production-ready et devenir un veritable leader de la sante '
    'numerique en Afrique francophone. L\'approche progressive est essentielle : chaque phase doit etre validee avant '
    'de passer a la suivante, et les tests automatises doivent accompagner chaque development des la Phase 3 pour '
    'garantir la non-regression du systeme.',
    body_style))

story.append(Spacer(1, 18))

# Summary scorecard
story.append(Paragraph('<b>Carte de Score Final</b>', h2_style))
story.append(Spacer(1, 6))

score_data = [
    ['Fonctionnalite (couverture modules)', '9/10', '40+ modules couvrant tout le spectre hospitalier'],
    ['Architecture technique', '8/10', 'Next.js 16, FHIR R4, PWA, i18n - solide et moderne'],
    ['Securite', '4/10', 'Bonne base mais secrets en dur, routes non protegees'],
    ['Base de donnees', '3/10', 'Schema excellent mais SQLite bloque la production'],
    ['Tests', '0/10', 'Aucun test - risque de regression maximal'],
    ['Integrations', '1/10', 'Toutes simulees - aucune transaction reelle possible'],
    ['Deploiement', '5/10', 'Docker OK mais incoherence SQLite/PostgreSQL'],
    ['Production Readiness', '3/10', 'Prototype avance - travail significatif requis'],
]
story.append(make_table(['Domaine', 'Score', 'Commentaire'], score_data, [140, 55, 255]))

# ━━ Build ━━━━
doc.build(story)
print(f"PDF generated: {output_path}")
