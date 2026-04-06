<template>
  <div class="chat-container">
    <!-- ── 헤더 ── -->
    <header class="chat-header">
      <span class="hash">#</span>
      <h3 class="channel-name">{{ currentChannel?.chName || route.params.channelId }}</h3>
      <span v-if="!isConnected" class="conn-badge">연결 중...</span>
    </header>

    <!-- ── 메시지 목록 ── -->
    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="empty-message">
        아직 메시지가 없습니다. 첫인사를 남겨보세요! 👋
      </div>

      <div
        v-for="(msg, idx) in messages"
        :key="msg.messageId || idx"
        class="message-item"
        :class="{ 'my-message': msg.memberId === currentMemberId }"
        @mouseenter="hoveredIdx = idx"
        @mouseleave="hoveredIdx = null"
      >
        <!-- 아바타 (상대방) -->
        <div class="user-avatar" v-if="msg.memberId !== currentMemberId">
          {{ msg.senderName ? msg.senderName[0] : '?' }}
        </div>

        <div class="message-content">
          <div class="message-info">
            <span class="user-name">{{ msg.memberId === currentMemberId ? '나' : (msg.senderName || '?') }}</span>
            <span class="timestamp">{{ formatTime(msg.sendTime || msg.createdAt) }}</span>
          </div>

          <div class="bubble-wrap">
            <div class="text-bubble">
              <!-- 텍스트 내용 -->
              <span v-if="msg.content">{{ msg.content }}</span>

              <!-- 이미지 첨부 -->
              <div v-if="msg.imageUrl" class="attachment-image-wrap">
                <img :src="msg.imageUrl" class="attachment-image" @click="openImageViewer(msg.imageUrl)" />
              </div>

              <!-- 파일 첨부 -->
              <a v-if="msg.fileUrl && !msg.imageUrl" :href="msg.fileUrl" target="_blank" class="attachment-file">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ msg.fileName || '첨부파일' }}</span>
              </a>

              <!-- 이모지 반응 -->
              <div v-if="msg.reactions && msg.reactions.length" class="reactions">
                <button
                  v-for="r in msg.reactions"
                  :key="r.emoji"
                  class="reaction-badge"
                  :class="{ 'reacted': r.memberIds?.includes(currentMemberId) }"
                  @click="toggleReaction(msg, r.emoji)"
                >
                  {{ r.emoji }} {{ r.count }}
                </button>
              </div>
            </div>

            <!-- 액션 버튼 -->
            <div v-if="hoveredIdx === idx" class="msg-actions">
              <!-- 이모지 반응 -->
              <button class="msg-action-btn" title="이모지 반응" @click.stop="openReactionPicker(idx)">😊</button>
              <!-- 북마크 (messageId 있으면 항상 가능) -->
              <button class="msg-action-btn" title="페이지에 저장" @click="openBookmark(msg)">📌</button>
            </div>
          </div>

          <!-- 이모지 피커 (해당 메시지) -->
          <div v-if="reactionPickerIdx === idx" class="emoji-picker" @click.stop>
            <button
              v-for="e in QUICK_EMOJIS"
              :key="e"
              class="emoji-btn"
              @click="addReaction(msg, e)"
            >{{ e }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 첨부 미리보기 ── -->
    <div v-if="attachments.length" class="attachment-preview-bar">
      <div v-for="(att, i) in attachments" :key="i" class="preview-item">
        <img v-if="att.isImage" :src="att.previewUrl" class="preview-thumb" />
        <span v-else class="preview-file">📎 {{ att.file.name }}</span>
        <button class="preview-remove" @click="removeAttachment(i)">✕</button>
      </div>
    </div>

    <!-- ── 입력창 ── -->
    <div class="chat-input-area">
      <!-- 파일 첨부 버튼 -->
      <button class="input-icon-btn" title="파일 첨부" @click="fileInputRef.click()">＋</button>
      <input ref="fileInputRef" type="file" multiple accept="image/*,*" style="display:none" @change="onFileSelect" />

      <!-- 이모지 피커 토글 -->
      <button class="input-icon-btn" title="이모지" @click.stop="showEmojiPicker = !showEmojiPicker">😊</button>

      <!-- 이모지 피커 팝업 -->
      <div v-if="showEmojiPicker" class="emoji-picker emoji-picker--input" @click.stop>
        <div class="emoji-picker-grid">
          <button v-for="e in ALL_EMOJIS" :key="e" class="emoji-btn" @click="insertEmoji(e)">{{ e }}</button>
        </div>
      </div>

      <textarea
        ref="inputRef"
        v-model="newMessage"
        class="chat-textarea"
        placeholder="메시지를 입력하세요... (Enter 전송 / Shift+Enter 줄바꿈)"
        rows="1"
        :disabled="!isConnected"
        @keydown.enter.exact.prevent="sendMessage"
        @keydown.shift.enter="onShiftEnter"
        @input="autoResize"
      ></textarea>

      <button class="send-btn" @click="sendMessage" :disabled="(!newMessage.trim() && !attachments.length) || !isConnected">
        전송
      </button>
    </div>

    <!-- ── 이미지 전체보기 ── -->
    <div v-if="imageViewer" class="image-viewer-overlay" @click="imageViewer = null">
      <img :src="imageViewer" class="image-viewer-img" @click.stop />
      <button class="image-viewer-close" @click="imageViewer = null">✕</button>
    </div>

    <!-- ── 북마크 모달 ── -->
    <BookmarkToPageModal
      v-if="bookmarkModal.visible"
      :message-id="bookmarkModal.messageId"
      :message-content="bookmarkModal.content"
      :workspace-id="currentWorkspaceId"
      @close="bookmarkModal.visible = false"
      @saved="onBookmarkSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { Client } from '@stomp/stompjs'
import http from '@/util/http'
import BookmarkToPageModal from '@/components/workspace/BookmarkToPageModal.vue'

// ──────────────────────────────────────────
//  이모지 목록
// ──────────────────────────────────────────
const QUICK_EMOJIS = ['👍','❤️','😂','😮','😢','🔥','🎉','👏','🤔','💯']
const ALL_EMOJIS   = [
  '😀','😂','😍','🥰','😎','😭','😡','🤔','🥳','😴',
  '👍','👎','👏','🙏','✌️','🤞','💪','🖐️','👋','🤝',
  '❤️','🔥','💯','⭐','🎉','✅','❌','💡','📌','🚀',
  '🐶','🐱','🦊','🐻','🐼','🐸','🐧','🦁','🐯','🐮',
  '🍕','🍔','🍣','🍜','🍦','🎂','🍩','🍺','☕','🧋',
]

// ──────────────────────────────────────────
//  상태
// ──────────────────────────────────────────
const route          = useRoute()
const authStore      = useAuthStore()
const workspaceStore = useWorkspaceStore()

const newMessage      = ref('')
const messages        = ref([])
const messageListRef  = ref(null)
const inputRef        = ref(null)
const fileInputRef    = ref(null)
const stompClient     = ref(null)
const isConnected     = ref(false)
const currentChannel  = ref(null)
const hoveredIdx      = ref(null)
const showEmojiPicker = ref(false)
const reactionPickerIdx = ref(null)
const attachments     = ref([])   // { file, isImage, previewUrl }
const imageViewer     = ref(null)

const bookmarkModal = ref({ visible: false, messageId: null, content: '' })

const currentMemberId    = computed(() => authStore.auth?.member_id || -1)
const currentName        = computed(() => authStore.auth?.username || authStore.auth?.name || '익명')
const currentWorkspaceId = computed(() =>
  workspaceStore.currentWorkspace?.workspace_id ?? workspaceStore.currentWorkspace?.workspaceId
)

// ──────────────────────────────────────────
//  스크롤
// ──────────────────────────────────────────
const scrollToBottom = async () => {
  await nextTick()
  const el = messageListRef.value
  if (el) el.scrollTop = el.scrollHeight
}

// ──────────────────────────────────────────
//  채널 정보 / 히스토리
// ──────────────────────────────────────────
const fetchChannelInfo = async () => {
  if (!currentWorkspaceId.value) return
  try {
    const channels = await http.get(`/workspaces/${currentWorkspaceId.value}/channels`)
    if (Array.isArray(channels)) {
      currentChannel.value = channels.find(
        ch => String(ch.channelId) === String(route.params.channelId)
      ) || null
    }
  } catch (e) { console.error('채널 정보 오류:', e) }
}

const fetchHistory = async () => {
  try {
    const data = await http.get(`/workspaces/channel/${route.params.channelId}/messages`)
    messages.value = (Array.isArray(data) ? data : []).map(normalizeMsg)
    await scrollToBottom()
  } catch (e) { console.error('채팅 기록 오류:', e) }
}

// 메시지 객체 정규화 (reactions 초기화 등)
const normalizeMsg = (msg) => ({
  ...msg,
  reactions: msg.reactions || [],
})

// ──────────────────────────────────────────
//  STOMP 연결
// ──────────────────────────────────────────
const connect = () => {
  const token = authStore.auth?.token
  if (!token) return
  const channelId = route.params.channelId
  stompClient.value = new Client({
    brokerURL: 'ws://localhost:9090/ws-chat',
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => {
      isConnected.value = true
      stompClient.value.subscribe(`/topic/channel/${channelId}`, (msg) => {
        messages.value.push(normalizeMsg(JSON.parse(msg.body)))
        scrollToBottom()
      })
    },
    onDisconnect: () => { isConnected.value = false }
  })
  stompClient.value.activate()
}

// ──────────────────────────────────────────
//  메시지 전송
// ──────────────────────────────────────────
const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text && !attachments.value.length) return
  if (!isConnected.value) return

  // 파일 첨부가 있으면 먼저 업로드
  let fileUrl = null, fileName = null, imageUrl = null
  if (attachments.value.length) {
    try {
      const form = new FormData()
      attachments.value.forEach(att => form.append('files', att.file))
      // 서버 파일 업로드 엔드포인트 — 백엔드에 맞게 수정 필요
      const res = await http.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      // 서버가 { urls: [...] } 형식으로 반환한다고 가정
      const urls = res.urls || []
      if (attachments.value[0]?.isImage) imageUrl = urls[0]
      else { fileUrl = urls[0]; fileName = attachments.value[0]?.file.name }
    } catch (e) {
      console.error('파일 업로드 오류:', e)
      return
    }
  }

  stompClient.value.publish({
    destination: `/app/chat/${route.params.channelId}`,
    body: JSON.stringify({
      memberId:   currentMemberId.value,
      senderName: currentName.value,
      content:    text,
      imageUrl,
      fileUrl,
      fileName,
    })
  })

  newMessage.value = ''
  attachments.value = []
  if (inputRef.value) { inputRef.value.style.height = 'auto' }
  showEmojiPicker.value = false
}

