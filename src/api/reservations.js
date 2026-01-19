import apiClient from './index'

export const reservationApi = {
  getAll() {
    return apiClient.get('/reservations/all')
  },

  getActive() {
    return apiClient.get('/reservations')
  },

  getById(id) {
    return apiClient.get(`/reservations/${id}`)
  },

  searchByCar(licensePlate) {
    return apiClient.get('/reservations/search-by-car', {
      params: { licensePlate },
    })
  },

  searchByOwner(ownerName) {
    return apiClient.get('/reservations/search-by-owner', {
      params: { ownerName },
    })
  },

  create(reservation) {
    return apiClient.post('/reservations', reservation)
  },

  markAsPaid(id) {
    return apiClient.post(`/reservations/${id}/pay`)
  },

  complete(id) {
    return apiClient.post(`/reservations/${id}/complete`)
  },
}
