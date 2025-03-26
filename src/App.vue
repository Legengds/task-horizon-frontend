<template>
  <!-- 路由导航菜单 -->
  <nav>
    <router-link to="/dashboard">
      任务看板
    </router-link> |
    <router-link to="/create">
      新建任务
    </router-link>
    <router-link to="/datapanel">
      数据面板
    </router-link>
  </nav>
  
  <!-- 路由内容渲染区 -->
  <router-view />
</template>

<style>
/* 基础样式 */
nav {
  padding: 20px;
  text-align: center;
}

nav a {
  margin: 0 10px;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
  font-weight: bold;
}
</style>