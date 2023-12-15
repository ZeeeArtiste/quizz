import { Choice, Question } from './question';

export interface QuestionService {
    add(question: string, choices: Choice[]): Promise<Question>;
    getById(id: number): Promise<Question | null>;
    getAllQuestions(): Promise<Question[]>
    update(id: number, updatedQuestion: string, updatedChoices: Choice[]): Promise<Question | null>;
    getQuestionIdsByQuizzId(id: number): Promise<number[] | null>
    delete(id: number): Promise<boolean>
}