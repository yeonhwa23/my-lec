<template>
  <nav class="gnb">

    <ul class="gnb__list">
      <li
        v-for="ws in workspaceStore.workspaceList"
        :key="ws.workspaceId"
        class="gnb__item"
        :class="{ 'gnb__item--active': ws.workspaceId === workspaceStore.currentWorkspaceId }"
        :title="ws.wsName"
        @click="enterWorkspace(ws)"
        @mouseenter="showPreview(ws, $event)"
        @mouseleave="hidePreview"
      >
        <img
          v-if="ws.iconUrl && (ws.iconUrl.startsWith('/') || ws.iconUrl.startsWith('http'))"
          :src="getFullIconUrl(ws.iconUrl)"
          :alt="ws.wsName"
          class="gnb__icon-img"
        />
        <span v-else-if="ws.iconUrl" class="gnb__icon-emoji">{{ ws.iconUrl }}</span>
        <span v-else class="gnb__icon-text">{{ ws.wsName.substring(0, 2).toUpperCase() }}</span>
      </li>
    </ul>

    <hr class="gnb__divider" />

    <button class="gnb__action-btn" title="새 워크스페이스 만들기" @click="openCreateModal">
      <span class="gnb__action-icon">＋</span>
    </button>

    <button class="gnb__action-btn" title="초대 링크로 입장" @click="openJoinModal">
      <span class="gnb__action-icon">🔗</span>
    </button>

    <button
      v-if="workspaceStore.currentWorkspace && workspaceStore.currentWorkspace.ownerMemberId == authStore.auth?.member_id"
      class="gnb__action-btn gnb__settings-btn"
      title="현재 워크스페이스 설정"
      @click="goToSettings"
    >
      <i class="bi bi-gear-fill"></i>
    </button>

    <!-- 워크스페이스 hover 프리뷰 팝업 -->
    <Teleport to="body">
      <div
        v-if="previewWs"
        class="ws-preview"
        :style="{ top: previewTop + 'px' }"
        @mouseenter="keepPreview"
        @mouseleave="hidePreview"
      >
        <!-- 배너 -->
        <div class="ws-preview__banner">
          <img
            v-if="previewWs.bannerUrl"
            :src="getFullIconUrl(previewWs.bannerUrl)"
            class="ws-preview__banner-img"
          />
          <div v-else class="ws-preview__banner-empty"></div>
        </div>

        <!-- 아이콘 + 이름 -->
        <div class="ws-preview__body">
          <div class="ws-preview__icon-wrap">
            <div class="ws-preview__icon">
              <img
                v-if="previewWs.iconUrl && (previewWs.iconUrl.startsWith('/') || previewWs.iconUrl.startsWith('http'))"
                :src="getFullIconUrl(previewWs.iconUrl)"
                class="ws-preview__icon-img"
              />
              <span v-else-if="previewWs.iconUrl" class="ws-preview__icon-emoji">{{ previewWs.iconUrl }}</span>
              <span v-else class="ws-preview__icon-text">{{ previewWs.wsName.substring(0, 2).toUpperCase() }}</span>
            </div>
          </div>

          <h3 class="ws-preview__name">{{ previewWs.wsName }}</h3>
          <p v-if="previewWs.description" class="ws-preview__desc">{{ previewWs.description }}</p>
          <p v-else class="ws-preview__desc ws-preview__desc--empty">설명 없음</p>

          <div class="ws-preview__meta">
            <span class="ws-preview__slug">🔗 {{ previewWs.slug }}</span>
          </div>

          <button class="ws-preview__enter-btn" @click="enterWorkspace(previewWs)">
            입장하기 →
          </button>
        </div>
      </div>
    </Teleport>

    <WorkspaceCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onWorkspaceCreated"
    />

    <WorkspaceJoinModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="onWorkspaceJoined"
    />

    <WorkspaceSettingsModal
      v-if="showSettingsModal"
      :workspace="workspaceStore.currentWorkspace"
      @close="showSettingsModal = false"
    />
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'

import WorkspaceCreateModal  from '@/components/workspace/WorkspaceCreateModal.vue'
import WorkspaceJoinModal    from '@/components/workspace/WorkspaceJoinModal.vue'
import WorkspaceSettingsModal from '@/components/workspace/WorkspaceSettingsModal.vue'

const router         = useRouter()
const workspaceStore = useWorkspaceStore()
const authStore      = useAuthStore()

