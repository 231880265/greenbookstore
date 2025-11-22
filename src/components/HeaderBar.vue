<template>
    <header class="header">
      <div class="header-inner">
        <!-- 左侧：logo + 我要卖书 -->
        <div class="left">
          <div class="logo">LOGO</div>
          <button class="sell-btn">我要卖书</button>
        </div>
  
        <!-- 右侧：搜索栏 + 图标 -->
        <div class="right">
          <div class="search-box">
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索书名 / 作者"
            />
            <button class="search-btn">搜索</button>
          </div>
  
          <button class="icon-btn" aria-label="购物车">
            <!-- TODO: 将来可以换成真正的购物车图标 -->
            🛒
          </button>
  
          <button class="icon-btn" aria-label="个人中心">
            <!-- TODO: 将来可以换成真正的用户头像图标 -->
            👤
          </button>
        </div>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  
  const keyword = ref("");
  // 之后可以在这里监听 keyword 或发起搜索
  </script>
  
  <style scoped lang="scss">
  .header {
    background: #ffffff;
    border-bottom: 1px solid #eee;
  }
  
  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  /* 左侧 */
  .left {
    display: flex;
    align-items: center;
    gap: 20px;
  
    .logo {
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 2px;
    }
  
    .sell-btn {
      border: none;
      padding: 8px 16px;
      border-radius: 999px;
      background: #ff7a00;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }
  }
  
  /* 右侧 */
  .right {
    display: flex;
    align-items: center;
    gap: 16px;
  
    .search-box {
      display: flex;
      align-items: center;
      border-radius: 999px;
      background: #f5f5f5;
      padding: 4px 6px 4px 14px;
  
      input {
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        min-width: 220px;
      }
  
      .search-btn {
        border: none;
        border-radius: 999px;
        padding: 6px 14px;
        background: #ff7a00;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
      }
    }
  
    .icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: none;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
    }
  }
  </style>
  