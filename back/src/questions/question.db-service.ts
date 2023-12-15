import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Question, Choice } from './question';
import { QuestionService } from './question.service';

export class QuestionDBService implements QuestionService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async add(questionText: string, choices: Choice[]): Promise<Question> {
        // Insérer une nouvelle question et récupérer son ID
        const [questionResult] = await this.pool.query<ResultSetHeader>(
            'INSERT INTO questions (question) VALUES (?)',
            [questionText]
        );
        const newQuestionId = questionResult.insertId;

        // Insérer les choix liés à cette question
        const choicesObjects: Choice[] = await Promise.all(choices.map(async (choice, index) => {
            const [choiceResult] = await this.pool.query<ResultSetHeader>(
                'INSERT INTO choices (questionId, choiceText, isAnswer) VALUES (?, ?, ?)',
                [newQuestionId, choice.label, choice.isAnswer]
            );
            const newChoiceId = choiceResult.insertId;
            return new Choice(newChoiceId, choice.label, choice.isAnswer);
        }));

        // Créer l'objet Question avec les choix
        return new Question(newQuestionId, questionText, choicesObjects);
    }

    async getById(id: number): Promise<Question | null> {
        // Sélectionner la question
        const [questions] = await this.pool.query<RowDataPacket[]>(
            'SELECT * FROM questions WHERE id = ?',
            [id]
        );

        if (questions.length === 0) {
            return null;
        }

        const question = questions[0];

        // Sélectionner les choix pour cette question
        const [choices] = await this.pool.query<RowDataPacket[]>(
            'SELECT id, choiceText, isAnswer FROM choices WHERE questionId = ? ORDER BY id',
            [id]
        );

        const choicesObjects = choices.map(c => ({ id: c.id, text: c.choiceText, isCorrect: c.isAnswer }));

        // Créer l'objet Question avec les choix
        return new Question(question.id, question.question, choicesObjects);
    }

    async getAllQuestions(): Promise<Question[]> {
        // Sélectionner toutes les questions
        const [questions] = await this.pool.query<RowDataPacket[]>('SELECT * FROM questions');

        // Pour chaque question, récupérer les choix
        const allQuestions: Question[] = await Promise.all(questions.map(async (question) => {
            const [choices] = await this.pool.query<RowDataPacket[]>(
                'SELECT id, choiceText, isAnswer FROM choices WHERE questionId = ? ORDER BY id',
                [question.id]
            );

            const choicesObjects = choices.map(c => ({ id: c.id, text: c.choiceText, isCorrect: c.isAnswer }));

            // Créer l'objet Question avec les choix
            return new Question(question.id, question.question, choicesObjects);
        }));

        return allQuestions;
    }

    async update(id: number, updatedText: string, updatedChoices: Choice[]): Promise<Question | null> {
        // Update the question text
        await this.pool.query(
            'UPDATE questions SET question = ? WHERE id = ?',
            [updatedText, id]
        );

        // Retrieve current choices for comparison
        const [existingChoices] = await this.pool.query<RowDataPacket[]>(
            'SELECT id FROM choices WHERE questionId = ?',
            [id]
        );



        const existingChoiceIds = new Set(existingChoices.map(c => c.id));

        // Update choices
        for (const choice of updatedChoices) {
            if (choice.id && existingChoiceIds.has(choice.id)) {
                // Update existing choice
                await this.pool.query(
                    'UPDATE choices SET choiceText = ?, isAnswer = ? WHERE id = ?',
                    [choice.label, choice.isAnswer, choice.id]
                );
                existingChoiceIds.delete(choice.id); // Remove from set to track choices that are no longer used
            } else if (!choice.id) {
                // Insert new choice
                await this.pool.query(
                    'INSERT INTO choices (questionId, choiceText, isAnswer) VALUES (?, ?, ?)',
                    [id, choice.label, choice.isAnswer]
                );
            }
        }

        // Delete choices that were removed
        for (const choiceId of existingChoiceIds) {
            await this.pool.query(
                'DELETE FROM choices WHERE id = ?',
                [choiceId]
            );
        }

        // Re-fetch the updated question
        return this.getById(id);
    }

    async getQuestionIdsByQuizzId(quizzId: number): Promise<number[]> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            'SELECT questionId FROM QuizzQuestions WHERE quizzId = ?',
            [quizzId]
        );

        const questionIds = rows.map(row => row.questionId);
        return questionIds;
    }

    async delete(id: number): Promise<boolean> {
        // Supprimer d'abord les choix associés à la question
        await this.pool.query(
            'DELETE FROM choices WHERE questionId = ?',
            [id]
        );

        // Ensuite, supprimer la question
        const [result] = await this.pool.query<ResultSetHeader>(
            'DELETE FROM questions WHERE id = ?',
            [id]
        );

        // Vérifier si une ligne a été affectée
        return result.affectedRows > 0;
    }

}
