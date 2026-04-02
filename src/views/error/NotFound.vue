<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="nf">
    <div class="nf-bg">
      <div class="nf-orb o1"></div>
      <div class="nf-orb o2"></div>
      <div class="nf-grid"></div>
    </div>
    <div class="nf-body">
      <div class="nf-code">
        <span class="nf-d">4</span>
        <div class="nf-zero-w">
          <span class="nf-zero">0</span>
          <div class="nf-sparkle">✦</div>
        </div>
        <span class="nf-d">4</span>
      </div>
      <h1 class="nf-title">페이지를 찾을 수 없어요</h1>
      <p class="nf-desc">
        요청하신 페이지가 이동되었거나 삭제되었을 수 있습니다.<br>
        주소를 다시 확인하거나 홈으로 돌아가주세요.
      </p>
      <div class="nf-acts">
        <button class="nf-main" @click="router.push('/')">
          <i class="bi bi-house-fill"></i> 홈으로 돌아가기
        </button>
        <button class="nf-ghost" @click="router.back()">
          <i class="bi bi-arrow-left"></i> 이전 페이지
        </button>
      </div>
      <div class="nf-links">
        <router-link to="/faq">자주 묻는 질문</router-link>
        <span>·</span>
        <router-link to="/notice">공지사항</router-link>
        <span>·</span>
        <router-link to="/inquiry">1:1 문의</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf { min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0C0B1A;position:relative;overflow:hidden;font-family:"Pretendard",sans-serif;padding:40px 20px; }

.nf-bg { position:absolute;inset:0;pointer-events:none; }
.nf-orb { position:absolute;border-radius:50%; }
.o1 { width:550px;height:550px;background:radial-gradient(circle,rgba(120,121,192,0.16),transparent 65%);top:-120px;right:-80px;animation:orbD 16s ease-in-out infinite; }
.o2 { width:400px;height:400px;background:radial-gradient(circle,rgba(167,139,250,0.1),transparent 65%);bottom:-80px;left:-80px;animation:orbD 20s ease-in-out infinite reverse; }
@keyframes orbD { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-26px)} }
.nf-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(180,160,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(180,160,255,0.04) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%); }

.nf-body { position:relative;z-index:2;text-align:center;max-width:500px; }

.nf-code { display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:36px;user-select:none; }
.nf-d { font-size:clamp(5rem,14vw,9.5rem);font-weight:900;color:rgba(180,160,255,0.1);letter-spacing:-.05em;line-height:1; }
.nf-zero-w { position:relative;display:flex;align-items:center;justify-content:center; }
.nf-zero { font-size:clamp(5rem,14vw,9.5rem);font-weight:900;background:linear-gradient(135deg,#DDD6FE 0%,#A78BFA 45%,#7879C0 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-.05em;line-height:1; }
.nf-sparkle { position:absolute;font-size:clamp(1.2rem,3vw,2.2rem);color:rgba(196,181,253,0.8);filter:drop-shadow(0 0 12px rgba(196,181,253,0.5));animation:spin 9s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.nf-title { font-size:clamp(1.3rem,3vw,1.8rem);font-weight:800;color:#F0EFF8;letter-spacing:-.02em;margin-bottom:14px; }
.nf-desc { font-size:14.5px;color:rgba(220,218,240,0.38);line-height:1.85;margin-bottom:42px;font-weight:300; }

.nf-acts { display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:32px; }
.nf-main { display:inline-flex;align-items:center;gap:8px;padding:13px 28px;background:linear-gradient(135deg,#9A9BD0,#7879C0,#6667AB);color:#fff;border:none;border-radius:14px;font-size:14.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.28s;box-shadow:0 0 24px rgba(120,121,192,0.28),inset 0 1px 0 rgba(255,255,255,0.16); }
.nf-main:hover { transform:translateY(-2px);box-shadow:0 0 44px rgba(120,121,192,0.5),inset 0 1px 0 rgba(255,255,255,0.16); }
.nf-ghost { display:inline-flex;align-items:center;gap:8px;padding:13px 24px;background:transparent;color:rgba(220,218,240,0.45);border:1px solid rgba(180,160,255,0.16);border-radius:14px;font-size:14.5px;font-weight:400;cursor:pointer;font-family:inherit;transition:all 0.25s; }
.nf-ghost:hover { border-color:rgba(180,160,255,0.35);color:#DDD6FE;background:rgba(180,160,255,0.06); }

.nf-links { display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap; }
.nf-links a { font-size:13.5px;color:rgba(220,218,240,0.3);text-decoration:none;transition:color 0.2s;font-weight:300; }
.nf-links a:hover { color:#C4B5FD; }
.nf-links span { color:rgba(180,160,255,0.2);font-size:13px; }
</style>