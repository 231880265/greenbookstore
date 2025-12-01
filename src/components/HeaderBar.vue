<template>
  <header class="header">
    <div class="header-inner">
      
      <!-- 左侧：Logo -->
      <div class="left">
        <img src="../assets/logo.svg" class="logo" alt="GreenBook logo" />
        <span class="logo-text">小绿书</span>
      </div>

      <!-- 中间：搜索栏 -->
      <div class="center">
        <div class="search-box">
          <input v-model="keyword" type="text" placeholder="搜索书名 / 作者" />
          <button class="search-btn">搜索</button>
        </div>
      </div>

      <!-- 右侧：功能图标 -->
      <div class="right">

        <!-- 去卖书 -->
        <div class="icon-wrapper" title="去卖书">
          <span class="icon">♻</span>
        </div>

        <!-- 我的订单 -->
        <div class="icon-wrapper" title="我的订单">
          <span class="icon">📦</span>
        </div>

        <!-- 购物车 -->
        <div class="icon-wrapper" title="购物车">
          <span class="icon">🛒</span>
        </div>

        <!-- 绿叶积分 -->
        <div class="leaf-wrapper" title="我的绿叶">
          <span class="leaf-icon">🍃</span>
          <span class="leaf-num">{{ leafCount }}</span>
        </div>

        <!-- 用户 -->
        <div class="icon-wrapper" title="个人中心">
          <span class="icon">👤</span>
        </div>

      </div>
    </div>
  </header>
</template>



<script setup>
import { ref } from "vue";

const keyword = ref("");
const leafCount = ref(12); // 模拟积分
</script>



<style scoped>
/* 整体 */
.header {
  background: #fff7e9;
  border-bottom: 1px solid #e2d5c0;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(6px);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
  align-items: center;
}
/* 左侧 Logo */
.left .logo {
  height: 34px;
  cursor: pointer;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #2d583f;
  margin-left: 10px;
}


/* 中间搜索框 */
.center {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #c8b196;
  border-radius: 999px;
  padding: 4px 10px;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 200px;
  background: transparent;
  color: #2d583f;
}

.search-btn {
  border: none;
  background: #c8b196;
  color: #ffffff;
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 12px;
  cursor: pointer;
}
.search-btn:hover {
  background: #b79f83;
}



/* 右侧图标区域 */
.right {
  display: flex;
  align-items: center;
  gap: 14px;
}


/* 单个 icon 包装 */
.icon-wrapper {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  transition: 0.2s;
}

.icon-wrapper:hover {
  background: #fff0da;
}

.icon {
  font-size: 15px;
}



/* 绿叶积分 */
.leaf-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: transparent;
  cursor: pointer;
}

.leaf-wrapper:hover {
  background: #fff0da;
}

.leaf-icon {
  font-size: 16px;
}

.leaf-num {
  font-size: 13px;
  color: #2d583f;
  margin-left: 4px;
  font-weight: 600;
}
</style>
