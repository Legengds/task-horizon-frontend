<template>
    <div class="modern-dashboard">
      <div class="filter-container">
        <!-- 任务类型输入 -->
        <div class="filter-group input-group">
          <input 
            v-model="filters.taskType"
            class="modern-input"
            placeholder=" "
          >
          <label class="input-label">任务类型</label>
        </div>
  
        <!-- 状态选择 -->
        <div class="filter-group select-group">
          <select
            v-model="filters.status"
            class="modern-select"
          >
            <option :value="1">
              待执行
            </option>
            <option :value="2">
              执行中
            </option>
            <option :value="4">
              成功
            </option>
            <option :value="8">
              失败
            </option>
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getTaskList } from '@/api/asyncTask'
  import TaskList from '@/components/TaskList.vue'
  
  const tasks = ref([])
  const filters = ref({
    taskType: '', // 对应后端的 task_type 参数
    status: 1,    // 默认选中"待执行"
    limit: 10
  })
  
  const loadTasks = async () => {
    try {
      const res = await getTaskList(filters.value)
      console.log('完整响应数据:', res) // 调试关键点
  
      tasks.value = res.taskList
      
    } catch (err) {
      console.error('加载失败:', err.response?.data || err.message)
    }
  }
  
  onMounted(loadTasks)
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
      flex-basis: 300px;  /* 大屏幕下基础宽度更大 */
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
  </style>