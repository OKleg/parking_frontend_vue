import { defineStore } from 'pinia'
import { ownerApi } from '@/api/owners'

export const useOwnersStore = defineStore('owners', {
  state: () => ({
    owners: [],
    currentOwner: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchOwners() {
      this.loading = true
      try {
        const response = await ownerApi.getAll()
        this.owners = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async searchOwnersByName(name) {
      this.loading = true
      try {
        const response = await ownerApi.searchByName(name)
        this.owners = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createOwner(owner) {
      try {
        const response = await ownerApi.create(owner)
        this.owners.push(response.data)

        await this.fetchOwners()
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateOwner(id, owner) {
      try {
        const response = await ownerApi.update(id, owner)
        const index = this.owners.findIndex((o) => o.id === id)
        if (index !== -1) {
          this.owners[index] = { ...this.owners[index], ...response.data }
        }
        await this.fetchOwners()
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteOwner(id) {
      try {
        await ownerApi.delete(id)
        this.owners = this.owners.filter((o) => o.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
  },
})
