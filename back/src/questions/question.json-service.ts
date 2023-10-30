import { readFileSync, writeFileSync } from 'fs';
import { Question } from './question';
import { QuestionService } from './question.service';


export class QuestionJSONService implements QuestionService {

    private readonly questionJsonPath = './src/questions/questions.json';


    constructor() {

    }

    add(question: string, choices: string[], answer: number): Question {

        const questions = this.getQuestionsFromJsonFile();
        const newquestionsId = questions.length > 0 ? questions[questions.length - 1].id + 1 : 1;
        const newQuestion = new Question(newquestionsId, question, choices, answer);
        questions.push(newQuestion)
        writeFileSync(this.questionJsonPath, JSON.stringify(questions));
        return newQuestion
    }

    getById(id: number): Question | null {
        return null
    }

    getAllQuestions(): Question[] {
        return this.getQuestionsFromJsonFile()
    }

    private getQuestionsFromJsonFile(): Question[] {
        const buffer = readFileSync(this.questionJsonPath);
        const questions = JSON.parse(buffer.toString()) as Question[];
        return questions;
    }

}
