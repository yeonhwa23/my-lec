<template>
  <div class="lv">
    <!-- 좌측 브랜드 패널 -->
    <div class="lv-left">
      <div class="ll-bg">
        <div class="ll-orb o1"></div>
        <div class="ll-orb o2"></div>
        <div class="ll-grid"></div>
      </div>
      <div class="ll-inner">
        <router-link to="/" class="ll-logo">
          <div class="ll-mark">✦</div>
          <span class="ll-name">Weave</span>
        </router-link>
        <div class="ll-copy">
          <h2>다시 <span class="ll-grad">연결</span>될<br>준비가 됐나요?</h2>
          <p>팀의 모든 대화와 문서가<br>지금도 계속되고 있습니다.</p>
        </div>
        <div class="ll-status">
          <div class="ll-st-row">
            <span class="ll-dot green"></span>
            <span>실시간 활성 채널</span>
            <strong>24개</strong>
          </div>
          <div class="ll-st-sep"></div>
          <div class="ll-st-row">
            <span class="ll-dot peri"></span>
            <span>오늘 생성된 문서</span>
            <strong>8개</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 우측 폼 -->
    <div class="lv-right">
      <div class="lf-wrap" :class="{ entered: mounted }">
        <div class="lf-head">
          <h1>로그인</h1>
          <p>계정이 없으신가요? <router-link to="/signup">무료 가입 →</router-link></p>
        </div>

        <div class="lf-social">
          <button class="lf-soc google" @click="() => {}">
            <svg width="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google로 계속하기
          </button>
          <button class="lf-soc kakao" @click="() => {}">
            <svg width="17" viewBox="0 0 24 24"><path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.72 1.65 5.12 4.13 6.56l-1.05 3.9 4.56-2.97c.76.1 1.54.16 2.36.16 5.523 0 10-3.477 10-7.65C22 6.477 17.523 3 12 3z"/></svg>
            카카오로 계속하기
          </button>
        </div>

        <div class="lf-or"><span></span><em>또는 아이디로 로그인</em><span></span></div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="fg" :class="{ focus: focused==='id', err: errors.login_id }">
            <label>아이디</label>
            <div class="fg-box">
              <i class="bi bi-person-circle fg-ico"></i>
              <input type="text" v-model="form.login_id" placeholder="아이디를 입력하세요"
                @focus="focused='id'" @blur="focused=null" autocomplete="username" />
            </div>
            <p class="fg-err" v-if="errors.login_id">{{ errors.login_id }}</p>
          </div>

          <div class="fg" :class="{ focus: focused==='pw', err: errors.password }">
            <div class="fg-lrow">
              <label>비밀번호</label>
              <a href="#" class="fg-forgot">비밀번호 찾기</a>
            </div>
            <div class="fg-box">
              <i class="bi bi-lock fg-ico"></i>
              <input :type="showPw?'text':'password'" v-model="form.password" placeholder="비밀번호를 입력하세요"
                @focus="focused='pw'" @blur="focused=null" autocomplete="current-password" />
              <button type="button" class="fg-eye" @click="showPw=!showPw"><i :class="showPw?'bi bi-eye-slash':'bi bi-eye'"></i></button>
            </div>
            <p class="fg-err" v-if="errors.password">{{ errors.password }}</p>
          </div>

          <label class="fg-check">
            <input type="checkbox" v-model="form.remember" />
            <span class="fg-cm"></span>
            <span>로그인 상태 유지</span>
          </label>

          <div class="lf-api-err" v-if="apiError"><i class="bi bi-exclamation-triangle-fill"></i> {{ apiError }}</div>

          <button type="submit" class="lf-submit" :disabled="loading">
            <span v-if="!loading" class="ls-inner">워크스페이스 입장 <i class="bi bi-arrow-right"></i></span>
            <span v-else class="ls-ld"><span></span><span></span><span></span></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter(); const route = useRoute(); const authStore = useAuthStore()
const form = ref({ login_id: '', password: '', remember: false })
const errors = ref({}); const apiError = ref(''); const loading = ref(false)
const showPw = ref(false); const focused = ref(null); const mounted = ref(false)

onMounted(() => setTimeout(() => mounted.value = true, 80))

