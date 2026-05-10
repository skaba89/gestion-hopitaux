'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Pill, Plus, Search, AlertTriangle, Package, TrendingDown, Clock, ArrowRight, ArrowLeft, CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useDataStore, type Medication } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

function getStockLevel(stock: number, maxStock: number) {
  const pct = maxStock > 0 ? (stock / maxStock) * 100 : 100
  if (stock === 0) return { label: 'Rupture', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' }
  if (pct < 10) return { label: 'Critique', color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' }
  if (pct < 25) return { label: 'Faible', color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' }
  return { label: 'Normal', color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' }
}

export function PharmacyPage() {
  const { toast } = useToast()
  const { medications, addMedication, stockEntry, stockExit } = useDataStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)

  // Entry form state
  const [entryMedId, setEntryMedId] = useState('')
  const [entryQty, setEntryQty] = useState('')

  // Exit form state
  const [exitMedId, setExitMedId] = useState('')
  const [exitQty, setExitQty] = useState('')

  // New medication form state
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newDosage, setNewDosage] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newMaxStock, setNewMaxStock] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [newSupplier, setNewSupplier] = useState('')

  const filtered = medications.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.dosage.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || m.category === categoryFilter
    return matchSearch && matchCategory
  })

  const totalItems = medications.length
  const lowStock = medications.filter(m => m.stock > 0 && m.stock < m.maxStock * 0.25).length
  const outOfStock = medications.filter(m => m.stock === 0).length
  const expiringSoon = medications.filter(m => { const d = new Date(m.expiryDate); return d.getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 && m.stock > 0 }).length

  const categories = [...new Set(medications.map(m => m.category))]

  const handleStockEntry = () => {
    if (!entryMedId || !entryQty || Number(entryQty) <= 0) return
    stockEntry(entryMedId, Number(entryQty))
    setShowEntryDialog(false)
    setEntryMedId('')
    setEntryQty('')
    const med = medications.find(m => m.id === entryMedId)
    toast({ title: 'Entrée enregistrée', description: `${entryQty} unités ajoutées pour ${med?.name ?? 'médicament'}.` })
  }

  const handleStockExit = () => {
    if (!exitMedId || !exitQty || Number(exitQty) <= 0) return
    stockExit(exitMedId, Number(exitQty))
    setShowExitDialog(false)
    setExitMedId('')
    setExitQty('')
    const med = medications.find(m => m.id === exitMedId)
    toast({ title: 'Sortie enregistrée', description: `${exitQty} unités retirées pour ${med?.name ?? 'médicament'}.` })
  }

  const handleAddMedication = () => {
    if (!newName || !newCategory || !newPrice) return
    addMedication({
      id: `MED-${Date.now()}`,
      name: newName,
      category: newCategory,
      dosage: newDosage,
      stock: Number(newStock) || 0,
      maxStock: Number(newMaxStock) || 0,
      unit: newUnit || 'comprimés',
      price: Number(newPrice),
      expiryDate: newExpiryDate || '—',
      supplier: newSupplier || '—',
    })
    setShowNewDialog(false)
    setNewName('')
    setNewCategory('')
    setNewDosage('')
    setNewStock('')
    setNewMaxStock('')
    setNewUnit('')
    setNewPrice('')
    setNewExpiryDate('')
    setNewSupplier('')
    toast({ title: 'Médicament ajouté', description: `${newName} a été ajouté à l'inventaire.` })
  }

  return (
    <motion.div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20"><Pill className="size-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pharmacie & Stock</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des médicaments et inventaire</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20">
            <Plus className="size-4 mr-1" /> Nouveau
          </Button>
          <Button variant="outline" onClick={() => { setEntryMedId(''); setEntryQty(''); setShowEntryDialog(true) }}><ArrowLeft className="size-4 mr-1" /> Entrée</Button>
          <Button variant="outline" onClick={() => { setExitMedId(''); setExitQty(''); setShowExitDialog(true) }}><ArrowRight className="size-4 mr-1" /> Sortie</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total articles', value: totalItems, icon: Package, color: 'from-teal-500 to-emerald-600', iconBg: 'bg-teal-50 dark:bg-teal-950/40', iconColor: 'text-teal-600 dark:text-teal-400' },
          { label: 'Stock faible', value: lowStock, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Rupture', value: outOfStock, icon: TrendingDown, color: 'from-rose-500 to-red-600', iconBg: 'bg-rose-50 dark:bg-rose-950/40', iconColor: 'text-rose-600 dark:text-rose-400' },
          { label: 'Expiration proche', value: expiringSoon, icon: Clock, color: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-50 dark:bg-purple-950/40', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/60">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <CardContent className="pt-5 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`flex items-center justify-center size-11 rounded-xl ${stat.iconBg}`}><stat.icon className={`size-5 ${stat.iconColor}`} /></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search/Filter */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input placeholder="Rechercher médicament, dosage..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Medication Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Inventaire</CardTitle>
            <CardDescription className="text-xs">{filtered.length} médicaments</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Médicament</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Catégorie</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Stock</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Niveau</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Expiration</th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((med, index) => {
                    const level = getStockLevel(med.stock, med.maxStock)
                    const pct = med.maxStock > 0 ? Math.round((med.stock / med.maxStock) * 100) : 0
                    return (
                      <motion.tr key={med.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <p className="font-medium text-slate-900 dark:text-white">{med.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{med.dosage}</p>
                        </td>
                        <td className="py-3 px-2"><Badge variant="secondary" className="text-[10px]">{med.category}</Badge></td>
                        <td className="py-3 px-2">
                          <span className={`font-bold ${level.textColor}`}>{med.stock}</span>
                          <span className="text-xs text-slate-400 ml-1">{med.unit}</span>
                        </td>
                        <td className="py-3 px-2 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <motion.div className={`h-full rounded-full ${level.color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay: index * 0.05 }} />
                            </div>
                            <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${level.badgeColor}`}>{level.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500 dark:text-slate-400">{med.expiryDate}</td>
                        <td className="py-3 px-2 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{med.price.toLocaleString()} GNF</td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Medication Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="size-5 text-teal-600" /> Nouveau médicament</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom *</Label><Input placeholder="Paracétamol 500mg" value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Catégorie *</Label><Input placeholder="Antalgique" value={newCategory} onChange={e => setNewCategory(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Dosage</Label><Input placeholder="500mg" value={newDosage} onChange={e => setNewDosage(e.target.value)} /></div>
              <div className="space-y-2"><Label>Unité</Label><Input placeholder="comprimés" value={newUnit} onChange={e => setNewUnit(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Stock initial</Label><Input type="number" placeholder="0" value={newStock} onChange={e => setNewStock(e.target.value)} /></div>
              <div className="space-y-2"><Label>Stock max</Label><Input type="number" placeholder="0" value={newMaxStock} onChange={e => setNewMaxStock(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prix (GNF) *</Label><Input type="number" placeholder="0" value={newPrice} onChange={e => setNewPrice(e.target.value)} /></div>
              <div className="space-y-2"><Label>Date expiration</Label><Input type="date" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Fournisseur</Label><Input placeholder="PharmaGuinée" value={newSupplier} onChange={e => setNewSupplier(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleAddMedication}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Entrée de stock</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Médicament *</Label><Select value={entryMedId} onValueChange={setEntryMedId}><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent>{medications.filter(m => m.stock < m.maxStock).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quantité *</Label><Input type="number" placeholder="0" value={entryQty} onChange={e => setEntryQty(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntryDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleStockEntry}>Enregistrer entrée</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>Sortie de stock</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Médicament *</Label><Select value={exitMedId} onValueChange={setExitMedId}><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent>{medications.filter(m => m.stock > 0).map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.stock} {m.unit})</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quantité *</Label><Input type="number" placeholder="0" value={exitQty} onChange={e => setExitQty(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>Annuler</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleStockExit}>Enregistrer sortie</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </motion.div>
  )
}
