import { Question } from './question';
import { QuestionService } from './question.service';

export class QuestionController {
    constructor(private questionService: QuestionService) {}

    add(question: string, choices:string[], answer:number): Question {
        // check
        return this.questionService.add(question, choices, answer);
    }

    getById(id: number): Question | null {
        // is the id a decimal ?
        // is the id a negative number ?
        // other checks...
        return this.questionService.getById(id);
    }

    getAllQuestions():Question[]{
        return this.questionService.getAllQuestions();
    }
}
