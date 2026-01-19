<template>
  <div id="app">
    <div class="app-container">
      <!-- Простая навигация из 2 кнопок -->
      <header class="app-header">
        <div class="logo">
          <h1>Автостоянка</h1>
        </div>
        <nav class="main-nav">
          <router-link to="/management" :class="{ active: $route.name === 'management' }">
            Управление
          </router-link>
          <router-link to="/reservations" :class="{ active: $route.name === 'reservations' }">
            Бронирование
          </router-link>
        </nav>
      </header>

      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.main-nav a {
  color: white;
  text-decoration: none;
  padding: 15px 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.main-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-nav a.active {
  background-color: #409eff;
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