// ──────────────────────────────────────────
//  입력창 자동 리사이즈
// ──────────────────────────────────────────
const autoResize = () => {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

const onShiftEnter = () => {
  // 기본 줄바꿈 허용
  nextTick(autoResize)
}

// ──────────────────────────────────────────
//  파일 첨부
// ──────────────────────────────────────────
const onFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : null
    attachments.value.push({ file, isImage, previewUrl })
  })
  e.target.value = ''
}

const removeAttachment = (i) => {
  const att = attachments.value[i]
  if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
  attachments.value.splice(i, 1)
}

// ──────────────────────────────────────────
//  이모지 삽입 (입력창)
// ──────────────────────────────────────────
const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
  nextTick(() => inputRef.value?.focus())
}

// ──────────────────────────────────────────
//  이모지 반응
// ──────────────────────────────────────────
const openReactionPicker = (idx) => {
  reactionPickerIdx.value = reactionPickerIdx.value === idx ? null : idx
}

const addReaction = (msg, emoji) => {
  reactionPickerIdx.value = null
  if (!msg.reactions) msg.reactions = []
  const existing = msg.reactions.find(r => r.emoji === emoji)
  if (existing) {
    if (existing.memberIds?.includes(currentMemberId.value)) return
    existing.count++
    existing.memberIds = [...(existing.memberIds || []), currentMemberId.value]
  } else {
    msg.reactions.push({ emoji, count: 1, memberIds: [currentMemberId.value] })
  }
  // TODO: 서버에 반응 저장 API 호출
  // http.post(`/messages/${msg.messageId}/reactions`, { emoji })
}

