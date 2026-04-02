<template>
  <div class="sv">
    <div class="sv-left">
      <div class="sl-bg">
        <div class="sl-orb o1"></div><div class="sl-orb o2"></div>
        <div class="sl-base"></div>
      </div>
      <div class="sl-inner">
        <router-link to="/" class="sl-logo">
          <div class="sl-mark">✦</div>
          <span class="sl-name">Weave</span>
        </router-link>
        <div class="sl-copy">
          <h2>대화가<br><span class="sl-grad">지식이 되는</span><br>순간</h2>
          <p>팀의 모든 순간을 영구적인 자산으로.<br>흐름을 끊지 않고, 함께 엮어가세요.</p>
        </div>
        <div class="sl-feats">
          <div class="sl-feat"><div class="sl-fic"><i class="bi bi-lightning-charge-fill"></i></div><div><strong>실시간 팀 채팅</strong><span>딜레이 없는 채널 기반 소통</span></div></div>
          <div class="sl-feat"><div class="sl-fic"><i class="bi bi-bookmark-star-fill"></i></div><div><strong>1클릭 아카이빙</strong><span>대화를 바로 문서 블록으로</span></div></div>
          <div class="sl-feat"><div class="sl-fic"><i class="bi bi-robot"></i></div><div><strong>AI 어시스턴트</strong><span>@멘션으로 즉시 AI 응답</span></div></div>
        </div>
        <div class="sl-online">
          <div class="sl-avs">
            <div class="sl-av" style="background:#7879C0">J</div>
            <div class="sl-av" style="background:#F59E0B">M</div>
            <div class="sl-av" style="background:#34D399">S</div>
            <div class="sl-av" style="background:#F472B6">A</div>
            <div class="sl-av more">+12</div>
          </div>
          <div class="sl-otxt"><strong>지금 16명이 협업 중</strong><span>오늘 3개의 워크스페이스 생성됨</span></div>
          <span class="sl-pulse"></span>
        </div>
      </div>
    </div>

    <div class="sv-right">
      <div class="sf-wrap" :class="{ entered: mounted }">
        <div class="sf-head">
          <h1>계정 만들기</h1>
          <p>이미 계정이 있으신가요? <router-link to="/login">로그인 →</router-link></p>
        </div>

        <div class="sf-social">
          <button class="sf-soc google">
            <svg width="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google로 가입
          </button>
          <button class="sf-soc kakao">
            <svg width="17" viewBox="0 0 24 24"><path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.72 1.65 5.12 4.13 6.56l-1.05 3.9 4.56-2.97c.76.1 1.54.16 2.36.16 5.523 0 10-3.477 10-7.65C22 6.477 17.523 3 12 3z"/></svg>
            카카오로 가입
          </button>
        </div>

        <div class="sf-or"><span></span><em>또는 직접 가입</em><span></span></div>

        <form @submit.prevent="handleSignup" novalidate>
          <div class="sf-row">
            <div class="fg" :class="{'fg-err':errors.name,'fg-ok':valid.name}">
              <label>이름</label>
              <div class="fg-box"><i class="bi bi-person fg-ico"></i><input type="text" v-model="form.name" @blur="validateName" placeholder="홍길동" autocomplete="name" /><i class="bi bi-check-circle-fill fg-ck" v-if="valid.name"></i></div>
              <span class="fe" v-if="errors.name">{{ errors.name }}</span>
            </div>
            <div class="fg" :class="{'fg-err':errors.login_id,'fg-ok':valid.login_id}">
              <label>아이디</label>
              <div class="fg-box fg-btn"><i class="bi bi-at fg-ico"></i><input type="text" v-model="form.login_id" @blur="checkId" placeholder="아이디" autocomplete="username" /><button type="button" class="fg-dup" @click="checkId">중복확인</button></div>
              <span class="fe" v-if="errors.login_id">{{ errors.login_id }}</span>
              <span class="fo" v-if="valid.login_id">✓ 사용 가능</span>
            </div>
          </div>

          <div class="fg" :class="{'fg-err':errors.email,'fg-ok':valid.email}">
            <label>이메일</label>
            <div class="fg-box"><i class="bi bi-envelope fg-ico"></i><input type="email" v-model="form.email" @blur="validateEmail" placeholder="example@email.com" autocomplete="email" /><i class="bi bi-check-circle-fill fg-ck" v-if="valid.email"></i></div>
            <span class="fe" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="fg" :class="{'fg-err':errors.password,'fg-ok':valid.password}">
            <label>비밀번호</label>
            <div class="fg-box"><i class="bi bi-lock fg-ico"></i><input :type="showPw?'text':'password'" v-model="form.password" @input="validatePassword" placeholder="8자 이상" autocomplete="new-password" /><button type="button" class="fg-eye" @click="showPw=!showPw"><i :class="showPw?'bi bi-eye-slash':'bi bi-eye'"></i></button></div>
            <div class="fg-str" v-if="form.password"><div class="fg-str-bar"><div class="fg-str-fill" :style="{width:pwStrength.pct+'%',background:pwStrength.color}"></div></div><span :style="{color:pwStrength.color}">{{ pwStrength.label }}</span></div>
            <span class="fe" v-if="errors.password">{{ errors.password }}</span>
          </div>

          <div class="fg" :class="{'fg-err':errors.passwordConfirm,'fg-ok':valid.passwordConfirm}">
            <label>비밀번호 확인</label>
            <div class="fg-box"><i class="bi bi-lock-fill fg-ico"></i><input :type="showPw2?'text':'password'" v-model="form.passwordConfirm" @blur="validatePasswordConfirm" placeholder="비밀번호 재입력" autocomplete="new-password" /><button type="button" class="fg-eye" @click="showPw2=!showPw2"><i :class="showPw2?'bi bi-eye-slash':'bi bi-eye'"></i></button><i class="bi bi-check-circle-fill fg-ck" v-if="valid.passwordConfirm"></i></div>
            <span class="fe" v-if="errors.passwordConfirm">{{ errors.passwordConfirm }}</span>
          </div>

          <label class="fg-agree">
            <input type="checkbox" v-model="form.agree" />
            <span class="fg-cm"></span>
            <span>서비스 이용약관 및 개인정보처리방침에 동의합니다.</span>
          </label>
          <span class="fe" v-if="errors.agree" style="display:block;margin-bottom:12px;">{{ errors.agree }}</span>

          <div class="sf-apimsg sf-apierr" v-if="apiError">{{ apiError }}</div>
          <div class="sf-apimsg sf-apiok"  v-if="apiSuccess">{{ apiSuccess }}</div>

          <button type="submit" class="sf-submit" :disabled="loading">
            <span v-if="!loading">가입 완료하기 ✦</span>
            <span v-else class="sf-ld"><span></span><span></span><span></span></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter(); const mounted = ref(false)
