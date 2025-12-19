<template>
    <div class="page-container">
        <HeaderBar />
        <BreadcrumbBar :items="[{ label: '购物车' }]" />
        <div class="content">
            <h2 class="cart-title">购物车</h2>
            

            <!-- 加载中骨架屏 -->
            <div v-if="loading" class="loading-container">
                <div v-for="index in 3" :key="index" class="cart-item-skeleton">
                    <van-skeleton :row="0" class="checkbox-skeleton">
                        <template #template>
                            <van-skeleton-avatar size="20px" />
                        </template>
                    </van-skeleton>
                    <van-skeleton :row="0" class="cover-skeleton">
                        <template #template>
                            <van-skeleton-image class="skeleton-cover-img" />
                        </template>
                    </van-skeleton>
                    <van-skeleton title :row="2" class="meta-skeleton" />
                    <van-skeleton :row="1" class="price-skeleton" />
                    <van-skeleton :row="1" class="num-skeleton" />
                    <van-skeleton :row="1" class="actions-skeleton" />
                </div>
            </div>

            <!-- 购物车内容 -->
            <div v-else-if="cart && cart.items.length">
                <div class="cart-controls">
                    <van-checkbox :model-value="isAllSelected" @update:model-value="onToggleAll"
                        checked-color="#2d583f">全选</van-checkbox>
                    <button class="favor-button" @click="moveSelectedToFavorites">移入收藏</button>
                </div>
                <div class="cart-item" v-for="item in cart.items" :key="item.cartItemId">
                    <!-- 选择框（默认不选） -->
                    <van-checkbox :model-value="isSelected(item.cartItemId)"
                        @update:model-value="val => onSelectToggle(item.cartItemId, val)" checked-color="#2d583f" />

                    <!-- 封面 -->
                    <a class="cover-wrapper" :href="`/product-detail/${item.ubId}`" target="_blank">
                        <img :src="item.cover" :alt="item.title" class="cover" />
                    </a>

                    <!-- 信息区域 -->
                    <a class="meta" :href="`/product-detail/${item.ubId}`" target="_blank">
                        <div class="title">{{ item.title }}</div>
                        <div class="author">{{ item.writer }}</div>
                        <div class="publisher">{{ item.publisher }}</div>
                    </a>

                    <!-- 价格 -->
                    <div class="price">￥{{ item.price.toFixed(2) }}</div>

                    <!-- 数量选择器（初始值为 quantity） -->
                    <el-input-number class="num-input" v-model="item.quantity" :min="1" :max="item.stock"
                        @change="(val: number) => handleChange(val, item)" :step-strictly="true" :value-on-clear="1" />

                    <!-- 操作区 -->
                    <div class="actions">
                        <button @click="moveToFavorites(item.cartItemId)">移入收藏</button>
                        <button @click="removeItem(item.cartItemId)">删除</button>
                    </div>
                </div>

                <div class="sum">
                    <div class="total-money">合计：
                        <span class="money">￥{{ totalPrice.toFixed(2) }}</span>
                    </div>
                    <button class="checkout" @click="handleCheckout">结算<span v-if="selectedNum > 0">({{ selectedNum
                            }})</span></button>
                </div>
            </div>

            <!-- 空购物车 -->
            <div v-else-if="!loading" class="vacant-cart">
                <img src="./image/vacant-cart.svg"></img>
                <div class="text">Oops！这里空空如也</div>
            </div>

        </div>
    </div>

</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import BreadcrumbBar from '@/components/BreadcrumbBar.vue';
import { ref, onMounted, computed } from 'vue';
import { getCart, updateCartItem, addFavorite, removeCartItem } from '@/api';
import type { Cart } from '@/api/types';
import { showToast } from 'vant';

// 购物车数据
const cart = ref<Cart | null>(null);

// 加载状态
const loading = ref(true);

// 选中状态：默认都不选
const selectedIds = ref<Set<number>>(new Set());

// 加载购物车
const loadCart = async () => {
    loading.value = true;
    try {
        if (typeof getCart === 'function') {
            const res = await getCart();
            cart.value = res.data as Cart;
        }
    } catch (e) {
        console.error('请求购物车信息错误:', e);
    } finally {
        loading.value = false;
    }
};

onMounted(loadCart);

// 是否选中
const isSelected = (id: number) => selectedIds.value.has(id);

// 勾选变化（Vant Checkbox）
const onSelectToggle = (id: number, checked: boolean) => {
    if (checked) selectedIds.value.add(id);
    else selectedIds.value.delete(id);
};

// 数量变化（可在此调用更新接口）
async function handleChange(value: number, item: any) {
    item.quantity = value;
    // 调用后端更新接口
    updateCartItem(item.cartItemId, value).then(() => {
        console.debug('更新购物车项成功', item.cartItemId, value);
    }).catch((e) => {
        console.error('更新购物车项失败', e);
    });
}

// 移入收藏
const moveToFavorites = async (id: number) => {
    addFavorite(id).then(() => {
        showToast({ message: '已移入收藏', duration: 1500 });
        // 删除购物车项
        removeItem(id);
    }).catch((e) => {
        console.error('移入收藏失败', e);
    });
};

// 移入收藏（批量）
const moveSelectedToFavorites = async () => {
    const ids = Array.from(selectedIds.value);
    if (ids.length === 0) {
        showToast({ message: '请选择要移入收藏的商品', duration: 1500 });
        return;
    }
    try {
        for (const id of ids) {
            await addFavorite(id);
            removeItem(id);
        }
        showToast({ message: '已移入收藏', duration: 1500 });
    } catch (e) {
        console.error('批量移入收藏失败', e);
    }
}

