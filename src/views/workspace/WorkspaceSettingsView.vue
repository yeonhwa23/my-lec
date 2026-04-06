<template>
  <div class="settings-container">
    <div class="settings-header">
      <button class="btn-back" @click="goBack">
        <i class="bi bi-arrow-left"></i> 돌아가기
      </button>
      <h1>워크스페이스 설정</h1>
    </div>

    <div class="settings-body" v-if="workspaceStore.currentWorkspace">
      <!-- 배너 -->
      <section class="settings-section">
        <h2 class="section-title">배너 이미지</h2>
        <div class="banner-preview" @click="triggerBannerInput">
          <img v-if="bannerPreviewUrl" :src="bannerPreviewUrl" class="banner-img" @error="handleImageError" />
          <div v-else class="banner-placeholder">
            <i class="bi bi-image"></i>
            <span>클릭하여 배너 업로드 (권장: 16:9 비율)</span>
          </div>
          <div class="img-overlay"><i class="bi bi-camera-fill"></i> 변경</div>
          <button v-if="bannerPreviewUrl" type="button" class="btn-remove-img" @click.stop="removeBanner">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <input type="file" ref="bannerInput" class="hidden-input" accept="image/*" @change="onBannerChange" />
      </section>

      <!-- 아이콘 + 이름 -->
      <section class="settings-section">
        <h2 class="section-title">아이콘 & 이름</h2>
        <div class="icon-name-row">
          <div class="icon-preview-wrap">
            <div class="icon-preview" @click="toggleEmojiPicker">
              <img v-if="iconPreviewUrl" :src="iconPreviewUrl" class="icon-img" />
              <span v-else-if="selectedEmoji" class="icon-emoji">{{ selectedEmoji }}</span>
              <span v-else class="icon-text">{{ form.wsName.substring(0, 2).toUpperCase() || 'WS' }}</span>
              <div class="img-overlay"><i class="bi bi-pencil-fill"></i></div>
            </div>
            <button v-if="iconPreviewUrl || selectedEmoji" type="button" class="btn-remove-icon" @click="removeIcon">✕</button>
          </div>
          <div class="name-group">
            <label class="field-label">워크스페이스 이름 <span class="req">*</span></label>
            <input v-model="form.wsName" class="field-input" type="text" placeholder="예) Weave 개발팀" />
            <label class="field-label mt-2">초대 링크 (슬러그)</label>
            <input :value="form.slug" class="field-input field-input--readonly" readonly />
          </div>
        </div>
        <input type="file" ref="iconInput" class="hidden-input" accept="image/*" @change="onIconChange" />

        <!-- 이모지 피커 -->
        <div v-if="showIconOptions" class="emoji-picker-wrap">
          <div class="emoji-header">
            <div class="emoji-tabs">
              <button type="button" @click="emojiTab='smile'" :class="{ active: emojiTab==='smile' }">😀</button>
              <button type="button" @click="emojiTab='nature'" :class="{ active: emojiTab==='nature' }">🌳</button>
              <button type="button" @click="emojiTab='food'" :class="{ active: emojiTab==='food' }">🍔</button>
              <button type="button" @click="emojiTab='activity'" :class="{ active: emojiTab==='activity' }">⚽️</button>
              <button type="button" @click="emojiTab='objects'" :class="{ active: emojiTab==='objects' }">💡</button>
            </div>
            <button type="button" class="btn-upload-img" @click="triggerIconInput">
              <i class="bi bi-upload"></i> 이미지 업로드
            </button>
          </div>
          <div class="emoji-grid-scroll">
            <div class="emoji-grid">
              <button type="button" v-for="emoji in currentEmojiList" :key="emoji"
                class="emoji-btn" :class="{ active: selectedEmoji === emoji }"
                @click="selectEmoji(emoji)">{{ emoji }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 설명 -->
      <section class="settings-section">
        <h2 class="section-title">워크스페이스 설명</h2>
        <textarea v-model="form.description" class="field-input field-textarea"
          placeholder="워크스페이스에 대한 간단한 소개를 적어주세요."></textarea>
      </section>

      <p v-if="errorMsg" class="err">{{ errorMsg }}</p>

      <div class="settings-footer">
        <button class="btn-cancel" @click="goBack">취소</button>
        <button class="btn-save" :disabled="submitting" @click="submit">
          {{ submitting ? '저장 중...' : '변경사항 저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import http from '@/util/http'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const API_BASE_URL = 'http://localhost:9090'

const ws = computed(() => workspaceStore.currentWorkspace)

const form = ref({ wsName: '', slug: '', description: '' })
const errorMsg = ref('')
const submitting = ref(false)

const iconInput = ref(null)
const bannerInput = ref(null)
const iconFile = ref(null)
const bannerFile = ref(null)
const isIconRemoved = ref(false)
const isBannerRemoved = ref(false)

const isEmoji = (str) => str && !str.startsWith('/') && !str.startsWith('http') && !str.startsWith('blob:')
const getFullUrl = (url) => {
  if (!url || isEmoji(url)) return ''
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  return API_BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

const iconPreviewUrl = ref('')
const selectedEmoji = ref('')
const bannerPreviewUrl = ref('')
const showIconOptions = ref(false)
const emojiTab = ref('smile')

onMounted(() => {
  if (!ws.value) return
  form.value.wsName = ws.value.wsName || ''
  form.value.slug = ws.value.slug || ''
  form.value.description = ws.value.description || ''
  const rawIcon = ws.value.iconUrl || ''
  iconPreviewUrl.value = isEmoji(rawIcon) ? '' : getFullUrl(rawIcon)
  selectedEmoji.value = isEmoji(rawIcon) ? rawIcon : ''
  bannerPreviewUrl.value = getFullUrl(ws.value.bannerUrl)
})

const emojis = { smile: ['😀','😃','😄','😁','😆','🙂','😉','😊','🥰','😍'], nature: ['🌳','🌲','🌴','🌵','🌿','🍀','🌸','🌺','🌻','🌼'], food: ['🍎','🍊','🍋','🍇','🍓','🍔','🍕','🍣','☕️','🍺'], activity: ['⚽️','🏀','🎾','🏆','🎮','🎯','🎲','🏋️','🚴','🎨'], objects: ['💡','🔑','💻','📱','🔧','📝','📊','🔍','💎','🚀'] }
const currentEmojiList = computed(() => emojis[emojiTab.value])
const toggleEmojiPicker = () => { showIconOptions.value = !showIconOptions.value }
const selectEmoji = (emoji) => { selectedEmoji.value = emoji; iconPreviewUrl.value = ''; iconFile.value = null; showIconOptions.value = false }
const triggerIconInput = () => { iconInput.value.click(); showIconOptions.value = false }
const triggerBannerInput = () => bannerInput.value.click()
const onIconChange = (e) => { const f = e.target.files[0]; if (f) { iconFile.value = f; iconPreviewUrl.value = URL.createObjectURL(f); selectedEmoji.value = ''; isIconRemoved.value = false } }
const onBannerChange = (e) => { const f = e.target.files[0]; if (f) { bannerFile.value = f; bannerPreviewUrl.value = URL.createObjectURL(f); isBannerRemoved.value = false } }
const removeIcon = () => { iconPreviewUrl.value = ''; selectedEmoji.value = ''; iconFile.value = null; isIconRemoved.value = true }
const removeBanner = () => { bannerPreviewUrl.value = ''; bannerFile.value = null; isBannerRemoved.value = true }
const handleImageError = (e) => { e.target.style.display = 'none' }

const goBack = () => router.push({ name: 'workspace', params: { slug: route.params.slug } })

const submit = async () => {
  errorMsg.value = ''
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('workspaceId', ws.value.workspaceId)
    formData.append('wsName', form.value.wsName.trim())
    formData.append('description', form.value.description?.trim() || '')
    if (iconFile.value instanceof File) formData.append('iconFile', iconFile.value)
    else if (selectedEmoji.value) formData.append('iconString', selectedEmoji.value)
    else if (isIconRemoved.value) formData.append('iconString', '')
    if (bannerFile.value instanceof File) formData.append('bannerFile', bannerFile.value)
    else if (isBannerRemoved.value) formData.append('removeBanner', 'true')

    await http.put('/workspaces/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    await workspaceStore.fetchMyWorkspaces()
    await workspaceStore.setCurrentWorkspace(workspaceStore.workspaceList.find(w => w.workspaceId === ws.value.workspaceId))
    goBack()
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? '수정에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.settings-container { max-width: 720px; margin: 0 auto; padding: 40px 32px; color: #F0EFF8; }
.settings-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.btn-back { background: rgba(255,255,255,0.06); border: 1px solid rgba(180,160,255,0.15); color: #a78bfa; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-back:hover { background: rgba(255,255,255,0.1); }
.settings-header h1 { font-size: 22px; font-weight: 700; margin: 0; }
.settings-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(180,160,255,0.1); border-radius: 14px; padding: 24px; margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 700; color: rgba(220,218,240,0.7); margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px; }

/* 배너 */
.banner-preview { position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.05); border: 1px dashed rgba(180,160,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.banner-preview:hover .img-overlay { opacity: 1; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-placeholder { color: rgba(220,218,240,0.3); display: flex; flex-direction: column; align-items: center; font-size: 13px; gap: 8px; }
.banner-placeholder i { font-size: 28px; }
.btn-remove-img { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-remove-img:hover { background: #F87171; }

/* 아이콘+이름 */
.icon-name-row { display: flex; gap: 20px; align-items: flex-start; }
.icon-preview-wrap { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
.icon-preview { width: 100%; height: 100%; border-radius: 18px; background: #2a2845; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; }
.icon-preview:hover .img-overlay { opacity: 1; }
.icon-img { width: 100%; height: 100%; object-fit: cover; }
.icon-emoji { font-size: 52px; }
.icon-text { color: #E0DEFF; font-size: 22px; font-weight: 900; letter-spacing: 1px; }
.btn-remove-icon { position: absolute; top: -6px; right: -6px; background: #36393f; border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; }
.btn-remove-icon:hover { background: #F87171; }
.name-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: 12px; font-weight: 600; color: rgba(220,218,240,0.6); }
.field-label.mt-2 { margin-top: 8px; }
.req { color: #F87171; }
.field-input { padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(180,160,255,0.15); border-radius: 10px; font-size: 14px; color: #F0EFF8; outline: none; width: 100%; box-sizing: border-box; font-family: inherit; }
.field-input:focus { border-color: #8889C4; }
.field-input--readonly { background: rgba(255,255,255,0.02); color: #a78bfa; cursor: not-allowed; }
.field-textarea { resize: none; height: 100px; }

/* 이모지 피커 */
.emoji-picker-wrap { background: #2e2d3d; border: 1px solid rgba(180,160,255,0.2); border-radius: 10px; padding: 12px; margin-top: 16px; }
.emoji-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.emoji-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 8px; }
.emoji-tabs button { background: transparent; border: none; font-size: 16px; padding: 4px 8px; border-radius: 6px; cursor: pointer; opacity: 0.5; }
.emoji-tabs button.active { opacity: 1; background: rgba(180,160,255,0.2); }
.btn-upload-img { background: rgba(180,160,255,0.15); border: none; color: #DDD6FE; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
.emoji-grid-scroll { max-height: 160px; overflow-y: auto; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-btn { background: rgba(255,255,255,0.1); border: 1px solid transparent; font-size: 22px; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.emoji-btn.active { background: rgba(180,160,255,0.2); border-color: rgba(180,160,255,0.5); }
.hidden-input { display: none; }
.img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 13px; gap: 5px; }

.err { color: #F87171; font-size: 13px; margin: 0; }
.settings-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.btn-cancel { background: rgba(255,255,255,0.06); border: 1px solid rgba(180,160,255,0.12); color: rgba(220,218,240,0.5); padding: 10px 22px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-save { background: linear-gradient(135deg, #8889C4, #6667AB); color: #fff; border: none; padding: 10px 22px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>