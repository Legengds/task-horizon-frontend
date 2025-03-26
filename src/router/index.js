import { createRouter, createWebHistory } from 'vue-router'
import TaskDashboard from '@/views/TaskDashboard.vue'
import CreateTask from '@/views/CreateTask.vue'
import DataPanel from '@/views/DataPanel.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
   { path: '/dashboard', component: TaskDashboard },
  { path: '/create', component: CreateTask },
   { path: '/datapanel', component: DataPanel }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router