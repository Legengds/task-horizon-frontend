<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="modern-form">
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

      <div class="input-group">
        <input 
          v-model="formData.task_type" 
          required 
          class="modern-input"
          placeholder=" "
        >
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

      <button type="submit" class="submit-btn">
        立即创建
        <span class="btn-icon">→</span>
      </button>
    </form>

    <!-- 操作反馈提示 -->
    <div :class="['notification', notification.type]" v-if="notification.show">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createTask } from '@/api/asyncTask'

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