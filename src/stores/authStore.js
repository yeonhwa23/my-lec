import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';
import axios from 'axios'; // ⭐ 반드시 axios를 import 해야 서버랑 통신합니다!

export const useAuthStore = defineStore('useAuth', () => {
    const AUTH_KEY = 'user_auth';

    // 초기 상태
    const getInitialState = () => {
        const savedData = localStorage.getItem(AUTH_KEY);
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error("로컬스토리지 파싱 에러", e);
            }
        }

        // 데이터가 없거나 에러 발생 시 기본값 반환
        return {
            token: null,
            refreshToken: null,
            role: null,
            member_id: 0,
            username: null,
        };
    };

    // state : 초기값은 localStorage 에서 가져와 페이지 새로고침 시에도 유지
    const auth = reactive(getInitialState());

    // getters
    const isAuthenticated = computed(() => !!auth.token);
    const isAdmin = computed(() => auth.role === 'ADMIN' || auth.role === 'EMP');

    // actions
    // ⭐ [수정됨] 껍데기뿐이던 login 함수를 진짜 서버와 통신하는 함수로 변경!
    const login = async (loginForm) => {
        try {
            // vite.config.js의 proxy 설정 덕분에 '/api/signin'으로 보내면 스프링(9090)으로 날아갑니다.
            // (주의: 스프링 컨트롤러 주소가 /signin 이라면 /api/signin 으로 맵핑되게 맞춰주세요)
            const response = await axios.post('/api/signin', loginForm);
            
            // 스프링에서 성공적으로 데이터를 던져주면 그때 auth 객체에 저장합니다.
            const data = response.data;
            auth.token = data.accessToken;
            auth.refreshToken = data.refreshToken;
            auth.role = data.role;
            auth.member_id = data.member_id;
            auth.username = data.name;

            localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
            
            return true; // 화면(Login.vue) 쪽에 로그인 성공했다고 알려줌
        } catch (error) {
            console.error("로그인 통신 실패 ㅠㅠ:", error);
            throw error; // 화면 쪽으로 에러를 던져서 '아이디/비번 확인' 경고창을 띄우게 함
        }
    }

    // 토큰 재발급 시 Access Token 만 업데이트
    const updateToken = (newToken) => {
        auth.token = newToken;
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    };

    // 로그아웃 시 모든 상태 초기화
    const logout = () => {
        auth.token = null;
        auth.refreshToken = null;
        auth.role = null;
        auth.member_id = 0;
        auth.username = null;

        localStorage.removeItem(AUTH_KEY);
    };

    return { 
        auth, 
        isAuthenticated, 
        isAdmin,
        login, 
        updateToken, 
        logout 
    };
});