// 确认配置完整度
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        // 添加websocket支持
        ws: true,
        // 添加安全校验绕过
        secure: false
      }
    }
  }
})