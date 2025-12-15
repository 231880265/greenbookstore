<template>
  <header class="header">
    <div class="header-inner">
      <!-- 左侧：搜索入口（点击打开抽屉） -->
      <div class="left-area">
        <div class="search-pill" @click="openSearch" title="搜索书名 / 作者 / ISBN">
          <span class="placeholder">搜索书名 / 作者 / ISBN</span>
          <svg class="icon-svg-search" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <!-- 中间 Logo -->
      <div class="center-logo">
        <span class="main-logo">GREEN BOOK</span>
      </div>

      <!-- 右侧 -->
      <div class="right-nav">
         <!-- 去卖书 -->
         <div class="icon-wrapper sell-book">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="hover-text">去卖书</span>
        </div>

        <!-- 积分示例 -->
        <div class="leaf-wrapper" title="我的绿叶积分">
          <svg class="leaf-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M16 8C16 12 12 20 12 20C12 20 8 12 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z"
              fill="#2d583f" stroke="#2d583f" stroke-width="1.5"
            />
          </svg>
          <span class="leaf-num">{{ leafCount }}</span>
        </div>

        <!-- 购物车 -->
        <div class="icon-wrapper" title="购物车">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>

        <!-- 个人中心 -->
        <div class="icon-wrapper user-icon" title="个人中心" @click="onUserIconClick">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    </div>

    <!-- 搜索抽屉和遮罩层 -->
    <teleport to="body">
      <!-- 灰色遮罩层 - 没有transition，立即显示/隐藏 -->
      <div 
        v-if="searchOpen" 
        class="mask-overlay" 
        @click="closeSearch"
      ></div>
      
      <!-- 抽屉 - 有transition动画 -->
      <transition name="drawer">
        <div v-if="searchOpen" class="search-drawer">
          <div class="search-top">
            <input
              ref="inputRef"
              v-model="keyword"
              class="search-input"
              placeholder="搜索书名 / 作者 / ISBN"
              @keydown.esc="closeSearch"
              @keydown.enter.prevent="doSearch(keyword)"
            />
            <button class="close-btn" @click="closeSearch" aria-label="关闭">✕</button>
          </div>

          <div class="search-body">
            <!-- 热门搜索 -->
            <div class="col">
              <div class="col-title">大家都在搜</div>
              <div class="chips">
                <button
                  class="chip"
                  v-for="item in hotList"
                  :key="item"
                  @click="doSearch(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>

            <!-- 历史记录 -->
            <div class="col">
              <div class="col-title row">
                <span>历史记录</span>
                <button
                  v-if="historyList.length"
                  class="clear-btn"
                  @click="clearHistory"
                >
                  清空
                </button>
              </div>

              <div v-if="!historyList.length" class="empty">
                暂无历史记录
              </div>

              <div v-else class="chips">
                <button
                  class="chip muted"
                  v-for="item in historyList"
                  :key="item"
                  @click="doSearch(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </div>

          <div class="hint">
            提示：支持书名 / 作者 / ISBN；回车搜索，ESC 关闭
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 登录 / 注册弹窗 -->
    <teleport to="body">
      <div v-if="authOpen" class="auth-mask" @click.self="closeAuth">
        <div class="auth-dialog">
          <div class="auth-tabs">
            <button
              class="auth-tab"
              :class="{ active: authTab === 'login' }"
              @click="authTab = 'login'; authError = null"
            >
              登录
            </button>
            <button
              class="auth-tab"
              :class="{ active: authTab === 'register' }"
              @click="authTab = 'register'; authError = null"
            >
              注册
            </button>
          </div>

          <div class="auth-body" v-if="authTab === 'login'">
            <!-- 左：二维码占位 -->
            <div class="auth-left qr-area">
              <div class="qr-box">扫码进入小程序</div>
              <p class="qr-text">手机端与网站账号互通，支持同步订单与收藏。</p>
            </div>

            <!-- 右：手机号 + 密码 -->
            <div class="auth-right">
              <h3>手机号登录</h3>
              <label class="field">
                <span>手机号</span>
                <input v-model="loginForm.telephone" placeholder="请输入手机号" />
              </label>
              <label class="field">
                <span>密码</span>
                <input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="至少8位，包含字母和数字"
                />
              </label>
              <p v-if="authError" class="auth-error">{{ authError }}</p>
              <button class="auth-primary-btn" @click="handleLogin">登录</button>
              <p class="auth-switch">
                还没有账号？
                <button class="link-btn" @click="authTab = 'register'; authError = null">
                  立即注册
                </button>
              </p>
            </div>
          </div>

          <div class="auth-body" v-else>
            <!-- 左：头像 -->
            <div class="auth-left avatar-area">
              <div class="avatar-preview">
                <img :src="registerForm.avatar || defaultAvatarUrl" alt="avatar" />
              </div>
              <label class="upload-btn">
                选择头像
                <input type="file" accept="image/*" @change="handleAvatarChange" hidden />
              </label>
              <p class="upload-hint">
                不上传则使用默认小绿叶头像。
              </p>
            </div>

            <!-- 右：用户名 + 真实姓名 + 手机号 + 密码两次 -->
            <div class="auth-right">
              <h3>创建账户</h3>
              <label class="field">
                <span>用户名（唯一）</span>
                <input v-model="registerForm.username" placeholder="用于展示和登录识别，可选填" />
              </label>
              <label class="field">
                <span>真实姓名</span>
                <input v-model="registerForm.name" placeholder="请填写真实姓名，便于售后服务" />
              </label>
              <label class="field">
                <span>手机号</span>
                <input v-model="registerForm.telephone" placeholder="请输入手机号" />
              </label>
              <label class="field">
                <span>密码</span>
                <input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="至少8位，包含字母和数字"
                />
              </label>
              <label class="field">
                <span>确认密码</span>
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                />
              </label>
              <p v-if="authError" class="auth-error">{{ authError }}</p>
              <button class="auth-primary-btn" @click="handleRegister" :disabled="uploadingAvatar">
                {{ uploadingAvatar ? '上传头像中...' : '注册并登录' }}
              </button>
              <p class="auth-switch">
                已有账号？
                <button class="link-btn" @click="authTab = 'login'; authError = null">
                  直接登录
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </header>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { login, register, uploadImage } from "@/api";
import type { LoginRequest, RegisterRequest } from "@/api/types";

