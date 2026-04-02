<!-- src/components/layout/GNB.vue -->
<!-- 좌측 Global Navigation Bar - 워크스페이스 아이콘 목록 -->

<template>
  <nav class="gnb">

    <!-- 워크스페이스 아이콘 목록 -->
    <ul class="gnb__list">
      <li
        v-for="ws in workspaceStore.workspaceList"
        :key="ws.workspaceId"
        class="gnb__item"
        :class="{ 'gnb__item--active': ws.workspaceId === workspaceStore.currentWorkspaceId }"
        :title="ws.wsName"
        @click="enterWorkspace(ws)"
      >
        <!-- 아이콘 이미지가 있으면 표시, 없으면 이름 첫 글자 -->
        <img
          v-if="ws.iconUrl"
          :src="ws.iconUrl"
          :alt="ws.wsName"
          class="gnb__icon-img"
        />
        <span v-else class="gnb__icon-text">
          {{ ws.wsName.charAt(0).toUpperCase() }}
        </span>
      </li>
    </ul>

    <!-- 구분선 -->
    <hr class="gnb__divider" />

    <!-- 워크스페이스 추가 버튼 -->
    <button class="gnb__add-btn" title="새 워크스페이스 만들기" @click="openCreateModal">
      <span class="gnb__add-icon">＋</span>
    </button>

    <!-- 초대 코드로 입장 버튼 -->
    <button class="gnb__join-btn" title="초대 링크로 입장" @click="openJoinModal">
      <span class="gnb__join-icon">🔗</span>
    </button>

    <!-- 워크스페이스 생성 모달 -->
    <WorkspaceCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onWorkspaceCreated"
    />

    <!-- 초대 링크 입장 모달 -->
    <WorkspaceJoinModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="onWorkspaceJoined"
    />
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import WorkspaceCreateModal from '@/components/workspace/WorkspaceCreateModal.vue'
import WorkspaceJoinModal   from '@/components/workspace/WorkspaceJoinModal.vue'

const router         = useRouter()
const workspaceStore = useWorkspaceStore()

const showCreateModal = ref(false)
const showJoinModal   = ref(false)

// 마운트 시 워크스페이스 목록 불러오기
onMounted(() => {
  workspaceStore.fetchMyWorkspaces()
})

function openCreateModal() { showCreateModal.value = true }
function openJoinModal()   { showJoinModal.value   = true }

/** 워크스페이스 클릭 → 입장 + 라우팅 */
async function enterWorkspace(ws) {
  await workspaceStore.setCurrentWorkspace(ws)
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}

/** 생성 완료 콜백 */
async function onWorkspaceCreated(newWs) {
  showCreateModal.value = false
  router.push({ name: 'workspace', params: { slug: newWs.slug } })
}

/** 참여 완료 콜백 */
async function onWorkspaceJoined(ws) {
  showJoinModal.value = false
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}
</script>

<style scoped>
.gnb {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 68px;
  min-height: 100vh;
  background: #1a1d21;   /* Slack-style 다크 사이드바 */
  padding: 12px 0;
  gap: 4px;
}

.gnb__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  align-items: center;
}

.gnb__item {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #36393f;
  transition: border-radius 0.2s, background 0.2s;
  overflow: hidden;
}
.gnb__item:hover,
.gnb__item--active {
  border-radius: 16px;
  background: #5865f2;
}
.gnb__icon-img  { width: 100%; height: 100%; object-fit: cover; }
.gnb__icon-text { color: #fff; font-weight: 700; font-size: 16px; }

.gnb__divider {
  width: 32px;
  border: none;
  border-top: 2px solid #36393f;
  margin: 8px 0;
}

.gnb__add-btn,
.gnb__join-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px dashed #36393f;
  background: transparent;
  color: #43b581;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-radius 0.2s, background 0.2s, color 0.2s;
}
.gnb__add-btn:hover,
.gnb__join-btn:hover {
  border-radius: 16px;
  background: #43b581;
  color: #fff;
  border-color: #43b581;
}
</style>
