// quiz.service.ts

import { Quizz } from './quizz';

export interface QuizzService {
    add(title: string, questionIds: number[]): Quizz;
    getById(id: number): Quizz | null;
    getAllQuizzes(): Quizz[];
}
