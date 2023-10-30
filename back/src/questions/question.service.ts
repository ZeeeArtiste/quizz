import { Question } from './question';

export interface QuestionService {
    add(question: string, choices:string[], answer:number): Question;
    getById(id: number): Question | null;
    getAllQuestions():Question[]
}