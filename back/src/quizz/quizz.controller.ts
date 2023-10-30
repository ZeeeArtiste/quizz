// quiz.controller.ts

import { Quizz } from './quizz';
import { QuizzService } from './quizz.service';
import { QuestionController } from '../questions/question.controller';

export class QuizzController {
    constructor(
        private quizzService: QuizzService,
        private questionController: QuestionController
    ) { }

    createQuiz(data: any): Quizz {
        const title = data.title;
        const questionsData = data.questions;

        const questionIds = [];
        for (const qData of questionsData) {
            const addedQuestion = this.questionController.add(qData.question, qData.choices, qData.answer);
            questionIds.push(addedQuestion.id);
        }

        return this.add(title, questionIds);
    }

    add(title: string, questions: number[]): Quizz {
        return this.quizzService.add(title, questions);
    }

    getById(id: number): Quizz | null {
        return this.quizzService.getById(id);
    }

    getAllQuizzes(): Quizz[] {
        return this.quizzService.getAllQuizzes();
    }
}
