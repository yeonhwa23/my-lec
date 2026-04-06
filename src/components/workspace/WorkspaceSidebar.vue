<template>
  <!-- WorkspaceView의 .app-layout__lnb 안에 들어가므로 fixed 없음 -->
  <div class="sb">
    <div class="sb-content">
      <!-- ── 채널 ── -->
      <section class="sb-group">
        <div class="sb-group-header">
          <h3 class="sb-group-title">채널</h3>
          <button class="sb-btn-add" @click="addChannel">+</button>
        </div>
        <ul class="sb-list">
          <li v-if="loadingChannels" class="sb-item sb-empty">불러오는 중...</li>
          <li v-else-if="channelList.length === 0" class="sb-item sb-empty">채널이 없습니다.</li>
          <li
            v-for="ch in channelList"
            :key="ch.channelId"
            class="sb-item"
            :class="{ 'sb-active': Number($route.params.channelId) === ch.channelId }"
            @click="goTo(`/ws/${$route.params.slug}/chat/${ch.channelId}`)"
          >
            <span class="sb-prefix">#</span>
            <span class="sb-label">{{ ch.chName }}</span>
          </li>
        </ul>
      </section>

      <!-- ── 페이지 ── -->
      <section class="sb-group">
        <div class="sb-group-header">
          <h3 class="sb-group-title">페이지</h3>
          <button class="sb-btn-add" @click="addRootPage">+</button>
        </div>
        <ul class="sb-list">
          <li v-if="loadingPages" class="sb-item sb-empty">불러오는 중...</li>
          <li v-else-if="flatPages.length === 0" class="sb-item sb-empty">페이지가 없습니다.</li>
          <li
            v-for="p in flatPages"
            :key="p.pageId"
            class="sb-item"
            :class="{ 'sb-active': Number($route.params.pageId) === p.pageId }"
            :style="{ paddingLeft: `${14 + p._depth * 14}px` }"
            @click="goTo(`/ws/${$route.params.slug}/page/${p.pageId}`)"
          >
            <button v-if="p._hasChildren" class="sb-toggle" @click.stop="toggleNode(p.pageId)">
              {{ collapsed.has(p.pageId) ? '▸' : '▾' }}
            </button>
            <span v-else class="sb-toggle-gap"></span>
            <span class="sb-prefix">{{ p.iconEmoji || '📄' }}</span>
            <span class="sb-label">{{ p.title || '제목 없는 페이지' }}</span>
            <button v-if="p._depth < 2" class="sb-btn-child" @click.stop="addChildPage(p.pageId)">+</button>
          </li>
        </ul>
      </section>

      <!-- ── DM ── -->
      <section class="sb-group">
        <h3 class="sb-group-title">다이렉트 메시지</h3>
        <ul class="sb-list">
          <li class="sb-item">
            <span class="sb-online">●</span>
            <span class="sb-label">나 (AI 봇)</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAuthStore } from '@/stores/authStore'
import http from '@/util/http'

// WorkspaceView에서 전달하는 props (사용 안 해도 에러 방지용)
defineProps({ workspace: Object, members: Array })

const router = useRouter()
const route  = useRoute()
const workspaceStore = useWorkspaceStore()
const authStore      = useAuthStore()

const channelList     = ref([])
const pageTree        = ref([])
const collapsed       = ref(new Set())
const loadingChannels = ref(false)
const loadingPages    = ref(false)

const currentWorkspaceId = computed(() =>
  workspaceStore.currentWorkspace?.workspace_id
  ?? workspaceStore.currentWorkspace?.workspaceId
)

const flatPages = computed(() => {
  const result = []
  const walk = (nodes, depth) => {
    for (const node of nodes) {
      if (!node || typeof node !== 'object' || !node.pageId) continue
      const hasChildren = Array.isArray(node.children) && node.children.length > 0
      result.push({ ...node, _depth: depth, _hasChildren: hasChildren })
      if (hasChildren && !collapsed.value.has(node.pageId)) walk(node.children, depth + 1)
    }
  }
  walk(pageTree.value, 0)
  return result
})

