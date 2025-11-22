<template>
    <div class="home-container">
      <HeaderBar />
  
      <!-- ① 顶部大轮播 -->
      <section class="top-carousel" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
        <div
          class="carousel-track"
          :style="{ transform: 'translateX(' + -currentSlide * 100 + '%)' }"
        >
          <div
            v-for="(color, index) in carouselColors"
            :key="index"
            class="carousel-item"
            :style="{ background: color }"
          >
            <div class="carousel-item-content">
              <span class="carousel-color-label">轮播图 {{ index + 1 }}</span>
            </div>
          </div>
        </div>
  
        <div class="carousel-dots">
          <span
            v-for="(color, index) in carouselColors"
            :key="index"
            class="dot"
            :class="{ active: index === currentSlide }"
            @click="goSlide(index)"
          ></span>
        </div>
      </section>
  
      <!-- ② 两行十个小字类别 -->
      <section class="top-category-section">
        <div class="category-grid">
          <div
            v-for="item in topCategories"
            :key="item"
            class="category-item"
          >
            {{ item }}
          </div>
        </div>
      </section>
  
      <!-- ③ 每个类别的区块列表 -->
      <section class="category-block-section">
        <div
          v-for="cat in blockCategories"
          :key="cat"
          class="category-block"
        >
          <!-- 左侧竖排标题 -->
          <div class="block-left">
            <div class="left-text">
              <span>{{ cat }}</span>
            </div>
          </div>
  
          <!-- 右侧书籍横向排布 -->
          <div class="block-right">
            <div
              v-for="i in 4"
              :key="i"
              class="block-book"
            >
              <!-- TODO: 这里将来替换真实封面图片 -->
              <div class="block-book-img"></div>
              <div class="block-book-title">书名占位</div>
            </div>
  
            <button class="block-more-btn">
              ＞
            </button>
          </div>
        </div>
      </section>
  
      <!-- ④ Footer -->
      <footer class="footer">
        <div class="footer-top-line"></div>
        <div class="footer-links">
          <span v-for="(item, idx) in footerLinks" :key="item">
            {{ item }}
            <span v-if="idx !== footerLinks.length - 1" class="divider">|</span>
          </span>
        </div>
        <div class="footer-copy">
          Copyright © 2025 GreenBook 书城 | 苏ICP备xxxx号 | 公安网安备 xxxxx 号
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import HeaderBar from "../components/HeaderBar.vue";
  
  /** 顶部大轮播颜色占位 - 使用不同颜色的色块 **/
  const carouselColors = ["#ffd4c4", "#c7e7ff", "#ffe9a7", "#d6ffd6", "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9"];
  const currentSlide = ref(0);
  let timer: number | undefined;
  
  const startAutoPlay = () => {
    if (timer !== undefined) return;
    timer = window.setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % carouselColors.length;
    }, 4000);
  };
  
  const stopAutoPlay = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  
  const goSlide = (index: number) => {
    currentSlide.value = index;
  };
  
  /** 分类：两行 10 个 **/
  const topCategories = [
    "文学小说",
    "人文社科",
    "科技科普",
    "少儿读物",
    "青春漫画",
    "经管励志",
    "外文原版",
    "考试教材",
    "生活美学",
    "更多分类"
  ];
  
  /** 区块展示的类别 - 使用所有10个类别 **/
  const blockCategories = topCategories;
  
  /** Footer 链接 **/
  const footerLinks = ["新浪微博", "官方微信", "官方贴吧", "全球粉丝站", "简体中文"];
  
  onMounted(() => {
    startAutoPlay();
  });
  
  onBeforeUnmount(() => {
    stopAutoPlay();
  });
  </script>
  
  <style scoped>
  .home-container {
    width: 100%;
    min-height: 100vh;
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
  }
  
  /* 顶部大轮播 */
  .top-carousel {
    max-width: 1200px;
    height: 320px;
    margin: 20px auto 30px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    background: #eee;
  }
  
  .carousel-track {
    display: flex;
    width: 800%;
    height: 100%;
    transition: transform 0.6s ease;
  }
  
  .carousel-item {
    flex: 0 0 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .carousel-item-content {
    text-align: center;
  }
  
  .carousel-color-label {
    font-size: 24px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.3);
  }
  
  /* 轮播小圆点 */
  .carousel-dots {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid #fff;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }
  
  .dot.active {
    background: #ff7a00;
    border-color: #ff7a00;
  }
  
  /* 顶部两行十个分类 */
  .top-category-section {
    max-width: 1200px;
    margin: 0 auto 24px;
    padding: 0 20px;
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    row-gap: 8px;
    column-gap: 10px;
    font-size: 14px;
    color: #666;
  }
  
  .category-item {
    text-align: center;
    cursor: pointer;
  }
  
  /* 每个类别的区块列表 */
  .category-block-section {
    max-width: 1200px;
    margin: 0 auto 40px;
    padding: 0 20px;
  }
  
  .category-block {
    display: flex;
    background: #fff;
    border-radius: 14px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  }
  
  /* 左侧竖排标题 */
  .block-left {
    width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #f0f0f0;
  }
  
  .left-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 18px;
    letter-spacing: 4px;
    color: #333;
  }
  
  /* 右侧书籍部分 */
  .block-right {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 18px 20px;
  }
  
  .block-book {
    width: 140px;
    margin-right: 16px;
  }
  
  .block-book-img {
    width: 100%;
    height: 180px;
    background: #ddd; /* 封面占位 */
    border-radius: 10px;
  }
  
  .block-book-title {
    margin-top: 8px;
    font-size: 13px;
    color: #333;
  }
  
  /* 右箭头按钮 */
  .block-more-btn {
    margin-left: auto;
    border: none;
    background: transparent;
    font-size: 24px;
    cursor: pointer;
    color: #ff7a00;
  }
  
  /* Footer */
  .footer {
    margin-top: auto;
    padding: 30px 0 40px;
    background: #fafafa;
    font-size: 13px;
    color: #999;
    text-align: center;
  }
  
  .footer-top-line {
    border-top: 1px solid #e6e6e6;
    max-width: 1200px;
    margin: 0 auto 18px;
  }
  
  .footer-links {
    margin-bottom: 8px;
  }
  
  .footer-links .divider {
    margin: 0 10px;
    color: #ddd;
  }
  
  .footer-copy {
    color: #c0c0c0;
  }
  </style>
  