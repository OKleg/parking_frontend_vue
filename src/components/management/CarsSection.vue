<template>
  <div class="cars-section">
    <div class="section-header">
      <h3>Управление автомобилями</h3>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Поиск по номеру авто..."
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
          Добавить автомобиль
        </el-button>
      </div>
    </div>

    <!-- Фильтр по владельцу -->
    <div v-if="selectedOwner" class="owner-filter">
      <el-tag type="info" closable @close="clearOwnerFilter">
        <el-icon><UserIcon /></el-icon>
        Автомобили владельца: {{ selectedOwner.name }}
      </el-tag>
    </div>

    <!-- Таблица автомобилей -->
    <el-table
      v-loading="loading"
      :data="cars"
      style="width: 100%"
      stripe
      empty-text="Автомобили не найдены"
    >
      <el-table-column prop="licensePlate" label="Номер" width="120" />
      <el-table-column prop="ownerName" label="Владелец" />
      <el-table-column prop="createdAt" label="Дата регистрации" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="editCar(row)" title="Редактировать">
              <el-icon><EditIcon /></el-icon>
            </el-button>
            <el-button type="danger" size="small" @click="deleteCar(row.id)" title="Удалить">
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Диалог создания/редактирования автомобиля -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Редактировать автомобиль' : 'Добавить автомобиль'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Номер авто" prop="licensePlate">
          <el-input v-model="form.licensePlate" placeholder="Введите номер авто" maxlength="20" />
        </el-form-item>

        <el-form-item label="Владелец" prop="ownerId">
          <el-select
            v-model="form.ownerId"
            placeholder="Выберите владельца"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="owner in owners"
              :key="owner.id"
              :label="owner.fullName"
              :value="owner.id"
            />
          </el-select>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  User as UserIcon,
} from '@element-plus/icons-vue'
import { useCarsStore } from '@/stores/cars'
import { useOwnersStore } from '@/stores/owners'
import { formatDate } from '@/utils/formatters'

export default {
  name: 'CarsSection',
  components: {
    SearchIcon,
    PlusIcon,
    EditIcon,
    DeleteIcon,
    UserIcon,
  },
  setup() {
    const carsStore = useCarsStore()
    const ownersStore = useOwnersStore()
    const formRef = ref()

    const loading = ref(false)
    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const isEditing = ref(false)
    const editingId = ref(null)
    const selectedOwner = ref(null)

    const form = reactive({
      licensePlate: '',
      ownerId: null,
    })

    const rules = {
      licensePlate: [
        { required: true, message: 'Введите номер авто', trigger: 'blur' },
        { min: 2, message: 'Номер должен содержать минимум 2 символа', trigger: 'blur' },
      ],
      ownerId: [{ required: true, message: 'Выберите владельца', trigger: 'change' }],
    }

    onMounted(async () => {
      await loadOwners()
      fetchCars()

      // Слушаем события выбора владельца
      window.addEventListener('owner-selected', handleOwnerSelected)
    })

    onUnmounted(() => {
      window.removeEventListener('owner-selected', handleOwnerSelected)
    })

    function handleOwnerSelected(event) {
      const { ownerId, ownerName } = event.detail
      selectedOwner.value = { id: ownerId, name: ownerName }
      filterCarsByOwner(ownerId)
    }

    async function loadOwners() {
      try {
        await ownersStore.fetchOwners()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при загрузке владельцев')
      }
    }

    async function fetchCars() {
      loading.value = true
      try {
        await carsStore.fetchCars()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при загрузке автомобилей')
      } finally {
        loading.value = false
      }
    }

    async function filterCarsByOwner(ownerId) {
      loading.value = true
      try {
        await carsStore.fetchCars()
        carsStore.cars = carsStore.cars.filter((car) => car.ownerId === ownerId)
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при фильтрации автомобилей')
      } finally {
        loading.value = false
      }
    }

    async function handleSearch() {
      if (searchQuery.value.trim()) {
        loading.value = true
        try {
          await carsStore.searchCarsByLicensePlate(searchQuery.value)
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          ElMessage.error('Ошибка при поиске')
        } finally {
          loading.value = false
        }
      } else {
        fetchCars()
      }
    }

    function editCar(car) {
      isEditing.value = true
      editingId.value = car.id
      form.licensePlate = car.licensePlate
      form.ownerId = car.ownerId
      showCreateDialog.value = true
    }

    async function deleteCar(id) {
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите удалить этот автомобиль?',
          'Подтверждение удаления',
          {
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            type: 'warning',
          },
        )

        await carsStore.deleteCar(id)
        ElMessage.success('Автомобиль успешно удален')
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error('Ошибка при удалении автомобиля')
        }
      }
    }

    function createReservationForCar(car) {
      const event = new CustomEvent('car-selected-for-reservation', {
        detail: { carId: car.id, licensePlate: car.licensePlate },
      })
      window.dispatchEvent(event)
    }

    function clearOwnerFilter() {
      selectedOwner.value = null
      fetchCars()
    }

    async function submitForm() {
      const valid = await formRef.value.validate()
      if (!valid) return

      try {
        if (isEditing.value) {
          await carsStore.updateCar(editingId.value, {
            licensePlate: form.licensePlate,
            ownerId: form.ownerId,
          })
          ElMessage.success('Автомобиль успешно обновлен')
        } else {
          await carsStore.createCar({
            licensePlate: form.licensePlate,
            ownerId: form.ownerId,
          })
          ElMessage.success('Автомобиль успешно создан')
        }

        showCreateDialog.value = false
        resetForm()
        fetchCars()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при сохранении автомобиля')
      }
    }

    function resetForm() {
      formRef.value?.resetFields()
      form.licensePlate = ''
      form.ownerId = null
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
      selectedOwner,
      owners: ownersStore.owners,
      cars: carsStore.cars,
      fetchCars,
      handleSearch,
      editCar,
      deleteCar,
      createReservationForCar,
      clearOwnerFilter,
      submitForm,
      resetForm,
      formatDate,
    }
  },
}
</script>

<style scoped>
.cars-section {
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

.owner-filter {
  margin-bottom: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
