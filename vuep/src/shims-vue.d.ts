// src/shims-vue.d.ts
import { ComponentCustomProperties } from 'vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $myProperty: string;
  }
}


declare module 'vue' {
  interface ComponentCustomProperties {
    $myProperty: string // 啊吧啊吧啊吧
    $translate: (key: string) => string
  }
}