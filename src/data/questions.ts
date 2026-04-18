import { module1Questions } from './module1';
import { module2Questions } from './module2';
import { module3Questions } from './module3';
import { module4Questions } from './module4';
import { module5Questions } from './module5';
import { module6Questions } from './module6';

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const questions: Question[] = [
  ...module1Questions,
  ...module2Questions,
  ...module3Questions,
  ...module4Questions,
  ...module5Questions,
  ...module6Questions
];
