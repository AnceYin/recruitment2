import { defineStore } from 'pinia';

export const useTabbarStore = defineStore('tabbarStore', {
  state: () => ({
    tabbarPageParam: null,
  }),
  actions: {
    setTabbarPageParam(param) {
      // 允许传递任意类型的参数，并存储在 tabbarPageParam 中
      this.tabbarPageParam = param;
    },
    getTabbarPageParam() {
      return this.tabbarPageParam;
    },
    clearTabbarPageParam() {
      this.tabbarPageParam = null;
    },
  },
});
