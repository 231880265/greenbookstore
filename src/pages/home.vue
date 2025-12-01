<template>
  <div class="home-container">
    <HeaderBar />
    <HomeCarousel />  
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
import HeaderBar from "../components/HeaderBar.vue";
import HomeCarousel from "../components/HomeCarousel.vue";
import Footer from "../components/Footer.vue";
import book1Img from "../assets/book1.webp";
import book2Img from "../assets/book2.webp";
import book3Img from "../assets/book3.webp";
import book4Img from "../assets/book4.webp";

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
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background: #fff0da;
  display: flex;
  flex-direction: column;
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
  color: #a8957a;
}

/* 每个类别的区块列表 */
.category-block-section {
  width: 100%;
  margin: 0 0 40px;
  padding: 0 20px;
}

.category-block {
  display: flex;
  background: #fef9f0;
  margin-right: 30px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(45, 88, 63, 0.05);
  border: 1px solid rgba(200, 177, 150, 0.2);
}

/* 左侧竖排标题 */
.block-left {
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgba(200, 177, 150, 0.3);
  background: rgba(200, 177, 150, 0.08);
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
  border: 1px solid rgba(200, 177, 150, 0.25);
  background: #fff0da;
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
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
  color: #a8957a;
  transition: all 0.3s;
}

.block-more-btn:hover {
  color: #2d583f;
  transform: translateX(2px);
}
</style>
