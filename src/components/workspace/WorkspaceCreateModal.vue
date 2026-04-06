<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <header class="modal-hd">
          <h2 class="modal-title">새 워크스페이스 만들기</h2>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">

          <!-- 배너 -->
          <div class="fg banner-group">
            <label class="fl">배너 이미지 <span class="fh">선택 · 권장 16:9</span></label>
            <div class="banner-preview" @click="triggerBannerInput">
              <img v-if="bannerPreviewUrl" :src="bannerPreviewUrl" class="banner-img" />
              <div v-else class="banner-placeholder">
                <i class="bi bi-image"></i>
                <span>클릭하여 업로드</span>
              </div>
              <div class="img-overlay"><i class="bi bi-camera-fill"></i> 변경</div>
              <button v-if="bannerPreviewUrl" type="button" class="btn-remove-img" @click.stop="removeBanner">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <input type="file" ref="bannerInput" class="hidden-input" accept="image/*" @change="onBannerChange" />
          </div>

          <!-- 아이콘 + 이름 -->
          <div class="fg-row">
            <div class="icon-group">
              <label class="fl">아이콘</label>
              <div class="icon-preview-wrap">
                <div class="icon-preview bright-bg" @click="toggleEmojiPicker">
                  <img v-if="iconPreviewUrl" :src="iconPreviewUrl" class="icon-img" />
                  <span v-else-if="selectedEmoji" class="icon-placeholder emoji-mode">{{ selectedEmoji }}</span>
                  <span v-else class="icon-placeholder">{{ form.wsName.charAt(0).toUpperCase() || 'W' }}</span>
                  <div class="img-overlay"><i class="bi bi-pencil-fill"></i></div>
                </div>
                <button v-if="iconPreviewUrl || selectedEmoji" type="button" class="btn-remove-icon" @click="removeIcon">✕</button>
              </div>
              <input type="file" ref="iconInput" class="hidden-input" accept="image/*" @change="onIconChange" />
            </div>

            <div class="fg" style="flex:1;">
              <label class="fl">워크스페이스 이름 <span class="req">*</span></label>
              <input v-model="form.wsName" class="fi" type="text" placeholder="예) Weave 개발팀" maxlength="100" />

              <label class="fl mt-3">
                초대 링크 (슬러그) <span class="fh">자동 생성</span>
              </label>
              <div class="slug-wrap">
                <input v-model="form.slug" class="fi fi--readonly" type="text" readonly />
                <span class="sbadge sbadge--ok">✓ 안전</span>
              </div>
            </div>
          </div>

          <!-- 이모지 피커 -->
          <div v-if="showIconOptions" class="emoji-picker-wrap">
            <div class="emoji-header">
              <div class="emoji-tabs">
                <button type="button" @click="emojiTab='smile'"    :class="{ active: emojiTab==='smile' }">😀</button>
                <button type="button" @click="emojiTab='nature'"   :class="{ active: emojiTab==='nature' }">🌳</button>
                <button type="button" @click="emojiTab='food'"     :class="{ active: emojiTab==='food' }">🍔</button>
                <button type="button" @click="emojiTab='activity'" :class="{ active: emojiTab==='activity' }">⚽️</button>
                <button type="button" @click="emojiTab='objects'"  :class="{ active: emojiTab==='objects' }">💡</button>
              </div>
              <button type="button" class="btn-upload-img" @click="triggerIconInput">
                <i class="bi bi-upload"></i> 이미지 업로드
              </button>
            </div>
            <div class="emoji-grid-scroll">
              <div class="emoji-grid">
                <button
                  type="button"
                  v-for="emoji in currentEmojiList"
                  :key="emoji"
                  class="emoji-btn"
                  :class="{ active: selectedEmoji === emoji }"
                  @click="selectEmoji(emoji)"
                >{{ emoji }}</button>
              </div>
            </div>
          </div>

          <!-- 설명 -->
          <div class="fg mt-3">
            <label class="fl">워크스페이스 설명 <span class="fh">선택</span></label>
            <textarea
              v-model="form.description"
              class="fi textarea"
              placeholder="워크스페이스에 대한 간단한 소개를 적어주세요."
              maxlength="1000"
            ></textarea>
          </div>

          <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
        </div>

        <footer class="modal-ft">
          <button class="mbtn mbtn--cancel" @click="$emit('close')">취소</button>
          <button
            class="mbtn mbtn--primary"
            :disabled="!canSubmit || submitting"
            @click="submit"
          >
            {{ submitting ? '생성 중...' : '워크스페이스 만들기' }}
          </button>
        </footer>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import http from '@/util/http'

