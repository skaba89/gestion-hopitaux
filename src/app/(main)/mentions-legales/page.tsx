import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales — HealthFlow Guinée',
  description: 'Mentions légales du système HealthFlow Guinée — DataSphere Innovation',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mentions Légales
            </h1>
            <p className="text-gray-500">HealthFlow Guinée — Mai 2026</p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Éditeur du service</h2>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="font-bold text-lg">DataSphere Innovation</p>
                <p>Représentant légal : Sekouna KABA</p>
                <p>Forme juridique : Société à responsabilité limitée (SARL)</p>
                <p>Siège social : Conakry, République de Guinée</p>
                <p>Email : contact@datasphere-gn.com</p>
                <p>Secteur d&apos;activité : Technologies de l&apos;Information pour la Santé</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Hébergement</h2>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="font-bold">Hébergement des données de santé</p>
                <p>Les données de santé sont hébergées conformément à la législation guinéenne sur un
                infrastructure certifiée, située en République de Guinée ou dans la sous-région ouest-africaine.</p>
                <p className="mt-2 font-bold">Infrastructure technique</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Serveur : PostgreSQL 17 + Redis 8 + Next.js 16</li>
                  <li>Proxy inverse : Caddy (TLS automatique)</li>
                  <li>Conteneurisation : Docker</li>
                  <li>Sauvegarde : Quotidienne, chiffrée, rétention 30 jours</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble du système HealthFlow (logiciel, interfaces, bases de données, documentation,
                design) est la propriété exclusive de DataSphere Innovation, protégé par les lois guinéennes
                et internationales sur la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, modification, distribution ou exploitation du logiciel sans autorisation
                écrite préalable est strictement interdite et constitue une contrefaçon sanctionnée par le
                Code de la propriété intellectuelle guinéen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Normes et standards</h2>
              <p>HealthFlow est conforme aux standards internationaux suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>HL7 FHIR R4</strong> — Standard d&apos;interopérabilité en santé (Health Level Seven International)</li>
                <li><strong>DICOM</strong> — Standard d&apos;imagerie médicale (via Orthanc)</li>
                <li><strong>DHIS2</strong> — Système d&apos;information sanitaire du Ministère de la Santé</li>
                <li><strong>RGPD</strong> — Règlement UE 2016/679 sur la protection des données</li>
                <li><strong>Loi L/2022/014/AN</strong> — Protection des données personnelles en Guinée</li>
                <li><strong>OWASP Top 10</strong> — Bonnes pratiques de sécurité web</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Crédits technologiques</h2>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">Next.js 16 (Vercel)</p>
                  <p className="text-gray-500">Framework web React</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">PostgreSQL 17</p>
                  <p className="text-gray-500">Base de données relationnelle</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">Prisma ORM</p>
                  <p className="text-gray-500">Mapping objet-relationnel</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">Redis 8</p>
                  <p className="text-gray-500">Cache et sessions</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">Tailwind CSS + shadcn/ui</p>
                  <p className="text-gray-500">Interface utilisateur</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">Docker + Caddy</p>
                  <p className="text-gray-500">Déploiement et proxy</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact</h2>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900">DataSphere Innovation</p>
                <p className="text-blue-800">Email : contact@datasphere-gn.com</p>
                <p className="text-blue-800">DPO : dpo@healthflow-gn.com</p>
                <p className="text-blue-800">Conakry, République de Guinée</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
