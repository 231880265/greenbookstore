<template>
  <div class="home-container">
    <HeaderBar />

    <!-- ① 顶部大轮播（3 个板块 / 4 页） -->
    <section
      class="top-carousel"
      @mouseenter="stopAutoPlay"
      @mouseleave="startAutoPlay"
    >
      <div
        class="carousel-track"
        :style="{ transform: 'translateX(' + -currentSlide * 100 + '%)' }"
      >
        <div
          v-for="(slide, index) in carouselSlides"
          :key="slide.id"
          class="carousel-item"
          :style="{ background: slide.bg }"
        >
          <div class="carousel-item-content">
            <!-- 智能推荐类型 -->
            <div v-if="slide.type === 'recommend'" class="carousel-recommend">
              <div class="carousel-text">
                <h2 class="carousel-title">{{ slide.title }}</h2>
                <p class="carousel-subtitle">{{ slide.subtitle }}</p>
                <p class="carousel-quote">“{{ slide.quote }}”</p>
              </div>
              <div class="carousel-books">
                <div
                  v-for="book in slide.books"
                  :key="book.title"
                  class="carousel-book-card"
                >
                  <img :src="book.image" :alt="book.title" />
                  <div class="book-name">{{ book.title }}</div>
                </div>
              </div>
            </div>

            <!-- 文案介绍类型（理念 / 绿叶） -->
            <div v-else class="carousel-text-block">
              <h2 class="carousel-title">{{ slide.title }}</h2>
              <p
                v-for="(para, i) in slide.paragraphs"
                :key="i"
                class="carousel-paragraph"
              >
                {{ para }}
              </p>

              <ul v-if="slide.bullets" class="carousel-bullets">
                <li v-for="(b, i) in slide.bullets" :key="i">{{ b }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 轮播小圆点 -->
      <div class="carousel-dots">
        <span
          v-for="(_, index) in carouselSlides"
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
            v-for="(book, index) in books"
            :key="index"
            class="block-book"
          >
            <img :src="book.image" :alt="book.title" class="block-book-img" />
            <div class="block-book-title">{{ book.title }}</div>
          </div>

          <button class="block-more-btn">＞</button>
        </div>
      </div>
    </section>

    <!-- ④ Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import HeaderBar from "../components/HeaderBar.vue";
import Footer from "../components/Footer.vue";
import book1Img from "../assets/book1.webp";
import book2Img from "../assets/book2.webp";
import book3Img from "../assets/book3.webp";
import book4Img from "../assets/book4.webp";

/** 轮播图数据结构 */
type CarouselBook = {
  title: string;
  image: string;
};

type RecommendSlide = {
  id: string;
  type: "recommend";
  bg: string;
  title: string;
  subtitle: string;
  quote: string;
  books: CarouselBook[];
};

type TextSlide = {
  id: string;
  type: "concept" | "leaf";
  bg: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type CarouselSlide = RecommendSlide | TextSlide;

/** 顶部大轮播 - 4 页（智能推荐 2 页 + 理念 1 页 + 小绿叶 1 页） */
const carouselSlides: CarouselSlide[] = [
  {
    id: "season-1",
    type: "recommend",
    bg: "linear-gradient(135deg, #fff7e9 0%, #f1d9b8 100%)",
    title: "立冬已过 · 手捧一册取暖",
    subtitle: "在冷一点的日子里，让纸张和故事替你保温。",
    quote: "孤舟蓑笠翁，独钓寒江雪。",
    books: [
      { title: "红楼梦", image: book1Img },
      { title: "西游记", image: book2Img },
      { title: "水浒传", image: book3Img }
    ]
  },
  {
    id: "season-2",
    type: "recommend",
    bg: "linear-gradient(135deg, #fdf3e6 0%, #d2e6d4 100%)",
    title: "期末季 · 给大脑也放个假",
    subtitle: "在高压之下，给自己留一小时安静阅读的时间。",
    quote: "愿你在疲惫的世界里，仍有书页为你翻开。",
    books: [
      { title: "三国演义", image: book4Img },
      { title: "西游记（插图版）", image: book2Img },
      { title: "红楼梦·精选本", image: book1Img }
    ]
  },
  {
    id: "concept-greenbook",
    type: "concept",
    bg: "linear-gradient(135deg, #f8fff4 0%, #d4e9d2 100%)",
    title: "什么是「小绿书」？",
    paragraphs: [
      "在数字阅读飞速发展的今天，纸质书依然有无法替代的温度与质感。",
      "「小绿书」只做一件事：让好书在读者之间继续流转，而不是在角落里落灰。",
      "我们专注二手书交易，为每一本闲置的书找到下一位读者，让阅读更轻、更环保。"
    ],
    bullets: [
      "只卖二手书：所有书籍都来自真实读者的转手与分享；",
      "让书再多读一次：用更低的价格换来更高的阅读价值；",
      "用循环代替浪费：让纸张、墨香和故事都多停留一会儿。"
    ]
  },
  {
    id: "leaf-intro",
    type: "leaf",
    bg: "linear-gradient(135deg, #fff7e9 0%, #e6f4e6 100%)",
    title: "「小绿叶」是什么？",
    paragraphs: [
      "小绿叶是「小绿书」的绿色积分，用来记录每一次与你书本相关的善意选择。",
      "无论是卖出闲置书，还是在平台上购入二手好书，你都会获得对应数量的小绿叶。"
    ],
    bullets: [
      "获取方式：成功卖出/购买二手书，即可获得小绿叶奖励；",
      "使用方式：小绿叶可以在结算时抵扣部分书款，让每一次阅读更划算；",
      "绿色计划：你也可以选择把小绿叶捐赠给平台，用于支持种树等环保项目，让书页之外也长出一片绿意。"
    ]
  }
];

const currentSlide = ref(0);
let timer: number | undefined;

const startAutoPlay = () => {
  if (timer !== undefined) return;
  timer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.length;
  }, 5000);
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

/** 书籍数据 - 四大名著系列（用于下方区块） **/
const books = [
  { title: "红楼梦", image: book1Img },
  { title: "西游记", image: book2Img },
  { title: "水浒传", image: book3Img },
  { title: "三国演义", image: book4Img }
];

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
  background: #fff0da;
  display: flex;
  flex-direction: column;
}

