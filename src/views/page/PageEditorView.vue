<template>
  <div class="page-editor" @click.self="clickEmptyArea">
    <div v-if="loading" class="editor-loading">
      <span class="spinner"></span>불러오는 중...
    </div>

    <template v-else>
      <div class="editor-scroll">

        <!-- ━━━ 페이지 헤더 ━━━ -->
        <div class="page-header">
          <div class="header-top">
            <button class="emoji-btn" @click="pickEmoji">{{ iconEmoji || '📄' }}</button>
            <div class="header-actions">
              <transition name="fade">
                <span v-if="saveStatus" class="save-badge" :class="saveStatus">
                  <template v-if="saveStatus === 'saving'">저장 중...</template>
                  <template v-else-if="saveStatus === 'saved'">✓ 저장됨</template>
                  <template v-else-if="saveStatus === 'error'">⚠ 저장 실패</template>
                </span>
              </transition>
              <!-- 내보내기 -->
              <div class="dl-wrap" ref="dlWrapRef">
                <button class="dl-btn" @click="showDlMenu = !showDlMenu">↓ 내보내기</button>
                <transition name="menu-slide">
                  <div v-if="showDlMenu" class="dl-menu">
                    <button @click="downloadAs('md')">📄 마크다운 (.md)</button>
                    <button @click="downloadAs('txt')">📝 텍스트 (.txt)</button>
                    <button @click="downloadAs('html')">🌐 HTML (.html)</button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          <input v-model="pageTitle" class="title-input" placeholder="제목 없는 페이지"
            @input="scheduleSave" @keydown.enter.prevent="focusFirstBlock" />
          <p v-if="blocks.length <= 1 && !blocks[0]?.content && !blocks[0]?.title" class="empty-hint">
            클릭하거나 <kbd>/</kbd> 를 눌러 블록을 추가하세요
          </p>
        </div>

        <!-- ━━━ 블록 목록 ━━━ -->
        <div class="blocks-area" ref="blocksAreaRef">
          <div
            v-for="(block, idx) in blocks"
            :key="block.id + '|' + block.type"
            class="block-row"
            :class="{ active: activeId === block.id }"
            @mouseenter="hoverId = block.id"
            @mouseleave="hoverId = null"
          >
            <button class="handle" :class="{ show: hoverId === block.id || activeId === block.id }"
              @click.stop="deleteBlock(idx)" title="블록 삭제">⠿</button>

            <!-- 구분선 -->
            <div v-if="block.type === 'divider'" class="b-divider" @click="afterDivider(idx)">
              <div class="divider-line"></div>
            </div>

            <!-- 할 일 -->
            <label v-else-if="block.type === 'todo'" class="b-todo">
              <input type="checkbox" class="todo-cb" :checked="block.checked"
                @change="block.checked = $event.target.checked; scheduleSave()" />
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" :class="{ done: block.checked }" data-ph="할 일 추가..."
                @input="onInput(block, idx, $event)"
                @keydown="onKeydown(block, idx, $event)"
                @focus="activeId = block.id"></div>
            </label>

            <!-- 글머리 목록 -->
            <div v-else-if="block.type === 'ul'" class="b-ul">
              <span class="ul-dot">•</span>
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" data-ph="목록 항목..."
                @input="onInput(block, idx, $event)"
                @keydown="onListKeydown(block, idx, $event, 'ul')"
                @focus="activeId = block.id"></div>
            </div>

            <!-- 번호 목록 -->
            <div v-else-if="block.type === 'ol'" class="b-ol">
              <span class="ol-num">{{ getOlNum(idx) }}.</span>
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" data-ph="목록 항목..."
                @input="onInput(block, idx, $event)"
                @keydown="onListKeydown(block, idx, $event, 'ol')"
                @focus="activeId = block.id"></div>
            </div>

            <!-- 코드 블록 -->
            <div v-else-if="block.type === 'code'" class="b-code">
              <div class="code-header">
                <select class="lang-sel" v-model="block.language" @change="scheduleSave">
                  <option v-for="l in CODE_LANGS" :key="l" :value="l">{{ l }}</option>
                </select>
                <span class="lang-badge">{{ block.language }}</span>
                <button class="code-copy-btn" @click="copyCode(block)">
                  {{ copiedId === block.id ? '✓ 복사됨' : '복사' }}
                </button>
              </div>
              <textarea :ref="el => initTextarea(el, block, 'content')"
                class="code-ta" placeholder="// 코드를 입력하세요..."
                spellcheck="false" autocomplete="off"
                @input="onCodeInput(block, $event)"
                @keydown="onCodeKeydown(block, idx, $event)"
                @focus="activeId = block.id"></textarea>
            </div>

            <!-- 인용구 -->
            <div v-else-if="block.type === 'quote'" class="b-quote">
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" data-ph="인용구..."
                @input="onInput(block, idx, $event)"
                @keydown="onKeydown(block, idx, $event)"
                @focus="activeId = block.id"></div>
            </div>

            <!-- 토글 -->
            <div v-else-if="block.type === 'toggle'" class="b-toggle">
              <button class="toggle-arrow" :class="{ open: block.open }"
                @click="block.open = !block.open">▶</button>
              <div class="toggle-body">
                <div :ref="el => initEl(el, block)" contenteditable="true"
                  class="editable toggle-title" data-ph="토글 제목..."
                  @input="onToggleTitleInput(block, $event)"
                  @keydown="onToggleTitleKeydown(block, idx, $event)"
                  @focus="activeId = block.id"></div>
                <transition name="toggle-expand">
                  <textarea v-if="block.open"
                    :ref="el => initTextarea(el, block, 'body')"
                    class="toggle-ta" placeholder="내용을 입력하세요..."
                    @input="onToggleBodyInput(block, $event)"
                    @keydown.esc="block.open = false"
                    @focus="activeId = block.id"></textarea>
                </transition>
              </div>
            </div>

            <!-- 콜아웃 (중요/정보/경고/성공) -->
            <div v-else-if="['important','info','warning','success'].includes(block.type)"
              class="b-callout" :class="`callout-${block.type}`">
              <span class="callout-icon">{{ CALLOUT_ICONS[block.type] }}</span>
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" :data-ph="CALLOUT_PH[block.type]"
                @input="onInput(block, idx, $event)"
                @keydown="onKeydown(block, idx, $event)"
                @focus="activeId = block.id"></div>
            </div>

            <!-- 텍스트 / 제목 -->
            <div v-else class="b-text">
              <div :ref="el => initEl(el, block)" contenteditable="true"
                class="editable" :class="`t-${block.type}`"
                :data-ph="TEXT_PH[block.type] || '내용 입력...'"
                @input="onInput(block, idx, $event)"
                @keydown="onKeydown(block, idx, $event)"
                @focus="activeId = block.id"></div>
            </div>
          </div>

          <div class="add-zone" @click="addBlock">
            <span class="add-hint">여기를 클릭하여 계속 작성...</span>
          </div>
        </div>
      </div>

      <!-- ━━━ 슬래시 메뉴 ━━━ -->
      <Teleport to="body">
        <transition name="menu-slide">
          <div v-if="slash.on" class="slash-menu"
            :style="{ top: slash.y + 'px', left: slash.x + 'px' }"
            @mousedown.prevent>
            <div class="sm-header">
              블록 추가
              <span v-if="slash.q" class="sm-query">「{{ slash.q }}」</span>
            </div>
            <div class="sm-list">
              <template v-if="filteredCmds.length">
                <div v-for="(cmd, i) in filteredCmds" :key="cmd.type"
                  class="sm-item" :class="{ 'sm-item--on': slash.sel === i }"
                  @mousedown.prevent="applyCmd(cmd)"
                  @mouseover="slash.sel = i">
                  <span class="sm-icon">{{ cmd.icon }}</span>
                  <div>
                    <div class="sm-name">{{ cmd.name }}</div>
                    <div class="sm-desc">{{ cmd.desc }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="sm-empty">일치하는 명령어가 없습니다</div>
            </div>
          </div>
        </transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/util/http'

// ──────────────────────────────────────────
//  상수
// ──────────────────────────────────────────
const CODE_LANGS = ['javascript','typescript','python','java','kotlin','swift',
                    'go','rust','c','c++','html','css','sql','bash','json','yaml',
                    'markdown','php','ruby','scala']

const CALLOUT_ICONS = { important:'⭐', info:'ℹ️', warning:'⚠️', success:'✅' }
const CALLOUT_PH    = {
  important: '중요한 내용을 입력하세요...',
  info:      '정보 또는 안내를 입력하세요...',
  warning:   '주의사항을 입력하세요...',
  success:   '완료된 내용을 입력하세요...',
}
const TEXT_PH = {
  paragraph: "입력하거나 '/' 로 명령어",
  h1:'제목 1', h2:'제목 2', h3:'제목 3',
}

const COMMANDS = [
  { type:'paragraph', icon:'¶',   name:'텍스트',      desc:'기본 텍스트 블록',              kw:['text','텍스트','p','paragraph'] },
  { type:'h1',        icon:'H1',  name:'제목 1',      desc:'큰 제목 (H1)',                  kw:['h1','제목1','heading1','제목 1'] },
  { type:'h2',        icon:'H2',  name:'제목 2',      desc:'중간 제목 (H2)',                kw:['h2','제목2','heading2','제목 2'] },
  { type:'h3',        icon:'H3',  name:'제목 3',      desc:'작은 제목 (H3)',                kw:['h3','제목3','heading3'] },
  { type:'todo',      icon:'☑',  name:'할 일 목록',  desc:'체크박스 항목',                 kw:['todo','할일','task','체크','check'] },
  { type:'ul',        icon:'•',   name:'글머리 목록', desc:'점 목록 (Bullet list)',          kw:['ul','bullet','목록','list','글머리'] },
  { type:'ol',        icon:'1.', name:'번호 목록',   desc:'번호 목록 (Ordered list)',       kw:['ol','number','번호','ordered','숫자'] },
  { type:'code',      icon:'</>', name:'코드 블록',   desc:'문법 강조 코드 에디터',          kw:['code','코드','js','python','snippet','프로그래밍'] },
  { type:'quote',     icon:'❝',  name:'인용구',      desc:'인용 강조 블록',                kw:['quote','인용','blockquote'] },
  { type:'toggle',    icon:'▶',  name:'토글',        desc:'접었다 펼칠 수 있는 블록',       kw:['toggle','토글','collapse','접기','fold'] },
  { type:'important', icon:'⭐', name:'중요',        desc:'⭐ 노란 강조 블록',              kw:['important','중요','star','핵심','yellow'] },
  { type:'info',      icon:'ℹ', name:'정보',        desc:'🔵 정보/안내 블록',              kw:['info','정보','안내','note','tip','blue'] },
  { type:'warning',   icon:'⚠', name:'경고',        desc:'⚠️ 주의/경고 블록',             kw:['warning','경고','주의','caution','orange'] },
  { type:'success',   icon:'✓',  name:'완료',        desc:'✅ 완료/성공 블록',              kw:['success','완료','성공','done','green','ok'] },
  { type:'divider',   icon:'—',  name:'구분선',      desc:'가로 구분선 삽입',               kw:['divider','구분선','hr','---','선'] },
]

// ──────────────────────────────────────────
//  uid / mkBlock — 반드시 상태보다 먼저 선언
// ──────────────────────────────────────────
let _seed = 0
const uid = () => `b${Date.now()}_${_seed++}`
const mkBlock = (type = 'paragraph', content = '') => ({
  id: uid(), type, content, checked: false,
  language: 'javascript', title: '', body: '', open: true,
})

// ──────────────────────────────────────────
//  상태
// ──────────────────────────────────────────
const route = useRoute()
const loading    = ref(true)
const pageTitle  = ref('')
const iconEmoji  = ref('')
const saveStatus = ref('')
const activeId   = ref(null)
const hoverId    = ref(null)
const copiedId   = ref(null)
const showDlMenu = ref(false)
const dlWrapRef  = ref(null)

const blocks    = ref([mkBlock()])
const blockRefs = {}

let saveTimer = null

// ──────────────────────────────────────────
//  슬래시 메뉴
// ──────────────────────────────────────────
const slash = reactive({ on:false, x:0, y:0, q:'', sel:0, bid:null })

const filteredCmds = computed(() => {
  const q = slash.q.toLowerCase()
  if (!q) return COMMANDS
  return COMMANDS.filter(c => c.kw.some(k => k.includes(q)) || c.name.includes(q))
})

const openSlash = (block, el) => {
  const r  = el.getBoundingClientRect()
  slash.on  = true
  slash.x   = r.left
  slash.y   = r.bottom + 4
  slash.q   = block.content.startsWith('/') ? block.content.slice(1) : ''
  slash.sel = 0
  slash.bid = block.id
}
const closeSlash = () => { slash.on = false; slash.q = ''; slash.bid = null }

const applyCmd = async (cmd) => {
  const b = blocks.value.find(x => x.id === slash.bid)
  closeSlash()
  if (!b) return
  b.content = ''; b.body = ''; b.title = ''
  b.type = cmd.type

  if (cmd.type === 'divider') {
    const i = blocks.value.indexOf(b)
    const next = mkBlock()
    blocks.value.splice(i + 1, 0, next)
    await nextTick(); focusBlock(next.id)
  } else if (cmd.type === 'code') {
    await nextTick()
    const ta = blockRefs[b.id + '_content']
    if (ta) { ta.value = ''; ta.focus() }
  } else {
    await nextTick()
    const el = blockRefs[b.id]
    if (el) { el.innerText = ''; focusBlock(b.id) }
  }
  scheduleSave()
}

// ──────────────────────────────────────────
//  DOM 초기화
// ──────────────────────────────────────────
const initEl = (el, block) => {
  if (!el) { delete blockRefs[block.id]; return }
  blockRefs[block.id] = el
  if (el._bid !== block.id) {
    el._bid = block.id
    el.innerText = (block.type === 'toggle' ? block.title : block.content) || ''
  }
}

const initTextarea = (el, block, field) => {
  if (!el) { delete blockRefs[block.id + '_' + field]; return }
  const key = block.id + '_' + field
  blockRefs[key] = el
  if (el._key !== key) {
    el._key = key
    el.value = block[field] || ''
    nextTick(() => resizeTa(el))
  }
}

const resizeTa = (el) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.max(el.scrollHeight, 56) + 'px'
}

