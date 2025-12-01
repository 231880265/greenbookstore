<template>
  <footer class="footer">
    <div class="footer-top-line"></div>
    <div class="footer-links">
      <span v-for="(item, idx) in footerLinks" :key="item">
        {{ item }}
        <span v-if="idx !== footerLinks.length - 1" class="divider">|</span>
      </span>
    </div>
    <div class="footer-copy">
      Copyright © 2025 GreenBook 书城 | 苏ICP备xxxx号 | 公安网安备 xxxxx 号
    </div>
  </footer>
</template>

<script setup lang="ts">
/** Footer 链接 **/
const footerLinks = ["新浪微博", "官方微信", "官方贴吧", "全球粉丝站", "简体中文"];
</script>

<style scoped>
/* Footer */
.footer {
  margin-top: auto;
  padding: 30px 0 40px;
  background: #fff0da;
  font-size: 13px;
  color: #2d583f;
  text-align: center;
}

.footer-top-line {
  border-top: 1px solid #c8b196;
  max-width: 1200px;
  margin: 0 auto 18px;
}

.footer-links {
  margin-bottom: 8px;
}

.footer-links .divider {
  margin: 0 10px;
  color: #c8b196;
}

.footer-copy {
  color: #c8b196;
  opacity: 0.8;
}
</style>

