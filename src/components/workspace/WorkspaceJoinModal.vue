<!-- src/components/workspace/WorkspaceJoinModal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <header class="modal-hd">
          <h2 class="modal-title">초대 링크로 입장</h2>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <p class="modal-desc">팀원에게 받은 초대 슬러그를 입력하세요.</p>
          <div class="fg">
            <label class="fl">슬러그 (초대 코드)</label>
            <input
              v-model="slug"
              class="fi"
              type="text"
              placeholder="예) weave-dev-team"
              @keyup.enter="submit"
            />
          </div>
          <p v-if="errorMsg" class="err">{{ errorMsg }}</p>
        </div>

        <footer class="modal-ft">
          <button class="mbtn mbtn--cancel" @click="$emit('close')">취소</button>
          <button
            class="mbtn mbtn--primary"
            :disabled="!slug.trim() || submitting"
            @click="submit"
          >
            {{ submitting ? '입장 중...' : '입장하기' }}
          </button>
        </footer>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const emit = defineEmits(['close', 'joined'])
const workspaceStore = useWorkspaceStore()

const slug       = ref('')
const errorMsg   = ref('')
const submitting = ref(false)

async function submit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    const ws = await workspaceStore.joinBySlug(slug.value.trim())
    emit('joined', ws)
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? '입장에 실패했습니다. 슬러그를 확인해주세요.'
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
  z-index: 99999;       /* ✅ 헤더(1000)보다 훨씬 높게 */
  backdrop-filter: blur(6px);
}

.modal-box {
  background: #13122A;
  border: 1px solid rgba(180, 160, 255, 0.18);
  border-radius: 20px;
  width: 420px;
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
  display: flex; align-items: center; justify-content: space-between;
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

.modal-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; }
.modal-desc { margin: 0; font-size: 13.5px; color: rgba(220,218,240,0.4); line-height: 1.6; }
.modal-ft {
  padding: 18px 26px;
  border-top: 1px solid rgba(180, 160, 255, 0.1);
  display: flex; justify-content: flex-end; gap: 10px;
}

.fg { display: flex; flex-direction: column; gap: 7px; }
.fl { font-size: 13px; font-weight: 600; color: rgba(220,218,240,0.7); }

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
.fi:focus { border-color: #8889C4; background: rgba(255,255,255,0.07); }

.err { color: #F87171; font-size: 13px; margin: 0; }

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