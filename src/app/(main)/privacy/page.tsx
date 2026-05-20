import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — HealthFlow Guinée',
  description: 'Politique de protection des données personnelles de HealthFlow Guinée, conforme au RGPD et à la loi guinéenne L/2022/014/AN',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-500">
              HealthFlow Guinée — Dernière mise à jour : Mai 2026
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Conforme RGPD · Loi guinéenne L/2022/014/AN
            </div>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement des données personnelles est <strong>DataSphere Innovation</strong>,
                représentée par Sekouna KABA, située en République de Guinée. Le système HealthFlow Guinée est
                déployé pour le compte des établissements de santé publics et privés du pays, sous l'autorité
                du Ministère de la Santé et de l'Hygiène Publique de Guinée.
              </p>
              <p>
                Pour toute question relative à la protection de vos données, vous pouvez contacter le Délégué
                à la Protection des Données (DPO) à l'adresse : <strong>dpo@healthflow-gn.com</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p>HealthFlow collecte les catégories de données suivantes dans le cadre de la prise en charge médicale :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Catégorie</th>
                      <th className="text-left p-3 border">Données</th>
                      <th className="text-left p-3 border">Base légale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border font-medium">Identité</td>
                      <td className="p-3 border">Nom, prénom, date de naissance, sexe, numéro d'identification nationale, photo</td>
                      <td className="p-3 border">Obligation légale (Code de la santé publique guinéen)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Contact</td>
                      <td className="p-3 border">Téléphone, email, adresse, Chat ID Telegram</td>
                      <td className="p-3 border">Intérêt légitime (notifications médicales)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Santé</td>
                      <td className="p-3 border">Antécédents, allergies, groupe sanguin, résultats d'analyses, ordonnances, images médicales (DICOM)</td>
                      <td className="p-3 border">Consentement explicite + obligation de soins</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Financier</td>
                      <td className="p-3 border">Factures, paiements (Orange Money, MTN MoMo), assurances</td>
                      <td className="p-3 border">Obligation contractuelle</td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-medium">Technique</td>
                      <td className="p-3 border">Adresse IP, logs de connexion, identifiants de session, cookies</td>
                      <td className="p-3 border">Intérêt légitime (sécurité)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
              <p>Vos données personnelles sont traitées pour les finalités suivantes :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Prise en charge médicale</strong> — consultations, hospitalisations, analyses, prescriptions, vaccinations</li>
                <li><strong>Gestion des rendez-vous</strong> — planification, rappels via SMS/WhatsApp/Telegram</li>
                <li><strong>Facturation et paiements</strong> — émission de factures, encaissement Mobile Money, suivi des assurances</li>
                <li><strong>Signalement sanitaire</strong> — transmission des données agrégées au DHIS2 du Ministère de la Santé (obligation légale)</li>
                <li><strong>Interopérabilité</strong> — échange de données au standard HL7 FHIR R4 entre établissements de santé</li>
                <li><strong>Sécurité</strong> — authentification (OTP), traçabilité (audit log), protection contre les accès non autorisés</li>
                <li><strong>Amélioration continue</strong> — statistiques anonymisées pour l'amélioration des services de santé</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sécurité des données</h2>
              <p>HealthFlow met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chiffrement</strong> — AES-256-GCM pour les données sensibles au repos, TLS 1.3 en transit</li>
                <li><strong>Hachage</strong> — bcrypt (coût 12) pour les mots de passe</li>
                <li><strong>Contrôle d'accès</strong> — RBAC à 8 rôles avec filtrage par établissement et niveau de sensibilité</li>
                <li><strong>Audit trail</strong> — Journalisation de toutes les actions (15 types d'événements, conservation 10 ans)</li>
                <li><strong>Protection réseau</strong> — CSRF, CORS, CSP, rate limiting, headers de sécurité</li>
                <li><strong>Accès minimal</strong> — Principe du moindre privilège, chaque professionnel n'accède qu'aux données de ses patients</li>
                <li><strong>Sauvegarde</strong> — Backups chiffrés quotidiens avec rétention 30 jours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Durée de conservation</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Type de données</th>
                      <th className="text-left p-3 border">Durée</th>
                      <th className="text-left p-3 border">Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border">Dossiers médicaux</td>
                      <td className="p-3 border">20 ans après le dernier contact</td>
                      <td className="p-3 border">Code de la santé publique</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Données financières</td>
                      <td className="p-3 border">10 ans</td>
                      <td className="p-3 border">Code fiscal guinéen</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Logs d'audit</td>
                      <td className="p-3 border">10 ans</td>
                      <td className="p-3 border">Traçabilité médicale</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Sessions/OTP</td>
                      <td className="p-3 border">5 minutes — 12 heures</td>
                      <td className="p-3 border">Sécurité d'authentification</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Cookies</td>
                      <td className="p-3 border">13 mois max</td>
                      <td className="p-3 border">Recommandation CNIL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Vos droits</h2>
              <p>
                Conformément au RGPD (règlement UE 2016/679) et à la loi guinéenne L/2022/014/AN relative à la
                protection des données à caractère personnel, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d'accès</strong> — Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification</strong> — Corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement</strong> — Demander la suppression de vos données (sous réserve des obligations légales)</li>
                <li><strong>Droit à la limitation</strong> — Restreindre le traitement dans certains cas</li>
                <li><strong>Droit à la portabilité</strong> — Recevoir vos données au format HL7 FHIR ou CSV</li>
                <li><strong>Droit d'opposition</strong> — Vous opposer au traitement pour des motifs légitimes</li>
                <li><strong>Droit post-mortem</strong> — Définir des directives relatives à la conservation de vos données de santé après votre décès</li>
              </ul>
              <p className="mt-3">
                Pour exercer vos droits, contactez le DPO : <strong>dpo@healthflow-gn.com</strong> ou adressez-vous
                à l'accueil de votre établissement de santé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Sous-traitants</h2>
              <p>Les sous-traitants suivants peuvent traiter vos données dans le cadre de leurs prestations :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border">Sous-traitant</th>
                      <th className="text-left p-3 border">Pays</th>
                      <th className="text-left p-3 border">Finalité</th>
                      <th className="text-left p-3 border">Garantie</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border">Orange Guinée</td>
                      <td className="p-3 border">Guinée</td>
                      <td className="p-3 border">SMS, Orange Money</td>
                      <td className="p-3 border">DPA signé</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">MTN Guinée</td>
                      <td className="p-3 border">Guinée</td>
                      <td className="p-3 border">MTN Mobile Money</td>
                      <td className="p-3 border">DPA signé</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Telegram (Meta/Telegram FZ-LLC)</td>
                      <td className="p-3 border">Émirats Arabes Unis</td>
                      <td className="p-3 border">Notifications patients</td>
                      <td className="p-3 border">Données chiffrées en transit</td>
                    </tr>
                    <tr>
                      <td className="p-3 border">Hébergeur cloud</td>
                      <td className="p-3 border">Guinée / Régional</td>
                      <td className="p-3 border">Infrastructure serveur</td>
                      <td className="p-3 border">DPA + certification ISO 27001</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Transferts internationaux</h2>
              <p>
                Les données de santé sont hébergées en priorité sur le territoire national guinéen. En cas de
                transfert hors de Guinée (notamment pour les notifications Telegram), les garanties suivantes
                sont appliquées :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement de bout en bout (TLS 1.3)</li>
                <li>Minimisation des données transférées (seul le contenu du message est envoyé, pas le dossier médical)</li>
                <li>Clauses contractuelles types ( CCT de la Commission européenne)</li>
                <li>Évaluation d'impact préalable pour les transferts vers des pays non adéquats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Réclamations</h2>
              <p>
                Vous pouvez introduire une réclamation auprès de l'autorité de protection des données de Guinée :
              </p>
              <p className="font-medium">
                Autorité Guinéenne de Protection des Données Personnelles (AGPDP)<br />
                Conakry, République de Guinée
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