onMounted(() => setTimeout(() => mounted.value = true, 80))
const form = ref({ name:'',login_id:'',email:'',password:'',passwordConfirm:'',agree:false })
const errors = ref({}); const valid = ref({})
const apiError = ref(''); const apiSuccess = ref('')
const loading = ref(false); const showPw = ref(false); const showPw2 = ref(false)

const pwStrength = computed(() => {
  const pw = form.value.password; if (!pw) return { pct:0, color:'#555', label:'' }
  let s = 0
  if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++
  return [{ pct:25, color:'#F87171', label:'매우 약함' },{ pct:50, color:'#FBBF24', label:'약함' },{ pct:75, color:'#FCD34D', label:'보통' },{ pct:100, color:'#4ADE80', label:'강함' }][s-1] || { pct:25, color:'#F87171', label:'매우 약함' }
})
const validateName = () => { if (!form.value.name.trim()) { errors.value.name='이름을 입력해주세요.'; valid.value.name=false } else { errors.value.name=''; valid.value.name=true } }
const validateEmail = () => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) { errors.value.email='이메일을 입력해주세요.'; valid.value.email=false }
  else if (!re.test(form.value.email)) { errors.value.email='올바른 이메일 형식이 아닙니다.'; valid.value.email=false }
  else { errors.value.email=''; valid.value.email=true }
}
const validatePassword = () => { if (form.value.password.length < 8) { errors.value.password='8자 이상이어야 합니다.'; valid.value.password=false } else { errors.value.password=''; valid.value.password=true } }
const validatePasswordConfirm = () => { if (form.value.password !== form.value.passwordConfirm) { errors.value.passwordConfirm='비밀번호가 일치하지 않습니다.'; valid.value.passwordConfirm=false } else if (form.value.passwordConfirm) { errors.value.passwordConfirm=''; valid.value.passwordConfirm=true } }
const checkId = async () => {
  if (!form.value.login_id.trim()) { errors.value.login_id='아이디를 입력해주세요.'; valid.value.login_id=false; return }
  try { const r = await axios.get(`/api/userIdCheck?login_id=${form.value.login_id}`); if (r.data.exists) { errors.value.login_id='이미 사용 중인 아이디입니다.'; valid.value.login_id=false } else { errors.value.login_id=''; valid.value.login_id=true } }
  catch { errors.value.login_id='확인 중 오류가 발생했습니다.' }
}
const handleSignup = async () => {
  validateName(); validateEmail(); validatePassword(); validatePasswordConfirm()
  if (!form.value.agree) errors.value.agree='약관에 동의해주세요.'; else errors.value.agree=''
  if (Object.values(errors.value).some(e=>e) || !valid.value.login_id) return
  loading.value=true; apiError.value=''; apiSuccess.value=''
  try { await axios.post('/api/signup',{login_id:form.value.login_id,password:form.value.password,name:form.value.name,email:form.value.email}); apiSuccess.value='가입 완료! 로그인 페이지로 이동합니다.'; setTimeout(()=>router.push('/login'),1800) }
  catch(e) { apiError.value=e.response?.data?.message||'회원가입 중 오류가 발생했습니다.' }
  finally { loading.value=false }
}
</script>

