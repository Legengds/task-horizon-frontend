/* eslint-disable */
<template>
  <div class="form-container">
    <form
      class="modern-form"
      @submit.prevent="handleSubmit"
    >
      <div class="form-header">
        <h2>创建新任务</h2>
        <p>请填写任务详细信息</p>
      </div>

      <div class="input-group">
        <input 
          v-model="formData.user_id" 
          required 
          class="modern-input"
          placeholder=" "
        >
        <label class="input-label">用户ID</label>
      </div>

      <!-- <div class="input-group">
        <input 
          v-model="formData.task_type" 
          required 
          class="modern-input"
          placeholder=" "
        >
        <label class="input-label">任务类型</label>
      </div> -->
      <div class="input-group">
        <select
          v-model="formData.task_type"
          class="modern-select"
          required
        >
          <option value="" disabled>请选择任务类型</option>
          <option v-for="type in taskTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <label class="input-label">任务类型</label>
      </div>

      <div class="input-group">
        <input 
          v-model="formData.task_stage" 
          required 
          class="modern-input"
          placeholder=" "
        >
        <label class="input-label">任务优先级</label>
      </div>

      <button
        type="submit"
        class="submit-btn"
      >
        立即创建
        <span class="btn-icon">→</span>
      </button>
    </form>

    <!-- 操作反馈提示 -->
    <div
      v-if="notification.show"
      :class="['notification', notification.type]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import request from '@/utils/request'
import { createTask } from '@/api/asyncTask'
// 新增任务类型列表
const taskTypes = ref([])

const fetchTaskTypes = async () => {
  try {
    const response = await request.get('/api/task_schedule_cfg/type_list')
    console.log('任务类型响应数据:', response)
    
    // 修改这里的判断逻辑
    if (Array.isArray(response)) {
      // 如果response直接是数组
      taskTypes.value = response
    } else if (response && response.code === 0) {
      // 如果response是对象且包含code和result
      taskTypes.value = response.result
    }
    
    // 添加调试输出
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

const initialFormData = { 
  user_id: '', 
  task_type: '', 
  task_stage: '' ,
  task_context: '' 
}

const formData = ref({ ...initialFormData })
const notification = ref({ show: false, type: '', message: '' })

const showNotification = (type, message) => {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const handleSubmit = async () => {
  try {
    await createTask(formData.value)
    showNotification('success', '✓ 任务创建成功')
    formData.value = { ...initialFormData }
  } catch (err) {
    showNotification('error', `✗ 创建失败: ${err.message}`)
  }
}
</script>

<style scoped>
.modern-select {
  width: 100%;
  height: 50px;
  padding: 0 1rem;
  border: 2px solid #e0e7ff;
  border-radius: 0.8rem;
  font-size: 1rem;
  background: white url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 1rem center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition: all 0.3s ease;
}

.modern-select:focus {
  border-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
  outline: none;
}
.form-container {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%);
  padding: 2rem;
}

.modern-form {
  background: white;
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 500px;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.modern-form:hover {
  transform: translateY(-2px);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #2a52be;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.input-group {
  position: relative;
  margin-bottom: 1.8rem;
}

.modern-input {
  width: 100%;
  height: 50px;
  padding: 1rem;
  border: 2px solid #e0e7ff;
  border-radius: 0.8rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: transparent;
}

.modern-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1);
  outline: none;
}

.modern-input:placeholder-shown + .input-label {
  transform: translateY(120%);
  opacity: 0.5;
}

.input-label {
  position: absolute;
  left: 1rem;
  top: 0;
  padding: 0 0.3rem;
  background: white;
  color: #4f46e5;
  font-size: 0.9rem;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  pointer-events: none;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  opacity: 0.95;
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
}

.btn-icon {
  font-weight: 300;
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(3px);
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 0.8rem;
  color: white;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.success {
  background: #10b981;
}

.error {
  background: #ef4444;
}
</style>