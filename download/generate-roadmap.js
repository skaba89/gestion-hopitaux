const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, LevelFormat, PageOrientation,
} = require("docx");
const fs = require("fs");

// ── Palette: Mint Dawn (Health / Green / Africa) ──
const P = {
  primary: "1A3A3A",
  body: "1E2E40",
  secondary: "507070",
  accent: "3CB4A0",
  surface: "F0FFFE",
  cover: {
    bg: "0C1F1A",
    titleColor: "FFFFFF",
    subtitleColor: "B0E8D8",
    metaColor: "90B8A8",
    footerColor: "687078",
  },
  table: {
    headerBg: "2A7A65",
    headerText: "FFFFFF",
    accentLine: "2A7A65",
    innerLine: "C5D8D0",
    surface: "EDF5F2",
  },
};

const c = (hex) => hex.replace("#", "");

// ── Helper builders ──
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: c(P.primary),
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: c(P.primary),
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 312 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: c(P.primary),
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function bodyText(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    spacing: { line: 312, after: 80 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: c(P.body),
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function bodyTextNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: c(P.body),
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: c(P.body),
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      }),
    ],
  });
}

function accentLine() {
  return new Paragraph({
    indent: { left: 500, right: 500 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 8, color: c(P.accent), space: 16 },
    },
    spacing: { before: 100, after: 100 },
    children: [],
  });
}

function emptyPara(h = 80) {
  return new Paragraph({ spacing: { before: h, after: h }, children: [] });
}

