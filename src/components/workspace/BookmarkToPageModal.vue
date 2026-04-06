<!-- 
  BookmarkToPageModal.vue
  ========================
  채팅 메시지의 [북마크] 버튼 클릭 시 표시되는 모달.
  워크스페이스 내 페이지 목록을 보여주고, 선택한 페이지에 메시지를 아카이빙한다.

  사용법 (부모 컴포넌트 - 채팅뷰에서):
  ─────────────────────────────────────
  <BookmarkToPageModal
    v-if="bookmarkModal.visible"
    :message-id="bookmarkModal.messageId"
    :message-content="bookmarkModal.content"
    :workspace-id="currentWorkspaceId"
    @close="bookmarkModal.visible = false"
    @saved="onBookmarkSaved"
  />
  
  // data:
  bookmarkModal: { visible: false, messageId: null, content: '' }
  
  // 북마크 버튼 클릭 시:
  openBookmark(msg) {
    bookmarkModal.messageId = msg.messageId
    bookmarkModal.content   = msg.content
    bookmarkModal.visible   = true
  }
-->
<template>
  <Teleport to="body">
    <!-- 백드롭 -->
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true" aria-label="페이지에 저장">

        <!-- 헤더 -->
        <div class="modal-header">
          <div class="header-left">
            <span class="header-icon">📌</span>
            <span class="header-title">페이지에 저장</span>
          </div>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <!-- 미리보기 -->
        <div class="message-preview">
          <p class="preview-label">저장할 내용</p>
          <p class="preview-text">{{ messageContent }}</p>
        </div>

        <!-- 검색 -->
        <div class="search-row">
          <input
            v-model="query"
            class="search-input"
            placeholder="페이지 검색..."
            autofocus
          />
        </div>

        <!-- 페이지 목록 -->
        <div class="page-list-wrap">
          <div v-if="loading" class="list-state">불러오는 중...</div>

          <div v-else-if="filteredPages.length === 0" class="list-state">
            <span v-if="query">검색 결과가 없습니다.</span>
            <span v-else>페이지가 없습니다.<br/>먼저 페이지를 만들어 주세요.</span>
          </div>

          <ul v-else class="page-list">
            <li
              v-for="page in filteredPages"
              :key="page.pageId"
              class="page-item"
              :class="{ selected: selectedPageId === page.pageId }"
              @click="selectedPageId = page.pageId"
            >
              <span class="page-icon">{{ page.iconEmoji || '📄' }}</span>
              <span class="page-title">{{ page.title || '제목 없는 페이지' }}</span>
              <span v-if="selectedPageId === page.pageId" class="check">✓</span>
            </li>
          </ul>
        </div>

        <!-- 액션 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">취소</button>
          <button
            class="btn-save"
            :disabled="!selectedPageId || saving"
            @click="doSave"
          >
            <span v-if="saving">저장 중...</span>
            <span v-else>저장하기</span>
          </button>
        </div>

        <!-- 결과 토스트 -->
        <transition name="toast">
          <div v-if="toast.show" class="toast" :class="toast.type">
            {{ toast.message }}
          </div>
        </transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/util/http'

const props = defineProps({
  messageId:      { type: Number, required: true },
  messageContent: { type: String, required: true },
  workspaceId:    { type: [Number, String], required: true },
})

const emit = defineEmits(['close', 'saved'])
const router = useRouter()

// ── 상태 ─────────────────────────────────────────────
const pages          = ref([])
const loading        = ref(true)
const saving         = ref(false)
const selectedPageId = ref(null)
const query          = ref('')
const toast          = ref({ show: false, type: 'success', message: '' })

// ── 페이지 목록 (flat) ────────────────────────────────
const fetchPages = async () => {
  loading.value = true
  try {
    const tree = await http.get(`/workspaces/${props.workspaceId}/pages`) || []
    // TreeNode 배열을 flat하게 펼침 (선택지로 사용)
    pages.value = flattenTree(tree)
  } catch (e) {
    console.error('페이지 목록 오류:', e)
  } finally {
    loading.value = false
  }
}

function flattenTree(nodes, depth = 0) {
  const result = []
  for (const node of nodes) {
    result.push({ ...node, _depth: depth })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

const filteredPages = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return pages.value
  return pages.value.filter(p =>
    (p.title || '').toLowerCase().includes(q)
  )
})

