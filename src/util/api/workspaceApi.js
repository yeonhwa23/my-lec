// src/util/api/workspaceApi.js
// 워크스페이스 관련 백엔드 API 호출 함수 모음

import http from '../http'

const BASE = '/workspaces'

const workspaceApi = {
  /**
   * 워크스페이스 생성
   * @param {{ wsName: string, slug: string, iconUrl?: string }} data
   */
  create(data) {
    return http.post(BASE, data)
  },

  /**
   * 내가 속한 워크스페이스 목록 조회
   */
  getMyList() {
    return http.get(BASE)
  },

  /**
   * 슬러그 중복 확인
   * @param {string} slug
   */
  checkSlug(slug) {
    return http.get(`${BASE}/check-slug`, { params: { slug } })
  },

  /**
   * 초대 링크(슬러그)로 워크스페이스 입장
   * @param {string} slug
   */
  joinBySlug(slug) {
    return http.post(`${BASE}/join`, { slug })
  },

  /**
   * 워크스페이스 멤버 목록 조회
   * @param {number} workspaceId
   */
  getMembers(workspaceId) {
    return http.get(`${BASE}/${workspaceId}/members`)
  },

  /**
   * 멤버 강퇴 (owner / admin만)
   * @param {number} workspaceId
   * @param {number} targetMemberId
   */
  kickMember(workspaceId, targetMemberId) {
    return http.delete(`${BASE}/${workspaceId}/members/${targetMemberId}`)
  },

  /**
   * 멤버 역할 변경 (owner만)
   * @param {number} workspaceId
   * @param {{ targetMemberId: number, newRole: string }} data
   */
  updateRole(workspaceId, data) {
    return http.patch(`${BASE}/${workspaceId}/members/role`, data)
  },
}

export default workspaceApi