// ── Table helper ──
function createDataTable(headers, rows) {
  const t = P.table;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map(
          (h) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: t.headerBg },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      size: 21,
                      color: t.headerText,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row, idx) =>
          new TableRow({
            cantSplit: true,
            children: row.map(
              (cell) =>
                new TableCell({
                  shading: {
                    type: ShadingType.CLEAR,
                    fill: idx % 2 === 0 ? t.surface : "FFFFFF",
                  },
                  margins: { top: 60, bottom: 60, left: 120, right: 120 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          size: 20,
                          color: c(P.body),
                          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
}

// ── Cover Section (R1-style, dark bg) ──
function buildCover() {
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const allNoBorders = {
    top: NB,
    bottom: NB,
    left: NB,
    right: NB,
    insideHorizontal: NB,
    insideVertical: NB,
  };

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [
        new TableRow({
          height: { value: 16838, rule: "exact" },
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: P.cover.bg },
              borders: allNoBorders,
              verticalAlign: "top",
              children: [
                new Paragraph({ spacing: { before: 2800 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 900, lineRule: "atLeast", after: 200 },
                  children: [
                    new TextRun({
                      text: "HealthFlow Africa",
                      bold: true,
                      size: 72,
                      color: P.cover.titleColor,
                      font: { ascii: "Calibri", eastAsia: "SimHei" },
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  indent: { left: 1500, right: 1500 },
                  border: {
                    top: {
                      style: BorderStyle.SINGLE,
                      size: 8,
                      color: c(P.accent),
                      space: 20,
                    },
                  },
                  spacing: { after: 300 },
                  children: [],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 600, lineRule: "atLeast", after: 100 },
                  children: [
                    new TextRun({
                      text: "Feuille de Route Strat\u00e9gique 2025\u20132030",
                      size: 36,
                      color: P.cover.subtitleColor,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { line: 500, lineRule: "atLeast", after: 80 },
                  children: [
                    new TextRun({
                      text: "Transformer la sant\u00e9 num\u00e9rique en Guin\u00e9e et en Afrique",
                      size: 26,
                      color: P.cover.metaColor,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                      italics: true,
                    }),
                  ],
                }),
                new Paragraph({ spacing: { before: 1800 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 60 },
                  children: [
                    new TextRun({
                      text: "DataSphere Innovation",
                      bold: true,
                      size: 24,
                      color: P.cover.subtitleColor,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 60 },
                  children: [
                    new TextRun({
                      text: "France & Guin\u00e9e \u2022 Fond\u00e9 par Sekouna KABA",
                      size: 20,
                      color: P.cover.metaColor,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Mai 2025",
                      size: 20,
                      color: P.cover.footerColor,
                      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

// ── Body Content ──
function buildBody() {
  const children = [];

  // ─── SECTION 1: VISION ───
  children.push(heading1("1. Vision et Ambition"));
  children.push(
    bodyText(
      "HealthFlow Africa est bien plus qu\u2019un simple syst\u00e8me d\u2019information hospitalier. C\u2019est une plateforme de sant\u00e9 num\u00e9rique pens\u00e9e, con\u00e7ue et d\u00e9ploy\u00e9e pour le contexte africain, avec une ambition claire : rendre les soins de sant\u00e9 accessibles, efficaces et intelligents pour chaque citoyen, de Conakry aux zones rurales les plus recul\u00e9es du continent. Notre vision s\u2019articule autour de trois piliers fondamentaux qui guident chaque d\u00e9cision strat\u00e9gique et chaque ligne de code que nous \u00e9crivons."
    )
  );
  children.push(
    bodyText(
      "Le premier pilier est l\u2019universalit\u00e9 de l\u2019acc\u00e8s aux soins. En Afrique, la fracture num\u00e9rique reste une r\u00e9alit\u00e9 : seuls 36% de la population guin\u00e9enne a acc\u00e8s r\u00e9gulier \u00e0 Internet, et cette proportion chute \u00e0 moins de 10% dans les zones rurales. HealthFlow Africa int\u00e8gre d\u00e8s sa conception des m\u00e9canismes de fonctionnement offline, des interfaces l\u00e9g\u00e8res compatibles avec les t\u00e9l\u00e9phones basiques, et des ponts SMS/WhatsApp pour atteindre chaque patient, m\u00eame sans connexion Internet. L\u2019objectif est qu\u2019aucun citoyen ne soit priv\u00e9 de soins de qualit\u00e9 pour des raisons technologiques."
    )
  );
  children.push(
    bodyText(
      "Le deuxi\u00e8me pilier est l\u2019intelligence artificielle au service du diagnostic et de la d\u00e9cision m\u00e9dicale. L\u2019Afrique fait face \u00e0 une p\u00e9nurie critique de personnels de sant\u00e9 : la Guin\u00e9e compte seulement 1 m\u00e9decin pour 10 000 habitants, loin des recommandations de l\u2019OMS. HealthFlow Africa int\u00e8gre un assistant IA de diagnostic, un v\u00e9rificateur d\u2019interactions m\u00e9dicamenteuses et un syst\u00e8me d\u2019alerte pr\u00e9coce pour les \u00e9pid\u00e9mies, permettant aux agents de sant\u00e9 communautaires de poser des diagnostics pr\u00e9liminaires fiables et d\u2019orienter les patients vers les structures adapt\u00e9es."
    )
  );
  children.push(
    bodyText(
      "Le troisi\u00e8me pilier est l\u2019interop\u00e9rabilit\u00e9 \u00e0 l\u2019\u00e9chelle continentale. Les syst\u00e8mes de sant\u00e9 africains fonctionnent souvent en silos, rendant impossible le suivi d\u2019un patient entre diff\u00e9rentes structures ou pays. HealthFlow Africa adopte les standards internationaux HL7 FHIR et openHIE pour garantir que chaque donn\u00e9e de sant\u00e9 puisse circuler de mani\u00e8re s\u00e9curis\u00e9e entre \u00e9tablissements, r\u00e9gions et pays, cr\u00e9ant un v\u00e9ritable r\u00e9seau de sant\u00e9 num\u00e9rique panafricain."
    )
  );

  children.push(accentLine());

  // ─── SECTION 2: ETAT DES LIEUX ───
  children.push(heading1("2. \u00c9tat des Lieux"));
  children.push(
    bodyText(
      "La version actuelle de HealthFlow Guinea constitue une base solide et fonctionnelle. D\u00e9velopp\u00e9e avec Next.js 16, React 19, TypeScript et une architecture Zustand avec persistance locale, la plateforme offre d\u00e9j\u00e0 15 modules fonctionnels couvrant l\u2019ensemble du parcours de soins : gestion des patients, rendez-vous, consultations, laboratoire, pharmacie, hospitalisation, urgences, maternit\u00e9, vaccination, facturation, t\u00e9l\u00e9consultation, analytics, administration et param\u00e8tres. Un portail patient avec comptes familiaux et un syst\u00e8me RBAC compl\u00e8tent cette offre."
    )
  );
  children.push(
    bodyText(
      "Cependant, pour devenir un projet de r\u00e9f\u00e9rence \u00e0 l\u2019\u00e9chelle africaine, plusieurs lacunes doivent \u00eatre combl\u00e9es. L\u2019application fonctionne actuellement en mode SPA avec stockage localStorage, sans connexion aux API backend existantes. L\u2019authentification n\u2019est pas encore op\u00e9rationnelle malgr\u00e9 la pr\u00e9sence de next-auth. Le support multilingue est install\u00e9 mais non configur\u00e9. Aucune fonctionnalit\u00e9 offline n\u2019est impl\u00e9ment\u00e9e. L\u2019int\u00e9gration mobile money est absente, alors qu\u2019elle repr\u00e9sente le principal mode de paiement en Afrique de l\u2019Ouest. Enfin, les capacit\u00e9s IA du z-ai-web-dev-sdk ne sont pas encore exploit\u00e9es."
    )
  );

  children.push(
    createDataTable(
      ["Module", "Statut Actuel", "Cible Phase 1", "Cible Phase 3"],
      [
        [
          "Gestion Patients",
          "CRUD + RBAC",
          "Connexion API + Recherche avanc\u00e9e",
          "ID Sant\u00e9 Nationale + QR",
        ],
        [
          "Rendez-vous",
          "Base fonctionnel",
          "Rappels SMS/WhatsApp",
          "IA optimisation cr\u00e9neaux",
        ],
        [
          "T\u00e9l\u00e9consultation",
          "Interface chat",
          "Vid\u00e9o + Audio",
          "IA pr\u00e9-consultation",
        ],
        [
          "Facturation",
          "Factures basiques",
          "Mobile Money (Orange/MTN)",
          "Assurance sant\u00e9 int\u00e9gr\u00e9e",
        ],
        [
          "Authentification",
          "Non connect\u00e9",
          "Next-Auth + MFA",
          "Biom\u00e9trie locale",
        ],
        [
          "Multilingue",
          "Non configur\u00e9",
          "FR + EN + langues locales",
          "12+ langues africaines",
        ],
        [
          "Mode Offline",
          "Absent",
          "PWA + Sync",
          "Full offline avec conflits",
        ],
        [
          "IA Sant\u00e9",
          "Absent",
          "Chatbot basique",
          "Diagnostic + Alertes \u00e9pid\u00e9mies",
        ],
        [
          "Interop\u00e9rabilit\u00e9",
          "Absent",
          "HL7 FHIR base",
          "openHIE + DHIS2",
        ],
        [
          "Mobile",
          "Web responsive",
          "PWA installable",
          "App native l\u00e9g\u00e8re",
        ],
      ]
    )
  );
  children.push(emptyPara());

  children.push(accentLine());

  // ─── SECTION 3: PHASE 1 ───
  children.push(heading1("3. Phase 1 : Fondations Africaines (Mois 1\u20133)"));
  children.push(
    bodyText(
      "La premi\u00e8re phase pose les fondations techniques essentielles pour un d\u00e9ploiement en contexte africain. Chaque fonctionnalit\u00e9 est con\u00e7ue pour r\u00e9pondre aux d\u00e9fis sp\u00e9cifiques du continent : connectivit\u00e9 intermittente, diversit\u00e9 linguistique, acc\u00e8s limit\u00e9 aux terminaux, et n\u00e9cessit\u00e9 d\u2019une authentification robuste. Cette phase transforme HealthFlow d\u2019un prototype fonctionnel en une plateforme pr\u00eate au d\u00e9ploiement sur le terrain."
    )
  );

  children.push(heading2("3.1 Architecture PWA Offline-First"));
  children.push(
    bodyText(
      "L\u2019architecture PWA (Progressive Web App) est le socle technique le plus critique pour le march\u00e9 africain. Contrairement aux applications web classiques qui deviennent inutilisables sans connexion, une PWA permet de continuer \u00e0 travailler hors ligne, de s\u2019installer sur un t\u00e9l\u00e9phone comme une application native, et de synchroniser les donn\u00e9es automatiquement d\u00e8s que la connexion revient. En Guin\u00e9e, o\u00f9 les coupures d\u2019\u00e9lectricit\u00e9 et d\u2019Internet sont fr\u00e9quentes, cette capacit\u00e9 est non n\u00e9gociable."
    )
  );
  children.push(bulletItem("Service Worker avec strat\u00e9gie Cache-First pour les ressources statiques et Network-First pour les donn\u00e9es API"));
  children.push(bulletItem("IndexedDB comme base de donn\u00e9es locale pour stocker les donn\u00e9es patients hors ligne"));
  children.push(bulletItem("File d\u2019attente de synchronisation avec r\u00e9solution automatique des conflits (derni\u00e8re \u00e9criture ou fusion)"));
  children.push(bulletItem("Manifest.json pour installation sur \u00e9cran d\u2019accueil (Android, iOS, Desktop)"));
  children.push(bulletItem("Indicateur visuel de statut connexion (en ligne/hors ligne/synchronisation en cours)"));
  children.push(bulletItem("Strat\u00e9gie de synchronisation progressive : priorit\u00e9 aux donn\u00e9es critiques (urgences, consultations) puis aux donn\u00e9es secondaires"));

  children.push(heading2("3.2 Internationalisation Multilingue"));
  children.push(
    bodyText(
      "La Guin\u00e9e est un pays multilingue avec trois langues nationales (Malink\u00e9, Soussou, Poular) en plus du fran\u00e7ais officiel. \u00c0 l\u2019\u00e9chelle africaine, la diversit\u00e9 linguistique est encore plus grande avec plus de 2000 langues sur le continent. Un syst\u00e8me de sant\u00e9 num\u00e9rique qui ne parle que fran\u00e7ais ou anglais exclut la majorit\u00e9 de la population rurale, précisément celle qui a le plus besoin d\u2019acc\u00e8s aux soins. L\u2019internationalisation de HealthFlow est donc un imp\u00e9ratif \u00e9thique et strat\u00e9gique."
    )
  );
  children.push(bulletItem("Configuration next-intl avec d\u00e9tection automatique de la langue du navigateur"));
  children.push(bulletItem("Fichiers de traduction pour : Fran\u00e7ais (par d\u00e9faut), Anglais, Malink\u00e9, Soussou, Poular, Wolof, Bambara, Lingala, Swahili"));
  children.push(bulletItem("Interface de s\u00e9lection de langue dans le portail patient avec persistance du choix"));
  children.push(bulletItem("Syst\u00e8me de traduction communautaire pour ajouter de nouvelles langues via des fichiers JSON"));
  children.push(bulletItem("Support RTL pour les langues arabes et haoussa"));
  children.push(bulletItem("Traduction des termes m\u00e9dicaux adapt\u00e9e au contexte local (ex : \u00ab paludisme \u00bb plut\u00f4t que \u00ab malaria \u00bb en Afrique francophone)"));

  children.push(heading2("3.3 Authentification S\u00e9curis\u00e9e"));
  children.push(
    bodyText(
      "La s\u00e9curit\u00e9 des donn\u00e9es de sant\u00e9 est un imp\u00e9ratif l\u00e9gal et \u00e9thique. La plateforme doit garantir que seules les personnes autoris\u00e9es acc\u00e8dent aux dossiers m\u00e9dicaux, conform\u00e9ment aux recommandations de l\u2019OMS et aux cadres r\u00e9glementaires africains en mati\u00e8re de protection des donn\u00e9es de sant\u00e9. L\u2019authentification doit \u00e9galement prendre en compte les r\u00e9alit\u00e9s locales : acc\u00e8s limit\u00e9 \u00e0 l\u2019email, pr\u00e9f\u00e9rence pour le t\u00e9l\u00e9phone, et n\u00e9cessit\u00e9 de m\u00e9thodes d\u2019authentification adapt\u00e9es aux contextes \u00e0 faible connectivit\u00e9."
    )
  );
  children.push(bulletItem("Next-Auth avec providers : credentials (t\u00e9l\u00e9phone + code), Google, Microsoft"));
  children.push(bulletItem("Authentification par num\u00e9ro de t\u00e9l\u00e9phone et code OTP (SMS) comme m\u00e9thode principale"));
  children.push(bulletItem("Gestion des sessions avec tokens JWT et refresh tokens s\u00e9curis\u00e9s"));
  children.push(bulletItem("Multi-factor authentication (MFA) optionnel pour les administrateurs"));
  children.push(bulletItem("Journal d\u2019audit de toutes les connexions et acc\u00e8s aux donn\u00e9es sensibles"));
  children.push(bulletItem("R\u00f4les et permissions granulaires d\u00e9j\u00e0 impl\u00e9ment\u00e9s (Administrateur, M\u00e9decin, Infirmier, Laborantin, Pharmacien, Secr\u00e9taire)"));

  children.push(heading2("3.4 Connexion API Backend"));
  children.push(
    bodyText(
      "L\u2019application dispose d\u00e9j\u00e0 de 15 routes API compl\u00e8tes avec Prisma ORM connect\u00e9 \u00e0 SQLite, mais les composants frontend utilisent encore le store Zustand avec donn\u00e9es de d\u00e9monstration en localStorage. La connexion de l\u2019interface aux API backend est essentielle pour permettre la persistance r\u00e9elle des donn\u00e9es, la collaboration multi-utilisateurs, et le d\u00e9ploiement multi-\u00e9tablissements. Cette migration doit \u00eatre progressive pour ne pas casser les fonctionnalit\u00e9s existantes."
    )
  );
  children.push(bulletItem("Migration progressive du store Zustand vers les appels API avec React Query"));
  children.push(bulletItem("Hooks personnalis\u00e9s (usePatients, useAppointments, etc.) avec cache et invalidation automatique"));
  children.push(bulletItem("Optimistic updates pour une exp\u00e9rience utilisateur fluide m\u00eame en connexion lente"));
  children.push(bulletItem("Gestion des erreurs r\u00e9seau avec retry automatique et fallback sur donn\u00e9es locales"));
  children.push(bulletItem("Migration SQLite vers PostgreSQL pour le d\u00e9ploiement production multi-utilisateurs"));

  children.push(accentLine());

  // ─── SECTION 4: PHASE 2 ───
  children.push(heading1("4. Phase 2 : Paiements et Int\u00e9grations (Mois 4\u20136)"));
  children.push(
    bodyText(
      "La deuxi\u00e8me phase introduit les fonctionnalit\u00e9s de paiement et les int\u00e9grations critiques qui feront de HealthFlow une plateforme \u00e9conomiquement viable et profond\u00e9ment ancr\u00e9e dans l\u2019\u00e9cosyst\u00e8me africain. Le mobile money repr\u00e9sente plus de 70% des transactions financi\u00e8res en Afrique de l\u2019Ouest, et son int\u00e9gration est indispensable pour la p\u00e9rennit\u00e9 du syst\u00e8me. Les rappels par SMS et WhatsApp, quant \u00e0 eux, r\u00e9pondent \u00e0 un besoin r\u00e9el de communication dans un contexte o\u00f9 l\u2019email est peu utilis\u00e9."
    )
  );

  children.push(heading2("4.1 Mobile Money : Orange Money et MTN MoMo"));
  children.push(
    bodyText(
      "L\u2019int\u00e9gration du mobile money est un levier de transformation consid\u00e9rable. En Guin\u00e9e, Orange Money et MTN Mobile Money repr\u00e9sentent plus de 2 millions d\u2019utilisateurs actifs. Permettre aux patients de payer leurs consultations, leurs ordonnances et leurs factures hospitali\u00e8res directement depuis leur t\u00e9l\u00e9phone \u00e9limine les barri\u00e8res de paiement, r\u00e9duit la fraude et acc\u00e9l\u00e8re les encaissements pour les \u00e9tablissements de sant\u00e9. Cette int\u00e9gration doit \u00eatre s\u00e9curis\u00e9e, conforme aux normes de la BCEAO et offrir une tra\u00e7abilit\u00e9 compl\u00e8te de chaque transaction."
    )
  );
  children.push(bulletItem("API Orange Money : int\u00e9gration du SDK officiel avec paiement web et USSD"));
  children.push(bulletItem("API MTN MoMo : int\u00e9gration avec le MoMo API Sandbox puis production"));
  children.push(bulletItem("Paiement par QR Code : g\u00e9n\u00e9ration et scan de QR codes de paiement directement dans l\u2019application"));
  children.push(bulletItem("Tableau de bord financier : suivi des encaissements, impay\u00e9s, et rapports de tr\u00e9sorerie en temps r\u00e9el"));
  children.push(bulletItem("Notifications de paiement : confirmation instantan\u00e9e par SMS et in-app"));
  children.push(bulletItem("Module de cr\u00e9dit sant\u00e9 : paiement \u00e9chelonn\u00e9 pour les soins co\u00fbteux (maternit\u00e9, chirurgie)"));

  children.push(heading2("4.2 SMS et WhatsApp Business API"));
  children.push(
    bodyText(
      "La communication en Afrique passe principalement par le t\u00e9l\u00e9phone mobile. Le taux de p\u00e9n\u00e9tration mobile en Guin\u00e9e d\u00e9passe 80%, et WhatsApp y est l\u2019application la plus utilis\u00e9e. L\u2019int\u00e9gration de canaux SMS et WhatsApp permet d\u2019atteindre chaque patient dans sa pr\u00e9f\u00e9rence de communication, d\u2019am\u00e9liorer l\u2019observance des traitements et de r\u00e9duire les rendez-vous manqu\u00e9s, qui co\u00fbtent cher aux \u00e9tablissements de sant\u00e9 et d\u00e9sorganisent les plannings m\u00e9dicaux."
    )
  );
  children.push(bulletItem("Rappels de rendez-vous automatiques : SMS 24h avant et WhatsApp 2h avant"));
  children.push(bulletItem("Notifications de r\u00e9sultats de laboratoire par SMS avec lien s\u00e9curis\u00e9"));
  children.push(bulletItem("Rappels de vaccination pour les enfants : calendrier automatique bas\u00e9 sur l\u2019\u00e2ge"));
  children.push(bulletItem("Chatbot WhatsApp pour prise de rendez-vous et questions fr\u00e9quentes"));
  children.push(bulletItem("Alertes de rappel de prise de m\u00e9dicaments pour les traitements chroniques (VIH, tuberculose, paludisme)"));
  children.push(bulletItem("Campagnes de sant\u00e9 publique : envoi group\u00e9 d\u2019informations sur les \u00e9pid\u00e9mies et les campagnes de vaccination"));

  children.push(heading2("4.3 Assurance Sant\u00e9 Int\u00e9gr\u00e9e"));
  children.push(
    bodyText(
      "L\u2019assurance sant\u00e9 en Afrique de l\u2019Ouest est un march\u00e9 en pleine expansion. En Guin\u00e9e, le gouvernement lance progressivement la Couverture Maladie Universelle (CMU), et plusieurs assureurs priv\u00e9s proposent des offres. L\u2019int\u00e9gration de modules d\u00e9assurance dans HealthFlow permet aux \u00e9tablissements de v\u00e9rifier automatiquement la couverture d\u2019un patient, de soumettre des demandes de prise en charge \u00e9lectroniques, et de suivre les remboursements en temps r\u00e9el, \u00e9liminant les processus papier lents et sujets aux erreurs."
    )
  );
  children.push(bulletItem("Module de v\u00e9rification d\u2019\u00e9ligibilit\u00e9 assurance en temps r\u00e9el avant consultation"));
  children.push(bulletItem("Soumission \u00e9lectronique des demandes de prise en charge avec documentation attach\u00e9e"));
  children.push(bulletItem("Suivi des remboursements et tableau de bord des deniers en attente par assureur"));
  children.push(bulletItem("Int\u00e9gration avec les principaux assureurs guin\u00e9ens et ouest-africains"));

  children.push(accentLine());

  // ─── SECTION 5: PHASE 3 ───
  children.push(heading1("5. Phase 3 : Intelligence Artificielle (Mois 7\u201310)"));
  children.push(
    bodyText(
      "La troisi\u00e8me phase marque l\u2019entr\u00e9e de HealthFlow dans l\u2019\u00e8re de l\u2019intelligence artificielle appliqu\u00e9e \u00e0 la sant\u00e9. En exploitant le z-ai-web-dev-sdk d\u00e9j\u00e0 int\u00e9gr\u00e9 dans le projet, nous pouvons d\u00e9ployer des fonctionnalit\u00e9s d\u2019IA qui ont un impact direct sur la qualit\u00e9 des soins et l\u2019efficacit\u00e9 du syst\u00e8me de sant\u00e9. L\u2019IA dans le contexte africain ne remplace pas le m\u00e9decin, elle l\u2019assiste : elle aide les agents de sant\u00e9 communautaires \u00e0 poser des diagnostics pr\u00e9liminaires, alerte les m\u00e9decins sur les interactions m\u00e9dicamenteuses dangereuses, et d\u00e9tecte les tendances \u00e9pid\u00e9miologiques avant qu\u2019elles ne deviennent des crises."
    )
  );

  children.push(heading2("5.1 Assistant IA de Diagnostic"));
  children.push(
    bodyText(
      "L\u2019assistant IA de diagnostic est la fonctionnalit\u00e9 phare de HealthFlow Africa. Il permet \u00e0 tout agent de sant\u00e9, m\u00eame sans formation m\u00e9dicale approfondie, de d\u00e9crire les sympt\u00f4mes d\u2019un patient et d\u2019obtenir une liste de diagnostics probables avec leur niveau de confiance, les examens compl\u00e9mentaires recommand\u00e9s et l\u2019orientation vers le niveau de soins adapt\u00e9. Cet outil est particuli\u00e8rement pr\u00e9cieux dans les centres de sant\u00e9 ruraux o\u00f9 aucun m\u00e9decin n\u2019est pr\u00e9sent, et o\u00f9 les agents de sant\u00e9 communautaires sont souvent les seuls recours des populations."
    )
  );
  children.push(bulletItem("Interface conversationnelle bas\u00e9e sur le z-ai-web-dev-sdk pour la collecte des sympt\u00f4mes"));
  children.push(bulletItem("Arbre de d\u00e9cision m\u00e9dicale adapt\u00e9 aux pathologies tropicales (paludisme, fi\u00e8vre typho\u00efde, dengue, Ebola)"));
  children.push(bulletItem("Score de confiance et niveau d\u2019urgence pour chaque diagnostic sugg\u00e9r\u00e9"));
  children.push(bulletItem("Recommandations d\u2019examens compl\u00e9mentaires et de orientation (centre de sant\u00e9, h\u00f4pital de district, h\u00f4pital national)"));
  children.push(bulletItem("Apprentissage continu : l\u2019IA s\u2019am\u00e9liore avec les donn\u00e9es anonymis\u00e9es du r\u00e9seau HealthFlow"));
  children.push(bulletItem("Mode hors ligne : arbre de d\u00e9cision statique int\u00e9gr\u00e9 dans l\u2019application pour les zones sans connexion"));

  children.push(heading2("5.2 V\u00e9rificateur d\u2019Interactions M\u00e9dicamenteuses"));
  children.push(
    bodyText(
      "Les erreurs de prescription m\u00e9dicamenteuse sont une cause majeure d\u2019incidents iatrog\u00e8nes en Afrique, o\u00f9 l\u2019autom\u00e9dication est tr\u00e8s r\u00e9pandue et o\u00f9 les pharmaciens ne sont pas toujours disponibles pour contr\u00f4ler les ordonnances. Le v\u00e9rificateur d\u2019interactions m\u00e9dicamenteuses analyse en temps r\u00e9el chaque prescription et alerte le prescripteur sur les interactions potentiellement dangereuses, les contre-indications li\u00e9es aux ant\u00e9c\u00e9dents du patient, et les ajustements posologiques n\u00e9cessaires selon le poids, l\u2019\u00e2ge et la fonction r\u00e9nale."
    )
  );
  children.push(bulletItem("Base de donn\u00e9es d\u2019interactions m\u00e9dicamenteuses couvrant les m\u00e9dicaments essentiels OMS"));
  children.push(bulletItem("V\u00e9rification en temps r\u00e9el lors de la saisie d\u2019une ordonnance avec alertes visuelles"));
  children.push(bulletItem("Classification des alertes : information, attention, contre-indication majeure"));
  children.push(bulletItem("Int\u00e9gration avec le dossier patient pour prise en compte des ant\u00e9c\u00e9dents et allergies"));
  children.push(bulletItem("Ajustements posologiques automatiques selon les param\u00e8tres du patient (poids, \u00e2ge, clairance)"));

  children.push(heading2("5.3 Surveillance \u00c9pid\u00e9miologique Intelligente"));
  children.push(
    bodyText(
      "L\u2019Afrique est r\u00e9guli\u00e8rement touch\u00e9e par des \u00e9pid\u00e9mies : Ebola, chol\u00e9ra, m\u00e9ningite, fi\u00e8vre de Lassa, et bien s\u00fbr le paludisme qui tue plus de 600 000 personnes par an sur le continent. Un syst\u00e8me de surveillance \u00e9pid\u00e9miologique intelligent, int\u00e9gr\u00e9 directement dans le syst\u00e8me d\u2019information hospitalier, permet de d\u00e9tecter les foyers \u00e9pid\u00e9miques pr\u00e9cocement, de suivre la propagation en temps r\u00e9el, et d\u2019alimenter les syst\u00e8mes nationaux de surveillance comme le DHIS2 utilis\u00e9 dans la plupart des pays africains."
    )
  );
  children.push(bulletItem("D\u00e9tection automatique de clusters de sympt\u00f4mes suspects par analyse des consultations"));
  children.push(bulletItem("Alertes pr\u00e9coces envoy\u00e9es au Minist\u00e8re de la Sant\u00e9 et \u00e0 l\u2019OMS quand les seuils sont d\u00e9pass\u00e9s"));
  children.push(bulletItem("Cartographie en temps r\u00e9el des foyers \u00e9pid\u00e9miques avec g\u00e9olocalisation des cas"));
  children.push(bulletItem("Int\u00e9gration DHIS2 pour remont\u00e9e automatique des donn\u00e9es agr\u00e9g\u00e9es au syst\u00e8me national"));
  children.push(bulletItem("Mod\u00e8les pr\u00e9dictifs bas\u00e9s sur les donn\u00e9es historiques et m\u00e9t\u00e9orologiques (saisons des pluies = paludisme)"));

  children.push(accentLine());

  // ─── SECTION 6: PHASE 4 ───
  children.push(heading1("6. Phase 4 : T\u00e9l\u00e9m\u00e9decine Avanc\u00e9e (Mois 11\u201314)"));
  children.push(
    bodyText(
      "La quatri\u00e8me phase fait de la t\u00e9l\u00e9m\u00e9decine une r\u00e9alit\u00e9 concr\u00e8te pour les populations africaines. Au-del\u00e0 du simple chat de consultation, HealthFlow proposera des vid\u00e9oconsultations, des outils sp\u00e9cifiques pour les agents de sant\u00e9 communautaires sur le terrain, et une IA de pr\u00e9-consultation qui structure l\u2019\u00e9change entre le patient et le m\u00e9decin \u00e0 distance. Cette phase vise \u00e0 r\u00e9duire la fracture g\u00e9ographique en sant\u00e9, o\u00f9 70% des m\u00e9decins sont concentr\u00e9s dans les capitales tandis que 65% de la population vit en zones rurales."
    )
  );

  children.push(heading2("6.1 Vid\u00e9oconsultation Int\u00e9gr\u00e9e"));
  children.push(bulletItem("Vid\u00e9o et audio haute qualit\u00e9 adaptative selon la bande passante disponible (de 2G \u00e0 4G)"));
  children.push(bulletItem("Partage d\u2019\u00e9cran pour visualiser des r\u00e9sultats d\u2019examens ensemble"));
  children.push(bulletItem("Envoi de photos et documents pendant la consultation (l\u00e9sions cutan\u00e9es, radiographies)"));
  children.push(bulletItem("Enregistrement (avec consentement) pour le dossier m\u00e9dical et la formation continue"));
  children.push(bulletItem("Salle d\u2019attente virtuelle avec estimation du temps d\u2019attente en temps r\u00e9el"));

  children.push(heading2("6.2 Outils Agents de Sant\u00e9 Communautaires"));
  children.push(
    bodyText(
      "Les agents de sant\u00e9 communautaires (ASC) sont le maillon essentiel du syst\u00e8me de sant\u00e9 africain. En Guin\u00e9e, ils sont pr\u00e8s de 8 000 \u00e0 assurer les soins de sant\u00e9 primaires dans les villages. HealthFlow leur fournit un outil mobile l\u00e9ger, fonctionnant hors ligne, qui les guide dans le diagnostic, la prise en charge et la r\u00e9f\u00e9rence des patients vers les structures de sant\u00e9. L\u2019objectif est de transformer chaque ASC en un point de contact num\u00e9rique avec le syst\u00e8me de sant\u00e9 national."
    )
  );
  children.push(bulletItem("Interface mobile ultra-l\u00e9g\u00e8re optimis\u00e9e pour les t\u00e9l\u00e9phones basiques Android"));
  children.push(bulletItem("Guidage pas-\u00e0-pas pour le diagnostic et la prise en charge des pathologies courantes"));
  children.push(bulletItem("Synchronisation automatique des donn\u00e9es collect\u00e9es d\u00e8s que la connexion est disponible"));
  children.push(bulletItem("G\u00e9olocalisation des visites et couverture sanitaire par zone"));
  children.push(bulletItem("Formation continue int\u00e9gr\u00e9e : modules e-learning sur les protocoles de soins"));

  children.push(accentLine());

  // ─── SECTION 7: PHASE 5 ───
  children.push(heading1("7. Phase 5 : Sant\u00e9 Publique Nationale (Mois 15\u201318)"));
  children.push(
    bodyText(
      "La cinqui\u00e8me phase \u00e9l\u00e8ve HealthFlow du niveau de l\u2019\u00e9tablissement de sant\u00e9 au niveau national. En int\u00e9grant les standards internationaux d\u2019interop\u00e9rabilit\u00e9, en proposant un syst\u00e8me d\u2019identifiant sant\u00e9 national, et en d\u00e9ployant des dashboards de sant\u00e9 publique, HealthFlow devient l\u2019infrastructure num\u00e9rique de sant\u00e9 du pays. Cette phase n\u00e9cessite un partenariat \u00e9troit avec le Minist\u00e8re de la Sant\u00e9 et les organisations internationales, mais elle positionne DataSphere Innovation comme un acteur incontournable de la sant\u00e9 num\u00e9rique en Afrique."
    )
  );

  children.push(heading2("7.1 Identifiant Sant\u00e9 National"));
  children.push(
    bodyText(
      "Un identifiant sant\u00e9 national unique est la cl\u00e9 de vo\u00fbte d\u2019un syst\u00e8me de sant\u00e9 num\u00e9rique int\u00e9gr\u00e9. Il permet de retrouver le dossier m\u00e9dical complet d\u2019un patient quelle que soit la structure o\u00f9 il se pr\u00e9sente, d\u2019\u00e9viter les doublons et les erreurs d\u2019identification, et de produire des statistiques sanitaires fiables au niveau national. En Guin\u00e9e, o\u00f9 de nombreux patients n\u2019ont pas de pi\u00e8ce d\u2019identit\u00e9, le syst\u00e8me doit utiliser des m\u00e9thodes d\u2019identification alternatives comme la biom\u00e9trie locale ou les identifiants communautaires."
    )
  );
  children.push(bulletItem("G\u00e9n\u00e9ration d\u2019un identifiant unique par patient avec checksum de validation"));
  children.push(bulletItem("QR Code imprimable portant l\u2019identifiant sant\u00e9 pour les cartes de sant\u00e9 physiques"));
  children.push(bulletItem("Recherche cross-établissement par identifiant sant\u00e9 pour r\u00e9cup\u00e9rer le dossier complet"));
  children.push(bulletItem("Interface de d\u00e9doublonnage assist\u00e9e par IA pour fusionner les dossiers en double"));
  children.push(bulletItem("Conformit\u00e9 avec les standards d\u2019identification de l\u2019OMS et de l\u2019Union Africaine"));

  children.push(heading2("7.2 Interop\u00e9rabilit\u00e9 HL7 FHIR et openHIE"));
  children.push(
    bodyText(
      "L\u2019interop\u00e9rabilit\u00e9 est le Graal des syst\u00e8mes de sant\u00e9 num\u00e9riques. Le standard HL7 FHIR (Fast Healthcare Interoperability Resources) est le protocole international de r\u00e9f\u00e9rence pour l\u2019\u00e9change de donn\u00e9es de sant\u00e9 entre syst\u00e8mes. Le framework openHIE (Open Health Information Exchange) est la r\u00e9f\u00e9rence pour l\u2019architecture des syst\u00e8mes d\u2019information sanitaires nationaux dans les pays en d\u00e9veloppement. En adoptant ces standards, HealthFlow garantit sa capacit\u00e9 \u00e0 s\u2019int\u00e9grer dans l\u2019\u00e9cosyst\u00e8me national et international de sant\u00e9 num\u00e9rique."
    )
  );
  children.push(bulletItem("API FHIR RESTful pour les ressources Patient, Encounter, Observation, MedicationRequest, DiagnosticReport"));
  children.push(bulletItem("Conformit\u00e9 avec les profils FHIR adapt\u00e9s au contexte africain (IPA - International Patient Access)"));
  children.push(bulletItem("Connecteur openHIE pour l\u2019\u00e9change de donn\u00e9es entre registres de sant\u00e9 nationaux"));
  children.push(bulletItem("Int\u00e9gration DHIS2 pour la remont\u00e9e automatique des indicateurs sanitaires agr\u00e9g\u00e9s"));
  children.push(bulletItem("Gateway d\u2019interop\u00e9rabilit\u00e9 permettant \u00e0 d\u2019autres SIG d\u2019\u00e9changer des donn\u00e9es avec HealthFlow"));

  children.push(heading2("7.3 Dashboard National de Sant\u00e9 Publique"));
  children.push(
    bodyText(
      "Le dashboard national de sant\u00e9 publique offre aux d\u00e9cideurs une vue en temps r\u00e9el de l\u2019\u00e9tat de sant\u00e9 de la population et du fonctionnement du syst\u00e8me de sant\u00e9. Il agr\u00e8ge les donn\u00e9es de tous les \u00e9tablissements connect\u00e9s au r\u00e9seau HealthFlow et pr\u00e9sente des indicateurs cl\u00e9s sous forme de cartes, graphiques et tableaux de bord interactifs. Cet outil est essentiel pour la planification sanitaire, l\u2019allocation des ressources et la r\u00e9ponse aux urgences sanitaires."
    )
  );
  children.push(bulletItem("Carte sanitaire interactive avec g\u00e9olocalisation de tous les \u00e9tablissements de sant\u00e9"));
  children.push(bulletItem("Indicateurs cl\u00e9s : mortalit\u00e9 maternelle, mortalit\u00e9 infantile, couverture vaccinale, incidence paludisme"));
  children.push(bulletItem("Alertes automatiques quand les indicateurs d\u00e9passent les seuils de surveillance"));
  children.push(bulletItem("Rapports automatiques pour le Minist\u00e8re de la Sant\u00e9 et les partenaires internationaux (OMS, Banque Mondiale)"));
  children.push(bulletItem("Simulation de sc\u00e9narios \u00e9pid\u00e9miologiques pour la planification de r\u00e9ponse aux crises"));

  children.push(accentLine());

  // ─── SECTION 8: PHASE 6 ───
  children.push(heading1("8. Phase 6 : Expansion Panafricaine (Mois 19\u201324)"));
  children.push(
    bodyText(
      "La sixi\u00e8me et derni\u00e8re phase du roadmap initiale vise l\u2019expansion de HealthFlow au-del\u00e0 des fronti\u00e8res guin\u00e9ennes. L\u2019objectif est de d\u00e9ployer la plateforme dans les pays de la sous-r\u00e9gion ouest-africaine (CEDEAO), puis en Afrique de l\u2019Est et en Afrique centrale. Chaque d\u00e9ploiement national n\u00e9cessite une adaptation au contexte local : r\u00e9glementation, langues, monnaies, syst\u00e8mes de sant\u00e9 existants. L\u2019architecture modulaire de HealthFlow facilite ces adaptations tout en maintenant un noyau commun qui garantit l\u2019interop\u00e9rabilit\u00e9 entre pays."
    )
  );

  children.push(heading2("8.1 D\u00e9ploiement Multi-Pays CEDEAO"));
  children.push(bulletItem("Adaptation aux r\u00e9glementations sanitaires de chaque pays (Guin\u00e9e, S\u00e9n\u00e9gal, Mali, C\u00f4te d\u2019Ivoire, Burkina Faso)"));
  children.push(bulletItem("Int\u00e9gration des syst\u00e8mes mobile money locaux (Wave, Free Money, Moov Money)"));
  children.push(bulletItem("Traduction dans les langues nationales de chaque pays (Wolof, Bambara, Dioula, Moore)"));
  children.push(bulletItem("Architecture multi-tenant avec isolation des donn\u00e9es par pays et par \u00e9tablissement"));
  children.push(bulletItem("Conformit\u00e9 avec les directives de la CEDEAO sur la protection des donn\u00e9es de sant\u00e9 transfrontali\u00e8res"));

  children.push(heading2("8.2 Certification et Partenariats Internationaux"));
  children.push(bulletItem("Certification ISO 13485 pour les logiciels de sant\u00e9"));
  children.push(bulletItem("Partenariat avec l\u2019OMS Afrique pour le d\u00e9ploiement dans les pays prioritaires"));
  children.push(bulletItem("Collaboration avec la Banque Mondiale et l\u2019USAID pour le financement des d\u00e9ploiements"));
  children.push(bulletItem("Label Digital Public Good (DPG) des Nations Unies pour la reconnaissance internationale"));
  children.push(bulletItem("Programme de formation certifiante pour les professionnels de sant\u00e9 num\u00e9rique en Afrique"));

  children.push(accentLine());

  // ─── SECTION 9: IMPACT ───
  children.push(heading1("9. Impact Attendu et Indicateurs"));
  children.push(
    bodyText(
      "L\u2019impact de HealthFlow Africa sera mesur\u00e9 \u00e0 travers des indicateurs quantitatifs et qualitatifs align\u00e9s sur les Objectifs de D\u00e9veloppement Durable (ODD) de l\u2019ONU, particuli\u00e8rement l\u2019ODD 3 (Sant\u00e9 et bien-\u00eatre) et l\u2019ODD 9 (Industrie, innovation et infrastructure). Les projections ci-dessous sont bas\u00e9es sur les donn\u00e9es disponibles du syst\u00e8me de sant\u00e9 guin\u00e9en et les r\u00e9sultats observ\u00e9s par des projets similaires en Afrique de l\u2019Est (Kenya, Rwanda) et en Asie du Sud (Inde, Bangladesh)."
    )
  );

  children.push(
    createDataTable(
      ["Indicateur", "Situation Actuelle", "Cible Ann\u00e9e 1", "Cible Ann\u00e9e 3"],
      [
        [
          "\u00c9tablissements connect\u00e9s",
          "0 (prototype)",
          "20 h\u00f4pitaux et centres de sant\u00e9",
          "200+ \u00e9tablissements en Guin\u00e9e",
        ],
        [
          "Patients enregistr\u00e9s",
          "10 (d\u00e9mo)",
          "50 000 patients",
          "500 000+ patients",
        ],
        [
          "Consultations num\u00e9ris\u00e9es/mois",
          "0",
          "15 000",
          "150 000+",
        ],
        [
          "Rendez-vous honor\u00e9s",
          "~60%",
          "80% (rappels SMS)",
          "90% (IA optimisation)",
        ],
        [
          "D\u00e9lai r\u00e9sultats laboratoire",
          "2\u20135 jours",
          "24\u201348h (notification auto)",
          "< 24h (IA pr\u00e9-analyse)",
        ],
        [
          "Erreurs m\u00e9dicamenteuses",
          "Non mesur\u00e9",
          "-30% (alertes interactions)",
          "-60% (IA v\u00e9rification)",
        ],
        [
          "Paiements mobile money",
          "0%",
          "40% des paiements",
          "80% des paiements",
        ],
        [
          "D\u00e9tection \u00e9pid\u00e9mies",
          "Manuelle (semaines)",
          "Automatique (jours)",
          "Pr\u00e9dictive (heures)",
        ],
        [
          "Couverture vaccination",
          "~55% (estim\u00e9)",
          "70% (rappels SMS)",
          "85% (IA + ASC mobiles)",
        ],
        [
          "Pays d\u00e9ploy\u00e9s",
          "0",
          "1 (Guin\u00e9e)",
          "5+ (CEDEAO)",
        ],
      ]
    )
  );
  children.push(emptyPara());

  children.push(accentLine());

  // ─── SECTION 10: BUDGET ───
  children.push(heading1("10. Budget et Ressources"));
  children.push(
    bodyText(
      "Le d\u00e9veloppement de HealthFlow Africa n\u00e9cessite un investissement significatif mais r\u00e9aliste, r\u00e9parti sur 24 mois. Le budget couvre les co\u00fbts de d\u00e9veloppement, d\u2019infrastructure, de certification et de d\u00e9ploiement. Plusieurs sources de financement sont identifi\u00e9es : revenus des abonnements SaaS, subventions des organisations internationales, et partenariats public-priv\u00e9 avec les gouvernements africains. Le mod\u00e8le \u00e9conomique est con\u00e7u pour \u00eatre autosuffisant d\u00e8s la fin de la deuxi\u00e8me ann\u00e9e."
    )
  );

  children.push(
    createDataTable(
      ["Phase", "Dur\u00e9e", "Budget Estim\u00e9 (USD)", "Ressources Cl\u00e9s"],
      [
        [
          "Phase 1 : Fondations",
          "3 mois",
          "75 000 $",
          "2 devs fullstack, 1 devops, 1 UX",
        ],
        [
          "Phase 2 : Paiements",
          "3 mois",
          "90 000 $",
          "2 devs, 1 int\u00e9grateur mobile money, 1 compliance",
        ],
        [
          "Phase 3 : IA Sant\u00e9",
          "4 mois",
          "120 000 $",
          "2 devs, 1 data scientist, 1 m\u00e9decin conseiller",
        ],
        [
          "Phase 4 : T\u00e9l\u00e9m\u00e9decine",
          "4 mois",
          "100 000 $",
          "2 devs, 1 sp\u00e9cialiste WebRTC, 1 t\u00e9l\u00e9m\u00e9decine",
        ],
        [
          "Phase 5 : Sant\u00e9 Publique",
          "4 mois",
          "110 000 $",
          "2 devs, 1 sp\u00e9cialiste HL7 FHIR, 1 \u00e9pid\u00e9miologiste",
        ],
        [
          "Phase 6 : Expansion",
          "6 mois",
          "150 000 $",
          "3 devs, 1 chef de projet, 1 business dev",
        ],
        [
          "Total",
          "24 mois",
          "645 000 $",
          "\u00c9quipe de 8\u201312 personnes",
        ],
      ]
    )
  );
  children.push(emptyPara());

  children.push(accentLine());

  // ─── SECTION 11: RISQUES ───
  children.push(heading1("11. Risques et Mitigation"));
  children.push(
    bodyText(
      "Tout projet de cette envergure comporte des risques significatifs. L\u2019identification proactive de ces risques et la mise en place de strat\u00e9gies de mitigation adapt\u00e9es sont essentielles pour assurer le succ\u00e8s du projet. Les risques ci-dessous sont class\u00e9s par ordre de criticit\u00e9, du plus impactant au plus g\u00e9rable, avec pour chacun une strat\u00e9gie de mitigation concr\u00e8te et des indicateurs d\u2019alerte pr\u00e9coce."
    )
  );

  children.push(
    createDataTable(
      ["Risque", "Probabilit\u00e9", "Impact", "Mitigation"],
      [
        [
          "R\u00e9sistance au changement du personnel de sant\u00e9",
          "\u00c9lev\u00e9e",
          "Critique",
          "Formation intensive, accompagnement sur site, champions du changement",
        ],
        [
          "Connectivit\u00e9 insuffisante en zones rurales",
          "\u00c9lev\u00e9e",
          "\u00c9lev\u00e9",
          "Architecture offline-first, synchronisation progressive, 3G minimale",
        ],
        [
          "R\u00e9glementation sant\u00e9 num\u00e9rique non align\u00e9e",
          "Moyenne",
          "\u00c9lev\u00e9",
          "Partenariat Minist\u00e8re Sant\u00e9, conformit\u00e9 RGPD/BCEAO, audit r\u00e9gulier",
        ],
        [
          "S\u00e9curit\u00e9 des donn\u00e9es de sant\u00e9",
          "Moyenne",
          "Critique",
          "Chiffrement AES-256, audit de s\u00e9curit\u00e9, bug bounty, SOC 2",
        ],
        [
          "Financement insuffisant pour les phases avanc\u00e9es",
          "Moyenne",
          "\u00c9lev\u00e9",
          "Mod\u00e8le SaaS progressif, subventions OMS/Banque Mondiale, partenariats PPP",
        ],
        [
          "Comp\u00e9tences IA limit\u00e9es en Afrique de l\u2019Ouest",
          "Moyenne",
          "Moyen",
          "Formation interne, partenariat universit\u00e9s, recrutement diaspora",
        ],
        [
          "Adoption patient du portail num\u00e9rique",
          "\u00c9lev\u00e9e",
          "Moyen",
          "UX intuitive, support SMS/WhatsApp, formation en langue locale",
        ],
      ]
    )
  );
  children.push(emptyPara());

  children.push(accentLine());

  // ─── SECTION 12: PROCHAINES ETAPES ───
  children.push(heading1("12. Prochaines \u00c9tapes Imm\u00e9diates"));
  children.push(
    bodyText(
      "La feuille de route est ambitieuse mais r\u00e9aliste si les premi\u00e8res \u00e9tapes sont ex\u00e9cut\u00e9es avec rigueur. Les actions ci-dessous constituent le plan d\u2019action imm\u00e9diat pour les 30 prochains jours, p\u00e9riode pendant laquelle nous devons poser les fondations techniques de la Phase 1 tout en initiant les partenariats strat\u00e9giques n\u00e9cessaires pour les phases ult\u00e9rieures. Chaque action est assign\u00e9e \u00e0 un responsable et dispose d\u2019un indicateur de succ\u00e8s mesurable."
    )
  );
  children.push(bulletItem("Semaine 1\u20132 : Configuration PWA (Service Worker, manifest.json, IndexedDB) et migration du store Zustand vers React Query + API"));
  children.push(bulletItem("Semaine 2\u20133 : Configuration next-intl avec fichiers de traduction fran\u00e7ais, anglais, malink\u00e9, soussou, poular"));
  children.push(bulletItem("Semaine 3\u20134 : Activation next-auth avec authentification par t\u00e9l\u00e9phone + OTP"));
  children.push(bulletItem("Semaine 4 : Connexion de tous les modules frontend aux API backend existantes avec tests end-to-end"));
  children.push(bulletItem("En parall\u00e8le : Prise de contact avec le Minist\u00e8re de la Sant\u00e9 de Guin\u00e9e pour partenariat officiel"));
  children.push(bulletItem("En parall\u00e8le : Demande d\u2019acc\u00e8s sandbox aux API Orange Money et MTN MoMo"));
  children.push(bulletItem("En parall\u00e8le : Recrutement d\u2019un m\u00e9decin conseiller pour la validation des algorithmes IA de la Phase 3"));

  return children;
}

// ── Assembly ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
          size: 22,
          color: c(P.body),
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 32,
          bold: true,
          color: c(P.primary),
        },
        paragraph: { spacing: { before: 400, after: 200, line: 312 } },
      },
      heading2: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 28,
          bold: true,
          color: c(P.primary),
        },
        paragraph: { spacing: { before: 300, after: 150, line: 312 } },
      },
      heading3: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 26,
          bold: true,
          color: c(P.primary),
        },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "\u25E6",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    // Section 1: Cover
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(),
    },
    // Section 2: Body
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: c(P.secondary),
                  font: { ascii: "Calibri" },
                }),
              ],
            }),
          ],
        }),
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "HealthFlow Africa \u2014 Feuille de Route Strat\u00e9gique",
                  size: 16,
                  color: c(P.secondary),
                  font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      children: buildBody(),
    },
  ],
});

// ── Export ──
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/home/z/my-project/download/HealthFlow_Africa_Roadmap_2025-2030.docx", buffer);
  console.log("Document generated successfully!");
});
