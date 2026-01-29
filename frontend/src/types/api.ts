// API 通用响应类型

/**
 * 统一响应结构
 */
export interface ApiResponse<T = any> {
  success: boolean
  errorMsg: string | null
  data: T
  total: number | null
  // 以前的字段为了兼容暂时保留（或直接删除）
  code?: number
  message?: string
}

/**
 * 错误响应
 */
export interface ApiError {
  success: boolean
  errorMsg: string
}
