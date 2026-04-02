<!-- src/components/workspace/WorkspaceCreateModal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <header class="modal-hd">
          <h2 class="modal-title">새 워크스페이스 만들기</h2>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">

          <!-- 워크스페이스 이름 -->
          <div class="fg">
            <label class="fl">워크스페이스 이름 <span class="req">*</span></label>
            <input
              v-model="form.wsName"
              class="fi"
              type="text"
              placeholder="예) Weave 개발팀"
              maxlength="100"
              @input="autoFillSlug"
            />
          </div>

          <!-- 슬러그 -->
          <div class="fg">
            <label class="fl">
              초대 링크 슬러그 <span class="req">*</span>
              <span class="fh">영문 소문자, 숫자, 하이픈(-)</span>
            </label>
            <div class="slug-wrap">
              <input
                v-model="form.slug"
                class="fi"
                :class="slugStatusClass"
                type="text"
                placeholder="예) weave-dev-team"
                maxlength="100"
                @input="onSlugInput"
              />
              <span v-if="slugStatus === 'ok'"       class="sbadge sbadge--ok">✓ 사용 가능</span>
              <span v-if="slugStatus === 'taken'"    class="sbadge sbadge--taken">✗ 이미 사용 중</span>
              <span v-if="slugStatus === 'checking'" class="sbadge sbadge--checking">확인 중...</span>
            </div>
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
import { ref, computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const emit = defineEmits(['close', 'created'])
const workspaceStore = useWorkspaceStore()

const form       = ref({ wsName: '', slug: '', iconUrl: '' })
const slugStatus = ref('')   // '' | 'checking' | 'ok' | 'taken'
const errorMsg   = ref('')
const submitting = ref(false)
let slugTimer = null

function autoFillSlug() {
  if (!form.value.slug) {
    form.value.slug = form.value.wsName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
}

function onSlugInput() {
  slugStatus.value = ''
  clearTimeout(slugTimer)
  const val = form.value.slug
  if (!val) return
  slugStatus.value = 'checking'
  slugTimer = setTimeout(async () => {
    const available = await workspaceStore.checkSlug(val)
    slugStatus.value = available ? 'ok' : 'taken'
  }, 500)
}

const slugStatusClass = computed(() => ({
  'fi--ok':    slugStatus.value === 'ok',
  'fi--error': slugStatus.value === 'taken',
}))

const canSubmit = computed(() =>
  form.value.wsName.trim() &&
  form.value.slug.trim() &&
  slugStatus.value === 'ok'
)

async function submit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    const newWs = await workspaceStore.createWorkspace({
      wsName:  form.value.wsName.trim(),
      slug:    form.value.slug.trim(),
      iconUrl: form.value.iconUrl || null,
    })
    emit('created', newWs)
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? '워크스페이스 생성에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;        /* ✅ 헤더(1000)보다 훨씬 높게 */
  backdrop-filter: blur(6px);
}

.modal-box {
  background: #13122A;
  border: 1px solid rgba(180, 160, 255, 0.18);
  border-radius: 20px;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(180,160,255,0.1);
  overflow: hidden;
  animation: modalIn 0.22s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(-12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}

.modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px 18px;
  border-bottom: 1px solid rgba(180, 160, 255, 0.1);
}
.modal-title { font-size: 17px; font-weight: 700; color: #F0EFF8; margin: 0; }
.modal-close {
  background: none; border: none; font-size: 16px;
  color: rgba(220, 218, 240, 0.38); cursor: pointer;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.08); color: #F0EFF8; }

.modal-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 18px; }
.modal-ft {
  padding: 18px 26px;
  border-top: 1px solid rgba(180, 160, 255, 0.1);
  display: flex; justify-content: flex-end; gap: 10px;
}

/* 폼 */
.fg { display: flex; flex-direction: column; gap: 7px; }
.fl { font-size: 13px; font-weight: 600; color: rgba(220,218,240,0.7); }
.fh { font-weight: 400; color: rgba(220,218,240,0.3); font-size: 11.5px; margin-left: 6px; }
.req { color: #F87171; }

.fi {
  padding: 11px 14px;
  background: rgba(255,255,255,0.05);
  border: 1.5px solid rgba(180,160,255,0.15);
  border-radius: 10px;
  font-size: 14px;
  color: #F0EFF8;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.fi::placeholder { color: rgba(220,218,240,0.22); }
.fi:focus     { border-color: #8889C4; background: rgba(255,255,255,0.07); }
.fi--ok       { border-color: #4ADE80 !important; }
.fi--error    { border-color: #F87171 !important; }

.slug-wrap { position: relative; }
.sbadge {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  font-size: 11.5px; font-weight: 600; pointer-events: none;
}
.sbadge--ok       { color: #4ADE80; }
.sbadge--taken    { color: #F87171; }
.sbadge--checking { color: rgba(220,218,240,0.4); }

.err { color: #F87171; font-size: 13px; margin: 0; }

/* 버튼 */
.mbtn {
  padding: 10px 22px; border-radius: 10px; font-size: 14px;
  font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
  font-family: inherit;
}
.mbtn--cancel {
  background: rgba(255,255,255,0.06);
  color: rgba(220,218,240,0.5);
  border: 1px solid rgba(180,160,255,0.12);
}
.mbtn--cancel:hover { background: rgba(255,255,255,0.1); color: #F0EFF8; }
.mbtn--primary {
  background: linear-gradient(135deg, #8889C4, #7879C0, #6667AB);
  color: #fff;
  box-shadow: 0 0 20px rgba(120,121,192,0.3);
}
.mbtn--primary:hover:not(:disabled) { box-shadow: 0 0 32px rgba(120,121,192,0.55); transform: translateY(-1px); }
.mbtn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>