<script setup lang="ts">
import { RouterView } from "vue-router";
import SideBarVue from "./components/SideBar.vue";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <SideBarVue />
      </el-aside>
      <el-main> <RouterView /> </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.el-main {
  height: 100vh;
  overflow-y: auto;
}

.el-main::-webkit-scrollbar {
  display: none;
}
</style>
