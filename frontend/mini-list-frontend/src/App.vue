<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #fafafa;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .main-content {
    padding: 0 2rem;
  }
}
</style>
