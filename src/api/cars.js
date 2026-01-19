import apiClient from './index'

export const carApi = {
  getAll() {
    return apiClient.get('/cars')
  },

  getById(id) {
    return apiClient.get(`/cars/${id}`)
  },

  searchByLicensePlate(licensePlate) {
    return apiClient.get('/cars/search', {
      params: { query: licensePlate },
    })
  },

  create(car) {
    return apiClient.post('/cars', car)
  },

  update(id, car) {
    return apiClient.put(`/cars/${id}`, car)
  },

  delete(id) {
    return apiClient.delete(`/cars/${id}`)
  },
}
