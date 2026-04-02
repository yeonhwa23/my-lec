<template>
  <div class="hv">

    <!-- ══ HERO ══ -->
    <section class="hv-hero">
      <div class="hero-bg">
        <div class="hb-orb o1"></div>
        <div class="hb-orb o2"></div>
        <div class="hb-orb o3"></div>
        <div class="hb-grid"></div>
        <div class="hb-vignette"></div>
      </div>

      <div class="hv-con">
        <div class="hl-text">
          <div class="hl-tag">
            <span class="hl-tag-dot"></span>
            실시간 팀 협업 플랫폼
          </div>

          <h1 class="hl-h1">
            <span class="hl-line dim">대화가</span>
            <span class="hl-line em"><em>지식</em>이 되는</span>
            <span class="hl-line bright">순간.</span>
          </h1>

          <p class="hl-sub">
            북마크 하나로 채팅을 팀의 영구적인 문서로.<br class="d-br">
            흐름을 끊지 않고 지식 자산을 쌓아가세요.
          </p>

          <!-- ✅ 로그인 상태에 따른 CTA 분기 -->
          <div class="hl-cta">
            <!-- 비로그인 -->
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/signup" class="hl-btn-main">
                워크스페이스 만들기
                <svg viewBox="0 0 16 16" fill="none" width="13"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </router-link>
              <router-link to="/login" class="hl-btn-ghost">로그인</router-link>
            </template>

            <!-- 로그인 후 -->
            <template v-else>
              <!-- 워크스페이스가 있으면 최근 것으로 바로 이동 -->
              <button v-if="latestWorkspace" class="hl-btn-main" @click="goToWorkspace(latestWorkspace)">
                <i class="bi bi-grid-3x3-gap-fill" style="font-size:14px"></i>
                {{ latestWorkspace.wsName }} 입장하기
                <svg viewBox="0 0 16 16" fill="none" width="13"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <!-- 워크스페이스 없으면 생성 유도 -->
              <button v-else class="hl-btn-main" @click="showCreate = true">
                첫 워크스페이스 만들기
                <svg viewBox="0 0 16 16" fill="none" width="13"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="hl-btn-ghost" @click="showJoin = true">
                <i class="bi bi-link-45deg"></i> 초대 링크로 참여
              </button>
            </template>
          </div>

          <!-- 로그인 시: 내 워크스페이스 빠른 접근 목록 -->
          <div v-if="authStore.isAuthenticated && workspaceStore.workspaceList.length" class="hl-ws-quick">
            <span class="hl-ws-label">내 워크스페이스</span>
            <div class="hl-ws-list">
              <button
                v-for="ws in workspaceStore.workspaceList.slice(0, 4)"
                :key="ws.workspaceId"
                class="hl-ws-chip"
                @click="goToWorkspace(ws)"
              >
                <span class="hl-ws-chip-icon">{{ ws.wsName.charAt(0).toUpperCase() }}</span>
                {{ ws.wsName }}
              </button>
              <button v-if="workspaceStore.workspaceList.length > 4" class="hl-ws-chip hl-ws-more">
                +{{ workspaceStore.workspaceList.length - 4 }}개 더
              </button>
            </div>
          </div>

          <!-- 비로그인 시: 소셜 프루프 -->
          <div v-else-if="!authStore.isAuthenticated" class="hl-proof">
            <div class="hl-avs">
              <div class="hl-av" style="background:linear-gradient(135deg,#8889C4,#6667AB)">J</div>
              <div class="hl-av" style="background:linear-gradient(135deg,#F59E0B,#D97706)">M</div>
              <div class="hl-av" style="background:linear-gradient(135deg,#34D399,#10B981)">S</div>
              <div class="hl-av" style="background:linear-gradient(135deg,#F472B6,#EC4899)">A</div>
            </div>
            <p>지금 팀들이 함께 협업 중</p>
          </div>
        </div>

        <!-- 우측 UI 미리보기 -->
        <div class="hl-visual">
          <!-- 채팅 카드 -->
          <div class="hl-card chat-card">
            <div class="hl-card-hd">
              <div class="mac-dots"><span class="mac-r"></span><span class="mac-y"></span><span class="mac-g"></span></div>
              <span class="ch-name"># 기획-채널</span>
              <span class="ch-online"><span></span>3명 온라인</span>
            </div>
            <div class="hl-msgs">
              <div class="hl-msg">
                <div class="hl-av-sm" style="background:#7879C0">지</div>
                <div class="hl-mb">
                  <span class="hl-nm">지수</span>
                  <span class="hl-mt">Q4 마케팅 방향 어떻게 잡을까요? 📊</span>
                </div>
              </div>
              <div class="hl-msg">
                <div class="hl-av-sm" style="background:#F59E0B">민</div>
                <div class="hl-mb">
                  <span class="hl-nm">민준</span>
                  <span class="hl-mt">SNS 중심으로 가요. 20대 타겟!</span>
                </div>
              </div>
              <div class="hl-msg ai-msg">
                <div class="hl-av-sm ai-av">AI</div>
                <div class="hl-mb">
                  <span class="hl-nm ai-nm">@Weave AI</span>
                  <span class="hl-mt ai-mt">전략 요약: ① SNS 릴스 ② UGC 캠페인 ③ 20대 직장인 타겟 ✦</span>
                </div>
              </div>
            </div>
            <div class="hl-input-bar">
              <span>메시지를 입력하세요...</span>
              <div class="hl-ibicons"><i class="bi bi-paperclip"></i><i class="bi bi-emoji-smile"></i></div>
            </div>
          </div>

          <!-- 북마크 토스트 -->
          <div class="hl-toast">
            <div class="hl-toast-icon"><i class="bi bi-bookmark-fill"></i></div>
            <span>메시지가 <strong>마케팅-전략</strong>에 추가됨</span>
            <span class="hl-toast-t">방금</span>
          </div>

          <!-- 문서 카드 -->
          <div class="hl-card doc-card">
            <div class="hl-card-hd">
              <i class="bi bi-file-text doc-ico"></i>
              <span class="doc-title">마케팅-전략</span>
              <span class="doc-saved">저장됨</span>
            </div>
            <div class="hl-doc-body">
              <div class="doc-blk blk-h">📋 Q4 마케팅 전략</div>
              <div class="doc-blk blk-done"><span class="cb cb-done"></span>SNS 채널 우선 전략 확정</div>
              <div class="doc-blk blk-todo"><span class="cb"></span>20대 직장인 타겟 세분화</div>
              <div class="doc-blk blk-todo"><span class="cb"></span>UGC 캠페인 기획안 작성</div>
              <div class="doc-blk blk-note">💬 채팅 북마크로 자동 수집됨</div>
            </div>
          </div>

          <!-- 속도 배지 -->
          <div class="hl-stat">
            <span class="stat-n">3초</span>
            <span class="stat-l">대화 → 문서</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FEATURES (BENTO) ══ -->
    <section class="hv-bento">
      <div class="hv-con">
        <div class="sec-hd">
          <span class="sec-chip">핵심 기능</span>
          <h2 class="sec-title">Weave가 다른 이유</h2>
          <p class="sec-sub">흩어지는 대화와 쌓이지 않는 문서.<br>그 사이를 Weave가 연결합니다.</p>
        </div>

        <div class="bento-grid">
          <div class="bc bc-lg">
            <div class="bc-glow"></div>
            <span class="bc-badge">핵심 기능</span>
            <div class="bc-ico"><i class="bi bi-bookmark-star-fill"></i></div>
            <h3>1클릭 하이브리드 아카이빙</h3>
            <p>채팅에서 도출된 중요 내용을 북마크 하나로 문서 블록에 즉시 삽입. 컨텍스트를 끊지 않고 지식을 쌓아가세요.</p>
            <div class="bc-mini">
              <div class="bm-chat">
                <div class="bm-av" style="background:#7879C0">J</div>
                <span>"SNS 우선 전략으로 갑시다!"</span>
                <button class="bm-btn"><i class="bi bi-bookmark-fill"></i></button>
              </div>
              <div class="bm-arr">↓ 북마크</div>
              <div class="bm-doc">
                <span class="bm-dh">📄 전략 문서</span>
                <span class="bm-db">☑ SNS 채널 우선 전략 확정</span>
              </div>
            </div>
          </div>

          <div class="bc bc-md">
            <div class="bc-ico bc-ico-sm"><i class="bi bi-lightning-charge-fill"></i></div>
            <h3>실시간 팀 채팅</h3>
            <p>WebSocket 기반 지연 없는 채널 소통. 이모지 리액션과 파일 첨부로 더 풍부하게.</p>
            <div class="bc-tags"><span>WebSocket</span><span>이모지 리액션</span><span>파일 첨부</span></div>
            <div class="bc-msgs">
              <div class="bc-msg"><div class="bm-av sm" style="background:#7879C0">J</div><span>방금 작업 완료!</span><span class="bc-react">👍 3</span></div>
              <div class="bc-msg"><div class="bm-av sm" style="background:#F59E0B">M</div><span>확인했어요 ✓</span></div>
            </div>
          </div>

          <div class="bc bc-md bc-ai">
            <div class="bc-ico bc-ico-sm bc-ico-ai"><i class="bi bi-robot"></i></div>
            <h3>AI 어시스턴트</h3>
            <p>채팅창에 @멘션으로 즉시 호출. 탭 전환 없이 의사결정을 가속합니다.</p>
            <div class="bc-ai-demo">
              <div class="bc-ai-q">@Weave AI 이 내용 요약해줘</div>
              <div class="bc-ai-a"><span>✦</span>SNS 중심 마케팅, 20대 타겟, UGC 활용 권장</div>
            </div>
          </div>

          <div class="bc bc-sm">
            <div class="bc-ico bc-ico-sm"><i class="bi bi-grid-3x3-gap-fill"></i></div>
            <h3>워크스페이스</h3>
            <p>팀별 독립 공간. 채널·문서·멤버를 한 곳에서 관리하세요.</p>
          </div>

          <div class="bc bc-sm bc-outline">
            <div class="bc-ico bc-ico-sm bc-ico-out"><i class="bi bi-file-richtext-fill"></i></div>
            <h3>블록 에디터</h3>
            <p>헤딩·체크리스트·코드블록으로 완성도 높은 문서를 작성하세요.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FLOW STEPS ══ -->
    <section class="hv-flow">
      <div class="hv-con">
        <div class="sec-hd">
          <span class="sec-chip">워크플로우</span>
          <h2 class="sec-title">세 단계로 완성되는<br>팀 지식 관리</h2>
        </div>
        <div class="flow-steps">
          <div class="fs">
            <div class="fs-num">01</div>
            <div class="fs-ico"><i class="bi bi-chat-dots-fill"></i></div>
            <h4>자유롭게 대화</h4>
            <p>채널에서 팀원과 실시간으로 소통하고, AI에게 @멘션으로 즉석 도움을 받으세요.</p>
          </div>
          <div class="fs-conn"><span></span><i class="bi bi-arrow-right"></i><span></span></div>
          <div class="fs fs-feat">
            <span class="fs-feat-badge">핵심</span>
            <div class="fs-num">02</div>
            <div class="fs-ico"><i class="bi bi-bookmark-star-fill"></i></div>
            <h4>북마크로 아카이빙</h4>
            <p>중요 메시지 옆 북마크 클릭 한 번. 자동으로 문서 블록에 삽입됩니다.</p>
          </div>
          <div class="fs-conn"><span></span><i class="bi bi-arrow-right"></i><span></span></div>
          <div class="fs">
            <div class="fs-num">03</div>
            <div class="fs-ico"><i class="bi bi-file-richtext-fill"></i></div>
            <h4>문서로 완성</h4>
            <p>모인 내용을 에디터에서 다듬어 기획서나 회의록으로 완성하세요.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <section class="hv-cta">
      <div class="cta-bg">
        <div class="cta-orb"></div>
        <div class="cta-grid"></div>
      </div>
      <div class="hv-con cta-body">
        <div class="cta-sparkle">✦</div>
        <template v-if="!authStore.isAuthenticated">
          <h2 class="cta-title">지금 Weave를 시작하세요</h2>
          <p class="cta-sub">대화가 문서가 되는 순간, 팀의 생산성이 달라집니다.</p>
          <router-link to="/signup" class="cta-btn">
            무료 워크스페이스 만들기
            <svg viewBox="0 0 16 16" fill="none" width="13"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </router-link>
          <p class="cta-note">신용카드 불필요 · 무료로 시작</p>
        </template>
        <template v-else>
          <h2 class="cta-title">팀과 함께 시작하세요</h2>
          <p class="cta-sub">새 워크스페이스를 만들거나 팀의 초대 링크로 참여하세요.</p>
          <div class="cta-btns">
            <button class="cta-btn" @click="showCreate = true">
              새 워크스페이스 만들기
              <svg viewBox="0 0 16 16" fill="none" width="13"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cta-btn-ghost" @click="showJoin = true">
              <i class="bi bi-link-45deg"></i> 초대 링크로 참여
            </button>
          </div>
        </template>
      </div>
    </section>

    <!-- 모달 -->
    <WorkspaceCreateModal v-if="showCreate" @close="showCreate = false" @created="onCreated" />
    <WorkspaceJoinModal   v-if="showJoin"   @close="showJoin = false"   @joined="onJoined" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import WorkspaceCreateModal from '@/components/workspace/WorkspaceCreateModal.vue'
