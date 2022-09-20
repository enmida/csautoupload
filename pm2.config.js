module.exports = {
  apps : [{
    name   : 'carsome_auto_upload_server',
    script : './server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3040, // 端口
      DINGDING: false,
    },
    env_dev: {
      NODE_ENV: 'development',
      PORT: 3040,
      DINGDING: false,
    }
  }]
}
