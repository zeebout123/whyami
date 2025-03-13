export interface Question {
  id: number;
  text: string;
  options: string[];
  part: 'A' | 'B';
  scoring: {
    type: 'sometimes_or_above' | 'often_or_above';
  };
}

export interface SubQuestion {
  id: 'work' | 'social' | 'home';
  text: string;
  options: string[];
}

export type AgeGroup = 'adult' | 'parent' | 'professional' | 'minor';

export interface PersonalInfo {
  fullName: string;
  email: string;
  region: 'england' | 'northern-ireland' | 'scotland' | 'wales' | 'rest-of-world';
  employmentStatus: 'employed' | 'self-employed' | 'not-working-disabled' | 'not-working-unemployed' | 'retired';
  dateOfBirth: string;
  gpName: string;
  gpAddress: string;
}

export interface ScreeningResult {
  answers: number[];
  subAnswers: SubAnswers;
  scorePartA: number;
  scorePartB: number;
  timestamp: string;
  outcomes: ADHDOutcomes;
}

export interface SubAnswers {
  work: number[];
  social: number[];
  home: number[];
}

export interface AnswerTracking {
  never: number[];
  rarely: number[];
  sometimes: number[];
  often: number[];
  veryOften: number[];
}

export interface PartBScoring {
  noPoints: number[];
  onePoint: number[];
  twoPoints: number[];
  threePoints: number[];
}

export interface ADHDOutcomes {
  likelihood: {
    score: number;
    interpretation: string;
  };
  types: {
    inattentive: {
      score: number;
      percentage: number;
    };
    hyperactive: {
      score: number;
      percentage: number;
    };
  };
  impact: {
    overall: {
      score: number;
      interpretation: string;
    };
    categories: {
      work: {
        score: number;
        interpretation: string;
      };
      social: {
        score: number;
        interpretation: string;
      };
      home: {
        score: number;
        interpretation: string;
      };
    };
  };
  answerTracking: AnswerTracking;
  partBScoring: PartBScoring;
}