import React, { useState } from 'react';
import { Brain, ChevronRight, Send, CheckCircle2, BrainCircuit, Heart, FileText, AlertCircle, Activity, Home, Briefcase, Users } from 'lucide-react';
import { adhdQuestions } from './questions';
import { calculateADHDOutcomes } from './utils/outcomes';
import type { PersonalInfo, ScreeningResult, AgeGroup, SubQuestion } from './types';

const SUB_QUESTIONS: SubQuestion[] = [
  {
    id: 'work',
    text: '(If at all) **How much has this impacted your work/school life?**',
    options: ['No impact', 'Somewhat Difficult', 'Very Difficult', 'Extremely Difficult']
  },
  {
    id: 'social',
    text: '(If at all) **How much has this impacted your Social/Family/Love life?**',
    options: ['No impact', 'Somewhat Difficult', 'Very Difficult', 'Extremely Difficult']
  },
  {
    id: 'home',
    text: '(If at all) **How much has this impacted your ability to take care of things at home?**',
    options: ['No impact', 'Somewhat Difficult', 'Very Difficult', 'Extremely Difficult']
  }
];

function App() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [subAnswers, setSubAnswers] = useState<{ work: number[], social: number[], home: number[] }>({
    work: [],
    social: [],
    home: []
  });
  const [currentSubQuestion, setCurrentSubQuestion] = useState<number>(0);
  const [showingSubQuestions, setShowingSubQuestions] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    region: 'england',
    employmentStatus: 'employed',
    dateOfBirth: '',
    gpName: '',
    gpAddress: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [outcomes, setOutcomes] = useState<ScreeningResult['outcomes'] | null>(null);

  const partAQuestions = adhdQuestions.filter(q => q.part === 'A');
  const partBQuestions = adhdQuestions.filter(q => q.part === 'B');
  const isAgeVerification = currentStep === -1;
  const isPartA = currentStep >= 0 && currentStep < partAQuestions.length;
  const isPartAComplete = currentStep === partAQuestions.length;
  const isPartB = currentStep >= partAQuestions.length + 1 && currentStep < adhdQuestions.length + 1;
  const isBasicInfo = currentStep === adhdQuestions.length + 1;
  const isGPInfo = currentStep === adhdQuestions.length + 2;

  const handleAgeGroupSelect = (selected: AgeGroup) => {
    setAgeGroup(selected);
    if (selected === 'adult') {
      setCurrentStep(0);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerValue: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerValue;
    setAnswers(newAnswers);

    const question = adhdQuestions[questionIndex];
    const threshold = question.scoring.type === 'sometimes_or_above' ? 2 : 3;
    
    if (answerValue >= threshold) {
      setShowingSubQuestions(true);
      setCurrentSubQuestion(0);
    } else {
      proceedToNextQuestion();
    }
  };

  const handleSubAnswerSelect = (type: 'work' | 'social' | 'home', value: number) => {
    setSubAnswers(prev => ({
      ...prev,
      [type]: [...prev[type], value]
    }));

    if (currentSubQuestion < SUB_QUESTIONS.length - 1) {
      setCurrentSubQuestion(prev => prev + 1);
    } else {
      setShowingSubQuestions(false);
      setCurrentSubQuestion(0);
      proceedToNextQuestion();
    }
  };

  const proceedToNextQuestion = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateScore = (): ScreeningResult => {
    return {
      answers,
      subAnswers,
      scorePartA: 0,
      scorePartB: 0,
      timestamp: new Date().toISOString(),
      outcomes: calculateADHDOutcomes(answers, subAnswers)
    };
  };

  const handleSubmit = () => {
    const result = calculateScore();
    setOutcomes(result.outcomes);
    setSubmitted(true);
  };

  const renderProgressBar = (part: 'A' | 'B') => {
    const questions = part === 'A' ? partAQuestions : partBQuestions;
    const currentQuestionInPart = part === 'A' 
      ? currentStep 
      : currentStep - partAQuestions.length - 1;
    const progress = (currentQuestionInPart + 1) / questions.length * 100;

    return (
      <div className="h-2 bg-gray-200 rounded-full mt-2">
        <div 
          className="h-2 bg-gray-800 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const renderSubQuestions = () => {
    const currentQuestion = adhdQuestions[isPartB ? currentStep - 1 : currentStep];
    const subQuestion = SUB_QUESTIONS[currentSubQuestion];
    const [prefix, ...rest] = subQuestion.text.split('**');
    const mainText = rest.join('').replace(/\*\*/g, '');

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          <span className="font-normal">{prefix}</span>
          <span className="font-bold">{mainText}</span>
        </h3>
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-2">Topic Reminder:</p>
          <p className="text-gray-800">{currentQuestion.text}</p>
        </div>
        <div className="space-y-3">
          {subQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSubAnswerSelect(subQuestion.id, idx)}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                answers[currentStep] === idx 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAgeVerification = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Before we begin</h2>
        <p className="text-gray-600">Please select which option best describes you:</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => handleAgeGroupSelect('adult')}
          className="w-full p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          I am 18 or over
        </button>
        <button
          onClick={() => handleAgeGroupSelect('parent')}
          className="w-full p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          I am a parent, doing this for my child under 18
        </button>
        <button
          onClick={() => handleAgeGroupSelect('professional')}
          className="w-full p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          I am a teacher/other professional doing this for someone under 18
        </button>
        <button
          onClick={() => handleAgeGroupSelect('minor')}
          className="w-full p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          I am under 18 - doing this for myself
        </button>
      </div>
      {ageGroup && ageGroup !== 'adult' && (
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">We have other questionnaires more suitable for your situation.</p>
          <p className="text-gray-600">Links to appropriate questionnaires will be available soon.</p>
        </div>
      )}
    </div>
  );

  const renderPartAComplete = () => {
    const partAScore = answers.slice(0, 6).reduce((score, answer, index) => {
      const threshold = index >= 3 ? 3 : 2;
      return score + (answer >= threshold ? 1 : 0);
    }, 0);

    if (partAScore === 0) {
      return (
        <div className="text-center space-y-8">
          <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Thank You for Completing the Questionnaire</h2>
            <p className="text-gray-600">
              Based on your responses, your answers didn't show signs of ADHD. However, you might be interested in exploring other areas of neurodiversity and mental health.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-700">Other Available Questionnaires</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => console.log('Autism questionnaire')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BrainCircuit className="w-5 h-5" />
                <span>Autism Screening</span>
              </button>
              <button
                onClick={() => console.log('ACES questionnaire')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>ACES (Adverse Childhood Experiences)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Part A Complete!</h2>
        <p className="text-gray-600">
          Thank you for completing Part A of the questionnaire. Let's continue with Part B to get a complete assessment.
        </p>
        <button
          onClick={() => setCurrentStep(partAQuestions.length + 1)}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span>Continue to Part B</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderQuestion = () => {
    const question = adhdQuestions[isPartB ? currentStep - 1 : currentStep];
    const partTitle = `Part ${question.part}`;
    const isFirstQuestionOfPart = isPartB 
      ? currentStep === partAQuestions.length + 1
      : currentStep === 0;
    const currentPartQuestions = question.part === 'A' ? partAQuestions : partBQuestions;
    const questionNumberInPart = question.part === 'A' 
      ? currentStep + 1 
      : currentStep - partAQuestions.length;

    return (
      <div className="space-y-6">
        {isFirstQuestionOfPart && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{partTitle}</h2>
        )}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Question {questionNumberInPart} of {currentPartQuestions.length}
          </h3>
          {renderProgressBar(question.part)}
        </div>
        <p className="text-gray-700">{question.text}</p>
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(isPartB ? currentStep - 1 : currentStep, idx)}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                answers[isPartB ? currentStep - 1 : currentStep] === idx 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Thanks for completing the questionnaire!</h2>
        <p className="text-gray-600 mt-2">
          So we can provide you with the most accurate/valuable assistance/help options, please fill in:
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={personalInfo.fullName}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={personalInfo.email}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Where do you live?</label>
          <select
            name="region"
            value={personalInfo.region}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="england">England</option>
            <option value="northern-ireland">Northern Ireland</option>
            <option value="scotland">Scotland</option>
            <option value="wales">Wales</option>
            <option value="rest-of-world">Rest of World</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
          <select
            name="employmentStatus"
            value={personalInfo.employmentStatus}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            <option value="employed">Employed</option>
            <option value="self-employed">Self-employed</option>
            <option value="not-working-disabled">Not working (Disabled)</option>
            <option value="not-working-unemployed">Not working (Unemployed)</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGPInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Follow-up Diagnosis</h2>
        <p className="text-gray-600 mt-2">
          So we can send your results to your GP and help you get further diagnosis, please provide us with:
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={personalInfo.dateOfBirth}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GP Practice Name</label>
          <input
            type="text"
            name="gpName"
            value={personalInfo.gpName}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GP Practice Address</label>
          <textarea
            name="gpAddress"
            value={personalInfo.gpAddress}
            onChange={handlePersonalInfoChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderOutcomesReport = () => {
    if (!outcomes) return null;

    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">ADHD Assessment Report</h2>
          <p className="text-gray-600">Completed on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Overall Likelihood */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-gray-700" />
            <h3 className="text-xl font-semibold">ADHD Likelihood Assessment</h3>
          </div>
          <p className="text-gray-700">{outcomes.likelihood.interpretation}</p>
        </div>

        {/* ADHD Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-gray-700" />
            <h3 className="text-xl font-semibold">ADHD Type Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Inattentive Type</h4>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${outcomes.types.inattentive.percentage}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-600">Score: {outcomes.types.inattentive.score}/10</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Hyperactive Type</h4>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${outcomes.types.hyperactive.percentage}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-gray-600">Score: {outcomes.types.hyperactive.score}/14</p>
            </div>
          </div>
        </div>

        {/* Impact Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-gray-700" />
            <h3 className="text-xl font-semibold">Impact Assessment</h3>
          </div>
          <p className="text-gray-700 mb-4">{outcomes.impact.overall.interpretation}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Work Impact</h4>
              </div>
              <p className="text-sm text-gray-600">{outcomes.impact.categories.work.interpretation}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Social Impact</h4>
              </div>
              <p className="text-sm text-gray-600">{outcomes.impact.categories.social.interpretation}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Home Impact</h4>
              </div>
              <p className="text-sm text-gray-600">{outcomes.impact.categories.home.interpretation}</p>
            </div>
          </div>
        </div>

        {/* Answer Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Response Distribution</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Never</h4>
              <p className="text-gray-600">Questions: {outcomes.answerTracking.never.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Rarely</h4>
              <p className="text-gray-600">Questions: {outcomes.answerTracking.rarely.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Sometimes</h4>
              <p className="text-gray-600">Questions: {outcomes.answerTracking.sometimes.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Often</h4>
              <p className="text-gray-600">Questions: {outcomes.answerTracking.often.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Very Often</h4>
              <p className="text-gray-600">Questions: {outcomes.answerTracking.veryOften.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Part B Scoring */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Part B Scoring Analysis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">No Points (Never/Rarely)</h4>
              <p className="text-gray-600">Questions: {outcomes.partBScoring.noPoints.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">One Point (Sometimes)</h4>
              <p className="text-gray-600">Questions: {outcomes.partBScoring.onePoint.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Two Points (Often)</h4>
              <p className="text-gray-600">Questions: {outcomes.partBScoring.twoPoints.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Three Points (Very Often)</h4>
              <p className="text-gray-600">Questions: {outcomes.partBScoring.threePoints.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderThankYou = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
        <Send className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-800">Thank You</h2>
      <p className="text-gray-600">
        Your responses have been recorded. We will review your screening results and contact your GP practice.
        You should hear back from them within the next few weeks.
      </p>
      {renderOutcomesReport()}
    </div>
  );

  const canProceed = isBasicInfo ? (
    personalInfo.fullName && 
    personalInfo.email && 
    personalInfo.region && 
    personalInfo.employmentStatus
  ) : isGPInfo ? (
    personalInfo.dateOfBirth && 
    personalInfo.gpName && 
    personalInfo.gpAddress
  ) : answers[isPartB ? currentStep - 1 : currentStep] !== undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Brain className="w-8 h-8 text-gray-800" />
          <h1 className="text-2xl font-bold text-gray-800">ADHD Screening Questionnaire</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {!submitted ? (
            <>
              {isAgeVerification && renderAgeVerification()}
              {isPartA && !showingSubQuestions && renderQuestion()}
              {isPartA && showingSubQuestions && renderSubQuestions()}
              {isPartAComplete && renderPartAComplete()}
              {isPartB && !showingSubQuestions && renderQuestion()}
              {isPartB && showingSubQuestions && renderSubQuestions()}
              {isBasicInfo && renderBasicInfo()}
              {isGPInfo && renderGPInfo()}
              
              {!isPartAComplete && !isAgeVerification && !showingSubQuestions && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      if (isGPInfo && canProceed) {
                        handleSubmit();
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    disabled={!canProceed}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                      canProceed
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isGPInfo ? 'Submit' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            renderThankYou()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;