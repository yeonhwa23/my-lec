// src/stores/workspaceStore.js
// 워크스페이스 상태 관리 (Pinia)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import workspaceApi from '@/util/api/workspaceApi'

export const useWorkspaceStore = defineStore('workspace', () => {

  // ── State ─────────────────────────────────────────────────────────
  /** 내가 속한 워크스페이스 목록 */
  const workspaceList = ref([])

  /** 현재 입장한 워크스페이스 */
  const currentWorkspace = ref(null)  // { workspaceId, wsName, slug, iconUrl, ... }

  /** 현재 워크스페이스 멤버 목록 */
  const memberList = ref([])

  /** 로딩 상태 */
  const loading = ref(false)

  // ── Getters ───────────────────────────────────────────────────────
  /** 현재 워크스페이스 ID (편의용) */
  const currentWorkspaceId = computed(() => currentWorkspace.value?.workspaceId ?? null)

  // ── Actions ───────────────────────────────────────────────────────

  /**
   * 내 워크스페이스 목록 불러오기 (로그인 직후 / GNB 마운트 시 호출)
   */
  async function fetchMyWorkspaces() {
    loading.value = true
    try {
      // ✅ 중괄호 제거 완료
      const data = await workspaceApi.getMyList()
      // data가 없으면(null/undefined) 빈 배열로 덮어쓰기
      workspaceList.value = data || [] 
    } catch (e) {
      console.error('[workspaceStore] 목록 조회 실패', e)
      // 에러가 났을 때도 undefined가 되지 않게 빈 배열로 리셋
      workspaceList.value = [] 
    } finally {
      loading.value = false
    }
  }

  /**
   * 워크스페이스 생성
   * 성공 시 목록에 추가하고 해당 워크스페이스로 입장 처리
   */
  async function createWorkspace(formData) {
    // ✅ 중괄호 제거 완료
    const data = await workspaceApi.create(formData)
    workspaceList.value.unshift(data)   // 목록 맨 앞에 추가
    setCurrentWorkspace(data)
    return data
  }

  /**
   * 슬러그 중복 확인
   * @returns {Promise<boolean>} true: 사용 가능
   */
  async function checkSlug(slug) {
    try {
      // ✅ 중괄호 제거 완료
      const data = await workspaceApi.checkSlug(slug)
      return data.available
    } catch (error) {
      console.error('[workspaceStore] 슬러그 중복 확인 실패:', error)
      // 서버 에러(502 등)가 나면 일단 사용 불가능한 것으로 안전하게 처리
      return false 
    }
  }

  /**
   * 초대 링크(슬러그)로 참여
   */
  async function joinBySlug(slug) {
    // ✅ 중괄호 제거 완료
    const data = await workspaceApi.joinBySlug(slug)
    // 이미 목록에 없으면 추가
    const exists = workspaceList.value.some(w => w.workspaceId === data.workspaceId)
    if (!exists) workspaceList.value.push(data)
    setCurrentWorkspace(data)
    return data
  }

  /**
   * 현재 입장 워크스페이스 설정 + 멤버 목록 갱신
   */
  async function setCurrentWorkspace(workspace) {
    currentWorkspace.value = workspace
    await fetchMembers(workspace.workspaceId)
  }

  /**
   * 멤버 목록 조회
   */
  async function fetchMembers(workspaceId) {
    // ✅ 중괄호 제거 완료
    const data = await workspaceApi.getMembers(workspaceId)
    memberList.value = data
  }

  /**
   * 멤버 강퇴
   */
  async function kickMember(targetMemberId) {
    await workspaceApi.kickMember(currentWorkspaceId.value, targetMemberId)
    memberList.value = memberList.value.filter(m => m.memberId !== targetMemberId)
  }

  /**
   * 멤버 역할 변경
   */
  async function updateMemberRole(targetMemberId, newRole) {
    await workspaceApi.updateRole(currentWorkspaceId.value, { targetMemberId, newRole })
    const target = memberList.value.find(m => m.memberId === targetMemberId)
    if (target) target.wsRole = newRole
  }

  return {
    // state
    workspaceList,
    currentWorkspace,
    memberList,
    loading,
    // getters
    currentWorkspaceId,
    // actions
    fetchMyWorkspaces,
    createWorkspace,
    checkSlug,
    joinBySlug,
    setCurrentWorkspace,
    fetchMembers,
    kickMember,
    updateMemberRole,
  }
})