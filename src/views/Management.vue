<template>
  <div class="management-page">
    <h1>Управление автостоянкой</h1>

    <el-tabs v-model="activeTab" type="card">
      <!-- :lazy="false" загружает компоненты сразу -->
      <el-tab-pane label="Владельцы" name="owners" :lazy="false">
        <OwnersSection />
      </el-tab-pane>

      <el-tab-pane label="Автомобили" name="cars" :lazy="false">
        <CarsSection />
      </el-tab-pane>

      <el-tab-pane label="Парковочные места" name="parkingSpots" :lazy="false">
        <ParkingSpotsSection />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref } from 'vue'
import OwnersSection from '@/components/management/OwnersSection.vue'
import CarsSection from '@/components/management/CarsSection.vue'
import ParkingSpotsSection from '@/components/management/ParkingSpotsSection.vue'

export default {
  name: 'ManagementPage',
  components: {
    OwnersSection,
    CarsSection,
    ParkingSpotsSection,
  },
  setup() {
    const activeTab = ref('owners')

    return {
      activeTab,
    }
  },
}
</script>
<style scoped>
.management-page {
  padding: 20px;
}

.el-tabs {
  margin-top: 20px;
}
</style>