// 删除条目
const removeItem = async (id: number) => {
    if (!cart.value) return;
    cart.value.items = cart.value.items.filter((i) => i.cartItemId !== id);
    selectedIds.value.delete(id);
    cart.value.total = cart.value.items.length;
    // 调用后端删除接口
    removeCartItem(id.toString()).then(() => {
        console.debug('删除购物车项成功', id);
    }).catch((e) => {
        console.error('删除购物车项失败', e);
    });
};

// 全选状态
const isAllSelected = computed(() => {
    if (!cart.value || cart.value.items.length === 0) return false;
    return cart.value.items.every(i => selectedIds.value.has(i.cartItemId));
});

const selectedNum = computed(() => {
    return selectedIds.value.size;
});

// 切换全选/全不选
const onToggleAll = (checked: boolean) => {
    if (!cart.value) return;
    if (checked) {
        selectedIds.value.clear();
        cart.value.items.forEach(i => selectedIds.value.add(i.cartItemId));
    } else {
        selectedIds.value.clear();
    }
};

// 计算总价
const totalPrice = computed(() => {
    if (!cart.value) return 0;
    let sum = 0;
    cart.value.items.forEach(i => {
        if (selectedIds.value.has(i.cartItemId)) {
            sum += i.price * i.quantity;
        }
    });
    return sum;
});

import { useRouter } from 'vue-router';
const router = useRouter();
const handleCheckout = () => {
    if (selectedIds.value.size === 0) {
        showToast({ message: '请选择要结算的商品', duration: 1500 });
    } else {
        const selectedItems = cart.value?.items.filter(i => selectedIds.value.has(i.cartItemId)) || [];
        router.push({
            path: '/checkout',
            query: {
                cartItemIds: selectedItems.map(i => i.cartItemId).join(',')
            }
        });
    }
};
</script>

<style src="./global.scss"></style>
<style scoped lang="scss">
.content {
    padding: 28px 60px;
    padding-bottom: 140px; // 给底部留空间，避免结算条覆盖内容
}

.cart-title {
    color: #2d583f;
}

.breadcrumb {
    margin: 8px 0 16px;
    font-size: 14px;

    :deep(.el-breadcrumb__inner) {
        &:hover {
            color: #2d583f;
        }
    }
}


.cart-controls {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    border-bottom: 1px solid #e0e0e0;

    .favor-button {
        margin-left: 20px;
        padding: 8px 12px;
        font-size: 16px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: opacity 0.3s;
        border: 1px solid #2d583f;
        color: #2d583f;
        background-color: transparent;

        &:hover {
            opacity: 0.9;
        }
    }
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    background-color: white;
    border-radius: 16px;
    margin-top: 20px;

    .cover-wrapper {
        width: 100px;
        overflow: hidden;
        display: flex;
        margin-left: 20px;
        justify-content: center;
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.3s ease;

        .cover {
            height: 100px;
            transition: transform 0.3s ease;
        }

        &:hover {
            .cover {
                transform: scale(1.05);
            }
        }
    }

    .meta {
        margin-left: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 6px;
        cursor: pointer;
        transition: all 0.3s;
        width: 400px;
        color: #1a1a1a;


        .title {
            font-size: 16px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        .author,
        .publisher {
            font-size: 14px;
            color: #666666;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        &:hover {
            text-decoration: underline;
        }
    }

    .price {
        font-size: 16px;
        width: 80px;
        text-align: center;
    }

    .num-input {
        margin-left: 160px;

        :deep(.el-input-number__increase),
        :deep(.el-input-number__decrease) {
            color: #8bc34a;
            background-color: #f1f8e9;

            &:hover {
                color: #689f38;
                background-color: #e8f5e9;
            }

            &.is-disabled {
                color: #c5e1a5;
                background-color: #f1f8e9;
            }
        }
    }

    .actions {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;

        button {
            background-color: transparent;
            border: none;
            color: #b1aeae;
            cursor: pointer;
            font-size: 14px;
            transition: color 0.3s;

            &:hover {
                color: #2d583f;
            }
        }
    }
}

.sum {
    position: fixed; // 固定在视口
    bottom: 20px;
    right: 60px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    padding: 12px 24px;
    border: 1px solid #b1aeae;
    background-color: white;
    z-index: 10; // 确保浮在其他内容之上

    .checkout {
        border: none;
        background-color: #2d583f;
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        cursor: pointer;
        transition: opacity 0.3s;
        font-size: 16px;
        font-weight: bold;
        width: 140px;
        margin-left: 40px;

        &:hover {
            opacity: 0.9;
        }
    }

    .total-money {
        font-size: 18px;
        font-weight: bold;

        .money {
            color: #2d583f;
        }
    }
}

.vacant-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 100px;

    img {
        width: 200px;
        height: 200px;
        margin-bottom: 20px;
    }

    .text {
        font-size: 20px;
        color: #888888;
        font-style: italic;
    }
}

// 加载骨架屏样式
.loading-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
}

.cart-item-skeleton {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 16px 24px;
    border-radius: 16px;
    gap: 16px;

    .checkbox-skeleton {
        flex-shrink: 0;
    }

    .cover-skeleton {
        flex-shrink: 0;
        width: 80px;
        height: 120px;

        .skeleton-cover-img {
            width: 80px;
            height: 120px;
            border-radius: 8px;
        }
    }

    .meta-skeleton {
        flex: 1;
        min-width: 200px;
    }

    .price-skeleton {
        width: 100px;
    }

    .num-skeleton {
        width: 120px;
    }

    .actions-skeleton {
        width: 100px;
    }
}
</style>
