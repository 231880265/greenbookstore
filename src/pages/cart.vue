<template>
    <div class="page-container">
        <HeaderBar />
        <div class="content">
            <h2 class="cart-title">购物车</h2>

            <div v-if="cart && cart.items.length">
                <div class="cart-controls">
                    <van-checkbox :model-value="isAllSelected" @update:model-value="onToggleAll"
                        checked-color="#2d583f">全选</van-checkbox>
                    <button class="favor-button">移入收藏</button>
                </div>
                <div class="cart-item" v-for="item in cart.items" :key="item.cartItemId">
                    <!-- 选择框（默认不选） -->
                    <van-checkbox :model-value="isSelected(item.cartItemId)"
                        @update:model-value="val => onSelectToggle(item.cartItemId, val)" checked-color="#2d583f" />

                    <!-- 封面 -->
                    <div class="cover-wrapper">
                        <img :src="item.cover" :alt="item.title" class="cover" />
                    </div>

                    <!-- 信息区域 -->
                    <div class="meta">
                        <div class="title">{{ item.title }}</div>
                        <div class="author">{{ item.writer }}</div>
                        <div class="publisher">{{ item.publisher }}</div>
                    </div>

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
            </div>

            <div v-else>购物车为空</div>
        </div>
    </div>

</template>

<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import { ref, onMounted, computed } from 'vue';
import { getCart } from '@/api';
import type { Cart } from '@/api/types';

// 购物车数据
const cart = ref<Cart | null>(null);

// 选中状态：默认都不选
const selectedIds = ref<Set<number>>(new Set());

// 加载购物车（如接口可用则使用接口）
const loadCart = async () => {
    try {
        if (typeof getCart === 'function') {
            const res = await getCart();
            cart.value = res.data as Cart;
        }
    } catch (e) {
        console.error('请求购物车信息错误:', e);
    } finally {
        // 如果没有数据或接口未连通，用示例数据占位
        if (!cart.value) {
            cart.value = {
                total: 2,
                items: [
                    {
                        cartItemId: 4,
                        quantity: 1,
                        ubId: 3,
                        title: '天下·法学原论 合同法总论',
                        price: 122.74,
                        stock: 167,
                        cover:
                            'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/1ce0/1ce0bd9d928f85be7fc7e406c3de6404_0_1_300_300.jpg',
                        writer: '韩世远著',
                        publisher: '法律出版社'
                    },
                    {
                        cartItemId: 5,
                        quantity: 1,
                        ubId: 77,
                        title: '投资最重要的事',
                        price: 24.9,
                        stock: 11,
                        cover:
                            'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/3b53/3b5361cabafa9bf1a01fd0683bee4040_0_1_300_300.jpg',
                        writer: '[美]霍华德·马克斯著,李莉译,石继志译',
                        publisher: '中信出版社'
                    }
                ]
            } as Cart;
        }
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
function handleChange(value: number, item: any) {
    item.quantity = value;

}

// 移入收藏
const moveToFavorites = async (id: number) => {
    // TODO: 调用后端“移入收藏”接口
    console.debug('移入收藏', id);
};

// 删除条目
const removeItem = async (id: number) => {
    if (!cart.value) return;
    cart.value.items = cart.value.items.filter((i) => i.cartItemId !== id);
    selectedIds.value.delete(id);
    cart.value.total = cart.value.items.length;
    // TODO: 如果有后端，调用 deleteCartItem(id)
};

// 全选状态
const isAllSelected = computed(() => {
    if (!cart.value || cart.value.items.length === 0) return false;
    return cart.value.items.every(i => selectedIds.value.has(i.cartItemId));
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
</script>

<style src="./global.scss"></style>
<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
}

.content {
    flex:1;
    padding: 28px 60px;
}

.cart-title {
    color: #2d583f;
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

        .cover {
            height: 100px;
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


        .title {
            font-size: 16px;
            color: #1a1a1a;
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
            color: #dcdfe6;

            &:hover {
                color: #2d583f;
            }
        }
    }

    .actions {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;

        button{
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
</style>