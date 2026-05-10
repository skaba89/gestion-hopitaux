# -*- coding: utf-8 -*-
"""
HealthFlow Guinea - Vision Strategique pour l'Afrique
Strategic proposal document generated via ReportLab
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem,
    Frame, PageTemplate, BaseDocTemplate
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas
from reportlab.lib.fonts import addMapping

# ━━ Color Palette (auto-generated) ━━
PAGE_BG       = colors.HexColor('#eff0f0')
SECTION_BG    = colors.HexColor('#eff0f1')
CARD_BG       = colors.HexColor('#e6e8eb')
TABLE_STRIPE  = colors.HexColor('#eff1f2')
HEADER_FILL   = colors.HexColor('#425669')
COVER_BLOCK   = colors.HexColor('#445a6f')
BORDER        = colors.HexColor('#b3c1d0')
ICON          = colors.HexColor('#3f6993')
ACCENT        = colors.HexColor('#1f9376')
ACCENT_2      = colors.HexColor('#41b1c1')
TEXT_PRIMARY   = colors.HexColor('#1c1d1f')
TEXT_MUTED     = colors.HexColor('#75797e')
SEM_SUCCESS   = colors.HexColor('#439860')
SEM_WARNING   = colors.HexColor('#9d8453')
SEM_ERROR     = colors.HexColor('#ad4e45')
SEM_INFO      = colors.HexColor('#496785')

# ━━ Page Setup ━━
PAGE_W, PAGE_H = A4
LEFT_M = 22*mm
RIGHT_M = 22*mm
TOP_M = 25*mm
BOTTOM_M = 22*mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ━━ Font Registration ━━
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Skip auto-scan of font directories (some .ttf files are invalid)

# Register known fonts (skip invalid files)
FONT_BODY = 'DejaVuSerif'
FONT_HEADING = 'DejaVuSans'

font_registrations = [
    ('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
    ('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'),
    ('DejaVuSerif-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'),
]

registered_fonts = {}
for name, path in font_registrations:
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path))
            registered_fonts[name] = True
        except Exception:
            registered_fonts[name] = False

# Carlito fonts (check if valid TTF)
carlito_fonts = [
    ('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'),
    ('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'),
]
for name, path in carlito_fonts:
    if os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont(name, path))
            registered_fonts[name] = True
        except Exception:
            registered_fonts[name] = False

# Use Carlito if available, else DejaVuSans
if registered_fonts.get('Carlito') and registered_fonts.get('Carlito-Bold'):
    FONT_HEADING = 'Carlito'
else:
    FONT_HEADING = 'DejaVuSans'

addMapping('DejaVuSerif', 0, 0, 'DejaVuSerif')
addMapping('DejaVuSerif', 1, 0, 'DejaVuSerif-Bold')
addMapping('DejaVuSans', 0, 0, 'DejaVuSans')
addMapping('DejaVuSans', 1, 0, 'DejaVuSans-Bold')
if registered_fonts.get('Carlito') and registered_fonts.get('Carlito-Bold'):
    addMapping('Carlito', 0, 0, 'Carlito')
    addMapping('Carlito', 1, 0, 'Carlito-Bold')

# ━━ Styles ━━
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'DocTitle', fontName=FONT_HEADING+'-Bold' if registered_fonts.get('Carlito-Bold') else 'DejaVuSans-Bold', fontSize=28, leading=34,
    textColor=colors.white, alignment=TA_LEFT, spaceAfter=6
))
styles.add(ParagraphStyle(
    'DocSubtitle', fontName=FONT_HEADING, fontSize=14, leading=18,
    textColor=colors.HexColor('#b3d4d0'), alignment=TA_LEFT, spaceAfter=4
))
styles.add(ParagraphStyle(
    'H1', fontName='DejaVuSans-Bold', fontSize=20, leading=26,
    textColor=ACCENT, spaceBefore=24, spaceAfter=12
))
styles.add(ParagraphStyle(
    'H2', fontName='DejaVuSans-Bold', fontSize=15, leading=20,
    textColor=HEADER_FILL, spaceBefore=18, spaceAfter=8
))
styles.add(ParagraphStyle(
    'H3', fontName='DejaVuSans-Bold', fontSize=12, leading=16,
    textColor=ICON, spaceBefore=12, spaceAfter=6
))
styles.add(ParagraphStyle(
    'Body', fontName='DejaVuSerif', fontSize=10.5, leading=15,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6,
    firstLineIndent=0
))
styles.add(ParagraphStyle(
    'BodyIndent', fontName='DejaVuSerif', fontSize=10.5, leading=15,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6,
    leftIndent=12
))
styles.add(ParagraphStyle(
    'HF_Bullet', fontName='DejaVuSerif', fontSize=10.5, leading=15,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=18, bulletIndent=6, bulletFontSize=10
))
styles.add(ParagraphStyle(
    'HF_Caption', fontName='DejaVuSerif', fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=8
))
styles.add(ParagraphStyle(
    'Footer', fontName='DejaVuSans', fontSize=8, leading=10,
    textColor=TEXT_MUTED, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'TableCell', fontName='DejaVuSerif', fontSize=9.5, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    'TableHeader', fontName='DejaVuSans-Bold', fontSize=9.5, leading=13,
    textColor=colors.white, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    'HF_Quote', fontName='DejaVuSerif', fontSize=11, leading=16,
    textColor=ACCENT, alignment=TA_CENTER, spaceBefore=12, spaceAfter=12,
    leftIndent=30, rightIndent=30
))
styles.add(ParagraphStyle(
    'PhaseNum', fontName='DejaVuSans-Bold', fontSize=36, leading=40,
    textColor=ACCENT, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    'PhaseTitle', fontName='DejaVuSans-Bold', fontSize=16, leading=20,
    textColor=HEADER_FILL, alignment=TA_LEFT
))

# ━━ Helper Functions ━━
def h1(text):
    return Paragraph(text, styles['H1'])

def h2(text):
    return Paragraph(text, styles['H2'])

def h3(text):
    return Paragraph(text, styles['H3'])

def body(text):
    return Paragraph(text, styles['Body'])

def bullet(text):
    return Paragraph(f'•  {text}', styles['HF_Bullet'])

def spacer(h=6):
    return Spacer(1, h*mm)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6, spaceBefore=6)

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    cw = col_widths or [CONTENT_W / len(headers)] * len(headers)
    data = [[Paragraph(h, styles['TableHeader']) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), styles['TableCell']) for c in row])
    
    t = Table(data, colWidths=cw, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSans-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), TABLE_STRIPE))
        else:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), colors.white))
    t.setStyle(TableStyle(style_cmds))
    return t

# ━━ Cover Page ━━
def draw_cover(c, doc):
    """Draw cover page using canvas."""
    w, h = PAGE_W, PAGE_H
    
    # Background gradient simulation
    c.setFillColor(colors.HexColor('#1a3a4a'))
    c.rect(0, 0, w, h, fill=1, stroke=0)
    
    # Accent bar left
    c.setFillColor(ACCENT)
    c.rect(0, 0, 8*mm, h, fill=1, stroke=0)
    
    # Decorative circles
    c.setFillColor(colors.HexColor('#1f937620'))
    c.circle(w*0.85, h*0.75, 120, fill=1, stroke=0)
    c.circle(w*0.9, h*0.3, 80, fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#41b1c115'))
    c.circle(w*0.15, h*0.15, 100, fill=1, stroke=0)
    
    # Top bar
    c.setFillColor(colors.HexColor('#ffffff15'))
    c.rect(20*mm, h - 30*mm, w - 40*mm, 0.5*mm, fill=1, stroke=0)
    
    # Organization name
    c.setFillColor(colors.HexColor('#b3d4d0'))
    c.setFont('DejaVuSans', 11)
    c.drawString(20*mm, h - 25*mm, "DATASPHERE INNOVATION  |  FRANCE & GUINEE")
    
    # Main title
    c.setFillColor(colors.white)
    c.setFont('DejaVuSans-Bold', 32)
    y_title = h * 0.62
    c.drawString(20*mm, y_title, "HealthFlow Guinea")
    
    # Subtitle
    c.setFillColor(ACCENT_2)
    c.setFont('DejaVuSans-Bold', 18)
    c.drawString(20*mm, y_title - 18*mm, "Vision Strategique 2026-2030")
    
    # Description
    c.setFillColor(colors.HexColor('#c8d8d4'))
    c.setFont('DejaVuSerif', 12)
    desc_y = y_title - 38*mm
    lines = [
        "Propositions d'améliorations et évolutions pour",
        "transformer HealthFlow en plateforme de référence",
        "pour la santé numérique en Guinée et en Afrique"
    ]
    for i, line in enumerate(lines):
        c.drawString(20*mm, desc_y - i*6*mm, line)
    
    # Bottom section
    c.setFillColor(colors.HexColor('#ffffff15'))
    c.rect(20*mm, 38*mm, w - 40*mm, 0.5*mm, fill=1, stroke=0)
    
    c.setFillColor(colors.HexColor('#8d9fa8'))
    c.setFont('DejaVuSans', 9)
    c.drawString(20*mm, 30*mm, "Document confidentiel  |  DataSphere Innovation")
    c.drawString(20*mm, 24*mm, "Fondateur : Sekouna KABA  |  Mai 2026")
    
    # Version badge
    c.setFillColor(ACCENT)
    c.roundRect(w - 55*mm, 24*mm, 35*mm, 12*mm, 3, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('DejaVuSans-Bold', 9)
    c.drawCentredString(w - 37.5*mm, 28*mm, "VERSION 2.0")

# ━━ Page Template ━━
def page_header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    # Header line
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.3)
    canvas_obj.line(LEFT_M, PAGE_H - 18*mm, PAGE_W - RIGHT_M, PAGE_H - 18*mm)
    
    # Header text
    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.setFont('DejaVuSans', 7.5)
    canvas_obj.drawString(LEFT_M, PAGE_H - 16*mm, "HealthFlow Guinea  |  Vision Strategique 2026-2030")
    canvas_obj.drawRightString(PAGE_W - RIGHT_M, PAGE_H - 16*mm, "DataSphere Innovation")
    
    # Footer
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.line(LEFT_M, 16*mm, PAGE_W - RIGHT_M, 16*mm)
    canvas_obj.setFont('DejaVuSans', 8)
    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.drawCentredString(PAGE_W / 2, 11*mm, f"{doc.page}")
    canvas_obj.restoreState()

# ━━ Build Document ━━
output_path = '/home/z/my-project/download/HealthFlow_Guinea_Vision_Strategique_2026-2030.pdf'

doc = BaseDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_M,
    rightMargin=RIGHT_M,
    topMargin=TOP_M,
    bottomMargin=BOTTOM_M,
    title="HealthFlow Guinea - Vision Strategique 2026-2030",
    author="DataSphere Innovation",
    subject="Propositions d'evolutions pour la sante numerique en Afrique",
)

# Cover frame (full page)
cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id='cover')
# Body frame
body_frame = Frame(LEFT_M, BOTTOM_M, CONTENT_W, PAGE_H - TOP_M - BOTTOM_M, id='body')

doc.addPageTemplates([
    PageTemplate(id='cover', frames=[cover_frame], onPage=draw_cover),
    PageTemplate(id='body', frames=[body_frame], onPage=page_header_footer),
])

story = []

# ── Cover Page ──
from reportlab.platypus.doctemplate import NextPageTemplate
story.append(NextPageTemplate('body'))
story.append(PageBreak())

# ══════════════════════════════════════════════
# TABLE DES MATIERES
# ══════════════════════════════════════════════
story.append(h1("Table des matieres"))
story.append(spacer(4))
story.append(hr())
story.append(spacer(2))

toc_items = [
    ("1.", "Executive Summary"),
    ("2.", "Etat des lieux et Analyse SWOT"),
    ("3.", "Vision 2030 : De la Guinee a l'Afrique"),
    ("4.", "Phase 1 - Fondations (2026-2027)"),
    ("5.", "Phase 2 - Expansion (2027-2028)"),
    ("6.", "Phase 3 - Leadership Continental (2028-2030)"),
    ("7.", "Innovations Technologiques majeures"),
    ("8.", "Modele economique et Business Plan"),
    ("9.", "Impact social et sante publique"),
    ("10.", "Feuille de route et indicateurs cles"),
]
for num, title in toc_items:
    story.append(Paragraph(
        f'<b>{num}</b>  {title}',
        ParagraphStyle('TOCItem', fontName='DejaVuSerif', fontSize=11, leading=18,
                       textColor=TEXT_PRIMARY, leftIndent=10, spaceAfter=2)
    ))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 1. EXECUTIVE SUMMARY
# ══════════════════════════════════════════════
story.append(h1("1. Executive Summary"))
story.append(spacer(4))
story.append(Paragraph(
    "HealthFlow Guinea, developpe par DataSphere Innovation, est aujourd'hui une plateforme hospitaliere numerique "
    "complete comprenant 15 modules fonctionnels, un portail patient avec comptes famille, un systeme RBAC avance, "
    "et une architecture moderne (Next.js, TypeScript, Tailwind CSS). Cette base solide positionne HealthFlow comme "
    "un candidat serieux pour devenir la reference continentale en matiere de systeme d'information hospitalier (SIH) "
    "adapte au contexte africain.",
    styles['Body']
))
story.append(spacer(3))
story.append(Paragraph(
    "Le present document propose une vision strategique en trois phases pour transformer HealthFlow d'une solution "
    "guinneenne prometteuse en un ecosysteme panafricain de sante numerique. L'objectif est de repondre aux defis "
    "specifiques du continent : connectivite limitee, infrastructures fragiles, ressources humaines insuffisantes, "
    "et fragmentation des systemes de sante. A horizon 2030, HealthFlow vise a equiper 500 etablissements de sante "
    "dans 15 pays africains, a desservir 50 millions de patients, et a contribuer directement a l'amelioration des "
    "indicateurs de sante publique en Afrique de l'Ouest et au-dela.",
    styles['Body']
))
story.append(spacer(3))
story.append(Paragraph(
    "Les axes strategiques majeurs incluent : l'architecture offline-first pour les zones a faible connectivite, "
    "l'intelligence artificielle pour le diagnostique assiste et la surveillance epidemique, l'interoperabilite "
    "avec les systemes nationaux de sante, le modele SaaS multitenant pour la scalabilite, et le portail patient "
    "compte famille comme vecteur d'inclusion numerique. Ces evolutions, combinees a un modele economique hybride "
    "(SaaS + government contracts + freemium), positionneront DataSphere Innovation comme leader de la HealthTech "
    "en Afrique francophone.",
    styles['Body']
))

story.append(spacer(6))
story.append(Paragraph(
    '"La sante numerique n\'est pas un luxe, c\'est un levier d\'equite. Chaque dossier medical numerise en Afrique '
    'est un pas vers la justice sanitaire."',
    styles['HF_Quote']
))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 2. ETAT DES LIEUX ET ANALYSE SWOT
# ══════════════════════════════════════════════
story.append(h1("2. Etat des lieux et Analyse SWOT"))
story.append(spacer(4))

story.append(h2("2.1 Forces actuelles de HealthFlow"))
story.append(body(
    "HealthFlow dispose aujourd'hui d'une base technique et fonctionnelle remarquable qui constitue un avantage "
    "concurrentiel reel sur le marche africain. La plateforme couvre l'ensemble du parcours de soins, de l'admission "
    "du patient jusqu'a la facturation, en passant par les consultations, le laboratoire, la pharmacie, les urgences "
    "et la maternite. Cette couverture horizontale est rare parmi les solutions HealthTech africaines, qui se limitent "
    "souvent a un seul segment (teleconsultation, gestion de stocks, ou dossier patient isole)."
))
story.append(spacer(2))

strengths = [
    "<b>Couverture fonctionnelle complete</b> : 15 modules integres couvrant tout le parcours de soins hospitalier, "
    "avec des actions CRUD connectees a un magasin de donnees persistant (Zustand + localStorage).",
    "<b>Portail patient avec comptes famille</b> : Fonctionnalite unique en Afrique, permettant a une famille entiere "
    "de gerer ses rendez-vous et consulter ses dossiers via un seul compte telephone.",
    "<b>RBAC avance</b> : Controle d'acces granulaire par role (Administrateur, Medecin, Infirmier, Laborantin, Pharmacien, "
    "Secretaire) avec systeme d'autorisation documentaire.",
    "<b>Architecture moderne</b> : Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion - une stack "
    "technologique de niveau international, facilitant le recrutement de developpeurs.",
    "<b>Design centre utilisateur</b> : Interface intuitive, responsive, avec support dark mode et animations fluides, "
    "tres en avance par rapport aux SIH traditionnels disponibles en Afrique.",
    "<b>Ancrage local</b> : Donnees de demo adaptees au contexte guineen (noms, pathologies, etablissements), "
    "conformite aux normes OMS, et connaissance terrain de l'equipe DataSphere Innovation.",
]
for s in strengths:
    story.append(bullet(s))

story.append(spacer(6))
story.append(h2("2.2 Analyse SWOT"))
story.append(spacer(4))

swot_headers = ['Dimension', 'Interne', 'Externe']
swot_rows = [
    ['Forces',
     'Couverture SIH complete, UX moderne, portail famille, RBAC, stack internationale',
     'Demande croissante de numerisation sanitaire en Afrique, appui OMS/ Banque Mondiale'],
    ['Faiblesses',
     'Pas de mode offline, pas de multi-etablissement, pas d\'API ouverte, pas d\'IA integree',
     'Resistance au changement du personnel medical, faible litteratie numerique'],
    ['Opportunites',
     'Marche HealthTech africain en croissance de 25%/an, CU de la CEDEAO, programmes e-sante',
     'Partenariats avec gouvernements, ONG, telecoms (Orange, MTN), programmes de vaccination'],
    ['Menaces',
     'Solutions concurrentes (Medicai, Helium Health,Crudive Health), dependance connectivite',
     'Reglementations fluctuantes, securite des donnees de sante, financement insuffisant'],
]
story.append(make_table(swot_headers, swot_rows, [CONTENT_W*0.15, CONTENT_W*0.42, CONTENT_W*0.43]))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 3. VISION 2030
# ══════════════════════════════════════════════
story.append(h1("3. Vision 2030 : De la Guinee a l'Afrique"))
story.append(spacer(4))
story.append(body(
    "La vision 2030 de HealthFlow est de devenir l'ecosysteme de reference pour la sante numerique en Afrique "
    "francophone, en construisant une plateforme qui non seulement digitalise les hopitaux, mais cree un veritable "
    "reseau de sante connecte a l'echelle continentale. Cette vision s'articule autour de quatre piliers strategiques "
    "qui, ensemble, transforment un SIH en un levier de sante publique et de developpement economique."
))
story.append(spacer(4))

pillars = [
    ("Pilier 1 : Interoperabilite panafricaine",
     "Creer un reseau de sante connecte ou chaque etablissement, chaque patient, chaque professionnel de sante "
     "peut echanger des donnees de maniere securisee a travers les frontieres. Le patient guineen qui se rend au "
     "Senegal ou en Cote d'Ivoire doit pouvoir retrouver son dossier medical complet via son QR code ou son compte "
     "famille. Cela implique l'adoption de standards HL7 FHIR, la mise en place d'un registre national de sante "
     "numerique par pays, et des accords de reciprocosite de donnees entre etats membres de la CEDEAO."),
    ("Pilier 2 : Intelligence artificielle au service du soin",
     "Integrer l'IA non pas comme gadget, mais comme outil clinique decisionnel. Diagnostique assiste pour les "
     "pathologies tropicales (paludisme, tuberculose, feivre jaune), alertes epidemiques en temps reel basees sur "
     "les donnees de consultation, prediction de risques pour les patients chroniques (diabete, hypertension), et "
     "optimisation des ressources hospitalieres (prediction d'affluence aux urgences, gestion intelligente des lits). "
     "L'IA doit etre formee sur des donnees africaines pour etre pertinente."),
    ("Pilier 3 : Inclusion numerique universelle",
     "Garantir que chaque citoyen, meme en zone rurale sans smartphone, puisse acceder a ses informations de sante. "
     "Cela passe par le support USSD/SMS pour les fonctionnalites cles (rappels de rendez-vous, resultats de laboratoire, "
     "vaccinations), le mode offline complet pour les etablissements a connectivite intermittente, et le multilinguisme "
     "francais/anglais/portugais/arabe/langues locales pour couvrir toute l'Afrique."),
    ("Pilier 4 : Modele economique durable et inclusif",
     "Construire un modele qui permet aux hopitaux publics sous-budgetes d'acceder a la plateforme tout en generant "
     "des revenus suffisants pour la R&D continue. Le modele hybride SaaS + contrats gouvernementaux + freemium "
     "pour les petites structures, complete par des partenariats avec les operateurs telecoms et les programmes "
     "de sante internationaux, constitue la cle de viabilite a long terme."),
]

for title, desc in pillars:
    story.append(h2(title))
    story.append(body(desc))
    story.append(spacer(3))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 4. PHASE 1 - FONDATIONS
# ══════════════════════════════════════════════
story.append(h1("4. Phase 1 - Fondations (2026-2027)"))
story.append(spacer(4))
story.append(Paragraph(
    "La Phase 1 concentre les efforts sur la transformation de HealthFlow d'un prototype avance en un produit "
    "industriel deployable a grande echelle. Chaque evolution est priorisee selon son impact sur la deployabilite "
    "en environnement africain reel et sa capacite a lever les barrieres techniques actuelles.",
    styles['Body']
))
story.append(spacer(4))

story.append(h2("4.1 Architecture offline-first"))
story.append(body(
    "La realite africaine impose une contrainte fondamentale : la connectivite internet est instable, "
    "particulierement en zone rurale ou se trouvent 60% des etablissements de sante. HealthFlow doit fonctionner "
    "pleinement en mode deconnecte, avec synchronisation automatique des que la connexion est retablie. "
    "L'architecture proposee s'appuie sur Service Workers pour le cache des assets critiques, IndexedDB pour le "
    "stockage local des donnees patients et medicales, et un moteur de synchronisation CRDT (Conflict-free "
    "Replicated Data Types) qui resout les conflits de donnees de maniere deterministe sans serveur central."
))
story.append(spacer(2))

offline_items = [
    "<b>Service Worker intelligent</b> : Cache preemptif des assets, queue de requetes offline, background sync "
    "pour les mutations (ajout patient, consultation, prescription).",
    "<b>IndexedDB comme base locale</b> : Replication complete du data-store Zustand dans IndexedDB, avec "
    "requete locale ultra-rapide meme sans reseau.",
    "<b>Synchronisation CRDT</b> : Algorithme de fusion sans conflit pour les ecritures concurrentes (ex : deux "
    "infirmiers modifient le meme dossier en mode offline). Chronologique avec dernier-ecriture-gagnante + historique.",
    "<b>Indicateur de connectivite</b> : Interface visuelle montrant le statut de synchronisation (vert = sync, "
    "orange = sync partielle, rouge = offline), avec nombre d'operations en attente.",
]
for item in offline_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("4.2 Architecture multi-etablissement (SaaS multitenant)"))
story.append(body(
    "Le passage d'un etablissement unique a une architecture multi-tenant est indispensable pour la scalabilite "
    "economique. Chaque etablissement de sante doit avoir son espace de donnees isole, avec une administration "
    "autonome, tout en partageant l'infrastructure technique. Cela implique une refonte du data-store pour "
    "supporter le partitionnement des donnees par tenant, un systeme d'authentification centralise (Keycloak ou "
    "equivalent), et une gestion des abonnements par etablissement avec facturation automatisee."
))
story.append(spacer(2))

multitenant_items = [
    "<b>Isolation des donnees</b> : Chaque etablissement voit uniquement ses propres patients, consultations, "
    "stocks, et statistiques. Le partage inter-etablissement se fait uniquement via des accords explicites.",
    "<b>Administration autonome</b> : Chaque hopital gere ses utilisateurs, ses roles, ses parametres de "
    "facturation et ses regles metier (types de consultation, services, horaires).",
    "<b>Tableau de bord national</b> : Pour le ministere de la Sante, une vue agregee de tous les etablissements "
    "HealthFlow du pays, avec KPIs de sante publique en temps reel.",
    "<b>Onboarding automatise</b> : Processus d'inscription self-service pour un nouvel etablissement, avec "
    "configuration guidee en moins de 2 heures.",
]
for item in multitenant_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("4.3 Base de donnees scalable (PostgreSQL + Prisma)"))
story.append(body(
    "Le passage de localStorage a PostgreSQL est la migration la plus critique de la Phase 1. Le magasin actuel "
    "base sur Zustand + localStorage est parfait pour le prototypage mais ne peut pas supporter des centaines "
    "d'utilisateurs concurrents, des millions d'enregistrements, ou les exigences de securite d'un veritable SIH. "
    "La migration vers PostgreSQL avec Prisma ORM offre la robustesse, la performance et la conformite RGPD/HDS "
    "necessaires pour un deploiement en production."
))
story.append(spacer(2))

db_items = [
    "<b>PostgreSQL + Prisma</b> : Schema relationnel complet avec migrations versionnees, requetes type-safe, "
    "et performance native pour les jointures complexes (patient-consultation-prescription-laboratoire).",
    "<b>Chiffrement au repos</b> : Toutes les donnees de sante chiffrees (AES-256), conformement aux exigences "
    "de la loi guinneenne et aux standards internationaux (HIPAA, RGPD).",
    "<b>Sauvegarde automatique</b> : Backup journalier incrementale + backup hebdomadaire complet, avec "
    "restauration point-in-time et replication sur un serveur distant.",
    "<b>Audit trail</b> : Journalisation de chaque acces aux donnees patients (qui, quand, quoi), indispensable "
    "pour la conformite reglementaire et la detection d'acces non autorises.",
]
for item in db_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("4.4 Authentification et securite renforcee"))
story.append(body(
    "La securite des donnees de sante est un prerequis non negociable. Le systeme actuel de roles RBAC doit etre "
    "renforce par une authentification robuste (2FA, biometrie), un chiffrement de bout en bout, et une gestion "
    "fine des sessions. L'integration avec les systemes d'identite nationale guinneens (carte d'identite biometrique) "
    "renforce la confiance et facilite l'adoption par les autorites."
))
story.append(spacer(2))

security_items = [
    "<b>Double authentification (2FA)</b> : SMS + TOTP pour le personnel medical, avec option biometrique "
    "(empreinte digitale / reconnaissance faciale) sur mobile.",
    "<b>Authentification patient</b> : Extension du portail patient avec support biometrique et QR code securise "
    "pour l'identification aux guichets.",
    "<b>Chiffrement E2E</b> : Communications chiffrees entre le client et le serveur (TLS 1.3), et chiffrement "
    "des donnees sensibles au repos dans la base de donnees.",
    "<b>Gestion des sessions</b> : Expiration automatique, detection de sessions simultanees, et possibilite "
    "de revoquer les acces a distance en cas de perte de terminal.",
]
for item in security_items:
    story.append(bullet(item))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 5. PHASE 2 - EXPANSION
# ══════════════════════════════════════════════
story.append(h1("5. Phase 2 - Expansion (2027-2028)"))
story.append(spacer(4))
story.append(body(
    "La Phase 2 marque le passage a l'echelle africaine. Avec les fondations techniques solides de la Phase 1, "
    "HealthFlow peut desormais integrer des capacites avancees qui transforment la plateforme en un veritable "
    "ecosysteme de sante numerique, capable de repondre aux defis specifiques du continent."
))
story.append(spacer(4))

story.append(h2("5.1 Intelligence artificielle pour le diagnostique assiste"))
story.append(body(
    "L'intelligence artificielle en sante en Afrique ne doit pas copier les modeles occidentaux. Elle doit etre "
    "concue pour les realites locales : manque de specialists, pathologies tropicales predominantes, et besoin "
    "d'outils decisionnels pour le personnel paramedical en zone rurale. HealthFlow integrera un moteur IA "
    "specialise sur les pathologies africaines, entraine sur des donnees cliniques du continent."
))
story.append(spacer(2))

ai_items = [
    "<b>Diagnostique assiste tropicaux</b> : Modele ML pour le diagnostique differentiel du paludisme, de la "
    "tuberculose, de la feivre typhoide, et de la dengue a partir des symptomes et des resultats biologiques.",
    "<b>Alertes epidemiques</b> : Detection precoce de clusters de symptomes dans les donnees de consultations, "
    "avec notification automatique au ministere de la Sante et a l'OMS.",
    "<b>Prediction de risques chroniques</b> : Score de risque cardiovasculaire et de complications du diabete "
    "personnalise, base sur les antecedents, les constantes et les resultats biologiques du patient.",
    "<b>OCR pour les documents medicaux</b> : Numerisation intelligente des ordonnances et resultats papiers "
    "apportes par les patients, avec extraction automatique des donnees cliniques.",
    "<b>Aide a la prescription</b> : Verification automatique des interactions medicamenteuses, des allergies "
    "connues, et des dosages adaptes au poids et a l'age du patient.",
]
for item in ai_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("5.2 Interoperabilite et standards internationaux"))
story.append(body(
    "Pour que HealthFlow devienne un veritable noeud dans l'ecosysteme de sante africain, il doit pouvoir "
    "communiquer avec les autres systemes : logiciels de laboratoire, systemes d'assurance, registres nationaux "
    "de sante, et plateformes de teleconsultation tierces. L'adoption du standard HL7 FHIR (Fast Healthcare "
    "Interoperability Resources) est la cle de cette interconnexion."
))
story.append(spacer(2))

interop_items = [
    "<b>API FHIR R4</b> : Exposition des ressources patients, observations, diagnostics, medications et "
    "appointments au standard FHIR, permettant l'interconnexion avec tout systeme compatible.",
    "<b>Integrations laboratoire</b> : Connexion automatique aux analyseurs biologiques (rosettes, automates) "
    "pour l'import direct des resultats sans saisie manuelle.",
    "<b>Hub d'assurance sante</b> : API pour les organismes d'assurance (SUNU, NSIA, Saham) permettant la "
    "verification d'eligibilite en temps reel et la facturation directe.",
    "<b>Registre national de sante</b> : Integration avec les systemes d'identite nationale et les registres "
    "de sante publique du ministere, pour un identifiant patient unique national.",
]
for item in interop_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("5.3 Teleconsultation avancee et teleradiologie"))
story.append(body(
    "Le module de teleconsultation actuel doit evoluer vers une plateforme complete de telemedecine, capable de "
    "connecter les patients des zones rurales aux specialists urbains en temps reel. La teleradiologie, en "
    "particulier, est un besoin critique : la Guinee compte moins de 10 radiologues pour 14 millions d'habitants. "
    "HealthFlow doit permettre l'envoi securise d'images medicales (DICOM) et leur interpretation a distance."
))
story.append(spacer(2))

tele_items = [
    "<b>Video HD adaptive</b> : Appels video qui s'adaptent automatiquement a la bande passante disponible, "
    "avec fallback audio-only en cas de faible connectivite.",
    "<b>Teleradiologie DICOM</b> : Upload et visualisation d'images medicales (radiographies, echographies, "
    "scanners) avec outils d'annotation et d'interpretation a distance.",
    "<b>File d'attente intelligente</b> : Systeme de tri automatique des demandes de teleconsultation par "
    "urgence, avec rappels SMS et notifications push.",
    "<b>Enregistrement et transcritption</b> : Enregistrement securise des consultations avec transcritption "
    "automatique et generation de compte-rendu pre-rempli.",
]
for item in tele_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("5.4 Portail patient V2 : Ecosysteme de sante personnel"))
story.append(body(
    "Le portail patient actuel, avec son systeme de comptes famille, constitue un avantage concurrentiel "
    "strategique unique. La V2 doit transformer cet espace en un veritable hub de sante personnel, integrant "
    "non seulement la consultation des dossiers et la prise de rendez-vous, mais aussi le suivi des traitements, "
    "l'education therapeutique, et les paiements de sante. Le concept de compte famille, ou un seul compte "
    "gere les dossiers de tous les membres du foyer, est particulierement adapte au contexte africain ou la "
    "cellule familiale est le pilier du systeme de sante."
))
story.append(spacer(2))

portal_items = [
    "<b>Espace famille evolue</b> : Ajout de membres par simple scan de QR code patient, gestion des proxies "
    "de sante (tuteur legal pour les mineurs), et historique familial des pathologies.",
    "<b>Suivi de traitement</b> : Rappels de prise de medicaments, suivi d'observance, et alertes pour les "
    "rendez-vous de suivi manques. Integration avec les objets connectes (tensiometre, glucometre Bluetooth).",
    "<b>Paiement mobile</b> : Integration Orange Money, MTN Mobile Money, et carte bancaire pour le paiement "
    "des consultations et des ordonnances directement depuis le portail.",
    "<b>Education therapeutique</b> : Contenus educatifs personnalises (video, infographies) sur les pathologies "
    "du patient, en langues locales (soussou, poular, malinke).",
    "<b>Carnet de vaccination numerique</b> : Suivi complet du calendrier vaccinal des enfants, avec rappels "
    "SMS et QR code de verification pour les campagnes de vaccination.",
]
for item in portal_items:
    story.append(bullet(item))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 6. PHASE 3 - LEADERSHIP CONTINENTAL
# ══════════════════════════════════════════════
story.append(h1("6. Phase 3 - Leadership Continental (2028-2030)"))
story.append(spacer(4))
story.append(body(
    "La Phase 3 propulse HealthFlow au rang de leader continental. Les innovations de cette phase visent a "
    "creer un ecosysteme de sante numerique qui transcende les frontieres nationales et positionne l'Afrique "
    "comme createur de solutions de sante numerique, et non simplement consommateur."
))
story.append(spacer(4))

story.append(h2("6.1 Blockchain pour les dossiers medicaux"))
story.append(body(
    "La technologie blockchain appliquee aux dossiers medicaux resout un probleme fondamental en Afrique : "
    "la confiance dans les donnees de sante. Avec un registre medical blockchain, chaque patient possede une "
    "cle cryptographique qui lui donne un controle souverain sur ses donnees. Aucun prestataire de sante ne "
    "peut acceder au dossier sans autorisation explicite du patient, et chaque acces est trace de maniere "
    "immuable. Cela renforce la confiance des patients, facilite les audits, et protege contre les "
    "falsifications de dossiers medicaux, un probleme reel dans plusieurs pays africains."
))
story.append(spacer(2))

blockchain_items = [
    "<b>Registre medical decentralise</b> : Chaque evenement medical (consultation, prescription, vaccination) "
    "enregistre comme transaction immutable sur une blockchain permissionee.",
    "<b>Consentement granulaire</b> : Le patient autorise explicitement chaque professionnel de sante a acceder "
    "a des portions specifiques de son dossier, avec duree d'acces limitee.",
    "<b>Portabilite transfrontaliere</b> : Le dossier medical suit le patient a travers la CEDEAO, "
    "accesssible via son identifiant numerique unique.",
    "<b>Smart contracts assurance</b> : Declenchement automatique des remboursements d'assurance lorsque "
    "les conditions contractuelles sont reunies (verification du soin, conformite du tarif).",
]
for item in blockchain_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("6.2 Surveillance epidemique en temps reel"))
story.append(body(
    "L'experience de la pandemie de COVID-19 et des epidemies recurrences d'Ebola en Afrique de l'Ouest a "
    "demonstre l'urgence d'un systeme de surveillance epidemique en temps reel. HealthFlow, par sa presence "
    "dans les etablissements de sante, est naturellement positionne pour detecter les signaux precoces "
    "d'epidemies. Le moteur de surveillance analyse les donnees de consultations, de laboratoire et "
    "d'urgences pour identifier des clusters anormaux de symptomes ou de pathologies, et declenche des "
    "alertes automatiques vers les autorites de sante publique."
))
story.append(spacer(2))

epidemio_items = [
    "<b>Detection de clusters</b> : Algorithme de detection spatiale et temporelle de groupes de symptomes "
    "similaires, avec seuils adaptes a chaque zone epidemiologique.",
    "<b>Dashboard ministere de la Sante</b> : Carte en temps reel des cas suspects, confirmes et decedes, "
    "avec indicateurs de tendance par region et par pathologie.",
    "<b>Integration OMS/AFRO</b> : Envoi automatique de rapports au systeme DHIS2 de l'OMS Afrique, "
    "conformement aux protocoles de notification internationale.",
    "<b>Reponse coordonnee</b> : Declenchement automatique de protocoles de reponse (isolement, quarantaine, "
    "vaccination) en fonction du niveau d'alerte detecte.",
]
for item in epidemio_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("6.3 Internet des Objets (IoT) medical"))
story.append(body(
    "L'IoT medical connecte les equipements de soin directement a la plateforme HealthFlow, eliminant la "
    "saisie manuelle et ameliorant la qualite des donnees. Les capteurs connectes (tensiometres, glucometres, "
    "oxymetres, thermometres) transmettent automatiquement les constantes vitales dans le dossier patient. "
    "Les equipements hospitaliers (pompes a perfusion, respirateurs, incubateurs) rapportent leur statut en "
    "temps reel pour la maintenance predictive et l'optimisation des ressources."
))
story.append(spacer(2))

iot_items = [
    "<b>Capteurs vitaux connectes</b> : Transmission Bluetooth/WiFi des constantes (TA, FC, SpO2, temperature, "
    "glycemie) directement dans le dossier patient.",
    "<b>Maintenance predictive</b> : Monitoring des equipements medicaux avec alertes preventives avant "
    "panne, reductant les ruptures de service.",
    "<b>Gestion des chaines froides</b> : Capteurs de temperature dans les refrigerateurs de vaccins et les "
    "entrepots pharmaceutiques, avec alertes en cas de rupture de la chaine froide.",
    "<b>Geolocalisation des ambulances</b> : Suivi en temps reel des vehicules d'urgence avec estimation "
    "d'arrivee et dispatching optimal.",
]
for item in iot_items:
    story.append(bullet(item))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 7. INNOVATIONS TECHNOLOGIQUES MAJEURES
# ══════════════════════════════════════════════
story.append(h1("7. Innovations Technologiques majeures"))
story.append(spacer(4))

story.append(h2("7.1 Acces SMS/USSD pour l'inclusion numerique"))
story.append(body(
    "En Afrique, le taux de penetration smartphone est encore inferieur a 40% dans les zones rurales, tandis "
    "que le telephone basique (feature phone) est ubiquitous avec plus de 90% de penetration. Un acces "
    "SMS/USSD a HealthFlow est donc essentiel pour garantir l'inclusion numerique universelle. Le patient "
    "sans smartphone doit pouvoir prendre rendez-vous, recevoir ses resultats de laboratoire, et consulter "
    "son calendrier vaccinal via des commandes USSD simples ou des SMS structurees."
))
story.append(spacer(2))

sms_items = [
    "<b>Menu USSD interactif</b> : Navigation par touches (*123#) pour prise de rendez-vous, consultation "
    "du prochain RDV, et confirmation de presence.",
    "<b>SMS resultats labo</b> : Envoi automatique des resultats biologiques critiques (glycemie, hemoglobine, "
    "creatinine) par SMS avec interpretation simple (normal/e leve/bas).",
    "<b>Rappels vaccination</b> : SMS automatiques 48h avant chaque vaccination prevue pour les enfants, "
    "avec numero direct du centre de sante le plus proche.",
    "<b>Alertes grossesse</b> : Suivi des consultations prenatales par SMS pour les femmes enceintes en "
    "zone rurale, avec rappels et Conseils de sante.",
]
for item in sms_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("7.2 Application mobile native"))
story.append(body(
    "Bien que la PWA actuelle offre une bonne experience mobile, une application native (React Native ou "
    "Flutter) est necessaire pour exploiter pleinement les capacites du telephone : camera pour le scan de "
    "QR code et l'OCR, biometrie pour l'authentification, notifications push fiables, et stockage local "
    "securise. L'application native sera le point d'entree principal du portail patient V2 et du workflow "
    "medical mobile pour les professionnels de sante en deplacement."
))
story.append(spacer(2))

mobile_items = [
    "<b>Scan QR code natif</b> : Identification instantanee du patient par scan de son QR code, avec "
    "affichage immediat du dossier simplifie sur le telephone du medecin.",
    "<b>OCR ordonnances</b> : Photographie d'une ordonnance papier avec extraction automatique des "
    "medicaments et generation d'une prescription numerique.",
    "<b>Notifications push</b> : Alertes en temps reel pour les urgences, les resultats labo critiques, "
    "et les rappels de rendez-vous, meme quand l'app est fermee.",
    "<b>Mode offline complet</b> : Fonctionnalite totale hors-ligne avec synchronisation automatique "
    "au retour de la connexion.",
]
for item in mobile_items:
    story.append(bullet(item))

story.append(spacer(4))
story.append(h2("7.3 Multilinguisme et adaptation culturelle"))
story.append(body(
    "L'Afrique est le continent le plus multilingue au monde. HealthFlow doit supporter au minimum "
    "le francais, l'anglais, le portugais et l'arabe pour couvrir les espaces CEDEAO, CEMAC, et "
    "Afrique de l'Est. Au-dela de la traduction, l'interface doit s'adapter aux conventions culturelles : "
    "format de date, sens de lecture, noms a structure variable, et sensibilite aux representations "
    "visuelles. Les langues locales guinneennes (soussou, poular, malinke) seront integrees en priorite "
    "pour le portail patient, afin de maximiser l'adoption par les populations rurales."
))
story.append(spacer(2))

lang_items = [
    "<b>i18n complet</b> : Systeme de traduction base sur des fichiers JSON avec support du pluriel, "
    "des formats de date/nombre locaux, et des unites de mesure.",
    "<b>Langues locales guinneennes</b> : Interface en soussou, poular et malinke pour le portail "
    "patient, avec synthese vocale pour les patients non alphabetes.",
    "<b>Adaptation RTL</b> : Support de l'arabe et des langues a droite-gauche pour l'Afrique du Nord "
    "et la Mauritanie.",
    "<b>Tests culturels</b> : Validation de l'interface par des utilisateurs locaux dans chaque pays "
    "cible, avec ajustement des icones, couleurs et metaphores visuelles.",
]
for item in lang_items:
    story.append(bullet(item))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 8. MODELE ECONOMIQUE
# ══════════════════════════════════════════════
story.append(h1("8. Modele economique et Business Plan"))
story.append(spacer(4))
story.append(body(
    "Le modele economique de HealthFlow doit etre a la fois viable commercialement et accessible aux "
    "etablissements de sante africains, dont la plupart fonctionnent avec des budgets tres limites. "
    "Le modele hybride propose combine trois sources de revenus complementaires qui se renforcent mutuellement "
    "et garantissent la perennite de la plateforme tout en maintenant son accessibilite."
))
story.append(spacer(4))

story.append(h2("8.1 Modele de tarification"))
story.append(spacer(2))

pricing_headers = ['Offre', 'Prix/mois', 'Cible', 'Fonctionnalites']
pricing_rows = [
    ['Starter', 'Gratuit', 'Centres de sante ruraux, dispensaires', 'Gestion patients, RDV, vaccination (3 modules max, 500 patients)'],
    ['Essentiel', '250 USD', 'Cliniques, centres de sante urbains', '10 modules, 5000 patients, support email, sauvegarde auto'],
    ['Professionnel', '500 USD', 'Hopitaux regionaux', '15 modules, patients illimites, support 24/7, API, teleconsultation'],
    ['Entreprise', 'Sur devis', 'Hopitaux nationaux, CHU', 'Full stack + IA + blockchain + IoT, deploiement dedie, SLA 99.9%'],
]
story.append(make_table(pricing_headers, pricing_rows, [CONTENT_W*0.13, CONTENT_W*0.13, CONTENT_W*0.30, CONTENT_W*0.44]))

story.append(spacer(6))
story.append(h2("8.2 Sources de revenus complementaires"))
story.append(spacer(2))

revenue_items = [
    "<b>Contrats gouvernementaux</b> : Deploiement national via les ministere de la Sante, avec facturation "
    "annuelle par etablissement. Objectif : 60% des revenus a terme. Contrats pluriannuels de 3-5 ans.",
    "<b>Partenariats telecom</b> : Orange, MTN, Moov integrent HealthFlow dans leurs offres entreprise sante. "
    "Revenue share de 15-20% sur les abonnements generes via les canaux telecom.",
    "<b>Marketplace de services</b> : Plateforme ou les tiers (laboratoires, assurances, pharmacies) paient "
    "pour l'acces API. Commission de 5-10% sur les transactions (paiements, verifications d'assurance).",
    "<b>Donnees de sante publique (anonymisees)</b> : Vente de statistiques epidemiologiques agregees et "
    "anonymisees aux organisations internationales (OMS, Banque Mondiale, instituts de recherche).",
    "<b>Formation et certification</b> : Programmes de certification HealthFlow pour le personnel medical, "
    "avec formation initiale et continue payante.",
]
for item in revenue_items:
    story.append(bullet(item))

story.append(spacer(6))
story.append(h2("8.3 Projections financieres"))
story.append(spacer(2))

proj_headers = ['Indicateur', 'Annee 1 (2026)', 'Annee 2 (2027)', 'Annee 3 (2028)', 'Annee 5 (2030)']
proj_rows = [
    ['Etablissements clients', '15', '50', '150', '500'],
    ['Pays couverts', '1 (Guinee)', '3', '8', '15'],
    ['Patients couverts', '100 000', '500 000', '5 millions', '50 millions'],
    ['Revenu annuel recurrent', '75 000 USD', '300 000 USD', '1.5 M USD', '12 M USD'],
    ['Equipe (employes)', '12', '30', '80', '200'],
    ['Recherche & Developpement', '25% du CA', '22% du CA', '20% du CA', '18% du CA'],
]
story.append(make_table(proj_headers, proj_rows, [CONTENT_W*0.20, CONTENT_W*0.20, CONTENT_W*0.20, CONTENT_W*0.20, CONTENT_W*0.20]))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 9. IMPACT SOCIAL ET SANTE PUBLIQUE
# ══════════════════════════════════════════════
story.append(h1("9. Impact social et sante publique"))
story.append(spacer(4))
story.append(body(
    "Au-dela de la performance commerciale, HealthFlow a une mission d'impact social. Chaque evolution de la "
    "plateforme doit etre evaluee a l'aune de sa contribution a l'amelioration des indicateurs de sante "
    "en Guinee et en Afrique. Les objectifs d'impact sont alignes sur les Objectifs de Developpement "
    "Durable (ODD) de l'ONU, en particulier l'ODD 3 (Bonne sante et bien-etre) et l'ODD 9 (Industrie, "
    "innovation et infrastructure)."
))
story.append(spacer(4))

story.append(h2("9.1 Indicateurs d'impact cibles"))
story.append(spacer(2))

impact_headers = ['Indicateur', 'Situation actuelle', 'Objectif 2030', 'Mesure']
impact_rows = [
    ['Mortalite maternelle', '980/100 000 (Guinee)', '650/100 000', 'Suivi grossesses via HealthFlow'],
    ['Couverture vaccinale DTC3', '65% (Guinee)', '90%', 'Carnet vaccination numerique'],
    ['Delai diagnostique paludisme', '72h moyenne', '< 24h', 'IA diagnostique + alertes'],
    ['Dossiers medicaux numerises', '< 5% en Afrique', '50% dans pays HealthFlow', 'Nombre dossiers actifs'],
    ['Ruptures stock medicaments', '40% des hopitaux', '< 10%', 'Alertes stock predictives'],
    ['Consultations postnatales', '35% (Guinee)', '75%', 'Rappels SMS + portail famille'],
]
story.append(make_table(impact_headers, impact_rows, [CONTENT_W*0.25, CONTENT_W*0.20, CONTENT_W*0.20, CONTENT_W*0.35]))

story.append(spacer(6))
story.append(h2("9.2 Contribution aux ODD"))
story.append(spacer(2))

odd_items = [
    "<b>ODD 3 - Bonne sante</b> : Reduction de la mortalite maternelle et infantile, amelioration de la "
    "couverture vaccinale, lutte contre les maladies tropicales negligees via le diagnostique assiste.",
    "<b>ODD 5 - Egalite des genres</b> : Suivi grossesse et sante maternelle, portail famille permettant "
    "aux femmes de gerer la sante de leurs enfants, teleconsultation accessible sans deplacement.",
    "<b>ODD 8 - Travail decent</b> : Creation d'emplois qualifiés (developpeurs, data scientists, support "
    "technique) dans le secteur HealthTech africain, avec formation continue.",
    "<b>ODD 9 - Innovation</b> : Infrastructure numerique de sante, R&D en IA tropicale, blockchain "
    "medicale, et IoT health adaptes au contexte africain.",
    "<b>ODD 10 - Inegalites reduites</b> : Acces equitable aux soins via le mode freemium, l'acces "
    "SMS/USSD, et la teleconsultation pour les zones rurales.",
    "<b>ODD 17 - Partenariats</b> : Collaboration avec OMS, Banque Mondiale, gouvernements, telecoms, "
    "et universites pour un ecosysteme de sante numerique panafricain.",
]
for item in odd_items:
    story.append(bullet(item))

story.append(PageBreak())

# ══════════════════════════════════════════════
# 10. FEUILLE DE ROUTE
# ══════════════════════════════════════════════
story.append(h1("10. Feuille de route et indicateurs cles"))
story.append(spacer(4))
story.append(body(
    "La feuille de route ci-dessous synthetise les jalons critiques de chaque phase avec les indicateurs "
    "cles de performance (KPI) qui permettront de mesurer les progres. Chaque jalon est accompagne d'un "
    "critere de validation objectif qui confirme l'atteinte de l'objectif."
))
story.append(spacer(4))

story.append(h2("10.1 Phase 1 - Fondations (2026-2027)"))
story.append(spacer(2))

phase1_headers = ['Jalon', 'Echeance', 'KPI', 'Critere de validation']
phase1_rows = [
    ['Architecture offline-first', 'T3 2026', '0% perte de donnees en mode offline', 'Test 72h sans reseau avec 100 operations'],
    ['Migration PostgreSQL', 'T4 2026', 'Temps reponse < 200ms pour requetes patient', 'Benchmark 1000 utilisateurs concurrents'],
    ['Multi-tenant SaaS', 'T1 2027', '10 etablissements sur la meme instance', 'Isolation donnees verifiee par audit'],
    ['Authentification 2FA', 'T2 2027', '100% du personnel medecin en 2FA', 'Penetration test reussi sans faille'],
    ['5 hopitaux guinneens clients', 'T4 2027', '5000+ dossiers patients actifs', 'Taux adoption > 80% du personnel'],
]
story.append(make_table(phase1_headers, phase1_rows, [CONTENT_W*0.22, CONTENT_W*0.12, CONTENT_W*0.30, CONTENT_W*0.36]))

story.append(spacer(6))
story.append(h2("10.2 Phase 2 - Expansion (2027-2028)"))
story.append(spacer(2))

phase2_headers = ['Jalon', 'Echeance', 'KPI', 'Critere de validation']
phase2_rows = [
    ['IA diagnostique paludisme', 'T2 2028', 'Sensibilite > 90%, Specificite > 85%', 'Validation clinique 1000 cas'],
    ['API FHIR R4', 'T3 2028', '3 integrations tierces actives', 'Certification HL7 atteinte'],
    ['Teleconsultation video', 'T1 2028', '500 teleconsultations/mois', 'Satisfaction patient > 4/5'],
    ['Portail patient V2', 'T4 2028', '10 000 comptes famille actifs', 'Taux retention 6 mois > 60%'],
    ['3 pays africains', 'T4 2028', '50 etablissements', 'Deploiement Senegal + Cote Ivoire'],
]
story.append(make_table(phase2_headers, phase2_rows, [CONTENT_W*0.22, CONTENT_W*0.12, CONTENT_W*0.30, CONTENT_W*0.36]))

story.append(spacer(6))
story.append(h2("10.3 Phase 3 - Leadership Continental (2028-2030)"))
story.append(spacer(2))

phase3_headers = ['Jalon', 'Echeance', 'KPI', 'Critere de validation']
phase3_rows = [
    ['Blockchain medicale', 'T2 2029', '100 000 dossiers sur blockchain', 'Audit securite independant reussi'],
    ['Surveillance epidemique', 'T1 2029', 'Detection cluster < 24h', 'Simulation epidemie reussie avec OMS'],
    ['IoT medical', 'T3 2029', '5 types de capteurs integres', 'Zero saisie manuelle de constantes'],
    ['15 pays africains', 'T4 2030', '500 etablissements', 'Certification dans chaque pays'],
    ['Revenu 12M USD/an', 'T4 2030', 'Marge brute > 60%', 'Profitabilite atteinte'],
]
story.append(make_table(phase3_headers, phase3_rows, [CONTENT_W*0.22, CONTENT_W*0.12, CONTENT_W*0.30, CONTENT_W*0.36]))

story.append(spacer(8))
story.append(hr())
story.append(spacer(4))
story.append(Paragraph(
    "HealthFlow Guinea a le potentiel de devenir bien plus qu'un logiciel hospitalier : un veritable levier "
    "de transformation du systeme de sante en Afrique. La combinaison d'une base technique solide, d'une "
    "vision strategique claire, et d'un ancrage local profond positionne DataSphere Innovation pour conduire "
    "cette transformation. Le chemin est ambitieux, mais chaque phase pose les fondations de la suivante, "
    "assurant que chaque evolution est solide avant de passer a la suivante. L'Afrique merite des solutions "
    "de sante numerique concues par des Africains, pour des Africains. HealthFlow est cette solution.",
    styles['Body']
))

# ━━ Build ━━
doc.build(story)
print(f"PDF generated: {output_path}")
