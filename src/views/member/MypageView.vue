<template>
  <div class="mypage-view">
    <div class="sf-wrap" :class="{ entered: mounted }">
      <div class="sf-head">
        <h1>마이페이지</h1>
        <p>내 정보를 확인하고 수정할 수 있습니다.</p>
      </div>

      <div class="profile-section">
        <div class="profile-img-wrap">
          <img :src="form.profile_photo || defaultAvatar" alt="프로필 이미지" class="profile-img" />
          <button class="btn-img-edit"><i class="bi bi-camera-fill"></i></button>
        </div>
        <div class="profile-info">
  		<h2>{{ authStore.auth?.username || form.name || '사용자' }}</h2>
  		<span><i class="bi bi-envelope"></i> {{ form.email || '이메일 없음' }}</span>
	</div>
	</div>

      <form @submit.prevent="handleUpdate" novalidate>
        <div class="sf-row">
          <div class="fg">
            <label>닉네임</label>
            <div class="fg-box">
              <i class="bi bi-person fg-ico"></i>
              <input type="text" v-model="form.name" placeholder="닉네임" />
            </div>
          </div>
          <div class="fg disabled">
            <label>아이디 (수정 불가)</label>
            <div class="fg-box">
              <i class="bi bi-at fg-ico"></i>
              <input type="text" :value="authStore.auth?.login_id" readonly disabled />
            </div>
          </div>
        </div>

        <div class="sf-row">
          <div class="fg">
            <label>생년월일</label>
            <div class="fg-box">
              <i class="bi bi-calendar fg-ico"></i>
              <input type="date" v-model="form.birth" />
            </div>
          </div>
          <div class="fg">
            <label>전화번호</label>
            <div class="fg-box">
              <i class="bi bi-phone fg-ico"></i>
              <input type="tel" v-model="form.tel" placeholder="010-0000-0000" />
            </div>
          </div>
        </div>

        <div class="sf-row">
          <div class="fg">
            <label>우편번호</label>
            <div class="fg-box fg-btn">
              <i class="bi bi-mailbox fg-ico"></i>
              <input type="text" v-model="form.zip" placeholder="우편번호" readonly @click="openPostcode" style="cursor: pointer;" />
              <button type="button" class="fg-dup" @click="openPostcode">주소찾기</button>
            </div>
          </div>
          <div class="fg">
            <label>이메일</label>
            <div class="fg-box">
              <i class="bi bi-envelope fg-ico"></i>
              <input type="email" v-model="form.email" placeholder="example@email.com" />
            </div>
          </div>
        </div>
        
        <div class="sf-row">
          <div class="fg">
            <label>기본주소</label>
            <div class="fg-box">
              <i class="bi bi-house fg-ico"></i>
              <input type="text" v-model="form.addr1" placeholder="주소찾기를 클릭하세요" readonly @click="openPostcode" style="cursor: pointer;" />
            </div>
          </div>
          <div class="fg">
            <label>상세주소</label>
            <div class="fg-box">
              <i class="bi bi-house-add fg-ico"></i>
              <input type="text" id="addr2Input" v-model="form.addr2" placeholder="상세주소 입력" />
            </div>
          </div>
        </div>

        <div class="sf-row">
           <div class="fg">
            <label>새 비밀번호 (변경 시에만 입력)</label>
            <div class="fg-box">
              <i class="bi bi-lock fg-ico"></i>
              <input :type="showPw ? 'text' : 'password'" v-model="form.newPassword" placeholder="변경할 비밀번호 입력" />
              <button type="button" class="fg-eye" @click="showPw = !showPw">
                <i :class="showPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <div class="fg" style="display: flex; align-items: flex-end;">
            <button type="submit" class="sf-submit" :disabled="loading">
              <span v-if="!loading">정보 수정하기 ✦</span>
              <span v-else class="sf-ld"><span></span><span></span><span></span></span>
            </button>
          </div>
        </div>

        <div class="sf-apimsg sf-apierr" v-if="apiError">{{ apiError }}</div>
        <div class="sf-apimsg sf-apiok"  v-if="apiSuccess">{{ apiSuccess }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import http from '@/util/http';
import defaultAvatar from '@/assets/img/avatar.png'; // 기본 아바타 이미지

const authStore = useAuthStore();
const mounted = ref(false);
const loading = ref(false);
const showPw = ref(false);
const apiError = ref('');
const apiSuccess = ref('');

// 폼 데이터 (member2 테이블 구조와 일치)
const form = ref({
  name: '',
  birth: '',
  tel: '',
  zip: '',
  addr1: '',
  addr2: '',
  email: '',
  profile_photo: '',
  newPassword: '' // 비번 변경용
});

onMounted(() => {
  setTimeout(() => mounted.value = true, 80);
  
  // 다음 우편번호 API 스크립트 로드
  const script = document.createElement('script');
  script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  document.head.appendChild(script);

  // 내 정보 불러오기 호출
  fetchMyProfile();
});

// ✅ 백엔드에서 내 정보 불러오기
const fetchMyProfile = async () => {
  try {
    // 주의: 백엔드에 /api/member/me 와 같이 내 정보를 주는 API가 필요합니다!
    // 당장 API가 없다면 authStore.auth 에 있는 기본 정보라도 세팅합니다.
    form.value.name = authStore.auth?.name || '';
    
    const response = await http.get('/member/me'); // 백엔드 연동용 URL
    if(response) {
      form.value = { ...form.value, ...response };
    }
  } catch (error) {
    console.log("프로필 정보를 불러오는 데 실패했습니다 (아직 백엔드 API가 없을 수 있습니다).");
  }
};

// ✅ 다음 우편번호 API
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      form.value.zip = data.zonecode;
      form.value.addr1 = addr;
      const addr2Input = document.getElementById('addr2Input');
      if(addr2Input) addr2Input.focus();
    }
  }).open();
};

