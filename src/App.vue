<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Footer from './components/layout/Footer.vue'
import Header from './components/layout/Header.vue'

const route = useRoute()
const isWorkspace = computed(() => route.path.startsWith('/ws/'))
</script>

<template>
  <Header v-if="!isWorkspace" />
  <main>
    <router-view />
  </main>
  <Footer v-if="!isWorkspace" />
</template>

<style scoped>
</style>