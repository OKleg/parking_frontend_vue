import apiClient from './index'

export const parkingSpotApi = {
  getAll() {
    return apiClient.get('/parking_spots')
  },

  getById(id) {
    return apiClient.get(`/parking_spots/${id}`)
  },

  searchBySpotNumber(spotNumber) {
    return apiClient.get('/parking_spots/search', {
      params: { query: spotNumber },
    })
  },

  create(parkingSpot) {
    return apiClient.post('/parking_spots', parkingSpot)
  },

  update(id, parkingSpot) {
    return apiClient.put(`/parking_spots/${id}`, parkingSpot)
  },

  delete(id) {
    return apiClient.delete(`/parking_spots/${id}`)
  },
}