const toggleReaction = (msg, emoji) => {
  const r = msg.reactions?.find(x => x.emoji === emoji)
  if (!r) return
  const meIdx = r.memberIds?.indexOf(currentMemberId.value)
  if (meIdx >= 0) {
    r.count--; r.memberIds.splice(meIdx, 1)
    if (r.count <= 0) msg.reactions.splice(msg.reactions.indexOf(r), 1)
  } else {
    r.count++; r.memberIds.push(currentMemberId.value)
  }
}

// ──────────────────────────────────────────
//  이미지 전체보기
// ──────────────────────────────────────────
const openImageViewer = (url) => { imageViewer.value = url }

// ──────────────────────────────────────────
//  북마크
// ──────────────────────────────────────────
const openBookmark = (msg) => {
  // messageId가 없는 실시간 메시지는 안내 표시
  if (!msg.messageId) {
    alert('방금 전송된 메시지는 잠시 후 새로고침하면 북마크할 수 있습니다.\n(메시지 ID가 아직 없습니다)')
    return
  }
  bookmarkModal.value = { visible: true, messageId: msg.messageId, content: msg.content }
}

const onBookmarkSaved = ({ page }) => {
  console.log(`"${page?.title}"에 저장됨`)
}

// ──────────────────────────────────────────
//  외부 클릭 시 피커 닫기
// ──────────────────────────────────────────
const onDocClick = () => {
  showEmojiPicker.value = false
  reactionPickerIdx.value = null
}

