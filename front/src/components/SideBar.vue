<script setup lang="ts">
import { toRefs } from "vue";
import { Menu, Plus, User, CloseBold } from "@element-plus/icons-vue";
import userStore from "@/store/userStore";
import quizzStore from "@/store/quizzStore";
import { logout } from "@/utils";

// const allQuizz = reactive<Quizz[]>([]);
const { email } = toRefs(userStore);
const { allQuizz } = toRefs(quizzStore);
const { userIsAuthenticed } = toRefs(userStore);
</script>

<template>
  <el-menu class="el-menu-vertical-demo">
    <div v-if="!!allQuizz && allQuizz.length > 0">
      <router-link
        v-for="(quizz, i) in allQuizz"
        :to="'/quizz/' + quizz.id"
        tag="button"
        :key="quizz.id">
        <el-menu-item :index="i.toString()">
          <el-icon><Menu /></el-icon>
          <span>{{ quizz.title }}</span>
        </el-menu-item>
      </router-link>
    </div>

    <div class="bottom">
      <router-link to="/creer-quizz">
        <el-menu-item :index="allQuizz?.length.toString()">
          <el-icon><Plus /></el-icon>
          <span>Créer un quizz</span>
        </el-menu-item>
      </router-link>
      <div v-if="userIsAuthenticed">
        <el-menu-item>
          <el-icon><User /></el-icon>
          <span>{{ email }}</span>
        </el-menu-item>
        <el-menu-item @click="logout($router)">
          <el-icon><CloseBold /></el-icon>
          <span>Se déconnecter</span>
        </el-menu-item>
      </div>
    </div>
  </el-menu>
</template>

<style scoped>
.bottom {
  width: 100%;
  position: absolute;
  bottom: 0;
}
</style>
