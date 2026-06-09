/**
 * 图片缓存工具
 * 缓存用户头像和系统图片 URL，避免重复请求
 */

const avatarCache = new Map<number, string>()
const imageCache = new Map<string, string>()
const MAX_CACHE = 200 // 最多缓存 200 个

// 清除最早缓存的条目
function evict(map: Map<any, string>) {
  if (map.size > MAX_CACHE) {
    const firstKey = map.keys().next().value
    map.delete(firstKey)
  }
}

export function getCachedAvatar(uid: number): string | null {
  return avatarCache.get(uid) || null
}

export function setCachedAvatar(uid: number, url: string) {
  evict(avatarCache)
  avatarCache.set(uid, url)
}

export function getCachedImage(url: string): string | null {
  return imageCache.get(url) || null
}

export function setCachedImage(key: string, url: string) {
  evict(imageCache)
  imageCache.set(key, url)
}

// 浏览器原生缓存：预加载图片到内存
const preloadSet = new Set<string>()
export function preloadImage(url: string): Promise<void> {
  if (preloadSet.has(url)) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => {
      preloadSet.add(url)
      resolve()
    }
    img.src = url
  })
}
