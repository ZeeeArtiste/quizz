// quiz-json-service.ts

import { readFileSync, writeFileSync } from 'fs';
import { QuizzService } from './quizz.service';
import { Quizz } from './quizz';

export class QuizJSONService implements QuizzService {
    private readonly quizJsonPath = './src/quizz/quizzes.json';

    constructor() { }

    add(title: string, questionIds: number[]): Quizz {
        const quizzes = this.getQuizzesFromJsonFile();
        const newQuizId = quizzes.length > 0 ? quizzes[quizzes.length - 1].id + 1 : 1;
        const newQuiz = new Quizz(newQuizId, title, questionIds);
        quizzes.push(newQuiz);
        writeFileSync(this.quizJsonPath, JSON.stringify(quizzes));
        return newQuiz;
    }


    getById(id: number): Quizz | null {
        const quizzes = this.getQuizzesFromJsonFile();
        return quizzes.find(quiz => quiz.id === id) || null;
    }

    getAllQuizzes(): Quizz[] {
        return this.getQuizzesFromJsonFile();
    }

    private getQuizzesFromJsonFile(): Quizz[] {
        const buffer = readFileSync(this.quizJsonPath);
        const quizzes = JSON.parse(buffer.toString()) as Quizz[];
        return quizzes;
    }
}
