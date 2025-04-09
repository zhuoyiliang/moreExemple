<script setup lang="ts">
import { ref } from 'vue'

interface Mystery {
  id: number
  title: string
  description: string
  image: string
}

const mysteries = ref<Mystery[]>([
  {
    id: 1,
    title: '百慕大三角',
    description: '位于大西洋西部的神秘区域，多年来有多艘船只和飞机在此神秘失踪。',
    image: 'https://via.placeholder.com/300x200?text=Bermuda+Triangle'
  },
  {
    id: 2,
    title: '金字塔之谜',
    description: '古埃及金字塔的建造技术至今仍然是个谜，其精确的建造方法仍然困扰着现代科学家。',
    image: 'https://via.placeholder.com/300x200?text=Pyramids'
  },
  {
    id: 3,
    title: '纳斯卡线条',
    description: '秘鲁沙漠中的巨大地画，只有从高空才能看清完整图案，其用途和制作方法至今成谜。',
    image: 'https://via.placeholder.com/300x200?text=Nazca+Lines'
  }
])
</script>

<template>
  <div class="mysteries">
    <h1 class="title">世界未解之谜</h1>
    <div class="mysteries-grid">
      <div v-for="mystery in mysteries" :key="mystery.id" class="mystery-card">
        <img :src="mystery.image" :alt="mystery.title" class="mystery-image">
        <div class="mystery-content">
          <h2>{{ mystery.title }}</h2>
          <p>{{ mystery.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mysteries {
  padding: 2rem;
}

.title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.mysteries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.mystery-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.mystery-card:hover {
  transform: translateY(-5px);
}

.mystery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.mystery-content {
  padding: 1.5rem;
}

.mystery-content h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.mystery-content p {
  color: #666;
  line-height: 1.6;
}
</style>