// ✅ 정보 수정 저장
const handleUpdate = async () => {
  if (!form.value.name.trim()) {
    apiError.value = "닉네임은 필수입니다.";
    return;
  }
  
  loading.value = true;
  apiError.value = '';
  apiSuccess.value = '';
  
  try {
    await http.put('/member/update', form.value); 
    apiSuccess.value = '회원 정보가 성공적으로 수정되었습니다.';

    if(authStore.auth) {
        authStore.auth.username = form.value.name;
        authStore.auth.name = form.value.name;
    }
    
    let cachedData = JSON.parse(localStorage.getItem('auth') || '{}');
    if (cachedData && cachedData.auth) {
        cachedData.auth.username = form.value.name;
        cachedData.auth.name = form.value.name;
        localStorage.setItem('auth', JSON.stringify(cachedData));
    }

    // setTimeout(() => { window.location.reload(); }, 1500); // <--- 이 코드가 있다면 무조건 지워주세요!

  } catch(e) {
    apiError.value = e.response?.data?.message || '정보 수정 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 기존 다크 테마 디자인 100% 적용 */
.mypage-view {
  min-height: calc(100vh - 68px);
  background: #0C0B1A;
  display: flex;
  justify-content: center;
  padding: 40px 24px;
  font-family: "Pretendard", sans-serif;
  color: #F0EFF8;
}

.sf-wrap {
  width: 100%;
  max-width: 600px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.sf-wrap.entered { opacity: 1; transform: translateY(0); }

.sf-head { margin-bottom: 30px; text-align: center; }
.sf-head h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
.sf-head p { font-size: 14px; color: rgba(220, 218, 240, 0.4); font-weight: 300; }

/* 프로필 사진 섹션 */
.profile-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(180, 160, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 30px;
}
.profile-img-wrap { position: relative; }
.profile-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(180, 160, 255, 0.3); }
.btn-img-edit { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; border-radius: 50%; background: #8889C4; border: none; color: #fff; font-size: 12px; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: all 0.2s; }
.btn-img-edit:hover { background: #6667AB; transform: scale(1.1); }
.profile-info h2 { font-size: 18px; font-weight: 700; margin: 0 0 6px 0; color: #DDD6FE; }
.profile-info span { font-size: 13px; color: rgba(220, 218, 240, 0.4); }

/* 폼 스타일 */
.sf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
@media (max-width: 520px) { .sf-row { grid-template-columns: 1fr; } }

.fg { margin-bottom: 14px; }
.fg.disabled { opacity: 0.6; pointer-events: none; }
.fg label { display: block; font-size: 12px; font-weight: 500; color: rgba(220, 218, 240, 0.38); margin-bottom: 7px; }
.fg-box { display: flex; align-items: center; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(180, 160, 255, 0.12); border-radius: 14px; overflow: hidden; transition: all 0.22s; height: 46px; }
.fg-box:focus-within { border-color: rgba(180, 160, 255, 0.38); background: rgba(180, 160, 255, 0.05); box-shadow: 0 0 0 3px rgba(120, 121, 192, 0.1); }
.fg-ico { padding: 0 12px; color: rgba(220, 218, 240, 0.2); font-size: 14.5px; }
.fg-box input { flex: 1; border: none; outline: none; padding: 0 8px 0 0; font-size: 14px; color: #F0EFF8; background: transparent; font-family: inherit; height: 100%; width: 100%; }
.fg-box input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
.fg-box input::placeholder { color: rgba(220, 218, 240, 0.18); }

/* 버튼 및 부가 요소 */
.fg-btn { padding-right: 0; }
.fg-dup { border: none; background: rgba(180, 160, 255, 0.12); color: #C4B5FD; font-size: 11.5px; font-weight: 600; padding: 0 14px; height: 100%; cursor: pointer; border-left: 1px solid rgba(180, 160, 255, 0.12); white-space: nowrap; transition: all 0.2s; }
.fg-dup:hover { background: rgba(180, 160, 255, 0.22); color: #DDD6FE; }
.fg-eye { background: none; border: none; color: rgba(220, 218, 240, 0.22); padding: 0 12px; cursor: pointer; font-size: 14px; transition: color 0.2s; }
.fg-eye:hover { color: #C4B5FD; }

.sf-apimsg { padding: 11px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 14px; }
.sf-apierr { background: rgba(248, 113, 113, 0.08); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.2); }
.sf-apiok  { background: rgba(74, 222, 128, 0.08); color: #4ADE80; border: 1px solid rgba(74, 222, 128, 0.2); }

.sf-submit { width: 100%; height: 46px; border: none; border-radius: 14px; background: linear-gradient(135deg, #9A9BD0, #7879C0, #6667AB); color: #fff; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: all 0.28s; box-shadow: 0 0 28px rgba(120, 121, 192, 0.28); }
.sf-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 48px rgba(120, 121, 192, 0.5); }
.sf-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.sf-ld { display: flex; align-items: center; justify-content: center; gap: 5px; }
.sf-ld span { width: 6px; height: 6px; border-radius: 50%; background: #fff; opacity: 0.4; animation: ldot 1.2s infinite; }
.sf-ld span:nth-child(2){animation-delay:.2s} .sf-ld span:nth-child(3){animation-delay:.4s}
@keyframes ldot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1);opacity:1}}
</style>