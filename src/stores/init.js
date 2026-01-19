import { useOwnersStore } from './owners'
import { useCarsStore } from './cars'
import { useParkingSpotsStore } from './parkingSpots'
import { useReservationsStore } from './reservations'

export async function initializeStores() {
  console.log('Инициализация хранилищ...')

  try {
    // Загружаем данные параллельно для скорости
    await Promise.allSettled([
      useOwnersStore().initialize(),
      useCarsStore().initialize(),
      useParkingSpotsStore().initialize(),
      useReservationsStore().initialize(),
    ])

    console.log('Хранилища инициализированы')
    return true
  } catch (error) {
    console.error('Ошибка инициализации хранилищ:', error)
    return false
  }
}
