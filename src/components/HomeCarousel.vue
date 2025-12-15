<template>
  <div class="carousel-container">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :navigation="true"
      :pagination="{ clickable: true }"
      class="carousel-swiper"
      @swiper="onSwiper"
      @slideChangeTransitionEnd="onSlideChange"
    >
      <SwiperSlide
        v-for="slide in slides"
        :key="slide.id"
      >
        <div
          class="slide"
          :style="{ backgroundImage: `url(${slide.bg})` }"
        >
          <!-- overlay -->
          <div
            class="overlay"
            :class="{ show: activeId === slide.id }"
          ></div>

          <!-- 文案 -->
          <div
            class="slide-text"
            v-if="activeId === slide.id"
          >
            <h2>{{ slide.title }}</h2>
            <p>{{ slide.subtitle }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

const modules = [Autoplay, Pagination, Navigation];

const slides = [
  {
    id: "s1",
    bg: p1,
    title: "立冬之后",
    subtitle: "让书页，替你留住温度"
  },
  {
    id: "s2",
    bg: p2,
    title: "期末之前",
    subtitle: "留一小时，只属于阅读"
  },
  {
    id: "s3",
    bg: p3,
    title: "小绿书",
    subtitle: "让好书继续流转"
  },
  {
    id: "s4",
    bg: p4,
    title: "阅读的选择",
    subtitle: "更轻 · 更环保 · 更真诚"
  }
];

const swiperInstance = ref<any>(null);
const activeId = ref(slides[0]?.id ?? "");

const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper;
};

const onSlideChange = () => {
  const index = swiperInstance.value?.realIndex ?? 0;
  activeId.value = slides[index]?.id ?? "";
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  height: 100vh;
  min-height: 400px;
  overflow: hidden;
}

.carousel-swiper,
.carousel-swiper :deep(.swiper-slide) {
  width: 100%;
  height: 100%;
}

/* slide */
.slide {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

/* overlay（渐变 + 动画） */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.35) 40%,
    rgba(0, 0, 0, 0.55) 100%
  );
  opacity: 0;
  transform: scale(1.02);
  transition: all 1s ease;
}

.overlay.show {
  opacity: 1;
  transform: scale(1);
}

/* 文案 */
.slide-text {
  position: absolute;
  left: 8vw;
  bottom: 20vh;
  z-index: 2;
  color: #fff;
  max-width: 520px;

  animation: textFadeUp 0.9s ease-out forwards;
}

.slide-text h2 {
  font-size: 44px;
  font-weight: 600;
  letter-spacing: 3px;
  margin-bottom: 14px;
}

.slide-text p {
  font-size: 15px;
  letter-spacing: 1px;
  opacity: 0.9;
}

/* 动画 */
@keyframes textFadeUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 原始圆点分页器样式 */
.carousel-swiper :deep(.swiper-pagination) {
  bottom: 32px;
  z-index: 10;
}

.carousel-swiper :deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
  margin: 0 6px;
  transition: all 0.3s ease;
}

.carousel-swiper :deep(.swiper-pagination-bullet:hover) {
  background: rgba(255, 255, 255, 0.6);
}

.carousel-swiper :deep(.swiper-pagination-bullet-active) {
  background: #fff;
  transform: scale(1.2);
}

/* 左右切换按钮 */
.carousel-swiper :deep(.swiper-button-prev),
.carousel-swiper :deep(.swiper-button-next) {
  color: #fff;
  width: 44px;
  height: 44px;
}

/* 调整位置 */
.carousel-swiper :deep(.swiper-button-prev) {
  left: 24px;
}

.carousel-swiper :deep(.swiper-button-next) {
  right: 24px;
}

/* 箭头大小 */
.carousel-swiper :deep(.swiper-button-prev::after),
.carousel-swiper :deep(.swiper-button-next::after) {
  font-size: 20px;
  font-weight: bold;
}
</style>