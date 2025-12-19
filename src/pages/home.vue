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
          @click="handleMoreClick(item)"
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
          <button class="block-more-btn" @click="handleMoreClick(cat.name)">
            {{ cat.name === "更多推荐" ? "更多" : `更多 ${cat.name}` }}
            <span class="arrow">→</span>
          </button>
        </div>

        <div class="book-card-list">
          <a
            v-for="(book, index) in cat.books"
            :key="book.ubId || index"
            class="book-card"
            :class="{ 'no-click': !book.ubId }"
            @click="handleBookClick(book)"
          >
            <div class="card-img-wrapper">
                <img :src="book.image" :alt="book.title" class="book-card-img" />
            </div>
            <div class="card-info">
              <div class="card-title">{{ book.title }}</div>
              <div class="card-price">¥ {{ book.price.toFixed(2) }}</div>
            </div>
          </a>
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
import book12Img from "../assets/book12.jpg";
import book13Img from "../assets/book13.jpg";
import book14Img from "../assets/book14.jpg";
import book15Img from "../assets/book15.jpg";
import { getCurrentUser, getProductList, getProductDetail } from "@/api";
import type { UserDetail, Product } from "@/api/types";

/**
 * 书籍卡片数据接口
 */
interface BookCard {
  ubId?: number;
  title: string;
  image?: string;
  price: number;
}
/** 顶部导航分类：一行 10 个（与后端枚举 ProductCategory 对应） **/
const topCategories = [
  "小说",           // DILI
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
const CATEGORY_MAP: Record<string, string> = {
  小说: "XIAOSHUO",
  法律: "FALV",
  经济: "JINGJI",
  历史: "LISHI",
  社会科学: "SHEKE",
  生活: "SHENGHUO",
  文学: "WENXUE",
  艺术: "YISHU",
  政治: "ZHENGZHI",
  "哲学 / 心理学": "ZHEXUEXINLIXUE",
};

/** 文学类书籍数据 */
const literatureBooks = ref<BookCard[]>([]);

/** 艺术类书籍数据 */
const artBooks = ref<BookCard[]>([]);

/** 历史类书籍数据 */
const historyBooks = ref<BookCard[]>([]);

/** 推荐书籍数据 */
const featuredBooks = ref<BookCard[]>([]);

/** 区块展示的类别 - 包含书籍数据 **/
const blockCategories = ref([
  { name: "文学类推荐", books: literatureBooks },
  { name: "艺术类推荐", books: artBooks },
  { name: "历史类推荐", books: historyBooks },
  { name: "更多推荐", books: featuredBooks },
]);

/** 个人主页入口逻辑 **/
const router = useRouter();
const currentUser = ref<UserDetail | null>(null);
const isLoggedIn = ref(false);

/**
 * 将 Product 转换为 BookCard
 * @param product - 产品数据
 * @returns BookCard 对象
 */
const convertToBookCard = (product: Product): BookCard => {
  return {
    ubId: product.ubId,
    title: product.title,
    image: product.cover,
    price: product.price,
  };
};

/**
 * 获取文学类书籍（使用 id 916-920 列举式获取，每本都通过 getProductDetail 获取）
 */
const fetchLiteratureBooks = async () => {
  try {
    const ids = [916, 917, 918, 919, 920];
    const books: BookCard[] = [];
    
    // 每本书都按照 getProductDetail(id) 的方式获取
    for (const id of ids) {
      try {
        const response = await getProductDetail(id);
        if (response.data) {
          books.push(convertToBookCard(response.data));
        }
      } catch (error) {
        console.warn(`获取文学类书籍 id ${id} 失败:`, error);
      }
    }
    literatureBooks.value = books;
  } catch (error) {
    console.error("获取文学类书籍失败:", error);
    literatureBooks.value = [];
  }
};

/**
 * 获取艺术类书籍（使用 id 921-925 列举式获取，每本都通过 getProductDetail 获取）
 */
const fetchArtBooks = async () => {
  try {
    const ids = [921, 922, 923, 924, 925];
    const books: BookCard[] = [];
    
    // 每本书都按照 getProductDetail(id) 的方式获取
    for (const id of ids) {
      try {
        const response = await getProductDetail(id);
        if (response.data) {
          books.push(convertToBookCard(response.data));
        }
      } catch (error) {
        console.warn(`获取艺术类书籍 id ${id} 失败:`, error);
      }
    }
    
    artBooks.value = books;
  } catch (error) {
    console.error("获取艺术类书籍失败:", error);
    artBooks.value = [];
  }
};

/**
 * 获取历史类书籍（第一本是 id 926，其他4本是模拟数据，没有 id，不可点击）
 */
const fetchHistoryBooks = async () => {
  try {
    // 获取第一本书（id 926）
    const firstBookResponse = await getProductDetail(926);
    const firstBook = firstBookResponse.data ? convertToBookCard(firstBookResponse.data) : null;
    
    // 补充4本模拟数据（没有 id，只有封面、名称和价格）
    const mockBooks: BookCard[] = [
      { 
        title: "翦商：殷周之变与华夏新生", 
        image: book12Img, 
        price: 68.00 
      },
      { 
        title: "希腊别传", 
        image: book13Img, 
        price: 45.00 
      },
      { 
        title: "中国少女：『女学生』的一百年", 
        image: book14Img, 
        price: 52.00 
      },
      { 
        title: "始皇帝的遗产：秦汉帝国", 
        image: book15Img, 
        price: 58.00 
      },
    ];
    
    // 合并：第一本（如果有）+ 4本模拟数据
    if (firstBook) {
      historyBooks.value = [firstBook, ...mockBooks];
    } else {
      historyBooks.value = mockBooks;
    }
  } catch (error) {
    console.error("获取历史类书籍失败:", error);
    // 如果接口失败，至少显示模拟的书籍
    historyBooks.value = [
      { 
        title: "翦商：殷周之变与华夏新生", 
        image: book12Img, 
        price: 68.00 
      },
      { 
        title: "希腊别传", 
        image: book13Img, 
        price: 45.00 
      },
      { 
        title: "中国少女：『女学生』的一百年", 
        image: book14Img, 
        price: 52.00 
      },
      { 
        title: "始皇帝的遗产：秦汉帝国", 
        image: book15Img, 
        price: 58.00 
      },
    ];
  }
};

/**
 * 获取推荐书籍（从各个分类中选取一些热门书籍）
 */
const fetchFeaturedBooks = async () => {
  try {
    // 从文学、艺术、历史等分类中各取一些书籍
    const [literatureRes, artRes, historyRes] = await Promise.all([
      getProductList("WENXUE").catch(() => ({ data: [] })),
      getProductList("YISHU").catch(() => ({ data: [] })),
      getProductList("LISHI").catch(() => ({ data: [] })),
    ]);
    
    const allBooks: BookCard[] = [
      ...literatureRes.data.slice(0, 2).map(convertToBookCard),
      ...artRes.data.slice(0, 2).map(convertToBookCard),
      ...historyRes.data.slice(0, 2).map(convertToBookCard),
    ];
    
    // 如果书籍不足，补充一些默认书籍
    if (allBooks.length < 6) {
      const defaultBooks: BookCard[] = [
        { title: "百年孤独", image: book12Img, price: 35.00 },
        { title: "时间简史", image: book13Img, price: 62.00 },
      ];
      allBooks.push(...defaultBooks.slice(0, 6 - allBooks.length));
    }
    
    featuredBooks.value = allBooks.slice(0, 6);
  } catch (error) {
    console.error("获取推荐书籍失败:", error);
    // 如果接口失败，使用默认书籍
    featuredBooks.value = [
      { title: "百年孤独", image: book12Img, price: 35.00 },
      { title: "时间简史", image: book13Img, price: 62.00 },
      { title: "艺术的故事", image: book14Img, price: 128.00 },
      { title: "史记", image: book15Img, price: 78.00 },
    ];
  }
};

/**
 * 处理书籍卡片点击事件
 * @param book - 书籍对象
 */
const handleBookClick = (book: BookCard) => {
  if (book.ubId) {
    router.push(`/product-detail/${book.ubId}`);
  }
};

onMounted(async () => {
  // 获取用户信息
  const token = localStorage.getItem("GB_TOKEN");
  if (token) {
    isLoggedIn.value = true;
    try {
      const res = await getCurrentUser();
      currentUser.value = res.data;
    } catch {
      // token 失效则视为未登录
      localStorage.removeItem("GB_TOKEN");
      isLoggedIn.value = false;
    }
  }
  
  // 获取各类书籍数据
  await Promise.all([
    fetchLiteratureBooks(),
    fetchArtBooks(),
    fetchHistoryBooks(),
    fetchFeaturedBooks(),
  ]);
});

const goProfile = () => {
  router.push("/profile");
};

/**
 * 处理"更多"按钮点击事件
 * @param categoryName - 分类名称
 */
const handleMoreClick = (categoryName: string) => {
  if (categoryName === "更多" || categoryName === "推荐" || categoryName === "更多推荐") {
    // 跳转到全部书籍页面
    router.push("/product-list");
  } else {
    // 其他分类可以跳转到对应分类的书籍列表
    const categoryCode = CATEGORY_MAP[categoryName];
    if (categoryCode) {
      router.push({ path: `/product-list/${categoryCode}` });
    } else {
      router.push("/product-list");
    }
  }
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

/* 没有 id 的书籍卡片（模拟数据）不可点击，但 hover 效果与可点击书籍一致 */
.book-card.no-click {
    cursor: default;
}

.book-card.no-click:hover {
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
