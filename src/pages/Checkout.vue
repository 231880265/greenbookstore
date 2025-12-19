<template>
    <div class="page-container">
        <BreadcrumbBar :items="[{ label: '购物车', path: '/cart' }, { label: '结算' }]" />
        <div class="content">
            <h2 class="checkout-title">结算</h2>

            <div class="checkout-wrapper">
                <!-- 左侧：地址与支付 -->
                <div class="left">
                    <!-- 地址选择器 -->
                    <section class="section">
                        <div class="section-title">收货地址</div>
                        <div class="address-row">
                            <div class="address-display" v-if="selectedAddress">
                                <div class="address-header">
                                    <span class="address-name">{{ selectedAddress.name }}</span>
                                    <span class="address-phone">{{ selectedAddress.phone }}</span>
                                </div>
                                <div class="address-location">
                                    {{ selectedAddress.province }}{{ selectedAddress.city || '' }}{{ selectedAddress.district || '' }}
                                </div>
                                <div class="address-detail" v-if="selectedAddress.detail">
                                    {{ selectedAddress.detail }}
                                </div>
                            </div>
                            <div class="address-text muted" v-else>
                                暂未选择地址
                            </div>
                            <button class="outline-btn" @click="openAddressModal">
                                地址簿
                            </button>
                        </div>
                        <AddressDialog ref="addressDialogRef" :select-mode="true" @select="handleAddressSelect" />
                    </section>

                    <!-- 支付方式 -->
                    <section class="section pay-section">
                        <div class="section-title">支付方式</div>
                        <el-radio-group v-model="paymentMethod">
                            <el-radio label="ALIPAY">支付宝支付</el-radio>
                        </el-radio-group>

                        <div v-if="usableLeaf > 0" class="leaf-section">
                            <el-checkbox v-model="useLeaf">使用{{ usableLeaf }}个小绿叶抵扣￥{{ leafDeduction.toFixed(2)
                                }}</el-checkbox>
                        </div>
                        <div class="pay-row">
                            <van-button class="pay-button" :disabled="!selectedAddressId || settleItems.length === 0"
                                :loading="payLoading" @click="goPay">去支付</van-button>
                        </div>
                    </section>


                </div>

                <!-- 右侧：商品列表 -->
                <div class="right">
                    <div class="section-title">商品清单</div>
                    <div v-if="settleItems.length > 0" class="items">
                        <div v-for="it in settleItems" :key="it.key" class="item">
                            <div class="meta">
                                <div class="title">{{ it.title }}</div>
                                <div class="writer">{{ it.writer }}</div>
                            </div>
                            <div class="quantity">x{{ it.quantity }}</div>
                            <div class="price">￥{{ it.price.toFixed(2) }}</div>
                        </div>
                    </div>
                    <div class="total-caculator">
                        <div class="subtotal">
                            <span>小绿叶抵扣:</span>
                            <span class="money">￥{{ leafDeduction.toFixed(2) }}</span>
                        </div>
                        <div class="subtotal">
                            <span>应付总额：</span>
                            <span class="money">￥{{ payMoney.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 支付表单浮层 -->
        <div v-if="paymentForm" class="payment-form-wrapper">
            <div v-html="paymentForm"></div>
        </div>

        <Footer />
    </div>

</template>

<script lang="ts" setup>
import BreadcrumbBar from '@/components/BreadcrumbBar.vue'
import Footer from '@/components/Footer.vue'
import AddressDialog from '@/components/AddressDialog.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAddressList, getCart, getProductDetail, getCurrentUser, submitOrderFromCart, submitOrderFromProduct, initiatePayment } from '@/api'
import type { AddressItem, Cart, Product } from '@/api/types'
import { showToast, Button as VanButton } from 'vant'
import 'vant/es/button/style'

const route = useRoute()
const router = useRouter()

// 地址
const addresses = ref<AddressItem[]>([])
const selectedAddressId = ref<number | null>(null)
const addressDialogRef = ref<InstanceType<typeof AddressDialog> | null>(null)

/**
 * 选中的地址对象
 */
const selectedAddress = computed(() => {
    return addresses.value.find(a => a.id === selectedAddressId.value) || null
})

/**
 * 处理地址选择
 */
const handleAddressSelect = (address: AddressItem) => {
    selectedAddressId.value = address.id
    // 刷新地址列表
    loadAddresses()
}

/**
 * 打开地址选择对话框
 */
const openAddressModal = async () => {
    await addressDialogRef.value?.open(selectedAddressId.value)
    // 关闭后刷新地址列表
    await loadAddresses()
}

/**
 * 加载地址列表
 */
const loadAddresses = async () => {
    try {
        const res = await getAddressList()
        addresses.value = res.data || []
        // 如果没有选中地址且有地址列表，自动选择第一个
        if (!selectedAddressId.value && addresses.value.length > 0) {
            selectedAddressId.value = addresses.value[0]!.id
        }
    } catch (e) {
        console.error('获取地址列表失败:', e)
    }
}

// 支付方式
const paymentMethod = ref<'ALIPAY'>('ALIPAY')

// 结算项
type SettleItem = { key: string; ubId: number; title: string; writer: string; quantity: number; price: number }
const settleItems = ref<SettleItem[]>([])
const totalPrice = computed(() => settleItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

const leaf = ref(0)
async function loadLeafNum() {
    getCurrentUser().then(res => {
        const user = res.data
        if (user) {
            leaf.value = user.leaf || 0
        }
    }).catch(err => {
        console.error('获取用户信息失败:', err)
    })
}
const usableLeaf = computed(() => {
    const maxDeduction = Math.floor(Math.min(leaf.value, (totalPrice.value / 5 / 0.1)))
    return maxDeduction
})
const useLeaf = ref(true)
const leafDeduction = computed(() => useLeaf.value ? usableLeaf.value * 0.1 : 0)

const payMoney = computed(() => {
    const total = totalPrice.value - leafDeduction.value
    return total > 0 ? total : 0
})

const paymentForm = ref('')
const payLoading = ref(false)

const loadSettleItems = async () => {
    const cartItemIdsParam = route.query.cartItemIds as string | undefined
    const ubIdParam = route.query.ubId as string | undefined
    const quantityParam = route.query.quantity as string | undefined

    // 购物车结算
    if (cartItemIdsParam) {
        try {
            const idSet = new Set((cartItemIdsParam || '').split(',').filter(Boolean).map(id => Number(id)))
            const cartRes = await getCart()
            const cart = cartRes.data as Cart
            settleItems.value = (cart.items || [])
                .filter(it => idSet.has(it.cartItemId))
                .map(it => ({
                    key: `cart-${it.cartItemId}`,
                    ubId: it.ubId!,
                    title: it.title!,
                    writer: it.writer!,
                    quantity: it.quantity,
                    price: it.price!
                }))
        } catch (e) {
            console.error('加载购物车结算项失败:', e)
        }
        return
    }

    // 单品立即购买
    if (ubIdParam && quantityParam) {
        try {
            const ubId = Number(ubIdParam)
            const qty = Math.max(1, Number(quantityParam))
            const res = await getProductDetail(ubId)
            const p = res.data as Product
            settleItems.value = [{
                key: `ub-${ubId}`,
                ubId,
                title: p.title!,
                writer: p.writer!,
                quantity: qty,
                price: p.price!
            }]
        } catch (e) {
            console.error('加载商品详情失败:', e)
        }
    }
}

onMounted(async () => {
    // 检查是否已提交支付，如果是则跳转到订单页面
    const hasSubmittedPayment = sessionStorage.getItem('hasSubmittedPayment')
    if (hasSubmittedPayment === 'true') {
        sessionStorage.removeItem('hasSubmittedPayment')
        router.push('/orders')
        return
    }

    await Promise.all([loadAddresses(), loadSettleItems()])
    // 若没有任何结算项，返回上一页
    if (settleItems.value.length === 0) {
        router.back()
    }
    await loadLeafNum()
})

// 去支付：先下单，再拉起支付
async function goPay() {
    if (!selectedAddressId.value) {
        showToast({ message: '请选择收货地址', duration: 1500 })
        return
    }

    const isFromCart = route.query.cartItemIds !== undefined
    const useLeafNum = useLeaf.value ? usableLeaf.value : 0
    let orderId: number | undefined

    payLoading.value = true
    try {
        if (isFromCart) {
            const res = await submitOrderFromCart(
                useLeafNum,
                (route.query.cartItemIds as string).split(',').map(id => Number(id)),
                selectedAddressId.value,
                paymentMethod.value
            )
            orderId = res.data?.order_id
        } else {
            const ubId = Number(route.query.ubId)
            const quantity = Number(route.query.quantity)
            const res = await submitOrderFromProduct(
                useLeafNum,
                ubId,
                quantity,
                selectedAddressId.value,
                paymentMethod.value
            )
            orderId = res.data?.order_id
        }

        if (!orderId) {
            showToast({ message: '订单创建失败', duration: 1500 })
            throw new Error('订单创建失败，未返回订单ID')
        }

        const payRes = await initiatePayment(orderId ?? '')
        const form = payRes.data?.payment_form
        if (!form) {
            throw new Error('未获取到支付表单')
        }
        // 处理转义的 HTML 字符串
        let htmlForm = typeof form === 'string' ? form : JSON.stringify(form)
        // 解析转义的 HTML
        htmlForm = htmlForm.replace(/\\"/g, '"').replace(/\\\//g, '/')

        // 直接在当前页面显示支付表单
        paymentForm.value = htmlForm
        // 在下一个事件循环中自动提交表单
        setTimeout(() => {
            const forms = document.querySelectorAll('form')
            if (forms.length > 0) {
                (forms[0] as HTMLFormElement).submit()
                // 标记已提交支付
                sessionStorage.setItem('hasSubmittedPayment', 'true')
            }
        }, 100)

    } catch (e) {
        console.error('支付流程失败:', e)
        showToast({ message: '提交/支付失败，请重试', duration: 1500 })
    } finally {
        payLoading.value = false
    }
}
</script>

<style scoped lang="scss">
.content {
    padding: 28px 60px;
    padding-bottom: 120px;
}

.checkout-title {
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

.checkout-wrapper {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;
}

.left .section,
.right {
    background: #fff;
    border-radius: 16px;
    padding: 24px 20px;
}

.section+.section {
    margin-top: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
}

.address-row {
    margin-top: 8px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.address-display {
    flex: 1;
    padding: 12px 16px;
    border-radius: 28px;
    border: 1px solid #e9ecef;
}

.address-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
}

.address-name {
    font-size: 16px;
    font-weight: 600;
    color: #2d583f;
}

.address-phone {
    font-size: 14px;
    color: #666;
}

.address-location {
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
}

.address-detail {
    font-size: 14px;
    color: #555;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #e9ecef;
    word-break: break-all;
    line-height: 1.5;
}

.address-text {
    font-size: 16px;
    flex: 1;
}

.address-text.muted {
    color: #999;
}

.outline-btn {
    border-radius: 999px;
    border: 1px solid #c8b196;
    background: #fff;
    padding: 8px 16px;
    font-size: 16px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
        background-color: #f0f8f0;
        border-color: #2d583f;
    }
}

.leaf-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #e0e0e0;

    .leaf-info {
        margin-top: 8px;
        font-size: 14px;
        color: #666;
        padding-left: 24px;
    }
}

.pay-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
}

.total-inline {
    font-size: 16px;
    font-weight: 600;
}

.money {
    color: #2d583f;
}

.pay-button {
    padding: 10px 24px;
    font-size: 16px;
    border: none;
    background-color: #2d583f;
    color: white;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    margin-left: auto;
    width: 96px;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
}

.right .items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 280px;
    border-bottom: 1px solid #999;
    overflow-y: auto;
    padding-right: 4px;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #d0d0d0;
        border-radius: 3px;

        &:hover {
            background-color: #b0b0b0;
        }
    }

    &::-webkit-scrollbar-track {
        background-color: #f5f5f5;
    }

    &::-webkit-scrollbar-button {
        display: none;
    }
}

