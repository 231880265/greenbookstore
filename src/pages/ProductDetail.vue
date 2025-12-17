<template>
    <div class="page-container">
        <HeaderBar />
        <div class="content">

            <div class="product-container" v-if="productDetail">
                <el-breadcrumb separator="/" class="breadcrumb">
                    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item>书城</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ getCategoryName(productDetail.category ?? '') }}</el-breadcrumb-item>
                    <el-breadcrumb-item>{{ productDetail.title }}</el-breadcrumb-item>
                </el-breadcrumb>

                <div class="product-wrapper">
                    <div class="img-wrapper">
                        <img :src="productDetail.cover" alt="二手书封面" class="product-cover" />
                        <img class="icon" src="./image/favor.svg" v-if="isFavorited" @click="toggleFavorite"></img>
                        <img class="icon" src="./image/unfavor.svg" v-else @click="toggleFavorite"></img>
                    </div>


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
                            <span class="tag" v-if="productDetail.wordCount != 'nan'">字数</span>
                            <span class="info" v-if="productDetail.wordCount != 'nan'">{{ productDetail.wordCount
                                }}</span>
                            <span class="tag">装帧</span>
                            <span class="info">{{ getBindingName(productDetail.bookBinding ?? '') }}</span>
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
            </div>



            <div class="recommend-title">相关推荐</div>

            <div class="recommended-list">
                <a v-for="(item, index) in recommendedProducts" :key="index" class="recommended-item"
                    :href="`/product-detail/${item.ubId}`">
                    <div class="img-wrapper">
                        <img :src="item.cover" :alt="item.title" class="recommended-item-img" />
                    </div>
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
import { useRoute } from 'vue-router';
import { getProductDetail, getRecommendedProducts, addToCart, getTopProductsByCategory, addFavorite, removeFavorite, getFavoriteList } from '@/api/index';
import type { Product } from '@/api/types';
import { getCategoryName, getBindingName } from '@/utils';
import { showFailToast, showSuccessToast } from 'vant';

const productId = computed(() => {
    // 通过路由参数获取商品ID
    return parseInt(useRoute().params.id as string);
}
)

// 商品详情数据
const productDetail = ref<Product>();

getProductDetail(Number(productId.value)).then(response => {
    productDetail.value = response.data;
}).catch(error => {
    console.error('获取商品详情失败：', error);
});

//相关推荐
const recommendedProducts = ref<Product[]>();

getRecommendedProducts(Number(productId.value)).then(response => {
    recommendedProducts.value = response.data;
    if (recommendedProducts.value.length < 6) {
        getTopProductsByCategory(productDetail.value?.category || '').then(res => {
            const topProducts = res.data.filter(p => p.ubId !== productId.value);
            const needed = 6 - recommendedProducts.value!.length;
            recommendedProducts.value = recommendedProducts.value!.concat(topProducts.slice(0, needed));
        }).catch(error => {
            console.error('获取分类Top产品失败：', error);
        });
    }
}).catch(error => {
    console.error('获取相关推荐失败：', error);
});



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
    addToCart(productId.value, num.value).then(() => {
        showSuccessToast('已加入购物车');
    }).catch((error) => {
        showFailToast('加入购物车失败，请稍后重试');
        console.error('加入购物车失败：', error);
    });
}

/*-- 收藏相关 --*/
const isFavorited = ref(false);

// Load favorite status on component mount
getFavoriteList().then(response=>{
    const favList = response.data;
    isFavorited.value = favList.some(item=>item.ubId===productId.value);
}).catch(error=>{
    console.error('获取收藏列表失败：',error);
    isFavorited.value = false;
});

async function toggleFavorite() {
    if (!isFavorited.value) {
        addFavorite(productId.value).then(() => {
            showSuccessToast('已添加收藏');
            isFavorited.value = !isFavorited.value;

        }).catch((error) => {
            showFailToast('添加收藏失败，请稍后重试');
            console.error('添加收藏失败：', error);
        });
    } else {
        removeFavorite(productId.value).then(() => {
            showSuccessToast('已取消收藏');
            isFavorited.value = !isFavorited.value;

        }).catch((error) => {
            showFailToast('取消收藏失败，请稍后重试');
            console.error('取消收藏失败：', error);
        })
    }
}

</script>

<style src="./global.scss"></style>
<style scoped lang="scss">
:root {
    --el-color-primary: #2d583f;

    .breadcrumb {
        font-size: 14px;
        width: 100%;

        :deep(.el-breadcrumb__inner) {
            color: #fff;

            &:hover {
                color: #f0f8f0;
            }
        }

        :deep(.el-breadcrumb__separator) {
            color: #fff;
        }
    }
}

.product-container {
    background-color: #2d583f;
    padding: 24px 24px 54px;
    border-radius: 20px;

    .product-wrapper {
        display: flex;
        flex-direction: row;
        margin-top: 24px;

        .img-wrapper {
            height: 476px;
            width: 314px;
            flex-shrink: 0;
            position: relative;

            .product-cover {
                height: 100%;
                width: 100%;
                object-fit: cover;
                border-radius: 24px;
            }

            .icon {
                position: absolute;
                right: 16px;
                top: 16px;
                height: 32px;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    opacity: 0.9;
                }
            }
        }
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
        height: 360px;
        overflow: scroll;

        &::-webkit-scrollbar {
            display: none;
        }

        scrollbar-width: none;
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
        width: 120px;
        text-align: start;
    }
}

.purchase-info {
    display: flex;
    align-items: center;
    margin-top: 20px;
    gap: 30px;
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

        .img-wrapper {
            height: 248px;
            width: 168px;
            flex-shrink: 0;
        }

        .recommended-item-img {
            border-radius: 4px;
            width: 100%;
            height: 100%;
            object-fit: cover;
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

.product-description {
    .van-text-ellipsis__action {
        color: #2d583f;
    }
}
</style>