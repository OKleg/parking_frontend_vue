<template>
  <div class="data-table">
    <!-- Панель инструментов -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button
            v-if="showCreateButton"
            type="primary"
            :icon="PlusIcon"
            @click="$emit('create')"
          >
            {{ createButtonText }}
          </el-button>
        </slot>
      </div>

      <div class="toolbar-right">
        <slot name="toolbar-right">
          <SearchBar
            v-if="showSearch"
            v-model="searchValue"
            :placeholder="searchPlaceholder"
            :width="searchWidth"
            :show-search-button="searchButton"
            @search="handleSearch"
            @clear="handleSearchClear"
          />

          <el-button v-if="showRefresh" :icon="RefreshIcon" circle @click="handleRefresh" />

          <el-dropdown v-if="showExport" trigger="click" @command="handleExport">
            <el-button :icon="DownloadIcon"> Экспорт </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="excel">Excel</el-dropdown-item>
                <el-dropdown-item command="csv">CSV</el-dropdown-item>
                <el-dropdown-item command="pdf">PDF</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </slot>
      </div>
    </div>

    <!-- Таблица -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :style="{ width: '100%', height: tableHeight }"
      :stripe="stripe"
      :border="border"
      :row-key="rowKey"
      :default-sort="defaultSort"
      :empty-text="emptyText"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @sort-change="handleSortChange"
    >
      <!-- Колонка выбора -->
      <el-table-column v-if="showSelection" type="selection" width="55" />

      <!-- Нумерация строк -->
      <el-table-column v-if="showIndex" type="index" :label="indexLabel" width="80" />

      <!-- Динамические колонки -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          v-bind="column"
          :align="column.align || 'left'"
          :sortable="column.sortable !== undefined ? column.sortable : true"
        >
          <template v-if="column.slot" #default="scope">
            <slot :name="column.slot" :row="scope.row" :index="scope.$index">
              {{ scope.row[column.prop] }}
            </slot>
          </template>

          <template v-else-if="column.formatter" #default="scope">
            {{ column.formatter(scope.row[column.prop], scope.row) }}
          </template>
        </el-table-column>
      </template>

      <!-- Колонка действий -->
      <el-table-column
        v-if="showActions"
        :label="actionsLabel"
        :width="actionsWidth"
        :fixed="actionsFixed"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index">
            <el-button-group>
              <el-button
                v-if="showEdit"
                type="primary"
                size="small"
                :icon="EditIcon"
                @click.stop="$emit('edit', scope.row)"
              />
              <el-button
                v-if="showDelete"
                type="danger"
                size="small"
                :icon="DeleteIcon"
                @click.stop="$emit('delete', scope.row)"
              />
              <el-button
                v-if="showView"
                type="info"
                size="small"
                :icon="ViewIcon"
                @click.stop="$emit('view', scope.row)"
              />
            </el-button-group>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- Пагинация -->
    <div v-if="showPagination" class="table-pagination">
      <div class="pagination-info">
        <span v-if="showTotal"> Всего: {{ total }} записей </span>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Выбранные элементы -->
    <div v-if="showSelection && selectedRows.length > 0" class="selection-info">
      <el-tag type="info" closable @close="clearSelection">
        Выбрано: {{ selectedRows.length }}
      </el-tag>
      <el-button
        v-if="showBatchDelete"
        type="danger"
        size="small"
        :icon="DeleteIcon"
        @click="$emit('batch-delete', selectedRows)"
      >
        Удалить выбранные
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  Plus as PlusIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  View as ViewIcon,
} from '@element-plus/icons-vue'
import SearchBar from './SearchBar.vue'

export default {
  name: 'DataTable',
  components: { SearchBar },
  props: {
    // Данные
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },

    // Колонки
    columns: {
      type: Array,
      default: () => [],
    },

    // Настройки таблицы
    stripe: {
      type: Boolean,
      default: true,
    },
    border: {
      type: Boolean,
      default: false,
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    defaultSort: {
      type: Object,
      default: null,
    },
    emptyText: {
      type: String,
      default: 'Нет данных',
    },
    tableHeight: {
      type: String,
      default: 'auto',
    },

    // Панель инструментов
    showToolbar: {
      type: Boolean,
      default: true,
    },
    showCreateButton: {
      type: Boolean,
      default: false,
    },
    createButtonText: {
      type: String,
      default: 'Добавить',
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: 'Поиск...',
    },
    searchWidth: {
      type: String,
      default: '300px',
    },
    searchButton: {
      type: Boolean,
      default: false,
    },
    showRefresh: {
      type: Boolean,
      default: true,
    },
    showExport: {
      type: Boolean,
      default: false,
    },

    // Колонки
    showSelection: {
      type: Boolean,
      default: false,
    },
    showIndex: {
      type: Boolean,
      default: false,
    },
    indexLabel: {
      type: String,
      default: '#',
    },

    // Действия
    showActions: {
      type: Boolean,
      default: true,
    },
    actionsLabel: {
      type: String,
      default: 'Действия',
    },
    actionsWidth: {
      type: String,
      default: '200',
    },
    actionsFixed: {
      type: String,
      default: 'right',
    },
    showEdit: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    showView: {
      type: Boolean,
      default: false,
    },

    // Пагинация
    showPagination: {
      type: Boolean,
      default: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    page: {
      type: Number,
      default: 1,
    },
    size: {
      type: Number,
      default: 10,
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100],
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper',
    },
    showTotal: {
      type: Boolean,
      default: true,
    },

    // Выборка
    showBatchDelete: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'create',
    'edit',
    'delete',
    'view',
    'search',
    'refresh',
    'export',
    'selection-change',
    'row-click',
    'sort-change',
    'page-change',
    'size-change',
    'batch-delete',
  ],
  setup(props, { emit }) {
    const searchValue = ref('')
    const currentPage = ref(props.page)
    const pageSize = ref(props.size)
    const selectedRows = ref([])

    const tableData = computed(() => {
      // Здесь можно добавить логику фильтрации/сортировки
      return props.data
    })

    watch(
      () => props.page,
      (newVal) => {
        currentPage.value = newVal
      },
    )

    watch(
      () => props.size,
      (newVal) => {
        pageSize.value = newVal
      },
    )

    function handleSearch(value) {
      emit('search', value)
    }

    function handleSearchClear() {
      searchValue.value = ''
      emit('search', '')
    }

    function handleRefresh() {
      emit('refresh')
    }

    function handleExport(command) {
      emit('export', command)
    }

    function handleSelectionChange(selection) {
      selectedRows.value = selection
      emit('selection-change', selection)
    }

    function handleRowClick(row, column, event) {
      emit('row-click', row, column, event)
    }

    function handleSortChange({ column, prop, order }) {
      emit('sort-change', { column, prop, order })
    }

    function handlePageChange(page) {
      currentPage.value = page
      emit('page-change', page)
    }

    function handleSizeChange(size) {
      pageSize.value = size
      emit('size-change', size)
    }

    function clearSelection() {
      selectedRows.value = []
    }

    return {
      PlusIcon,
      RefreshIcon,
      DownloadIcon,
      EditIcon,
      DeleteIcon,
      ViewIcon,
      searchValue,
      currentPage,
      pageSize,
      selectedRows,
      tableData,
      handleSearch,
      handleSearchClear,
      handleRefresh,
      handleExport,
      handleSelectionChange,
      handleRowClick,
      handleSortChange,
      handlePageChange,
      handleSizeChange,
      clearSelection,
    }
  },
}
</script>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}
</style>