// ── 저장 ─────────────────────────────────────────────
const doSave = async () => {
  if (!selectedPageId.value || saving.value) return
  saving.value = true
  try {
    await http.post(`/pages/${selectedPageId.value}/bookmark`, {
      messageId: props.messageId,
      content:   props.messageContent,
    })

    const saved = pages.value.find(p => p.pageId === selectedPageId.value)
    showToast('success', `'${saved?.title || '페이지'}'에 저장되었습니다`)
    emit('saved', { pageId: selectedPageId.value, page: saved })

    // 2초 후 모달 닫기
    setTimeout(() => {
      emit('close')
      // 선택적: 저장된 페이지로 이동할지 물어보기
      if (saved && confirm(`'${saved.title}'으로 이동할까요?`)) {
        const slug = router.currentRoute.value.params.slug
        router.push(`/ws/${slug}/page/${saved.pageId}`)
      }
    }, 1200)

  } catch (e) {
    const msg = e?.response?.data?.message || '저장에 실패했습니다.'
    if (e?.response?.status === 409) {
      showToast('warn', '이미 이 페이지에 저장된 메시지입니다.')
    } else {
      showToast('error', msg)
    }
  } finally {
    saving.value = false
  }
}

// ── 토스트 ────────────────────────────────────────────
const showToast = (type, message) => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

// ── 키보드 단축키 ─────────────────────────────────────
const onKeydown = (e) => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Enter' && selectedPageId.value) doSave()
}

onMounted(() => {
  fetchPages()
  window.addEventListener('keydown', onKeydown)
})

import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* 백드롭 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

/* 모달 카드 */
.modal {
  background: #2f3136;
  border-radius: 8px;
  width: 440px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  max-height: 85vh;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
}
.header-left   { display: flex; align-items: center; gap: 8px; }
.header-icon   { font-size: 18px; }
.header-title  { font-size: 16px; font-weight: 700; color: white; }
.btn-close {
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
.btn-close:hover { color: white; background: #36393f; }

/* 미리보기 */
.message-preview {
  padding: 12px 20px;
  background: #202225;
  border-bottom: 1px solid #18191c;
}
.preview-label {
  font-size: 11px;
  font-weight: 600;
  color: #72767d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}
.preview-text {
  font-size: 13px;
  color: #b9bbbe;
  margin: 0;
  max-height: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

/* 검색 */
.search-row {
  padding: 12px 20px 8px;
}
.search-input {
  width: 100%;
  background: #40444b;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.search-input::placeholder { color: #72767d; }
.search-input:focus { box-shadow: 0 0 0 2px #5865f2; }

/* 리스트 */
.page-list-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 4px 0 8px;
  max-height: 280px;
}
.page-list-wrap::-webkit-scrollbar { width: 4px; }
.page-list-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

.list-state {
  padding: 20px;
  text-align: center;
  color: #72767d;
  font-size: 13px;
  line-height: 1.6;
}

.page-list { list-style: none; padding: 0 8px; margin: 0; }

.page-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s;
  color: #b9bbbe;
}
.page-item:hover    { background: #36393f; color: white; }
.page-item.selected { background: #404249; color: white; }

.page-icon  { font-size: 16px; flex-shrink: 0; }
.page-title { flex: 1; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.check      { color: #3ba55c; font-weight: 700; font-size: 14px; flex-shrink: 0; }

/* depth 들여쓰기 (computed style 대신 CSS로) */
/* depth는 _depth 프로퍼티로 전달받아 style binding으로 처리할 수도 있음 */

/* 푸터 */
.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #202225;
}
.btn-cancel {
  background: none;
  border: 1px solid #4f545c;
  color: #dcddde;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}
.btn-cancel:hover { background: #36393f; }
.btn-save {
  background: #5865f2;
  border: none;
  color: white;
  border-radius: 4px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s;
}
.btn-save:hover:not(:disabled) { background: #4752c4; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* 토스트 */
.toast {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}
.toast.success { background: #3ba55c; color: white; }
.toast.warn    { background: #f0b132; color: #111; }
.toast.error   { background: #ed4245; color: white; }

.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(6px); }
</style>