<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useRouter, useRoute } from 'vue-router';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import avatar from '@/assets/img/avatar.png';
import WorkspaceCreateModal from '@/components/workspace/WorkspaceCreateModal.vue';
import WorkspaceJoinModal   from '@/components/workspace/WorkspaceJoinModal.vue';

const authStore      = useAuthStore();
const workspaceStore = useWorkspaceStore();
const router         = useRouter();
const route          = useRoute();

// ── 모달 상태 ─────────────────────────────────────────────────────
const showCreateModal = ref(false);
const showJoinModal   = ref(false);

// ── 메뉴 정의 (워크스페이스 드롭다운은 동적으로 처리) ─────────────
const staticMenuItems = [
  { name: '홈', routeName: 'Home' },
  { name: '소개', routeName: 'About' },
  { key: 'community', name: '커뮤니티', children: [
    { name: '방명록', path: '/guest' },
    { name: '자유 게시판', path: '/board' },
    { name: '포토 갤러리', path: '/photo' },
  ]},
  { key: 'customer', name: '고객센터', children: [
    { name: '자주 묻는 질문', path: '/faq' },
    { name: '공지사항', path: '/notice' },
    { name: '1:1 문의', path: '/inquiry' },
  ]},
];

// ── 기존 UI 로직 (변경 없음) ───────────────────────────────────────
const isMobileNavActive = ref(false);
const mobileOpenKey     = ref(null);
const pcOpenKey         = ref(null);
const leaveTimer        = ref(null);
const windowWidth       = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const scrolled          = ref(false);
const isMobile          = computed(() => windowWidth.value < 1200);

const handleResize  = () => { windowWidth.value = window.innerWidth; if (!isMobile.value) { isMobileNavActive.value = false; mobileOpenKey.value = null; document.body.classList.remove('mobile-nav-active'); } };
const handleScroll  = () => { scrolled.value = window.scrollY > 10; };
const toggleMobileNav = () => { isMobileNavActive.value = !isMobileNavActive.value; document.body.classList.toggle('mobile-nav-active', isMobileNavActive.value); if (!isMobileNavActive.value) mobileOpenKey.value = null; };
const openMenu      = (key) => { if (isMobile.value) return; if (leaveTimer.value) { clearTimeout(leaveTimer.value); leaveTimer.value = null; } pcOpenKey.value = key; };
const scheduleClose = () => { if (isMobile.value) return; leaveTimer.value = setTimeout(() => { pcOpenKey.value = null; }, 140); };
const cancelClose   = () => { if (leaveTimer.value) { clearTimeout(leaveTimer.value); leaveTimer.value = null; } };
const toggleMobileDropdown = (key) => { mobileOpenKey.value = mobileOpenKey.value === key ? null : key; };
const closeAll      = () => { mobileOpenKey.value = null; pcOpenKey.value = null; isMobileNavActive.value = false; if (leaveTimer.value) { clearTimeout(leaveTimer.value); leaveTimer.value = null; } document.body.classList.remove('mobile-nav-active'); };
const handleLogout  = () => { authStore.logout(); router.push('/'); closeAll(); };

// ── 워크스페이스 입장 ──────────────────────────────────────────────
async function enterWorkspace(ws) {
  await workspaceStore.setCurrentWorkspace(ws);
  router.push({ name: 'workspace', params: { slug: ws.slug } });
  closeAll();
}

// ── 생성/참여 완료 콜백 ────────────────────────────────────────────
async function onWorkspaceCreated(newWs) {
  showCreateModal.value = false;
  router.push({ name: 'workspace', params: { slug: newWs.slug } });
}
async function onWorkspaceJoined(ws) {
  showJoinModal.value = false;
  router.push({ name: 'workspace', params: { slug: ws.slug } });
}

// ── 로그인 시 워크스페이스 목록 불러오기 ─────────────────────────
watch(() => authStore.isAuthenticated, (val) => {
  if (val) workspaceStore.fetchMyWorkspaces();
}, { immediate: true });

