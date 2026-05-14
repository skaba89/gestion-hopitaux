#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HealthFlow Guinea — Audit Stratégique & Axes d'Évolution
Généré par Z.ai — DataSphere Innovation
"""

import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm, mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak, HRFlowable, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ─── Font Registration ───
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSCBold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerifBold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerifBold')
registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSCBold')

# Install font fallback for mixed CJK/Latin
sys.path.insert(0, '/home/z/my-project/skills/pdf/scripts')
from pdf import install_font_fallback
install_font_fallback()

# ─── Cascade Palette ───
PAGE_BG       = colors.HexColor('#f2f3f4')
SECTION_BG    = colors.HexColor('#ebedee')
CARD_BG       = colors.HexColor('#e3e6e9')
TABLE_STRIPE  = colors.HexColor('#eaeced')
HEADER_FILL   = colors.HexColor('#49627b')
COVER_BLOCK   = colors.HexColor('#5d6b79')
BORDER        = colors.HexColor('#c4cad1')
ICON          = colors.HexColor('#567ea6')
ACCENT        = colors.HexColor('#228f74')
ACCENT_2      = colors.HexColor('#43b0c0')
TEXT_PRIMARY   = colors.HexColor('#222425')
TEXT_MUTED     = colors.HexColor('#787d82')
SEM_SUCCESS   = colors.HexColor('#408256')
SEM_WARNING   = colors.HexColor('#b79146')
SEM_ERROR     = colors.HexColor('#92544e')
SEM_INFO      = colors.HexColor('#4e7ba8')

# ─── Styles ───
BODY_FONT = 'LiberationSerif'
HEAD_FONT = 'LiberationSerif'

styles = getSampleStyleSheet()

# Override / add styles
styles.add(ParagraphStyle(
    name='CoverTitle', fontName=HEAD_FONT, fontSize=36, leading=44,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=12
))
styles.add(ParagraphStyle(
    name='CoverSubtitle', fontName=BODY_FONT, fontSize=18, leading=24,
    alignment=TA_LEFT, textColor=TEXT_MUTED, spaceAfter=6
))
styles.add(ParagraphStyle(
    name='CoverMeta', fontName=BODY_FONT, fontSize=12, leading=16,
    alignment=TA_LEFT, textColor=TEXT_MUTED
))
styles.add(ParagraphStyle(
    name='H1', fontName=HEAD_FONT, fontSize=20, leading=26,
    alignment=TA_LEFT, textColor=HEADER_FILL, spaceBefore=18, spaceAfter=10
))
styles.add(ParagraphStyle(
    name='H2', fontName=HEAD_FONT, fontSize=15, leading=20,
    alignment=TA_LEFT, textColor=ACCENT, spaceBefore=14, spaceAfter=8
))
styles.add(ParagraphStyle(
    name='H3', fontName=HEAD_FONT, fontSize=12, leading=16,
    alignment=TA_LEFT, textColor=COVER_BLOCK, spaceBefore=10, spaceAfter=6
))
styles.add(ParagraphStyle(
    name='Body', fontName=BODY_FONT, fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceBefore=0, spaceAfter=6, firstLineIndent=0
))
styles.add(ParagraphStyle(
    name='BodyIndent', fontName=BODY_FONT, fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
    spaceBefore=0, spaceAfter=6, leftIndent=18
))
styles.add(ParagraphStyle(
    name='BulletItem', fontName=BODY_FONT, fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=2, spaceAfter=2, leftIndent=24, bulletIndent=12
))
styles.add(ParagraphStyle(
    name='TableHeader', fontName=BODY_FONT, fontSize=10,
    textColor=colors.white, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name='TableCell', fontName=BODY_FONT, fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK'
))
styles.add(ParagraphStyle(
    name='TableCellCenter', fontName=BODY_FONT, fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name='Caption', fontName=BODY_FONT, fontSize=9, leading=12,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6
))
styles.add(ParagraphStyle(
    name='Callout', fontName=BODY_FONT, fontSize=11, leading=17,
    alignment=TA_LEFT, textColor=ACCENT, leftIndent=24,
    borderPadding=8, spaceBefore=8, spaceAfter=8
))
styles.add(ParagraphStyle(
    name='ScoreBig', fontName=HEAD_FONT, fontSize=28, leading=34,
    alignment=TA_CENTER, textColor=ACCENT
))
styles.add(ParagraphStyle(
    name='ScoreLabel', fontName=BODY_FONT, fontSize=9, leading=12,
    alignment=TA_CENTER, textColor=TEXT_MUTED
))

# ─── Page dimensions ───
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ─── TOC Document Template ───
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

# Orphan prevention threshold
H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_major_section(text, style):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, style, level=0),
    ]

# ─── Helpers ───
def make_table(data, col_ratios, caption_text=None):
    """Create a styled table with proportional column widths."""
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_commands.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_commands))
    elements = [Spacer(1, 18), t]
    if caption_text:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption_text, styles['Caption']))
    elements.append(Spacer(1, 18))
    return elements

def score_badge(score, max_score=10):
    """Return colored score text."""
    if score >= 8:
        c = SEM_SUCCESS
    elif score >= 6:
        c = SEM_WARNING
    else:
        c = SEM_ERROR
    return Paragraph('<font color="#%s">%s / %s</font>' % (c.hexval()[2:], score, max_score), styles['TableCellCenter'])

def colored_status(status):
    """Return colored status indicator."""
    mapping = {
        'Excellent': SEM_SUCCESS, 'Bon': SEM_SUCCESS, 'Tres bon': SEM_SUCCESS,
        'Moyen': SEM_WARNING, 'Partiel': SEM_WARNING, 'Simule': SEM_WARNING,
        'Faible': SEM_ERROR, 'Manquant': SEM_ERROR, 'Critique': SEM_ERROR,
    }
    c = mapping.get(status, TEXT_MUTED)
    return Paragraph('<font color="#%s">%s</font>' % (c.hexval()[2:], status), styles['TableCellCenter'])

# ═══════════════════════════════════════════════════════════════
# BUILD DOCUMENT
# ═══════════════════════════════════════════════════════════════

OUTPUT_PATH = '/home/z/my-project/download/healthflow-guinea-audit-strategique.pdf'

doc = TocDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='HealthFlow Guinea - Audit Strategique et Axes d\'Evolution',
    author='DataSphere Innovation - Z.ai',
    creator='Z.ai',
)

story = []

# ─── Table of Contents ───
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontName=BODY_FONT, fontSize=12, leading=20, leftIndent=20, spaceBefore=4),
    ParagraphStyle(name='TOC2', fontName=BODY_FONT, fontSize=10.5, leading=18, leftIndent=40, spaceBefore=2),
]
story.append(Paragraph('<b>Table des matieres</b>', styles['H1']))
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 1: RESUME EXECUTIF
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('1. Resume executif', styles['H1']))

story.append(Paragraph(
    "HealthFlow Guinea est un systeme d'information hospitalier (SIH) developpe par DataSphere Innovation, "
    "fonde par Sekouna KABA. Ce systeme vise a digitaliser la gestion des etablissements de sante en "
    "Republique de Guinee, en integrant les standards internationaux (HL7 FHIR R4, DHIS2) avec les "
    "realites locales (Mobile Money, authentification OTP par telephone, langues nationales guineennes). "
    "L'audit realise couvre l'ensemble du codebase : architecture, securite, gestion des patients, "
    "rendez-vous, multi-hopitaux, conformite FHIR, paiements, mode hors-ligne, et qualite du code.",
    styles['Body']
))

story.append(Spacer(1, 12))

# Scorecard table
score_data = [
    [Paragraph('<b>Categorie</b>', styles['TableHeader']),
     Paragraph('<b>Score</b>', styles['TableHeader']),
     Paragraph('<b>Statut</b>', styles['TableHeader']),
     Paragraph('<b>Commentaire</b>', styles['TableHeader'])],
    [Paragraph('Couverture fonctionnelle', styles['TableCell']),
     score_badge(9.5), colored_status('Excellent'),
     Paragraph('48 vues, 30+ routes API, 30+ modeles Prisma', styles['TableCell'])],
    [Paragraph('Securite', styles['TableCell']),
     score_badge(7.0), colored_status('Moyen'),
     Paragraph('Framework complet mais application inconsistante', styles['TableCell'])],
    [Paragraph('Modele de donnees', styles['TableCell']),
     score_badge(9.0), colored_status('Excellent'),
     Paragraph('Schema Prisma tres complet, specifique Guinee', styles['TableCell'])],
    [Paragraph('Authentification', styles['TableCell']),
     score_badge(7.0), colored_status('Moyen'),
     Paragraph('OTP telephonique OK, MFA incomplet', styles['TableCell'])],
    [Paragraph('Conformite FHIR R4', styles['TableCell']),
     score_badge(8.0), colored_status('Bon'),
     Paragraph('Types et mapping complets, stockage en memoire', styles['TableCell'])],
    [Paragraph('PWA / Hors-ligne', styles['TableCell']),
     score_badge(8.5), colored_status('Tres bon'),
     Paragraph('Service Worker + IndexedDB + sync queue', styles['TableCell'])],
    [Paragraph('Internationalisation', styles['TableCell']),
     score_badge(8.0), colored_status('Bon'),
     Paragraph('5 locales dont 3 langues nationales guineennes', styles['TableCell'])],
    [Paragraph('Paiements Mobile Money', styles['TableCell']),
     score_badge(5.0), colored_status('Simule'),
     Paragraph('Integration entierement simulee, pas de vrai fournisseur', styles['TableCell'])],
    [Paragraph('Qualite du code', styles['TableCell']),
     score_badge(6.0), colored_status('Moyen'),
     Paragraph('Donnees demo melangees, pas de tests, pas de validation', styles['TableCell'])],
    [Paragraph('Preparation production', styles['TableCell']),
     score_badge(5.0), colored_status('Faible'),
     Paragraph('Integrations simulees, stores en memoire, pas de migrations', styles['TableCell'])],
]
story.extend(make_table(score_data, [0.22, 0.10, 0.10, 0.58], 'Tableau 1 : Scorecard global HealthFlow Guinea'))

story.append(Paragraph(
    "<b>Score global : 7.3 / 10</b> — HealthFlow Guinea presente une couverture fonctionnelle "
    "exceptionnelle pour un SIH, avec une architecture pensee pour le contexte guineen. Cependant, "
    "un ecart significatif existe entre la richesse du modele/UI et l'integration reelle du backend. "
    "La priorite absolue est de combler cet ecart pour atteindre le niveau de production.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# SECTION 2: POINTS FORTS
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('2. Points forts du systeme', styles['H1']))

# 2.1 Architecture multi-hopitaux
story.append(add_heading('2.1 Architecture multi-hopitaux et hierarchy organisationnelle', styles['H2'], level=1))
story.append(Paragraph(
    "Le systeme implemente une veritable architecture multi-etablissements avec 10 hopitaux reels de "
    "Guinee (CHU Donka, CHU Ignace Deen, Hopital Kipe, HGR Kindia, CHU Kankan, CHU N\'Zerekore, "
    "HGR Labe, HGR Boke, HGR Mamou, HGR Faranah), repartis sur les 8 regions administratives. "
    "Chaque etablissement dispose de services autonomes (15 services pour les CHU, 8 pour les HGR), "
    "avec une hierarchie de roles complete : Directeur General, Directeur Regional, Directeur Hopital, "
    "Chef de Service, Medecin, Infirmier, Laborantin, Pharmacien, Secretaire, ASC, Patient. Le systeme "
    "de delegation inter-services avec prise en charge d'urgence (auto-expiration 24h) est une innovation "
    "pertinente pour les contextes ou les chefs de service peuvent etre indisponibles.",
    styles['Body']
))
story.append(Paragraph(
    "Le commutateur de portee (scope switcher) permet de naviguer entre les niveaux National, Regional, "
    "Hopital et Service avec un badge visuel code par couleur. Le schema Prisma inclut une hierarchie "
    "d'etablissements via parentId, permettant de modeliser des cliniques sous un hopital. La Row-Level "
    "Security (RLS) est implementee avec des filtres par role et par etablissement, ainsi que du masquage "
    "de champs sensibles. Le modele de donnees supporte les transferts inter-services avec workflow "
    "d'approbation et piste d'audit complete.",
    styles['Body']
))

# 2.2 Conformite FHIR R4
story.append(add_heading('2.2 Conformite HL7 FHIR R4 et interoperabilite', styles['H2'], level=1))
story.append(Paragraph(
    "HealthFlow Guinea implemente une couche FHIR R4 remarquablement complete avec les ressources "
    "Patient, Observation, Encounter, DiagnosticReport, MedicationRequest, Practitioner, Organization "
    "et Bundle. Les mappings bidirectionnels (interne vers FHIR et FHIR vers interne) sont implementes "
    "avec des extensions guineennes specifiques : code systeme pour l'ID national de sante, zones de "
    "sante, etablissements et formulaire national de medicaments. Le serveur FHIR expose un endpoint "
    "CRUD complet a /api/fhir/[...path] avec support des parametres de recherche (nom, identifiant, "
    "genre, date de naissance, telephone), des operations ($validate, $everything, $export) et une "
    "Capability Statement R4 complete avec 7 types de ressources. C'est un atout majeur pour "
    "l'interoperabilite avec les systemes DHIS2, les registres nationaux et les systemes tiers.",
    styles['Body']
))

# 2.3 Securite multicouche
story.append(add_heading('2.3 Framework de securite multicouche', styles['H2'], level=1))
story.append(Paragraph(
    "Le systeme dispose d'un framework de securite ambitieux avec 15+ mecanismes de protection : "
    "chiffrement AES-256-GCM (client WebCrypto + serveur Node crypto), hachage bcrypt (facteur 12) "
    "avec fallback PBKDF2, protection CSRF double-submit cookie + validation d'origine, CORS restrictif "
    "sans wildcard, headers CSP avec nonce, rate limiting (100/min API, 10/min auth), sanitisation "
    "d'entrees anti-XSS recursive, comparaison en temps constant (anti-timing attack), generation de "
    "tokens securisee via crypto.getRandomValues, verification JWT cote serveur, RBAC granulaire "
    "(8 roles, 17 ressources), RBAC unifie avec scopes cliniques + management, Row-Level Security "
    "avec filtres par role et masquage de champs, audit logging avec 15 types d'evenements et niveaux "
    "de severite, et secureApiHandler comme usine a middleware (Rate Limit, Auth, CSRF, RBAC, Audit, "
    "Handler). Cette couche securitaire est comparable a celle de systemes comme EPIC ou Cerner.",
    styles['Body']
))

# 2.4 PWA et hors-ligne
story.append(add_heading('2.4 Capacites PWA et fonctionnement hors-ligne', styles['H2'], level=1))
story.append(Paragraph(
    "Le systeme implemente une strategie offline-complete avec Service Worker (cache-first pour le "
    "statique, network-first pour les API, stale-while-revalidate pour les pages), une IndexedDB "
    "avec 5 object stores et file de synchronisation, des operations CRUD hors-ligne completes, "
    "une synchronisation en masse (offlineBulkSync), une resolution de conflits par dernier-ecriture "
    "avec comparaison d'horodatage, et une file de mutations offline (POST/PUT/DELETE mis en attente). "
    "Cette capacite est essentielle pour la Guinee ou la connectivite internet est intermittente, "
    "particulierement dans les regions interieures. Les agents de sante communautaire (ASC) peuvent "
    "continuer a travailler en zone rurale sans connexion et synchroniser a leur retour au centre de sante.",
    styles['Body']
))

# 2.5 Internationalisation guineenne
story.append(add_heading('2.5 Internationalisation contextuelle guineenne', styles['H2'], level=1))
story.append(Paragraph(
    "HealthFlow est le seul SIH a offrir 5 locales incluant 3 langues nationales guineennes : "
    "Francais (defaut), Anglais, Maninka (msk), Soussou (sus), et Poular (ff). L'implementation "
    "utilise un provider React Context avec chargement paresseux des messages JSON, une detection "
    "automatique de la langue du navigateur, une persistance dans localStorage, et un fallback "
    "vers le francais. Cette localisation profonde est un avantage concurrentiel considerable : "
    "elle permet aux agents de sante communautaire d'utiliser le systeme dans leur langue maternelle, "
    "considerant que beaucoup ne maitrisent pas le francais ecrit. C'est un facteur d'adoption "
    "determinant dans un pays ou 65% de la population parle principalement une langue locale.",
    styles['Body']
))

# 2.6 Modele de donnees guineen
story.append(add_heading('2.6 Modele de donnees adapte au contexte guineen', styles['H2'], level=1))
story.append(Paragraph(
    "Le schema Prisma est exceptionnellement complet avec 30+ modeles couvrant tous les domaines "
    "hospitaliers : infrastructure (Establishment, Department, Room, Bed), RBAC (User, Role, Permission, "
    "UserRole, UserEstablishment), patients (Patient, PatientAllergy, PatientAntecedent, MedicalDocument), "
    "consultations (Consultation, Prescription, PrescriptionItem), laboratoire (LabTestCatalog, LabRequest, "
    "LabResult), pharmacie (Medication, MedicationStock, ShortageAlert, ExpirationTracking), maternite "
    "(PregnancyTracking, PregnancyVisit, Delivery, Child), et 15 autres domaines. Le modele integre "
    "des specifics guineens : format telephonique +224, detection automatique Orange Money/MTN MoMo "
    "par prefix, ID national de sante, etablissements reels avec coordonnees geographiques, et "
    "compagnies d'assurance locales.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# SECTION 3: POINTS FAIBLES
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('3. Points faibles et lacunes critiques', styles['H1']))

# 3.1 Portail patient
story.append(add_heading('3.1 Portail patient incomplet et sans comptes persistants', styles['H2'], level=1))
story.append(Paragraph(
    "C'est la lacune la plus critique au regard de la demande utilisateur. Le portail patient existe "
    "dans l'interface (patient-portal.tsx) avec un ecran de connexion par telephone + OTP, un tableau "
    "de bord affichant informations personnelles, allergies, groupe sanguin, rendez-vous et documents "
    "medicaux, et la possibilite de prendre un rendez-vous. Cependant, le portail souffre de lacunes "
    "majeures qui l'empechent d'etre fonctionnel en production. Premierement, il n'existe pas de modele "
    "PatientAccount dans Prisma : les patients ne sont pas des utilisateurs dans le systeme RBAC. "
    "L'authentification est entierement cote client (Zustand store) sans JWT ni session persistante. "
    "Deuxiemement, les patients ne peuvent pas creer leur propre compte (pas d'auto-enregistrement), "
    "ni editer leur profil (portail en lecture seule). Troisiemement, les codes OTP sont affiches dans "
    "des toasts en mode demo plutot qu'envoyes par SMS. Quatriemement, le systeme de comptes familiaux "
    "existe dans le store mais n'a aucune persistance en base de donnees.",
    styles['Body']
))
story.append(Paragraph(
    "Pour devenir un leader de la gestion hospitaliere avec suivi patient, HealthFlow doit impérativement "
    "creer un veritable systeme de comptes patients avec authentification securisee, persistance en base, "
    "auto-enregistrement, edition de profil, historique medical complet, et gestion des comptes familiaux. "
    "C'est la difference entre un systeme de gestion interne et une plateforme patient-centree.",
    styles['Body']
))

# 3.2 Systeme de rendez-vous
story.append(add_heading('3.2 Systeme de rendez-vous incomplet', styles['H2'], level=1))
story.append(Paragraph(
    "Le module de rendez-vous presente une interface riche (liste, calendrier, creation, statuts) "
    "et un modele Prisma complet (Appointment, DoctorAgenda avec horaires par jour, duree de slot, "
    "capacite maximale). Cependant, plusieurs fonctionnalites essentielles manquent. Il n'y a pas de "
    "verification de disponibilite en temps reel : le patient ne peut pas voir les creneaux disponibles "
    "d'un medecin avant de prendre rendez-vous. La detection de conflits (double-reservation) est absente. "
    "Le reprogrammation n'a pas de flux UI malgre le statut RESCHEDULED dans Prisma. L'agenda medecin "
    "n'a pas d'interface de gestion : les medecins ne peuvent pas configurer leurs disponibilites. "
    "Les rappels automatiques ne sont pas declenches (reminderSentAt et reminderType existent dans le "
    "schema mais aucun planificateur ne les utilise). Enfin, il manque un endpoint PUT/PATCH pour la "
    "mise a jour des rendez-vous existants cote API.",
    styles['Body']
))

# 3.3 Securite inconsistante
story.append(add_heading('3.3 Application inconsistante de la securite', styles['H2'], level=1))
story.append(Paragraph(
    "Bien que le framework securitaire soit complet, son application est inconsistante a travers "
    "le codebase. Le probleme le plus grave est que la plupart des routes API n'utilisent pas le "
    "secureApiHandler qui encapsule auth, CSRF, RBAC et audit. Les routes /api/patients, /api/appointments "
    "et d'autres exportent directement leurs handlers sans protection. En complement, le journal d'audit "
    "est stocke uniquement en memoire (Map dans audit-logger.ts), ce qui signifie que toutes les traces "
    "d'audit sont perdues au redemarrage du serveur. Les stores de sessions actives et de rate limiting "
    "sont egalement en memoire, ce qui ne fonctionne pas en deploiement multi-instances. La cle de "
    "chiffrement AES-256-GCM a un fallback hardcoded ('healthflow-guinea-32byte-encrypt-k') qui devrait "
    "echouer en production. Le mode demo fait confiance aux headers x-user-id/x-user-role, ce qui pourrait "
    "permettre une usurpation d'identite si le mode dev est accidentellement active en production. "
    "La reference de transaction Mobile Money utilise Math.random() au lieu de generateSecureToken().",
    styles['Body']
))

# 3.4 Validation et qualite
story.append(add_heading('3.4 Absence de validation des entrees et de tests', styles['H2'], level=1))
story.append(Paragraph(
    "Aucune route API n'utilise de schema de validation Zod pour valider les entrees. Les routes "
    "acceptent du JSON brut sans verification de format, de type ou de contraintes. Cela expose le "
    "systeme a des injections, des donnees incoherentes et des erreurs d'execution. Par exemple, "
    "la route POST /api/patients n'a aucune validation sur les champs obligatoires, les formats "
    "de telephone, les dates ou les identifiants nationaux. De plus, le codebase ne contient aucun "
    "fichier de test. Zero couverture de tests unitaires, d'integration ou end-to-end. Pour un systeme "
    "de sante ou des erreurs peuvent avoir des consequences vitales, c'est une lacune critique qui "
    "doit etre comblee avant tout deploiement en production.",
    styles['Body']
))

# 3.5 Integrations simulees
story.append(add_heading('3.5 Integrations entierement simulees', styles['H2'], level=1))
story.append(Paragraph(
    "Toutes les integrations externes sont simulees avec des taux de reussite artificiels. Orange Money "
    "et MTN MoMo simulent des paiements avec des taux de 90% et 88% respectivement, mais aucun appel "
    "reel aux API des operateurs n'est effectue. Les webhooks de callback retournent toujours true. "
    "Le connecteur DHIS2 est une interface sans veritable integration API. Le visualiseur DICOM est "
    "un composant UI sans lecteur reel. L'echange transfrontalier, les souscriptions FHIR, l'index "
    "maitre patient (MPI) et les messages ADT sont tous des composants UI sans logique metier backend. "
    "Le service de messagerie SMS/WhatsApp simule l'envoi avec des taux de 92%/95% mais n'appelle "
    "jamais les veritables API Twilio ou WhatsApp Business. Ce gap entre l'UI et le backend reel "
    "est le principal obstacle a la production.",
    styles['Body']
))

# 3.6 Donnees demo melangees
story.append(add_heading('3.6 Donnees de demonstration melangees au code de production', styles['H2'], level=1))
story.append(Paragraph(
    "Le fichier data-store.ts depasse les 1000 lignes avec 10 patients de demo, des rendez-vous, "
    "consultations, demandes de labo, medicaments, lits, urgences, grossesses, vaccinations, factures, "
    "teleconsultations, notifications, comptes familiaux, transactions Mobile Money, sinistres "
    "d'assurance, plans de paiement et alertes epidemiologiques, le tout melange avec les definitions "
    "de types et les actions du store. Cette architecture rend le code difficile a maintenir, a tester "
    "et a deployer. Les donnees de demo devraient etre separees dans des seeders Prisma, et le store "
    "Zustand devrait etre un client API plutot qu'un depôt de donnees. Le dual data layer (Zustand + "
    "Prisma) sans strategie de synchronisation claire cree de la confusion et des incoherences potentielles.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# SECTION 4: AXES D'AMELIORATION STRATEGIQUES
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('4. Axes d\'amelioration strategiques', styles['H1']))

# 4.1 Comptes patients
story.append(add_heading('4.1 Systeme de comptes patients avec suivi et rendez-vous', styles['H2'], level=1))
story.append(Paragraph(
    "La priorite absolue pour devenir un leader de la gestion hospitaliere est la mise en place "
    "d'un veritable systeme de comptes patients. Ce systeme doit permettre aux patients de creer "
    "leur propre compte via auto-enregistrement (telephone + OTP), de se connecter securiseement "
    "avec des sessions JWT persistantes, de consulter et modifier leur profil medical, d'acceder "
    "a leur historique medical complet (consultations, examens, ordonnances, vaccinations), de "
    "prendre, reprogrammer et annuler des rendez-vous en ligne, de recevoir des rappels SMS et "
    "WhatsApp, de gerer les comptes familiaux (conjoint, enfants, parents), de telecharger leurs "
    "documents medicaux, et de communiquer avec leurs medecins via messagerie securisee.",
    styles['Body']
))
story.append(Paragraph(
    "L'architecture proposee comprend un modele PatientAccount dans Prisma lie au Patient par "
    "patientId, avec champs phone, passwordHash (optionnel si OTP-only), email, preferredLanguage, "
    "notificationPreferences, et familyAccountId. Le PatientAccount heriterait du role RBAC 'Patient' "
    "avec permissions specifiques (lire son propre dossier, prendre rendez-vous, telecharger documents). "
    "Les sessions patients utiliseraient le meme mecanisme NextAuth avec JWT, et le portail patient "
    "deviendrait une veritable SPA avec son propre layout. Le systeme de comptes familiaux permettrait "
    "a un responsable de gerer les dossiers de tous les membres de sa famille depuis un seul compte.",
    styles['Body']
))

# 4.2 Suivi patient
story.append(add_heading('4.2 Suivi patient et parcours de soins', styles['H2'], level=1))
story.append(Paragraph(
    "Pour depasser les standards internationaux, HealthFlow doit implementer un systeme de suivi "
    "patient structure qui va au-dela du simple enregistrement. Cela inclut des plans de soins "
    "personnalises (CarePlan) avec objectifs, interventions et jalons, une gestion des maladies "
    "chroniques avec tableau de bord dedie (filtrage par isChronic, alertes de suivi), une "
    "planification automatique de rendez-vous de suivi apres consultation (si followUpNeeded), "
    "des parcours de soins par pathologie (diabete, hypertension, paludisme, VIH/SIDA, tuberculose), "
    "une timeline patient unifiee presentant chronologiquement tous les evenements (consultations, "
    "examens, hospitalisations, vaccinations), un suivi des readmissions avec indicateur de "
    "readmission a 30 jours, et des alertes de rappel automatiques pour les patients perdus de vue. "
    "Le modele Prisma supporte deja les antecedents chroniques (isChronic) et les instructions de "
    "suivi (followUpInstructions), mais il manque l'orchestration et l'automatisation.",
    styles['Body']
))

# 4.3 Amelioration rendez-vous
story.append(add_heading('4.3 Systeme de rendez-vous intelligent', styles['H2'], level=1))
story.append(Paragraph(
    "Le systeme de rendez-vous doit evoluer vers un systeme intelligent comparable aux meilleures "
    "plateformes de sante digitale. Les ameliorations prioritaires incluent la verification en temps "
    "reel de la disponibilite des medecins (endpoint /api/doctors/{id}/slots avec calcul automatique "
    "des creneaux libres depuis DoctorAgenda), la detection et prevention des conflits de rendez-vous, "
    "la reprogrammation avec historique (lien vers le rendez-vous original), l'interface de gestion "
    "d'agenda pour les medecins, les rendez-vous recurrents pour les suivis chroniques, une liste "
    "d'attente avec notification automatique en cas de desistement, des rappels automatiques "
    "multicanaux (SMS 24h avant, WhatsApp 2h avant), et un endpoint PUT/PATCH complet pour les "
    "modifications. Le choix du creneau devrait etre visuel avec un calendrier interactif "
    "montrant les disponibilites en temps reel, inspire de Doctolib et Zocdoc.",
    styles['Body']
))

# 4.4 Application securite
story.append(add_heading('4.4 Application consistante de la securite sur toutes les routes', styles['H2'], level=1))
story.append(Paragraph(
    "Chaque route API doit imperativement utiliser le secureApiHandler pour garantir l'authentification, "
    "la protection CSRF, le controle RBAC et la journalisation d'audit. Le journal d'audit doit etre "
    "persiste en base de donnees (modele AuditLog existant dans Prisma) plutot qu'en memoire. Les "
    "stores de sessions et de rate limiting doivent migrer vers Redis pour le deploiement multi-instances. "
    "La cle de chiffrement ne doit jamais avoir de fallback hardcoded : le serveur doit refuser de "
    "demarrer si ENCRYPTION_KEY n'est pas definie. Le mode demo ne doit jamais faire confiance aux "
    "headers x-user-id/x-user-role, meme en developpement. La reference de transaction Mobile Money "
    "doit utiliser generateSecureToken(). Un audit OWASP Top 10 complet doit etre realise avant la "
    "production, et un scanner de dependances (npm audit, Snyk) doit etre integre au CI/CD.",
    styles['Body']
))

# 4.5 Validation et tests
story.append(add_heading('4.5 Validation des entrees et couverture de tests', styles['H2'], level=1))
story.append(Paragraph(
    "Chaque route API doit utiliser des schemas Zod pour valider les entrees : champs obligatoires, "
    "formats (telephone +224, email, dates), types (enum pour statut, genre, groupe sanguin), "
    "contraintes (longueur minimale/maximale, plage de dates). Un framework de tests doit etre mis "
    "en place avec Jest et React Testing Library, avec un objectif initial de 80% de couverture "
    "sur les routes API critiques (auth, patients, rendez-vous, paiements). Les tests E2E avec "
    "Playwright doivent couvrir les flux patients complets : enregistrement, connexion, prise de "
    "rendez-vous, consultation du dossier, paiement. Les tests d'integration doivent verifier les "
    "scenarios multi-hopitaux et les permissions RBAC. Un pipeline CI/CD doit bloquer tout merge "
    "qui reduit la couverture de tests en dessous du seuil.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# SECTION 5: EVOLUTIONS POUR DEVENIR LEADER MONDIAL
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('5. Evolutions pour devenir un leader mondial', styles['H1']))

# 5.1 IA et diagnostics
story.append(add_heading('5.1 Intelligence artificielle et aide au diagnostic', styles['H2'], level=1))
story.append(Paragraph(
    "HealthFlow dispose deja de composants IA (diagnostic assistant, drug interactions, epidemiological "
    "surveillance, preconsultation AI), mais ils sont tous au stade UI sans backend reel. Pour devenir "
    "un leader, le systeme doit integrer des modeles d'IA reellement fonctionnels. L'aide au diagnostic "
    "doit utiliser le SDK z-ai-web-dev-sdk pour fournir des suggestions diagnostiques basees sur les "
    "symptomes, les antecedents et les resultats d'examens, avec un taux de concordance medecin-IA "
    "mesurable. La preconsultation IA doit generer un questionnaire adaptatif avant la consultation, "
    "reduisant le temps de consultation de 30-40%. La surveillance epidemiologique doit detecter "
    "automatiquement les clusters de maladies et declencher des alertes vers les autorites sanitaires. "
    "Les interactions medicamenteuses doivent verifier en temps reel les prescriptions contre la base "
    "de donnees des medicaments avec alertes de severite. Un moteur de recommandation de parcours de "
    "soins doit suggerer des protocoles bases sur les guidelines OMS adaptees au contexte guineen.",
    styles['Body']
))

# 5.2 Telemedecine
story.append(add_heading('5.2 Telemedecine et consultation a distance', styles['H2'], level=1))
story.append(Paragraph(
    "La telemedecine est un axe strategique majeur pour un pays comme la Guinee ou 70% de la population "
    "vit en zone rurale avec un acces limite aux specialists. Le systeme a deja des composants de "
    "teleconsultation (video, chat, salle d'attente virtuelle, preconsultation), mais le backend de "
    "signalisation WebRTC et les sessions doivent etre reellement implementes. L'evolution doit inclure "
    "une integration WebRTC complete avec serveur TURN/STUN pour les reseaux contraints, un systeme de "
    "ordonnance numerique signee electroniquement pendant la teleconsultation, une file d'attente "
    "intelligente avec estimation du temps d'attente, la possibilite pour le patient de partager son "
    "ecran pour montrer des documents medicaux, et un enregistrement securise des consultations avec "
    "consentement patient. Les indicateurs de succes seront le nombre de consultations a distance "
    "par mois, le taux de satisfaction patient, et le taux de resolution sans deplacement physique.",
    styles['Body']
))

# 5.3 Blockchain
story.append(add_heading('5.3 Blockchain pour la traceabilite et la confiance', styles['H2'], level=1))
story.append(Paragraph(
    "Pour se differencier des SIH existants comme EPIC, Cerner ou MEDITECH, HealthFlow peut adopter "
    "la blockchain pour la traceabilite des donnees de sante. L'utilisation la plus impactante est le "
    "consentement patient sur blockchain : chaque acces au dossier medical est enregistre sur une "
    "chaine privee (Hyperledger Fabric ou EVM-compatible), et le patient peut donner, modifier ou "
    "revoquer son consentement de maniere verifiable et immuable. La traconsabilite des medicaments "
    "sur blockchain permet de lutter contre les medicaments contrefaits, un probleme majeur en Afrique "
    "de l'Ouest ou 30% des medicaments sont sous-qualites selon l'OMS. Les certifications "
    "numeriques de naissance et de deces sur blockchain renforcent l'etat civil. Le Dossier Medical "
    "Portable (Personal Health Record) chiffre et decentralise donne au patient un controle total "
    "sur ses donnees, sans dependance a un etablissement unique. C'est un differentiateur strategique "
    "qu'aucun SIH traditionnel n'offre actuellement a l'echelle nationale.",
    styles['Body']
))

# 5.4 Digital Twin
story.append(add_heading('5.4 Digital Twin hospitalier et optimisation operationnelle', styles['H2'], level=1))
story.append(Paragraph(
    "Le concept de Digital Twin (jumeau numerique) applique aux hopitaux est une innovation de pointe "
    "que HealthFlow peut etre parmi les premiers a implementer dans un SIH. Le Digital Twin hospitalier "
    "est une modelisation en temps reel de l'hopital qui simule les flux de patients, les occupations "
    "de lits, la charge de travail du personnel et les resources disponibles. Il permet l'optimisation "
    "predictive : anticipation des pics d'activite (grippe saisonniere, paludisme en saison des pluies), "
    "allocation dynamique des resources (lits, personnel, medicaments), simulation de scenarios (fermeture "
    "d'un service, arrivee d'un patient critique, epidemie), et planification preventive de la maintenance "
    "des equipements medicaux. Les donnees du modele Prisma (Admission, HospitalizationTracking, "
    "EmergencyCase, Bed) fournissent deja les bases pour construire ce jumeau numerique.",
    styles['Body']
))

# 5.5 Open API
story.append(add_heading('5.5 Plateforme ouverte et ecosysteme d\'applications', styles['H2'], level=1))
story.append(Paragraph(
    "Pour devenir un leader, HealthFlow doit evoluer d'un produit vers une plateforme. Cela signifie "
    "ouvrir les API avec une documentation interactive (OpenAPI/Swagger), un portail developpeur avec "
    "cles API, SDK et sandbox, un marche d'applications tierces (telemedicine specialisee, apps de "
    "bien-etre, outils de recherche clinique), des webhooks configurables pour les evenements systeme "
    "(nouveau patient, resultat d'examen, rappel de vaccination), et un framework de plugins permettant "
    "aux etablissements de personnaliser leur instance. EPIC App Orchard et Cerner code Console sont "
    "les references mondiales, mais elles sont reservees au marche americain. Un ecosysteme ouvert "
    "adapte a l'Afrique de l'Ouest avec des APIs en francais et une documentation accessible aux "
    "developpeurs locaux serait un differentiateur unique.",
    styles['Body']
))

# 5.6 Patient Experience
story.append(add_heading('5.6 Experience patient mobile-first et universelle', styles['H2'], level=1))
story.append(Paragraph(
    "L'experience patient doit etre repensee comme une application mobile-first, car en Guinee le "
    "smartphone est le principal point d'acces internet. L'application doit inclure un onboarding "
    "progressif (inscription en 3 etapes avec verification OTP), un tableau de bord personnalise "
    "avec carte de sante numerique (QR code), la prise de rendez-vous en 3 clics avec selection "
    "visuelle de creneaux, le paiement Mobile Money integre (Orange Money et MTN MoMo) avec "
    "confirmation instantanee, la teleconsultation video depuis l'app, le suivi de grossesse avec "
    "calendrier de consultations prenatales, le carnet de vaccination numerique avec rappels, "
    "la messagerie securisee avec les equipes soignantes, et la geolocalisation des etablissements "
    "de sante les plus proches. L'application doit fonctionner entierement hors-ligne pour les "
    "fonctionnalites critiques, avec synchronisation automatique quand la connexion revient.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# SECTION 6: FEUILLE DE ROUTE
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('6. Feuille de route d\'evolution (12 mois)', styles['H1']))

roadmap_data = [
    [Paragraph('<b>Phase</b>', styles['TableHeader']),
     Paragraph('<b>Duree</b>', styles['TableHeader']),
     Paragraph('<b>Priorite</b>', styles['TableHeader']),
     Paragraph('<b>Livrables cles</b>', styles['TableHeader'])],
    [Paragraph('Phase 9 : Comptes patients', styles['TableCell']),
     Paragraph('Mois 1-2', styles['TableCellCenter']),
     colored_status('Critique'),
     Paragraph('PatientAccount Prisma, portail patient securise, auto-enregistrement, JWT, comptes familiaux', styles['TableCell'])],
    [Paragraph('Phase 10 : Rendez-vous intelligent', styles['TableCell']),
     Paragraph('Mois 2-3', styles['TableCellCenter']),
     colored_status('Critique'),
     Paragraph('Verification disponibilite, detection conflits, agenda medecin, rappels automatiques, reprogrammation', styles['TableCell'])],
    [Paragraph('Phase 11 : Securite production', styles['TableCell']),
     Paragraph('Mois 3-4', styles['TableCellCenter']),
     colored_status('Critique'),
     Paragraph('secureApiHandler sur toutes les routes, audit DB, Redis sessions, Zod validation, tests 80%', styles['TableCell'])],
    [Paragraph('Phase 12 : Integrations reelles', styles['TableCell']),
     Paragraph('Mois 4-6', styles['TableCellCenter']),
     colored_status('Moyen'),
     Paragraph('Orange Money API, MTN MoMo API, Twilio SMS, DHIS2 push/pull, MPI reel, DICOM viewer', styles['TableCell'])],
    [Paragraph('Phase 13 : Suivi patient et parcours de soins', styles['TableCell']),
     Paragraph('Mois 5-7', styles['TableCellCenter']),
     colored_status('Moyen'),
     Paragraph('CarePlan, maladies chroniques, parcours par pathologie, timeline patient, readmissions, rappels', styles['TableCell'])],
    [Paragraph('Phase 14 : IA et telemedecine', styles['TableCell']),
     Paragraph('Mois 7-9', styles['TableCellCenter']),
     colored_status('Moyen'),
     Paragraph('Aide diagnostic z-ai, preconsultation IA, surveillance epi, WebRTC teleconsultation, ordonnance numerique', styles['TableCell'])],
    [Paragraph('Phase 15 : Plateforme et ecosysteme', styles['TableCell']),
     Paragraph('Mois 9-11', styles['TableCellCenter']),
     colored_status('Partiel'),
     Paragraph('Open API, portail developpeur, webhooks, SDK, marche d\'apps, documentation Swagger', styles['TableCell'])],
    [Paragraph('Phase 16 : Innovations avancees', styles['TableCell']),
     Paragraph('Mois 10-12', styles['TableCellCenter']),
     colored_status('Partiel'),
     Paragraph('Blockchain consentement/traceabilite, Digital Twin hospitalier, app mobile native, PHR decentralise', styles['TableCell'])],
]
story.extend(make_table(roadmap_data, [0.18, 0.10, 0.10, 0.62], 'Tableau 2 : Feuille de route d\'evolution sur 12 mois'))

# ═══════════════════════════════════════════════════════════════
# SECTION 7: BENCHMARK INTERNATIONAL
# ═══════════════════════════════════════════════════════════════

story.extend(add_major_section('7. Benchmark international et positionnement', styles['H1']))

story.append(Paragraph(
    "Pour evaluer le positionnement de HealthFlow Guinea par rapport aux leaders mondiaux, nous "
    "comparons les fonctionnalites cles avec les systemes EPIC (leader mondial, 45% du marche US), "
    "Cerner (Oracle Health, 25% du marche US), MEDITECH (leader PME hospitalieres), et les "
    "solutions open source OpenMRS et DHIS2 dominantes en Afrique. Le tableau suivant presente "
    "cette comparaison sur les axes strategiques.",
    styles['Body']
))

bench_data = [
    [Paragraph('<b>Fonctionnalite</b>', styles['TableHeader']),
     Paragraph('<b>EPIC</b>', styles['TableHeader']),
     Paragraph('<b>Cerner</b>', styles['TableHeader']),
     Paragraph('<b>OpenMRS</b>', styles['TableHeader']),
     Paragraph('<b>HealthFlow</b>', styles['TableHeader'])],
    [Paragraph('Portail patient', styles['TableCell']),
     Paragraph('MyChart (leader)', styles['TableCellCenter']),
     Paragraph('Patient Portal', styles['TableCellCenter']),
     Paragraph('Basique', styles['TableCellCenter']),
     colored_status('Faible')],
    [Paragraph('Prise de RDV en ligne', styles['TableCell']),
     Paragraph('Complet', styles['TableCellCenter']),
     Paragraph('Complet', styles['TableCellCenter']),
     Paragraph('Basique', styles['TableCellCenter']),
     colored_status('Partiel')],
    [Paragraph('Multi-hopitaux', styles['TableCell']),
     Paragraph('Enterprise', styles['TableCellCenter']),
     Paragraph('Enterprise', styles['TableCellCenter']),
     Paragraph('Limité', styles['TableCellCenter']),
     colored_status('Bon')],
    [Paragraph('FHIR R4', styles['TableCell']),
     Paragraph('Certifie', styles['TableCellCenter']),
     Paragraph('Certifie', styles['TableCellCenter']),
     Paragraph('Partiel', styles['TableCellCenter']),
     colored_status('Partiel')],
    [Paragraph('Telemedecine', styles['TableCell']),
     Paragraph('Integre', styles['TableCellCenter']),
     Paragraph('Partenaire', styles['TableCellCenter']),
     Paragraph('Plugin', styles['TableCellCenter']),
     colored_status('Simule')],
    [Paragraph('Mobile Money', styles['TableCell']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     colored_status('Simule')],
    [Paragraph('Langues locales', styles['TableCell']),
     Paragraph('Multi-langue', styles['TableCellCenter']),
     Paragraph('Multi-langue', styles['TableCellCenter']),
     Paragraph('i18n basique', styles['TableCellCenter']),
     colored_status('Tres bon')],
    [Paragraph('Mode hors-ligne', styles['TableCell']),
     Paragraph('Non', styles['TableCellCenter']),
     Paragraph('Non', styles['TableCellCenter']),
     Paragraph('Partiel', styles['TableCellCenter']),
     colored_status('Tres bon')],
    [Paragraph('Contexte guineen', styles['TableCell']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     colored_status('Excellent')],
    [Paragraph('IA diagnostique', styles['TableCell']),
     Paragraph('Emergent', styles['TableCellCenter']),
     Paragraph('Emergent', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     colored_status('Simule')],
    [Paragraph('Open API / Ecosysteme', styles['TableCell']),
     Paragraph('App Orchard', styles['TableCellCenter']),
     Paragraph('code Console', styles['TableCellCenter']),
     Paragraph('REST API', styles['TableCellCenter']),
     colored_status('Manquant')],
    [Paragraph('Blockchain / PHR', styles['TableCell']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     Paragraph('N/A', styles['TableCellCenter']),
     colored_status('Manquant')],
]
story.extend(make_table(bench_data, [0.22, 0.18, 0.18, 0.14, 0.28], 'Tableau 3 : Benchmark international HealthFlow vs leaders mondiaux'))

story.append(Paragraph(
    "L'analyse du benchmark revele que HealthFlow Guinea a des avantages uniques que les leaders "
    "mondiaux n'offrent pas : l'integration Mobile Money, les langues nationales guineennes, le mode "
    "hors-ligne robuste, et l'adaptation profonde au contexte guineen. Ces atouts sont des "
    "differentiateurs strategiques sur le marche ouest-africain. Cependant, sur les fonctionnalites "
    "universelles (portail patient, rendez-vous en ligne, telemedecine, ecosysteme ouvert), HealthFlow "
    "est en retard par rapport aux standards internationaux. La feuille de route proposee vise a combler "
    "ces lacunes tout en preservant et renforcant les avantages differenciels existants.",
    styles['Body']
))

story.append(Spacer(1, 12))

story.append(Paragraph(
    "La strategie gagnante pour HealthFlow est de devenir le SIH de reference pour l'Afrique francophone "
    "en combinant les standards internationaux (FHIR R4, RBAC, audit) avec les innovations contextuelles "
    "(Mobile Money, langues locales, offline-first, IA adaptative). Le marche cible est considerable : "
    "14 pays d'Afrique de l'Ouest francophone, representant plus de 400 millions d'habitants avec des "
    "systemes de sante en pleine digitalisation. En s'appuyant sur l'experience guineenne comme cas "
    "d'usage pilote, HealthFlow peut se positionner comme la solution de reference pour la region.",
    styles['Body']
))

# ═══════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════

doc.multiBuild(story)
print(f"PDF generated: {OUTPUT_PATH}")
