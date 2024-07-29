module.exports = {
    apps: [
        {
            name: "production_safesec_formation",
            script: "./server.js",
            watch: true,
            env: {
                "NODE_ENV": "production",
                "PORT": 3000
            }
        }
    ]
}