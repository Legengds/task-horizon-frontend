import request from '@/utils/request'

// 创建任务
export const createTask = (taskData) => {
  return request.post('/api/task/create_task', {
    taskData: {
      user_id: taskData.user_id,
      task_type: taskData.task_type,
      task_stage: taskData.task_stage,
      task_context: taskData.task_context // 提供默认值防止null
    }
  })
}

// 获取任务详情
export const getTask = (taskId) => {
  return request.get('/api/task/get_task', {
    params: { task_id: taskId }
  })
}



export const getTaskList = (params) => {
  return request.get('/api/task/task_list', {
    params: {
      task_type: params.taskType, // 确保与后端接口参数名完全一致
      status: params.status,
      limit: params.limit
    },
    // 如果响应结构需要特殊处理，添加以下配置
  
  })
}

// 修改任务信息
export const updateTask = (taskData) => {
  return request.post('/api/task/set_task', {
    task_id: taskData.taskId,
    status: taskData.status,
    priority: taskData.priority,
    max_retry_num: taskData.maxRetries
  })
}

// 获取用户任务列表
export const getUserTasks = (userId, status) => {
  return request.get('/api/task/user_task_list', {
    params: { user_id: userId, status_list: status }
  })
}