const emit = defineEmits(['close', 'created'])
const workspaceStore = useWorkspaceStore()

const form = ref({ wsName: '', slug: '', description: '' })
const errorMsg   = ref('')
const submitting = ref(false)

// 슬러그 자동 생성
const generateRandomSlug = () => {
  form.value.slug = 'ws-' + Math.random().toString(36).substring(2, 12)
}
onMounted(() => { generateRandomSlug() })

const canSubmit = computed(() => form.value.wsName.trim() !== '')

// ── 아이콘 ──
const iconInput      = ref(null)
const iconFile       = ref(null)
const iconPreviewUrl = ref('')
const selectedEmoji  = ref('')
const showIconOptions = ref(false)
const emojiTab       = ref('smile')

const rawEmojis = {
  smile:    ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  nature:   ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐴','🦄','🐝','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🐙','🦑','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🦏','🐪','🦒','🐃','🐂','🐄','🐎','🐖','🐑','🦙','🐕','🐩','🐈','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🍃','🍂','🍁','🍄','🌾','💐','🌷','🌹','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','💥','🔥','🌈','☀️','❄️','☃️','💧','💦','🌊'],
  food:     ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🥙','🌮','🌯','🥗','🥘','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍙','🍚','🍘','🍥','🥮','🍢','🍡','🍧','🍨','🍦','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','☕️','🍵','🧃','🥤','🧋','🍺','🍻','🥂','🍷','🍸','🍹','🍾'],
  activity: ['⚽️','🏀','🏈','⚾️','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🎽','🛹','⛸','🎿','🏋️','🤸','🏄','🏊','🚴','🏆','🥇','🥈','🥉','🏅','🎖','🎪','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩'],
  objects:  ['⌚️','📱','💻','⌨️','🖥','🖨','🖱','🕹','💽','💾','💿','📀','📷','📸','📹','🎥','📞','☎️','📺','📻','🧭','⏱','⏰','🔋','🔌','💡','🔦','🕯','🧯','💎','⚖️','🧰','🔧','🔨','🛠','🔩','⚙️','🧱','🧲','🔑','🗝','🚪','🧸','🖼','🎀','🎁','🎈','✉️','📧','💌','📦','📋','📁','📂','📊','📈','📉','📆','📅','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓']
}
const emojis = {
  smile:    [...new Set(rawEmojis.smile)],
  nature:   [...new Set(rawEmojis.nature)],
  food:     [...new Set(rawEmojis.food)],
  activity: [...new Set(rawEmojis.activity)],
  objects:  [...new Set(rawEmojis.objects)],
}
const currentEmojiList = computed(() => emojis[emojiTab.value])

const toggleEmojiPicker = () => { showIconOptions.value = !showIconOptions.value }
const selectEmoji = (emoji) => {
  selectedEmoji.value  = emoji
  iconPreviewUrl.value = ''
  iconFile.value       = null
  showIconOptions.value = false
}
const triggerIconInput = () => { iconInput.value.click(); showIconOptions.value = false }
const onIconChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    iconFile.value       = file
    iconPreviewUrl.value = URL.createObjectURL(file)
    selectedEmoji.value  = ''
  }
}
const removeIcon = () => {
  iconPreviewUrl.value = ''
  selectedEmoji.value  = ''
  iconFile.value       = null
}

