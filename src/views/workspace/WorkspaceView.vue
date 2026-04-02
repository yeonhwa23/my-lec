<!-- src/views/workspace/WorkspaceView.vue -->
<!-- 워크스페이스 메인 레이아웃 (GNB + LNB + Main View 3단 분할) -->

<template>
  <div class="app-layout">

    <!-- 좌측: GNB (워크스페이스 아이콘 목록) -->
    <GNB class="app-layout__gnb" />

    <!-- 중앙: LNB (채널/문서 목록 사이드바) -->
    <aside class="app-layout__lnb">
      <WorkspaceSidebar
        v-if="workspaceStore.currentWorkspace"
        :workspace="workspaceStore.currentWorkspace"
        :members="workspaceStore.memberList"
      />
      <div v-else class="lnb-empty">
        <p>워크스페이스를 선택하세요</p>
      </div>
    </aside>

    <!-- 우측: Main View (채팅 or 에디터) -->
    <main class="app-layout__main">
      <!-- slug에 맞는 워크스페이스를 자동으로 입장 처리 후 하위 라우트 렌더링 -->
      <RouterView v-if="ready" />
      <div v-else class="main-loading">불러오는 중...</div>
    </main>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import GNB               from '@/components/layout/GNB.vue'
import WorkspaceSidebar  from '@/components/workspace/WorkspaceSidebar.vue'

const route          = useRoute()
const workspaceStore = useWorkspaceStore()
const ready          = ref(false)

/**
 * URL slug 기준으로 워크스페이스 입장 처리
 * 새로고침 또는 직접 URL 접근 시에도 정상 동작
 */
async function loadWorkspaceBySlug(slug) {
  ready.value = false
  try {
    // 목록이 아직 없으면 먼저 가져오기
    if (!workspaceStore.workspaceList.length) {
      await workspaceStore.fetchMyWorkspaces()
    }
    // 목록에서 slug에 해당하는 워크스페이스 찾기
    const ws = workspaceStore.workspaceList.find(w => w.slug === slug)
    if (ws) {
      await workspaceStore.setCurrentWorkspace(ws)
    }
  } finally {
    ready.value = true
  }
}

onMounted(() => loadWorkspaceBySlug(route.params.slug))

// slug 파라미터가 바뀔 때마다 재입장
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) loadWorkspaceBySlug(newSlug)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* GNB: 가장 좁은 영역 (68px 고정) */
.app-layout__gnb {
  flex: 0 0 68px;
}

/* LNB: 채널/문서 목록 (240px 고정) */
.app-layout__lnb {
  flex: 0 0 240px;
  background: #2f3136;
  color: #dcddde;
  overflow-y: auto;
  border-right: 1px solid #202225;
}

/* Main View: 나머지 전체 */
.app-layout__main {
  flex: 1;
  background: #36393f;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lnb-empty, .main-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #72767d;
  font-size: 14px;
}
</style>
