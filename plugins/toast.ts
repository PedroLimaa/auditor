import Vue3Toastify, { toast, type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Vue3Toastify, {
    autoClose: 5000,
  } as ToastContainerOptions);
  return {
    provide: {
      toast,
    },
  };
});
