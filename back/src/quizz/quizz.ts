// quiz.ts

import { Question } from "../questions/question";

export class Quizz {
    constructor(
        public id: number,
        public title: string,
        public questions: number[] | Question[]
    ) { }
}
