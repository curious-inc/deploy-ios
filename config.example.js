module.exports = {
    host: "install.example.com",
    builds: {
        "unsecure": { 
            secure: false,
            bundle_name: "unsecure",
            bundle_identifier: "com.example.unsecure" 
        },
        "secure" : { 
            secure: true,
            bundle_name: "secure",
            bundle_identifier: "com.example.secure" 
        },
        "secure_unsecure_current": { 
            secure: true,
            secure_current: false,
            bundle_name: "secure_unsecure_current",
            bundle_identifier: "com.example.secure_unsecure_current" 
        },
        "development" : { 
            secure: true,
            bundle_name: "Foo (Development)",
            bundle_identifier: "com.example.development.Foo" 
        },
        "production": { 
            default: true,
            secure: true,
            secure_current: false,
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
        username: "admin",
        password: "admin"
    },
    log_level: "debug"
};


