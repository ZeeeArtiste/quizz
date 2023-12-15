<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { Delete } from "@element-plus/icons-vue";
import router from "@/router";
import { useRoute } from "vue-router";
import quizzStore from "@/store/quizzStore";
import type { Quizz } from "@/interface/Quizz";
import { notification } from "@/utils";

const route = useRoute();

let quizId = ref<number | undefined>(parseInt(route.params.id as string));

const quizz = reactive<Quizz>({
  id: quizId.value,
  title: "",
  questions: [
    {
      question: "",
      choices: [{ label: "", isAnswer: true }],
    },
  ],
});

const correctAnswers = ref<number[][]>([]);

// Load quiz for editing
const loadQuiz = async () => {
  if (quizId.value) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/quizz/${quizId.value}`
    );
    const data = await response.json();
    if (data) {
      quizz.title = data.title;
      quizz.questions = data.questions;

      quizz.questions.forEach(
        (q, qIndex) =>
          (correctAnswers.value[qIndex] = q.choices.reduce(
            (acc: number[], obj, index) => {
              if (obj.isAnswer) {
                acc.push(index);
              }
              return acc;
            },
            []
          ))
      );
    } else {
      quizId.value = undefined;
      router.replace("/creer-quizz");
    }
  }
};

onMounted(() => {
  if (quizId.value) {
    loadQuiz();
  }
});

// const quizz = reactive({
//   title: "Mon premier quizz",
//   questions: [
//     {
//       question: "L'OM est il le meilleur club de France ?",
//       choices: [{ label: "OUI", isAnswer: true }],
//     },
//   ],
// });

const addQuestion = () => {
  const lastQuestion = quizz.questions[quizz.questions.length - 1];
  if (
    (lastQuestion &&
      lastQuestion.question &&
      lastQuestion.choices.every((c) => c.label)) ||
    lastQuestion == undefined
  ) {
    quizz.questions.push({
      question: "",
      choices: [{ label: "", isAnswer: false }],
    });
  } else {
    alert(
      "Remplissez la question précédente et tous ses choix avant d'en ajouter une nouvelle."
    );
  }
};

const addChoice = (questionIndex: number) => {
  const lastChoice = quizz.questions[questionIndex].choices.slice(-1)[0];
  if ((lastChoice && lastChoice.label) || lastChoice == undefined) {
    quizz.questions[questionIndex].choices.push({ label: "", isAnswer: false });
  } else {
    alert("Remplissez le choix précédent avant d'en ajouter un nouveau.");
  }
};

const isDisabledAddChoice = (questionIndex: number) => {
  const lastChoice = quizz.questions[questionIndex].choices.slice(-1)[0];
  return !((lastChoice && lastChoice.label) || lastChoice == undefined);
};

const isDisabledAddQuestion = () => {
  const lastQuestion = quizz.questions[quizz.questions.length - 1];
  return !(
    (lastQuestion &&
      lastQuestion.question &&
      lastQuestion.choices.every((c) => c.label)) ||
    lastQuestion == undefined
  );
};

const isDisabledSelect = () => {
  for (let index = 0; index < quizz.questions.length; index++) {
    if (correctAnswers.value[index].length == 0) {
      return true;
    }
  }
  return false;
};

const deleteQuestion = (questionIndex: number) => {
  quizz.questions.length !== 0;
  quizz.questions.splice(questionIndex, 1);
};

const deleteChoice = (questionIndex: number, choiceIndex: number) => {
  quizz.questions[questionIndex].choices.splice(choiceIndex, 1);
};

const setCorrectAnswer = (questionIndex: number) => {
  quizz.questions[questionIndex].choices.forEach((choice, index) => {
    choice.isAnswer = correctAnswers.value[questionIndex].includes(index);
  });
};

const formIsValid = () => {
  return !isDisabledSelect() && !isDisabledAddQuestion();
};

const submitForm = async () => {
  quizz.questions.forEach((_, index) => setCorrectAnswer(index));
  const method = quizId.value ? "PUT" : "POST";
  const endpoint = quizId.value
    ? `${import.meta.env.VITE_API_URL}/api/quizz/update/${quizId.value}`
    : `${import.meta.env.VITE_API_URL}/api/quizz/add-quizz`;

  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizz),
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    quizId.value ? quizzStore.updateQuizz(data) : quizzStore.addQuizz(data);
    notification(
      `${quizId.value ? "Mise à jour" : "Créé"} avec succès`,
      `${
        quizId.value ? "Mise à jour" : "Création"
      } du quizz réalisé avec succès`,
      "success"
    );
    router.replace(`/quizz/${data.id}`);
  } catch (error: any) {
    console.error("Erreur:", error);
    notification("Un problème est survenue", error.message, "error");
  }
};
</script>

<template>
  <div class="quizz-form">
    <el-form :model="quizz" label-width="120px">
      <!-- Titre du quizz -->
      <el-form-item label="Titre du quizz:" class="m-5">
        <el-input
          v-model="quizz.title"
          placeholder="Entrez le titre du quizz" />
      </el-form-item>

      <!-- Liste des questions -->
      <el-row :gutter="20">
        <el-col
          class="mb-5"
          :xs="24"
          :lg="12"
          v-for="(question, qIndex) in quizz.questions"
          :key="qIndex">
          <el-card>
            <template #header>
              <div class="card-header">
                <el-form-item label="Question:">
                  <el-input
                    v-model="question.question"
                    placeholder="Entrez la question" />
                </el-form-item>
                <el-button
                  class="ms-2"
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="deleteQuestion(qIndex)" />
              </div>
            </template>
            <!-- Liste des choix -->
            <el-row :gutter="20">
              <div v-for="(choice, cIndex) in question.choices" :key="cIndex">
                <div class="item">
                  <el-form-item :label="'Choix ' + (cIndex + 1)">
                    <el-input
                      v-model="choice.label"
                      placeholder="Entrez le choix" />
                  </el-form-item>
                  <el-button
                    class="ms-2"
                    type="danger"
                    :icon="Delete"
                    circle
                    @click="deleteChoice(qIndex, cIndex)" />
                </div>
              </div>
            </el-row>

            <!-- Bouton pour ajouter un choix -->
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="
                isDisabledAddChoice(qIndex)
                  ? 'Remplissez le choix précédent avant.'
                  : 'Ajouter un choix.'
              "
              placement="left-start">
              <el-button
                :disabled="isDisabledAddChoice(qIndex)"
                class="m-5"
                @click="addChoice(qIndex)"
                round
                type="primary">
                Ajouter un choix
              </el-button>
            </el-tooltip>
            <!-- Sélection de la réponse correcte -->

            <el-select
              v-model="correctAnswers[qIndex]"
              multiple
              placeholder="Sélectionnez la ou les bonne(s) réponse(s)">
              <el-option
                v-for="(choice, cIndex) in question.choices"
                :key="cIndex"
                :label="choice.label"
                :value="cIndex" />
            </el-select>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
    <el-row>
      <!-- Bouton pour ajouter une question -->
      <el-tooltip
        class="box-item"
        effect="dark"
        :content="
          isDisabledAddQuestion()
            ? 'Remplissez la question précédente et tous ses choix avant.'
            : 'Ajouter une question.'
        "
        placement="left-start">
        <el-button
          size="large"
          @click="addQuestion"
          round
          type="primary"
          :disabled="isDisabledAddQuestion()">
          Ajouter une question
        </el-button>
      </el-tooltip>
      <!-- Bouton de soumission du formulaire -->

      <el-tooltip
        class="box-item"
        effect="dark"
        :content="
          formIsValid()
            ? 'Enregistrer le quizz.'
            : 'Remplissez toutes les données.'
        "
        placement="right-start">
        <el-button
          size="large"
          type="success"
          round
          @click="submitForm"
          :disabled="!formIsValid()">
          Enregistrer le quiz
        </el-button>
      </el-tooltip>
    </el-row>
  </div>
</template>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quizz-form {
  width: 100%;
}

.item {
  display: flex;
  justify-content: start;
}
</style>
