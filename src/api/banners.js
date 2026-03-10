import request from '@/api/request.js'

export function getBanners(onlyEnabled = true) {
  return request({
    url: '/banners',
    method: 'get',
    params: onlyEnabled ? {} : { enabled: 'false' },
  })
}

export function getBannerById(id) {
  return request({
    url: `/banners/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

export function createBanner(data) {
  return request({
    url: '/banners',
    method: 'post',
    data,
  })
}

export function updateBanner(id, data) {
  return request({
    url: `/banners/${encodeURIComponent(id)}`,
    method: 'put',
    data,
  })
}

export function deleteBanner(id) {
  return request({
    url: `/banners/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
