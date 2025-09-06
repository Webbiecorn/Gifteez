
import React, { useState } from 'react';
import { NavigateTo, QuizResult } from '../types';
import { quizQuestions, quizResults } from '../data/quizData';
import { blogPosts } from '../data/blogData';
import Button from './Button';
import { GiftIcon } from './IconComponents';
import ImageWithFallback from './ImageWithFallback';

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">De Cadeau Persoonlijkheid Quiz</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          Weet je niet zeker wat je moet kopen? Beantwoord 3 korte vragen en ontdek welk type cadeau perfect past bij de persoon die jij wilt verrassen.
        </p>
        <div className="mt-8">
          <Button variant="accent" onClick={handleStart}>Start de Quiz</Button>
        </div>
      </div>
    );
  }

  if (step === 'question') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <div className="mb-8">
            <p className="font-bold text-primary mb-2">Vraag {currentQuestionIndex + 1} van {quizQuestions.length}</p>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-8">{currentQuestion.text}</h2>
          <div className="space-y-4">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer.resultKey)}
                className="w-full text-left p-4 bg-light-bg border border-gray-200 rounded-lg hover:bg-secondary hover:border-primary transition-colors font-semibold"
              >
                {answer.text}
              </button>
            ))}
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
      <div className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-2xl">
                <GiftIcon className="w-16 h-16 mx-auto text-accent"/>
                <h2 className="font-serif-italic text-lg text-gray-600 mt-4">Jouw resultaat is...</h2>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mt-2">{result.title}</h1>
                <p className="mt-4 text-lg text-gray-700">{result.description}</p>
                <div className="mt-8">
                <Button 
                    variant="accent" 
                    onClick={() => navigateTo('giftFinder', { interests: result.recommendedInterests })}
                >
                    Bekijk Cadeau-ideeën
                </Button>
                </div>

                <div className="mt-12 text-left">
                    <h3 className="font-display text-xl font-bold text-primary mb-4">Lees ook deze gidsen:</h3>
                    <div className="space-y-4">
                        {relatedBlogs.map(post => (
                             <div 
                                key={post.slug} 
                                className="flex items-center gap-4 p-3 bg-light-bg rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                            >
                                <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-20 h-20 object-cover rounded-md" />
                                <div>
                                    <h4 className="font-bold text-primary">{post.title}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12">
                    <button onClick={handleRestart} className="font-bold text-primary hover:underline">
                        Doe de quiz opnieuw
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizPage;