// ──────────────────────────────────────────
//  포커스
// ──────────────────────────────────────────
const focusBlock = async (id, end = true) => {
  await nextTick()
  const el = blockRefs[id]
  if (!el) return
  el.focus()
  if (end && el.isContentEditable) {
    try {
      const r = document.createRange()
      r.selectNodeContents(el); r.collapse(false)
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r)
    } catch { /* ignore */ }
  }
}
const focusFirstBlock = () => { if (blocks.value[0]) focusBlock(blocks.value[0].id) }

// ──────────────────────────────────────────
//  입력 핸들러
// ──────────────────────────────────────────
const onInput = (block, idx, ev) => {
  const text = ev.target.innerText.replace(/\n$/, '')
  block.content = text
  if (text.startsWith('/')) {
    openSlash(block, ev.target)
    if (slash.on) slash.q = text.slice(1)
  } else if (slash.on && slash.bid === block.id) closeSlash()
  scheduleSave()
}

const onToggleTitleInput = (block, ev) => {
  block.title = ev.target.innerText.replace(/\n$/, '')
  block.content = block.title
  if (block.title.startsWith('/')) openSlash(block, ev.target)
  else if (slash.on && slash.bid === block.id) closeSlash()
  scheduleSave()
}
const onToggleBodyInput = (block, ev) => { block.body = ev.target.value; resizeTa(ev.target); scheduleSave() }
const onCodeInput       = (block, ev) => { block.content = ev.target.value; resizeTa(ev.target); scheduleSave() }

