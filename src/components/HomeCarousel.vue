<template>
  <div class="carousel-container">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :loop="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }"
      :pagination="{
        clickable: true,
        bulletClass: 'swiper-pagination-bullet-custom',
        bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        dynamicBullets: false
      }"
      :navigation="{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom'
      }"
      class="carousel-swiper"
      @swiper="onSwiper"
    >
      <swiper-slide v-for="slide in carouselSlides" :key="slide.id">
        <!-- 推荐类型 slide -->
        <div v-if="slide.type === 'recommend'" class="slide slide-recommend" :style="{ background: slide.bg }">
          <div class="slide-content">
            <div class="left">
              <h2>{{ slide.title }}</h2>
              <p class="subtitle" v-if="slide.subtitle">{{ slide.subtitle }}</p>
              <ul v-if="slide.books && slide.books.length > 0">
                <li v-for="book in slide.books" :key="book.title">《{{ book.title }}》</li>
              </ul>
              <blockquote v-if="slide.quote">"{{ slide.quote }}"</blockquote>
            </div>
            <div class="right">
              <img 
                v-for="book in slide.books" 
                :key="book.title"
                :src="book.image" 
                :alt="book.title"
              />
            </div>
          </div>
        </div>

        <!-- 理念类型 slide -->
        <div v-else-if="slide.type === 'concept'" class="slide slide-concept" :style="{ background: slide.bg }">
          <div class="slide-content">
            <div class="text">
              <h2>{{ slide.title }}</h2>
              <p v-for="(para, index) in slide.paragraphs" :key="index">{{ para }}</p>
              <ul v-if="slide.bullets" class="bullets">
                <li v-for="(bullet, index) in slide.bullets" :key="index">{{ bullet }}</li>
              </ul>
            </div>
            <img v-if="slide.image" :src="slide.image" class="concept-img" />
          </div>
        </div>

        <!-- 小绿叶类型 slide -->
        <div v-else-if="slide.type === 'leaf'" class="slide slide-leaf" :style="{ background: slide.bg }">
          <div class="slide-content">
            <div class="text">
              <h2>{{ slide.title }}</h2>
              <p v-for="(para, index) in slide.paragraphs" :key="index">{{ para }}</p>
              <ul v-if="slide.bullets" class="bullets">
                <li v-for="(bullet, index) in slide.bullets" :key="index">{{ bullet }}</li>
              </ul>
              <blockquote v-if="slide.quote">"{{ slide.quote }}"</blockquote>
            </div>
            <div class="leaf-right">
              <img src="https://cdn-icons-png.flaticon.com/512/765/765766.png" class="leaf-icon" />
              <div class="leaf-value">你当前：128 小绿叶</div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <!-- 左右切换按钮 -->
    <button class="swiper-button-prev-custom carousel-btn prev-btn">
      <span class="leaf-icon-left">🌿</span>
    </button>
    <button class="swiper-button-next-custom carousel-btn next-btn">
      <span class="leaf-icon-right">🌿</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import book1Img from "@/assets/book1.webp";
import book2Img from "@/assets/book2.webp";
import book3Img from "@/assets/book3.webp";
import book4Img from "@/assets/book4.webp";
import logoImg from "@/assets/logo.svg";

// Swiper 模块
const modules = [Autoplay, Pagination, Navigation];

// 轮播图数据结构
type CarouselBook = {
  title: string;
  image: string;
};

type RecommendSlide = {
  id: string;
  type: "recommend";
  bg: string;
  tag?: string;
  title: string;
  subtitle?: string;
  quote?: string;
  books: CarouselBook[];
};

type TextSlide = {
  id: string;
  type: "concept" | "leaf";
  bg: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  image?: string;
  quote?: string;
};

type CarouselSlide = RecommendSlide | TextSlide;

// 轮播数据 - 使用 home.vue 中的文案
const carouselSlides: CarouselSlide[] = [
  {
    id: "season-1",
    type: "recommend",
    bg: "linear-gradient(135deg, #fff7e9 0%, #f1d9b8 100%)",
    tag: "立冬已过 · 手捧一册取暖",
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
    tag: "期末季 · 给大脑也放个假",
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
    ],
    image: logoImg
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

const swiperInstance = ref<any>(null);

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper;
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  max-width: 1200px;
  margin: 30px auto;
  position: relative;
  border-radius: 16px;
  border: 1px solid rgba(200, 177, 150, 0.4);
  box-shadow: 0 6px 20px rgba(0,0,0,.06);
  background: #fef9f0;
  height: 340px;
  overflow: hidden;
}

