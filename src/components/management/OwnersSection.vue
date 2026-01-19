<template>
  <div class="owners-section">
    <div v-if="loading && displayOwners.length === 0" class="section-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>Загрузка владельцев...</span>
    </div>
    <div class="section-header">
      <h3>Управление владельцами</h3>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Поиск по ФИО..."
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
          Добавить владельца
        </el-button>
      </div>
    </div>

    <!-- Таблица владельцев -->
    <el-table
      v-loading="loading"
      :data="displayOwners"
      style="width: 100%"
      stripe
      empty-text="Владельцы не найдены"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="fullName" label="ФИО" />
      <el-table-column prop="createdAt" label="Дата регистрации" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="editOwner(row)" title="Редактировать">
              <el-icon><EditIcon /></el-icon>
            </el-button>
            <el-button type="danger" size="small" @click="deleteOwner(row.id)" title="Удалить">
              <el-icon><DeleteIcon /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Диалог создания/редактирования -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? 'Редактировать владельца' : 'Добавить владельца'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="ФИО" prop="fullName">
          <el-input
            v-model="form.fullName"
            placeholder="Введите полное имя"
            maxlength="100"
            show-word-limit
          />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@element-plus/icons-vue'
import { useOwnersStore } from '@/stores/owners'
import { formatDate } from '@/utils/formatters'

export default {
  name: 'OwnersSection',
  components: {
    SearchIcon,
    PlusIcon,
    EditIcon,
    DeleteIcon,
  },
  setup() {
    const ownersStore = useOwnersStore()
    const formRef = ref()

    const loading = ref(false)
    const searchQuery = ref('')
    const showCreateDialog = ref(false)
    const isEditing = ref(false)
    const editingId = ref(null)

    const form = reactive({
      fullName: '',
    })

    const rules = {
      fullName: [
        { required: true, message: 'Введите ФИО владельца', trigger: 'blur' },
        { min: 2, message: 'ФИО должно содержать минимум 2 символа', trigger: 'blur' },
      ],
    }

    const displayOwners = computed(() => {
      const filterOwners = ownersStore.owners || []

      if (!searchQuery.value || searchQuery.value.trim() === '') {
        return filterOwners
      }

      const query = searchQuery.value.toLowerCase().trim()
      return filterOwners.filter(
        (owner) => owner.fullName && owner.fullName.toLowerCase().includes(query),
      )
    })

    onMounted(() => {
      fetchOwners()
    })

    async function fetchOwners() {
      loading.value = true
      try {
        await ownersStore.fetchOwners()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при загрузке владельцев')
      } finally {
        loading.value = false
      }
    }

    async function handleSearch() {
      // if (searchQuery.value.trim()) {
      //   loading.value = true
      //   try {
      //     await ownersStore.searchOwnersByName(searchQuery.value)
      //     ownersStore.filteredOwners = []
      //     // eslint-disable-next-line no-unused-vars
      //   } catch (err) {
      //     ElMessage.error('Ошибка при поиске')
      //   } finally {
      //     loading.value = false
      //   }
      // } else {
      //   fetchOwners()
      // }
    }

    function editOwner(owner) {
      isEditing.value = true
      editingId.value = owner.id
      form.fullName = owner.fullName
      showCreateDialog.value = true
    }

    async function deleteOwner(id) {
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите удалить этого владельца?',
          'Подтверждение удаления',
          {
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            type: 'warning',
          },
        )

        await ownersStore.deleteOwner(id)
        ElMessage.success('Владелец успешно удален')
      } catch (err) {
        if (err !== 'cancel') {
          ElMessage.error('Ошибка при удалении владельца')
        }
      }
    }

    async function submitForm() {
      const valid = await formRef.value.validate()
      if (!valid) return

      try {
        if (isEditing.value) {
          await ownersStore.updateOwner(editingId.value, { fullName: form.fullName })
          ElMessage.success('Владелец успешно обновлен')
        } else {
          await ownersStore.createOwner({ fullName: form.fullName })
          ElMessage.success('Владелец успешно создан')
        }

        showCreateDialog.value = false
        resetForm()
        fetchOwners()
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        ElMessage.error('Ошибка при сохранении владельца')
      }
    }

    function resetForm() {
      formRef.value?.resetFields()
      form.fullName = ''
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
      displayOwners, //ownersStore.owners,
      fetchOwners,
      handleSearch,
      editOwner,
      deleteOwner,
      submitForm,
      resetForm,
      formatDate,
    }
  },
}
</script>

<style scoped>
.owners-section {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.section-loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-icon {
  font-size: 30px;
  margin-bottom: 10px;
  display: block;
  margin: 0 auto 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
