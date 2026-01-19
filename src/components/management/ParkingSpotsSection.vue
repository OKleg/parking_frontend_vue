<template>
  <div class="parking-spots-section">
    <div class="section-header">
      <h3>Управление парковочными местами</h3>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Поиск по номеру места..."
          style="width: 300px"
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><SearchIcon /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><PlusIcon /></el-icon>
          Добавить место
        </el-button>
      </div>
    </div>

    <!-- Статистика мест -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon available">
            <el-icon><CircleCheckIcon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ availableSpotsCount }}</div>
            <div class="stat-label">Свободных мест</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon occupied">
            <el-icon><CircleCloseIcon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ occupiedSpotsCount }}</div>
            <div class="stat-label">Занятых мест</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><LocationIcon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalSpotsCount }}</div>
            <div class="stat-label">Всего мест</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Таблица парковочных мест -->
    <el-table
      v-loading="loading"
      :data="parkingSpots"
      style="width: 100%"
      stripe
      empty-text="Парковочные места не найдены"
    >
      <el-table-column prop="spotNumber" label="Номер места" width="120" />
      <el-table-column label="Статус" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isOccupied ? 'danger' : 'success'" size="small">
            {{ row.isOccupied ? 'Занято' : 'Свободно' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="editSpot(row)" title="Редактировать">
              <el-icon><EditIcon /></el-icon>
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteSpot(row.id)"
              :disabled="row.isOccupied"
              title="Удалить"
            >
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Диалог создания/редактирования места -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Редактировать парковочное место' : 'Добавить парковочное место'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Номер места" prop="spotNumber">
          <el-input v-model="form.spotNumber" placeholder="Введите номер места" maxlength="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">Отмена</el-button>
          <el-button type="primary" @click="submitForm">
            {{ isEditing ? 'Обновить' : 'Создать' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Location as LocationIcon,
  CircleCheck as CircleCheckIcon,
  CircleClose as CircleCloseIcon,
} from '@element-plus/icons-vue'
import { useParkingSpotsStore } from '@/stores/parkingSpots'

export default {
  name: 'ParkingSpotsSection',
  components: {
    SearchIcon,
    PlusIcon,
    EditIcon,
    DeleteIcon,
    LocationIcon,
    CircleCheckIcon,
    CircleCloseIcon,
  },
  setup() {
    const parkingSpotsStore = useParkingSpotsStore()
    const formRef = ref()

    const loading = ref(false)
    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const isEditing = ref(false)
    const editingId = ref(null)

    const form = reactive({
      spotNumber: '',
    })

    const rules = {
      spotNumber: [
        { required: true, message: 'Введите номер места', trigger: 'blur' },
        { min: 1, message: 'Номер места должен содержать минимум 1 символ', trigger: 'blur' },
      ],
    }

    // Вычисляемые свойства для статистики
    const totalSpotsCount = computed(() => parkingSpotsStore.parkingSpots.length)
    const availableSpotsCount = computed(() => parkingSpotsStore.availableSpots.length)
    const occupiedSpotsCount = computed(() => parkingSpotsStore.occupiedSpots.length)

    onMounted(() => {
      fetchParkingSpots()

      // Слушаем события выбора автомобиля для брони
      window.addEventListener('car-selected-for-reservation', handleCarSelectedForReservation)
    })

    onUnmounted(() => {
      window.removeEventListener('car-selected-for-reservation', handleCarSelectedForReservation)
    })

    function handleCarSelectedForReservation(event) {
      // Можно показать диалог бронирования с предвыбранным авто
      console.log('Автомобиль выбран для брони:', event.detail)
    }

    async function fetchParkingSpots() {
      loading.value = true
      try {
        await parkingSpotsStore.fetchParkingSpots()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при загрузке парковочных мест')
      } finally {
        loading.value = false
      }
    }

    async function handleSearch() {
      if (searchQuery.value.trim()) {
        loading.value = true
        try {
          await parkingSpotsStore.searchParkingSpotsByNumber(searchQuery.value)
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          ElMessage.error('Ошибка при поиске')
        } finally {
          loading.value = false
        }
      } else {
        fetchParkingSpots()
      }
    }

    function editSpot(spot) {
      isEditing.value = true
      editingId.value = spot.id
      form.spotNumber = spot.spotNumber
      showCreateDialog.value = true
    }

    async function deleteSpot(id) {
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите удалить это парковочное место?',
          'Подтверждение удаления',
          {
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            type: 'warning',
          },
        )

        await parkingSpotsStore.deleteParkingSpot(id)
        ElMessage.success('Парковочное место успешно удалено')
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error('Ошибка при удалении парковочного места')
        }
      }
    }

    function createReservationForSpot(spot) {
      const event = new CustomEvent('spot-selected-for-reservation', {
        detail: { spotId: spot.id, spotNumber: spot.spotNumber },
      })
      window.dispatchEvent(event)
    }

    async function submitForm() {
      const valid = await formRef.value.validate()
      if (!valid) return

      try {
        if (isEditing.value) {
          await parkingSpotsStore.updateParkingSpot(editingId.value, {
            spotNumber: form.spotNumber,
          })
          ElMessage.success('Парковочное место успешно обновлено')
        } else {
          await parkingSpotsStore.createParkingSpot({
            spotNumber: form.spotNumber,
          })
          ElMessage.success('Парковочное место успешно создано')
        }

        showCreateDialog.value = false
        resetForm()
        fetchParkingSpots()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при сохранении парковочного места')
      }
    }

    function resetForm() {
      formRef.value?.resetFields()
      form.spotNumber = ''
      isEditing.value = false
      editingId.value = null
    }

    return {
      loading,
      searchQuery,
      showCreateDialog,
      isEditing,
      form,
      rules,
      formRef,
      totalSpotsCount,
      availableSpotsCount,
      occupiedSpotsCount,
      parkingSpots: parkingSpotsStore.parkingSpots,
      fetchParkingSpots,
      handleSearch,
      editSpot,
      deleteSpot,
      createReservationForSpot,
      submitForm,
      resetForm,
    }
  },
}
</script>

<style scoped>
.parking-spots-section {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.available {
  background-color: #f0f9eb;
  color: #67c23a;
}

.stat-icon.occupied {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-icon.total {
  background-color: #f4f4f5;
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