/* 顶部大轮播 */
.top-carousel {
  width: 100%;
  max-width: 1200px;
  height: 320px;
  margin: 20px auto 30px;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(45, 88, 63, 0.12);
  border-radius: 16px;
  border: 1px solid rgba(200, 177, 150, 0.6);
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s ease;
}

.carousel-item {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.carousel-item-content {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* 智能推荐布局：左文案右书籍 */
.carousel-recommend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 32px;
}

.carousel-text {
  max-width: 420px;
}

.carousel-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d583f;
  margin-bottom: 10px;
}

.carousel-subtitle {
  font-size: 14px;
  color: #4f5b52;
  margin-bottom: 12px;
}

.carousel-quote {
  font-size: 13px;
  color: #8a7b65;
  font-style: italic;
}

.carousel-books {
  display: flex;
  gap: 16px;
}

.carousel-book-card {
  width: 120px;
  text-align: center;
}

.carousel-book-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(200, 177, 150, 0.6);
  background: #fff0da;
}

.carousel-book-card .book-name {
  margin-top: 8px;
  font-size: 13px;
  color: #2d583f;
}

/* 文案型 slide（理念 / 绿叶） */
.carousel-text-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.carousel-paragraph {
  font-size: 14px;
  color: #4f5b52;
  line-height: 1.6;
}

.carousel-bullets {
  margin-top: 6px;
  padding-left: 18px;
  font-size: 13px;
  color: #4f5b52;
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
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.dot.active {
  background: #2d583f;
  border-color: #2d583f;
}

/* 顶部两行十个分类 */
.top-category-section {
  width: 100%;
  margin: 0 0 24px;
  padding: 0 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  row-gap: 8px;
  column-gap: 10px;
  font-size: 14px;
  color: #2d583f;
}

.category-item {
  text-align: center;
  cursor: pointer;
  transition: color 0.3s;
}

.category-item:hover {
  color: #c8b196;
}

/* 每个类别的区块列表 */
.category-block-section {
  width: 100%;
  margin: 0 0 40px;
  padding: 0 20px;
}

.category-block {
  display: flex;
  background: #ffffff;
  margin-right: 30px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(45, 88, 63, 0.08);
  border: 1px solid rgba(200, 177, 150, 0.3);
}

/* 左侧竖排标题 */
.block-left {
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #c8b196;
  background: rgba(200, 177, 150, 0.1);
}

.left-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 18px;
  letter-spacing: 4px;
  color: #2d583f;
  font-weight: 600;
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
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(200, 177, 150, 0.3);
  background: #fff0da;
}

.block-book-title {
  margin-top: 8px;
  font-size: 13px;
  color: #2d583f;
}

/* 右箭头按钮 */
.block-more-btn {
  margin-left: auto;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #c8b196;
  transition: color 0.3s;
}

.block-more-btn:hover {
  color: #2d583f;
}
</style>
