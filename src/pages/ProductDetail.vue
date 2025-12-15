<template>
    <div class="page-container">
        <HeaderBar />
        <div class="content">
            <div class="product-container" v-if="productDetail">
                <img :src="productDetail.cover" alt="二手书封面" class="product-cover" />

                <div class="info-container">

                    <div class="title-container">
                        <h1 class="product-title">{{ productDetail.title }}</h1>
                        <div class="price">¥{{ productDetail.price.toFixed(2) }}</div>
                        <div class="favor-button" @click="toggleFavorite">
                            <img :src="favorIcon" alt="收藏图标" />
                            收藏
                        </div>
                    </div>


                    <div class="detail-container">
                        <p class="product-author">作者: {{ productDetail.writer }}</p>
                        <p class="product-listprice">定价: ¥{{ (productDetail.listPrice ?? 0).toFixed(2) }}</p>
                        <p class="product-category">分类: {{ getCategoryName(productDetail.category ?? '') }}</p>
                        <p class="product-publisher">出版社: {{ productDetail.publisher }}</p>
                        <p class="product-publish-time">出版时间: {{ productDetail.publishTime }}</p>
                        <p class="product-pageNum">页数: {{ productDetail.pageNum }}</p>
                        <p class="product-wordCount">字数: {{ productDetail.wordCount }}</p>
                        <p class="product-bookBinding">装帧: {{ productDetail.bookBinding }}</p>
                        <p class="product-isbn">ISBN: {{ productDetail.isbn }}</p>
                        <p class="product-sales">销量: {{ productDetail.sales }} 本</p>
                    </div>

                    <div class="shop-container">
                        <el-input-number class="num-input" v-model="num" :min="1" :max="productDetail.stock"
                            @change="handleChange" :step-strictly="true" :value-on-clear="1" />
                        <button class="buy-now-button">立即购买</button>
                        <button class="add-to-cart-button">加入购物车</button>
                    </div>

                </div>
            </div>

            <div class="description-container">
                <div class="title">内容简介</div>
                <van-text-ellipsis class="product-description" rows="2" :content="productDetail.description"
                    expand-text="展开" collapse-text="收起" />
            </div>

            <van-divider class="divider" :style="{ borderColor: '#c8b196', padding: '0 16px' }">相关推荐</van-divider>

            <div class="recommended-list">
                <a v-for="(item, index) in recommendedProducts" :key="index" class="recommended-item"
                    :href="`/product-detail/${item.ubId}`">
                    <img :src="item.cover" :alt="item.title" class="recommended-item-img" />
                    <div class="wrapper">
                        <div class="recommended-item-title">{{ item.title }}</div>
                    </div>
                    <div class="recommended-item-price">￥{{ item.price.toFixed(2) }}</div>
                </a>
            </div>
            <Footer />
        </div>
    </div>
</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import Footer from '@/components/Footer.vue';
import { ref, computed } from 'vue';
import favorSvg from '@/assets/favor.svg';
import unfavorSvg from '@/assets/unfavor.svg';
import { useRoute } from 'vue-router';
import { getProductDetail, getRecommendedProducts } from '@/api/index';
import type { Product } from '@/api/types';
import { getCategoryName } from '@/utils';
import FavorIcon from '@/pages/image/favor.svg';
import UnfavorIcon from '@/pages/image/unfavor.svg';

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

// getProductDetail(Number(productId.value)).then(response => {
//     productDetail.value = response.data;
// }).catch(error => {
//     console.error('获取商品详情失败：', error);
// });

//相关推荐数量
const recommendedProducts = ref<Product[]>([
    {
        ubId: 43,
        title: "民法总则",
        price: 2.49,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/9c24/9c24f5a17e3938928b5632efe80f26a9_0_1_300_300.jpg"
    },
    {
        ubId: 53,
        title: "民法学说与判例研究",
        price: 3.23,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/ff15/ff155f3e09b92e32dc47ac2213f82f4e_0_1_300_300.jpg"
    },
    {
        ubId: 35,
        title: "法律思维与民法实例:请求权基础理论体系",
        price: 22.06,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/48fa/48fa0474efe9170d4f854bbf42c4793c_0_1_300_300.jpg"
    },
    {
        ubId: 33,
        title: "债法原理",
        price: 14.5,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/36da/36dacf361f8011dd06a930547e5b1434_0_1_300_300.jpg"
    }
]);

// getRecommendedProducts(Number(productId.value)).then(response => {
//     recommendedProducts.value = response.data;
// }).catch(error => {
//     console.error('获取相关推荐失败：', error);
// });



/*-- 购买相关 --*/
// 购买数量
const num = ref(1);

function handleChange(value: number) {
    num.value = value;
}

/*-- 收藏相关 --*/
const isFavorited = ref(false);
const favorIcon = computed(() => isFavorited.value ? FavorIcon : UnfavorIcon);
function toggleFavorite() {
    isFavorited.value = !isFavorited.value;
}

</script>

<style scoped lang="scss">
.page-container {
    min-height: 100dvh;
    min-width: 1200px;
}

.content {
    background-color: #fff0da;
    padding: 40px 60px 0;
}

.product-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 60px;

    .product-cover {
        width: 20%;
    }

}

.description-container {
    margin-top: 40px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #c8b196;

    .title {
        font-size: 20px;
        font-weight: bold;
    }

    .product-description {
        font-size: 16px;
        line-height: 1.6;
        color: #555;
        margin-top: 16px;
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
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #2d583f;
            font-size: 16px;
            cursor: pointer;
            margin-left: auto;
            transition: color 0.18s ease;

            img {
                width: 20px;
                height: 20px;
                transition: filter 0.18s ease, opacity 0.18s ease;
                display: inline-block;
            }

            &:hover {
                color: #4a7d5f;
            }

            &:hover img {
                filter: brightness(1.12);
                opacity: 0.95;
            }
        }

        .price {
            margin-left: 24px;
            font-size: 28px;
            color: #2d583f;
            font-weight: bold;
        }
    }

    .detail-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 100px;

        p {
            margin: 5px 0;
            font-size: 16px;
            color: #555;
        }
    }
}

.shop-container {
    display: flex;
    gap: 30px;
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
        background-color: #fba101;
    }
}

.divider {
    margin-top: 40px;
    color: #a8957a;
}

.recommended-list {
    display: flex;
    gap: 60px;
    justify-content: center;
    margin-top: 20px;

    .recommended-item {
        width: 150px;
        text-align: center;
        text-decoration: none;

        .recommended-item-img {
            height: 150px;
            border-radius: 4px;
        }

        .wrapper {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 40px;
        }

        .recommended-item-title {
            font-size: 14px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            /* 显示两行 */
            -webkit-box-orient: vertical;
        }

        .recommended-item-price {
            margin-top: 6px;
            font-size: 16px;
            color: #2d583f;
            font-weight: bold;
        }
    }
}
</style>

<style lang="scss">
.num-input {
    font-size: 16px;

    .el-input-number__decrease,
    .el-input-number__increase {
        background-color: #c8b196;
        color: #fff;
    }

    .el-input-number__decrease.is-disabled,
    .el-input-number__increase.is-disabled {
        color: #fff;
    }
}
</style>