/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Swiper CSS 模块类型声明
declare module 'swiper/css' {
  const content: string
  export default content
}

declare module 'swiper/css/pagination' {
  const content: string
  export default content
}

