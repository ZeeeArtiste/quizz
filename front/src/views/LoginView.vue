<script setup lang="ts">
import { ref } from "vue";
import type { User } from "@/interface/User";
import { useRoute, useRouter, type RouteLocationRaw } from "vue-router";
import emailStore from "@/store/userStore";
import { ElNotification } from "element-plus";
import { notification } from "../utils";

const route = useRoute();
const router = useRouter();

const loginForm = ref<Pick<User, "email" | "password">>({
  email: "",
  password: "",
});

const login = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm.value),
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    notification("Connexion réussie", "Vous êtes connecté", "success");
    emailStore.setAuth(data.email);
    const redirect = (route.query.redirect as string) || "/creer-quizz";
    router.push(redirect);
  } catch (error: any) {
    notification("Un problème est survenue", error.message, "error");
  }
};
</script>

<template>
  <el-form :model="loginForm" label-width="120px">
    <el-form-item label="E-mail">
      <el-input
        v-model="loginForm.email"
        placeholder="Entrez votre email"></el-input>
    </el-form-item>
    <el-form-item label="Mot de passe">
      <el-input
        type="password"
        v-model="loginForm.password"
        placeholder="Entrez votre mot de passe"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">Se connecter</el-button>
      <RouterLink to="/creer-compte" class="ms-2">
        <span>Créer un compte</span>
      </RouterLink>
    </el-form-item>
  </el-form>
</template>
