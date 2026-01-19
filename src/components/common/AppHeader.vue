<template>
  <div class="app-header">
    <div class="logo">
      <h2>Система управления парковкой</h2>
    </div>
    <nav class="nav">
      <router-link to="/management" :class="{ active: $route.path === '/management' }">
        Управление
      </router-link>
      <router-link to="/reservation" :class="{ active: $route.path === '/reservation' }">
        Бронирование
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  height: 100%;
}

.logo h2 {
  margin: 0;
  color: #409eff;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  text-decoration: none;
  color: #606266;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav a:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.nav a.active {
  background-color: #409eff;
  color: white;
}
</style>
