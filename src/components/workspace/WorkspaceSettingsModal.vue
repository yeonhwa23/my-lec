<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <header class="modal-hd">
          <h2 class="modal-title">워크스페이스 설정</h2>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <form @submit.prevent="submit" enctype="multipart/form-data">
            
            <div class="fg banner-group">
              <label class="fl">배너 이미지 (선택)</label>
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
            </div>

            <div class="fg-row">
              <div class="icon-group">
                <label class="fl">아이콘</label>
                <div class="icon-preview-wrap">
                  <div class="icon-preview bright-bg" @click="toggleEmojiPicker">
                    <img v-if="iconPreviewUrl" :src="iconPreviewUrl" class="icon-img" @error="handleImageError" />
                    <div v-else-if="selectedEmoji" class="icon-placeholder emoji-mode">{{ selectedEmoji }}</div>
                    <span v-else class="icon-placeholder">{{ form.wsName.substring(0, 2).toUpperCase() || 'WS' }}</span>
                    <div class="img-overlay"><i class="bi bi-pencil-fill"></i></div>
                  </div>
                  <button v-if="iconPreviewUrl || selectedEmoji" type="button" class="btn-remove-icon" @click="removeIcon">
                    ✕
                  </button>
                </div>
                <input type="file" ref="iconInput" class="hidden-input" accept="image/*" @change="onIconChange" />
              </div>

              <div class="fg" style="flex: 1;">
                <label class="fl">워크스페이스 이름 <span class="req">*</span></label>
                <input v-model="form.wsName" class="fi" type="text" placeholder="예) Weave 개발팀" required />
                
                <label class="fl mt-3">초대 링크 (슬러그)</label>
                <input v-model="form.slug" class="fi fi--readonly" type="text" readonly />
              </div>
            </div>

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
                  <button 
                    type="button" 
                    v-for="emoji in currentEmojiList" 
                    :key="emoji" 
                    class="emoji-btn" 
                    :class="{ active: selectedEmoji === emoji }"
                    @click="selectEmoji(emoji)"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>

            <div class="fg mt-3">
              <label class="fl">워크스페이스 설명 (선택)</label>
              <textarea v-model="form.description" class="fi textarea" placeholder="워크스페이스에 대한 간단한 소개를 적어주세요."></textarea>
            </div>

            <p v-if="errorMsg" class="err mt-2">{{ errorMsg }}</p>

            <footer class="modal-ft mt-4">
              <button type="button" class="mbtn mbtn--cancel" @click="$emit('close')">취소</button>
              <button type="submit" class="mbtn mbtn--primary" :disabled="!canSubmit || submitting">
                {{ submitting ? '저장 중...' : '변경사항 저장' }}
              </button>
            </footer>

          </form>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import http from '@/util/http'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const props = defineProps({
  workspace: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])
const workspaceStore = useWorkspaceStore()

// 백엔드 주소를 명확하게 고정!
const API_BASE_URL = 'http://localhost:9090'

const form = ref({
  wsName: props.workspace.wsName || '',
  slug: props.workspace.slug || '',
  description: props.workspace.description || ''
})

const iconInput = ref(null)
const bannerInput = ref(null)
const iconFile = ref(null)
const bannerFile = ref(null)

// 삭제 여부를 추적하는 플래그 (서버에 "삭제해줘" 라고 알리기 위함)
const isIconRemoved = ref(false)
const isBannerRemoved = ref(false)

// 이모지 문자인지 판별 (슬래시/http 없으면 이모지)
const isEmoji = (str) => {
  if (!str) return false;
  if (str.startsWith('/') || str.startsWith('http') || str.startsWith('blob:')) return false;
  return true;
}

// 파일 URL 보정: /uploads/... → http://localhost:9090/uploads/...
const getFullUrl = (url) => {
  if (!url || isEmoji(url)) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const safeUrl = url.startsWith('/') ? url : `/${url}`
  return `${API_BASE_URL}${safeUrl}`;
}