import WorkspaceJoinModal   from '@/components/workspace/WorkspaceJoinModal.vue'

const router         = useRouter()
const authStore      = useAuthStore()
const workspaceStore = useWorkspaceStore()

const showCreate = ref(false)
const showJoin   = ref(false)

// 가장 최근 워크스페이스 (목록 첫 번째)
const latestWorkspace = computed(() => workspaceStore.workspaceList[0] ?? null)

onMounted(() => {
  if (authStore.isAuthenticated) {
    workspaceStore.fetchMyWorkspaces()
  }
})

async function goToWorkspace(ws) {
  await workspaceStore.setCurrentWorkspace(ws)
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}

async function onCreated(newWs) {
  showCreate.value = false
  router.push({ name: 'workspace', params: { slug: newWs.slug } })
}

async function onJoined(ws) {
  showJoin.value = false
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}
</script>

<style scoped>
.hv { font-family: "Pretendard", sans-serif; overflow-x: hidden; background: #0C0B1A; }
.hv-con { max-width: 1200px; margin: 0 auto; padding: 0 36px; }
@media (max-width: 640px) { .hv-con { padding: 0 20px; } }
.d-br { display: block; }
@media (max-width: 640px) { .d-br { display: none; } }

/* ══ HERO ══ */
.hv-hero { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; padding: 110px 0 90px; }
.hero-bg { position: absolute; inset: 0; pointer-events: none; }
.hb-orb { position: absolute; border-radius: 50%; }
.o1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(120,121,192,0.22) 0%, rgba(102,103,171,0.08) 50%, transparent 70%); top: -200px; right: -100px; animation: orbFloat1 16s ease-in-out infinite; filter: blur(1px); }
.o2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%); bottom: -100px; left: -100px; animation: orbFloat2 20s ease-in-out infinite; }
.o3 { width: 360px; height: 360px; background: radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%); top: 40%; left: 30%; animation: orbFloat3 12s ease-in-out infinite; }
@keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-24px,20px) scale(1.04)} 66%{transform:translate(16px,-24px) scale(0.97)} }
@keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-28px)} }
@keyframes orbFloat3 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.18) translate(-8px,12px)} }
.hb-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(180,160,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,255,0.05) 1px, transparent 1px); background-size: 52px 52px; mask-image: radial-gradient(ellipse 85% 85% at 55% 45%, black 40%, transparent 100%); }
.hb-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(12,11,26,0.6) 100%); }

