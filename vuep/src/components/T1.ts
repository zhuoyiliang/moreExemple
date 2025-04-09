import { defineComponent, h } from 'vue';


export default defineComponent({
  render() {
    return h('div', 'T1');
  },
  mounted() { // 添加类型断言
    console.log("myProperty: ", this.$myProperty); // 可以访问自定义属性
  }
});