<script setup lang="ts">
import { ref } from "vue";
import type { User } from "@/interface/User";
import { notification } from "@/utils";
import { useRouter } from "vue-router";

const form = ref<User>({
  email: "",
  password: "",
});

const router = useRouter();

const submitForm = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/add-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.value),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    notification(
      "Enregistré avec succès",
      "Votre compte a été créé avec succès",
      "success"
    );
    router.push("/login");
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la requête:", error);
    notification("Un problème est survenue", error.message, "error");
  }
};
</script>

<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="E-mail">
      <el-input
        v-model="form.email"
        placeholder="Entrez votre email"></el-input>
    </el-form-item>
    <el-form-item label="Mot de passe">
      <el-input
        type="password"
        v-model="form.password"
        placeholder="Entrez votre mot de passe"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">Créer un compte</el-button>
    </el-form-item>
  </el-form>
</template>
