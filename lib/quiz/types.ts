export type Starost = 'pionir' | 'mladinec' | 'pripravnik';
export type Field = 'ves_neves' | 'zgodovina' | 'vescine' | 'oznake' | 'prva_pomoc';

/** Shape of one entry in data/<field>.json. Readonly so mutation is a type error. */
export interface RawQuestion {
  readonly question: string;
  readonly correctAnswer: string;
  readonly wrongAnswers: readonly string[];
  readonly ages: readonly Starost[];
  readonly source?: string;
}

export type Pools = Readonly<Record<Field, readonly RawQuestion[]>>;

export type SectionId = 'drzi-ne-drzi' | 'prva-pomoc' | 'pozarna-preventiva';

export interface SectionConfig {
  readonly id: SectionId;
  readonly naslov: string;
  readonly podnaslov: string;
  readonly tip: 'trueFalse' | 'multipleChoice';
  /** A question qualifies if its `ages` intersects this list (union, not equality). */
  readonly starosti: readonly Starost[];
  readonly fields: readonly Field[];
  readonly count: number;
}

export interface TrueFalseQuestion {
  readonly kind: 'trueFalse';
  readonly key: string;
  readonly question: string;
  readonly correctAnswer: string;
  /** The candidate answer shown to the user - 50/50 the correct one or a wrong one. */
  readonly shownAnswer: string;
  readonly imageSrc: string | null;
}

export interface MultipleChoiceQuestion {
  readonly kind: 'multipleChoice';
  readonly key: string;
  readonly question: string;
  readonly correctAnswer: string;
  /** Shuffled; always contains correctAnswer. Length min(3, wrongAnswers.length + 1). */
  readonly answers: readonly string[];
  readonly imageSrc: string | null;
}

export type QuizQuestion = TrueFalseQuestion | MultipleChoiceQuestion;

export interface QuizSection {
  readonly id: SectionId;
  readonly naslov: string;
  readonly podnaslov: string;
  readonly tip: SectionConfig['tip'];
  readonly questions: readonly QuizQuestion[];
}

export interface QuizData {
  readonly sections: readonly QuizSection[];
}