const router = useRouter();

const leafCount = ref(12);

const searchOpen = ref(false);
const keyword = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const HOT_KEY = "greenbook_search_history";
const TOKEN_KEY = "GB_TOKEN";
const historyList = ref<string[]>([]);

/** ✅ 二手书场景：热门搜索词 */
const hotList = [
  "考研英语",
  "高等数学",
  "数据结构",
  "操作系统",
  "线性代数",
  "概率论",
  "计算机网络",
  "四六级",
  "教材",
  "小说"
];

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HOT_KEY);
    historyList.value = raw ? JSON.parse(raw) : [];
  } catch {
    historyList.value = [];
  }
};

const saveHistory = () => {
  localStorage.setItem(HOT_KEY, JSON.stringify(historyList.value));
};

const pushHistory = (q: string) => {
  const query = q.trim();
  if (!query) return;
  historyList.value = [query, ...historyList.value.filter(x => x !== query)].slice(0, 8);
  saveHistory();
};

const clearHistory = () => {
  historyList.value = [];
  saveHistory();
};

const openSearch = async () => {
  searchOpen.value = true;
  // 阻止body滚动
  document.body.style.overflow = 'hidden';
  await nextTick();
  inputRef.value?.focus();
};

const closeSearch = () => {
  searchOpen.value = false;
  // 恢复body滚动
  document.body.style.overflow = '';
};

/** 这里先用 console.log 占位，你后面接路由/接口就行 */
const doSearch = (q: string) => {
  const query = q.trim();
  if (!query) return;

  keyword.value = query;
  pushHistory(query);

  // TODO: 这里换成你的搜索逻辑：
  // router.push({ path: '/search', query: { q: query } })
  console.log("[Search]", query);

  // 可选：搜索后关闭抽屉
  closeSearch();
};

// 监听组件卸载，确保恢复滚动
onMounted(() => {
  loadHistory();
  
  // 添加键盘监听
  const handleKeydown = (e: KeyboardEvent) => {
    if (searchOpen.value && e.key === 'Escape') {
      closeSearch();
    }
  };
  
  window.addEventListener('keydown', handleKeydown);
  
  // 清理函数
  return () => {
    window.removeEventListener('keydown', handleKeydown);
    // 确保恢复滚动
    document.body.style.overflow = '';
  };
});

