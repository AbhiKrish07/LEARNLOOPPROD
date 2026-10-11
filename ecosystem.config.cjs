module.exports = {
  apps: [
    {
      name: "learnloop-prod",
      script: "frontend/dist/index.js",
      cwd: "./frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    }
  ]
};
