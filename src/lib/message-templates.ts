/**
 * Message Templates — HealthFlow Africa
 * French-language templates for SMS and WhatsApp
 */

export interface MessageTemplate {
  id: string
  name: string
  category: 'Rendez-vous' | 'Résultat' | 'Vaccination' | 'Paiement' | 'Urgence' | 'Ordonnance' | 'Campagne'
  channel: 'SMS' | 'WhatsApp' | 'Les deux'
  template: string
  params: string[]
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'appointment_reminder',
    name: 'Rappel rendez-vous',
    category: 'Rendez-vous',
    channel: 'Les deux',
    template: 'Rappel : Vous avez un rendez-vous le {date} à {time} avec Dr. {doctor} à {facility}. HealthFlow Africa',
    params: ['date', 'time', 'doctor', 'facility'],
  },
  {
    id: 'appointment_confirmation',
    name: 'Confirmation rendez-vous',
    category: 'Rendez-vous',
    channel: 'Les deux',
    template: 'Votre rendez-vous du {date} à {time} est confirmé avec Dr. {doctor}. En cas d\'empêchement, appelez le {phone}. HealthFlow Africa',
    params: ['date', 'time', 'doctor', 'phone'],
  },
  {
    id: 'appointment_cancellation',
    name: 'Annulation rendez-vous',
    category: 'Rendez-vous',
    channel: 'Les deux',
    template: 'Votre rendez-vous du {date} a été annulé. Veuillez contacter le {phone} pour reprogrammer. HealthFlow Africa',
    params: ['date', 'phone'],
  },
  {
    id: 'lab_result',
    name: 'Résultat d\'analyse',
    category: 'Résultat',
    channel: 'Les deux',
    template: 'Vos résultats d\'analyse sont disponibles. Connectez-vous à votre espace patient pour les consulter. HealthFlow Africa',
    params: [],
  },
  {
    id: 'lab_result_urgent',
    name: 'Résultat urgent',
    category: 'Résultat',
    channel: 'SMS',
    template: 'URGENT : Vos résultats d\'analyse nécessitent une consultation rapide. Contactez Dr. {doctor} au {phone}. HealthFlow Africa',
    params: ['doctor', 'phone'],
  },
  {
    id: 'vaccination_reminder',
    name: 'Rappel vaccination',
    category: 'Vaccination',
    channel: 'Les deux',
    template: 'Rappel vaccination : {child_name} doit recevoir le vaccin {vaccine} le {date}. HealthFlow Africa',
    params: ['child_name', 'vaccine', 'date'],
  },
  {
    id: 'vaccination_overdue',
    name: 'Vaccination en retard',
    category: 'Vaccination',
    channel: 'SMS',
    template: 'ALERT : Le vaccin {vaccine} pour {child_name} est en retard. Rendez-vous au centre de santé le plus vite possible. HealthFlow Africa',
    params: ['vaccine', 'child_name'],
  },
  {
    id: 'payment_confirmation',
    name: 'Confirmation paiement',
    category: 'Paiement',
    channel: 'Les deux',
    template: 'Paiement de {amount} GNF reçu pour la facture #{invoice}. Merci ! HealthFlow Africa',
    params: ['amount', 'invoice'],
  },
  {
    id: 'payment_reminder',
    name: 'Rappel paiement',
    category: 'Paiement',
    channel: 'SMS',
    template: 'Rappel : Vous avez une facture impayée de {amount} GNF (#{invoice}). Merci de régler dans les plus brefs délais. HealthFlow Africa',
    params: ['amount', 'invoice'],
  },
  {
    id: 'payment_plan_reminder',
    name: 'Rappel échéance crédit santé',
    category: 'Paiement',
    channel: 'SMS',
    template: 'Rappel : Votre échéance de {amount} GNF est due le {date}. Payez via Mobile Money ou au guichet. HealthFlow Africa',
    params: ['amount', 'date'],
  },
  {
    id: 'emergency_alert',
    name: 'Alerte urgente',
    category: 'Urgence',
    channel: 'SMS',
    template: 'ALERTE : {message}. Contactez immédiatement votre centre de santé. HealthFlow Africa',
    params: ['message'],
  },
  {
    id: 'prescription_reminder',
    name: 'Rappel médicament',
    category: 'Ordonnance',
    channel: 'Les deux',
    template: 'Rappel : N\'oubliez pas de prendre votre médicament {medication} à {time}. HealthFlow Africa',
    params: ['medication', 'time'],
  },
  {
    id: 'prescription_ready',
    name: 'Ordonnance prête',
    category: 'Ordonnance',
    channel: 'Les deux',
    template: 'Votre ordonnance est prête à la pharmacie de {facility}. Venez la récupérer avec votre carte. HealthFlow Africa',
    params: ['facility'],
  },
  {
    id: 'campaign_malaria',
    name: 'Campagne paludisme',
    category: 'Campagne',
    channel: 'Les deux',
    template: 'Santé Publique : La saison du paludisme approche. Dormez sous moustiquaire imprégnée et consultez au premier symptôme. HealthFlow Africa',
    params: [],
  },
  {
    id: 'campaign_covid',
    name: 'Campagne COVID-19',
    category: 'Campagne',
    channel: 'Les deux',
    template: 'Santé Publique : Port du masque recommandé dans les lieux publics. Vaccination disponible au centre de santé. HealthFlow Africa',
    params: [],
  },
  {
    id: 'campaign_hygiene',
    name: 'Campagne hygiène',
    category: 'Campagne',
    channel: 'Les deux',
    template: 'Santé Publique : Lavez-vous les mains régulièrement avec du savon. Prévention = Protection ! HealthFlow Africa',
    params: [],
  },
]

export function getTemplatesByCategory(category: MessageTemplate['category']): MessageTemplate[] {
  return messageTemplates.filter(t => t.category === category)
}

export function getTemplateById(id: string): MessageTemplate | undefined {
  return messageTemplates.find(t => t.id === id)
}

export function fillTemplate(templateId: string, params: Record<string, string>): string {
  const template = getTemplateById(templateId)
  if (!template) return ''
  let message = template.template
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return message
}