// ──────────────────────────────────────────
//  키다운 핸들러
// ──────────────────────────────────────────
const onKeydown = (block, idx, ev) => {
  if (slash.on) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); slash.sel = (slash.sel+1) % filteredCmds.value.length; return }
    if (ev.key === 'ArrowUp')   { ev.preventDefault(); slash.sel = (slash.sel-1+filteredCmds.value.length) % filteredCmds.value.length; return }
    if (ev.key === 'Enter')     { ev.preventDefault(); applyCmd(filteredCmds.value[slash.sel]); return }
    if (ev.key === 'Escape')    { closeSlash(); return }
  }
  if (ev.key === 'Enter' && !ev.shiftKey) {
    ev.preventDefault()
    const next = mkBlock()
    blocks.value.splice(idx + 1, 0, next)
    nextTick(() => focusBlock(next.id))
    return
  }
  if (ev.key === 'Backspace') {
    const el = blockRefs[block.id]
    if (!el) return
    const t = el.innerText.replace(/\n$/, '')
    if (!t && blocks.value.length > 1) {
      ev.preventDefault()
      blocks.value.splice(idx, 1)
      nextTick(() => focusBlock(blocks.value[Math.max(0, idx-1)]?.id))
    }
  }
  if (ev.key === 'Tab') {
    ev.preventDefault()
    const ni = idx + (ev.shiftKey ? -1 : 1)
    if (ni >= 0 && ni < blocks.value.length) focusBlock(blocks.value[ni].id)
  }
}