// 监听searchOpen变化，确保抽屉关闭时恢复滚动
watch(searchOpen, (newVal) => {
  if (!newVal) {
    document.body.style.overflow = '';
  }
});

/* ----------------- 登录 / 注册弹窗 ----------------- */

const authOpen = ref(false);
const authTab = ref<"login" | "register">("login");

const loginForm = reactive<LoginRequest>({
  telephone: "",
  password: "",
});

const registerForm = reactive<RegisterRequest & { confirmPassword: string }>({
  username: "",
  name: "",
  avatar: "",
  telephone: "",
  password: "",
  confirmPassword: "",
});

const authError = ref<string | null>(null);
const uploadingAvatar = ref(false);

const defaultAvatarUrl = "https://wonderful1.oss-cn-hangzhou.aliyuncs.com/leaf.jpg";


const isLoggedIn = computed(() => !!localStorage.getItem(TOKEN_KEY));

const openAuth = (tab: "login" | "register" = "login") => {
  authTab.value = tab;
  authOpen.value = true;
  authError.value = null;
};

const closeAuth = () => {
  authOpen.value = false;
  authError.value = null;
};

const onUserIconClick = () => {
  if (isLoggedIn.value) {
    router.push("/profile");
  } else {
    openAuth("login");
  }
};

const validateTelephone = (tel: string) => /^1\d{10}$/.test(tel);

const validatePassword = (pwd: string) => pwd.length >= 8;


const handleLogin = async () => {
  authError.value = null;
  if (!validateTelephone(loginForm.telephone)) {
    authError.value = "请输入有效的手机号（11位，以1开头）";
    return;
  }
  if (!validatePassword(loginForm.password)) {
    authError.value = "密码至少8位，需包含字母和数字";
    return;
  }
  try {
    console.log("登录发送信息", loginForm);
    const res = await login({ ...loginForm });
    console.log("登录返回信息", res);
    localStorage.setItem(TOKEN_KEY, res.data.toString());
    console.log("登录成功，设置token", localStorage.getItem(TOKEN_KEY));
    closeAuth();
    router.push("/");
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg.includes("用户名") || msg.includes("密码")) {
      authError.value = "该手机号未注册或密码错误";
    } else {
      authError.value = msg || "登录失败，请稍后重试";
    }
  }
};

const handleRegister = async () => {
  console.log("注册发送信息已点击");
  authError.value = null;
  const tel = registerForm.telephone;
  if (!validateTelephone(tel)) {
    authError.value = "请输入有效的手机号（11位，以1开头）";
    return;
  }
  if (!validatePassword(registerForm.password)) {
    authError.value = "密码至少8位，需包含字母和数字";
    return;
  }
  if (!registerForm.name || !registerForm.name.trim()) {
    authError.value = "请填写真实姓名";
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    authError.value = "两次输入的密码不一致";
    return;
  }
  const payload: RegisterRequest = {
    telephone: tel,
    password: registerForm.password,
    username: registerForm.username,
    name: registerForm.name || "叶子",
    avatar: registerForm.avatar || defaultAvatarUrl,
  };
  console.log("注册发送信息", payload);
  try {
    const registerRes = await register(payload);
    
    console.log("注册返回信息", registerRes);
    // 注册成功后自动登录
    // const loginRes = await login({ telephone: tel, password: registerForm.password });
    // localStorage.setItem(TOKEN_KEY, loginRes.data.token);
    // closeAuth();
    // router.push("/");
  } catch (e: any) {
    const msg = e?.message || "";
    authError.value = msg || "注册失败，请稍后重试";
  }
};

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 未登录时不允许调用需要 token 的上传接口
  if (!localStorage.getItem(TOKEN_KEY)) {
    authError.value = "请先完成注册并登录后，再在个人主页中上传头像";
    target.value = "";
    return;
  }

  uploadingAvatar.value = true;
  try {
    const res = await uploadImage(file);
    registerForm.avatar = res.data;
  } catch {
    authError.value = "头像上传失败，请稍后重试";
  } finally {
    uploadingAvatar.value = false;
  }
};
</script>

