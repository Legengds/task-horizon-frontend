<template>
  <div class="modern-dashboard">
    <div class="filter-container">
      <!-- 任务类型输入 -->
      <div class="input-group">
        <select
          v-model="filters.taskType"
          class="modern-select"
          required
        >
          <option value="" disabled>请选择任务类型</option>
          <option v-for="type in taskTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>

      <!-- 状态选择 -->
      <div class="filter-group select-group">
        <select
          v-model="filters.status"
          class="modern-select"
        >
          <option :value="0">全部</option>
          <option :value="1">待执行</option>
          <option :value="2">执行中</option>
          <option :value="4">成功</option>
          <option :value="8">失败</option>
        </select>
        <div class="select-arrow" />
      </div>

      <!-- 筛选按钮 -->
      <button
        class="filter-button"
        @click="loadTasks"
      >
        筛选
        <span class="button-icon">→</span>
      </button>
    </div>

    <TaskList
      :tasks="tasks"
      @refresh="loadTasks"
    />

    <!-- 分页组件 -->
    <!-- 修改分页组件部分 - 将这部分合并到主模板中 -->
    <div class="pagination-container">
      <button 
        class="pagination-button"
        :disabled="pagination.currentPage <= 1"
        @click="handlePageChange(pagination.currentPage - 1)"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 {{ pagination.currentPage }} 页 / 共 {{ pagination.totalPages }} 页
        (共 {{ pagination.totalCount }} 条记录)
      </span>
      
      <div class="page-input-group">
        <input
          v-model.number="pagination.inputPage"
          type="number"
          min="1"
          :max="pagination.totalPages"
          class="page-input"
          @keyup.enter="goToPage"
        >
        <button
          class="pagination-button"
          @click="goToPage"
        >
          跳转
        </button>
      </div>
      
      <button
        class="pagination-button"
        :disabled="pagination.currentPage >= pagination.totalPages"
        @click="handlePageChange(pagination.currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPageTaskList, getTaskCount } from '@/api/asyncTask'
import TaskList from '@/components/TaskList.vue'
import request from '@/utils/request'

const tasks = ref([])
const filters = ref({
  taskType: '',
  status: 0,
  limit: 10 // 默认每页10条
})
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  inputPage: 1 // 添加输入页码绑定
})

// 新增任务类型列表
const taskTypes = ref([])

const fetchTaskTypes = async () => {
  try {
    const response = await request.get('/api/task_schedule_cfg/type_list')
    console.log('任务类型响应数据:', response)
    
    if (Array.isArray(response)) {
      taskTypes.value = response
    } else if (response && response.code === 0) {
      taskTypes.value = response.result
    }
    
    console.log('设置后的任务类型列表:', taskTypes.value)
  } catch (error) {
    console.error('获取任务类型失败:', error)
    taskTypes.value = []
  }
}

const isLoading = ref(false)
onMounted(async () => {
  isLoading.value = true
  await fetchTaskTypes()
  isLoading.value = false
})

// 加载任务数据
// 修改加载任务方法
const loadTasks = async () => {
  try {
    // 获取任务列表和分页数据
    const res = await getPageTaskList({
      ...filters.value,
      page: pagination.value.currentPage
    })
    
    // 获取总记录数
    const countRes = await getTaskCount({
      taskType: filters.value.taskType,
      status: filters.value.status
    })
    
    console.log('API响应数据:', countRes) // 调试日志
    
    tasks.value = res.taskList || []
    pagination.value = {
      currentPage: res.currentPage || 1,
      totalPages: Math.ceil((countRes || 0) / filters.value.limit), // 使用可选链操作符
      totalCount: countRes || 0, // 使用可选链操作符
      inputPage: pagination.value.inputPage
    }
  } catch (err) {
    console.error('加载失败:', err)
  }
}

// 分页切换方法
const handlePageChange = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  pagination.value.currentPage = newPage
  loadTasks()
}

// 跳转到指定页
// 修改跳转方法
const goToPage = () => {
  const page = parseInt(pagination.value.inputPage)
  if (!isNaN(page) && page >= 1 && page <= pagination.value.totalPages) {
    handlePageChange(page)
  }
}
</script>

<style scoped>
.modern-dashboard {
  padding: 2rem;
  background: #f8faff;
  min-height: 100vh;
}

.filter-container {
  display: flex;
  gap: 3rem;
  align-items: center;
  flex-wrap: wrap;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

/* 输入框容器 */
.input-group {
  flex: 3 1 260px;  /* 增加扩展比例和基础宽度 */
  min-width: 260px;
  position: relative;
}

.select-group {
  flex: 1 1 180px;  /* 增加基础宽度 */
  min-width: 180px;
  position: relative;
}

.modern-input {
  width: 100%;
  height: 48px;
  padding: 0 1.2rem; /* 增加内边距 */
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.modern-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
  outline: none;
}

.input-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 4px;
  color: #94a3b8;
  transition: all 0.3s ease;
  pointer-events: none;
}

.modern-input:focus + .input-label,
.modern-input:not(:placeholder-shown) + .input-label {
  top: 0;
  transform: translateY(-50%);
  font-size: 12px;
  color: #4f46e5;
}

.modern-select {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  appearance: none;
  background: transparent;
  font-size: 14px;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-left: 2px solid #4f46e5;
  border-bottom: 2px solid #4f46e5;
  transform: rotate(-45deg);
  pointer-events: none;
}

.filter-button {
  flex: 0 0 auto;
  height: 48px;
  padding: 0 1.8rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-button:hover {
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.button-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.filter-button:hover .button-icon {
  transform: translateX(3px);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    gap: 1.2rem;
  }
  
  .input-group,
  .select-group {
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    min-width: unset;
  }

  .modern-select {
    padding-right: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .input-group {
    flex-basis: 300px;
  }
}

/* 修复移动端输入框标签位置 */
@media (max-width: 480px) {
  .input-label {
    font-size: 14px;
    transform: translateY(-120%);
  }
  
  .modern-input:focus + .input-label,
  .modern-input:not(:placeholder-shown) + .input-label {
    transform: translateY(-150%);
  }
}

/* 添加跳转按钮样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e7ff;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f8faff;
  border-color: #4f46e5;
}

/* 添加页码输入框样式 */
.page-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-input {
  width: 60px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid #e0e7ff;
  border-radius: 4px;
  text-align: center;
}

.page-input:focus {
  border-color: #4f46e5;
  outline: none;
}
</style>