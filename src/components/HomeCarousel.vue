<template>
    <div class="carousel-container">
  
      <Swiper
        :modules="[Autoplay, Pagination]"
        :loop="true"
        :speed="400"
        :autoplay="{ 
          delay: 3000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }"
        :pagination="{ clickable: true }"
        class="home-swiper"
      >
  
        <!-- 页 1：智能推荐 -->
        <SwiperSlide>
          <div class="slide slide-recommend">
            <div class="left">
              <div class="tag">立冬 · 温暖阅读</div>
              <h2>适合冬天阅读的三本书</h2>
              <ul>
                <li>《红楼梦》</li>
                <li>《瓦尔登湖》</li>
                <li>《解忧杂货店》</li>
              </ul>
              <blockquote>“孤舟蓑笠翁，独钓寒江雪。”</blockquote>
            </div>
  
            <div class="right">
              <img :src="books[0]" />
              <img :src="books[1]" />
              <img :src="books[2]" />
            </div>
          </div>
        </SwiperSlide>
  
        <!-- 页 2：智能推荐 第二页 -->
        <SwiperSlide>
          <div class="slide slide-recommend">
            <div class="left">
              <div class="tag">期末季 · 治愈心灵</div>
              <h2>治愈自己的三本书</h2>
              <ul>
                <li>《岛上书店》</li>
                <li>《小王子》</li>
                <li>《当下的力量》</li>
              </ul>
              <blockquote>“愿你在疲惫的世界里，仍有书页为你翻开。”</blockquote>
            </div>
  
            <div class="right">
              <img :src="books[1]" />
              <img :src="books[2]" />
              <img :src="books[3]" />
            </div>
          </div>
        </SwiperSlide>
  
        <!-- 页 3：小绿书理念 -->
        <SwiperSlide>
          <div class="slide slide-concept">
            <div class="text">
              <h2>♻ 小绿书 · 让每一本书都有第二次生命</h2>
              <p>
                小绿书只做一件事：让沉睡书架的好书，被下一位读者继续阅读。
                我们专注二手书流通，让阅读更环保、更低价、更温暖。
              </p>
              <ul>
                <li>✔ 只卖二手书：来自真实读者的循环共享</li>
                <li>✔ 更低价格获得更高阅读价值</li>
                <li>✔ 二次流通代替浪费</li>
              </ul>
            </div>
            <img :src="books[3]" class="concept-img" />
          </div>
        </SwiperSlide>
  
        <!-- 页 4：小绿叶介绍 -->
        <SwiperSlide>
          <div class="slide slide-leaf">
            <div class="text">
              <h2>🌿 小绿叶：你的环保积分</h2>
              <p>卖书获得小绿叶</p>
              <p>买书也会返小绿叶</p>
              <p>可抵扣现金，也能捐出用于种树</p>
  
              <blockquote>“每一片绿叶，都来自一次环保的选择。”</blockquote>
            </div>
  
            <div class="leaf-right">
              <img src="https://cdn-icons-png.flaticon.com/512/765/765766.png" class="leaf-icon" />
              <div class="leaf-value">你当前：128 小绿叶</div>
            </div>
          </div>
        </SwiperSlide>
  
      </Swiper>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Swiper, SwiperSlide } from "swiper/vue";
  import { Autoplay, Pagination } from "swiper/modules";

  import book1Img from "@/assets/book1.webp";
  import book2Img from "@/assets/book2.webp";
  import book3Img from "@/assets/book3.webp";
  import book4Img from "@/assets/book4.webp";
  // @ts-ignore - CSS 模块，无需类型声明
  import "swiper/css";
  // @ts-ignore - CSS 模块，无需类型声明
  import "swiper/css/pagination";

  const books = [book1Img, book2Img, book3Img, book4Img];
  </script>
  
  <style scoped>
  .carousel-container {
    width: 100%;
    max-width: 1200px;
    margin: 30px auto;
  }
  
  .home-swiper {
    border-radius:16px;
    border: 1px solid rgba(200, 177, 150, 0.6);
    box-shadow: 0 6px 20px rgba(0,0,0,.1);
    height: 340px;
    background: #fff;
  }
  
  /* 推荐页布局 */
  .slide-recommend {
    display: flex;
    justify-content: space-between;
    padding: 40px;
    height: 100%;
  }
  
  .slide-recommend .left {
    width: 45%;
  }
  
  .left .tag {
    font-size: 14px;
    color: #2d583f;
    margin-bottom: 6px;
  }
  
  .left h2 {
    font-size: 26px;
    color: #2d583f;
    margin-bottom: 10px;
  }
  
  .left ul {
    line-height: 1.8;
  }
  
  .left blockquote {
    margin-top: 12px;
    color: #7a6b5c;
    font-style: italic;
  }
  
  .slide-recommend .right img {
    width: 120px;
    height: 160px;
    border-radius: 10px;
    object-fit: cover;
    margin-left: 12px;
  }
  
  /* 小绿书理念 */
  .slide-concept {
    display: flex;
    padding: 40px;
    justify-content: space-between;
  }
  
  .slide-concept .text {
    width: 60%;
  }
  
  .concept-img {
    width: 250px;
    border-radius: 12px;
  }
  
  /* 小绿叶 */
  .slide-leaf {
    display: flex;
    padding: 40px;
    justify-content: space-between;
  }
  
  .leaf-icon {
    width: 120px;
  }
  
  .leaf-value {
    margin-top: 10px;
    font-size: 18px;
    color: #2d583f;
  }
  </style>
  