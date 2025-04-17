import request from '@/utils/request'

// 创建任务
export const createTask = (taskData) => {
  return request.post('/api/task/create_task', {
    taskData: {
      user_id: taskData.user_id,
      task_type: taskData.task_type,
      task_stage: taskData.task_stage,
      task_context: taskData.task_context, // 提供默认值防止null
      priority: taskData.priority,
      schedule_log: taskData.schedule_log

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
      task_type: params.taskType,
      status: params.status,
      limit: params.limit
    }
  })
}

export const getPageTaskList = (params) => {
  return request.get('/api/task/page_task_list', {
    params: {
      task_type: params.taskType,
      status: params.status,
      limit: params.limit,
      page: params.page
    }
  })
}

// 添加获取总记录数的方法
export const getTaskCount = (params) => {
  return request.get('/api/task/task_count', {
    params: {
      task_type: params.taskType,
      status: params.status
    }
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

// 获取任务报警统计数据
export const getTaskAlarmStatistics = (timeRange = 0) => {
  return request.get('/api/task/alarm_statistics', {
    params: { time_range: timeRange }
  }).then(response => {
    // 直接返回数据，不做额外处理
    console.log('API返回的原始报警数据:', response);
    return response;
  }).catch(error => {
    console.error('获取报警统计数据失败:', error);
    throw error;
  });
}

// 获取重试率最高的任务类型
export const getHighRetryTasks = (limit = 5) => {
  return request.get('/api/task/high_retry_tasks', {
    params: { limit }
  })
}