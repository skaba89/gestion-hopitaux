'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Play, Award, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { trainingModules, type TrainingModule as TrainingModuleType } from '@/lib/asc-tools'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }

export function ELearning() {
  const [selectedModule, setSelectedModule] = useState<TrainingModuleType | null>(null)
  const [quizMode, setQuizMode] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizComplete, setQuizComplete] = useState(false)

  const handleStartQuiz = (module: TrainingModuleType) => {
    setSelectedModule(module)
    setQuizMode(true)
    setCurrentQuizIndex(0)
    setQuizAnswers([])
    setQuizComplete(false)
  }

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex]
    setQuizAnswers(newAnswers)

    if (selectedModule && currentQuizIndex < selectedModule.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
    } else {
      setQuizComplete(true)
    }
  }

  const getQuizScore = () => {
    if (!selectedModule) return 0
    return quizAnswers.reduce((score, answer, index) => {
      return score + (answer === selectedModule.quiz[index]?.correctAnswer ? 1 : 0)
    }, 0)
  }

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="size-5 text-teal-600" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Modules de formation</h2>
      </div>

      <div className="space-y-3">
        {trainingModules.map(module => (
          <motion.div key={module.id} variants={itemVariants}>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{module.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{module.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{module.category}</Badge>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="size-3" /> {module.duration}
                      </span>
                    </div>
                  </div>
                  {module.certificateId && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      <Award className="size-3 mr-0.5" /> Certifié
                    </Badge>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">Progression</span>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-1.5" />
                </div>

                {/* Lessons list */}
                <div className="space-y-1 mb-3">
                  {module.lessons.slice(0, 3).map(lesson => (
                    <div key={lesson.id} className="flex items-center gap-2 text-xs">
                      {lesson.completed ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                      ) : (
                        <div className="size-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                      <span className={lesson.completed ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}>{lesson.title}</span>
                    </div>
                  ))}
                  {module.lessons.length > 3 && (
                    <p className="text-[10px] text-slate-400">+{module.lessons.length - 3} leçons</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={module.progress === 100 ? 'outline' : 'default'}
                    className={`text-xs h-8 ${module.progress < 100 ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
                  >
                    <Play className="size-3.5 mr-1" />
                    {module.progress === 0 ? 'Commencer' : module.progress === 100 ? 'Revoir' : 'Continuer'}
                  </Button>
                  {module.quiz.length > 0 && module.progress >= 50 && (
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleStartQuiz(module)}>
                      Quiz ({module.quiz.length} questions)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={quizMode} onOpenChange={setQuizMode}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-teal-600" />
              {quizComplete ? 'Résultats du quiz' : `Quiz — ${selectedModule?.title}`}
            </DialogTitle>
          </DialogHeader>

          {!quizComplete && selectedModule ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Question {currentQuizIndex + 1}/{selectedModule.quiz.length}</span>
                <Progress value={((currentQuizIndex + 1) / selectedModule.quiz.length) * 100} className="h-1.5 w-24" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedModule.quiz[currentQuizIndex]?.question}
              </p>
              <div className="space-y-2">
                {selectedModule.quiz[currentQuizIndex]?.options.map((option, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-xs h-10"
                    onClick={() => handleQuizAnswer(i)}
                  >
                    <span className="size-5 rounded-full border border-slate-300 flex items-center justify-center mr-2 text-[10px] font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
                <Award className="size-8 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Score: {getQuizScore()}/{selectedModule?.quiz.length || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {getQuizScore() === (selectedModule?.quiz.length || 0) ? 'Parfait ! Vous maîtrisez ce module.' :
                  getQuizScore() >= ((selectedModule?.quiz.length || 0) / 2) ? 'Bon résultat ! Continuez à apprendre.' :
                  'Continuez à étudier pour améliorer votre score.'}
              </p>
              {getQuizScore() === (selectedModule?.quiz.length || 0) && (
                <Badge className="mt-3 bg-emerald-100 text-emerald-700">
                  <Award className="size-3 mr-1" /> Certificat obtenu !
                </Badge>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizMode(false)} className="text-xs">
              {quizComplete ? 'Fermer' : 'Annuler'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
