import type { Quizz } from '@/interface/Quizz';
import { ref } from 'vue';

// Utiliser ref pour gérer un état qui peut être null
let allQuizz = ref<Quizz[] | null>(null);

// Fonction pour mettre à jour allQuizz
const updateAllQuizz = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quizz/all`);
        if (!response.ok) {
            throw new Error("Problème lors de la récupération des quizz.");
        }
        const data = await response.json();
        allQuizz.value = data as Quizz[];
    } catch (error) {
        console.error("Erreur:", error);
        allQuizz.value = null;
    }
};

const deleteQuizz = (id: number) => {
    if (allQuizz.value)
        allQuizz.value = allQuizz.value.filter((quizz) => quizz.id !== id)
}

const addQuizz = (quizz: Quizz) => {
    if (!allQuizz.value) {
        allQuizz.value = []
    }
    allQuizz.value.push(quizz)
}

const updateQuizz = (updatedQuizz: Quizz) => {
    if (allQuizz.value)
        allQuizz.value = allQuizz.value.map((quizz) => { if (quizz.id == updatedQuizz.id) { return updatedQuizz } return quizz })

}

// Exporter
export default {
    allQuizz,
    updateAllQuizz,
    deleteQuizz,
    addQuizz,
    updateQuizz
};

// Appeler updateAllQuizz pour initialiser les données
updateAllQuizz();
