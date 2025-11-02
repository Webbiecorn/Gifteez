import React, { useMemo, useState } from 'react'
import { useOptionalBlogContext } from '../contexts/BlogContext'
import { blogPosts as staticBlogPosts } from '../data/blogData'
import { quizQuestions, quizResults } from '../data/quizData'
import Button from './Button'
import {
  GiftIcon,
  SparklesIcon,
  StarIcon,
  CheckIcon,
  ChevronRightIcon,
  BookOpenIcon,
  TargetIcon,
  EditIcon,
  HeartIcon,
  TagIcon,
  CalendarIcon,
  ShoppingCartIcon,
  MailIcon,
  DownloadIcon,
  ShareIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import Meta from './Meta'
import NewsletterSignup from './NewsletterSignup'
import QuizIllustration from './QuizIllustration'
import QuizShareCard from './QuizShareCard'
import type {
  BlogPost,
  NavigateTo,
  QuizResult as QuizResultType,
  BudgetTier,
  RelationshipType,
  OccasionType,
} from '../types'

interface QuizPageProps {
  navigateTo: NavigateTo
}

type QuizStep = 'intro' | 'quiz' | 'result'

const personaKeys = ['homebody', 'adventurer', 'foodie', 'creative'] as const
type PersonaKey = (typeof personaKeys)[number]

type PersonaMeta = {
  key: PersonaKey
  badge: string
  accent: string
  accentSoft: string
  gradient: string
  icon: React.ComponentType<{ className?: string }>
  tagline: string
  strengths: string[]
  microcopy: string
}

const personaMeta: Record<PersonaKey, PersonaMeta> = {
  homebody: {
    key: 'homebody',
    badge: 'Gezellige genieter',
    accent: 'text-rose-600',
    accentSoft: 'bg-rose-100/80',
    gradient: 'from-rose-100 via-white to-amber-50',
    icon: GiftIcon,
    tagline: 'Comfort, warmte & rust',
    strengths: [
      'Houdt van knusse rituelen en slow moments',
      'Waardeert praktische luxe in huis',
      'Wordt blij van persoonlijke aandacht en zorg',
    ],
    microcopy: 'Kies voor zachte materialen, wellnessmomenten of slimme woon-upgrades.',
  },
  adventurer: {
    key: 'adventurer',
    badge: 'Out of office explorer',
    accent: 'text-emerald-600',
    accentSoft: 'bg-emerald-100/75',
    gradient: 'from-emerald-100 via-white to-sky-100',
    icon: TargetIcon,
    tagline: 'Beleving staat centraal',
    strengths: [
      'Zoekt avontuur en nieuwe ervaringen',
      'Houdt van duurzame gear die meegaat',
      'Verzamelt verhalen in plaats van spullen',
    ],
    microcopy: 'Ga voor activity-vouchers, travel upgrades of outdoor essentials.',
  },
  foodie: {
    key: 'foodie',
    badge: 'Culinaire fijnproever',
    accent: 'text-orange-600',
    accentSoft: 'bg-orange-100/80',
    gradient: 'from-orange-100 via-white to-amber-100',
    icon: StarIcon,
    tagline: 'Smaken, rituals & sharing',
    strengths: [
      'Houdt van experimenteren in de keuken',
      'Verzamelt kwaliteitsproducten en gadgets',
      'Deelt graag smaakvolle momenten met anderen',
    ],
    microcopy: 'Denk aan workshop-cadeaus, premium ingrediënten of tasting experiences.',
  },
  creative: {
    key: 'creative',
    badge: 'Artistieke visionair',
    accent: 'text-indigo-600',
    accentSoft: 'bg-indigo-100/80',
    gradient: 'from-indigo-100 via-white to-violet-100',
    icon: BookOpenIcon,
    tagline: 'Expressie boven alles',
    strengths: [
      'Ontdekt graag nieuwe tools en media',
      'Waardeert unieke en handgemaakte items',
      'Zoekt inspiratie in kunst, muziek en design',
    ],
    microcopy: 'Maak indruk met creatieve workshops, design objecten of maker-tools.',
  },
}

const metaQuestionMeta = {
  budget: {
    icon: TagIcon,
    accent: 'text-amber-600',
    accentSoft: 'bg-amber-100/70',
    label: 'Budgetkeuze',
  },
  relationship: {
    icon: HeartIcon,
    accent: 'text-rose-600',
    accentSoft: 'bg-rose-100/70',
    label: 'Relatie',
  },
  occasion: {
    icon: CalendarIcon,
    accent: 'text-sky-600',
    accentSoft: 'bg-sky-100/70',
    label: 'Moment',
  },
} as const

const personaNewsletterCategories: Partial<Record<PersonaKey, string[]>> = {
  homebody: ['Verjaardagen', 'Feestdagen', 'Lifestyle'],
  adventurer: ['Verjaardagen', 'Lifestyle'],
  foodie: ['Verjaardagen', 'Kerstmis'],
  creative: ['Verjaardagen', 'Lifestyle'],
}

const relationshipLabels: Record<RelationshipType, string> = {
  partner: 'Partner',
  friend: 'Vriend(in)',
  colleague: 'Collega',
  family: 'Familie',
}

const relationshipCopy: Record<RelationshipType, string> = {
  partner:
    'Voor je partner werken cadeaus met een romantische twist en persoonlijke touch extra goed.',
  friend:
    'Voor je vriend(in) scoren verrassingen met fun-factor en gezamenlijke beleving het beste.',
  colleague:
    'Voor een collega kies je iets luchtigs en praktisch dat ook op kantoor in de smaak valt.',
  family:
    'Voor familie maak je indruk met warme cadeaus die herinneringen ophalen of samen momenten creëren.',
}

const occasionLabels: Record<OccasionType, string> = {
  birthday: 'Verjaardag',
  housewarming: 'Housewarming',
  holidays: 'Feestdagen',
  anniversary: 'Jubileum',
}

const budgetLabels: Record<BudgetTier, string> = {
  'budget-low': 'Tot €25',
  'budget-mid': '€25 - €75',
  'budget-high': '€75+',
}

const isPersonaKey = (value: string | undefined): value is PersonaKey =>
  Boolean(value && (personaMeta as Record<string, PersonaMeta>)[value])

const createInitialAnswers = (): Record<number, string | undefined> => {
  const base: Record<number, string | undefined> = {}
  quizQuestions.forEach((question) => {
    base[question.id] = undefined
  })
  return base
}

const resolveQuizOutcome = (
  answerMap: Record<number, string | undefined>
): { key: PersonaKey; result: QuizResultType } => {
  const counts = personaKeys.reduce<Record<PersonaKey, number>>(
    (acc, key) => {
      acc[key] = 0
      return acc
    },
    {} as Record<PersonaKey, number>
  )

  Object.values(answerMap).forEach((value) => {
    if (isPersonaKey(value)) {
      counts[value] += 1
    }
  })

  const sortedKeys = personaKeys.slice().sort((a, b) => counts[b] - counts[a])
  const winningKey = sortedKeys.find((key) => counts[key] > 0) ?? 'homebody'
  const fallback = quizResults[winningKey] ?? quizResults.homebody

  return { key: winningKey, result: fallback }
}

const QuizPage: React.FC<QuizPageProps> = ({ navigateTo }) => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | undefined>>(createInitialAnswers)
  const [resultKey, setResultKey] = useState<PersonaKey | null>(null)
  const [result, setResult] = useState<QuizResultType | null>(null)

  const blogContext = useOptionalBlogContext()

  const blogPostList: BlogPost[] = blogContext?.posts?.length ? blogContext.posts : staticBlogPosts

  const totalQuestions = quizQuestions.length
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const currentAnswerValue = currentQuestion ? answers[currentQuestion.id] : undefined
  const currentAnswerOption = currentQuestion?.answers.find(
    (option) => option.value === currentAnswerValue
  )
  const currentPersonaKey =
    currentAnswerOption?.resultKey && isPersonaKey(currentAnswerOption.resultKey)
      ? currentAnswerOption.resultKey
      : undefined
  const currentPersonaMeta = currentPersonaKey ? personaMeta[currentPersonaKey] : undefined
  const currentPersonaResult = currentPersonaKey ? quizResults[currentPersonaKey] : undefined

  const answeredQuestions = useMemo(
    () =>
      quizQuestions.reduce((count, question) => {
        return answers[question.id] ? count + 1 : count
      }, 0),
    [answers]
  )

  const progressValue = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  const progressPercentage = Math.round(progressValue)
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isNextDisabled = !currentAnswerValue
  const nextButtonLabel = isLastQuestion ? 'Bekijk jouw cadeau-profiel' : 'Volgende vraag'

  const questionSummaries = useMemo(
    () =>
      quizQuestions.map((question, index) => {
        const answerValue = answers[question.id]
        const answerOption = question.answers.find((option) => option.value === answerValue)
        const personaKey =
          answerOption?.resultKey && isPersonaKey(answerOption.resultKey)
            ? answerOption.resultKey
            : null

        return {
          question,
          index,
          personaKey,
          answerText: answerOption?.text,
          answerValue,
        }
      }),
    [answers]
  )

  const relatedBlogs = useMemo(() => {
    if (!result) {
      return [] as BlogPost[]
    }

    return (result.relatedBlogSlugs ?? [])
      .map((slug) => blogPostList.find((post) => post.slug === slug))
      .filter((post): post is BlogPost => Boolean(post))
  }, [blogPostList, result])

  const handleStart = () => {
    setStep('quiz')
    setCurrentQuestionIndex(0)
    setResultKey(null)
    setResult(null)
  }

  const handleAnswer = (selectedValue: string) => {
    if (!currentQuestion) {
      return
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedValue,
    }))
  }

  const handleNext = () => {
    if (!currentAnswerValue) {
      return
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      return
    }

    const outcome = resolveQuizOutcome(answers)
    setResultKey(outcome.key)
    setResult(outcome.result)
    setStep('result')
  }

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) {
      return
    }

    setCurrentQuestionIndex((prev) => prev - 1)
  }

  const handleRestart = () => {
    setAnswers(createInitialAnswers())
    setCurrentQuestionIndex(0)
    setResultKey(null)
    setResult(null)
    setStep('intro')
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setStep('quiz')
  }

  const handleEditAnswers = () => {
    const firstUnansweredIndex = quizQuestions.findIndex((question) => !answers[question.id])
    const targetIndex = firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0

    setCurrentQuestionIndex(targetIndex)
    setStep('quiz')
  }

  const getMetaAnswer = (metaKey: 'budget' | 'relationship' | 'occasion') => {
    const question = quizQuestions.find((item) => item.metaKey === metaKey)
    if (!question) {
      return undefined
    }

    const selectedValue = answers[question.id]
    if (!selectedValue) {
      return undefined
    }

    return question.answers.find((option) => option.value === selectedValue)
  }

  if (!currentQuestion && step === 'quiz') {
    return null
  }

  if (step === 'intro') {
    return (
      <>
        <Meta
          title="Cadeau Quiz - Ontdek jouw perfecte cadeau stijl | Gifteez"
          description="Doe de Gifteez Cadeau Quiz en ontdek welke cadeaus het beste bij jou passen. Krijg persoonlijke aanbevelingen gebaseerd op jouw voorkeuren, budget en gelegenheid."
        />
        <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-rose-50/70">
          <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-100 text-primary">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute -top-10 left-0 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-amber-200/40 blur-[120px]"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-100/40 blur-3xl"
                aria-hidden="true"
              />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-16 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-10">
                  <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-accent shadow-sm">
                      <SparklesIcon className="h-4 w-4" />
                      Cadeau persoonlijkheidstest
                    </div>
                    <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
                      Vind cadeaus die echt aansluiten bij hun persoonlijkheid
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-primary/80">
                      Beantwoord drie slimme vragen en krijg direct een persoonlijk cadeau-profiel,
                      inclusief topinteresses en inspiratie. Binnen een minuut weet je precies wat
                      wel én niet werkt voor jouw ontvanger.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {personaKeys.map((key) => {
                      const meta = personaMeta[key]
                      const Icon = meta.icon

                      return (
                        <div
                          key={key}
                          className={`flex items-start gap-3 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-sm backdrop-blur ${meta.accentSoft}`}
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow ${meta.accent}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold uppercase tracking-wide text-primary/70">
                              {meta.badge}
                            </p>
                            <p className="text-base font-semibold text-primary">
                              {quizResults[key]?.title}
                            </p>
                            <p className="text-sm text-primary/70">{meta.tagline}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button
                      variant="accent"
                      type="button"
                      onClick={handleStart}
                      className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg shadow-lg shadow-accent/30"
                    >
                      <SparklesIcon className="h-5 w-5" />
                      Start de quiz
                    </Button>
                    <button
                      type="button"
                      onClick={() => navigateTo('giftFinder')}
                      className="text-primary font-semibold underline decoration-primary/30 decoration-2 underline-offset-4 transition-colors hover:text-accent"
                    >
                      Liever direct naar de AI GiftFinder?
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      '3 vragen · 30 seconden',
                      'Persoonlijk profiel + tips',
                      'Direct cadeau-inspiratie',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-semibold text-primary/80 shadow-sm"
                      >
                        <CheckIcon className="h-4 w-4 text-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-2xl shadow-rose-200/40 backdrop-blur">
                    <QuizIllustration className="h-full w-full" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 flex w-[85%] -translate-x-1/2 items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-semibold text-primary/70 shadow-lg">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-accent" />
                      Slim & intuïtief
                    </div>
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-4 w-4 text-yellow-500" />4 cadeau persona's
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-primary/10 bg-white/90 px-8 py-10 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <GiftIcon className="h-6 w-6 text-accent" />
                <h2 className="font-display text-2xl font-bold text-primary">Hoe het werkt</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: 'Beantwoord 3 vragen',
                    description:
                      'Elke vraag is ontworpen om snel voorkeuren scherp te krijgen zonder lange lijsten.',
                  },
                  {
                    title: 'Ontvang een profiel',
                    description:
                      'We matchen je antwoorden met één van de vier cadeau persoonlijkheden.',
                  },
                  {
                    title: 'Krijg direct inspiratie',
                    description:
                      'Met concrete interesses, blogtips en een doorklik naar de AI GiftFinder.',
                  },
                ].map((stepItem) => (
                  <div
                    key={stepItem.title}
                    className="rounded-2xl border border-primary/10 bg-gradient-to-br from-white via-white to-rose-50 p-6 shadow-sm"
                  >
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                      {stepItem.title}
                    </p>
                    <p className="mt-3 text-base text-primary/70">{stepItem.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    )
  }

  if (step === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-rose-50/70 py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                Vraag {currentQuestionIndex + 1} van {totalQuestions}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-primary">
                {currentQuestion.text}
              </h2>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="text-sm text-primary/60">Voortgang</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-accent">
                  {progressPercentage}%
                </span>
                <span className="text-sm text-primary/60">voltooid</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.7fr,1fr]">
            <div className="space-y-6 rounded-3xl border border-white/80 bg-white/95 p-8 shadow-xl">
              <div className="h-3 w-full rounded-full bg-primary/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-accent via-accent to-highlight transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>

              <div className="space-y-4">
                {currentQuestion.answers.map((answer, index) => {
                  const personaKey =
                    answer.resultKey && isPersonaKey(answer.resultKey)
                      ? answer.resultKey
                      : undefined
                  const persona = personaKey ? personaMeta[personaKey] : undefined
                  const personaResult = personaKey ? quizResults[personaKey] : undefined
                  const metaConfig = currentQuestion.metaKey
                    ? metaQuestionMeta[currentQuestion.metaKey]
                    : undefined
                  const Icon = persona?.icon ?? metaConfig?.icon ?? SparklesIcon
                  const isSelected = currentAnswerValue === answer.value

                  return (
                    <button
                      key={answer.value}
                      type="button"
                      onClick={() => handleAnswer(answer.value)}
                      aria-pressed={isSelected}
                      className={`w-full rounded-2xl border-2 p-6 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 ${
                        isSelected
                          ? 'border-accent/70 bg-white shadow-lg shadow-accent/15'
                          : 'border-primary/10 bg-gradient-to-r from-white via-white to-rose-50 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-semibold transition ${
                            isSelected
                              ? 'border-accent bg-accent text-white'
                              : 'border-accent/30 bg-white text-primary'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p
                            className={`text-lg font-semibold leading-relaxed text-primary ${isSelected ? 'text-accent' : ''}`}
                          >
                            {answer.text}
                          </p>
                          {persona && personaResult ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${persona.accentSoft} ${persona.accent}`}
                              >
                                <Icon className="h-4 w-4" />
                                {persona.badge}
                              </span>
                              <span className="text-primary/60">→ {personaResult.title}</span>
                            </div>
                          ) : (
                            (answer.helperText || metaConfig) && (
                              <div className="space-y-2 text-sm text-primary/65">
                                {metaConfig && (
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${metaConfig.accentSoft} ${metaConfig.accent}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                    {metaConfig.label}
                                  </span>
                                )}
                                {answer.helperText && <p>{answer.helperText}</p>}
                              </div>
                            )
                          )}
                        </div>
                        <div
                          className={`transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 sm:opacity-0 sm:group-hover:opacity-100'}`}
                        >
                          <ChevronRightIcon className="h-6 w-6 text-accent" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-3 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Vorige vraag
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/15 px-5 py-3 text-sm font-semibold text-primary/70 transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/30"
                  >
                    Reset quiz
                  </button>
                  <Button
                    variant="accent"
                    type="button"
                    disabled={isNextDisabled}
                    onClick={handleNext}
                    className="rounded-full px-7 py-3 text-base font-semibold shadow-lg shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {nextButtonLabel}
                  </Button>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-5 w-5 text-accent" />
                  <p className="font-semibold text-primary">Voortgang per vraag</p>
                </div>
                <div className="mt-4 space-y-3">
                  {questionSummaries.map((summary) => {
                    const isActive = summary.index === currentQuestionIndex
                    const isPersonaQuestion = summary.question.kind === 'persona'
                    const personaStyle = summary.personaKey
                      ? personaMeta[summary.personaKey]
                      : undefined
                    const metaConfig = summary.question.metaKey
                      ? metaQuestionMeta[summary.question.metaKey]
                      : undefined
                    const Icon =
                      isPersonaQuestion && personaStyle
                        ? personaStyle.icon
                        : (metaConfig?.icon ?? CheckIcon)
                    const iconColorClass =
                      isPersonaQuestion && personaStyle
                        ? personaStyle.accent
                        : (metaConfig?.accent ?? 'text-primary/30')

                    return (
                      <button
                        key={summary.question.id}
                        type="button"
                        onClick={() => handleJumpToQuestion(summary.index)}
                        className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-accent/50 bg-accent/5'
                            : 'border-primary/10 bg-white/90 hover:border-accent/40'
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                            summary.personaKey
                              ? personaMeta[summary.personaKey].accentSoft
                              : 'bg-primary/10'
                          } ${summary.personaKey ? personaMeta[summary.personaKey].accent : 'text-primary'}`}
                        >
                          {summary.index + 1}
                        </span>
                        <div className="flex-1 text-sm">
                          <p className="font-semibold text-primary/80 line-clamp-2">
                            {summary.question.text}
                          </p>
                          <p className="mt-1 text-primary/60 line-clamp-1">
                            {summary.answerText ?? 'Nog geen antwoord'}
                          </p>
                        </div>
                        <Icon className={`mt-1 h-5 w-5 ${iconColorClass}`} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {currentPersonaMeta && currentPersonaResult && (
                <div
                  className={`rounded-3xl border border-white/70 bg-white/95 p-6 shadow-lg ${currentPersonaMeta.accentSoft}`}
                >
                  <div className="flex items-center gap-3">
                    <currentPersonaMeta.icon className={`h-6 w-6 ${currentPersonaMeta.accent}`} />
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                        Voorproefje
                      </p>
                      <p className="font-display text-xl text-primary">
                        {currentPersonaResult.title}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-primary/70">{currentPersonaMeta.microcopy}</p>
                  <ul className="mt-4 space-y-2 text-sm text-primary/70">
                    {currentPersonaMeta.strengths.slice(0, 2).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckIcon className="mt-1 h-4 w-4 text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && result && resultKey) {
    const persona = personaMeta[resultKey]
    const budgetAnswer = getMetaAnswer('budget')
    const relationshipAnswer = getMetaAnswer('relationship')
    const occasionAnswer = getMetaAnswer('occasion')

    const budgetValue = (budgetAnswer?.value as BudgetTier | undefined) ?? null
    const relationshipValue = (relationshipAnswer?.value as RelationshipType | undefined) ?? null
    const occasionValue = (occasionAnswer?.value as OccasionType | undefined) ?? null

    const occasionHighlight = occasionValue ? result.occasionHighlights?.[occasionValue] : undefined
    const relationshipLine = relationshipValue ? relationshipCopy[relationshipValue] : undefined
    const infoChips = [
      budgetValue ? { label: 'Budget', value: budgetLabels[budgetValue] } : null,
      relationshipValue ? { label: 'Relatie', value: relationshipLabels[relationshipValue] } : null,
      occasionValue ? { label: 'Moment', value: occasionLabels[occasionValue] } : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item))
    const shoppingList = budgetValue ? result.shoppingList?.[budgetValue] : undefined
    const interestsList = result.recommendedInterests
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    const newsletterTitle = `🎁 ${persona.badge} inspiratie`
    const newsletterDescription = `Ontvang cadeautips met focus op ${persona.tagline.toLowerCase()}.`
    const newsletterCategories = personaNewsletterCategories[resultKey] ?? []
    const emailSubject = `Cadeau-profiel: ${result.title}`
    const emailBodyLines = [
      'Hi! Ik heb net de Gifteez cadeau quiz gedaan en wil dit profiel even delen.',
      '',
      `Persona: ${result.title}`,
      relationshipValue ? `Relatie: ${relationshipLabels[relationshipValue]}` : null,
      occasionValue ? `Moment: ${occasionLabels[occasionValue]}` : null,
      budgetValue ? `Budget: ${budgetLabels[budgetValue]}` : null,
      '',
      `Waarom het past: ${result.description}`,
      occasionHighlight ? `Extra tip: ${occasionHighlight}` : null,
      relationshipLine ? `Let op: ${relationshipLine}` : null,
    ].filter((line): line is string => Boolean(line))

    if (shoppingList && shoppingList.length > 0) {
      emailBodyLines.push('', 'Top cadeaus:')
      shoppingList.slice(0, 3).forEach((item) => {
        emailBodyLines.push(`- ${item.title}: ${item.description}`)
      })
    }

    emailBodyLines.push('', 'Bekijk meer ideeën via de Gifteez GiftFinder!')

    const emailBody = emailBodyLines.join('\n')

    const handleEmailProfile = () => {
      window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    }

    const handleDownloadProfile = () => {
      window.print()
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-rose-50/70 pb-24">
        <section
          className={`relative overflow-hidden bg-gradient-to-br ${persona.gradient} text-primary`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -top-10 left-0 h-72 w-72 rounded-full bg-white/40 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute top-1/4 right-0 h-64 w-64 rounded-full bg-white/30 blur-[120px]"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-white/30 blur-3xl"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-primary/70">
                <SparklesIcon className="h-4 w-4" />
                Jouw cadeau-profiel
              </div>
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                <persona.icon className={`h-12 w-12 ${persona.accent}`} />
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
                {result.title}
              </h1>
              <div className="mt-6 space-y-4 text-lg text-primary/80 sm:text-xl">
                <p>{result.description}</p>
                {occasionHighlight && <p className="text-primary/75">{occasionHighlight}</p>}
                {relationshipLine && <p className="text-primary/75">{relationshipLine}</p>}
              </div>
              {infoChips.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {infoChips.map((chip) => (
                    <span
                      key={`${chip.label}-${chip.value}`}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary/70"
                    >
                      <span className="text-primary/50">{chip.label}:</span> {chip.value}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {interestsList.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-primary/10 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary/70"
                  >
                    #{interest.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  variant="accent"
                  type="button"
                  onClick={() =>
                    navigateTo('giftFinder', {
                      persona: resultKey,
                      budget: budgetValue,
                      relationship: relationshipValue
                        ? relationshipLabels[relationshipValue]
                        : undefined,
                      occasion: occasionValue ? occasionLabels[occasionValue] : undefined,
                      interests: result.recommendedInterests,
                      source: 'quiz-result',
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg shadow-lg shadow-accent/30"
                >
                  <SparklesIcon className="h-6 w-6" />
                  Vraag onze AI om 3 ideeën
                </Button>
                <button
                  type="button"
                  onClick={handleEditAnswers}
                  className="flex items-center gap-2 text-sm font-semibold text-primary/70 underline decoration-primary/30 decoration-2 underline-offset-4 transition hover:text-accent"
                >
                  <EditIcon className="h-4 w-4" />
                  Pas antwoorden aan
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="text-sm font-semibold text-primary/70 transition hover:text-accent"
                >
                  Doe de quiz opnieuw
                </button>
              </div>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleEmailProfile}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-5 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  <MailIcon className="h-4 w-4" />
                  Mail dit profiel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadProfile}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-5 py-2 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download als PDF
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-8">
              <div className="rounded-3xl border border-white/70 bg-white/95 p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <persona.icon className={`h-6 w-6 ${persona.accent}`} />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                      Persoonlijkheidsinsights
                    </p>
                    <p className="font-display text-2xl text-primary">
                      Wat werkt voor {result.title.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {persona.strengths.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
                      <CheckIcon className="mt-1 h-5 w-5 text-accent" />
                      <p className="text-primary/80">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-primary/10 bg-gradient-to-r from-white via-white to-rose-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                    Snelle tip
                  </p>
                  <p className="mt-2 text-primary/75">{persona.microcopy}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/95 p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <ShoppingCartIcon className="h-6 w-6 text-accent" />
                  <h2 className="font-display text-2xl text-primary">
                    Shopping list voor jouw budget
                  </h2>
                </div>
                {shoppingList && shoppingList.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {shoppingList.map((item) => (
                      <div
                        key={item.title}
                        className="flex h-full flex-col justify-between rounded-2xl border border-primary/10 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary/50">
                            Curated pick
                          </p>
                          <h3 className="mt-2 font-display text-lg text-primary">{item.title}</h3>
                          <p className="mt-3 text-sm text-primary/70">{item.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigateTo('giftFinder', {
                              persona: resultKey,
                              budget: budgetValue,
                              focus: item.title,
                              occasion: occasionValue ? occasionLabels[occasionValue] : undefined,
                            })
                          }
                          className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/15 px-5 py-2 text-sm font-semibold text-accent transition hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent/80"
                        >
                          Bekijk ideeën
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-primary/70">
                    Kies een budget in de quiz om direct bijpassende cadeautips te zien.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/95 p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <BookOpenIcon className="h-6 w-6 text-accent" />
                  <h2 className="font-display text-2xl text-primary">Aanbevolen gidsen</h2>
                </div>
                {relatedBlogs.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {relatedBlogs.map((post) => (
                      <button
                        key={post.slug}
                        type="button"
                        onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                        className="group overflow-hidden rounded-2xl border border-primary/10 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <ImageWithFallback
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary/70">
                            {post.category}
                          </span>
                        </div>
                        <div className="space-y-2 p-5">
                          <h3 className="font-display text-lg font-semibold text-primary transition group-hover:text-accent">
                            {post.title}
                          </h3>
                          <p className="text-sm text-primary/70 line-clamp-3">{post.excerpt}</p>
                          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                            Lees verder
                            <ChevronRightIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-primary/70">
                    Momenteel hebben we geen blogartikelen gekoppeld aan dit profiel. Kom snel terug
                    voor nieuwe inspiratie!
                  </p>
                )}
              </div>
            </div>
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <ShareIcon className="h-5 w-5 text-accent" />
                  <p className="font-semibold text-primary">Deel je cadeau-profiel</p>
                </div>
                <p className="text-sm text-primary/70">
                  Pas de kaart aan, download 'm als afbeelding en deel je cadeau vibe met vrienden.
                </p>
                <div className="mt-5">
                  <QuizShareCard
                    personaTitle={result.title}
                    personaBadge={persona.badge}
                    personaTagline={persona.tagline}
                    accentClass={persona.accent}
                    accentSoftClass={persona.accentSoft}
                    gradientClass={persona.gradient}
                    Icon={persona.icon}
                    interests={interestsList}
                    budgetLabel={budgetValue ? budgetLabels[budgetValue] : null}
                    occasionLabel={occasionValue ? occasionLabels[occasionValue] : null}
                    relationshipLabel={
                      relationshipValue ? relationshipLabels[relationshipValue] : null
                    }
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <TargetIcon className="h-5 w-5 text-accent" />
                  <p className="font-semibold text-primary">Samenvatting van je antwoorden</p>
                </div>
                <div className="space-y-3">
                  {questionSummaries.map((summary) => {
                    const isPersonaQuestion = summary.question.kind === 'persona'
                    const personaData = summary.personaKey ? personaMeta[summary.personaKey] : null
                    const metaConfig =
                      !isPersonaQuestion && summary.question.metaKey
                        ? metaQuestionMeta[summary.question.metaKey]
                        : null
                    const Icon =
                      isPersonaQuestion && personaData
                        ? personaData.icon
                        : (metaConfig?.icon ?? SparklesIcon)
                    const badgeClasses =
                      isPersonaQuestion && personaData
                        ? `${personaData.accentSoft} ${personaData.accent}`
                        : metaConfig
                          ? `${metaConfig.accentSoft} ${metaConfig.accent}`
                          : 'bg-primary/10 text-primary'

                    return (
                      <div
                        key={summary.question.id}
                        className="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${badgeClasses}`}
                          >
                            {summary.index + 1}
                          </span>
                          <div className="flex-1 text-sm">
                            <p className="font-semibold text-primary/80 line-clamp-2">
                              {summary.question.text}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-primary/70">
                              <Icon
                                className={`h-4 w-4 ${isPersonaQuestion && personaData ? personaData.accent : (metaConfig?.accent ?? 'text-primary/50')}`}
                              />
                              <span>{summary.answerText ?? 'Nog geen antwoord'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJumpToQuestion(summary.index)}
                          className="mt-3 text-xs font-semibold text-accent underline decoration-accent/30 underline-offset-4"
                        >
                          Bewerk dit antwoord
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <MailIcon className="h-5 w-5 text-accent" />
                  <p className="font-semibold text-primary">Persoonlijke cadeautips ontvangen</p>
                </div>
                <p className="text-sm text-primary/70">
                  Blijf op de hoogte met inspiratie die past bij {persona.badge.toLowerCase()}s.
                </p>
                <NewsletterSignup
                  key={`newsletter-${resultKey}`}
                  variant="inline"
                  className="mt-4 !border-transparent !bg-transparent !p-0 shadow-none"
                  title={newsletterTitle}
                  description={newsletterDescription}
                  defaultCategories={newsletterCategories}
                  defaultFrequency="weekly"
                />
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary/60">
                  Volgende stap
                </p>
                <p className="mt-2 text-primary/80">
                  Klaar om concrete cadeau-ideeën te krijgen? Gebruik je profiel in de AI GiftFinder
                  en filter direct op interesses als
                  <span className="font-semibold text-primary">
                    {' '}
                    {result.recommendedInterests.toLowerCase()}
                  </span>
                  .
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary/60">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  Heeft 2-3 minuten nodig, geen account vereist
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default QuizPage
