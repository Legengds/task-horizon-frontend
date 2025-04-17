<template>
  <div class="modern-dashboard">
    <div class="filter-container">
      <!-- 现有的筛选组件 -->
    </div>

    <!-- 图表容器 -->
    <div class="chart-container">
      <div ref="chartRef" class="echarts-box"></div>
    </div>

    <!-- 新增失败任务报警图表容器 -->
    <div class="chart-container">
      <h3 class="chart-title">失败任务报警统计</h3>
      <div ref="alarmChartRef" class="echarts-box"></div>
    </div>

    <TaskList
      :tasks="tasks"
      @refresh="loadTasks"
    />
  </div>
</template>

<script setup>
// 导入部分需要添加新的API方法
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
// 修改这一行，添加 getPageTaskList 并移除未使用的 getTaskList
import { getPageTaskList, getTaskAlarmStatistics } from '@/api/asyncTask'
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

// 报警图表相关
const alarmChartRef = ref(null)
let alarmChartInstance = null
const alarmData = ref({
  taskTypes: [],
  failedCounts: [],
  retryData: [],
  maxRetryData: []
})

// 获取报警数据
const fetchAlarmData = async () => {
  try {
    // 使用asyncTask.js中定义的方法替代直接request调用
    const response = await getTaskAlarmStatistics()
    console.log('报警统计数据原始响应:', response)
    
    // 修改判断条件，直接检查response是否包含所需数据
    if (response && response.taskTypes && response.failedCounts) {
      // 直接使用返回的数据
      alarmData.value = response
      console.log('设置报警数据成功(直接使用):', alarmData.value)
    } else if (response && response.code === 0 && response.result) {
      // 使用result中的数据
      alarmData.value = response.result
      console.log('设置报警数据成功(使用result):', alarmData.value)
    } else if (Array.isArray(response)) {
      // 如果response直接是数组
      alarmData.value = {
        taskTypes: response.map(item => item.taskType || '未知类型'),
        failedCounts: response.map(item => item.failedCount || 0),
        retryData: response.map(item => item.retryCount || 0),
        maxRetryData: response.map(item => item.maxRetryNum || 0)
      }
    } else {
      // 处理空数据情况
      alarmData.value = {
        taskTypes: ['暂无数据'],
        failedCounts: [0],
        retryData: [0],
        maxRetryData: [0]
      }
      console.log('报警统计数据为空或格式不正确，使用默认值')
    }
    
    // 确保在nextTick中初始化图表
    nextTick(() => {
      console.log('准备初始化报警图表, DOM元素存在:', !!alarmChartRef.value)
      initAlarmChart()
    })
  } catch (error) {
    console.error('获取报警统计数据失败:', error)
    // 即使获取失败也初始化图表，使用默认数据
    alarmData.value = {
      taskTypes: ['获取失败'],
      failedCounts: [0],
      retryData: [0],
      maxRetryData: [0]
    }
    nextTick(() => {
      initAlarmChart()
    })
  }
}

// 初始化报警图表
const initAlarmChart = () => {
  console.log('开始初始化报警图表')
  if (alarmChartInstance) {
    console.log('销毁旧的报警图表实例')
    alarmChartInstance.dispose()
  }
  
  if (alarmChartRef.value) {
    console.log('创建新的报警图表实例')
    alarmChartInstance = echarts.init(alarmChartRef.value)
    updateAlarmChart()
  } else {
    console.error('报警图表DOM元素不存在')
  }
}

// 更新报警图表数据
const updateAlarmChart = () => {
  console.log('更新报警图表数据')
  if (!alarmChartInstance) {
    console.error('报警图表实例不存在')
    return
  }
  
  // 确保数据存在
  const chartData = {
    taskTypes: alarmData.value.taskTypes?.length > 0 ? alarmData.value.taskTypes : ['暂无数据'],
    failedCounts: alarmData.value.failedCounts || [],
    retryData: alarmData.value.retryData || [],
    maxRetryData: alarmData.value.maxRetryData || []
  }
  
  console.log('报警图表使用的数据:', chartData)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let result = params[0].name + '<br/>';
        params.forEach(param => {
          result += param.seriesName + ': ' + param.value + '<br/>';
          if (param.seriesName === '失败任务数') {
            const index = param.dataIndex;
            const retryRate = chartData.retryData[index] > 0 && param.value > 0 ? 
              (chartData.retryData[index] / param.value * 100).toFixed(2) : 0;
            result += '重试率: ' + retryRate + '%<br/>';
          }
        });
        return result;
      }
    },
    legend: {
      data: ['失败任务数', '已重试次数', '最大重试次数'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.taskTypes,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '失败任务数',
        type: 'bar',
        data: chartData.failedCounts,
        itemStyle: {
          color: '#FF4D4F'
        }
      },
      {
        name: '已重试次数',
        type: 'bar',
        data: chartData.retryData,
        itemStyle: {
          color: '#FAAD14'
        }
      },
      {
        name: '最大重试次数',
        type: 'line',
        data: chartData.maxRetryData,
        symbolSize: 8,
        itemStyle: {
          color: '#1890FF'
        }
      }
    ]
  }
  
  try {
    console.log('设置报警图表选项')
    alarmChartInstance.setOption(option)
    console.log('报警图表设置完成')
  } catch (error) {
    console.error('设置报警图表选项时出错:', error)
  }
}

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
  alarmChartInstance && alarmChartInstance.resize()
}

// 修改现有的loadTasks函数，添加报警数据获取
const loadTasks = async () => {
  try {
    // 使用getPageTaskList而不是getTaskList，确保分页参数正确
    const res = await getPageTaskList({
      ...filters.value,
      page: 1 // 添加页码参数
    })
    console.log('完整响应数据:', res)
    tasks.value = res.taskList || []
    
    // 重新获取任务状态数据并更新图表
    await fetchTaskStatusData()
    updateChart()
    
    // 重新获取报警数据并更新报警图表
    await fetchAlarmData()
  } catch (err) {
    console.error('加载失败:', err.response?.data || err.message)
    tasks.value = []
  }
}

// 修改onMounted函数，确保报警数据在组件挂载时被获取
onMounted(async () => {
  console.log('组件挂载开始')
  // 先获取任务类型，再加载任务
  await fetchTaskTypes()
  await loadTasks()
  
  // 确保报警数据被获取（即使loadTasks中已经调用了fetchAlarmData，这里也再次调用以确保）
  console.log('单独获取报警数据')
  await fetchAlarmData()
  
  // 添加一个延迟初始化，以确保DOM已完全渲染
  setTimeout(() => {
    console.log('延迟初始化报警图表')
    if (alarmChartRef.value && !alarmChartInstance) {
      initAlarmChart()
    }
  }, 500)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  console.log('组件挂载完成')
})

onUnmounted(() => {
  // 清理图表实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (alarmChartInstance) {
    alarmChartInstance.dispose()
    alarmChartInstance = null
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

.chart-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
  text-align: center;
}

.echarts-box {
  width: 100%;
  height: 400px;
}
</style>

// 修改 getTaskAlarmStatistics 方法调用
// 在 asyncTask.js 中添加以下代码