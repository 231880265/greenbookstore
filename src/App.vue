<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue'
</script>

<template>
  <el-container direction="vertical">
    <HeaderBar />
    <router-view />
  </el-container>
</template>