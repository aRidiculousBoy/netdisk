class LocalCache {
  getCache(key) {
    return JSON.parse(localStorage.getItem(key))
  }

  setCache(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  removeCache(key) {
    localStorage.removeItem(key)
  }

  clearCache() {
    localStorage.clear()
  }
}

export default new LocalCache()