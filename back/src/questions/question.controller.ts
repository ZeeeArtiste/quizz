import { Choice, Question } from './question';
import { QuestionService } from './question.service';

export class QuestionController {
    constructor(private questionService: QuestionService) { }

    async add(question: string, choices: Choice[]): Promise<Question> {
        return await this.questionService.add(question, choices);
    }

    async getById(id: number): Promise<Question | null> {
        return await this.questionService.getById(id);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionService.getAllQuestions();
    }

    async update(id: number, updatedQuestion: string, updatedChoices: Choice[]): Promise<Question | null> {
        return await this.questionService.update(id, updatedQuestion, updatedChoices);
    }

    async getQuestionIdsByQuizzId(id: number): Promise<number[] | null> {
        return await this.questionService.getQuestionIdsByQuizzId(id);
    }

    async delete(id: number): Promise<boolean> {
        return await this.questionService.delete(id);
    }
}
