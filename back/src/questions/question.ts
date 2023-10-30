export class Question {
    constructor(
        public id: number,
        public question: string,
        public choices: string[],
        public answer: number,
    ) {}
}
