<template>
  <div class="modern-dashboard">
    <div class="filter-container">
      <!-- 现有的筛选组件 -->
    </div>

    <!-- 图表容器 -->
    <div class="chart-container">
      <div ref="chartRef" class="echarts-box"></div>
    </div>

    <TaskList
      :tasks="tasks"
      @refresh="loadTasks"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { getTaskList } from '@/api/asyncTask'
import TaskList from '@/components/TaskList.vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const tasks = ref([])
const filters = ref({
  taskType: '',
  status: 1,
  limit: 10
})

// 新增任务类型列表
const taskTypes = ref([])
// 存储各任务类型的状态数据
const taskStatusData = ref({})

// 图表相关
const chartRef = ref(null)
let chartInstance = null

// 获取任务类型列表
const fetchTaskTypes = async () => {
  try {
    const response = await request.get('/api/task_schedule_cfg/type_list')
    console.log('任务类型响应数据:', response)
    
    // 判断响应数据格式
    if (Array.isArray(response)) {
      // 如果response直接是数组
      taskTypes.value = response
    } else if (response && response.code === 0) {
      // 如果response是对象且包含code和result
      taskTypes.value = response.result
    }
    
    console.log('设置后的任务类型列表:', taskTypes.value)
    
    // 获取任务类型后，获取每种任务类型的状态数据
    await fetchTaskStatusData()
    
    // 获取数据后初始化图表
    nextTick(() => {
      initChart()
    })
  } catch (error) {
    console.error('获取任务类型失败:', error)
    taskTypes.value = []
    // 即使获取失败也初始化图表，使用默认数据
    nextTick(() => {
      initChart()
    })
  }
}

// 获取任务状态数据
const fetchTaskStatusData = async () => {
  try {
    // 清空之前的数据
    taskStatusData.value = {}
    
    // 为每种任务类型获取状态数据
    for (const taskType of taskTypes.value) {
      const response = await request.get('/api/task/task_num', {
        params: { task_type: taskType }
      })
      

    

      console.log(`任务类型 ${taskType} 的状态数据:`, response)
      if (Array.isArray(response)) {
      // 如果response直接是数组
      taskStatusData.value[taskType] = response
    }
      else if (response && response.code === 0) {
        // 存储该任务类型的状态数据
        taskStatusData.value[taskType] = response.result
      }
    }
    
    console.log('所有任务类型的状态数据:', taskStatusData.value)
  } catch (error) {
    console.error('获取任务状态数据失败:', error)
  }
}

// 初始化图表
const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  
  // 使用实际的任务类型作为横坐标，如果没有则使用默认值
  const taskTypeList = taskTypes.value.length > 0 ? taskTypes.value : ['暂无数据']
  
  // 准备各状态的数据数组
  const pendingData = []
  const runningData = []
  const successData = []
  const failedData = []
  
  // 从后端获取的数据填充各状态数组
  taskTypeList.forEach(taskType => {
    const statusData = taskStatusData.value[taskType] || [0, 0, 0, 0]
    pendingData.push(statusData[0] || 0)  // 待执行
    runningData.push(statusData[1] || 0)  // 执行中
    successData.push(statusData[2] || 0)  // 成功
    failedData.push(statusData[3] || 0)   // 失败
  })
  
  const option = {
    title: {
      text: '任务状态统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['待执行', '执行中', '成功', '失败'],
      bottom: 10
    },
    xAxis: {
      type: 'category',
      data: taskTypeList,
      axisLabel: {
        interval: 0,
        rotate: 30 // 旋转标签，防止文字重叠
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '待执行',
        type: 'bar',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: pendingData
      },
      {
        name: '执行中',
        type: 'bar',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: runningData
      },
      {
        name: '成功',
        type: 'bar',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: successData
      },
      {
        name: '失败',
        type: 'bar',
        stack: '总量',
        emphasis: {
          focus: 'series'
        },
        data: failedData
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  chartInstance && chartInstance.resize()
}

const loadTasks = async () => {
  try {
    const res = await getTaskList(filters.value)
    console.log('完整响应数据:', res)
    tasks.value = res.taskList
    
    // 重新获取任务状态数据并更新图表
    await fetchTaskStatusData()
    updateChart()
  } catch (err) {
    console.error('加载失败:', err.response?.data || err.message)
  }
}

onMounted(async () => {
  // 先获取任务类型，再加载任务
  await fetchTaskTypes()
  await loadTasks()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 现有样式保持不变 */

/* 图表容器样式 */
.chart-container {
  margin: 2rem 0;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.echarts-box {
  width: 100%;
  height: 400px;
}
</style>