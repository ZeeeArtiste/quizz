<script setup lang="ts">
import { reactive, onMounted, ref, type Ref, watch, inject, toRefs } from "vue";
import { useRoute } from "vue-router";
import type { Quizz } from "../interface/Quizz";
import { EditPen, Delete } from "@element-plus/icons-vue";
import router from "@/router";
import quizzStore from "@/store/quizzStore";
import { notification, isAuthenticated } from "@/utils";
import userStore from "@/store/userStore";

interface donesData {
  questionsIndexs: number[];
  count: number;
}

let quizz = reactive<Quizz>({
  id: undefined,
  title: "",
  questions: [],
});

const { userIsAuthenticed } = toRefs(userStore);

// Obtenez l'ID du quiz à partir de l'URL.
const route = useRoute();
const quizId = route.params.id;

// État réactif pour le quiz et les réponses de l'utilisateur.
const userAnswers: Ref<boolean[][]> = ref([]);
const showResult = ref(false);
const score = ref(0);
const percentage = ref(0);
const loading = ref(true);
const questionsDone = ref(<donesData>{
  questionsIndexs: [],
  count: 0,
});
const correctAnswersIndex: Ref<number[][]> = ref([]);

const resetState = () => {
  showResult.value = false;
  score.value = 0;
  percentage.value = 0;
  loading.value = true;
  questionsDone.value = { questionsIndexs: [], count: 0 };
};

// Fonction pour charger le quizz depuis le backend.
const fetchQuizz = async (quizId: string | string[] | undefined) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/quizz/${quizId}`
    );
    if (!response.ok) {
      throw new Error("Problème lors de la récupération du quizz.");
    }
    const data: Quizz = await response.json();
    Object.assign(quizz, data);
    userAnswers.value = quizz.questions.map((question) =>
      new Array(question.choices.length).fill(false)
    );

    correctAnswersIndex.value = quizz.questions.map((question) =>
      question.choices.reduce((acc: number[], choice, cIndex) => {
        if (choice.isAnswer) acc.push(cIndex);
        return acc;
      }, [])
    );

    if (quizz && quizz.questions.length > 0) loading.value = false;
  } catch (error) {
    console.error("Erreur:", error);
  }
};

const progress = (qIndex: number) => {
  if (!questionsDone.value.questionsIndexs.includes(qIndex)) {
    questionsDone.value.questionsIndexs.push(qIndex);
    questionsDone.value.count++;
  } else if (
    userAnswers.value[qIndex].every((bool: boolean) => bool == false)
  ) {
    questionsDone.value.count--;
    const index: number = questionsDone.value.questionsIndexs.findIndex(
      (index) => index == qIndex
    );
    questionsDone.value.questionsIndexs.splice(index, 1);
  }

  percentage.value = parseInt(
    ((questionsDone.value.count / quizz.questions.length) * 100).toFixed(1)
  );
};

watch(
  userAnswers,
  () => {
    showResult.value ? (showResult.value = false) : null;
    score.value = quizz.questions.reduce((acc, question, qIndex) => {
      const userResponse = userAnswers.value[qIndex];
      const correctResponse = correctAnswersIndex.value[qIndex];
      const isCorrect = userResponse.every(
        (val, i) => val === correctResponse.includes(i)
      );

      return acc + (isCorrect ? 1 : 0);
    }, 0);
  },
  { deep: true }
);

onMounted(async () => {
  if (quizId) {
    fetchQuizz(quizId);
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      resetState();
      fetchQuizz(newId);
    }
  }
);

const deleteQuizz = async () => {
  const method = "DELETE";
  const endpoint = `${import.meta.env.VITE_API_URL}/api/quizz/delete/${
    quizz.id
  }`;

  try {
    const response = await fetch(endpoint, {
      method: method,
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    quizzStore.deleteQuizz(quizz.id as number);
    notification(
      "Suppression réussie",
      "La suppression c'est super bien passée",
      "success"
    );
    router.replace(`/`);
  } catch (error: any) {
    notification("Un problème est survenue", error.message, "error");
    console.error("Erreur:", error);
  }
};
</script>

<template>
  <div class="w-full container" v-loading="loading">
    <h2 class="text-center">
      {{ quizz.title }}
    </h2>
    <div class="text-center m-5" v-if="quizId && userIsAuthenticed">
      <router-link :to="`/quizz/edit/${quizz.id}`">
        <el-button type="success" :icon="EditPen" circle />
      </router-link>
      <el-button
        class="ms-2"
        type="danger"
        :icon="Delete"
        circle
        @click="deleteQuizz()" />
    </div>
    <p v-else class="text-center">
      (Veuillez vous connecter afin de manager ce quizz)
    </p>
    <div class="center">
      <el-progress
        :width="170"
        type="dashboard"
        :status="percentage == 100 ? 'success' : null"
        :percentage="percentage" />
    </div>
    <div v-if="showResult" class="mb-5">
      <el-alert
        show-icon
        :closable="false"
        :title="'Votre score : ' + score + '/' + quizz.questions.length"
        :type="score >= quizz.questions.length / 2 ? 'success' : 'warning'"
        effect="dark" />
    </div>
    <el-form>
      <el-row :gutter="20" class="mb-5">
        <el-col
          class="mb-5"
          :xs="24"
          :lg="12"
          v-for="(question, qIndex) in quizz.questions"
          :key="question.id">
          <el-card>
            <template #header>
              <div>
                <el-form-item :label="(qIndex + 1).toString()">
                  {{ question.question }}</el-form-item
                >
              </div>
            </template>

            <div v-for="(choice, cIndex) in question.choices" :key="cIndex">
              <el-checkbox
                v-model="userAnswers[qIndex][cIndex]"
                @change="progress(qIndex)">
                {{ choice.label }}
              </el-checkbox>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-button round type="primary" @click="showResult = true" size="large"
        >Valider les réponses</el-button
      >
    </el-form>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}
.center {
  display: flex;
  justify-content: center;
  margin: 25px;
}
</style>
