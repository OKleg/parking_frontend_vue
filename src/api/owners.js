import apiClient from './index'

export const ownerApi = {
  getAll() {
    return apiClient.get('/owners')
  },

  getById(id) {
    return apiClient.get(`/owners/${id}`)
  },

  searchByName(name) {
    return apiClient.get('/owners/search', {
      params: { query: name },
    })
  },

  create(owner) {
    return apiClient.post('/owners', owner)
  },

  update(id, owner) {
    return apiClient.put(`/owners/${id}`, owner)
  },

  delete(id) {
    return apiClient.delete(`/owners/${id}`)
  },
}