const onListKeydown = (block, idx, ev, listType) => {
  if (slash.on) { onKeydown(block, idx, ev); return }
  if (ev.key === 'Enter' && !ev.shiftKey) {
    ev.preventDefault()
    const t = (blockRefs[block.id]?.innerText || '').replace(/\n$/, '')
    const next = mkBlock(t ? listType : 'paragraph')
    blocks.value.splice(idx + 1, 0, next)
    nextTick(() => focusBlock(next.id))
    return
  }
  onKeydown(block, idx, ev)
}

const onToggleTitleKeydown = (block, idx, ev) => {
  if (ev.key === 'Enter' && !ev.shiftKey) {
    ev.preventDefault(); block.open = true
    nextTick(() => blockRefs[block.id + '_body']?.focus())
    return
  }
  onKeydown(block, idx, ev)
}

const onCodeKeydown = (block, idx, ev) => {
  if (slash.on) { onKeydown(block, idx, ev); return }
  if (ev.key === 'Tab') {
    ev.preventDefault()
    const ta = ev.target, s = ta.selectionStart, e = ta.selectionEnd
    ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(e)
    ta.selectionStart = ta.selectionEnd = s + 4
    block.content = ta.value; resizeTa(ta); return
  }
  if (ev.key === 'Escape') {
    const next = blocks.value[idx + 1] || (() => { const b = mkBlock(); blocks.value.push(b); return b })()
    nextTick(() => focusBlock(next.id))
  }
}

// ──────────────────────────────────────────
//  블록 관리
// ──────────────────────────────────────────
const addBlock = () => {
  const b = mkBlock(); blocks.value.push(b); nextTick(() => focusBlock(b.id))
}
const deleteBlock = (idx) => {
  if (blocks.value.length === 1) {
    blocks.value[0] = mkBlock(); nextTick(() => focusBlock(blocks.value[0].id)); return
  }
  blocks.value.splice(idx, 1)
  nextTick(() => focusBlock(blocks.value[Math.max(0, idx-1)]?.id))
}
const afterDivider = (idx) => {
  const next = blocks.value[idx+1]; next ? focusBlock(next.id) : addBlock()
}
const clickEmptyArea = () => {
  const last = blocks.value.at(-1)
  if (!last || last.content.trim() || last.title?.trim()) addBlock()
  else focusBlock(last.id)
}
const getOlNum = (idx) => {
  let n = 1
  for (let i = idx-1; i >= 0; i--) { if (blocks.value[i].type === 'ol') n++; else break }
  return n
}