const validate = () => {
  errors.value = {}
  if (!form.value.login_id.trim()) errors.value.login_id = '아이디를 입력해주세요.'
  if (!form.value.password) errors.value.password = '비밀번호를 입력해주세요.'
  return Object.keys(errors.value).length === 0
}
const handleLogin = async () => {
  if (!validate()) return
  loading.value = true; apiError.value = ''
  try { await authStore.login({ login_id: form.value.login_id, password: form.value.password }); router.push(route.query.redirect || '/') }
  catch (e) { apiError.value = e.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.' }
  finally { loading.value = false }
}
</script>

<style scoped>
.lv { display: flex; min-height: 100vh; font-family: "Pretendard", sans-serif; }

/* ─ 좌측 ─ */
.lv-left { flex: 0 0 420px; position: relative; overflow: hidden; }
@media (max-width: 900px) { .lv-left { display: none; } }

.ll-bg { position: absolute; inset: 0; }
.ll-orb { position: absolute; border-radius: 50%; }
.o1 { width:500px;height:500px;background:radial-gradient(circle,rgba(120,121,192,0.3),transparent 65%);top:-120px;right:-80px;filter:blur(2px);animation:orbDrift 14s ease-in-out infinite; }
.o2 { width:380px;height:380px;background:radial-gradient(circle,rgba(167,139,250,0.18),transparent 65%);bottom:-60px;left:-80px;animation:orbDrift 18s ease-in-out infinite reverse; }
@keyframes orbDrift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-26px)} }
.ll-grid { position:absolute;inset:0;background:linear-gradient(155deg,#1A1740 0%,#141240 45%,#0E0D28 100%); }
.ll-grid::after { content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:36px 36px; }

.ll-inner { position:relative;z-index:2;padding:52px 44px;display:flex;flex-direction:column;height:100%; }
.ll-logo { display:inline-flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:68px; }
.ll-mark { width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:17px;color:#fff;border:1px solid rgba(255,255,255,0.22); }
.ll-name { font-size:22px;font-weight:800;color:#fff;letter-spacing:-.05em; }

.ll-copy { margin-bottom:auto; }
.ll-copy h2 { font-size:2.5rem;font-weight:800;color:#fff;line-height:1.18;margin-bottom:18px;letter-spacing:-.03em; }
.ll-grad { background:linear-gradient(135deg,#DDD6FE,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.ll-copy p { font-size:14.5px;color:rgba(255,255,255,0.45);line-height:1.8;font-weight:300; }

.ll-status { background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:16px;padding:20px 22px;backdrop-filter:blur(12px); }
.ll-st-row { display:flex;align-items:center;gap:10px;font-size:13.5px;color:rgba(255,255,255,0.65);font-weight:300; }
.ll-st-row strong { margin-left:auto;color:#fff;font-weight:600; }
.ll-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.ll-dot.green { background:#4ADE80;box-shadow:0 0 8px rgba(74,222,128,0.5); }
.ll-dot.peri  { background:#8889C4;box-shadow:0 0 8px rgba(136,137,196,0.6); }
.ll-st-sep { border-top:1px solid rgba(255,255,255,0.1);margin:14px 0; }

/* ─ 우측 ─ */
.lv-right { flex:1;background:#0C0B1A;display:flex;align-items:center;justify-content:center;padding:48px 24px;overflow-y:auto; }
.lf-wrap { width:100%;max-width:420px;opacity:0;transform:translateY(16px);transition:opacity 0.55s ease,transform 0.55s ease; }
.lf-wrap.entered { opacity:1;transform:translateY(0); }

.lf-head { margin-bottom:32px; }
.lf-head h1 { font-size:2rem;font-weight:800;color:#F0EFF8;margin-bottom:8px;letter-spacing:-.03em; }
.lf-head p { font-size:14px;color:rgba(220,218,240,0.38);font-weight:300; }
.lf-head a { color:#C4B5FD;font-weight:500;text-decoration:none; }
.lf-head a:hover { color:#DDD6FE; }

.lf-social { display:flex;flex-direction:column;gap:10px;margin-bottom:22px; }
.lf-soc { display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;border-radius:14px;font-size:14px;font-weight:400;cursor:pointer;transition:all 0.22s;font-family:inherit; }
.lf-soc.google { background:rgba(255,255,255,0.05);border:1px solid rgba(180,160,255,0.14);color:rgba(220,218,240,0.65); }
.lf-soc.google:hover { border-color:rgba(180,160,255,0.3);background:rgba(180,160,255,0.07);transform:translateY(-1px); }
.lf-soc.kakao { background:#FEE500;border:none;color:#3C1E1E;font-weight:600; }
.lf-soc.kakao:hover { background:#FFD700;transform:translateY(-1px);box-shadow:0 4px 20px rgba(254,229,0,0.25); }

.lf-or { display:flex;align-items:center;gap:12px;margin-bottom:24px; }
.lf-or span { flex:1;height:1px;background:rgba(180,160,255,0.1); }
.lf-or em { font-size:12px;color:rgba(220,218,240,0.25);white-space:nowrap;font-style:normal;font-weight:300; }

/* 폼 그룹 */
.fg { margin-bottom:18px; }
.fg label { display:block;font-size:12px;font-weight:500;color:rgba(220,218,240,0.38);margin-bottom:8px;transition:color 0.2s;letter-spacing:0.03em; }
.fg.focus label { color:#C4B5FD; }
.fg-lrow { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px; }
.fg-lrow label { margin-bottom:0; }
.fg-forgot { font-size:12px;color:#8889C4;text-decoration:none;opacity:0.7;transition:opacity 0.2s;font-weight:400; }
.fg-forgot:hover { opacity:1; }

.fg-box { display:flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(180,160,255,0.12);border-radius:14px;overflow:hidden;transition:all 0.22s; }
.fg.focus .fg-box { border-color:rgba(180,160,255,0.4);background:rgba(180,160,255,0.06);box-shadow:0 0 0 3px rgba(120,121,192,0.1); }
.fg.err .fg-box { border-color:rgba(248,113,113,0.4); }

.fg-ico { padding:0 14px;color:rgba(220,218,240,0.22);font-size:15px;flex-shrink:0;transition:color 0.2s; }
.fg.focus .fg-ico { color:#C4B5FD; }
.fg-box input { flex:1;background:transparent;border:none;outline:none;padding:14px 8px 14px 0;font-size:14.5px;color:#F0EFF8;font-family:inherit;font-weight:400; }
.fg-box input::placeholder { color:rgba(220,218,240,0.18); }
.fg-eye { background:none;border:none;color:rgba(220,218,240,0.22);padding:0 14px;cursor:pointer;font-size:14px;display:flex;align-items:center;transition:color 0.2s; }
.fg-eye:hover { color:#C4B5FD; }
.fg-err { margin-top:6px;font-size:12px;color:#F87171;font-weight:400; }

.fg-check { display:flex;align-items:center;gap:9px;cursor:pointer;font-size:13px;color:rgba(220,218,240,0.32);margin-bottom:22px;user-select:none;font-weight:300; }
.fg-check input[type=checkbox] { display:none; }
.fg-cm { width:16px;height:16px;border:1.5px solid rgba(180,160,255,0.2);border-radius:5px;flex-shrink:0;background:transparent;display:flex;align-items:center;justify-content:center;transition:all 0.2s; }
.fg-check input:checked + .fg-cm { background:linear-gradient(135deg,#8889C4,#7879C0);border-color:transparent; }
.fg-check input:checked + .fg-cm::after { content:'';width:4px;height:7px;border:1.5px solid #fff;border-top:none;border-left:none;transform:rotate(45deg) translateY(-1px); }

.lf-api-err { display:flex;align-items:center;gap:8px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:12px;padding:11px 14px;font-size:13px;color:#F87171;margin-bottom:18px; }

.lf-submit { width:100%;padding:15px;border:none;border-radius:14px;background:linear-gradient(135deg,#9A9BD0,#7879C0,#6667AB);color:#fff;font-size:14.5px;font-weight:600;cursor:pointer;transition:all 0.28s;font-family:inherit;margin-bottom:22px;box-shadow:0 0 28px rgba(120,121,192,0.28),inset 0 1px 0 rgba(255,255,255,0.16); }
.lf-submit:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 0 48px rgba(120,121,192,0.5),inset 0 1px 0 rgba(255,255,255,0.16); }
.lf-submit:disabled { opacity:0.5;cursor:not-allowed; }
.ls-inner { display:flex;align-items:center;justify-content:center;gap:8px; }
.ls-ld { display:flex;align-items:center;justify-content:center;gap:5px; }
.ls-ld span { width:6px;height:6px;border-radius:50%;background:#fff;opacity:0.4;animation:ldot 1.2s infinite; }
.ls-ld span:nth-child(2){animation-delay:.2s} .ls-ld span:nth-child(3){animation-delay:.4s}
@keyframes ldot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1);opacity:1}}
</style>