<style scoped>
/* Header 基础 */
.header {
  background: #ffffff;
  border-bottom: 1px solid #eeeeee;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* 左：搜索入口 */
.left-area {
  display: flex;
  align-items: center;
  min-width: 280px;
}

.search-pill {
  width: 280px;
  height: 36px;
  display: flex;
  align-items: center;
  border: 1px solid #2d583f;
  border-radius: 999px;
  padding: 0 14px;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.placeholder {
  flex: 1;
  font-size: 14px;
  color: #9a9a9a;
}
.icon-svg-search {
  width: 18px;
  height: 18px;
  color: #2d583f;
  transition: color 0.2s;
}

/* 中：Logo 永远居中 */
.center-logo {
  position: absolute;
  color: #2d583f;
  left: 50%;
  transform: translateX(-50%);
}

.main-logo {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
}

/* 右：图标 */
.right-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-svg {
  width: 18px;
  height: 18px;
  color: #666;
  transition: color 0.2s;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  position: relative;
}

.icon-wrapper:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.icon-wrapper:hover .icon-svg {
  color: #111;
}

.user-icon {
  border: 1px solid #dddddd;
}

/* 去卖书 hover 文案 */
.sell-book .hover-text {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sell-book:hover .hover-text {
  opacity: 1;
  transform: translateX(-50%) translateY(4px);
}

/* 绿叶积分 */
.leaf-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: #f0f8f0;
  border-radius: 999px;
  cursor: pointer;
}

.leaf-icon-svg {
  width: 16px;
  height: 16px;
  color: #2d583f;
}

.leaf-num {
  margin-left: 4px;
  font-size: 13px;
  color: #2d583f;
  font-weight: 600;
}

/* 灰色遮罩层 - 没有transition动画，立即显示/隐藏 */
.mask-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2999;
  /* 没有transition属性 */
}

/* 搜索抽屉 - 有transition动画 */
.search-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 42px 80px 26px;
  z-index: 3000;
  box-sizing: border-box;
  transform: translateY(0);
}

/* 顶部输入 + 关闭 */
.search-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex: 1;
  font-size: 18px;
  border: none;
  border-bottom: 2px solid #111;
  outline: none;
  padding: 10px 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 22px;
  line-height: 40px;
  color: #666;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111;
}

.search-body {
  margin-top: 26px;
  display: flex;
  gap: 80px;
}

.col {
  min-width: 280px;
}

.col-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.col-title.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: #777;
}

.clear-btn:hover {
  color: #111;
}

.empty {
  color: #aaa;
  font-size: 13px;
  padding: 6px 0;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.chip:hover {
  border-color: #111;
  transform: translateY(-1px);
}

.chip.muted {
  color: #555;
}

/* 小提示 */
.hint {
  margin-top: 18px;
  font-size: 12px;
  color: #999;
}

/* 抽屉动画：从上到下展开 */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.drawer-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.drawer-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.drawer-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.drawer-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 登录 / 注册弹窗 */
.auth-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

.auth-dialog {
  width: 720px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
  padding: 18px 22px 22px;
}

.auth-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.auth-tab {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 15px;
  cursor: pointer;
  color: #777;
}

.auth-tab.active {
  background: #2d583f;
  color: #fff;
}

.auth-body {
  display: flex;
  gap: 24px;
  padding-top: 4px;
}

.auth-left {
  width: 260px;
  border-right: 1px solid #f1e3cf;
  padding-right: 18px;
}

.auth-right {
  flex: 1;
}

.auth-right h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #2d583f;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #555;
}

.field input {
  border-radius: 999px;
  border: 1px solid #d5c5ad;
  padding: 8px 12px;
  outline: none;
  font-size: 14px;
}

.field input:focus {
  border-color: #2d583f;
}

.auth-primary-btn {
  width: 100%;
  border: none;
  margin-top: 4px;
  border-radius: 999px;
  background: #2d583f;
  color: #fff;
  padding: 9px 0;
  font-size: 15px;
  cursor: pointer;
}

.auth-primary-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.auth-error {
  margin: 4px 0 2px;
  font-size: 13px;
  color: #d40000;
}

.auth-switch {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.qr-area .qr-box {
  width: 160px;
  height: 160px;
  border-radius: 16px;
  border: 1px dashed rgba(200, 177, 150, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 13px;
  color: #7a6b5c;
  background: #fffdf7;
}

.qr-text {
  font-size: 12px;
  color: #777;
  line-height: 1.5;
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2d583f;
  background: #fff;
  margin-bottom: 10px;
}

.upload-btn {
  border-radius: 999px;
  border: 1px solid #c8b196;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  background: #fff7eb;
  color: #7a6b5c;
}

.upload-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
  text-align: center;
}
</style>