// ── 배너 ──
const bannerInput      = ref(null)
const bannerFile       = ref(null)
const bannerPreviewUrl = ref('')

const triggerBannerInput = () => bannerInput.value.click()
const onBannerChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    bannerFile.value       = file
    bannerPreviewUrl.value = URL.createObjectURL(file)
  }
}
const removeBanner = () => {
  bannerPreviewUrl.value = ''
  bannerFile.value       = null
}

// ── 제출 ──
async function submit() {
  errorMsg.value   = ''
  submitting.value = true
  try {
    // 아이콘/배너 파일이 있으면 multipart, 없으면 JSON
    if (iconFile.value || bannerFile.value) {
      const formData = new FormData()
      formData.append('wsName',      form.value.wsName.trim())
      formData.append('slug',        form.value.slug)
      formData.append('description', form.value.description?.trim() || '')
      if (selectedEmoji.value)  formData.append('iconString', selectedEmoji.value)
      if (iconFile.value)       formData.append('iconFile',   iconFile.value)
      if (bannerFile.value)     formData.append('bannerFile', bannerFile.value)

      const newWs = await http.post('/workspaces', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await workspaceStore.fetchMyWorkspaces()
      emit('created', newWs)
    } else {
      const newWs = await workspaceStore.createWorkspace({
        wsName:      form.value.wsName.trim(),
        slug:        form.value.slug,
        description: form.value.description?.trim() || '',
        iconUrl:     selectedEmoji.value || null,
      })
      emit('created', newWs)
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? '워크스페이스 생성에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 99999; backdrop-filter: blur(6px);
}
.modal-box {
  background: #13122A;
  border: 1px solid rgba(180,160,255,0.18);
  border-radius: 20px;
  width: 500px; max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  overflow: hidden;
  animation: modalIn 0.22s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(-12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 26px 18px;
  border-bottom: 1px solid rgba(180,160,255,0.1);
}
.modal-title { font-size: 17px; font-weight: 700; color: #F0EFF8; margin: 0; }
.modal-close {
  background: none; border: none; font-size: 16px;
  color: rgba(220,218,240,0.38); cursor: pointer;
  width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.08); color: #F0EFF8; }

.modal-body {
  padding: 20px 26px;
  display: flex; flex-direction: column;
  max-height: 72vh; overflow-y: auto;
}
.modal-ft {
  padding: 18px 26px;
  border-top: 1px solid rgba(180,160,255,0.1);
  display: flex; justify-content: flex-end; gap: 10px;
}

.fg  { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.fg-row { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 12px; }
.fl  { font-size: 13px; font-weight: 600; color: rgba(220,218,240,0.7); }
.fh  { font-weight: 400; color: rgba(220,218,240,0.3); font-size: 11.5px; margin-left: 6px; }
.req { color: #F87171; }
.mt-3 { margin-top: 4px; }

.fi {
  padding: 11px 14px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(180,160,255,0.15);
  border-radius: 10px;
  font-size: 14px; color: #F0EFF8;
  outline: none; transition: border-color 0.2s;
  font-family: inherit; width: 100%; box-sizing: border-box;
}
.fi::placeholder { color: rgba(220,218,240,0.22); }
.fi:focus { border-color: #8889C4; background: rgba(255,255,255,0.07); }
.fi--readonly {
  background: rgba(255,255,255,0.02);
  color: #a78bfa; cursor: not-allowed;
  border-color: rgba(180,160,255,0.08);
}

.slug-wrap { position: relative; }
.sbadge { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11.5px; font-weight: 600; pointer-events: none; }
.sbadge--ok { color: #4ADE80; }

.textarea { resize: none; height: 72px; }
.hidden-input { display: none; }
.img-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 12px; gap: 4px;
}

/* 배너 */
.banner-preview {
  position: relative; width: 100%; height: 160px;
  border-radius: 10px; overflow: hidden;
  background: rgba(255,255,255,0.04);
  border: 1px dashed rgba(180,160,255,0.3);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.banner-preview:hover .img-overlay { opacity: 1; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-placeholder { color: rgba(220,218,240,0.3); display: flex; flex-direction: column; align-items: center; font-size: 12px; gap: 6px; }
.banner-placeholder i { font-size: 20px; }
.btn-remove-img {
  position: absolute; top: 7px; right: 7px; z-index: 10;
  background: rgba(0,0,0,0.6); color: #fff; border: none;
  width: 26px; height: 26px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-remove-img:hover { background: #F87171; }

/* 아이콘 */
.icon-group { display: flex; flex-direction: column; gap: 7px; }
.icon-preview-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
.icon-preview {
  width: 100%; height: 100%; border-radius: 14px;
  overflow: hidden; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.bright-bg { background: #2a2845; }
.icon-preview:hover .img-overlay { opacity: 1; }
.icon-img { width: 100%; height: 100%; object-fit: cover; }
.icon-placeholder { color: #E0DEFF; font-size: 30px; font-weight: 900; }
.emoji-mode { font-size: 44px; }
.btn-remove-icon {
  position: absolute; top: -5px; right: -5px;
  background: #36393f; border: 1px solid rgba(255,255,255,0.2);
  color: #fff; width: 20px; height: 20px; border-radius: 50%;
  font-size: 11px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 5; box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}
.btn-remove-icon:hover { background: #F87171; border-color: #F87171; }

/* 이모지 피커 */
.emoji-picker-wrap {
  background: #2e2d3d; border: 1px solid rgba(180,160,255,0.2);
  border-radius: 10px; padding: 10px; margin-bottom: 12px;
  animation: modalIn 0.15s ease;
}
.emoji-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.emoji-tabs { display: flex; gap: 3px; background: rgba(255,255,255,0.06); padding: 3px; border-radius: 7px; }
.emoji-tabs button { background: transparent; border: none; font-size: 15px; padding: 3px 7px; border-radius: 5px; cursor: pointer; opacity: 0.5; transition: all 0.2s; }
.emoji-tabs button.active { opacity: 1; background: rgba(180,160,255,0.22); }
.btn-upload-img { background: rgba(180,160,255,0.15); border: none; color: #DDD6FE; padding: 5px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; }
.btn-upload-img:hover { background: rgba(180,160,255,0.3); }
.emoji-grid-scroll { max-height: 160px; overflow-y: auto; padding-right: 2px; }
.emoji-grid-scroll::-webkit-scrollbar { width: 5px; }
.emoji-grid-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 5px; }
.emoji-btn {
  background: rgba(255,255,255,0.10); border: 1px solid transparent;
  font-size: 22px; padding: 5px; cursor: pointer;
  border-radius: 7px; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
}
.emoji-btn:hover { background: rgba(255,255,255,0.22); transform: scale(1.1); }
.emoji-btn.active { background: rgba(180,160,255,0.28); border-color: rgba(180,160,255,0.55); }

.err { color: #F87171; font-size: 13px; margin: 0; }

.mbtn {
  padding: 10px 22px; border-radius: 10px; font-size: 14px;
  font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit;
}
.mbtn--cancel {
  background: rgba(255,255,255,0.06); color: rgba(220,218,240,0.5);
  border: 1px solid rgba(180,160,255,0.12);
}
.mbtn--cancel:hover { background: rgba(255,255,255,0.1); color: #F0EFF8; }
.mbtn--primary {
  background: linear-gradient(135deg, #8889C4, #7879C0, #6667AB);
  color: #fff; box-shadow: 0 0 20px rgba(120,121,192,0.3);
}
.mbtn--primary:hover:not(:disabled) { box-shadow: 0 0 32px rgba(120,121,192,0.55); transform: translateY(-1px); }
.mbtn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>