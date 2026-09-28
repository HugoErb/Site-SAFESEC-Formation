module.exports = {
    apps: [
        {
            name: "SafesecFormation",
            script: "./server.js",
            instances: 1,
            exec_mode: "cluster",
            watch: false,
            time: true,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}
