import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useHostStore = defineStore('useHost', () => {
    // 개발: '' (빈 문자열 → Vite proxy 사용)
    // 운영: 실제 서버 주소 (.env.production 에서 주입)
    const host = ref(import.meta.env.VITE_API_HOST || '');

    return {
        host
    };
});