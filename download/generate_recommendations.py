#!/usr/bin/env python3
"""HealthFlow Guinea - Recommandations Strategiques PDF Generator"""

import sys, os, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import SimpleDocTemplate

# ── Color Palette ──
ACCENT       = colors.HexColor('#217590')
TEXT_PRIMARY  = colors.HexColor('#1c1e1f')
TEXT_MUTED    = colors.HexColor('#798086')
BG_SURFACE   = colors.HexColor('#d4dae0')
BG_PAGE      = colors.HexColor('#f3f4f5')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Font Registration (only verified TrueType fonts) ──
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))

registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
title_style = ParagraphStyle(
    'DocTitle', fontName='Carlito-Bold', fontSize=28, leading=36,
    textColor=ACCENT, alignment=TA_CENTER, spaceAfter=12
)
h1_style = ParagraphStyle(
    'H1', fontName='Carlito-Bold', fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10
)
h2_style = ParagraphStyle(
    'H2', fontName='Carlito-Bold', fontSize=15, leading=22,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8
)
body_style = ParagraphStyle(
    'Body', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6
)
caption_style = ParagraphStyle(
    'Caption', fontName='Carlito', fontSize=9, leading=14,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=6
)
header_cell_style = ParagraphStyle(
    'HeaderCell', fontName='Carlito-Bold', fontSize=10, leading=14,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER
)
cell_style = ParagraphStyle(
    'Cell', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
cell_center_style = ParagraphStyle(
    'CellCenter', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)

# ── TOC Template ──
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

H1_ORPHAN_THRESHOLD = (PAGE_H - TOP_MARGIN - BOTTOM_MARGIN) * 0.15

def add_major_section(text):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, h1_style, level=0),
    ]

def make_table(data, col_ratios, caption_text=None):
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
        style_commands.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_commands))
    elements = [Spacer(1, 12), t]
    if caption_text:
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(caption_text, caption_style))
    elements.append(Spacer(1, 12))
    return elements

# ── Build Document ──
output_path = '/home/z/my-project/download/HealthFlow_Guinea_Recommandations_Strategiques.pdf'

doc = TocDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
)

story = []

# ══════════ COVER ══════════
story.append(Spacer(1, 120))
story.append(Paragraph('<b>HealthFlow Guinea</b>', title_style))
story.append(Spacer(1, 8))
story.append(Paragraph('Systeme d\'Information Hospitalier', ParagraphStyle(
    'Subtitle', fontName='Carlito', fontSize=18, leading=24,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=24
)))
story.append(Spacer(1, 20))
story.append(Paragraph(
    '<b>Recommandations Strategiques et Evolutions</b>',
    ParagraphStyle('CT2', fontName='Carlito-Bold', fontSize=16, leading=22,
                   textColor=ACCENT, alignment=TA_CENTER, spaceAfter=8)
))
story.append(Paragraph(
    'Pour depasser les standards mondiaux des systemes HIS',
    ParagraphStyle('CS2', fontName='Carlito', fontSize=13, leading=18,
                   textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=40)
))
story.append(Spacer(1, 60))
story.append(Paragraph('DataSphere Innovation', ParagraphStyle(
    'Org', fontName='Carlito-Bold', fontSize=12, leading=16,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, spaceAfter=4
)))
story.append(Paragraph('Fondateur : Sekouna KABA', ParagraphStyle(
    'Org2', fontName='Carlito', fontSize=11, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=4
)))
story.append(Paragraph('Mai 2026', ParagraphStyle(
    'Date', fontName='Carlito', fontSize=11, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(PageBreak())

# ══════════ TOC ══════════
story.append(Paragraph('<b>Table des Matieres</b>', h1_style))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontName='Carlito-Bold', fontSize=12, leading=20, leftIndent=20),
    ParagraphStyle(name='TOC2', fontName='Carlito', fontSize=10, leading=18, leftIndent=40),
]
story.append(toc)
story.append(PageBreak())

# ══════════ 1. RESUME EXECUTIF ══════════
story.extend(add_major_section('1. Resume Executif'))
story.append(Paragraph(
    'HealthFlow Guinea est un systeme d\'information hospitalier (HIS) de nouvelle generation concu pour '
    'repondre aux besoins specifiques du systeme de sante guineen. Ce document presente les recommandations '
    'strategiques et les evolutions techniques necessaires pour positionner HealthFlow non seulement comme '
    'le meilleur HIS d\'Afrique de l\'Ouest, mais aussi comme une reference mondiale en matiere de systeme '
    'de sante numerique pour les pays a revenu intermediaire.', body_style))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'L\'analyse comparative avec les leaders mondiaux (Epic, Cerner, Meditech, OpenMRS, DHIS2) revele que '
    'HealthFlow possede deja des avantages competitifs uniques : architecture multi-hopitaux native, mode '
    'hors-ligne PWA, support de 5 langues dont 3 langues locales guineennes, integration Mobile Money, et '
    'conformite HL7 FHIR R4. Cependant, pour depasser ces standards, des avances significatives sont '
    'necessaires dans sept domaines strategiques que ce document detaille.', body_style))
