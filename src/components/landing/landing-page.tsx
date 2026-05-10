'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Activity,
  Baby,
  BarChart3,
  Bed,
  Calendar,
  ChevronRight,
  Globe,
  Heart,
  Hospital,
  Microscope,
  Moon,
  Pill,
  Receipt,
  ShieldAlert,
  Sun,
  Users,
  Video,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  Stethoscope,
  ClipboardCheck,
  Zap,
  TrendingUp,
  Building2,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/lib/store'

/* ─────────── Animation Variants ─────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─────────── Scroll-Reveal Wrapper ─────────── */

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────── Navigation Bar ─────────── */

function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { setCurrentView } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Services', href: '#services' },
    { label: 'Démo', href: '#demo' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#accueil" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white">
                HealthFlow
              </span>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 leading-tight tracking-wider uppercase">
                Guinea
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
              aria-label="Changer le thème"
            >
              <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* CTA buttons */}
            <Button
              onClick={() => setCurrentView('dashboard')}
              className="hidden lg:inline-flex bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
            >
              Connexion
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <Button
                  onClick={() => { setMobileOpen(false); setCurrentView('dashboard') }}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  Connexion
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ─────────── Hero Section ─────────── */

function HeroSection() {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-200/40 dark:from-teal-900/20 dark:to-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 dark:from-emerald-900/15 dark:to-teal-900/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Badge className="mb-6 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Système d&apos;Information Hospitalier #1 en Guinée
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Le futur de la{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                santé en Guinée
              </span>{' '}
              commence ici
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Transformez votre établissement de santé avec notre plateforme numérique complète.
              Gestion des patients, laboratoire, pharmacie, téléconsultation et bien plus encore.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setCurrentView('dashboard')}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-base px-8 h-12"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-300 dark:hover:border-teal-700 text-base px-8 h-12"
              >
                <PlayCircle className="w-5 h-5 mr-1.5" />
                Voir la démo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Gratuit pour les petits centres</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Conforme aux normes OMS</span>
              </div>
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main illustration card */}
              <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-3xl p-8 border border-teal-100 dark:border-teal-900/50 shadow-2xl">
                {/* Abstract medical shapes */}
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  {/* Central pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-8 rounded-full border-2 border-teal-300/50 dark:border-teal-600/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute inset-16 rounded-full border-2 border-emerald-300/50 dark:border-emerald-600/30"
                  />

                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-teal-500/30"
                    >
                      <Stethoscope className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>

                  {/* Floating icons around the center */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-4 right-8 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Heart className="w-7 h-7 text-red-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Activity className="w-7 h-7 text-teal-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute bottom-8 left-8 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <Pill className="w-7 h-7 text-emerald-500" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
                  >
                    <BarChart3 className="w-7 h-7 text-amber-500" />
                  </motion.div>
                </div>
              </div>

              {/* Floating stat cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Hospital className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">45+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hôpitaux connectés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">120K+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Patients gérés</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-1/2 -right-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">500K+</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Consultations</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Mobile stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:hidden mt-12 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Hospital, value: '45+', label: 'Hôpitaux connectés', color: 'teal' },
            { icon: Users, value: '120K+', label: 'Patients gérés', color: 'emerald' },
            { icon: Calendar, value: '500K+', label: 'Consultations', color: 'amber' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 text-center border border-slate-100 dark:border-slate-700"
            >
              <div
                className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  stat.color === 'teal'
                    ? 'bg-teal-100 dark:bg-teal-900/50'
                    : stat.color === 'emerald'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50'
                    : 'bg-amber-100 dark:bg-amber-900/50'
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === 'teal'
                      ? 'text-teal-600 dark:text-teal-400'
                      : stat.color === 'emerald'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────── PlayCircle icon (inline to avoid import issues) ─────────── */
function PlayCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}

/* ─────────── Trusted By Section ─────────── */

function TrustedBySection() {
  const partners = [
    { name: 'Ministère de la Santé', sub: 'Guinée', icon: Building2 },
    { name: 'OMS', sub: 'Organisation Mondiale de la Santé', icon: Globe },
    { name: 'UNICEF', sub: 'Pour chaque enfant', icon: Heart },
    { name: 'Banque Mondiale', sub: 'Groupe de la Banque Mondiale', icon: TrendingUp },
  ]

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
      <Reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Ils nous font confiance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner) => (
              <motion.div
                key={partner.name}
                whileHover={{ scale: 1.03 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <partner.icon className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{partner.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{partner.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─────────── Features Section ─────────── */

function FeaturesSection() {
  const features = [
    { icon: Users, title: 'Gestion Patients', desc: 'Dossiers médicaux complets, historique, allergies et antécédents centralisés pour chaque patient.' },
    { icon: Calendar, title: 'Rendez-vous & Consultations', desc: 'Planification intelligente, agenda médecin, rappels SMS et suivi complet des consultations.' },
    { icon: Microscope, title: 'Laboratoire', desc: 'Gestion des demandes, résultats avec validation biologique et catalogage des analyses.' },
    { icon: Pill, title: 'Pharmacie & Stock', desc: 'Suivi des stocks en temps réel, alertes de rupture, traçabilité des lots et péremptions.' },
    { icon: Bed, title: 'Hospitalisation & Urgences', desc: 'Gestion des lits, admissions, triage urgence 5 couleurs et suivi hospitalier complet.' },
    { icon: Baby, title: 'Maternité & Vaccination', desc: 'Suivi de grossesse, accouchements, carnet de vaccination conforme au PEV guinéen.' },
    { icon: Receipt, title: 'Facturation & Paiements', desc: 'Facturation automatique, prise en charge assurance et paiements Mobile Money.' },
    { icon: Video, title: 'Téléconsultation', desc: 'Consultations à distance sécurisées, messagerie chiffrée et partage de documents.' },
    { icon: BarChart3, title: 'Dashboard Santé', desc: 'Tableaux de bord en temps réel, KPIs personnalisables et rapports décisionnels.' },
    { icon: ShieldAlert, title: 'Alertes Santé Publique', desc: 'Surveillance épidémiologique, détection d\'anomalies et alertes sanitaires automatiques.' },
  ]

  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              10 Modules Intégrés
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Une plateforme{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                complète
              </span>{' '}
              pour vos besoins
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Du dossier patient à la surveillance épidémiologique, HealthFlow couvre tous les aspects
              de la gestion hospitalière moderne.
            </p>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group h-full"
              >
                <Card className="h-full border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-sm hover:shadow-xl hover:shadow-teal-500/5 bg-white dark:bg-slate-900/50">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow mb-2">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────── How It Works ─────────── */

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Déployez',
      desc: 'Installez HealthFlow dans votre établissement en quelques heures. Notre équipe vous accompagne sur site ou à distance.',
      icon: Hospital,
      color: 'from-teal-500 to-teal-600',
    },
    {
      num: '02',
      title: 'Configurez',
      desc: 'Paramétrez les rôles, workflows et modules selon vos besoins. L\'interface intuitive ne nécessite aucune compétence technique.',
      icon: ClipboardCheck,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      num: '03',
      title: 'Transformez',
      desc: 'Vivez la transformation numérique de vos services de santé. Améliorez l\'efficacité et la qualité des soins.',
      icon: Sparkles,
      color: 'from-teal-600 to-emerald-500',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              Simple & Rapide
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Comment ça{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                marche
              </span>{' '}
              ?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Déployez, configurez et transformez votre établissement en trois étapes simples.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.15}>
              <div className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+80px)] w-[calc(100%-160px)] h-0.5 bg-gradient-to-r from-teal-300 to-emerald-300 dark:from-teal-700 dark:to-emerald-700" />
                )}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    className="w-32 h-32 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center mx-auto shadow-lg"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <div className="mt-6">
                    <span className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                      Étape {step.num}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Stat Card Component (separate for hooks) ─────────── */

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
  decimals,
  delay,
}: {
  value: number
  suffix: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  decimals?: number
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [count, setCount] = useState(0)
  const endValue = Math.floor(value * (decimals ? 10 : 1))

  useEffect(() => {
    if (!isInView) return
    const startTime = performance.now()
    const duration = 2000

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * endValue))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, endValue])

  return (
    <Reveal delay={delay}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 text-center border border-white/20 hover:bg-white/15 transition-colors"
        ref={ref}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-4xl lg:text-5xl font-bold text-white">
          {decimals ? (count / 10).toFixed(1) : count}
          {suffix}
        </div>
        <p className="mt-2 text-sm text-teal-100 font-medium">{label}</p>
      </motion.div>
    </Reveal>
  )
}

/* ─────────── Statistics / Impact Section ─────────── */

function StatsSection() {
  const stats = [
    { value: 99.9, suffix: '%', label: 'Uptime garanti', icon: Activity, decimals: 1 },
    { value: 45, suffix: '+', label: 'Hôpitaux connectés', icon: Hospital },
    { value: 120, suffix: 'K+', label: 'Patients gérés', icon: Users },
    { value: 30, suffix: '%', label: 'Réduction temps d\'attente', icon: TrendingUp },
  ]

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-emerald-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Notre impact en chiffres
            </h2>
            <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">
              Des résultats concrets qui témoignent de la transformation numérique du système de santé guinéen.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              decimals={stat.decimals}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Testimonials Section ─────────── */

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dr. Mamadou Diallo',
      role: 'Directeur, Hôpital Donka',
      content:
        'HealthFlow a révolutionné la gestion de notre hôpital. Nous avons réduit les temps d\'attente de 40% et amélioré significativement le suivi des patients. C\'est un véritable changement de paradigme.',
      rating: 5,
    },
    {
      name: 'Dr. Aissatou Bah',
      role: 'Chef de Service Maternité',
      content:
        'Le module de maternité est exceptionnel. Le suivi des grossesses et la vaccination sont désormais parfaitement organisés. Nos patientes reçoivent des rappels SMS et le taux de suivi a doublé.',
      rating: 5,
    },
    {
      name: 'Abdoulaye Touré',
      role: 'Directeur, Clinique Pasteur',
      content:
        'La facturation intégrée avec Mobile Money a transformé nos recettes. Les stocks de pharmacie sont gérés en temps réel et nous n\'avons plus de ruptures imprévues. Un investissement rentabilisé en 3 mois.',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Témoignages
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Ce que disent nos{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                utilisateurs
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Des professionnels de santé guinéens partagent leur expérience avec HealthFlow.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.15}>
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <Card className="h-full border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-sm hover:shadow-xl hover:shadow-teal-500/5 bg-white dark:bg-slate-900/50">
                  <CardHeader>
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                      &ldquo;{t.content}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── Pricing Section ─────────── */

function PricingSection() {
  const { setCurrentView } = useStore()
  const plans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      period: '',
      desc: 'Pour les petits centres de santé et dispensaires qui débutent leur transformation numérique.',
      features: [
        'Gestion patients (jusqu\'à 500)',
        'Rendez-vous & Consultations',
        'Facturation basique',
        'Dashboard standard',
        'Support email',
        '1 établissement',
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      gradient: false,
    },
    {
      name: 'Professionnel',
      price: '2,500,000',
      currency: 'GNF',
      period: '/mois',
      desc: 'Pour les hôpitaux et cliniques qui veulent exploiter tout le potentiel de HealthFlow.',
      features: [
        'Patients illimités',
        'Tous les 10 modules',
        'Téléconsultation',
        'Dashboard avancé & KPIs',
        'Alertes santé publique',
        'Support prioritaire 24/7',
        'Multi-départements',
        'Intégrations Mobile Money',
      ],
      cta: 'Essayer gratuitement',
      popular: true,
      gradient: true,
    },
    {
      name: 'Entreprise',
      price: 'Sur devis',
      period: '',
      desc: 'Pour les ministères de la santé et réseaux multi-établissements nécessitant une solution sur mesure.',
      features: [
        'Tout le plan Professionnel',
        'Multi-établissements',
        'Déploiement sur site / cloud',
        'Intégration systèmes nationaux',
        'API & connecteurs personnalisés',
        'Formation sur site',
        'SLA garanti 99.99%',
        'Chef de projet dédié',
      ],
      cta: 'Contacter les ventes',
      popular: false,
      gradient: false,
    },
  ]

  return (
    <section id="demo" className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
              Tarification
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Un plan{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                adapté
              </span>{' '}
              à chaque besoin
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Commencez gratuitement et évoluez selon vos besoins. Aucune carte de crédit requise.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.15}>
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <Card
                  className={`h-full relative ${
                    plan.gradient
                      ? 'border-2 border-teal-500 dark:border-teal-400 shadow-xl shadow-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700/50 shadow-sm'
                  } bg-white dark:bg-slate-900/50`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 px-4 py-1 shadow-lg">
                        Le plus populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px]">
                      {plan.desc}
                    </CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.currency && (
                        <span className="text-lg text-slate-500 dark:text-slate-400 ml-1">
                          {plan.currency}
                        </span>
                      )}
                      {plan.period && (
                        <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => setCurrentView('dashboard')}
                      className={`w-full ${
                        plan.gradient
                          ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                      {plan.gradient && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── CTA Section ─────────── */

function CTASection() {
  const { setCurrentView } = useStore()
  return (
    <section id="contact" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <motion.div whileHover={{ scale: 1.02 }} className="inline-block mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center mx-auto border border-white/30 shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Prêt à transformer votre établissement de santé ?
          </h2>
          <p className="mt-6 text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Rejoignez les 45+ établissements qui font déjà confiance à HealthFlow Guinea.
            Commencez gratuitement et découvrez le futur de la santé numérique.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setCurrentView('dashboard')}
              className="bg-white text-teal-700 hover:bg-teal-50 shadow-xl h-12 text-base px-8"
            >
              Essayer gratuitement
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 h-12 text-base px-8"
            >
              <Phone className="w-5 h-5 mr-2" />
              Nous contacter
            </Button>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-teal-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Configuration en 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Formation incluse</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Support 24/7</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────── Footer ─────────── */

function Footer() {
  const footerLinks = {
    Produit: ['Fonctionnalités', 'Tarification', 'Modules', 'Intégrations', 'Mises à jour'],
    Entreprise: ['À propos', 'Équipe', 'Carrières', 'Partenaires', 'Presse'],
    Ressources: ['Documentation', 'Blog', 'Webinaires', 'Guides', 'API'],
    Légal: ['Confidentialité', 'Conditions', 'Sécurité', 'RGPD', 'Mentions légales'],
  }

  const socialLinks = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Linkedin, label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">HealthFlow</span>
                <span className="text-[10px] font-medium text-teal-400 leading-tight tracking-wider uppercase">
                  Guinea
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Système d&apos;Information Hospitalier nouvelle génération pour la Guinée et l&apos;Afrique.
              Développé par DataSphere Innovation.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-slate-400 hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4 text-sm">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; 2026 DataSphere Innovation. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Conakry, Guinée</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>contact@healthflow-gn.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────── Main Landing Page ─────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