// 핵심: iconUrl이 이모지면 selectedEmoji에, 파일 경로면 iconPreviewUrl에 분리 세팅
const rawIconUrl = props.workspace.iconUrl || ''
const iconPreviewUrl  = ref(isEmoji(rawIconUrl) ? '' : getFullUrl(rawIconUrl))
const selectedEmoji   = ref(isEmoji(rawIconUrl) ? rawIconUrl : '')
const bannerPreviewUrl = ref(getFullUrl(props.workspace.bannerUrl))


const showIconOptions = ref(false)
const emojiTab = ref('smile')

const rawEmojis = {
  smile: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  nature: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷','🕸','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔','🐾','🐉','🐲','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🐚','🪨','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐️','🌟','✨','⚡️','☄️','💥','🔥','🌪','🌈','☀️','🌤','⛅️','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️','☃️','⛄️','🌬','💨','💧','💦','☔️','☂️','🌊','🌫'],
  food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕️','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽','🥣','🥡','🥢','🧂'],
  activity: ['⚽️','🏀','🏈','⚾️','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳️','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','⛸','🥌','🎿','⛷','🏂','🪂','🏋️‍♀️','🏋️','🏋️‍♂️','🤼‍♀️','🤼','🤼‍♂️','🤸‍♀️','🤸','🤸‍♂️','⛹️‍♀️','⛹️','⛹️‍♂️','🤺','🤾‍♀️','🤾','🤾‍♂️','🏌️‍♀️','🏌️','🏌️‍♂️','🏇','🧘‍♀️','🧘','🧘‍♂️','🏄‍♀️','🏄','🏄‍♂️','🏊‍♀️','🏊','🏊‍♂️','🤽‍♀️','🤽','🤽‍♂️','🚣‍♀️','🚣','🚣‍♂️','🧗‍♀️','🧗','🧗‍♂️','🚵‍♀️','🚵','🚵‍♂️','🚴‍♀️','🚴','🚴‍♂️','🏆','🥇','🥈','🥉','🏅','🎖','🏵','🎗','🎫','🎟','🎪','🤹‍♀️','🤹','🤹‍♂️','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟','🎯','🎳','🎮','🎰','🧩'],
  objects: ['⌚️','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰','🕰','⌛️','⏳','📡','🔋','🔌','💡','🔦','🕯','🪔','🧯','🛢','🗑','🛒','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒','🛠','⛏','🪚','🔩','⚙️','🪤','🧱','⛓','🧲','🔫','💣','🧨','🪓','🔪','🗡','⚔️','🛡','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🧽','🪣','🧴','🛎','🔑','🗝','🚪','🪑','🛋','🛏','🛌','🧸','🪆','🖼','🪞','🪟','🛍','🎀','🎁','🎈','🎏','🎐','🎎','🏮','✉️','📩','📨','📧','💌','📥','📤','📦','🏷','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒','🗓','📆','📅','📇','🗃','🗳','🗄','📋','📁','📂','🗂','🗞','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇','📐','📏','🧮','📌','📍','✂️','🖊','🖋','✒️','🖌','🖍','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓']
}
const emojis = {
  smile: [...new Set(rawEmojis.smile)],
  nature: [...new Set(rawEmojis.nature)],
  food: [...new Set(rawEmojis.food)],
  activity: [...new Set(rawEmojis.activity)],
  objects: [...new Set(rawEmojis.objects)]
}

const currentEmojiList = computed(() => emojis[emojiTab.value])


const handleImageError = (e) => {
  if (e.target.className.includes('icon-img')) iconPreviewUrl.value = ''
  if (e.target.className.includes('banner-img')) bannerPreviewUrl.value = ''
}

const errorMsg = ref('')
const submitting = ref(false)
const canSubmit = computed(() => form.value.wsName.trim() !== '')

