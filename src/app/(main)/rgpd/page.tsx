import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RGPD — Conformité Protection des Données — HealthFlow Guinée',
  description: 'Conformité RGPD et loi guinéenne L/2022/014/AN du système HealthFlow Guinée',
}

export default function RGPDPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Conformité RGPD
            </h1>
            <p className="text-gray-500">
              HealthFlow Guinée — Registre de conformité
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                RGPD (UE) 2016/679
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Loi guinéenne L/2022/014/AN
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                Code Santé Publique Guinée
              </span>
            </div>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Cadre juridique</h2>
              <p>
                HealthFlow Guinée est conçu pour être conforme au cadre juridique double applicable en République
                de Guinée pour le traitement des données de santé :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Règlement Général sur la Protection des Données (RGPD)</strong> — Règlement UE 2016/679,
                  applicable aux projets financés par l&apos;Union européenne et aux transferts de données vers l&apos;UE</li>
                <li><strong>Loi guinéenne L/2022/014/AN</strong> — Loi relative à la protection des données à caractère
                  personnel en République de Guinée, promulguée en 2022</li>
                <li><strong>Code de la Santé Publique de Guinée</strong> — Dispositions relatives au secret médical,
                  à la conservation des dossiers médicaux et au consentement du patient</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Registre des traitements</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Traitement</th>
                      <th className="text-left p-3 border">Données</th>
                      <th className="text-left p-3 border">Base légale</th>
                      <th className="text-left p-3 border">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border font-medium">Gestion des patients</td>
                      <td className="p-3 border">Identité, contact, antécédents</td>
                      <td className="p-3 border">Art. 6(1)(e) — Mission d&apos;intérêt public</td>
                      <td className="p-3 border">20 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Dossier médical</td>
                      <td className="p-3 border">Consultations, analyses, prescriptions, images DICOM</td>
                      <td className="p-3 border">Art. 9(2)(h) — Soins de santé</td>
                      <td className="p-3 border">20 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Authentification OTP</td>
                      <td className="p-3 border">Numéro de téléphone, code OTP</td>
                      <td className="p-3 border">Art. 6(1)(f) — Sécurité</td>
                      <td className="p-3 border">5 min — 12h</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Notifications (SMS/WA/TG)</td>
                      <td className="p-3 border">Téléphone, Chat ID, contenu message</td>
                      <td className="p-3 border">Art. 6(1)(b) — Exécution contractuelle</td>
                      <td className="p-3 border">6 mois</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Paiements Mobile Money</td>
                      <td className="p-3 border">Montant, référence, opérateur</td>
                      <td className="p-3 border">Art. 6(1)(b) — Exécution contractuelle</td>
                      <td className="p-3 border">10 ans</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Signalement DHIS2</td>
                      <td className="p-3 border">Données agrégées anonymisées</td>
                      <td className="p-3 border">Art. 6(1)(c) — Obligation légale</td>
                      <td className="p-3 border">Illimitée</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Audit logging</td>
                      <td className="p-3 border">Actions utilisateur, IP, timestamps</td>
                      <td className="p-3 border">Art. 6(1)(f) — Sécurité</td>
                      <td className="p-3 border">10 ans</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. AIPD — Analyse d&apos;Impact sur la Protection des Données</h2>
              <p>
                Conformément à l&apos;article 35 du RGPD, une Analyse d&apos;Impact relative à la Protection des Données
                (AIPD) a été réalisée pour les traitements suivants à haut risque :
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Traitement de données de santé à grande échelle</strong> — HealthFlow gère les dossiers médicaux
                  complets de milliers de patients. Les mesures de mitigation incluent : chiffrement AES-256-GCM,
                  RBAC granulaire, audit trail complet, accès minimal par établissement.
                </li>
                <li>
                  <strong>Authentification par OTP</strong> — L&apos;envoi de codes via SMS/WhatsApp/Telegram expose le numéro
                  de téléphone à des opérateurs tiers. Les mesures incluent : OTP à usage unique (5 min TTL),
                  rate limiting (5 requêtes/15 min), protection contre le transfert (Telegram), pas de code dans
                  les réponses API.
                </li>
                <li>
                  <strong>Interopérabilité FHIR/DHIS2</strong> — L&apos;échange de données avec les systèmes du Ministère de la
                  Santé implique des transferts potentiels de données de santé. Les mesures incluent : données
                  agrégées anonymisées pour DHIS2, chiffrement TLS 1.3, mappage conforme FHIR R4.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Mesures techniques de protection</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">Chiffrement</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>AES-256-GCM (données au repos)</li>
                    <li>TLS 1.3 (données en transit)</li>
                    <li>bcrypt coût 12 (mots de passe)</li>
                    <li>HMAC-SHA256 (webhooks)</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">Contrôle d&apos;accès</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>RBAC — 8 rôles, 17 ressources</li>
                    <li>Filtrage par établissement</li>
                    <li>Accès minimal (moindre privilège)</li>
                    <li>OTP à usage unique</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-2">Traçabilité</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>Audit trail — 15 types d&apos;événements</li>
                    <li>Conservation 10 ans</li>
                    <li>Journalisation en temps réel</li>
                    <li>Alertes sur actions sensibles</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-bold text-orange-900 mb-2">Résilience</h3>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>Mode hors-ligne (PWA)</li>
                    <li>Backup quotidien chiffré</li>
                    <li>Rate limiting anti-brute force</li>
                    <li>CSRF + CORS + CSP</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Droits des personnes et exercice</h2>
              <p>
                HealthFlow intègre nativement les outils pour l&apos;exercice des droits RGPD :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d&apos;accès (Art. 15)</strong> — Export patient au format FHIR ou PDF via le portail patient</li>
                <li><strong>Droit de rectification (Art. 16)</strong> — Modification des données par le patient ou le professionnel</li>
                <li><strong>Droit à l&apos;effacement (Art. 17)</strong> — Anonymisation des données (sauf obligation légale de conservation)</li>
                <li><strong>Droit à la portabilité (Art. 20)</strong> — Export FHIR R4 Bulk ($export) ou CSV</li>
                <li><strong>Droit d&apos;opposition (Art. 21)</strong> — Désinscription des notifications via /register sur Telegram ou SMS STOP</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Délégué à la Protection des Données</h2>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="font-medium">DPO HealthFlow Guinée</p>
                <p>Email : dpo@healthflow-gn.com</p>
                <p>Téléphone : +224 XXX XXX XXX</p>
                <p>Adresse : Conakry, République de Guinée</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Violation de données</h2>
              <p>
                En cas de violation de données personnelles, DataSphere Innovation s&apos;engage à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notifier l&apos;autorité de contrôle (AGPDP) dans les <strong>72 heures</strong> suivant la découverte (Art. 33 RGPD)</li>
                <li>Informer les personnes concernées sans délai injustifié si le risque est élevé (Art. 34 RGPD)</li>
                <li>Documenter toutes les violations dans un registre dédié</li>
                <li>Mettre en œuvre les mesures correctives nécessaires</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
