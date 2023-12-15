// quiz.controller.ts

import { Quizz } from './quizz';
import { QuizzService } from './quizz.service';
import { QuestionController } from '../questions/question.controller';

export class QuizzController {
    constructor(
        private quizzService: QuizzService,
        private questionController: QuestionController
    ) { }

    async createQuiz(data: any): Promise<Quizz> {
        const title = data.title;
        const questionsData = data.questions;

        const questionIds = [];
        for (const qData of questionsData) {
            const addedQuestion = await this.questionController.add(qData.question, qData.choices);
            questionIds.push(addedQuestion.id);
        }

        return this.add(title, questionIds);
    }

    async add(title: string, questions: number[]): Promise<Quizz> {
        return await this.quizzService.add(title, questions);
    }

    async getById(id: number): Promise<Quizz | null> {
        return await this.quizzService.getById(id);
    }

    async getAllQuizzes(): Promise<Quizz[]> {
        return await this.quizzService.getAllQuizzes();
    }

    async updateQuizz(id: number, data: any): Promise<Quizz | null> {
        const title = data.title;
        const questionsData = data.questions;
        const newQuestionsIds = [];
        const existingQuestionsIds = new Set(await this.questionController.getQuestionIdsByQuizzId(id));

        // Traiter chaque question fournie
        for (const qData of questionsData) {
            if (await this.questionController.getById(qData.id)) {
                await this.questionController.update(qData.id, qData.question, qData.choices);
                existingQuestionsIds.delete(qData.id); // Retirer des questions existantes si elles sont toujours utilisées
            } else {
                const addedQuestion = await this.questionController.add(qData.question, qData.choices);
                newQuestionsIds.push(addedQuestion.id);
            }
        }

        // Supprimer les questions qui ne sont plus dans le quiz
        for (const questionId of existingQuestionsIds) {
            await this.questionController.delete(questionId);
        }

        // Mettre à jour le quiz avec les nouvelles questions
        return this.update(id, title, newQuestionsIds);
    }


    async update(id: number, title: string, newQuestionsIds: number[]): Promise<Quizz | null> {
        return await this.quizzService.update(id, title, newQuestionsIds);
    }

    async deleteQuizz(id: number): Promise<boolean> {
        // Delete the quiz
        return await this.quizzService.delete(id);
    }
}
