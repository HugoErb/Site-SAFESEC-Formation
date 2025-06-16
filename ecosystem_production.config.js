module.exports = {
    apps: [
        {
            name: "SafesecFormation",
            script: "./server.js",
            watch: true,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}