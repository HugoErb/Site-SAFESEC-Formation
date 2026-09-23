module.exports = {
    apps: [
        {
            name: "SafesecFormation",
            script: "./server.js",
            instances: 2,
            exec_mode: "cluster",
            watch: false,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}