.right .item {
    display: flex;
    align-items: center;
    padding-bottom: 12px;

    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
    }
}

.right .item .meta {
    display: flex;
    flex-direction: column;
    width: 240px;
}

.right .item .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.right .item .writer {
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
}

.right .item .quantity {
    color: #333;
    margin-left: 20px;
    width: 35px;
    text-align: center;
}

.right .item .price {
    color: #2d583f;
    margin-left: auto;
}

.items-empty {
    color: #999;
}

.total-caculator {
    font-size: 16px;

    .subtotal {
        margin-top: 18px;
        display: flex;
        justify-content: space-between;
    }

    .money {
        font-weight: bold;
    }
}

.payment-form-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    overflow: auto;

    >div {
        min-width: fit-content;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
    }

    form {
        background-color: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }
}
</style>
<style lang="scss">
.pay-section {
    .el-radio__input.is-checked+.el-radio__label {
        color: #000;
    }

    .el-radio__input.is-checked .el-radio__inner {
        background-color: #2d583f;
        border-color: #2d583f;
    }

    // 小绿叶抵扣复选框改为绿色
    .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #2d583f;
        border-color: #2d583f;
    }

    .el-checkbox__input.is-checked+.el-checkbox__label {
        color: #2d583f;
    }

    .el-checkbox__input .el-checkbox__inner:hover {
        border-color: #2d583f;
    }
}
</style>