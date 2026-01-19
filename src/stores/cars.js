import { defineStore } from 'pinia'
import { carApi } from '@/api/cars'

export const useCarsStore = defineStore('cars', {
  state: () => ({
    cars: [],
    currentCar: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCars() {
      this.loading = true
      try {
        const response = await carApi.getAll()
        this.cars = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async searchCarsByLicensePlate(licensePlate) {
      this.loading = true
      this.searchQuery = licensePlate

      try {
        const response = await carApi.searchByLicensePlate(licensePlate)
        this.cars = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createCar(car) {
      try {
        const response = await carApi.create(car)
        this.cars.push(response.data)
        await this.fetchCars()
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateCar(id, car) {
      try {
        const response = await carApi.update(id, car)
        const index = this.cars.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.cars[index] = { ...this.cars[index], ...response.data }
        }
        this.fetchCars()
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteCar(id) {
      try {
        await carApi.delete(id)
        this.cars = this.cars.filter((c) => c.id !== id)
        this.fetchCars()
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})
