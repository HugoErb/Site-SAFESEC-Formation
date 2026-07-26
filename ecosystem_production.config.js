module.exports = {
    apps: [
        {
            name: "SafesecFormation",
            script: "./server.js",
            watch: false,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}
