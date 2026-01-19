import { defineStore } from 'pinia'
import { parkingSpotApi } from '@/api/parkingSpots'

export const useParkingSpotsStore = defineStore('parkingSpots', {
  state: () => ({
    parkingSpots: [],
    currentParkingSpot: null,
    loading: false,
    error: null,
  }),

  getters: {
    availableSpots: (state) => state.parkingSpots.filter((spot) => !spot.isOccupied),
    occupiedSpots: (state) => state.parkingSpots.filter((spot) => spot.isOccupied),
  },

  actions: {
    async fetchParkingSpots() {
      this.loading = true
      try {
        const response = await parkingSpotApi.getAll()
        this.parkingSpots = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async searchParkingSpotsByNumber(spotNumber) {
      this.loading = true
      try {
        const response = await parkingSpotApi.searchBySpotNumber(spotNumber)
        this.parkingSpots = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createParkingSpot(parkingSpot) {
      try {
        const response = await parkingSpotApi.create(parkingSpot)
        this.parkingSpots.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateParkingSpot(id, parkingSpot) {
      try {
        const response = await parkingSpotApi.update(id, parkingSpot)
        const index = this.parkingSpots.findIndex((spot) => spot.id === id)
        if (index !== -1) {
          this.parkingSpots[index] = { ...this.parkingSpots[index], ...response.data }
        }
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteParkingSpot(id) {
      try {
        await parkingSpotApi.delete(id)
        this.parkingSpots = this.parkingSpots.filter((spot) => spot.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})
