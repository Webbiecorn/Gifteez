
import React, { useState } from 'react';
import { NavigateTo, QuizResult } from '../types';
import { quizQuestions, quizResults } from '../data/quizData';
import { blogPosts } from '../data/blogData';
import Button from './Button';
import { GiftIcon, SparklesIcon, StarIcon, CheckIcon, ChevronRightIcon } from './IconComponents';
import ImageWithFallback from './ImageWithFallback';
import QuizIllustration from './QuizIllustration';

interface QuizPageProps {
  navigateTo: NavigateTo;
}

type QuizStep = 'start' | 'question' | 'result';

const QuizPage: React.FC<QuizPageProps> = ({ navigateTo }) => {
  const [step, setStep] = useState<QuizStep>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleStart = () => {
    setStep('question');
  };

  const handleAnswer = (resultKey: string) => {
    const newAnswers = [...answers, resultKey];
    setAnswers(newAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult(newAnswers);
      setStep('result');
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    const counts: Record<string, number> = {};
    for (const answer of finalAnswers) {
      counts[answer] = (counts[answer] || 0) + 1;
    }

    const resultKey = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    setResult(quizResults[resultKey]);
  };

  const handleRestart = () => {
    setStep('start');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  if (step === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h1 className="typo-h1 mb-6 leading-tight text-white">
                  Ontdek je
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    Cadeau Persoonlijkheid
                  </span>
                </h1>
                <p className="typo-lead text-white/90 max-w-2xl mb-8">
                  Beantwoord 3 slimme vragen en krijg een persoonlijk profiel + directe inspiratie voor cadeaus die écht blijven hangen!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">30 Seconden</div>
                      <div className="text-xs opacity-80">Geen account nodig</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <GiftIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Persoonlijk</div>
                      <div className="text-xs opacity-80">Op maat gemaakt</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <StarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Direct Resultaat</div>
                      <div className="text-xs opacity-80">Cadeau ideeën</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <Button
                    variant="accent"
                    onClick={handleStart}
                    className="px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="w-6 h-6" />
                    Start de Quiz
                  </Button>
                  <button
                    onClick={() => navigateTo('giftFinder')}
                    className="text-white/90 hover:text-white font-semibold underline decoration-white/40 decoration-2 underline-offset-4 transition-all duration-300"
                  >
                    Liever direct zoeken?
                  </button>
                </div>
              </div>

              <div className="max-w-md mx-auto md:max-w-full">
                <div className="aspect-square rounded-3xl bg-white/10 backdrop-blur-sm shadow-2xl ring-4 ring-white/20 p-6 md:p-8 flex items-center justify-center">
                  <QuizIllustration className="drop-shadow-2xl w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (step === 'question') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Progress Section */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-primary">
                      Vraag {currentQuestionIndex + 1} van {quizQuestions.length}
                    </p>
                    <p className="text-sm text-gray-600">Beantwoord om door te gaan</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Voltooid</div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {quizQuestions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index <= currentQuestionIndex
                          ? 'bg-gradient-to-r from-primary to-accent scale-110'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6">
                <span className="text-2xl font-bold">{currentQuestionIndex + 1}</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight">
                {currentQuestion.text}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Kies het antwoord dat het beste bij je past
              </p>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer.resultKey)}
                  className="group w-full text-left p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl hover:from-primary/5 hover:to-accent/5 hover:border-primary/40 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300 text-primary font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                      {index + 1}
                    </div>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors leading-relaxed">
                      {answer.text}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRightIcon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Klik op een antwoord om door te gaan naar de volgende vraag
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    const relatedBlogs = result.relatedBlogSlugs
      .map(slug => blogPosts.find(p => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
        {/* Hero Result Section */}
        <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-8">
                <GiftIcon className="w-12 h-12 text-white" />
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Jouw Resultaat</span>
                </div>
                <h1 className="typo-h1 mb-6 leading-tight text-white">{result.title}</h1>
                <p className="typo-lead text-white/90 max-w-3xl mx-auto">{result.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="accent"
                  onClick={() => navigateTo('giftFinder', { interests: result.recommendedInterests })}
                  className="px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <GiftIcon className="w-6 h-6" />
                  Bekijk Cadeau-ideeën
                </Button>
                <button
                  onClick={handleRestart}
                  className="text-white/90 hover:text-white font-semibold underline decoration-white/40 decoration-2 underline-offset-4 transition-all duration-300 flex items-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Doe de quiz opnieuw
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Blogs Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6">
                <StarIcon className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                Aanbevolen Gidsen voor Jou
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ontdek meer over cadeau ideeën die perfect passen bij jouw persoonlijkheid
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {relatedBlogs.map(post => (
                <div
                  key={post.slug}
                  className="group bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-display text-xl font-bold text-primary group-hover:text-blue-600 transition-colors leading-tight mb-3">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>Gerelateerd artikel</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:text-blue-600 transition-colors">
                        <span>Lees meer</span>
                        <ChevronRightIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-3xl p-8 md:p-12 border border-secondary/20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-lg">
                  <GiftIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-4">
                  Klaar voor het perfecte cadeau?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Gebruik je nieuwe inzichten om het ideale cadeau te vinden met onze AI GiftFinder
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigateTo('giftFinder', { interests: result.recommendedInterests })}
                  className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Start met zoeken
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizPage;
