export function capitalizeEachWord(text: string) {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function separateLettersAndNumbers(text: string) {
    return text.replace(/([a-zA-Z])(\d)/g, '$1 $2');
}

export function getMultiRange(q: Question) {
  const match = q.question.match(/^(\d+)[–-](\d+)/);
  if (match) {
    const from = parseInt(match[1], 10);
    const to = parseInt(match[2], 10);
    return { from, to };
  }
  if (Array.isArray(q.answers)) {
    return { from: q.number, to: q.number + q.answers.length - 1 };
  }
  return { from: q.number, to: q.number };
}

export interface Question {
    number: number;
    question: string;
    answers?: string[];
    options?: string[];
    type?: QuestionType;
}

export type QuestionType = 'TFNG' | 'FILL' | 'MCQ' | 'MULTI' | 'FILL_BLANKS' | 'MATCH_TABLE' | 'DRAG_DROP' | 'MATCHING_HEADER';

