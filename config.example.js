module.exports = {
    host: "install.example.com",
    builds: {
        "development" : { 
            bundle_name: "Foo (Development)",
            bundle_identifier: "com.example.development.Foo" 
        },
        "production": { 
            default: true,
            bundle_name: "Foo",
            bundle_identifier: "com.example.production.Foo" 
        }
    },
    ssl: {
        key: "./keys/example.key", 
        cert: "./keys/example.cert", 
        ca_bundle: "./keys/example.cabundle"
    },
    auth: {
        secure: true,
        username: "admin",
        password: "admin"
    },
    log_level: "debug"
};