const showCreateModal   = ref(false)
const showJoinModal     = ref(false)
const showSettingsModal = ref(false)

// 프리뷰 상태
const previewWs  = ref(null)
const previewTop = ref(0)
let hideTimer    = null

const API_BASE_URL = 'http://localhost:9090'
const getFullIconUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  return API_BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

function showPreview(ws, e) {
  clearTimeout(hideTimer)
  previewWs.value  = ws
  const rect       = e.currentTarget.getBoundingClientRect()
  previewTop.value = Math.min(rect.top, window.innerHeight - 320)
}
function keepPreview() { clearTimeout(hideTimer) }
function hidePreview() {
  hideTimer = setTimeout(() => { previewWs.value = null }, 120)
}

onMounted(() => { workspaceStore.fetchMyWorkspaces() })

function openCreateModal() { showCreateModal.value = true }
function openJoinModal()   { showJoinModal.value   = true }

async function enterWorkspace(ws) {
  previewWs.value = null
  await workspaceStore.setCurrentWorkspace(ws)
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}

async function onWorkspaceCreated(newWs) {
  showCreateModal.value = false
  router.push({ name: 'workspace', params: { slug: newWs.slug } })
}

async function onWorkspaceJoined(ws) {
  showJoinModal.value = false
  router.push({ name: 'workspace', params: { slug: ws.slug } })
}

function goToSettings() {
  router.push({ name: 'workspace-settings', params: { slug: workspaceStore.currentWorkspace.slug } })
}
</script>

<style scoped>
.gnb {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 68px;
  min-height: 100vh;
  background: #1a1d21;
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
  background: #4a4d54;
  transition: border-radius 0.2s, background 0.2s;
  overflow: hidden;
  position: relative;
}
.gnb__item:hover {
  border-radius: 16px;
  background: #5a5e66;
}
.gnb__item--active {
  border-radius: 16px;
  background: #3a3d44;
  box-shadow: inset 0 0 0 2px #6b7280;
}

.gnb__icon-img   { width: 100%; height: 100%; object-fit: cover; }
.gnb__icon-emoji { font-size: 24px; line-height: 1; }
.gnb__icon-text  { color: #fff; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; }

.gnb__divider {
  width: 32px;
  border: none;
  border-top: 2px solid #36393f;
  margin: 8px 0;
}

.gnb__action-btn {
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
  margin-bottom: 6px;
}
.gnb__action-btn:hover {
  border-radius: 16px;
  background: #43b581;
  color: #fff;
  border-color: #43b581;
}

.gnb__settings-btn {
  color: #b9bbbe;
  border-color: transparent;
  font-size: 18px;
}
.gnb__settings-btn:hover {
  background: #4f545c;
  color: #fff;
}

/* ── 워크스페이스 프리뷰 팝업 ── */
.ws-preview {
  position: fixed;
  left: 76px;
  width: 260px;
  background: #1e1c35;
  border: 1px solid rgba(180, 160, 255, 0.18);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  z-index: 99998;
  animation: previewIn 0.15s ease;
}
@keyframes previewIn {
  from { opacity: 0; transform: translateX(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0)    scale(1); }
}

.ws-preview__banner { width: 100%; height: 80px; overflow: hidden; background: #2a2845; }
.ws-preview__banner-img { width: 100%; height: 100%; object-fit: cover; }
.ws-preview__banner-empty { width: 100%; height: 100%; background: linear-gradient(135deg, #2a2845 0%, #1a1d35 100%); }

.ws-preview__body { padding: 0 16px 16px; }

.ws-preview__icon-wrap { margin-top: -22px; margin-bottom: 8px; }
.ws-preview__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #2a2845;
  border: 3px solid #1e1c35;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.ws-preview__icon-img  { width: 100%; height: 100%; object-fit: cover; }
.ws-preview__icon-emoji { font-size: 22px; }
.ws-preview__icon-text  { font-size: 14px; font-weight: 700; color: #E0DEFF; }

.ws-preview__name {
  font-size: 14px;
  font-weight: 700;
  color: #F0EFF8;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ws-preview__desc {
  font-size: 12px;
  color: rgba(220, 218, 240, 0.5);
  margin: 0 0 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ws-preview__desc--empty { font-style: italic; }

.ws-preview__meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.ws-preview__slug {
  font-size: 11px;
  color: rgba(180, 160, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-preview__enter-btn {
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #8889C4, #6667AB);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  font-family: inherit;
}
.ws-preview__enter-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}
</style>