// ──────────────────────────────────────────
//  코드 복사
// ──────────────────────────────────────────
const copyCode = async (block) => {
  try {
    await navigator.clipboard.writeText(block.content || '')
    copiedId.value = block.id
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch { /* ignore */ }
}

// ──────────────────────────────────────────
//  저장 & 로드
// ──────────────────────────────────────────
const scheduleSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(savePage, 1500) }

const syncDom = () => {
  blocks.value.forEach(b => {
    if (b.type === 'divider') return
    if (b.type === 'code') {
      const ta = blockRefs[b.id + '_content']; if (ta) b.content = ta.value
    } else if (b.type === 'toggle') {
      const tel = blockRefs[b.id];            if (tel) b.title = tel.innerText.replace(/\n$/,'')
      const ta  = blockRefs[b.id + '_body']; if (ta)  b.body  = ta.value
    } else {
      const el = blockRefs[b.id];            if (el)  b.content = el.innerText.replace(/\n$/,'')
    }
  })
}

const savePage = async () => {
  const pid = route.params.pageId; if (!pid) return
  saveStatus.value = 'saving'; syncDom()
  try {
    await http.put(`/pages/${pid}`, {
      title: pageTitle.value, iconEmoji: iconEmoji.value,
      content: JSON.stringify({ v:2, blocks: blocks.value }),
    })
    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = '' }, 2000)
  } catch (e) {
    console.error('[Editor] 저장 오류:', e); saveStatus.value = 'error'
  }
}

const fetchPage = async () => {
  const pid = route.params.pageId; if (!pid) return
  loading.value = true
  try {
    const d = await http.get(`/pages/${pid}`)
    pageTitle.value = d.title || ''; iconEmoji.value = d.iconEmoji || ''
    blocks.value = parseContent(d.content)
  } catch (e) {
    console.error('[Editor] 로드 오류:', e); blocks.value = [mkBlock()]
  } finally { loading.value = false }
}

const parseContent = (raw) => {
  if (!raw) return [mkBlock()]
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (p?.v === 2 && Array.isArray(p.blocks) && p.blocks.length) return p.blocks
    if (Array.isArray(p) && p[0]?.type === '_quill') {
      const div = document.createElement('div'); div.innerHTML = p[0].html || ''
      return [mkBlock('paragraph', div.innerText)]
    }
    if (Array.isArray(p)) {
      const bls = p.map(b => {
        const text = tiptapText(b); let type = 'paragraph'
        if (b.type === 'heading')        type = `h${b.attrs?.level || 1}`
        if (b.type === 'blockquote')     type = 'quote'
        if (b.type === 'horizontalRule') type = 'divider'
        return mkBlock(type, text)
      }).filter(b => b.content || b.type === 'divider')
      return bls.length ? bls : [mkBlock()]
    }
  } catch { /* ignore */ }
  return [mkBlock()]
}
const tiptapText = (n) => n?.content ? n.content.map(c => c.text || tiptapText(c)).join('') : ''

// ──────────────────────────────────────────
//  다운로드
// ──────────────────────────────────────────
const toMdLine = (b) => {
  const c = b.content || b.title || ''
  switch (b.type) {
    case 'paragraph':  return c ? c + '\n\n' : ''
    case 'h1':         return `# ${c}\n\n`
    case 'h2':         return `## ${c}\n\n`
    case 'h3':         return `### ${c}\n\n`
    case 'todo':       return `- [${b.checked ? 'x' : ' '}] ${c}\n`
    case 'ul':         return `- ${c}\n`
    case 'ol':         return `1. ${c}\n`
    case 'quote':      return `> ${c}\n\n`
    case 'important':  return `> ⭐ **중요:** ${c}\n\n`
    case 'info':       return `> ℹ️ **정보:** ${c}\n\n`
    case 'warning':    return `> ⚠️ **경고:** ${c}\n\n`
    case 'success':    return `> ✅ **완료:** ${c}\n\n`
    case 'code':       return '```' + (b.language||'') + '\n' + b.content + '\n```\n\n'
    case 'toggle':     return `### ${b.title}\n${b.body}\n\n`
    case 'divider':    return `---\n\n`
    default:           return c ? c + '\n\n' : ''
  }
}

