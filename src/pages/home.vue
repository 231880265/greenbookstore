<template>
    <div class="home-container">
      <HeaderBar />
      <!-- 顶部 Banner 区 -->
      <section class="banner-section">
        <div class="banner-left">
          <h1 class="title">书籍从 A 到 Z</h1>
          <p class="desc">
            在我们的书城，你可以找到任何你喜欢的书。  
            丰富的种类、舒适的价格、有趣的阅读体验。
          </p>
  
          <button class="banner-btn">进入目录</button>
        </div>
  
        <div class="banner-right">
          <!-- 图片占位色块 -->
          <!-- TODO: 将来换成轮播书籍图片 -->
          <div class="demo-book demo-color-1"></div>
          <div class="demo-book demo-color-2"></div>
          <div class="demo-book demo-color-3"></div>
  
          <!-- 右下角信息卡片 -->
          <div class="info-card">
            <div class="info-title">套装书籍推荐</div>
            <div class="info-sub">（这里显示书名/描述，替换真实图后更改）</div>
            <div class="info-price">￥49.9</div>
          </div>
        </div>
      </section>
  
      <!-- 热门分类 -->
      <section class="hot-section">
        <h2 class="hot-title">热门上架</h2>
  
        <div class="category-nav">
          <span
            v-for="item in categoryList"
            :key="item"
            :class="{ active: currentCategory === item }"
            @click="currentCategory = item"
          >
            {{ item }}
          </span>
        </div>
  
        <!-- 横向滑动图书列表 -->
        <div class="book-list-wrapper">
          <button class="slide-btn left" @click="scrollLeft">‹</button>
  
          <div class="book-list" ref="scrollBox">
            <div v-for="i in 5" :key="i" class="book-card">
              <!-- 占位图 -->
              <!-- TODO: 替换成真实的书籍封面图片 -->
              <div class="book-img"></div>
  
              <div class="book-info">
                <div class="price">￥{{ mockPrices[i - 1] }}</div>
                <div class="btn-row">
                  <button class="add-btn">加入购物车</button>
                  <span class="fav">♡</span>
                </div>
              </div>
            </div>
          </div>
  
          <button class="slide-btn right" @click="scrollRight">›</button>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import HeaderBar from "../components/HeaderBar.vue";
  const categoryList = ["全部", "文学", "科普", "自我成长", "儿童", "有声读物", "其他"];
  const currentCategory = ref("全部");
  
  const mockPrices = [39, 25, 18, 48, 79];
  
  const scrollBox = ref(null);
  
  const scrollLeft = () => {
    scrollBox.value.scrollLeft -= 300;
  };
  
  const scrollRight = () => {
    scrollBox.value.scrollLeft += 300;
  };
  </script>
  
  <style scoped lang="scss">
  .home-container {
    width: 100%;
    padding: 20px 0 60px;
    background: #f7f7f7;
  }
  
  /* Banner */
  .banner-section {
    max-width: 1200px;
    margin: auto;
    display: flex;
    padding: 60px 20px;
    background: #fff;
    border-radius: 14px;
  
    .banner-left {
      flex: 1;
      padding-right: 30px;
  
      .title {
        font-size: 42px;
        font-weight: 700;
        margin-bottom: 20px;
      }
      .desc {
        color: #555;
        line-height: 1.6;
        margin-bottom: 25px;
        max-width: 350px;
      }
      .banner-btn {
        background: #ff7a00;
        padding: 12px 26px;
        border-radius: 8px;
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 17px;
      }
    }
  
    .banner-right {
      flex: 1;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
  
      .demo-book {
        width: 110px;
        height: 180px;
        border-radius: 10px;
        margin: 0 10px;
      }
      .demo-color-1 {
        background: #7cb8ff;
      }
      .demo-color-2 {
        background: #ff8a8a;
      }
      .demo-color-3 {
        background: #ffc55c;
      }
  
      .info-card {
        position: absolute;
        bottom: -20px;
        right: 0;
        background: #fff7e6;
        padding: 15px 18px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
        .info-title {
          font-weight: 700;
        }
        .info-sub {
          font-size: 13px;
          color: #666;
        }
        .info-price {
          margin-top: 6px;
          font-weight: 700;
          color: #ff7a00;
        }
      }
    }
  }
  
  /* 热门上架 */
  .hot-section {
    max-width: 1200px;
    margin: 60px auto 0;
    padding: 20px;
  
    .hot-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
    }
  
    .category-nav {
      display: flex;
      gap: 25px;
      margin-bottom: 25px;
      span {
        cursor: pointer;
        font-size: 16px;
        color: #666;
  
        &.active {
          font-weight: 600;
          color: #333;
        }
      }
    }
  
    /* 横滑区域 */
    .book-list-wrapper {
      position: relative;
  
      .slide-btn {
        position: absolute;
        top: 40%;
        transform: translateY(-50%);
        background: #fff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      .left {
        left: -20px;
      }
      .right {
        right: -20px;
      }
  
      .book-list {
        display: flex;
        overflow-x: auto;
        gap: 20px;
        padding-bottom: 20px;
        scroll-behavior: smooth;
  
        &::-webkit-scrollbar {
          display: none;
        }
  
        .book-card {
          background: #fff;
          width: 190px;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  
          .book-img {
            width: 100%;
            height: 230px;
            border-radius: 10px;
            background: #ddd; /* 占位色 */
          }
  
          .book-info {
            margin-top: 12px;
  
            .price {
              font-weight: 700;
              margin-bottom: 10px;
            }
  
            .btn-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
  
              .add-btn {
                background: #ff7a00;
                color: #fff;
                border: none;
                padding: 6px 10px;
                border-radius: 6px;
                cursor: pointer;
              }
              .fav {
                font-size: 20px;
                cursor: pointer;
                color: #ff7a00;
              }
            }
          }
        }
      }
    }
  }
  </style>
  