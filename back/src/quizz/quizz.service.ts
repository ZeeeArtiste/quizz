// quiz.service.ts

import { Quizz } from './quizz';

export interface QuizzService {
    add(title: string, questionIds: number[]): Promise<Quizz>;
    getById(id: number): Promise<Quizz | null>;
    getAllQuizzes(): Promise<Quizz[]>;
    update(id: number, title: string, newQuestionsIds: number[]): Promise<Quizz | null>;
    delete(id: number): Promise<boolean>
}