const toggleEmojiPicker = () => { showIconOptions.value = !showIconOptions.value }

const selectEmoji = (emoji) => {
  selectedEmoji.value = emoji
  iconPreviewUrl.value = '' 
  iconFile.value = null     
  isIconRemoved.value = false
  showIconOptions.value = false
}

const triggerIconInput = () => { iconInput.value.click(); showIconOptions.value = false; }
const triggerBannerInput = () => bannerInput.value.click()

const onIconChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    iconFile.value = file
    iconPreviewUrl.value = URL.createObjectURL(file)
    selectedEmoji.value = '' 
    isIconRemoved.value = false
  }
}
const onBannerChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    bannerFile.value = file
    bannerPreviewUrl.value = URL.createObjectURL(file)
    isBannerRemoved.value = false
  }
}

// 🗑️ 아이콘 완전히 삭제하기 (초기화)
const removeIcon = () => {
  iconPreviewUrl.value = ''
  selectedEmoji.value = ''
  iconFile.value = null
  isIconRemoved.value = true // 백엔드에 빈 문자열을 보내기 위한 플래그
}

// 🗑️ 배너 완전히 삭제하기
const removeBanner = () => {
  bannerPreviewUrl.value = ''
  bannerFile.value = null
  isBannerRemoved.value = true
}

