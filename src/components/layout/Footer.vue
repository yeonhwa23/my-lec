<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <footer class="wf">
    <div class="wf-main">
      <div class="wf-grid">
        <div class="wf-brand">
          <router-link to="/" class="wf-logo">
            <div class="wf-mark">✦</div>
            <span class="wf-name">Weave</span>
          </router-link>
          <p class="wf-desc">대화가 흘러가지 않도록.<br>팀의 모든 순간을 영구적인 자산으로 엮어드립니다.</p>
          <div class="wf-socials">
            <a href="#" class="wf-soc"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="wf-soc"><i class="bi bi-github"></i></a>
            <a href="#" class="wf-soc"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="wf-soc"><i class="bi bi-discord"></i></a>
          </div>
        </div>
        <div class="wf-col">
          <h5>제품</h5>
          <ul>
            <li><router-link to="/">기능 소개</router-link></li>
            <li><router-link to="/">요금제</router-link></li>
            <li><router-link to="/">업데이트 노트</router-link></li>
            <li><router-link to="/">로드맵</router-link></li>
          </ul>
        </div>
        <div class="wf-col">
          <h5>지원</h5>
          <ul>
            <li><router-link to="/faq">자주 묻는 질문</router-link></li>
            <li><router-link to="/notice">공지사항</router-link></li>
            <li><router-link to="/inquiry">1:1 문의</router-link></li>
            <li><router-link to="/">커뮤니티</router-link></li>
          </ul>
        </div>
        <div class="wf-col">
          <h5>법적 고지</h5>
          <ul>
            <li><router-link to="/">이용약관</router-link></li>
            <li><router-link to="/">개인정보처리방침</router-link></li>
            <li><router-link to="/">청소년보호정책</router-link></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wf-bottom">
      <span>© 2025 Weave. All rights reserved.</span>
      <span class="wf-slogan">대화를 지식으로, 흐름을 끊지 않고.</span>
    </div>
  </footer>
</template>

<style scoped>
.wf { background: #080715; border-top: 1px solid rgba(180,160,255,0.08); font-family: "Pretendard", sans-serif; }
.wf-main { max-width: 1280px; margin: 0 auto; padding: 72px 36px 56px; }
.wf-grid { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr; gap: 56px; }
@media (max-width: 960px) { .wf-grid { grid-template-columns: 1fr 1fr; gap: 40px; } .wf-brand { grid-column: 1/-1; } }
@media (max-width: 560px) { .wf-grid { grid-template-columns: 1fr; gap: 32px; } .wf-main { padding: 48px 20px 40px; } }

.wf-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; margin-bottom: 18px; }
.wf-mark {
  width: 30px; height: 30px; border-radius: 9px;
  background: linear-gradient(145deg, #9A9BD0, #7879C0, #6667AB);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: #fff;
  box-shadow: 0 0 16px rgba(120,121,192,0.3);
}
.wf-name { font-size: 19px; font-weight: 800; color: #F0EFF8; letter-spacing: -0.05em; }
.wf-desc { font-size: 13px; color: rgba(220,218,240,0.3); line-height: 1.85; margin-bottom: 26px; font-weight: 300; }
.wf-socials { display: flex; gap: 8px; }
.wf-soc { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,160,255,0.1); border-radius: 9px; color: rgba(220,218,240,0.3); font-size: 13px; text-decoration: none; transition: all 0.2s; }
.wf-soc:hover { background: rgba(180,160,255,0.1); border-color: rgba(180,160,255,0.25); color: #C4B5FD; transform: translateY(-2px); }

.wf-col h5 { font-size: 10.5px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(220,218,240,0.22); margin-bottom: 20px; }
.wf-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.wf-col ul li a { font-size: 13px; color: rgba(220,218,240,0.38); text-decoration: none; transition: color 0.2s; font-weight: 300; }
.wf-col ul li a:hover { color: #C4B5FD; }

.wf-bottom { border-top: 1px solid rgba(180,160,255,0.07); max-width: 1280px; margin: 0 auto; padding: 20px 36px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.wf-bottom span { font-size: 12px; color: rgba(220,218,240,0.18); font-weight: 300; }
.wf-slogan { font-style: italic; }
@media (max-width: 560px) { .wf-bottom { padding: 20px; flex-direction: column; align-items: flex-start; } }
</style>