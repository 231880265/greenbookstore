<template>
    <div class="page-container">
        <HeaderBar />
        <div class="content">
            <div class="product-container" v-if="productDetail">
                <img :src="productDetail.cover" alt="二手书封面" class="product-cover" />

                <div class="info-container">

                    <div class="writer">{{ productDetail.writer }}</div>
                    <div class="title">{{ productDetail.title }}</div>

                    <div class="detail-container">
                        <span class="tag">分类</span>
                        <span class="info">{{ getCategoryName(productDetail.category ?? '') }}</span>
                        <span class="tag">出版社</span>
                        <span class="info">{{ productDetail.publisher }}</span>
                        <span class="tag">出版时间</span>
                        <span class="info">{{ productDetail.publishTime }}</span>
                        <span class="tag">定价</span>
                        <span class="info">¥{{ (productDetail.listPrice ?? 0).toFixed(2) }}</span>
                        <span class="tag">页数</span>
                        <span class="info">{{ productDetail.pageNum }}</span>
                        <span class="tag">字数</span>
                        <span class="info">{{ productDetail.wordCount }}</span>
                        <span class="tag">装帧</span>
                        <span class="info">{{ productDetail.bookBinding }}</span>
                        <span class="tag">ISBN</span>
                        <span class="info">{{ productDetail.isbn }}</span>
                        <span class="tag">销量</span>
                        <span class="info">{{ productDetail.sales }} 本</span>
                    </div>

                    <div class="purchase-info">
                        <div class="price">￥{{ productDetail.price.toFixed(2) }}</div>

                        <el-input-number class="num-input" v-model="num" :min="1" :max="productDetail.stock"
                            @change="handleChange" :step-strictly="true" :value-on-clear="1" />
                    </div>

                    <div class="shop-container">
                        <button class="buy-now-button" @click="buyNow">立即购买</button>
                        <button class="add-to-cart-button" @click="addProductToCart">加入购物车</button>
                    </div>

                </div>
                <div class="description-container">
                    <div class="title">内容简介</div>
                    <van-text-ellipsis class="product-description" rows="14" :content="productDetail.description"
                        expand-text="展开" collapse-text="收起" />
                </div>
            </div>



            <div class="recommend-title">相关推荐</div>

            <div class="recommended-list">
                <a v-for="(item, index) in recommendedProducts" :key="index" class="recommended-item"
                    :href="`/product-detail/${item.ubId}`">
                    <img :src="item.cover" :alt="item.title" class="recommended-item-img" />
                    <div class="recommended-item-price">￥{{ item.price.toFixed(2) }}</div>
                    <div class="wrapper">
                        <div class="recommended-item-title">{{ item.title }}</div>
                    </div>
                </a>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import Footer from '@/components/Footer.vue';
import { ref, computed } from 'vue';
import favorSvg from '@/assets/favor.svg';
import unfavorSvg from '@/assets/unfavor.svg';
import { useRoute } from 'vue-router';
import { getProductDetail, getRecommendedProducts, addToCart } from '@/api/index';
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
    cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/36da/36dacf361f8011dd06a930547e5b1434_0_1_300_300.jpg",
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
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/36da/36dacf361f8011dd06a930547e5b1434_0_1_300_300.jpg"
    },
    {
        ubId: 53,
        title: "民法学说与判例研究",
        price: 3.23,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/36da/36dacf361f8011dd06a930547e5b1434_0_1_300_300.jpg"
    },
    {
        ubId: 35,
        title: "法律思维与民法实例:请求权基础理论体系",
        price: 22.06,
        cover: "https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/36da/36dacf361f8011dd06a930547e5b1434_0_1_300_300.jpg"
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

function buyNow() {
    console.log(`购买 ${num.value} 本书`);
    // 在这里添加购买逻辑
}

async function addProductToCart() {
    
}

/*-- 收藏相关 --*/
const isFavorited = ref(false);
const favorIcon = computed(() => isFavorited.value ? FavorIcon : UnfavorIcon);
function toggleFavorite() {
    isFavorited.value = !isFavorited.value;
}

</script>

<style src="./global.scss"></style>
<style scoped lang="scss">
.product-container {
    display: flex;
    flex-direction: row;
    background-color: #2d583f;
    padding: 24px 24px 54px;
    border-radius: 20px;

    .product-cover {
        height: 476px;
        border-radius: 24px;
        min-width: 314px;
    }

}

.description-container {
    margin-left: auto;
    padding: 24px;
    background-color: #fff;
    border-radius: 24px;
    max-width: 370px;

    .title {
        font-size: 24px;
    }

    .product-description {
        font-size: 16px;
        line-height: 1.6;
        margin-top: 8px;
    }
}

.info-container {
    color: white;
    margin-left: 12px;

    .writer {
        font-size: 20px;
    }

    .title {
        font-size: 32px;
        line-height: 48px;
        margin-top: 8px;
    }


    .detail-container {
        display: grid;
        grid-template-columns: auto auto;
        width: fit-content;
        font-size: 16px;
        margin-top: 24px;
        row-gap: 6px;
        column-gap: 16px;

        .tag {
            font-weight: bold;
        }
    }

    .price {
        font-size: 32px;
    }
}

.purchase-info {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
}

.shop-container {
    display: flex;
    gap: 30px;
    margin-top: 20px;

    .buy-now-button,
    .add-to-cart-button {
        padding: 16px 28px;
        font-size: 16px;
        border: none;
        border-radius: 16px;
        cursor: pointer;
        color: #fff;
        transition: opacity 0.3s;

        &:hover {
            opacity: 0.9;
        }
    }

    .buy-now-button {
        background-color: #f0f8f0;
        color: #2d583f;
    }

    .add-to-cart-button {
        background-color: transparent;
        border: 1px solid #f0f8f0;
        color: #f0f8f0;
    }
}

.recommend-title {
    font-size: 24px;
    margin-top: 24px;
}

.recommended-list {
    display: flex;
    gap: 8px;
    margin-top: 16px;

    .recommended-item {
        text-decoration: none;
        padding: 16px;
        background-color: #fff;
        border-radius: 16px;
        width: 168px;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-5px);
        }

        .recommended-item-img {
            height: 248px;
            border-radius: 4px;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            height: 48px;
            margin-top: 4px;
        }

        .recommended-item-title {
            font-size: 16px;
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
            font-size: 14px;
            color: #2d583f;
        }
    }
}
</style>

<style lang="scss">
.num-input {
    font-size: 16px;
    width: 138px !important;

    .el-input-number__decrease,
    .el-input-number__increase {
        color: #fff;
        background-color: #f0f8f0;
    }

    .el-input-number__decrease.is-disabled,
    .el-input-number__increase.is-disabled {
        color: #fff;
        background-color: #f0f8f0;
    }

    &:hover {
        .el-input__wrapper {
            border-color: #2d583f;
            box-shadow: 0 0 0 1px #2d583f inset !important;
        }

        .el-input-number__decrease,
        .el-input-number__increase {
            color: #2d583f;
        }
    }
}
</style>