// ──────────────────────────────────────────
//  포맷
// ──────────────────────────────────────────
const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// ──────────────────────────────────────────
//  라이프사이클
// ──────────────────────────────────────────
const init = async () => {
  await fetchChannelInfo()
  await fetchHistory()
  connect()
}

onMounted(() => {
  init()
  document.addEventListener('click', onDocClick)
})

watch(() => route.params.channelId, async (id) => {
  if (!id) return
  if (stompClient.value) stompClient.value.deactivate()
  isConnected.value = false
  messages.value = []
  attachments.value = []
  await init()
})

onUnmounted(() => {
  if (stompClient.value) stompClient.value.deactivate()
  document.removeEventListener('click', onDocClick)
  attachments.value.forEach(att => { if (att.previewUrl) URL.revokeObjectURL(att.previewUrl) })
})
</script>

<style scoped>
/* ── 전체 레이아웃 ── */
.chat-container {
  display: flex; flex-direction: column;
  height: 100%; background: #36393f; overflow: hidden;
  position: relative;
}

/* ── 헤더 ── */
.chat-header {
  flex-shrink: 0; height: 60px; padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  display: flex; align-items: center; gap: 8px; background: #36393f;
}
.hash         { font-size: 22px; color: #8e9297; font-weight: 300; }
.channel-name { margin: 0; font-size: 16px; font-weight: 800; color: #fff; flex: 1; }
.conn-badge   { font-size: 11px; color: #f0b132; background: rgba(240,177,50,.1); padding: 2px 8px; border-radius: 99px; }

/* ── 메시지 목록 ── */
.message-list {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 24px; display: flex; flex-direction: column; gap: 4px;
}
.message-list::-webkit-scrollbar { width: 6px; }
.message-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 99px; }
.empty-message { text-align: center; color: #72767d; margin-top: 50px; font-size: 15px; }

/* ── 메시지 아이템 ── */
.message-item { display: flex; gap: 14px; margin-bottom: 16px; flex-shrink: 0; position: relative; }
.user-avatar {
  width: 42px; height: 42px; background: #5865f2; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; color: white; font-size: 16px; flex-shrink: 0;
}
.message-content { display: flex; flex-direction: column; max-width: 70%; }
.message-info    { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.user-name  { font-weight: 700; color: #fff; font-size: 14px; }
.timestamp  { font-size: 11px; color: #8e9297; }

/* ── 버블 ── */
.bubble-wrap { display: flex; align-items: flex-start; gap: 6px; }
.text-bubble {
  background: #2b2d31; padding: 10px 14px;
  border-radius: 0 10px 10px 10px;
  color: #dbdee1; font-size: 15px; line-height: 1.55;
  word-break: break-word; max-width: 100%;
}
.message-item.my-message                  { flex-direction: row-reverse; }
.message-item.my-message .message-content { align-items: flex-end; }
.message-item.my-message .message-info    { flex-direction: row-reverse; }
.message-item.my-message .bubble-wrap     { flex-direction: row-reverse; }
.message-item.my-message .text-bubble     { background: #5865f2; color: white; border-radius: 10px 0 10px 10px; }

/* ── 첨부 이미지 ── */
.attachment-image-wrap { margin-top: 8px; }
.attachment-image {
  max-width: 280px; max-height: 220px; border-radius: 8px;
  cursor: pointer; object-fit: cover; display: block;
  transition: opacity .15s;
}
.attachment-image:hover { opacity: .9; }

/* ── 첨부 파일 ── */
.attachment-file {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 8px;
  background: rgba(255,255,255,.08); border-radius: 8px; padding: 8px 12px;
  color: #dbdee1; text-decoration: none; font-size: 13px;
  transition: background .15s;
}
.attachment-file:hover { background: rgba(255,255,255,.14); }
.file-icon { font-size: 18px; }
.file-name { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── 이모지 반응 ── */
.reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.reaction-badge {
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px; padding: 2px 8px; font-size: 13px; cursor: pointer;
  color: #dbdee1; transition: background .12s;
}
.reaction-badge:hover  { background: rgba(255,255,255,.16); }
.reaction-badge.reacted { background: rgba(88,101,242,.3); border-color: #5865f2; color: #fff; }

/* ── 메시지 액션 ── */
.msg-actions {
  display: flex; align-items: center;
  background: #2b2d31; border: 1px solid #1e1f22;
  border-radius: 6px; padding: 2px 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,.35);
  flex-shrink: 0; align-self: flex-start;
}
.msg-action-btn {
  background: none; border: none; cursor: pointer;
  font-size: 16px; padding: 4px 7px; border-radius: 4px; line-height: 1;
  transition: background .1s;
}
.msg-action-btn:hover { background: #404249; }

/* ── 이모지 피커 (반응용) ── */
.emoji-picker {
  display: flex; flex-wrap: wrap; gap: 4px;
  background: #2b2d31; border: 1px solid #1e1f22;
  border-radius: 10px; padding: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.5);
  margin-top: 6px; max-width: 260px; z-index: 100;
}
.emoji-picker--input {
  position: absolute; bottom: 100%; left: 48px; margin-bottom: 8px;
  max-width: 320px; z-index: 200;
}
.emoji-picker-grid {
  display: flex; flex-wrap: wrap; gap: 2px; max-height: 200px; overflow-y: auto;
}
.emoji-btn {
  background: none; border: none; cursor: pointer; font-size: 20px;
  padding: 4px; border-radius: 6px; line-height: 1;
  transition: background .1s;
}
.emoji-btn:hover { background: rgba(255,255,255,.1); }

/* ── 첨부 미리보기 바 ── */
.attachment-preview-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 8px 16px; background: #2f3136; border-top: 1px solid rgba(255,255,255,.06);
}
.preview-item { position: relative; }
.preview-thumb {
  width: 64px; height: 64px; object-fit: cover; border-radius: 6px;
  border: 2px solid #5865f2;
}
.preview-file {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.08); border-radius: 6px; padding: 8px 10px;
  color: #dbdee1; font-size: 12px;
}
.preview-remove {
  position: absolute; top: -6px; right: -6px;
  width: 18px; height: 18px; background: #ed4245; border: none;
  border-radius: 50%; color: white; font-size: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  line-height: 1;
}

/* ── 입력창 ── */
.chat-input-area {
  flex-shrink: 0; margin: 0 16px 16px;
  padding: 8px 12px; display: flex; align-items: flex-end; gap: 8px;
  background: #40444b; border-radius: 10px; position: relative;
}
.input-icon-btn {
  background: none; border: none; cursor: pointer; color: #8e9297;
  font-size: 22px; padding: 4px; border-radius: 4px; flex-shrink: 0;
  line-height: 1; transition: color .12s;
}
.input-icon-btn:hover { color: #dbdee1; }

.chat-textarea {
  flex: 1; background: transparent; border: none;
  padding: 8px 0; color: white; outline: none; font-size: 15px;
  resize: none; line-height: 1.5; max-height: 160px; overflow-y: auto;
  font-family: inherit;
}
.chat-textarea::placeholder { color: #8e9297; }
.chat-textarea:disabled { opacity: .5; }

.send-btn {
  background: #5865f2; color: white; border: none;
  padding: 0 18px; border-radius: 6px; cursor: pointer;
  font-weight: 700; height: 36px; flex-shrink: 0;
  align-self: flex-end; transition: background .12s;
}
.send-btn:hover:not(:disabled) { background: #4752c4; }
.send-btn:disabled { background: #4f545c; color: #8e9297; cursor: not-allowed; }

/* ── 이미지 전체보기 ── */
.image-viewer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.85);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.image-viewer-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
.image-viewer-close {
  position: absolute; top: 20px; right: 24px;
  background: rgba(255,255,255,.15); border: none; color: white;
  font-size: 20px; width: 40px; height: 40px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.image-viewer-close:hover { background: rgba(255,255,255,.25); }
</style>