const toggleNode = (id) => {
  const s = new Set(collapsed.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsed.value = s
}

const fetchChannels = async () => {
  if (!currentWorkspaceId.value) return
  loadingChannels.value = true
  try {
    const raw = await http.get(`/workspaces/${currentWorkspaceId.value}/channels`)
    channelList.value = Array.isArray(raw) ? raw : []
  } catch { channelList.value = [] }
  finally { loadingChannels.value = false }
}

const addChannel = async () => {
  const name = prompt('새 채널 이름:')
  if (!name?.trim()) return
  try {
    await http.post(`/workspaces/${currentWorkspaceId.value}/channels`, {
      chName: name.trim(), memberId: authStore.auth?.member_id
    })
    await fetchChannels()
  } catch { alert('채널 생성 실패') }
}

const fetchPages = async () => {
  if (!currentWorkspaceId.value) return
  loadingPages.value = true
  try {
    const raw = await http.get(`/workspaces/${currentWorkspaceId.value}/pages`)
    let parsed = raw
    if (typeof raw === 'string') { try { parsed = JSON.parse(raw) } catch { parsed = [] } }
    pageTree.value = Array.isArray(parsed) ? parsed : []
  } catch { pageTree.value = [] }
  finally { loadingPages.value = false }
}

const addRootPage = async () => {
  const title = prompt('새 페이지 제목:')
  if (!title?.trim()) return
  try {
    await http.post(`/workspaces/${currentWorkspaceId.value}/pages`, { title: title.trim() })
    await fetchPages()
  } catch { alert('페이지 생성 실패') }
}

const addChildPage = async (parentId) => {
  const title = prompt('하위 페이지 제목:')
  if (!title?.trim()) return
  try {
    await http.post(`/workspaces/${currentWorkspaceId.value}/pages`, { title: title.trim(), parentId })
    await fetchPages()
  } catch { alert('하위 페이지 생성 실패') }
}

const goTo = (path) => router.push(path)

onMounted(() => { fetchChannels(); fetchPages() })
watch(currentWorkspaceId, (id) => { if (id) { fetchChannels(); fetchPages() } })
</script>

<style scoped>
/* fixed 없음 - WorkspaceView .app-layout__lnb가 컨테이너 */
.sb {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sb-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 12px;
}
.sb-content::-webkit-scrollbar { width: 4px; }
.sb-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 99px; }

.sb-group { margin-bottom: 24px; }
.sb-group-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 8px 6px 16px;
}
.sb-group-title {
  font-size: 12px; font-weight: 700; color: #96989d;
  text-transform: uppercase; letter-spacing: .4px; margin: 0;
}

.sb-list { list-style: none; padding: 0; margin: 0; }

.sb-item {
  display: flex; align-items: center; gap: 7px;
  padding: 6px 8px 6px 14px;
  margin: 1px 6px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  color: #96989d;
  transition: background .1s;
  position: relative;
  user-select: none;
}
.sb-item:hover  { background: #35373d; color: #dcddde; }
.sb-active      { background: #404249 !important; color: white !important; }
.sb-empty       { font-size: 12px; color: #72767d; cursor: default; }
.sb-empty:hover { background: transparent !important; color: #72767d !important; }

.sb-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-prefix { font-size: 15px; flex-shrink: 0; }
.sb-online { color: #3ba55c; font-size: 10px; flex-shrink: 0; }

.sb-toggle {
  background: none; border: none; color: #72767d; cursor: pointer;
  font-size: 10px; padding: 0; width: 14px; flex-shrink: 0; line-height: 1;
}
.sb-toggle:hover { color: #dcddde; }
.sb-toggle-gap   { display: inline-block; width: 14px; flex-shrink: 0; }

.sb-btn-child {
  display: none; background: none; border: none; color: #72767d;
  cursor: pointer; font-size: 18px; padding: 0 2px; line-height: 1;
  margin-left: auto; flex-shrink: 0;
}
.sb-item:hover .sb-btn-child { display: block; }
.sb-btn-child:hover { color: white; }

.sb-btn-add {
  background: none; border: none; color: #b9bbbe;
  cursor: pointer; font-size: 20px; padding: 0 4px; line-height: 1;
}
.sb-btn-add:hover { color: white; }
</style>