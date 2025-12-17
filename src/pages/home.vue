<template>
  <div class="home-container">
    <HeaderBar />

    <HomeCarousel />  
    
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

    <section class="category-block-section">
      <div
        v-for="cat in blockCategories"
        :key="cat.name"
        class="category-block"
      >
        <div class="block-header">
          <h2 class="block-title">{{ cat.name }}</h2>
          <button class="block-more-btn">
            更多 {{ cat.name }}
            <span class="arrow">→</span>
          </button>
        </div>

        <div class="book-card-list">
          <div
            v-for="(book, index) in cat.books"
            :key="index"
            class="book-card"
          >
            <div class="card-img-wrapper">
                <img :src="book.image" :alt="book.title" class="book-card-img" />
            </div>
            <div class="card-info">
              <div class="card-title">{{ book.title }}</div>
              <div class="card-price">¥ {{ book.price.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 登录后在首页展示的个人主页入口 -->
    <section
      v-if="isLoggedIn && currentUser"
      class="profile-summary-section"
    >
      <div class="profile-summary-card">
        <div class="profile-summary-text">
          <div class="hello">
            欢迎回来，{{ currentUser.username || "叶子" }}
          </div>
          <div class="meta">
            <span>手机号：{{ currentUser.telephone }}</span>
            <span class="leaf">小绿叶：{{ currentUser.leaf }}</span>
          </div>
        </div>
        <button class="profile-summary-btn" @click="goProfile">
          进入个人主页 →
        </button>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import HeaderBar from "../components/HeaderBar.vue";
import HomeCarousel from "../components/HomeCarousel.vue";
import Footer from "../components/Footer.vue";
import book1Img from "../assets/book1.jpg";
import book2Img from "../assets/book2.jpg";
import book3Img from "../assets/book3.jpg";
import book4Img from "../assets/book4.jpg";
import book5Img from "../assets/book5.jpg";
import { getCurrentUser } from "@/api";
import type { UserDetail } from "@/api/types";
/** 顶部导航分类：一行 10 个（与后端枚举 ProductCategory 对应） **/
const topCategories = [
  "地理",           // DILI
  "法律",           // FALV
  "经济",           // JINGJI
  "历史",           // LISHI
  "社会科学",       // SHEKE
  "生活",           // SHENGHUO
  "文学",           // WENXUE
  "艺术",           // YISHU
  "政治",           // ZHENGZHI
  "哲学 / 心理学"   // ZHEXUEXINLIXUE
];

// 模拟书籍数据（包含价格）
const fictionBooks = [
  { title: "红楼梦：珍藏版", image: book1Img, price: 58.50 },
  { title: "西游记：插画本", image: book2Img, price: 45.00 },
  { title: "活着 (余华)", image: book3Img, price: 29.90 },
  { title: "三体 (刘慈欣)", image: book4Img, price: 79.90 },
  { title: "百年孤独", image: book1Img, price: 35.00 },
  { title: "挪威的森林", image: book5Img, price: 38.00 },
];

const scienceBooks = [
  { title: "时间简史", image: book5Img, price: 62.00 },
  { title: "人类简史", image: book3Img, price: 49.90 },
  { title: "费曼物理学讲义", image: book2Img, price: 120.00 },
  { title: "上帝掷骰子吗", image: book1Img, price: 75.00 },
  { title: "三体：黑暗森林", image: book5Img, price: 89.90 },
];

/** 区块展示的类别 - 包含书籍数据 **/
const blockCategories = [
    { name: "文学", books: fictionBooks },
    { name: "生活", books: scienceBooks },
];

/** 个人主页入口逻辑 **/
const router = useRouter();
const currentUser = ref<UserDetail | null>(null);
const isLoggedIn = ref(false);

onMounted(async () => {
  const token = localStorage.getItem("GB_TOKEN");
  if (!token) return;
  isLoggedIn.value = true;
  try {
    const res = await getCurrentUser();
    currentUser.value = res.data;
  } catch {
    // token 失效则视为未登录
    localStorage.removeItem("GB_TOKEN");
    isLoggedIn.value = false;
  }
});

const goProfile = () => {
  router.push("/profile");
};

</script>

<style scoped>
/* 整体 - 采用极浅米白色背景 */
.home-container {
  width: 100%;
  min-height: 100vh;
  background: #fcfbf8; /* 极浅米白色，高级且温暖 */
  display: flex;
  flex-direction: column;
}


.banner-content {
    /* 限制宽度，使其与主体内容对齐，而不是全屏铺满 */
  max-width: 1200px;
    height: 380px; /* 调整高度，略低于之前，更协调 */
    margin: 30px auto 30px; /* 顶部 30px，底部 30px，衔接自然 */
    position: relative;
  overflow: hidden;
    border-radius: 8px; 
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08); /* 柔和阴影 */
    transition: transform 0.3s ease;
}

.banner-content:hover {
    transform: scale(0.99); /* 悬浮时略微"收缩"而非放大，增加点击感 */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}



/* --- ② 顶部一行分类导航 --- */
.top-category-section {
  width: 100%;
  background: #ffffff;
  padding: 24px 0 12px;
}

.category-grid {
  display: flex;
  justify-content: center;
  gap: 32px;                 /* 人为控制节奏 */
  font-size: 13px;
  color: #888;
  border-bottom: 1px solid #e6e6e6;
  padding-bottom: 14px;
}

.category-item {
  cursor: pointer;
  position: relative;
  padding: 6px 0;
  letter-spacing: 1px;       /* 高级感关键 */
  transition: color 0.25s ease;
}

.category-item:hover {
  color: #111;
}

/* 极细 underline */
.category-item::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 14px;
  height: 1px;
  background: #111;
  opacity: 0;
  transform: translateX(-50%);
  transition: opacity 0.25s ease;
}

