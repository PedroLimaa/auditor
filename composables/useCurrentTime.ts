import { ref, onMounted, onBeforeUnmount } from "vue";
export const useCurrentTime = () => {
  const currentTime = ref("");

  const updateCurrentTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Mês começa em 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    currentTime.value = `${day}-${month}-${year} ${hours}.${minutes}.${seconds}`;
  };

  onMounted(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    onBeforeUnmount(() => {
      clearInterval(interval);
    });
  });
  return { currentTime };
};
