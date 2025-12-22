/**
 * 입력값 검증 유틸리티
 */

// 유효한 양의 정수인지 확인
export const isValidPositiveInt = (value: unknown): boolean => {
  const num = Number(value)
  return !isNaN(num) && Number.isInteger(num) && num > 0
}

// 문자열 길이 제한 상수
export const MAX_NAME_LENGTH = 50
export const MAX_EMOJI_LENGTH = 4
export const MAX_DESCRIPTION_LENGTH = 200
export const MAX_URL_LENGTH = 500
export const MAX_HISTORY_LIMIT = 100