watch(() => route.path, closeAll);
onMounted(() => { window.addEventListener('resize', handleResize); window.addEventListener('scroll', handleScroll); });
onUnmounted(() => { window.removeEventListener('resize', handleResize); window.removeEventListener('scroll', handleScroll); document.body.classList.remove('mobile-nav-active'); });
</script>

<template>
  <header class="wh" :class="{ scrolled }">
    <div class="wh-inner">
      <router-link to="/" class="wh-logo" @click="closeAll">
        <div class="wh-mark"><span>✦</span></div>
        <span class="wh-name">Weave</span>
      </router-link>

      <nav class="wh-nav">
        <ul>
          <template v-for="item in staticMenuItems" :key="item.name">
            <li v-if="!item.children" class="wh-li">
              <router-link :to="item.routeName ? { name: item.routeName } : item.path" active-class="active" @click="closeAll">{{ item.name }}</router-link>
            </li>
            <li v-else class="wh-li has-drop" @mouseenter="openMenu(item.key)" @mouseleave="scheduleClose">
              <a href="#" @click.prevent="toggleMobileDropdown(item.key)" :class="{ open: pcOpenKey === item.key }">
                <span>{{ item.name }}</span>
                <i class="bi bi-chevron-down chev"></i>
              </a>
              <div class="drop" :class="{ show: pcOpenKey === item.key }" @mouseenter="cancelClose" @mouseleave="scheduleClose">
                <template v-for="(sub, i) in item.children" :key="i">
                  <hr v-if="sub.type === 'divider'" class="dsep" />
                  <router-link v-else :to="sub.path" class="dlink" @click="closeAll">{{ sub.name }}</router-link>
                </template>
              </div>
            </li>
          </template>

          <li v-if="authStore.isAuthenticated" class="wh-li has-drop" @mouseenter="openMenu('workspace')" @mouseleave="scheduleClose">
            <a href="#" @click.prevent="toggleMobileDropdown('workspace')" :class="{ open: pcOpenKey === 'workspace' }">
              <span>워크스페이스</span>
              <i class="bi bi-chevron-down chev"></i>
            </a>
            <div class="drop ws-drop" :class="{ show: pcOpenKey === 'workspace' }" @mouseenter="cancelClose" @mouseleave="scheduleClose">
              <div v-if="workspaceStore.workspaceList.length" class="ws-list">
                <a
                  v-for="ws in workspaceStore.workspaceList"
                  :key="ws.workspaceId"
                  href="#"
                  class="dlink ws-item"
                  :class="{ 'ws-item--active': ws.workspaceId === workspaceStore.currentWorkspaceId }"
                  @click.prevent="enterWorkspace(ws)"
                >
                  <span class="ws-icon">{{ ws.wsName.charAt(0).toUpperCase() }}</span>
                  <span class="ws-name">{{ ws.wsName }}</span>
                  <i v-if="ws.workspaceId === workspaceStore.currentWorkspaceId" class="bi bi-check2 ws-check"></i>
                </a>
              </div>
              <div v-else class="ws-empty">참여한 워크스페이스가 없습니다</div>
              <hr class="dsep" />
              <a href="#" class="dlink dlink-action" @click.prevent="showCreateModal = true; closeAll()">
                <i class="bi bi-plus-circle"></i> 새 워크스페이스 만들기
              </a>
              <a href="#" class="dlink dlink-action" @click.prevent="showJoinModal = true; closeAll()">
                <i class="bi bi-link-45deg"></i> 초대 링크로 참여
              </a>
            </div>
          </li>
        </ul>
      </nav>

      <div class="wh-right">
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn-ghost">로그인</router-link>
          <router-link to="/signup" class="btn-pill">무료 시작 →</router-link>
        </template>
        <template v-else>
          <button class="icon-btn"><i class="bi bi-bell"></i><span class="notif"></span></button>
          
          <div class="av-wrap dropdown">
            <button class="av-btn dropdown-toggle" data-bs-toggle="dropdown" data-bs-offset="0,10">
              <img :src="avatar" class="av-img" /><span class="av-on"></span>
            </button>
            <ul class="av-menu dropdown-menu dropdown-menu-end">
              <li class="av-head">
 		 <span class="av-nm">{{ authStore.auth?.username || '사용자' }}</span>
 		 <span class="av-badge">멤버</span>
	      </li>
              <li><hr class="av-sep"></li>
              
              <li>
                <router-link to="/mypage" class="av-item" @click="closeAll">
                  <i class="bi bi-person-circle"></i>마이페이지
                </router-link>
              </li>
              <li><hr class="av-sep"></li>
              
              <li><router-link to="/album"    class="av-item" @click="closeAll"><i class="bi bi-images"></i>사진첩</router-link></li>
              <li><router-link to="/schedule" class="av-item" @click="closeAll"><i class="bi bi-calendar3"></i>일정관리</router-link></li>
              <li><router-link to="/note"     class="av-item" @click="closeAll"><i class="bi bi-envelope"></i>쪽지함</router-link></li>
              <li><hr class="av-sep"></li>
              <li><a href="#" class="av-item av-out" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right"></i>로그아웃</a></li>
            </ul>
          </div>
        </template>
        <button class="hbg d-xl-none" @click="toggleMobileNav" :class="{ open: isMobileNavActive }">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <div class="drawer" :class="{ open: isMobileNavActive }">
      <ul>
        <template v-for="item in staticMenuItems" :key="item.name">
          <li v-if="!item.children" class="mob-li"><router-link :to="item.routeName ? { name: item.routeName } : item.path" @click="closeAll">{{ item.name }}</router-link></li>
          <li v-else class="mob-li">
            <a href="#" @click.prevent="toggleMobileDropdown(item.key)" :class="{ open: mobileOpenKey === item.key }"><span>{{ item.name }}</span><i class="bi bi-chevron-down chev"></i></a>
            <div v-if="mobileOpenKey === item.key" class="mob-sub">
              <template v-for="(sub, i) in item.children" :key="i">
                <hr v-if="sub.type === 'divider'" class="dsep" />
                <router-link v-else :to="sub.path" class="dlink" @click="closeAll">{{ sub.name }}</router-link>
              </template>
            </div>
          </li>
        </template>
        <li v-if="authStore.isAuthenticated" class="mob-li">
          <a href="#" @click.prevent="toggleMobileDropdown('workspace')" :class="{ open: mobileOpenKey === 'workspace' }"><span>워크스페이스</span><i class="bi bi-chevron-down chev"></i></a>
          <div v-if="mobileOpenKey === 'workspace'" class="mob-sub">
            <a v-for="ws in workspaceStore.workspaceList" :key="ws.workspaceId" href="#" class="dlink" @click.prevent="enterWorkspace(ws)">{{ ws.wsName }}</a>
            <hr class="dsep" />
            <a href="#" class="dlink" @click.prevent="showCreateModal = true; closeAll()">＋ 새 워크스페이스 만들기</a>
            <a href="#" class="dlink" @click.prevent="showJoinModal = true; closeAll()">🔗 초대 링크로 참여</a>
          </div>
        </li>
      </ul>
    </div>
  </header>

  <div v-if="isMobileNavActive" class="overlay" @click="closeAll"></div>

  <WorkspaceCreateModal v-if="showCreateModal" @close="showCreateModal = false" @created="onWorkspaceCreated" />
  <WorkspaceJoinModal   v-if="showJoinModal"   @close="showJoinModal = false"   @joined="onWorkspaceJoined" />