.hv-hero .hv-con { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; position: relative; z-index: 2; }
@media (max-width: 1060px) { .hv-hero .hv-con { grid-template-columns: 1fr; } .hl-visual { display: none; } }

.hl-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(180,160,255,0.08); border: 1px solid rgba(180,160,255,0.18); color: #C4B5FD; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; margin-bottom: 30px; letter-spacing: 0.04em; }
.hl-tag-dot { width: 7px; height: 7px; border-radius: 50%; background: #8889C4; box-shadow: 0 0 8px rgba(136,137,196,0.8); animation: dotBlink 2.4s ease-in-out infinite; }
@keyframes dotBlink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.5)} }

.hl-h1 { display: flex; flex-direction: column; margin-bottom: 24px; }
.hl-line { line-height: 1.08; letter-spacing: -0.04em; }
.hl-line.dim    { font-size: clamp(2.2rem,4.2vw,3.8rem); font-weight: 300; color: rgba(240,239,248,0.28); }
.hl-line.em     { font-size: clamp(2.8rem,5.2vw,4.9rem); font-weight: 900; color: #F0EFF8; }
.hl-line.em em  { font-style: normal; background: linear-gradient(135deg, #DDD6FE 0%, #A78BFA 45%, #8889C4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hl-line.bright { font-size: clamp(1.6rem,3vw,2.8rem); font-weight: 800; color: rgba(240,239,248,0.75); }

.hl-sub { font-size: 1.05rem; color: rgba(220,218,240,0.45); line-height: 1.85; margin-bottom: 40px; max-width: 440px; font-weight: 300; }

.hl-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 38px; }
.hl-btn-main { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: linear-gradient(135deg, #9A9BD0, #7879C0, #6667AB); color: #fff; border-radius: 14px; font-size: 14.5px; font-weight: 600; text-decoration: none; transition: all 0.28s; box-shadow: 0 0 32px rgba(120,121,192,0.32), inset 0 1px 0 rgba(255,255,255,0.18); border: none; cursor: pointer; }
.hl-btn-main:hover { color: #fff; transform: translateY(-3px); box-shadow: 0 0 56px rgba(120,121,192,0.55), inset 0 1px 0 rgba(255,255,255,0.18); }
.hl-btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 14px 24px; color: rgba(220,218,240,0.42); border: 1px solid rgba(180,160,255,0.14); border-radius: 14px; font-size: 14.5px; font-weight: 400; text-decoration: none; transition: all 0.25s; background: none; cursor: pointer; }
.hl-btn-ghost:hover { color: #DDD6FE; border-color: rgba(180,160,255,0.35); background: rgba(180,160,255,0.06); }

/* 로그인 후: 워크스페이스 빠른 접근 */
.hl-ws-quick { display: flex; flex-direction: column; gap: 10px; }
.hl-ws-label { font-size: 11.5px; color: rgba(220,218,240,0.28); font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; }
.hl-ws-list { display: flex; flex-wrap: wrap; gap: 8px; }
.hl-ws-chip { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,160,255,0.12); border-radius: 100px; color: rgba(220,218,240,0.55); font-size: 12.5px; cursor: pointer; transition: all 0.2s; }
.hl-ws-chip:hover { background: rgba(180,160,255,0.1); border-color: rgba(180,160,255,0.28); color: #DDD6FE; }
.hl-ws-chip-icon { width: 20px; height: 20px; border-radius: 6px; background: linear-gradient(135deg, #8889C4, #6667AB); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.hl-ws-more { color: rgba(196,181,253,0.4); }

/* 소셜 프루프 */
.hl-proof { display: flex; align-items: center; gap: 14px; }
.hl-avs { display: flex; }
.hl-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; margin-right: -8px; border: 2px solid #0C0B1A; }
.hl-proof p { font-size: 12.5px; color: rgba(220,218,240,0.3); margin-left: 12px; font-weight: 300; }

/* 비주얼 카드 */
.hl-visual { position: relative; height: 510px; }
.hl-card { position: absolute; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,160,255,0.12); border-radius: 20px; overflow: hidden; backdrop-filter: blur(20px); box-shadow: 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
.chat-card { width: 315px; top: 0; right: 0; animation: cardBob 6s ease-in-out infinite; }
@keyframes cardBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.hl-card-hd { display: flex; align-items: center; gap: 6px; padding: 11px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(180,160,255,0.08); }
.mac-dots { display: flex; gap: 5px; }
.mac-r { width:9px;height:9px;border-radius:50%;background:#FF5F57; }
.mac-y { width:9px;height:9px;border-radius:50%;background:#FFBD2E; }
.mac-g { width:9px;height:9px;border-radius:50%;background:#28C840; }
.ch-name { font-size: 12px; color: rgba(220,218,240,0.6); font-weight: 500; margin-left: 6px; flex: 1; }
.ch-online { display: flex; align-items: center; gap: 5px; font-size: 10.5px; color: rgba(220,218,240,0.3); }
.ch-online span { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 6px rgba(74,222,128,0.6); }
.hl-msgs { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.hl-msg { display: flex; gap: 8px; align-items: flex-start; }
.hl-av-sm { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 9.5px; font-weight: 700; color: #fff; }
.ai-av { background: linear-gradient(135deg, #8889C4, #A78BFA); font-size: 8.5px; }
.hl-mb { display: flex; flex-direction: column; gap: 2px; }
.hl-nm { font-size: 10px; font-weight: 600; color: rgba(220,218,240,0.5); }
.hl-mt { font-size: 12px; color: rgba(220,218,240,0.45); line-height: 1.4; }
.ai-nm { color: #C4B5FD; }
.ai-mt { color: #C4B5FD; }
.hl-input-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(180,160,255,0.07); font-size: 11px; color: rgba(220,218,240,0.2); }
.hl-ibicons { display: flex; gap: 10px; font-size: 12.5px; color: rgba(220,218,240,0.22); }

.hl-toast { position: absolute; bottom: 150px; right: 0; display: flex; align-items: center; gap: 9px; background: rgba(18,16,38,0.9); border: 1px solid rgba(180,160,255,0.2); border-left: 2px solid #8889C4; border-radius: 12px; padding: 10px 14px; font-size: 12px; color: rgba(220,218,240,0.65); width: 285px; box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(120,121,192,0.1); backdrop-filter: blur(16px); animation: toastIn 0.4s ease 0.3s both, cardBob 6s ease-in-out 0.5s infinite; }
@keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.hl-toast-icon { color: #8889C4; font-size: 13px; }
.hl-toast strong { color: #DDD6FE; font-weight: 600; }
.hl-toast-t { margin-left: auto; font-size: 10.5px; color: rgba(220,218,240,0.25); }

.doc-card { width: 262px; bottom: 0; left: 0; animation: cardBob 6s ease-in-out 1.8s infinite; }
.doc-ico { color: #8889C4; }
.doc-title { font-size: 12px; color: rgba(220,218,240,0.6); font-weight: 500; flex: 1; }
.doc-saved { margin-left: auto; font-size: 10px; color: #4ADE80; background: rgba(74,222,128,0.1); padding: 2px 8px; border-radius: 100px; }
.hl-doc-body { padding: 10px 14px; display: flex; flex-direction: column; gap: 7px; }
.doc-blk { font-size: 11.5px; padding: 3px 5px; border-radius: 5px; }
.blk-h  { font-weight: 700; color: rgba(240,239,248,0.8); font-size: 12px; }
.blk-todo { display: flex; align-items: center; gap: 7px; color: rgba(220,218,240,0.45); }
.blk-done { display: flex; align-items: center; gap: 7px; color: rgba(220,218,240,0.25); text-decoration: line-through; }
.cb { width: 12px; height: 12px; border: 1.5px solid rgba(180,160,255,0.3); border-radius: 3px; flex-shrink: 0; }
.cb-done { background: #7879C0; border-color: #7879C0; position: relative; }
.cb-done::after { content:''; position:absolute; inset: 1px 1.5px; border:1.5px solid #fff; border-top:none; border-left:none; transform:rotate(45deg); }
.blk-note { color: rgba(220,218,240,0.25); font-style: italic; font-size: 10.5px; }

.hl-stat { position: absolute; bottom: 108px; right: 0; background: linear-gradient(145deg, #8889C4, #7879C0, #6667AB); border-radius: 16px; padding: 14px 20px; text-align: center; animation: cardBob 6s ease-in-out 3.2s infinite; box-shadow: 0 8px 32px rgba(120,121,192,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
.stat-n { display: block; font-size: 2rem; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1; }
.stat-l { font-size: 10px; color: rgba(255,255,255,0.7); white-space: nowrap; font-weight: 400; }

/* ══ BENTO ══ */
.hv-bento { padding: 110px 0; background: #100F24; }
.sec-hd { text-align: center; margin-bottom: 60px; }
.sec-chip { display: inline-block; background: rgba(180,160,255,0.1); color: #C4B5FD; border: 1px solid rgba(180,160,255,0.18); padding: 5px 16px; border-radius: 100px; font-size: 11.5px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 16px; }
.sec-title { font-size: clamp(1.9rem,3.2vw,2.8rem); font-weight: 800; color: #F0EFF8; letter-spacing: -0.03em; margin-bottom: 14px; }
.sec-sub { font-size: 1rem; color: rgba(220,218,240,0.38); max-width: 440px; margin: 0 auto; line-height: 1.8; font-weight: 300; }

.bento-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; grid-template-rows: auto auto; gap: 16px; }
@media (max-width: 900px) { .bento-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 580px) { .bento-grid { grid-template-columns: 1fr; } }

.bc { border-radius: 22px; padding: 30px 26px; position: relative; transition: transform 0.35s, box-shadow 0.35s; overflow: hidden; }
.bc:hover { transform: translateY(-6px); }
.bc-lg { grid-row: 1/3; background: linear-gradient(160deg, #1D1B3A 0%, #15133A 50%, #12122B 100%); border: 1px solid rgba(180,160,255,0.16); }
.bc-lg:hover { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,160,255,0.2); }
.bc-glow { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(120,121,192,0.14), transparent 70%); top: -60px; right: -60px; border-radius: 50%; pointer-events: none; }
.bc-badge { position: absolute; top: 20px; right: 20px; background: rgba(180,160,255,0.15); color: #C4B5FD; border: 1px solid rgba(180,160,255,0.2); font-size: 10.5px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
.bc-ico { width: 52px; height: 52px; border-radius: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: linear-gradient(145deg, rgba(180,160,255,0.18), rgba(120,121,192,0.1)); color: #C4B5FD; border: 1px solid rgba(180,160,255,0.18); }
.bc-ico-sm { width: 44px; height: 44px; border-radius: 12px; font-size: 18px; margin-bottom: 16px; background: rgba(180,160,255,0.1); color: #C4B5FD; border: 1px solid rgba(180,160,255,0.14); }
.bc-ico-ai  { background: rgba(167,139,250,0.12); color: #A78BFA; }
.bc-ico-out { background: rgba(180,160,255,0.07); color: #8889C4; }
.bc-lg h3 { font-size: 1.1rem; font-weight: 700; color: #F0EFF8; margin-bottom: 10px; }
.bc-lg p  { font-size: 13.5px; color: rgba(220,218,240,0.45); line-height: 1.75; margin-bottom: 22px; font-weight: 300; }
.bc-md { background: rgba(255,255,255,0.03); border: 1px solid rgba(180,160,255,0.1); }
.bc-md:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.4); border-color: rgba(180,160,255,0.2); }
.bc-ai { background: rgba(167,139,250,0.05); border-color: rgba(167,139,250,0.14); }
.bc-sm { background: rgba(255,255,255,0.03); border: 1px solid rgba(180,160,255,0.1); }
.bc-outline { background: transparent; border: 1.5px dashed rgba(180,160,255,0.15); }
.bc-outline:hover { background: rgba(180,160,255,0.02); border-color: rgba(180,160,255,0.28); box-shadow: none; }
.bc-md h3, .bc-sm h3 { font-size: 1rem; font-weight: 700; color: #F0EFF8; margin-bottom: 8px; }
.bc-md p, .bc-sm p   { font-size: 13px; color: rgba(220,218,240,0.4); line-height: 1.7; margin-bottom: 14px; font-weight: 300; }
.bc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.bc-tags span { background: rgba(180,160,255,0.1); color: #C4B5FD; font-size: 11px; padding: 3px 10px; border-radius: 100px; font-weight: 500; border: 1px solid rgba(180,160,255,0.14); }
.bc-mini { display: flex; flex-direction: column; gap: 8px; }
.bm-chat { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 9px 12px; }
.bm-av { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }
.bm-av.sm { width: 22px; height: 22px; font-size: 9px; }
.bm-chat > span { flex: 1; font-size: 11.5px; color: rgba(220,218,240,0.65); }
.bm-btn { background: rgba(180,160,255,0.2); border: 1px solid rgba(180,160,255,0.25); border-radius: 6px; padding: 3px 8px; color: #C4B5FD; font-size: 11px; cursor: pointer; }
.bm-arr { text-align: center; font-size: 11px; color: rgba(196,181,253,0.5); }
.bm-doc { background: rgba(180,160,255,0.06); border: 1px solid rgba(180,160,255,0.15); border-radius: 10px; padding: 9px 12px; display: flex; flex-direction: column; gap: 4px; }
.bm-dh { font-size: 11.5px; font-weight: 600; color: rgba(220,218,240,0.7); }
.bm-db { font-size: 11px; color: #C4B5FD; }
.bc-msgs { display: flex; flex-direction: column; gap: 7px; }
.bc-msg { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 7px 10px; }
.bc-msg span:nth-child(2) { flex: 1; font-size: 12px; color: rgba(220,218,240,0.45); }
.bc-react { font-size: 11px; color: rgba(220,218,240,0.3); }
.bc-ai-demo { display: flex; flex-direction: column; gap: 8px; }
.bc-ai-q { background: rgba(180,160,255,0.08); border-radius: 9px; padding: 9px 12px; font-size: 12px; color: #C4B5FD; font-style: italic; border: 1px solid rgba(180,160,255,0.14); }
.bc-ai-a { display: flex; gap: 8px; align-items: flex-start; background: rgba(255,255,255,0.03); border: 1px solid rgba(180,160,255,0.12); border-radius: 9px; padding: 9px 12px; font-size: 12px; color: rgba(220,218,240,0.45); line-height: 1.6; }
.bc-ai-a span { color: #8889C4; font-size: 14px; flex-shrink: 0; }

/* ══ FLOW ══ */
.hv-flow { padding: 110px 0; background: #0C0B1A; }
.hv-flow .sec-hd { text-align: left; }
.flow-steps { display: flex; align-items: stretch; }
.fs { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(180,160,255,0.1); border-radius: 22px; padding: 36px 30px; position: relative; transition: all 0.3s; }
.fs:hover { transform: translateY(-6px); box-shadow: 0 20px 56px rgba(0,0,0,0.45); border-color: rgba(180,160,255,0.2); }
.fs-feat { background: linear-gradient(155deg, #1D1B3A, #15133A, #13122A); border-color: rgba(180,160,255,0.2); }
.fs-feat h4, .fs-feat p { color: #F0EFF8 !important; }
.fs-feat .fs-num { color: rgba(255,255,255,0.18); }
.fs-feat .fs-ico { background: rgba(255,255,255,0.14); color: #DDD6FE; }
.fs-feat-badge { position: absolute; top: 18px; right: 18px; background: rgba(180,160,255,0.2); color: #DDD6FE; font-size: 10.5px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
.fs-num { font-size: 2.4rem; font-weight: 900; color: rgba(180,160,255,0.12); letter-spacing: -0.05em; margin-bottom: 14px; }
.fs-ico { width: 48px; height: 48px; border-radius: 14px; background: rgba(180,160,255,0.09); color: #C4B5FD; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 18px; border: 1px solid rgba(180,160,255,0.14); }
.fs h4 { font-size: 1rem; font-weight: 700; color: #F0EFF8; margin-bottom: 10px; }
.fs p  { font-size: 13px; color: rgba(220,218,240,0.4); line-height: 1.7; margin: 0; font-weight: 300; }
.fs-conn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 14px; flex-shrink: 0; }
.fs-conn span { width: 1px; flex: 1; background: rgba(180,160,255,0.1); }
.fs-conn i { font-size: 0.95rem; color: rgba(180,160,255,0.25); padding: 8px 0; }
@media (max-width: 768px) { .flow-steps { flex-direction: column; } .fs-conn { flex-direction: row; padding: 8px 0; height: 32px; } .fs-conn span { width: auto; height: 1px; flex: 1; } .fs-conn i { transform: rotate(90deg); } }

/* ══ CTA ══ */
.hv-cta { position: relative; background: #100F24; padding: 110px 0; overflow: hidden; text-align: center; border-top: 1px solid rgba(180,160,255,0.08); }
.cta-bg { position: absolute; inset: 0; pointer-events: none; }
.cta-orb { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(120,121,192,0.16), transparent 65%); top: 50%; left: 50%; transform: translate(-50%,-50%); border-radius: 50%; }
.cta-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(180,160,255,0.15) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
.cta-body { position: relative; z-index: 2; }
.cta-sparkle { font-size: 2.4rem; color: #8889C4; filter: drop-shadow(0 0 16px rgba(136,137,196,0.7)); margin-bottom: 20px; display: block; animation: sparkleGlow 3s ease-in-out infinite; }
@keyframes sparkleGlow { 0%,100%{filter:drop-shadow(0 0 16px rgba(136,137,196,0.5))} 50%{filter:drop-shadow(0 0 32px rgba(136,137,196,0.9))} }
.cta-title { font-size: clamp(2rem,3.8vw,3.2rem); font-weight: 800; color: #F0EFF8; letter-spacing: -0.03em; margin-bottom: 18px; }
.cta-sub { font-size: 1.05rem; color: rgba(220,218,240,0.38); line-height: 1.8; margin-bottom: 44px; font-weight: 300; }
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.cta-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 44px; background: linear-gradient(135deg, #9A9BD0, #7879C0, #6667AB); color: #fff; border-radius: 16px; font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 0 40px rgba(120,121,192,0.35), inset 0 1px 0 rgba(255,255,255,0.18); border: none; cursor: pointer; }
.cta-btn:hover { color: #fff; transform: translateY(-3px); box-shadow: 0 0 64px rgba(120,121,192,0.6), inset 0 1px 0 rgba(255,255,255,0.18); }
.cta-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; color: rgba(220,218,240,0.45); border: 1px solid rgba(180,160,255,0.18); border-radius: 16px; font-size: 15px; font-weight: 400; background: none; cursor: pointer; transition: all 0.25s; }
.cta-btn-ghost:hover { color: #DDD6FE; border-color: rgba(180,160,255,0.38); background: rgba(180,160,255,0.06); }
.cta-note { margin-top: 20px; font-size: 12.5px; color: rgba(220,218,240,0.22); font-weight: 300; }
</style>