<template>
  <header class="header">
    <div class="header-content">
      <h1 class="title">mini-list</h1>
      <p class="subtitle">简洁新闻摘要</p>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 1rem;
}

.title {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin: 0;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0 0 0;
  font-weight: 300;
}

@media (min-width: 768px) {
  .header-content {
    padding: 0 2rem;
  }
  
  .title {
    font-size: 2.5rem;
  }
}
</style>