const submit = async () => {
  errorMsg.value = ''
  submitting.value = true

  try {
    const formData = new FormData()
    formData.append('workspaceId', props.workspace.workspaceId)
    formData.append('wsName', form.value.wsName.trim())
    formData.append('description', form.value.description?.trim() || '')
    
    // 🚨 파일, 이모지가 있거나 "삭제" 버튼을 눌렀을 때만 파라미터 전송
    if (iconFile.value instanceof File) {
      formData.append('iconFile', iconFile.value)
    } else if (selectedEmoji.value) {
      formData.append('iconString', selectedEmoji.value)
    } else if (isIconRemoved.value) {
      formData.append('iconString', '') // 백엔드에서 빈 문자열로 덮어쓰게 함
    }

    if (bannerFile.value instanceof File) {
      formData.append('bannerFile', bannerFile.value)
    } else if (isBannerRemoved.value) {
      formData.append('removeBanner', 'true') // 백엔드 처리용 플래그
    }

    const response = await http.put('/workspaces/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await workspaceStore.fetchMyWorkspaces()
    await workspaceStore.setCurrentWorkspace(
      workspaceStore.workspaceList.find(w => w.workspaceId === props.workspace.workspaceId)
    )

    emit('updated', response.data)
    emit('close')
    
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? '워크스페이스 수정에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(6px); }
.modal-box { background: #13122A; border: 1px solid rgba(180, 160, 255, 0.18); border-radius: 20px; width: 500px; max-width: 95vw; box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6); animation: modalIn 0.22s ease; overflow: hidden; }
@keyframes modalIn { from { opacity: 0; transform: translateY(-12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

.modal-hd { display: flex; align-items: center; justify-content: space-between; padding: 22px 26px 18px; border-bottom: 1px solid rgba(180, 160, 255, 0.1); }
.modal-title { font-size: 17px; font-weight: 700; color: #F0EFF8; margin: 0; }
.modal-close { background: none; border: none; font-size: 16px; color: rgba(220, 218, 240, 0.38); cursor: pointer; width: 28px; height: 28px; border-radius: 8px; transition: all 0.2s; }
.modal-close:hover { background: rgba(255,255,255,0.08); color: #F0EFF8; }

.modal-body { padding: 22px 26px; display: flex; flex-direction: column; max-height: 75vh; overflow-y: auto; }
.modal-ft { border-top: 1px solid rgba(180, 160, 255, 0.1); display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; }

.fg { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.fg-row { display: flex; gap: 20px; align-items: flex-start; }
.fl { font-size: 13px; font-weight: 600; color: rgba(220,218,240,0.7); }
.req { color: #F87171; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 24px; }

.fi { padding: 11px 14px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(180,160,255,0.15); border-radius: 10px; font-size: 14px; color: #F0EFF8; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
.fi:focus { border-color: #8889C4; background: rgba(255,255,255,0.07); }
.fi--readonly { background: rgba(255,255,255,0.02); color: #a78bfa; cursor: not-allowed; border-color: rgba(180,160,255,0.08); }
.textarea { resize: none; height: 80px; }

.hidden-input { display: none; }
.img-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 13px; gap: 5px; }

/* 배너 영역 */
.banner-preview { position: relative; width: 100%; height: 160px; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.05); border: 1px dashed rgba(180,160,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.banner-preview:hover .img-overlay { opacity: 1; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-placeholder { color: rgba(220,218,240,0.3); display: flex; flex-direction: column; align-items: center; font-size: 13px; gap: 8px; }
.banner-placeholder i { font-size: 24px; }
.btn-remove-img { position: absolute; top: 8px; right: 8px; z-index: 10; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-remove-img:hover { background: #F87171; }

/* 아이콘 영역 */
.icon-preview-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.icon-preview { width: 100%; height: 100%; border-radius: 16px; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* 아이콘 배경: 프로젝트 컨셉 다크 퍼플 */
.bright-bg { background: #2a2845; }

.icon-preview:hover .img-overlay { opacity: 1; }
.icon-img { width: 100%; height: 100%; object-fit: cover; }
/* 어두운 배경에서 텍스트/이모지 잘 보이도록 */
.icon-placeholder { color: #E0DEFF; font-size: 20px; font-weight: 900; letter-spacing: 0.5px; }
.emoji-mode { font-size: 50px; }

/* 삭제 버튼 (우측 상단 엑스표) */
.btn-remove-icon { position: absolute; top: -6px; right: -6px; background: #36393f; border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; box-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.btn-remove-icon:hover { background: #F87171; border-color: #F87171; }

/* 이모지 피커 */
.emoji-picker-wrap { background: #2e2d3d; border: 1px solid rgba(180, 160, 255, 0.2); border-radius: 12px; padding: 12px; margin-top: 5px; animation: modalIn 0.2s ease; }
.emoji-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.emoji-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 8px; }
.emoji-tabs button { background: transparent; border: none; font-size: 16px; padding: 4px 8px; border-radius: 6px; cursor: pointer; opacity: 0.5; transition: all 0.2s; }
.emoji-tabs button.active { opacity: 1; background: rgba(180, 160, 255, 0.2); }
.btn-upload-img { background: rgba(180,160,255,0.15); border: none; color: #DDD6FE; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-upload-img:hover { background: rgba(180,160,255,0.3); }

.emoji-grid-scroll { max-height: 180px; overflow-y: auto; padding-right: 4px; }
.emoji-grid-scroll::-webkit-scrollbar { width: 6px; }
.emoji-grid-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.emoji-btn { background: rgba(255,255,255,0.12); border: 1px solid transparent; font-size: 24px; padding: 6px; cursor: pointer; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; }
.emoji-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.1); }
.emoji-btn.active { background: rgba(180,160,255,0.2); border-color: rgba(180,160,255,0.5); }

.err { color: #F87171; font-size: 13px; }
.mbtn { padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit; }
.mbtn--cancel { background: rgba(255,255,255,0.06); color: rgba(220,218,240,0.5); border: 1px solid rgba(180,160,255,0.12); }
.mbtn--cancel:hover { background: rgba(255,255,255,0.1); color: #F0EFF8; }
.mbtn--primary { background: linear-gradient(135deg, #8889C4, #7879C0, #6667AB); color: #fff; box-shadow: 0 0 20px rgba(120,121,192,0.3); }
.mbtn--primary:hover:not(:disabled) { box-shadow: 0 0 32px rgba(120,121,192,0.55); transform: translateY(-1px); }
.mbtn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>