<template>
    <HeaderBar />
    <div class="product-container" v-if="productDetail">
        <img :src="productDetail.cover" alt="二手书封面" class="product-cover" />

        <div class="info-container">

            <div class="title-container">
                <h1 class="product-title">{{ productDetail.title }}</h1>
                <button class="favor-button">❤ 收藏</button>
                <div class="price">¥{{ productDetail.price.toFixed(2) }}</div>
            </div>


            <div class="detail-container">
                <p class="product-author">作者: {{ productDetail.writer }}</p>
                <p class="product-listprice">定价: ¥{{ productDetail.listPrice.toFixed(2) }}</p>
                <p class="product-category">分类: {{ getCategoryName(productDetail.category) }}</p>
                <p class="product-publisher">出版社: {{ productDetail.publisher }}</p>
                <p class="product-publish-time">出版时间: {{ productDetail.publishTime }}</p>
                <p class="product-pageNum">页数: {{ productDetail.pageNum }}</p>
                <p class="product-wordCount">字数: {{ productDetail.wordCount }}</p>
                <p class="product-bookBinding">装帧: {{ productDetail.bookBinding }}</p>
                <p class="product-isbn">ISBN: {{ productDetail.isbn }}</p>
                <p class="product-sales">销量: {{ productDetail.sales }} 本</p>
            </div>

            <div class="shop-container">
                <button class="buy-now-button">立即购买</button>
                <button class="add-to-cart-button">加入购物车</button>
            </div>

        </div>
    </div>

    <div class="description-container">
        <h2 class="title">内容简介</h2>
        <p class="product-description">{{ productDetail.description }}</p>
    </div>


</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getProductDetail } from '@/api/index';
import type { Product } from '@/api/types';
import { getCategoryName } from '@/utils';

const productId = computed(() => {
    // 通过路由参数获取商品ID
    return useRoute().params.id;
}
)

// 商品详情数据
const productDetail = ref<Product>({
    ubId: 1,
    title: "民法总则",
    stock: 963,
    sales: 917,
    category: "FALV",
    price: 8.99,
    listPrice: 49.0,
    writer: "王泽鉴著",
    pageNum: "491页",
    wordCount: "500千字",
    publisher: "北京大学出版社",
    bookBinding: "PAPERBACK",
    publishTime: "2009-12",
    usedDegree: 2,
    description: "《民法总则(最新版)》是研习民法者的入门参考书，以私权利贯穿始终，开篇就转载了德国法学家耶林的名著《法律的斗争》，为全书定下了基调：即民法是保障私权利的基本法。接着从权利主体(自然人及法人)、权利客体(物)、权利变动(尤其是法律行为，既属重要，全书亦主要围绕之详加论述)及权利的行使等角度进行论述，力图把民法的权利本位、私法的价值理念与原理原则全方位地展现给读者。《民法总则(最新版)》的另一特色是用实例引导读者发掘问题、思考问题，并带着问题去探求私法上的解决途径。",
    cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/a791/a7914f6ff8bc1e97e320171caaafb623_0_1_300_300.jpg",
    isbn: "9787301160206"
});

getProductDetail(Number(productId.value)).then(response => {
    productDetail.value = response.data;
}).catch(error => {
    console.error('获取商品详情失败：', error);
});


</script>

<style scoped lang="scss">
.product-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
    gap: 20px;

    .product-cover {
        width: 20%;
    }

}

.info-container {

    .title-container {
        display: flex;
        align-items: center;

        .product-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
        }

        .favor-button {
            background: none;
            border: none;
            color: #ff4d4f;
            font-size: 18px;
            cursor: pointer;
            margin-left: 16px;

            &:hover {
                color: #ff7875;
            }
        }

        .price {
            margin-left: auto;
            font-size: 28px;
            color: #2d583f;
            font-weight: bold;
        }
    }

    .detail-container {
        width: 100%;
        max-width: 600px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 20px;

        p {
            margin: 5px 0;
            font-size: 16px;
            color: #555;
        }
    }
}

.shop-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;

    .buy-now-button,
    .add-to-cart-button {
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: #fff;

        &:hover {
            opacity: 0.9;
        }
    }

    .buy-now-button {
        background-color: #ff7a00;
    }

    .add-to-cart-button {
        background-color: #1890ff;
    }
}
</style>