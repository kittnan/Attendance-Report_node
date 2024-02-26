module.exports = {
  apps: [
    {
      name: "attendance-report-node",
      script: "./index.js", // your script
      watch: true,
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4058,
        DATABASE: "mongodb://10.200.90.152:27017/attendance-report",
      },
    },
  ],
};