story.append(Spacer(1, 8))

kpi_data = [
    [Paragraph('<b>Indicateur</b>', header_cell_style),
     Paragraph('<b>Etat Actuel</b>', header_cell_style),
     Paragraph('<b>Objectif 2027</b>', header_cell_style),
     Paragraph('<b>Reference Mondiale</b>', header_cell_style)],
    [Paragraph('Etablissements connectes', cell_style),
     Paragraph('10 (demo)', cell_center_style),
     Paragraph('150+', cell_center_style),
     Paragraph('Epic: 2 500+', cell_center_style)],
    [Paragraph('Temps de reponse API', cell_style),
     Paragraph('< 200ms', cell_center_style),
     Paragraph('< 50ms', cell_center_style),
     Paragraph('Cerner: < 100ms', cell_center_style)],
    [Paragraph('Disponibilite', cell_style),
     Paragraph('99.5%', cell_center_style),
     Paragraph('99.99%', cell_center_style),
     Paragraph('Epic: 99.99%', cell_center_style)],
    [Paragraph('Langues supportees', cell_style),
     Paragraph('5', cell_center_style),
     Paragraph('12+', cell_center_style),
     Paragraph('OpenMRS: 30+', cell_center_style)],
    [Paragraph('Conformite FHIR', cell_style),
     Paragraph('R4 partiel', cell_center_style),
     Paragraph('R4 complet', cell_center_style),
     Paragraph('Epic: R4 certifie', cell_center_style)],
]
story.extend(make_table(kpi_data, [0.30, 0.20, 0.20, 0.30], 'Tableau 1 : Benchmarks comparatifs HealthFlow vs leaders mondiaux'))

# ══════════ 2. ARCHITECTURE ══════════
story.extend(add_major_section('2. Architecture Multi-Hopitaux de Classe Mondiale'))
story.append(add_heading('2.1 Modele Hierarchique National', h2_style, level=1))
story.append(Paragraph(
    'Le systeme de sante guineen est organise hierarchiquement : Ministere de la Sante, 8 Directions '
    'Regionales, 33 prefectures, et plus de 400 formations sanitaires. HealthFlow doit refleter cette '
    'structure avec un modele hierarchique a 5 niveaux, permettant a chaque niveau de governance d\'acceder '
    'aux donnees pertinentes pour sa sphere de responsabilite. Ce modele s\'inspire des meilleures pratiques '
    'des systemes nationaux anglais (NHS Spine), francais (HIPPS), et rwandais (eHealth RHIS), tout en '
    's\'adaptant aux realites guineennes : connectivite limitee, personnel forme en informatique reduit, '
    'et necessite d\'un fonctionnement hors-ligne prolonge.', body_style))
story.append(Spacer(1, 6))