<style scoped>
.sv { display:flex;min-height:100vh;font-family:"Pretendard",sans-serif; }

.sv-left { flex:0 0 440px;position:relative;overflow:hidden; }
@media (max-width:980px) { .sv-left { display:none; } }
.sl-bg { position:absolute;inset:0; }
.sl-orb { position:absolute;border-radius:50%;filter:blur(2px); }
.o1 { width:450px;height:450px;background:radial-gradient(circle,rgba(120,121,192,0.32),transparent 65%);top:-100px;right:-80px;animation:orbD 14s ease-in-out infinite; }
.o2 { width:350px;height:350px;background:radial-gradient(circle,rgba(167,139,250,0.2),transparent 65%);bottom:-60px;left:-80px;animation:orbD 18s ease-in-out infinite reverse; }
@keyframes orbD { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-24px)} }
.sl-base { position:absolute;inset:0;background:linear-gradient(160deg,#1C1940 0%,#161440 45%,#0E0D28 100%); }
.sl-base::after { content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:36px 36px; }

.sl-inner { position:relative;z-index:2;padding:50px 44px;display:flex;flex-direction:column;height:100%; }
.sl-logo { display:inline-flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:60px; }
.sl-mark { width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,0.14);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:17px;color:#fff;border:1px solid rgba(255,255,255,0.2); }
.sl-name { font-size:22px;font-weight:800;color:#fff;letter-spacing:-.05em; }

.sl-copy { margin-bottom:36px; }
.sl-copy h2 { font-size:2.3rem;font-weight:800;color:#fff;line-height:1.2;margin-bottom:14px;letter-spacing:-.03em; }
.sl-grad { background:linear-gradient(135deg,#DDD6FE,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.sl-copy p { font-size:14px;color:rgba(255,255,255,0.45);line-height:1.8;font-weight:300; }

.sl-feats { display:flex;flex-direction:column;gap:14px;margin-bottom:32px; }
.sl-feat { display:flex;align-items:center;gap:14px; }
.sl-fic { width:36px;height:36px;border-radius:10px;flex-shrink:0;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:15px;color:rgba(255,255,255,0.85); }
.sl-feat div { display:flex;flex-direction:column;gap:2px; }
.sl-feat strong { font-size:13px;color:rgba(255,255,255,0.85);font-weight:600; }
.sl-feat span   { font-size:11.5px;color:rgba(255,255,255,0.38);font-weight:300; }

.sl-online { margin-top:auto;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:12px;position:relative; }
.sl-avs { display:flex; }
.sl-av { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;margin-right:-7px;border:2px solid rgba(20,18,64,0.6); }
.sl-av.more { background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);font-size:9.5px; }
.sl-otxt { display:flex;flex-direction:column;gap:2px;margin-left:10px; }
.sl-otxt strong { font-size:13px;color:rgba(255,255,255,0.88);font-weight:600; }
.sl-otxt span   { font-size:11.5px;color:rgba(255,255,255,0.38);font-weight:300; }
.sl-pulse { position:absolute;top:14px;right:14px;width:9px;height:9px;border-radius:50%;background:#4ADE80;animation:pulse 2.2s infinite; }
@keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(74,222,128,0.5)} 70%{box-shadow:0 0 0 9px rgba(74,222,128,0)} 100%{box-shadow:0 0 0 0 rgba(74,222,128,0)} }

/* 우측 */
.sv-right { flex:1;background:#0C0B1A;display:flex;align-items:center;justify-content:center;padding:48px 24px;overflow-y:auto; }
.sf-wrap { width:100%;max-width:500px;opacity:0;transform:translateY(14px);transition:opacity 0.5s ease,transform 0.5s ease; }
.sf-wrap.entered { opacity:1;transform:translateY(0); }

.sf-head { margin-bottom:26px; }
.sf-head h1 { font-size:2rem;font-weight:800;color:#F0EFF8;margin-bottom:8px;letter-spacing:-.03em; }
.sf-head p { font-size:14px;color:rgba(220,218,240,0.38);font-weight:300; }
.sf-head a { color:#C4B5FD;font-weight:500;text-decoration:none; }
.sf-head a:hover { color:#DDD6FE; }

.sf-social { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px; }
.sf-soc { display:flex;align-items:center;justify-content:center;gap:9px;padding:12px;border-radius:14px;font-size:13.5px;font-weight:400;cursor:pointer;transition:all 0.22s;font-family:inherit; }
.sf-soc.google { background:rgba(255,255,255,0.05);border:1px solid rgba(180,160,255,0.14);color:rgba(220,218,240,0.6); }
.sf-soc.google:hover { border-color:rgba(180,160,255,0.3);background:rgba(180,160,255,0.07);transform:translateY(-1px); }
.sf-soc.kakao { background:#FEE500;border:none;color:#3C1E1E;font-weight:600; }
.sf-soc.kakao:hover { background:#FFD700;transform:translateY(-1px);box-shadow:0 4px 20px rgba(254,229,0,0.22); }

.sf-or { display:flex;align-items:center;gap:12px;margin-bottom:20px; }
.sf-or span { flex:1;height:1px;background:rgba(180,160,255,0.1); }
.sf-or em { font-size:12px;color:rgba(220,218,240,0.25);white-space:nowrap;font-style:normal;font-weight:300; }

.sf-row { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
@media (max-width:520px) { .sf-row { grid-template-columns:1fr; } }

.fg { margin-bottom:14px; }
.fg label { display:block;font-size:12px;font-weight:500;color:rgba(220,218,240,0.38);margin-bottom:7px;letter-spacing:0.03em; }
.fg-box { display:flex;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(180,160,255,0.12);border-radius:14px;overflow:hidden;transition:all 0.22s; }
.fg-box:focus-within { border-color:rgba(180,160,255,0.38);background:rgba(180,160,255,0.05);box-shadow:0 0 0 3px rgba(120,121,192,0.1); }
.fg-err .fg-box { border-color:rgba(248,113,113,0.35); }
.fg-ok  .fg-box { border-color:rgba(74,222,128,0.3); }
.fg-ico { padding:0 12px;color:rgba(220,218,240,0.2);font-size:14.5px;flex-shrink:0; }
.fg-box input { flex:1;border:none;outline:none;padding:12px 8px 12px 0;font-size:14px;color:#F0EFF8;background:transparent;font-family:inherit;font-weight:400; }
.fg-box input::placeholder { color:rgba(220,218,240,0.18); }
.fg-ck { padding-right:12px;color:#4ADE80;font-size:14px; }
.fg-dup { border:none;background:rgba(180,160,255,0.12);color:#C4B5FD;font-size:11.5px;font-weight:600;padding:0 12px;height:100%;min-height:44px;cursor:pointer;font-family:inherit;border-left:1px solid rgba(180,160,255,0.12);white-space:nowrap;transition:all 0.2s; }
.fg-dup:hover { background:rgba(180,160,255,0.22);color:#DDD6FE; }
.fg-eye { background:none;border:none;color:rgba(220,218,240,0.22);padding:0 12px;cursor:pointer;font-size:14px;display:flex;align-items:center;transition:color 0.2s; }
.fg-eye:hover { color:#C4B5FD; }
.fg-str { display:flex;align-items:center;gap:9px;margin-top:6px; }
.fg-str-bar { flex:1;height:2.5px;background:rgba(180,160,255,0.1);border-radius:3px;overflow:hidden; }
.fg-str-fill { height:100%;border-radius:3px;transition:all 0.4s; }
.fg-str span { font-size:11.5px;font-weight:500;white-space:nowrap; }
.fe { display:block;margin-top:5px;font-size:12px;color:#F87171;font-weight:400; }
.fo { display:block;margin-top:5px;font-size:12px;color:#4ADE80;font-weight:500; }

.fg-agree { display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-size:13px;color:rgba(220,218,240,0.35);margin-bottom:18px;user-select:none;font-weight:300; }
.fg-agree input { display:none; }
.fg-cm { width:16px;height:16px;flex-shrink:0;margin-top:1px;border:1.5px solid rgba(180,160,255,0.2);border-radius:5px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;background:transparent; }
.fg-agree input:checked + .fg-cm { background:linear-gradient(135deg,#8889C4,#7879C0);border-color:transparent; }
.fg-agree input:checked + .fg-cm::after { content:'';width:4px;height:7px;border:1.5px solid #fff;border-top:none;border-left:none;transform:rotate(45deg) translateY(-1px); }

.sf-apimsg { padding:11px 14px;border-radius:12px;font-size:13px;margin-bottom:14px;font-weight:400; }
.sf-apierr { background:rgba(248,113,113,0.08);color:#F87171;border:1px solid rgba(248,113,113,0.2); }
.sf-apiok  { background:rgba(74,222,128,0.08);color:#4ADE80;border:1px solid rgba(74,222,128,0.2); }

.sf-submit { width:100%;padding:14.5px;border:none;border-radius:14px;background:linear-gradient(135deg,#9A9BD0,#7879C0,#6667AB);color:#fff;font-size:14.5px;font-weight:600;cursor:pointer;transition:all 0.28s;font-family:inherit;letter-spacing:0.01em;box-shadow:0 0 28px rgba(120,121,192,0.28),inset 0 1px 0 rgba(255,255,255,0.16); }
.sf-submit:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 0 48px rgba(120,121,192,0.5),inset 0 1px 0 rgba(255,255,255,0.16); }
.sf-submit:disabled { opacity:0.5;cursor:not-allowed; }
.sf-ld { display:flex;align-items:center;justify-content:center;gap:5px; }
.sf-ld span { width:6px;height:6px;border-radius:50%;background:#fff;opacity:0.4;animation:ldot 1.2s infinite; }
.sf-ld span:nth-child(2){animation-delay:.2s} .sf-ld span:nth-child(3){animation-delay:.4s}
@keyframes ldot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1);opacity:1}}
</style>