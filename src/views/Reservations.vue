<template>
  <div class="reservations-view">
    <div class="page-header">
      <h1>Управление бронированиями</h1>
      <div class="header-actions">
        <el-button type="success" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          Новое бронирование
        </el-button>
      </div>
    </div>

    <!-- Поисковая панель -->
    <div class="search-panel">
      <div class="search-inputs">
        <el-input
          v-model="carSearch"
          placeholder="Поиск по номеру авто..."
          style="width: 300px"
          @keyup.enter="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Van /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="ownerSearch"
          placeholder="Поиск по ФИО владельца..."
          style="width: 300px"
          @keyup.enter="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="handleSearch">
          <el-icon><SearchIcon /></el-icon>
          Поиск
        </el-button>

        <el-button @click="clearSearch"> Сбросить </el-button>
      </div>
    </div>

    <!-- Фильтры статуса -->
    <div class="status-filters">
      <el-radio-group v-model="statusFilter" @change="applyFilters">
        <el-radio-button value="all">Все брони</el-radio-button>
        <el-radio-button value="active">Активные</el-radio-button>
        <el-radio-button value="completed">Завершенные</el-radio-button>
        <el-radio-button value="paid">Оплаченные</el-radio-button>
        <el-radio-button value="unpaid">Неоплаченные</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Статистика -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ activeReservationsCount }}</div>
            <div class="stat-label">Активных броней</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon paid">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ paidReservationsCount }}</div>
            <div class="stat-label">Оплаченных</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon unpaid">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ unpaidReservationsCount }}</div>
            <div class="stat-label">Неоплаченных</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Таблица бронирований -->
    <el-table
      v-loading="loading"
      :data="filteredReservations"
      style="width: 100%"
      stripe
      empty-text="Бронирования не найдены"
    >
      <el-table-column prop="id" label="ID" width="80" />

      <el-table-column label="Автомобиль" width="200">
        <template #default="{ row }">
          <div class="car-info">
            <div class="license-plate">{{ row.licensePlate }}</div>
            <div class="owner-name">{{ row.ownerName }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Парковочное место" width="150">
        <template #default="{ row }">
          <el-tag>{{ row.spotNumber }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Время" width="250">
        <template #default="{ row }">
          <div class="time-info">
            <div>Начало: {{ formatDateTime(row.startTime) }}</div>
            <div v-if="row.endTime">Конец: {{ formatDateTime(row.endTime) }}</div>
            <div v-else>
              <el-tag type="success" size="small">Активно</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Статус оплаты" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isPaid ? 'success' : 'warning'" size="small">
            {{ row.isPaid ? 'Оплачено' : 'Не оплачено' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="300" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
              v-if="!row.endTime"
              type="warning"
              size="small"
              @click="completeReservation(row.id)"
              :loading="completingId === row.id"
            >
              Завершить
            </el-button>
            <el-button v-else type="info" size="small" disabled> Завершено </el-button>

            <el-switch
              v-model="row.isPaid"
              :disabled="!row.endTime || row.isPaid"
              @change="updatePaymentStatus(row.id, row.isPaid)"
              style="margin-left: 10px"
            />

            <span v-if="row.isPaid" style="margin-left: 10px; color: #67c23a">
              <el-icon><CircleCheck /></el-icon>
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Диалог создания бронирования -->
    <el-dialog
      v-model="showCreateDialog"
      title="Новое бронирование"
      width="600px"
      @close="resetReservationForm"
    >
      <el-form
        ref="reservationFormRef"
        :model="reservationForm"
        :rules="reservationRules"
        label-width="140px"
      >
        <el-form-item label="Автомобиль" prop="carId">
          <el-select
            v-model="reservationForm.carId"
            placeholder="Выберите автомобиль"
            style="width: 100%"
            filterable
            clearable
            @change="onCarSelect"
          >
            <el-option
              v-for="car in availableCars"
              :key="car.id"
              :label="`${car.licensePlate} - ${car.ownerName}`"
              :value="car.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Парковочное место" prop="spotId">
          <el-select
            v-model="reservationForm.spotId"
            placeholder="Выберите место"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="spot in availableParkingSpots"
              :key="spot.id"
              :label="`${spot.spotNumber} ${spot.isOccupied ? '(Занято)' : '(Свободно)'}`"
              :value="spot.id"
              :disabled="spot.isOccupied"
            >
              <span :style="{ color: spot.isOccupied ? '#f56c6c' : '#67c23a' }">
                {{ spot.spotNumber }} {{ spot.isOccupied ? '(Занято)' : '(Свободно)' }}
              </span>
            </el-option>
          </el-select>
          <div class="spots-info">
            <el-tag v-if="availableParkingSpots.length > 0" type="success" size="small">
              Свободных мест: {{ availableParkingSpots.length }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="Информация" v-if="selectedCarInfo">
          <div class="info-box">
            <div><strong>Владелец:</strong> {{ selectedCarInfo.ownerName }}</div>
            <div><strong>Автомобиль:</strong> {{ selectedCarInfo.licensePlate }}</div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">Отмена</el-button>
          <el-button
            type="primary"
            @click="createReservation"
            :loading="creatingReservation"
            :disabled="!reservationForm.carId || !reservationForm.spotId"
          >
            Создать бронирование
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search as SearchIcon,
  Van,
  User,
  Timer,
  Money,
  Warning,
  CircleCheck,
} from '@element-plus/icons-vue'
import { useReservationsStore } from '@/stores/reservations'
import { useCarsStore } from '@/stores/cars'
import { useParkingSpotsStore } from '@/stores/parkingSpots'
import { formatDateTime } from '@/utils/formatters'

export default {
  name: 'ReservationsView',
  components: {
    Plus,
    SearchIcon,
    Van,
    User,
    Timer,
    Money,
    Warning,
    CircleCheck,
  },
  setup() {
    const route = useRoute()
    const reservationsStore = useReservationsStore()
    const carsStore = useCarsStore()
    const parkingSpotsStore = useParkingSpotsStore()
    const reservationFormRef = ref()

    // Состояние
    const loading = ref(false)
    const carSearch = ref('')
    const ownerSearch = ref('')
    const statusFilter = ref('active')
    const showCreateDialog = ref(false)
    const creatingReservation = ref(false)
    const completingId = ref(null)
    const selectedCarInfo = ref(null)

    // Форма бронирования
    const reservationForm = reactive({
      carId: null,
      spotId: null,
    })

    const reservationRules = {
      carId: [{ required: true, message: 'Выберите автомобиль', trigger: 'change' }],
      spotId: [{ required: true, message: 'Выберите парковочное место', trigger: 'change' }],
    }

    // Вычисляемые свойства
    const availableCars = computed(() => carsStore.cars)

    const availableParkingSpots = computed(() =>
      parkingSpotsStore.parkingSpots.filter((spot) => !spot.isOccupied),
    )

    const allReservations = computed(() => reservationsStore.reservations)

    const filteredReservations = computed(() => {
      let reservations = allReservations.value

      // Применяем фильтры статуса
      if (statusFilter.value === 'active') {
        reservations = reservations.filter((r) => !r.endTime)
      } else if (statusFilter.value === 'completed') {
        reservations = reservations.filter((r) => r.endTime)
      } else if (statusFilter.value === 'paid') {
        reservations = reservations.filter((r) => r.isPaid)
      } else if (statusFilter.value === 'unpaid') {
        reservations = reservations.filter((r) => !r.isPaid && r.endTime)
      }

      return reservations
    })

    const activeReservationsCount = computed(
      () => allReservations.value.filter((r) => !r.endTime).length,
    )

    const paidReservationsCount = computed(
      () => allReservations.value.filter((r) => r.isPaid).length,
    )

    const unpaidReservationsCount = computed(
      () => allReservations.value.filter((r) => !r.isPaid && r.endTime).length,
    )

    // Хуки жизненного цикла
    onMounted(async () => {
      await loadInitialData()

      // Проверяем query параметры для пре-заполнения формы
      const carId = route.query.carId
      const spotId = route.query.spotId

      if (carId) {
        reservationForm.carId = parseInt(carId)
        const car = carsStore.cars.find((c) => c.id === parseInt(carId))
        if (car) {
          selectedCarInfo.value = {
            ownerName: car.ownerName,
            licensePlate: car.licensePlate,
          }
        }
      }

      if (spotId) {
        reservationForm.spotId = parseInt(spotId)
      }
    })

    // Методы
    async function loadInitialData() {
      loading.value = true
      try {
        await Promise.all([
          reservationsStore.fetchReservations(),
          carsStore.fetchCars(),
          parkingSpotsStore.fetchParkingSpots(),
        ])
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        ElMessage.error('Ошибка при загрузке данных')
      } finally {
        loading.value = false
      }
    }

    async function handleSearch() {
      if (carSearch.value.trim() || ownerSearch.value.trim()) {
        loading.value = true
        try {
          if (carSearch.value.trim()) {
            await reservationsStore.searchByCar(carSearch.value)
          } else if (ownerSearch.value.trim()) {
            await reservationsStore.searchByOwner(ownerSearch.value)
          }
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          ElMessage.error('Ошибка при поиске')
        } finally {
          loading.value = false
        }
      } else {
        await reservationsStore.fetchReservations()
      }
    }

    function clearSearch() {
      carSearch.value = ''
      ownerSearch.value = ''
      reservationsStore.fetchReservations()
    }

    function applyFilters() {
      // Фильтрация уже реализована через computed свойство
      // Это событие нужно для обновления UI при изменении радио-кнопок
    }

    function onCarSelect(carId) {
      const car = availableCars.value.find((c) => c.id === carId)
      selectedCarInfo.value = car
        ? {
            ownerName: car.ownerName,
            licensePlate: car.licensePlate,
          }
        : null
    }

    async function createReservation() {
      const valid = await reservationFormRef.value.validate()
      if (!valid) return

      creatingReservation.value = true
      try {
        await reservationsStore.createReservation({
          carId: reservationForm.carId,
          spotId: reservationForm.spotId,
        })

        ElMessage.success('Бронирование успешно создано')
        showCreateDialog.value = false
        resetReservationForm()

        // Обновляем данные
        await Promise.all([
          reservationsStore.fetchReservations(),
          parkingSpotsStore.fetchParkingSpots(),
        ])
      } catch (error) {
        if (error.response?.data) {
          ElMessage.error(`Ошибка: ${error.response.data}`)
        } else {
          ElMessage.error('Ошибка при создании бронирования')
        }
      } finally {
        creatingReservation.value = false
      }
    }

    async function completeReservation(id) {
      completingId.value = id
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите завершить это бронирование?',
          'Подтверждение завершения',
          {
            confirmButtonText: 'Завершить',
            cancelButtonText: 'Отмена',
            type: 'warning',
          },
        )

        await reservationsStore.completeReservation(id)
        ElMessage.success('Бронирование завершено')

        // Обновляем данные
        await Promise.all([
          reservationsStore.fetchReservations(),
          parkingSpotsStore.fetchParkingSpots(),
        ])
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка при завершении бронирования')
        }
      } finally {
        completingId.value = null
      }
    }

    async function updatePaymentStatus(id, isPaid) {
      try {
        await reservationsStore.updatePaymentStatus(id, isPaid)
        ElMessage.success('Статус оплаты обновлен')
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        ElMessage.error('Ошибка при обновлении статуса оплаты')
      }
    }

    function resetReservationForm() {
      reservationFormRef.value?.resetFields()
      reservationForm.carId = null
      reservationForm.spotId = null
      selectedCarInfo.value = null
    }

    return {
      // Состояние
      loading,
      carSearch,
      ownerSearch,
      statusFilter,
      showCreateDialog,
      creatingReservation,
      completingId,
      selectedCarInfo,

      // Форма
      reservationForm,
      reservationRules,
      reservationFormRef,

      // Данные
      availableCars,
      availableParkingSpots,
      filteredReservations,

      // Статистика
      activeReservationsCount,
      paidReservationsCount,
      unpaidReservationsCount,

      // Методы
      handleSearch,
      clearSearch,
      applyFilters,
      onCarSelect,
      createReservation,
      completeReservation,
      updatePaymentStatus,
      resetReservationForm,
      formatDateTime,
    }
  },
}
</script>

<style scoped>
@import '../assets/reservations.css';
</style>
