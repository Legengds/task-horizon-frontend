<template>
  <div class="modern-task-list">
    <div v-if="tasks.length > 0" class="table-container">
      <div class="table-header">
        <div class="header-cell">任务ID</div>
        <div class="header-cell">类型</div>
        <div class="header-cell">状态</div>
        <div class="header-cell">创建时间</div>
      </div>

      <div class="table-body">
        <div 
          v-for="task in tasks" 
          :key="task.task_id" 
          class="table-row"
        >
          <div class="body-cell">{{ task.task_id }}</div>
          <div class="body-cell">{{ task.task_type }}</div>
          <div class="body-cell">
            <span :class="['status-badge', statusClass(task.status)]">
              {{ statusText(task.status) }}
            </span>
          </div>
          <div class="body-cell time-cell">{{ formatTime(task.create_time) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path fill="#CBD5E1" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5z"/>
      </svg>
      <p class="empty-text">暂无任务数据</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tasks: Array
})

// 状态显示优化
const statusClass = (status) => {
  const map = {
    1: 'pending',
    2: 'processing',
    4: 'success',
    8: 'error'
  }
  return map[status] || 'unknown'
}

const statusText = (status) => {
  const map = {
    1: '待执行',
    2: '执行中',
    4: '成功',
    8: '失败'
  }
  return map[status] || '未知'
}

// 保持原有时间格式化函数
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.modern-task-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem 2rem;
  background: #f8f9ff;
  font-weight: 600;
  color: #4f46e5;
}

.table-body {
  padding: 0 2rem;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f8f9ff;
}

.body-cell {
  display: flex;
  align-items: center;
  color: #4a5568;
  padding: 8px 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: 500;
}

.pending { background: #eef2ff; color: #4f46e5; }
.processing { background: #f0f9ff; color: #0ea5e9; }
.success { background: #f0fdf4; color: #22c55e; }
.error { background: #fef2f2; color: #ef4444; }

.time-cell {
  font-family: monospace;
  color: #64748b;
}

.empty-state {
  padding: 3rem 0;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  opacity: 0.6;
  margin-bottom: 1rem;
}

.empty-text {
  color: #94a3b8;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .body-cell::before {
    content: attr(data-label);
    flex: 0 0 80px;
    color: #94a3b8;
    font-weight: 500;
    margin-right: 1rem;
  }

  .body-cell:nth-child(1)::before { content: "任务ID"; }
  .body-cell:nth-child(2)::before { content: "类型"; }
  .body-cell:nth-child(3)::before { content: "状态"; }
  .body-cell:nth-child(4)::before { content: "时间"; }
}
</style>