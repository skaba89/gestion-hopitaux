import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — HealthFlow Guinée",
  description: "CGU du système HealthFlow Guinée — Conditions d'utilisation du système de gestion hospitalière",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-gray-500">
              HealthFlow Guinée — Dernière mise à jour : Mai 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation du système
                d&apos;information hospitalier HealthFlow Guinée, développé par DataSphere Innovation. Ce système
                est destiné aux établissements de santé publics et privés de la République de Guinée pour la
                gestion intégrée des patients, consultations, hospitalisations, laboratoires, pharmacie,
                facturation et téléconsultation.
              </p>
              <p>
                L&apos;utilisation de HealthFlow implique l&apos;acceptation pleine et entière des présentes CGU.
                Tout utilisateur qui refuse ces conditions doit cesser d&apos;utiliser le système.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Définitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>HealthFlow</strong> : Système d&apos;Information Hospitalier (SIH) déployé en République de Guinée</li>
                <li><strong>Utilisateur</strong> : Tout professionnel de santé ou personnel administratif disposant d&apos;un compte actif</li>
                <li><strong>Patient</strong> : Toute personne physique dont les données sont enregistrées dans le système</li>
                <li><strong>Établissement</strong> : Hôpital, clinique, centre de santé ou dispensaire utilisant HealthFlow</li>
                <li><strong>Administrateur</strong> : Personne désignée par l&apos;établissement pour gérer les comptes et les accès</li>
                <li><strong>DataSphere Innovation</strong> : Éditeur du logiciel HealthFlow</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Accès au service</h2>
              <p>
                L&apos;accès à HealthFlow est réservé aux professionnels de santé et au personnel administratif
                des établissements sous contrat. L&apos;authentification se fait par numéro de téléphone avec
                vérification OTP (code à usage unique envoyé par SMS/WhatsApp/Telegram), conformément aux
                standards de sécurité médicale.
              </p>
              <p>
                L&apos;utilisateur s&apos;engage à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ne pas partager ses identifiants de connexion avec un tiers</li>
                <li>Ne pas utiliser le compte d&apos;un autre utilisateur</li>
                <li>Signaler immédiatement tout accès non autorisé à l&apos;administrateur de l&apos;établissement</li>
                <li>Se déconnecter après chaque session, notamment sur les postes partagés</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Engagements du professionnel de santé</h2>
              <p>
                L&apos;utilisateur s&apos;engage à utiliser HealthFlow dans le strict cadre de ses fonctions professionnelles
                et conformément au Code de déontologie médicale guinéen, au Secret médical (Article 3 du Code
                de la santé publique) et aux règles de bonne pratique clinique.
              </p>
              <p>
                Sont strictement interdits :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La consultation de dossiers patients sans motif professionnel légitime</li>
                <li>La divulgation d&apos;informations médicales à des tiers non autorisés</li>
                <li>La modification ou suppression de données sans justification médicale</li>
                <li>L&apos;exportation de données patients vers des systèmes non autorisés</li>
                <li>Toute utilisation du système à des fins commerciales non autorisées</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Données de santé et confidentialité</h2>
              <p>
                HealthFlow traite des données de santé au sens du RGPD (article 9) et de la loi guinéenne
                L/2022/014/AN. Ces données bénéficient d&apos;une protection renforcée :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement AES-256-GCM des données sensibles au repos</li>
                <li>Chiffrement TLS 1.3 des données en transit</li>
                <li>Contrôle d&apos;accès basé sur les rôles (RBAC) avec 8 niveaux de permissions</li>
                <li>Filtrage par établissement — un professionnel ne peut accéder qu&apos;aux patients de son établissement</li>
                <li>Journalisation complète de toutes les actions (audit trail) conservée 10 ans</li>
                <li>Respect du principe du moindre privilège</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Disponibilité du service</h2>
              <p>
                DataSphere Innovation s&apos;efforce de maintenir HealthFlow accessible 24h/24, 7j/7, avec un objectif
                de disponibilité de 99,5% (hors maintenance planifiée). Les interruptions de service pour
                maintenance sont programmées en dehors des heures de pointe médicale et font l&apos;objet d&apos;une
                notification préalable de 48 heures.
              </p>
              <p>
                En cas d&apos;indisponibilité du réseau, HealthFlow dispose d&apos;un mode hors-ligne (PWA) permettant
                la consultation des dossiers patients déjà chargés et la saisie de nouvelles données qui seront
                synchronisées automatiquement lors du retour de la connexion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Paiements et Mobile Money</h2>
              <p>
                HealthFlow intègre les services de paiement mobile Orange Money et MTN MoMo pour la collecte
                des frais médicaux. Les transactions sont sécurisées par chiffrement HMAC-SHA256 et font
                l&apos;objet d&apos;un enregistrement en base de données avec référence unique de transaction.
              </p>
              <p>
                Les conditions tarifaires des paiements mobiles sont celles des opérateurs télécoms guinéens
                et sont indépendantes de HealthFlow. DataSphere Innovation ne perçoit aucune commission sur
                les transactions financières.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Propriété intellectuelle</h2>
              <p>
                HealthFlow est un logiciel propriété de DataSphere Innovation. Le code source, les bases de données,
                les interfaces, la documentation et les modèles de données sont protégés par le droit d&apos;auteur
                guinéen et les conventions internationales.
              </p>
              <p>
                Les données patients appartiennent à l&apos;établissement de santé et au patient conformément à la loi.
                DataSphere Innovation n&apos;exerce aucun droit de propriété sur les données de santé enregistrées
                dans le système.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Responsabilité</h2>
              <p>
                DataSphere Innovation met en œuvre toutes les mesures raisonnablement possibles pour assurer la
                sécurité et la disponibilité du service. Toutefois, la responsabilité de DataSphere Innovation
                ne peut être engagée en cas de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Force majeure (coupure réseau, catastrophe naturelle, conflit armé)</li>
                <li>Mauvaise utilisation du système par un utilisateur</li>
                <li>Défaillance des services tiers (opérateurs télécoms, fournisseurs cloud)</li>
                <li>Données inexactes saisies par les utilisateurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Résiliation</h2>
              <p>
                Chaque partie peut résilier le contrat avec un préavis de 3 mois. En cas de résiliation,
                DataSphere Innovation s&apos;engage à exporter l&apos;intégralité des données de l&apos;établissement au
                format HL7 FHIR R4 dans un délai de 30 jours, et à supprimer les données de ses serveurs
                dans les 90 jours suivant la fin du contrat, sous réserve des obligations légales de conservation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Droit applicable</h2>
              <p>
                Les présentes CGU sont régies par le droit guinéen. Tout litige relatif à l&apos;interprétation
                ou l&apos;exécution des présentes sera soumis à la compétence exclusive des tribunaux de Conakry,
                République de Guinée.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Modifications</h2>
              <p>
                Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront notifiés
                par email et via le système au moins 30 jours avant l&apos;entrée en vigueur des modifications.
                L&apos;utilisation continue du système après cette date vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                DataSphere Innovation — Conakry, République de Guinée<br />
                Contact : legal@healthflow-gn.com · +224 XXX XXX XXX
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