</template>

<style scoped>
:global(body.mobile-nav-active) { overflow: hidden; }

.wh {
  position: sticky; top: 0; z-index: 1000;
  font-family: "Pretendard", sans-serif;
  background: rgba(12, 11, 26, 0.72);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-bottom: 1px solid rgba(180, 160, 255, 0.07);
  transition: all 0.35s;
}
.wh.scrolled {
  background: rgba(12, 11, 26, 0.94);
  border-bottom-color: rgba(180, 160, 255, 0.13);
  box-shadow: 0 2px 48px rgba(0, 0, 0, 0.45);
}
.wh-inner { max-width: 1280px; margin: 0 auto; padding: 0 36px; height: 68px; display: flex; align-items: center; }

/* 로고 */
.wh-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; margin-right: 52px; }
.wh-mark { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(145deg, #9A9BD0, #7879C0, #6667AB); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; box-shadow: 0 0 20px rgba(120, 121, 192, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.3s; }
.wh-logo:hover .wh-mark { box-shadow: 0 0 36px rgba(120, 121, 192, 0.65); transform: rotate(12deg) scale(1.08); }
.wh-name { font-size: 19px; font-weight: 800; color: #F0EFF8; letter-spacing: -0.05em; }

/* 네비 */
.wh-nav { flex: 1; }
.wh-nav ul { display: flex; align-items: center; list-style: none; margin: 0; padding: 0; }
.wh-li { position: relative; }
.wh-li > a, .wh-li > a:visited { display: flex; align-items: center; gap: 5px; padding: 8px 14px; font-size: 13.5px; font-weight: 400; color: rgba(220, 218, 240, 0.48); text-decoration: none; border-radius: 8px; transition: all 0.2s; white-space: nowrap; cursor: pointer; }
.wh-li > a:hover, .wh-li > a.active, .wh-li > a.open { color: #DDD6FE; background: rgba(180, 160, 255, 0.08); }
.chev { font-size: 9px; opacity: 0.45; transition: transform 0.22s; }
.wh-li > a.open .chev { transform: rotate(180deg); opacity: 0.9; }

/* 드롭다운 */
.has-drop { position: relative; }
.drop {
  position: absolute; top: 100%; left: 0; min-width: 198px;
  z-index: 1001; padding-top: 10px;
  opacity: 0; pointer-events: none; transform: translateY(-6px) scale(0.98);
  transition: opacity 0.18s, transform 0.18s;
}
.drop::before { content: ''; position: absolute; top: -10px; left: 0; right: 0; height: 12px; }
.drop::after {
  content: ''; position: absolute; inset: 10px 0 0;
  background: rgba(14, 12, 30, 0.96);
  border: 1px solid rgba(180, 160, 255, 0.14);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  z-index: -1;
}
.drop .dlink, .drop .dsep { position: relative; z-index: 1; }
.drop.show { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
.dlink { display: flex; align-items: center; gap: 8px; padding: 10px 14px; margin: 2px 6px; font-size: 13px; font-weight: 400; color: rgba(220, 218, 240, 0.5) !important; border-radius: 9px; text-decoration: none; transition: all 0.15s; background: transparent !important; letter-spacing: 0.01em; }
.dlink:hover { background: rgba(180, 160, 255, 0.1) !important; color: #DDD6FE !important; }
.dsep { border-color: rgba(180, 160, 255, 0.1); margin: 5px 10px; }

/* 워크스페이스 드롭다운 확장 */
.ws-drop { min-width: 240px; }
.ws-list { max-height: 200px; overflow-y: auto; }
.ws-item { justify-content: flex-start; }
.ws-item--active { color: #DDD6FE !important; background: rgba(180,160,255,0.08) !important; }
.ws-icon { width: 24px; height: 24px; border-radius: 7px; background: linear-gradient(135deg, #8889C4, #6667AB); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ws-name { flex: 1; }
.ws-check { margin-left: auto; color: #8889C4; }
.ws-empty { padding: 12px 14px; font-size: 12px; color: rgba(220,218,240,0.25); text-align: center; }
.dlink-action { color: rgba(196,181,253,0.55) !important; }
.dlink-action:hover { color: #DDD6FE !important; }

/* 우측 */
.wh-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
.btn-ghost { padding: 8px 18px; font-size: 13px; font-weight: 400; color: rgba(220, 218, 240, 0.48); border: 1px solid rgba(180, 160, 255, 0.12); border-radius: 100px; text-decoration: none; transition: all 0.22s; }
.btn-ghost:hover { color: #DDD6FE; border-color: rgba(180, 160, 255, 0.32); background: rgba(180, 160, 255, 0.06); }
.btn-pill { display: inline-flex; align-items: center; gap: 4px; padding: 8px 20px; font-size: 13px; font-weight: 600; color: #fff; background: linear-gradient(135deg, #8889C4, #7879C0, #6667AB); border-radius: 100px; text-decoration: none; transition: all 0.25s; box-shadow: 0 0 24px rgba(120, 121, 192, 0.28), inset 0 1px 0 rgba(255,255,255,0.15); }
.btn-pill:hover { color: #fff; transform: translateY(-2px); box-shadow: 0 0 40px rgba(120, 121, 192, 0.5), inset 0 1px 0 rgba(255,255,255,0.15); }

.icon-btn { position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; color: rgba(220,218,240,0.38); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.icon-btn:hover { background: rgba(180,160,255,0.1); color: #DDD6FE; }
.notif { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: #8889C4; border: 1.5px solid #0C0B1A; box-shadow: 0 0 8px rgba(136,137,196,0.7); }

.av-wrap { position: relative; }
.av-btn { background: none; border: none; padding: 0; cursor: pointer; position: relative; }
.av-img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(180,160,255,0.28); transition: border-color 0.2s; }
.av-btn:hover .av-img { border-color: #8889C4; }
.av-on { position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; border: 1.5px solid #0C0B1A; }

.av-menu { background: rgba(14,12,30,0.97) !important; border: 1px solid rgba(180,160,255,0.14) !important; border-radius: 16px !important; padding: 6px !important; box-shadow: 0 24px 64px rgba(0,0,0,0.55) !important; min-width: 190px !important; margin-top: 10px !important; backdrop-filter: blur(24px) !important; }
.av-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px 8px; }
.av-nm { font-size: 13px; font-weight: 600; color: #F0EFF8; }
.av-badge { font-size: 10px; background: rgba(180,160,255,0.14); color: #C4B5FD; padding: 2px 8px; border-radius: 100px; font-weight: 500; }
.av-sep { border-color: rgba(180,160,255,0.1) !important; margin: 4px 8px !important; }
.av-item { display: flex !important; align-items: center !important; gap: 9px !important; padding: 9px 13px !important; font-size: 13px !important; color: rgba(220,218,240,0.5) !important; border-radius: 10px !important; text-decoration: none; transition: all 0.15s; }
.av-item i { font-size: 13px; opacity: 0.65; }
.av-item:hover { background: rgba(180,160,255,0.1) !important; color: #DDD6FE !important; }
.av-out { color: rgba(248,113,113,0.55) !important; }
.av-out:hover { background: rgba(248,113,113,0.08) !important; color: #F87171 !important; }

/* 햄버거 */
.hbg { display: flex; flex-direction: column; justify-content: center; gap: 5px; width: 36px; height: 36px; padding: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.hbg span { display: block; height: 1.5px; background: rgba(220,218,240,0.45); border-radius: 2px; transition: all 0.3s; transform-origin: center; }
.hbg.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.hbg.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hbg.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* 모바일 */
.drawer { display: none; position: fixed; top: 68px; right: 0; bottom: 0; width: 280px; background: rgba(12,10,26,0.98); border-left: 1px solid rgba(180,160,255,0.1); padding: 12px; overflow-y: auto; z-index: 1001; transform: translateX(105%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); backdrop-filter: blur(28px); }
.drawer.open { transform: translateX(0); }
.drawer ul { list-style: none; margin: 0; padding: 0; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1000; backdrop-filter: blur(6px); }
.mob-li > a { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; font-size: 14.5px; font-weight: 400; color: rgba(220,218,240,0.52); border-radius: 10px; text-decoration: none; transition: all 0.2s; cursor: pointer; }
.mob-li > a:hover, .mob-li > a.open { background: rgba(180,160,255,0.08); color: #DDD6FE; }
.mob-sub { padding: 4px 0 4px 12px; }
.mob-sub .dlink { padding: 9px 12px; font-size: 13px; margin: 1px 0; }

@media (max-width: 1199px) { .wh-nav { display: none; } .drawer { display: block; } .wh-inner { padding: 0 20px; } .wh-logo { margin-right: 0; } }
</style>