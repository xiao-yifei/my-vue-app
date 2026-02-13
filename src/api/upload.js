import request from '@/api/request.js'

/**
 * 单文件上传（需管理员）
 * @param {File} file
 * @returns {Promise<{ url: string, filename: string }>}
 */
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
  })
}

/**
 * 多文件上传（需管理员）
 * @param {File[]} files
 * @returns {Promise<{ urls: string[] }>}
 */
export function uploadFiles(files) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }
  return request({
    url: '/upload/multiple',
    method: 'post',
    data: formData,
  })
}
