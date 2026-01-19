import { defineStore } from 'pinia'
import { reservationApi } from '@/api/reservations'

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    reservations: [],
    activeReservations: [],
    currentReservation: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeReservations: (state) => state.reservations.filter((r) => !r.endTime),
    completedReservations: (state) => state.reservations.filter((r) => r.endTime),
  },

  actions: {
    async fetchReservations() {
      this.loading = true
      try {
        const response = await reservationApi.getActive()
        this.reservations = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchAllReservations() {
      this.loading = true
      try {
        const response = await reservationApi.getAll()
        this.reservations = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async searchByCar(licensePlate) {
      this.loading = true
      try {
        const response = await reservationApi.searchByCar(licensePlate)
        this.reservations = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async searchByOwner(ownerName) {
      this.loading = true
      try {
        const response = await reservationApi.searchByOwner(ownerName)
        this.reservations = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createReservation(reservation) {
      try {
        const response = await reservationApi.create(reservation)
        this.reservations.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async completeReservation(id) {
      try {
        await reservationApi.complete(id)
        const reservation = this.reservations.find((r) => r.id === id)
        if (reservation) {
          reservation.endTime = new Date().toISOString()
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updatePaymentStatus(id, isPaid) {
      try {
        await reservationApi.markAsPaid(id)
        const reservation = this.reservations.find((r) => r.id === id)
        if (reservation) {
          reservation.isPaid = isPaid
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})
