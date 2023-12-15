import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Quizz } from './quizz';
import { Question } from '../questions/question';
import { Choice } from '../questions/choice';

export class QuizzDBService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async add(title: string, questionIds: number[]): Promise<Quizz> {
        // Insérer un nouveau quizz et récupérer l'ID
        const [result] = await this.pool.query<ResultSetHeader>(
            'INSERT INTO Quizz (title) VALUES (?)',
            [title]
        );
        const newQuizId = result.insertId;

        // Insérer des relations dans la table QuizzQuestions
        for (const questionId of questionIds) {
            await this.pool.query(
                'INSERT INTO QuizzQuestions (quizzId, questionId) VALUES (?, ?)',
                [newQuizId, questionId]
            );
        }

        // Construire et retourner l'objet Quizz
        return new Quizz(newQuizId, title, questionIds);
    }

    async getById(id: number): Promise<Quizz | null> {
        // Récupération des informations du quiz
        const [quizzes] = await this.pool.query<RowDataPacket[]>(
            'SELECT * FROM Quizz WHERE id = ?',
            [id]
        );

        if (quizzes.length === 0) {
            return null; // Si le quiz n'existe pas, retourner null
        }

        const quiz = quizzes[0];

        // Récupérer toutes les questions liées au quiz avec leurs choix
        const [questionsData] = await this.pool.query<RowDataPacket[]>(
            'SELECT q.id as questionId, q.question, c.id as choiceId, c.choiceText, c.isAnswer ' +
            'FROM QuizzQuestions qq ' +
            'JOIN questions q ON qq.questionId = q.id ' +
            'JOIN choices c ON q.id = c.questionId ' +
            'WHERE qq.quizzId = ?',
            [id]
        );

        // Regrouper les choix par question
        const questionsMap = new Map<number, Question>();
        questionsData.forEach(({ questionId, question, choiceId, choiceText, isAnswer }) => {
            let questionObj = questionsMap.get(questionId);
            if (!questionObj) {
                questionObj = new Question(questionId, question, []);
                questionsMap.set(questionId, questionObj);
            }
            let choice = new Choice(choiceId, choiceText, isAnswer);
            questionObj.choices.push(choice);
        });

        // Convertir la Map en un tableau de questions
        const questions = Array.from(questionsMap.values());

        // Construire et retourner l'objet Quizz avec les questions complètes
        return new Quizz(quiz.id, quiz.title, questions);
    }

    async getAllQuizzes(): Promise<Quizz[]> {
        // Sélectionner tous les quiz
        const [quizzes] = await this.pool.query<RowDataPacket[]>(
            'SELECT * FROM Quizz'
        );

        // Pour chaque quiz, récupérer les questions et les choix associés
        const quizzesWithQuestionsPromises = quizzes.map(async (quiz) => {
            // Récupérer toutes les questions liées au quiz avec leurs choix
            const [questionsData] = await this.pool.query<RowDataPacket[]>(
                'SELECT q.id as questionId, q.question ' +
                'FROM QuizzQuestions qq ' +
                'JOIN questions q ON qq.questionId = q.id ' +
                // 'JOIN choices c ON q.id = c.questionId ' +
                'WHERE qq.quizzId = ?',
                [quiz.id]
            );


            // Regrouper les choix par question
            const questionsMap = new Map<number, Question>();
            questionsData.forEach(({ questionId, question, choiceText, isAnswer }) => {
                let questionObj = questionsMap.get(questionId);
                if (!questionObj) {
                    questionObj = { id: questionId, question, choices: [] };
                    questionsMap.set(questionId, questionObj);
                }
                let choice = new Choice();
                choice.label = choiceText;
                choice.isAnswer = isAnswer;
                questionObj.choices.push(choice);
            });

            // Convertir la Map en un tableau de questions
            const questions = Array.from(questionsMap.values());

            // Construire et retourner l'objet Quizz avec les questions complètes
            return new Quizz(quiz.id, quiz.title, questions);
        });

        return Promise.all(quizzesWithQuestionsPromises);
    }

    async update(id: number, title: string, newQuestionsIds: number[]): Promise<Quizz | null> {
        // Update the quizz title
        const [result] = await this.pool.query<ResultSetHeader>(
            'UPDATE Quizz SET title = ? WHERE id = ?',
            [title, id]
        );

        // Insérer des relations dans la table QuizzQuestions
        for (const questionId of newQuestionsIds) {
            await this.pool.query(
                'INSERT INTO QuizzQuestions (quizzId, questionId) VALUES (?, ?)',
                [id, questionId]
            );
        }

        // Construire et retourner l'objet Quizz
        return new Quizz(id, title, newQuestionsIds);
    }

    async delete(id: number): Promise<boolean> {
        //Utilisation des transactions pour éviter de corrompre la bdd si une suppression échoue
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            // Delete associated choices
            await this.pool.query(`
                DELETE FROM choices WHERE questionId IN (
                    SELECT questionId FROM QuizzQuestions WHERE quizzId = ?
                )
            `, [id]);

            // Delete associated questions
            await this.pool.query(`
                DELETE FROM questions WHERE id IN (
                    SELECT questionId FROM QuizzQuestions WHERE quizzId = ?
                )
            `, [id]);

            // Delete from QuizzQuestions
            await this.pool.query('DELETE FROM QuizzQuestions WHERE quizzId = ?', [id]);

            // Delete the quiz
            await this.pool.query('DELETE FROM Quizz WHERE id = ?', [id]);

            await connection.commit();
            return true; // Si tout se passe bien
        } catch (error) {
            await connection.rollback(); // En cas d'erreur, annuler toutes les modifications
            throw error; // Propager l'erreur
        } finally {
            connection.release(); // Libérer la connexion dans tous les cas
        }
    }

}
