<template>
  <div class="app-layout">

    <GNB class="app-layout__gnb" />

    <aside class="app-layout__lnb">
      <div class="lnb-header" v-if="workspaceStore.currentWorkspace">
        <span class="ws-name">{{ workspaceStore.currentWorkspace.wsName }}</span>
        <button
          v-if="workspaceStore.currentWorkspace.ownerMemberId === authStore.auth?.memberId"
          class="btn-settings"
          @click="router.push({ name: 'workspace-settings', params: { slug: route.params.slug } })"
          title="워크스페이스 설정"
        >
          <i class="bi bi-gear-fill"></i>
        </button>
      </div>

      <WorkspaceSidebar
        v-if="workspaceStore.currentWorkspace"
        :workspace="workspaceStore.currentWorkspace"
        :members="workspaceStore.memberList"
      />
      <div v-else class="lnb-empty">
        <p>워크스페이스를 선택하세요</p>
      </div>
    </aside>

    <main class="app-layout__main">
      <RouterView v-if="ready" class="router-view-fill" />
      <div v-else class="main-loading">불러오는 중...</div>
    </main>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'

import GNB              from '@/components/layout/GNB.vue'
import WorkspaceSidebar from '@/components/workspace/WorkspaceSidebar.vue'

const route          = useRoute()
const router         = useRouter()
const workspaceStore = useWorkspaceStore()
const authStore      = useAuthStore()
const ready          = ref(false)

async function loadWorkspaceBySlug(slug) {
  ready.value = false
  try {
    if (!workspaceStore.workspaceList.length) {
      await workspaceStore.fetchMyWorkspaces()
    }
    const ws = workspaceStore.workspaceList.find(w => w.slug === slug)
    if (ws) await workspaceStore.setCurrentWorkspace(ws)
  } finally {
    ready.value = true
  }
}

onMounted(() => loadWorkspaceBySlug(route.params.slug))
watch(() => route.params.slug, (newSlug) => { if (newSlug) loadWorkspaceBySlug(newSlug) })
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-layout__gnb {
  flex: 0 0 68px;
}

.app-layout__lnb {
  flex: 0 0 240px;
  background: #2f3136;
  color: #dcddde;
  overflow-y: auto;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;
}

/* ✅ min-height: 0 이 없으면 자식 flex 아이템이 넘쳐도 줄어들지 않아서 채팅 input이 밀려남 */
.app-layout__main {
  flex: 1;
  min-height: 0;      /* ✅ 핵심 */
  background: #36393f;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ RouterView가 렌더하는 컴포넌트(ChatView 등)가 main 전체를 꽉 채우도록 */
.router-view-fill {
  flex: 1;
  min-height: 0;      /* ✅ 핵심 */
  overflow: hidden;
}

.lnb-empty,
.main-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #72767d;
  font-size: 14px;
}

.lnb-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.ws-name {
  font-weight: 800;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-settings {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.2s;
}
.btn-settings:hover { color: #fff; }
</style>