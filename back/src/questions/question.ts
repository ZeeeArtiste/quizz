import { Choice } from "./choice";

export class Question {
    constructor(
        public id: number,
        public question: string,
        public choices: Choice[],
        // public answer: number,
    ) { }
}
export { Choice };

