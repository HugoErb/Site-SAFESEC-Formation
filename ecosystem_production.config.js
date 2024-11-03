module.exports = {
    apps: [
        {
            name: "Safesec Formation",
            script: "./server.js",
            watch: true,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}