.category-item:hover::after {
  opacity: 1;
}


/* --- ③ 每个类别的区块列表 (卡片式) --- */
.category-block-section {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto 60px;
    padding: 0 20px;
}

.category-block {
    margin-bottom: 40px;
    padding-top: 20px;
}

/* 顶部标题和更多按钮 */
.block-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 25px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
}

.block-title {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.5px;
}

.block-more-btn {
    border: none;
    background: transparent;
    font-size: 14px;
    cursor: pointer;
    color: #666666;
    transition: color 0.3s;
    font-weight: 500;
  display: flex;
    align-items: center;
}

.block-more-btn:hover {
    color: #1a1a1a;
}
.block-more-btn .arrow {
    margin-left: 5px;
    transition: transform 0.3s;
}
.block-more-btn:hover .arrow {
    transform: translateX(3px);
}

/* 书籍卡片列表 (横向滚动) */
.book-card-list {
  display: flex;
    overflow-x: auto; 
    padding: 10px 0;
    padding-bottom: 20px;
    gap: 20px; 
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.book-card-list::-webkit-scrollbar {
    display: none;
}

.book-card {
    width: 200px; 
    flex-shrink: 0;
    background: #ffffff; /* 卡片使用白色，在米白背景上突出 */
    border-radius: 6px;
  cursor: pointer;
    transition: box-shadow 0.3s, transform 0.3s;
}

.book-card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
}

.card-img-wrapper {
  width: 100%;
    height: 280px; 
    overflow: hidden;
    border-radius: 6px 6px 0 0;
    background: #f8f8f8;
}

.book-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.card-info {
    padding: 12px;
    text-align: left;
}

.card-title {
    font-size: 15px;
    color: #1a1a1a;
    font-weight: 600;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-price {
    font-size: 16px;
    color: #c0392b; 
    font-weight: 700;
}

/* 首页下方个人主页入口区块 */
.profile-summary-section {
  width: 100%;
  background: transparent;
  margin-bottom: 40px;
}

.profile-summary-card {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 20px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f6f7f2, #f2efe7);
  border: 1px solid rgba(200, 177, 150, 0.35);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 18px rgba(45, 88, 63, 0.08);
}

.profile-summary-text .hello {
  font-size: 18px;
  font-weight: 600;
  color: #2d583f;
  margin-bottom: 6px;
}

.profile-summary-text .meta {
  font-size: 13px;
  color: #555;
  display: flex;
  gap: 16px;
}

.profile-summary-text .leaf {
  color: #7a6b5c;
}

.profile-summary-btn {
  border-radius: 999px;
  border: none;
  padding: 8px 18px;
  font-size: 14px;
  cursor: pointer;
  background: #2d583f;
  color: #fff;
}
</style>