hierarchy_data = [
    [Paragraph('<b>Niveau</b>', header_cell_style),
     Paragraph('<b>Entite</b>', header_cell_style),
     Paragraph('<b>Role</b>', header_cell_style),
     Paragraph('<b>Scope de donnees</b>', header_cell_style)],
    [Paragraph('0 - National', cell_style), Paragraph('Ministere de la Sante', cell_style),
     Paragraph('Directeur General', cell_style), Paragraph('Toutes les donnees nationales', cell_style)],
    [Paragraph('1 - Regional', cell_style), Paragraph('DRS (8 regions)', cell_style),
     Paragraph('Directeur Regional', cell_style), Paragraph('Donnees de la region', cell_style)],
    [Paragraph('2 - Hopital', cell_style), Paragraph('CHU, HGR, HGD', cell_style),
     Paragraph('Directeur Hopital', cell_style), Paragraph('Donnees de l\'etablissement', cell_style)],
    [Paragraph('3 - Service', cell_style), Paragraph('Departements cliniques', cell_style),
     Paragraph('Chef de Service', cell_style), Paragraph('Donnees du service uniquement', cell_style)],
    [Paragraph('4 - Unite', cell_style), Paragraph('Equipes de soin', cell_style),
     Paragraph('Infirmier chef', cell_style), Paragraph('Patients assignes', cell_style)],
]
story.extend(make_table(hierarchy_data, [0.15, 0.25, 0.25, 0.35], 'Tableau 2 : Modele hierarchique a 5 niveaux'))

story.append(add_heading('2.2 Autonomie des Services et Delegation', h2_style, level=1))
story.append(Paragraph(
    'Chaque service hospitalier est autonome dans sa gestion quotidienne : planification des soins, '
    'gestion des lits, attribution du personnel, et suivi budgetaire. Cette autonomie est un principe '
    'fondamental qui distingue HealthFlow des systemes centralises comme Cerner ou Meditech, ou chaque '
    'action doit etre validee par l\'administration centrale. Le modele HealthFlow s\'inspire plutot du '
    'systeme scandinave (Danemark, Suede) ou chaque service clinique est une unite operationnelle '
    'independante avec son propre budget, ses propres indicateurs de performance, et son propre chef.', body_style))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Le mecanisme de delegation permet a un directeur d\'hopital ou un directeur regional de prendre '
    'temporairement le controle d\'un service lorsque son chef est indisponible (conge, maladie, formation). '
    'Ce mecanisme, unique dans les HIS actuels, s\'inspire du systeme de delegation d\'autorite militaire, '
    'adapte au contexte medical. Il inclut : une demande de delegation avec motif, une approbation a deux '
    'niveaux, une duree limitee (24h pour urgence, 72h pour delegation standard), et un audit trail complet '
    'de toutes les actions effectuees sous delegation.', body_style))

story.append(add_heading('2.3 Transferts Inter-Etablissements', h2_style, level=1))
story.append(Paragraph(
    'Les transferts de patients entre etablissements sont une operation critique en Guinee, ou les '
    'patients sont souvent references des centres de sante ruraux vers les hopitaux regionaux, puis '
    'vers les CHU de Conakry. HealthFlow implemente un protocole de transfert structure qui depasse '
    'les standards actuels : le dossier patient complet (antecedents, examens, traitements en cours) '
    'est transmis automatiquement via FHIR au nouvel etablissement, le pharmacien de l\'etablissement '
    'd\'accueil est notifie des medicaments en cours pour assurer la continuite therapeutique, le '
    'transport est organise via le module de teleconsultation si necessaire, et un feedback boucle '
    'est envoye a l\'etablissement d\'origine pour fermer le circuit de soin.', body_style))

# ══════════ 3. IA ══════════
story.extend(add_major_section('3. Intelligence Artificielle et Medecine Predictive'))
story.append(add_heading('3.1 Aide au Diagnostic Contextualisee', h2_style, level=1))
story.append(Paragraph(
    'Les systemes d\'aide au diagnostic actuels (IBM Watson Health, Google DeepMind Health, Babylon Health) '
    'ont echoue dans les pays en developpement car ils sont entraines sur des donnees de populations '
    'occidentales et ne tiennent pas compte des realites epidemiologiques locales. HealthFlow introduit '
    'un modele d\'IA contextualise qui : integre les profils epidemiologiques specifiques a chaque region '
    'de Guinee (paludisme en Basse-Guinee, onchocercose en Haute-Guinee, fievre de Lassa en Guinee '
    'Forestiere), prend en compte les disponibilites medicamenteuses locales pour ne pas recommander '
    'des traitements indisponibles, respecte les protocoles de l\'OMS adaptes au contexte guineen, et '
    'utilise le raisonnement bayesien plutot que le deep learning pour fonctionner hors-ligne avec des '
    'ressources limitees.', body_style))

