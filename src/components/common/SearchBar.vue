<template>
  <div class="search-bar">
    <el-input
      v-model="internalValue"
      :placeholder="placeholder"
      :style="{ width: width }"
      :size="size"
      :clearable="clearable"
      @input="handleInput"
      @clear="handleClear"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <slot name="prefix">
          <el-icon><SearchIcon /></el-icon>
        </slot>
      </template>

      <template #append v-if="showSearchButton">
        <el-button :icon="SearchIcon" @click="handleSearch" :loading="loading" />
      </template>
    </el-input>

    <div v-if="filters && filters.length > 0" class="filter-buttons">
      <el-button-group>
        <el-button
          v-for="filter in filters"
          :key="filter.value"
          :type="activeFilter === filter.value ? 'primary' : 'default'"
          size="small"
          @click="handleFilterChange(filter.value)"
        >
          {{ filter.label }}
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { Search as SearchIcon } from '@element-plus/icons-vue'

export default {
  name: 'SearchBar',
  components: { SearchIcon },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Поиск...',
    },
    width: {
      type: String,
      default: '300px',
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value),
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    showSearchButton: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    debounce: {
      type: Number,
      default: 300,
    },
    filters: {
      type: Array,
      default: () => [],
    },
    activeFilter: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'search', 'clear', 'filter-change'],
  setup(props, { emit }) {
    const internalValue = ref(props.modelValue)
    let timeoutId = null

    watch(
      () => props.modelValue,
      (newVal) => {
        internalValue.value = newVal
      },
    )

    watch(
      () => props.activeFilter,
      () => {
        // При изменении фильтра можно автоматически выполнить поиск
        if (props.activeFilter && internalValue.value) {
          handleSearch()
        }
      },
    )

    function handleInput(value) {
      internalValue.value = value

      // Дебаунс для уменьшения количества запросов
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (props.debounce > 0) {
        timeoutId = setTimeout(() => {
          emit('update:modelValue', value)
          if (!props.showSearchButton) {
            emit('search', value, props.activeFilter)
          }
        }, props.debounce)
      } else {
        emit('update:modelValue', value)
        if (!props.showSearchButton) {
          emit('search', value, props.activeFilter)
        }
      }
    }

    function handleSearch() {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      emit('search', internalValue.value, props.activeFilter)
    }

    function handleClear() {
      internalValue.value = ''
      emit('clear')
      emit('update:modelValue', '')
      if (!props.showSearchButton) {
        emit('search', '', props.activeFilter)
      }
    }

    function handleFilterChange(filterValue) {
      emit('filter-change', filterValue)
    }

    return {
      internalValue,
      handleInput,
      handleSearch,
      handleClear,
      handleFilterChange,
    }
  },
}
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-buttons .el-button-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
