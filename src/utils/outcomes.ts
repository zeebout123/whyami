import type { ADHDOutcomes, SubAnswers, AnswerTracking, PartBScoring } from '../types';

const INATTENTIVE_QUESTIONS = [1, 2, 3, 4, 7, 8, 9, 10, 11, 14];
const HYPERACTIVE_QUESTIONS = [1, 2, 3, 4, 5, 6, 8, 12, 13, 14, 15, 16, 17, 18];

export function calculateADHDLikelihood(partAScore: number): string {
  if (partAScore === 0) {
    return "Questionnaire complete. You scored zero (0). Your answers didn't show signs of ADHD.";
  } else if (partAScore >= 1 && partAScore <= 3) {
    return `Your result ${partAScore} does not meet the formal criteria for high likelihood of ADHD. Your answers suggest you do experience some of the symptoms. We recommend you complete the rest of the questionnaire.`;
  } else {
    return `Your symptoms are highly consistent with ADHD. Your score ${partAScore} shows symptoms highly consistent with ADHD in adults, and further investigation is warranted.`;
  }
}

function getImpactInterpretation(score: number, maxScore: number): string {
  const ranges = [
    { max: maxScore * 0.2, text: "No or Minimal Impact: Little to no impact of symptoms on daily life." },
    { max: maxScore * 0.4, text: "Mild Impact: Symptoms have a modest impact on the patient's life." },
    { max: maxScore * 0.6, text: "Moderate Impact: Symptoms are affecting daily activities to a moderate degree." },
    { max: maxScore * 0.8, text: "Severe Impact: Symptoms significantly affect daily functioning." },
    { max: maxScore, text: "Very Severe Impact: Symptoms have a profound and pervasive impact on the patient's life." }
  ];

  for (const range of ranges) {
    if (score <= range.max) {
      return range.text;
    }
  }
  return ranges[ranges.length - 1].text;
}

function calculateImpactScores(subAnswers: SubAnswers) {
  const categoryScores = {
    work: subAnswers.work.reduce((sum, score) => sum + score, 0),
    social: subAnswers.social.reduce((sum, score) => sum + score, 0),
    home: subAnswers.home.reduce((sum, score) => sum + score, 0)
  };

  const totalScore = categoryScores.work + categoryScores.social + categoryScores.home;

  return {
    overall: {
      score: totalScore,
      interpretation: getImpactInterpretation(totalScore, 162)
    },
    categories: {
      work: {
        score: categoryScores.work,
        interpretation: getImpactInterpretation(categoryScores.work, 54)
      },
      social: {
        score: categoryScores.social,
        interpretation: getImpactInterpretation(categoryScores.social, 54)
      },
      home: {
        score: categoryScores.home,
        interpretation: getImpactInterpretation(categoryScores.home, 54)
      }
    }
  };
}

function calculateAnswerTracking(answers: number[]): AnswerTracking {
  const tracking: AnswerTracking = {
    never: [],
    rarely: [],
    sometimes: [],
    often: [],
    veryOften: []
  };

  answers.forEach((answer, index) => {
    const questionNumber = index + 1;
    switch (answer) {
      case 0:
        tracking.never.push(questionNumber);
        break;
      case 1:
        tracking.rarely.push(questionNumber);
        break;
      case 2:
        tracking.sometimes.push(questionNumber);
        break;
      case 3:
        tracking.often.push(questionNumber);
        break;
      case 4:
        tracking.veryOften.push(questionNumber);
        break;
    }
  });

  return tracking;
}

function calculatePartBScoring(answers: number[]): PartBScoring {
  const scoring: PartBScoring = {
    noPoints: [],
    onePoint: [],
    twoPoints: [],
    threePoints: []
  };

  // Part B questions start at index 6 (question 7)
  for (let i = 6; i < answers.length; i++) {
    const questionNumber = i + 1;
    const answer = answers[i];
    
    if (answer <= 1) {
      scoring.noPoints.push(questionNumber);
    } else if (answer === 2) {
      scoring.onePoint.push(questionNumber);
    } else if (answer === 3) {
      scoring.twoPoints.push(questionNumber);
    } else if (answer === 4) {
      scoring.threePoints.push(questionNumber);
    }
  }

  return scoring;
}

export function calculateADHDOutcomes(answers: number[], subAnswers: SubAnswers): ADHDOutcomes {
  // Calculate Part A score for ADHD likelihood
  const partAScore = answers.slice(0, 6).reduce((score, answer, index) => {
    const threshold = index >= 3 ? 3 : 2; // Questions 4-6 need "often" or above
    return score + (answer >= threshold ? 1 : 0);
  }, 0);

  // Calculate scores for each type
  const inattentiveScore = INATTENTIVE_QUESTIONS.reduce((score, questionId) => {
    const answer = answers[questionId - 1];
    const threshold = [4, 7, 8, 10, 11, 14].includes(questionId) ? 3 : 2;
    return score + (answer >= threshold ? 1 : 0);
  }, 0);

  const hyperactiveScore = HYPERACTIVE_QUESTIONS.reduce((score, questionId) => {
    const answer = answers[questionId - 1];
    const threshold = [4, 5, 6, 8, 13, 14, 17].includes(questionId) ? 3 : 2;
    return score + (answer >= threshold ? 1 : 0);
  }, 0);

  const impactScores = calculateImpactScores(subAnswers);
  const answerTracking = calculateAnswerTracking(answers);
  const partBScoring = calculatePartBScoring(answers);

  return {
    likelihood: {
      score: partAScore,
      interpretation: calculateADHDLikelihood(partAScore)
    },
    types: {
      inattentive: {
        score: inattentiveScore,
        percentage: (inattentiveScore / 10) * 100
      },
      hyperactive: {
        score: hyperactiveScore,
        percentage: (hyperactiveScore / 14) * 100
      }
    },
    impact: impactScores,
    answerTracking,
    partBScoring
  };
}