story.append(add_heading('3.2 Surveillance Epidemiologique Predictive', h2_style, level=1))
story.append(Paragraph(
    'La surveillance epidemiologique de HealthFlow va au-dela du simple signalement. Le systeme utilise '
    'des modeles de detection d\'anomalies en temps reel pour identifier des pics de consultations inexpliques, '
    'des clusters geographiques de symptomes similaires, et des deviations par rapport aux tendances '
    'historiques. Ces modeles s\'inspirent du systeme ProMED-mail et du GPHIN canadien, mais avec une '
    'innovation majeure : l\'integration directe avec les donnees cliniques en temps reel plutot que le '
    'monitorage des sources d\'information publiques. Le systeme peut detecter une epidemie 48 a 72 heures '
    'avant qu\'elle ne soit visible dans les statistiques traditionnelles, un avantage decisif pour un pays '
    'comme la Guinee qui a ete l\'epicentre de l\'epidemie d\'Ebola de 2014-2016.', body_style))

story.append(add_heading('3.3 Planification Predictive des Ressources', h2_style, level=1))
story.append(Paragraph(
    'Le module de planification predictive analyse les tendances historiques pour prevoir les besoins '
    'en ressources : prediction du taux d\'occupation des lits a 7 jours, alerte preventive de rupture '
    'de stock des medicaments essentiels 2 semaines a l\'avance, planification des effectifs infirmiers '
    'en fonction des previsions d\'admissions, et optimisation du planning chirurgical. Ce module '
    's\'inspire des modeles predictifs du NHS anglais et du systeme australien AEOLS, mais les adapte '
    'aux contraintes guineennes : donnees historiques limitees, forte variabilite saisonniere liee au '
    'paludisme, et necessite de modeles legers fonctionnant sur des serveurs locaux.', body_style))

# ══════════ 4. INTEROPERABILITE ══════════
story.extend(add_major_section('4. Interoperabilite et Standards Internationaux'))
story.append(add_heading('4.1 Conformite FHIR R4 Complete', h2_style, level=1))
story.append(Paragraph(
    'HealthFlow supporte deja partiellement HL7 FHIR R4. Pour atteindre le niveau des systemes certifies '
    '(Epic, Cerner), il faut implementer les 14 profils FHIR essentiels pour un HIS : Patient, '
    'Practitioner, Organization, Location, Encounter, Condition, Observation, Procedure, MedicationRequest, '
    'DiagnosticReport, ImagingStudy, Immunization, CarePlan, et Task. Chaque profil doit inclure les '
    'extensions specifiques au contexte guineen : identifiant national de sante guineen (INS), region '
    'administrative, langue preferee parmi les langues locales, et mode de paiement (Mobile Money). '
    'La certification HL7 FHIR R4 est un prerequis pour l\'integration avec les systemes internationaux '
    'et les programmes de l\'OMS.', body_style))

story.append(add_heading('4.2 Integration DHIS2 Bidirectionnelle', h2_style, level=1))
story.append(Paragraph(
    'DHIS2 est le systeme de collecte de donnees sanitaire le plus deploye en Afrique. La Guinee '
    'l\'utilise pour le Systeme National d\'Information Sanitaire (SNIS). L\'integration HealthFlow-DHIS2 '
    'doit etre bidirectionnelle : HealthFlow pousse automatiquement les indicateurs aggrege vers DHIS2 '
    '(supprimant la double saisie), et HealthFlow recoit les donnees de population et les indicateurs '
    'nationaux de DHIS2 pour contextualiser les analyses locales. Cette integration depasse ce que font '
    'la plupart des HIS commerciaux qui se contentent d\'un export unidirectionnel. Le connecteur DHIS2 '
    'existant doit etre enrichi avec la synchronisation en temps reel via l\'API DHIS2 tracker, le support '
    'des programTracker pour le suivi des patients tuberculeux et VIH, et l\'integration des donnees de '
    'couverture vaccinale du programme PEV.', body_style))