.carousel-swiper {
  width: 100%;
  height: 100%;
}

.carousel-swiper :deep(.swiper-slide) {
  height: 100%;
}

.slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* 推荐类型样式 */
.slide-recommend {
  background: linear-gradient(135deg, #fff7e9 0%, #f1d9b8 100%);
}

.slide-recommend .left {
  width: 45%;
}

.slide-recommend .tag {
  font-size: 14px;
  color: #2d583f;
  margin-bottom: 6px;
  font-weight: 500;
}

.slide-recommend h2 {
  font-size: 26px;
  color: #2d583f;
  margin-bottom: 10px;
  font-weight: 700;
}

.slide-recommend .subtitle {
  font-size: 14px;
  color: #4f5b52;
  margin-bottom: 12px;
}

.slide-recommend ul {
  line-height: 1.8;
  color: #2d583f;
  margin: 12px 0;
  padding-left: 20px;
}

.slide-recommend ul li {
  margin-bottom: 4px;
}

.slide-recommend blockquote {
  margin-top: 12px;
  color: #7a6b5c;
  font-style: italic;
  font-size: 13px;
}

.slide-recommend .right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.slide-recommend .right img {
  width: 120px;
  height: 160px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(200, 177, 150, 0.3);
}

/* 理念类型样式 */
.slide-concept {
  background: linear-gradient(135deg, #f8fff4 0%, #d4e9d2 100%);
}

.slide-concept .text {
  width: 60%;
}

.slide-concept h2 {
  font-size: 24px;
  color: #2d583f;
  margin-bottom: 16px;
  font-weight: 700;
}

.slide-concept .text p {
  font-size: 14px;
  color: #4f5b52;
  line-height: 1.6;
  margin-bottom: 12px;
}

.slide-concept .bullets {
  margin-top: 12px;
  padding-left: 18px;
  font-size: 13px;
  color: #4f5b52;
  line-height: 1.8;
}

.slide-concept .bullets li {
  margin-bottom: 6px;
}

.concept-img {
  width: 300px;
  height: 300px;
  border-radius: 12px;
  object-fit: contain;
  border: none;
}

/* 小绿叶类型样式 */
.slide-leaf {
  background: linear-gradient(135deg, #fff7e9 0%, #e6f4e6 100%);
}

.slide-leaf .text {
  width: 55%;
}

.slide-leaf h2 {
  font-size: 24px;
  color: #2d583f;
  margin-bottom: 16px;
  font-weight: 700;
}

.slide-leaf .text p {
  font-size: 14px;
  color: #4f5b52;
  line-height: 1.6;
  margin-bottom: 12px;
}

.slide-leaf .bullets {
  margin-top: 12px;
  padding-left: 18px;
  font-size: 13px;
  color: #4f5b52;
  line-height: 1.8;
}

.slide-leaf .bullets li {
  margin-bottom: 6px;
}

.slide-leaf blockquote {
  margin-top: 16px;
  color: #7a6b5c;
  font-style: italic;
  font-size: 13px;
}

.leaf-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.leaf-icon {
  width: 120px;
  height: 120px;
}

.leaf-value {
  margin-top: 10px;
  font-size: 18px;
  color: #2d583f;
  font-weight: 600;
}

/* 左右按钮样式 */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(254, 249, 240, 0.95);
  color: #2d583f;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-btn:hover {
  background: rgba(200, 177, 150, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn .leaf-icon-left,
.carousel-btn .leaf-icon-right {
  font-size: 20px;
  display: inline-block;
  line-height: 1;
}

.carousel-btn .leaf-icon-left {
  transform: rotate(-90deg);
}

.carousel-btn .leaf-icon-right {
  transform: rotate(90deg);
}

.prev-btn {
  left: 15px;
}

.next-btn {
  right: 15px;
}

/* 分页器样式 */
.carousel-swiper :deep(.swiper-pagination) {
  bottom: 20px !important;
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.carousel-swiper :deep(.swiper-pagination-bullet-custom) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(200, 177, 150, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 5px;
  opacity: 1;
}

.carousel-swiper :deep(.swiper-pagination-bullet-custom:hover) {
  background: rgba(200, 177, 150, 0.6);
  transform: scale(1.2);
}

.carousel-swiper :deep(.swiper-pagination-bullet-active-custom) {
  background: #6d4c41;
  width: 24px;
  border-radius: 12px;
  opacity: 1;
}
</style>