const downloadAs = (fmt) => {
  showDlMenu.value = false; syncDom()
  const title = pageTitle.value || '문서'
  let content = '', ext = '', mime = ''

  if (fmt === 'md') {
    content = `# ${title}\n\n` + blocks.value.map(toMdLine).join('')
    ext = 'md'; mime = 'text/markdown'
  } else if (fmt === 'txt') {
    content = `${title}\n${'━'.repeat(Math.min(title.length, 40))}\n\n` +
      blocks.value.map(b => {
        if (b.type === 'divider') return '────────────────────\n'
        if (b.type === 'toggle') return `▶ ${b.title}\n  ${b.body}\n`
        if (b.type === 'code')   return b.content + '\n'
        return (b.content || '') + '\n'
      }).filter(Boolean).join('\n')
    ext = 'txt'; mime = 'text/plain'
  } else if (fmt === 'html') {
    const esc = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    const body = blocks.value.map(b => {
      const c = b.content || ''
      switch (b.type) {
        case 'h1': return `<h1>${esc(c)}</h1>`
        case 'h2': return `<h2>${esc(c)}</h2>`
        case 'h3': return `<h3>${esc(c)}</h3>`
        case 'todo': return `<label style="display:block"><input type="checkbox" ${b.checked?'checked':''}> ${esc(c)}</label>`
        case 'ul': return `<ul><li>${esc(c)}</li></ul>`
        case 'ol': return `<ol><li>${esc(c)}</li></ol>`
        case 'quote': return `<blockquote>${esc(c)}</blockquote>`
        case 'code':  return `<pre><code class="language-${b.language}">${esc(b.content)}</code></pre>`
        case 'toggle': return `<details><summary>${esc(b.title)}</summary><p>${esc(b.body)}</p></details>`
        case 'divider': return `<hr>`
        case 'important': return `<div class="callout important">⭐ ${esc(c)}</div>`
        case 'info':      return `<div class="callout info">ℹ️ ${esc(c)}</div>`
        case 'warning':   return `<div class="callout warning">⚠️ ${esc(c)}</div>`
        case 'success':   return `<div class="callout success">✅ ${esc(c)}</div>`
        default: return `<p>${esc(c)}</p>`
      }
    }).join('\n')
    content = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:720px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:2em;margin-bottom:.5em}h2{font-size:1.5em}h3{font-size:1.2em}
blockquote{border-left:4px solid #5865f2;margin:0;padding:4px 16px;background:#f0f2ff;border-radius:0 6px 6px 0}
pre{background:#1e1f22;color:#e3e5e8;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px}
.callout{padding:10px 16px;border-radius:8px;margin:8px 0;display:flex;gap:12px;align-items:flex-start}
.important{background:#fefce8;border:1px solid #fde047}.info{background:#eff6ff;border:1px solid #93c5fd}
.warning{background:#fff7ed;border:1px solid #fdba74}.success{background:#f0fdf4;border:1px solid #86efac}
hr{border:none;border-top:1px solid #e5e7eb;margin:24px 0}
details{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px}
details summary{cursor:pointer;font-weight:600;padding:4px 0}
label{display:block;padding:2px 0}ul,ol{padding-left:24px}
</style></head><body>
<h1>${esc(title)}</h1>
${body}
</body></html>`
    ext = 'html'; mime = 'text/html'
  }

  const blob = new Blob([content], { type: mime + ';charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${title}.${ext}`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ──────────────────────────────────────────
//  이모지
// ──────────────────────────────────────────
const pickEmoji = () => {
  const s = '📄 📝 📌 💡 🔖 📋 🗂️ 🔍 ⭐ 🚀 ✅ 🎯 💼 🧠 🔥 💬 🏗️ 🎨'
  const v = prompt(`이모지 입력\n제안: ${s}`, iconEmoji.value)
  if (v !== null) { iconEmoji.value = v.trim(); scheduleSave() }
}

// ──────────────────────────────────────────
//  외부 클릭
// ──────────────────────────────────────────
const onDocClick = (e) => {
  if (!e.target.closest('.slash-menu')) closeSlash()
  if (dlWrapRef.value && !dlWrapRef.value.contains(e.target)) showDlMenu.value = false
}

onMounted(() => { fetchPage(); document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => { clearTimeout(saveTimer); savePage(); document.removeEventListener('click', onDocClick) })
watch(() => route.params.pageId, id => { if (id) fetchPage() })
</script>

<style scoped>
.page-editor {
  display: flex; flex-direction: column; height: 100%;
  background: #1e1f22; color: #dcdee0; overflow: hidden;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.editor-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; height: 100%; color: #72767d;
}
.spinner {
  width: 16px; height: 16px; border: 2px solid #3f4147;
  border-top-color: #5865f2; border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.editor-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
.editor-scroll::-webkit-scrollbar { width: 6px; }
.editor-scroll::-webkit-scrollbar-thumb { background: #3f4147; border-radius: 3px; }

/* 헤더 */
.page-header { max-width: 760px; margin: 0 auto; padding: 48px 80px 8px; }
.header-top  { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.header-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.emoji-btn {
  background: none; border: none; font-size: 42px; cursor: pointer;
  padding: 2px; border-radius: 6px; line-height: 1;
  transition: transform .12s, background .12s;
}
.emoji-btn:hover { transform: scale(1.08); background: rgba(255,255,255,.05); }

.save-badge { font-size: 12px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
.save-badge.saving { background: rgba(240,177,50,.12); color: #f0b132; }
.save-badge.saved  { background: rgba(59,165,92,.12);  color: #3ba55c; }
.save-badge.error  { background: rgba(237,66,69,.12);  color: #ed4245; }

/* 다운로드 */
.dl-wrap { position: relative; }
.dl-btn {
  background: #2b2d31; border: 1px solid #3f4147; color: #b9bbbe;
  font-size: 12px; padding: 4px 10px; border-radius: 6px; cursor: pointer;
  transition: background .12s, color .12s;
}
.dl-btn:hover { background: #3f4147; color: #e3e5e8; }
.dl-menu {
  position: absolute; right: 0; top: calc(100% + 4px);
  background: #2b2d31; border: 1px solid #3f4147;
  border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.4);
  overflow: hidden; z-index: 200; min-width: 185px;
}
.dl-menu button {
  display: block; width: 100%; text-align: left; background: none; border: none;
  color: #dcdee0; font-size: 13px; padding: 8px 14px; cursor: pointer;
  transition: background .1s;
}
.dl-menu button:hover { background: rgba(88,101,242,.15); }

.title-input {
  display: block; width: 100%; background: transparent; border: none; outline: none;
  font-size: 38px; font-weight: 700; color: #f2f3f5; letter-spacing: -.4px;
}
.title-input::placeholder { color: #2e3035; }
.empty-hint { margin: 6px 0 0; font-size: 13px; color: #4f545c; }
.empty-hint kbd {
  display: inline-block; padding: 0 5px; background: #2b2d31;
  border: 1px solid #3f4147; border-radius: 4px; font-size: 11px; color: #8e9297;
}

/* 블록 컨테이너 */
.blocks-area { max-width: 760px; margin: 0 auto; padding: 2px 80px 240px; }

/* 블록 행 */
.block-row {
  position: relative; display: flex; align-items: flex-start;
  min-height: 28px; border-radius: 5px; margin: 1px 0;
}
.block-row:hover  { background: rgba(255,255,255,.02); }
.block-row.active { background: rgba(255,255,255,.02); }

.handle {
  position: absolute; left: -30px; top: 4px;
  width: 22px; height: 22px; background: none; border: none;
  color: #4f545c; cursor: pointer; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .12s, background .12s; font-size: 12px;
}
.handle.show { opacity: 1; }
.handle:hover { background: rgba(237,66,69,.15); color: #ed4245; }

/* 공통 editable */
.editable {
  flex: 1; outline: none; min-height: 26px; padding: 2px 0;
  line-height: 1.75; color: #dcdee0; word-break: break-word;
  white-space: pre-wrap; caret-color: #5865f2;
}
.editable:empty::before  { content: attr(data-ph); color: #35373c; pointer-events: none; }
.editable:focus::before  { color: #4a4f57; }

/* 텍스트/제목 */
.b-text { flex: 1; }
.t-paragraph { font-size: 15px; }
.t-h1 { font-size: 32px; font-weight: 700; color: #f2f3f5; letter-spacing: -.3px; padding: 8px 0 2px; }
.t-h2 { font-size: 24px; font-weight: 700; color: #f2f3f5; padding: 6px 0 2px; }
.t-h3 { font-size: 18px; font-weight: 600; color: #e3e5e8; padding: 4px 0 1px; }

/* 구분선 */
.b-divider { flex: 1; display: flex; align-items: center; padding: 14px 0; cursor: default; }
.divider-line { width: 100%; height: 1px; background: linear-gradient(to right, transparent, #3f4147 15%, #3f4147 85%, transparent); }

/* 할 일 */
.b-todo { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.todo-cb { margin-top: 6px; width: 15px; height: 15px; flex-shrink: 0; accent-color: #5865f2; cursor: pointer; }
.done { text-decoration: line-through; color: #72767d; }

/* 목록 */
.b-ul, .b-ol { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.ul-dot { margin-top: 5px; color: #8e9297; font-size: 18px; flex-shrink: 0; line-height: 1; }
.ol-num { margin-top: 3px; color: #8e9297; font-size: 14px; flex-shrink: 0; min-width: 20px; font-weight: 600; }

/* 코드 */
.b-code { flex: 1; background: #111214; border: 1px solid #2e3035; border-radius: 8px; overflow: hidden; margin: 3px 0; }
.code-header {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; background: #18191c; border-bottom: 1px solid #2e3035;
}
.lang-sel {
  background: #2b2d31; border: 1px solid #3f4147; color: #8e9297;
  font-size: 11px; padding: 2px 6px; border-radius: 4px; cursor: pointer; outline: none;
}
.lang-badge { font-size: 11px; color: #5865f2; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.code-copy-btn {
  margin-left: auto; background: #2b2d31; border: 1px solid #3f4147; color: #8e9297;
  font-size: 11px; padding: 2px 8px; border-radius: 4px; cursor: pointer;
  transition: background .1s, color .1s;
}
.code-copy-btn:hover { background: #3f4147; color: #e3e5e8; }
.code-ta {
  display: block; width: 100%; box-sizing: border-box; background: transparent;
  border: none; outline: none; color: #e3e5e8;
  font-family: 'JetBrains Mono','Fira Code','Consolas',monospace;
  font-size: 13.5px; line-height: 1.65; padding: 14px 16px;
  resize: none; min-height: 80px; tab-size: 4; caret-color: #5865f2;
}
.code-ta::placeholder { color: #3f4147; }

/* 인용구 */
.b-quote {
  flex: 1; border-left: 3px solid #5865f2; padding: 4px 16px; margin: 2px 0;
  background: rgba(88,101,242,.06); border-radius: 0 6px 6px 0;
}
.b-quote .editable { color: #b9bbbe; font-style: italic; }

/* 토글 */
.b-toggle { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
.toggle-arrow {
  background: none; border: none; color: #8e9297; font-size: 10px;
  padding: 6px 2px; cursor: pointer; transition: transform .2s; flex-shrink: 0;
}
.toggle-arrow.open { transform: rotate(90deg); }
.toggle-body { flex: 1; }
.toggle-title { font-weight: 600; color: #e3e5e8; }
.toggle-ta {
  display: block; width: 100%; box-sizing: border-box; background: rgba(255,255,255,.03);
  border: none; border-left: 2px solid #3f4147; outline: none; color: #b9bbbe;
  font-family: inherit; font-size: 14px; line-height: 1.7; padding: 6px 12px;
  resize: none; min-height: 56px; border-radius: 0 4px 4px 0; margin-top: 4px; caret-color: #5865f2;
}
.toggle-ta::placeholder { color: #3f4147; }

/* 콜아웃 */
.b-callout {
  display: flex; align-items: flex-start; gap: 12px; flex: 1;
  border-radius: 8px; padding: 10px 14px; margin: 2px 0; border: 1px solid;
}
.callout-important { background: rgba(250,219,77,.06); border-color: rgba(250,219,77,.2); }
.callout-important .editable { color: #fce77d; }
.callout-info      { background: rgba(59,130,246,.06); border-color: rgba(59,130,246,.2); }
.callout-info .editable      { color: #93c5fd; }
.callout-warning   { background: rgba(249,115,22,.06); border-color: rgba(249,115,22,.2); }
.callout-warning .editable   { color: #fdba74; }
.callout-success   { background: rgba(34,197,94,.06);  border-color: rgba(34,197,94,.2); }
.callout-success .editable   { color: #86efac; }
.callout-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.callout-important .editable:empty::before { color: rgba(252,231,125,.3); }
.callout-info      .editable:empty::before { color: rgba(147,197,253,.3); }
.callout-warning   .editable:empty::before { color: rgba(253,186,116,.3); }
.callout-success   .editable:empty::before { color: rgba(134,239,172,.3); }

/* 하단 추가 영역 */
.add-zone { min-height: 80px; display: flex; align-items: flex-start; padding-top: 10px; cursor: text; }
.add-zone:hover .add-hint { opacity: 1; }
.add-hint { font-size: 13px; color: #2e3035; opacity: 0; transition: opacity .2s; user-select: none; }

/* 애니메이션 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toggle-expand-enter-active { animation: expandDown .2s ease; }
.toggle-expand-leave-active { animation: expandDown .15s ease reverse; }
@keyframes expandDown {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 400px; }
}
</style>

<!-- 슬래시 메뉴 전역 스타일 (Teleport to body) -->
<style>
.slash-menu {
  position: fixed; z-index: 9999;
  background: #2b2d31; border: 1px solid #3f4147;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.3);
  width: 292px; max-height: 420px; overflow-y: auto; padding: 6px;
}
.slash-menu::-webkit-scrollbar { width: 4px; }
.slash-menu::-webkit-scrollbar-thumb { background: #3f4147; border-radius: 2px; }
.sm-header {
  font-size: 10px; font-weight: 700; color: #72767d;
  text-transform: uppercase; letter-spacing: .08em; padding: 6px 10px 4px;
}
.sm-query { color: #5865f2; font-size: 10px; text-transform: none; letter-spacing: 0; font-weight: 500; }
.sm-list  { display: flex; flex-direction: column; gap: 1px; }
.sm-item {
  display: flex; align-items: center; gap: 12px;
  padding: 7px 10px; border-radius: 6px; cursor: pointer; transition: background .1s;
}
.sm-item:hover, .sm-item--on { background: rgba(88,101,242,.2); }
.sm-icon {
  width: 34px; height: 34px; flex-shrink: 0; background: #1e1f22; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #b9bbbe; font-family: 'JetBrains Mono', monospace;
}
.sm-name { font-size: 13.5px; font-weight: 500; color: #e3e5e8; }
.sm-desc { font-size: 11px; color: #72767d; margin-top: 1px; }
.sm-empty { padding: 14px 10px; font-size: 13px; color: #4f545c; text-align: center; }
.menu-slide-enter-active { animation: menuIn .14s ease-out; }
.menu-slide-leave-active { animation: menuIn .1s ease-in reverse; }
@keyframes menuIn {
  from { opacity: 0; transform: translateY(-6px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>