story.append(add_heading('4.3 Echange Transfrontalier de Donnees de Sante', h2_style, level=1))
story.append(Paragraph(
    'La Guinee partage des frontieres avec 6 pays (Senegal, Mali, Cote d\'Ivoire, Liberia, Sierra Leone, '
    'Guinee-Bissau). Les epidemies ne connaissent pas de frontieres, comme l\'a montre Ebola en 2014. '
    'HealthFlow implemente le profil IHE XCA (Cross-Community Access) pour l\'echange de donnees de sante '
    'avec les systemes des pays frontaliers. Ce module permet de retrouver le dossier d\'un patient '
    'provenant d\'un pays voisin en urgence, de partager les alertes epidemiologiques transfrontalieres '
    'en temps reel, et de coordonner les ripostes sanitaires regionales. Aucun HIS commercial actuel '
    'n\'offre cette capacite native, ce qui constitue un avantage competitif majeur pour HealthFlow.', body_style))

# ══════════ 5. SECURITE ══════════
story.extend(add_major_section('5. Securite et Conformite Reglementaire'))
story.append(add_heading('5.1 Chiffrement de Niveau Militaire', h2_style, level=1))
story.append(Paragraph(
    'HealthFlow utilise deja le chiffrement AES-256-GCM pour les donnees sensibles. Pour depasser les '
    'standards actuels, il faut implementer le chiffrement de bout en bout (E2EE) entre les etablissements '
    'pour les transferts de patients, le chiffrement au repos de toute la base de donnees avec rotation '
    'automatique des cles tous les 90 jours, le chiffrement homomorphe pour les analyses statistiques '
    'sur des donnees chiffrees (permettant l\'analyse sans dechiffrement), et la gestion des cles '
    'decentralisee via un reseau de confiance type blockchain privee. Ces technologies sont utilisees '
    'par les systemes de defense nationaux mais encore rares dans les HIS, offrant a HealthFlow un '
    'avantage de confidentialite sans precedent dans le secteur sante africain.', body_style))

story.append(add_heading('5.2 Conformite RGPD et Loi Guineenne', h2_style, level=1))
story.append(Paragraph(
    'La Guinee adopte progressivement un cadre juridique de protection des donnees personnelles de sante. '
    'HealthFlow doit anticiper ces regulations en implementant : le droit a l\'oubli (suppression '
    'anonymisee des donnees patient sur demande), la portabilite des donnees (export complet au format '
    'FHIR Bundle), le consentement eclaire numerique avec horodatage et signature electronique, et le '
    'registre des traitements automatise. En outre, HealthFlow doit respecter la Convention 108+ du '
    'Conseil de l\'Europe sur la protection des donnees, qui constitue le standard international de '
    'reference pour les pays francophones d\'Afrique.', body_style))

story.append(add_heading('5.3 Audit Trail Immutable', h2_style, level=1))
story.append(Paragraph(
    'Le systeme d\'audit de HealthFlow doit devenir immutable pour garantir la tracabilite juridique '
    'de toutes les actions. Chaque acces aux donnees patient, chaque modification de dossier, chaque '
    'delegation d\'autorite, et chaque export de donnees doit etre enregistre dans un journal '
    'append-only signe cryptographiquement. Ce journal doit utiliser la structure de Merkle Tree pour '
    'detecter toute alteration, et les entrees doivent etre horodatees par un service de confiance '
    '(horodatage qualifie eIDAS). Ce niveau d\'audit depasse les standards HIPAA et RGPD, et constitue '
    'une innovation unique dans le domaine des HIS.', body_style))

# ══════════ 6. HORS-LIGNE ══════════
story.extend(add_major_section('6. Mode Hors-Ligne et Resilience du Systeme'))
story.append(add_heading('6.1 Architecture Offline-First', h2_style, level=1))
story.append(Paragraph(
    'La Guinee fait face a des coupures d\'electricite frequentes et une connectivite Internet '
    'intermittente, en particulier en zones rurales. HealthFlow adopte une architecture offline-first '
    'qui depasse les approches PWA traditionnelles : la base de donnees locale IndexedDB stocke '
    'l\'integralite du dossier patient du service (pas seulement un cache), le moteur de synchronisation '
    'utilise le protocole CRDT (Conflict-free Replicated Data Types) pour resoudre automatiquement les '
    'conflits sans intervention humaine, les actions sensibles (prescriptions, admissions) sont signees '
    'localement et validees a la synchronisation, et le systeme fonctionne en autonomie complete pendant '
    '72 heures minimum sans connexion. Cette approche s\'inspire du systeme CommCare utilise par '
    'Dimagi dans 100+ pays, mais l\'etend aux operations cliniques complexes.', body_style))

