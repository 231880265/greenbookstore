<template>
  <section class="breadcrumb-bar">
    <div class="breadcrumb-inner">
      <span class="crumb link" @click="router.push('/')">首页</span>
      <span class="sep">/</span>
      <template v-for="(item, index) in items" :key="index">
        <span v-if="item.path" class="crumb link" @click="router.push(item.path)">
          {{ item.label }}
        </span>
        <span v-else-if="item.slot" class="crumb-slot">
          <slot :name="item.slot" />
        </span>
        <span v-else class="crumb current">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="sep">/</span>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface BreadcrumbItem {
  label?: string
  path?: string
  slot?: string  // 用于插槽名称
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()

const router = useRouter()
</script>

<style scoped>
/* 面包屑 */
.breadcrumb-bar {
  border-bottom: 1px solid #eee;
  background: #fff;
}

.breadcrumb-inner {
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

.crumb {
  color: #666;
}

.crumb.link {
  cursor: pointer;
  color: #2d583f;
  transition: color 0.2s ease;
}

.crumb.link:hover {
  color: #1a3d2a;
}

.crumb.current {
  color: #999;
}

.sep {
  color: #ccc;
}

.crumb-slot {
  display: inline-flex;
  align-items: center;
}
</style>