story.append(add_heading('6.2 Synchronisation Intelligente', h2_style, level=1))
story.append(Paragraph(
    'Le module de synchronisation doit etre intelligent pour optimiser la bande passante limitee : '
    'priorisation des donnees par urgence clinique (alertes epidemiques en premier, puis admissions, '
    'puis consultations, puis statistiques), compression differentielle qui n\'envoie que les champs '
    'modifies, synchronisation incrementale basee sur les horodatages FHIR, et mode satellite qui '
    'utilise les connections inter-etablissements comme relais quand Internet est indisponible. Le '
    'systeme doit pouvoir synchroniser 24 heures de donnees cliniques en moins de 5 minutes de connexion, '
    'un defi technique que seul le systeme SANA au Bangladesh a partiellement releve.', body_style))

# ══════════ 7. INCLUSIVITE ══════════
story.extend(add_major_section('7. Inclusivite et Accessibilite Universelle'))
story.append(add_heading('7.1 Interfaces Vocales en Langues Locales', h2_style, level=1))
story.append(Paragraph(
    'La Guinee compte un taux d\'alphabetisation de 32%, rendant les interfaces textuelles inaccessibles '
    'pour une grande partie de la population. HealthFlow doit implementer des interfaces vocales en '
    'langues locales (Malinke, Soussou, Poular) utilisant la reconnaissance vocale adaptee aux accents '
    'guineens et la synthese vocale dans ces langues. Cette capacite, encore absente des HIS commerciaux, '
    'permettra aux agents de sante communautaire de saisir des donnees cliniques par la voix, aux patients '
    'de recevoir leurs resultats et rappels de rendez-vous par message vocal, et aux personnes '
    'analphabetes d\'interagir avec le systeme de sante numerique. Les modeles de reconnaissance vocale '
    'seront entraines sur des corpus locaux en partenariat avec l\'Universite de Conakry.', body_style))

story.append(add_heading('7.2 Accessibilite pour Personnes en Situation de Handicap', h2_style, level=1))
story.append(Paragraph(
    'HealthFlow doit respecter les normes WCAG 2.1 AA comme minimum, et viser le niveau AAA pour les '
    'fonctions critiques. Cela inclut : navigation complete au clavier, contraste minimum 7:1 pour le '
    'texte, compatibilite totale avec les lecteurs d\'ecran (NVDA, JAWS, VoiceOver), mode daltonien '
    'avec icones differenciees, et taille de police ajustable de 12pt a 24pt. Aucun HIS actuel ne '
    'respecte entierement ces normes, offrant a HealthFlow une opportunite de leadership dans '
    'l\'accessibilite numerique en sante.', body_style))

story.append(add_heading('7.3 Telemedecine a Bande Etroite', h2_style, level=1))
story.append(Paragraph(
    'La telemedecine conventionnelle (video HD) est inutilisable dans les zones rurales guineennes ou '
    'la bande passante est inferieure a 1 Mbps. HealthFlow doit implementer un mode telemedecine a '
    'bande etroite : consultation asynchrone par messages structures (symptomes, photos, antecedents), '
    'stethoscope numerique a bas debit pour l\'auscultation a distance, dermoscope portable avec '
    'transmission d\'images compressees, et chat medical avec traduction automatique entre les langues '
    'locales et le francais medical. Ce mode est inspire du systeme RAFT utilise en Afrique francophone '
    'mais enrichi avec l\'intelligence artificielle pour pre-analyser les symptomes avant la '
    'consultation.', body_style))

# ══════════ 8. FEUILLE DE ROUTE ══════════
story.extend(add_major_section('8. Feuille de Route d\'Implementation'))
story.append(Paragraph(
    'La mise en oeuvre des recommandations ci-dessus suit une approche progressive en 4 phases, '
    'chacune apportant une valeur ajoutee immediate tout en preparant la suivante. Cette approche '
    'iterative s\'inspire de la methode agile utilisee par les startups technologiques mais adaptee '
    'aux contraintes du secteur sante : validation clinique obligatoire, conformite reglementaire, '
    'et impact patient mesurable a chaque phase.', body_style))
story.append(Spacer(1, 8))

roadmap_data = [
    [Paragraph('<b>Phase</b>', header_cell_style),
     Paragraph('<b>Periode</b>', header_cell_style),
     Paragraph('<b>Objectifs</b>', header_cell_style),
     Paragraph('<b>Livrables</b>', header_cell_style)],
    [Paragraph('Phase 9 : Fondations', cell_style),
     Paragraph('Q3-Q4 2026', cell_center_style),
     Paragraph('Architecture multi-hopitaux, RBAC unifie, dashboard adaptatif', cell_style),
     Paragraph('Systeme multi-hopitaux fonctionnel avec 3 CHU pilotes', cell_style)],
    [Paragraph('Phase 10 : Intelligence', cell_style),
     Paragraph('Q1-Q2 2027', cell_center_style),
     Paragraph('IA predictive, surveillance epidemiologique, FHIR R4 complet', cell_style),
     Paragraph('Module IA operationnel, certification FHIR', cell_style)],
    [Paragraph('Phase 11 : Integration', cell_style),
     Paragraph('Q3-Q4 2027', cell_center_style),
     Paragraph('DHIS2 bidirectionnel, echange transfrontalier, securite avancee', cell_style),
     Paragraph('Integration regionale CEDEAO, audit immutable', cell_style)],
    [Paragraph('Phase 12 : Scale', cell_style),
     Paragraph('2028+', cell_center_style),
     Paragraph('Deploiement national, interfaces vocales, telemedecine bas debit', cell_style),
     Paragraph('150+ etablissements, reference panafricaine', cell_style)],
]
story.extend(make_table(roadmap_data, [0.15, 0.13, 0.37, 0.35], 'Tableau 3 : Feuille de route d\'implementation'))

# ══════════ 9. CONCLUSION ══════════
story.extend(add_major_section('9. Conclusion et Vision'))
story.append(Paragraph(
    'HealthFlow Guinea n\'est pas un simple systeme d\'information hospitalier. C\'est une plateforme '
    'de transformation numerique du systeme de sante qui a le potentiel de devenir la reference '
    'mondiale pour les pays a revenu intermediaire. En combinant les meilleures pratiques des systemes '
    'occidentaux (Epic, Cerner) avec des innovations adaptees au contexte africain (mode hors-ligne '
    'avance, interfaces vocales en langues locales, telemedecine a bande etroite, echange transfrontalier), '
    'HealthFlow peut depasser les standards actuels dans des domaines ou les systemes existants ont '
    'echoue : accessibilite universelle, resilience en contexte de ressources limitees, et integration '
    'regionale pour la securite sanitaire.', body_style))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'L\'architecture multi-hopitaux avec services autonomes et delegation hierarchique est deja '
    'implementee dans HealthFlow, ce qui constitue une avancee significative par rapport aux systemes '
    'existants. Les recommandations de ce document visent a consolider cette avance et a l\'etendre '
    'vers l\'intelligence artificielle predictive, l\'interoperabilite regionale, et l\'inclusivite '
    'numerique. Le resultat sera un systeme qui non seulement repond aux besoins de la Guinee, mais '
    'qui peut etre deploye dans l\'ensemble de la sous-region ouest-africaine et au-dela, positionnant '
    'la Guinee comme leader de l\'innovation numerique en sante sur le continent africain.', body_style))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'DataSphere Innovation, sous la direction de Sekouna KABA, est determinee a faire de HealthFlow '
    'Guinea un systeme de sante numerique qui depasse les standards mondiaux. Ce document constitue '
    'la feuille de route pour atteindre cet objectif ambitieux mais realisable, avec un impact '
    'mesurable sur la qualite des soins pour chaque citoyen guineen.', body_style))

# ── Build ──
doc.multiBuild(story)
print(f"PDF genere avec succes : {output_path}")
