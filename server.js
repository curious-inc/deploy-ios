
var fs = require('fs');
var _ = require('dry-underscore');
var config = require("./config.js");

_.log.level(config.log_level || "info");

var root_path = _.path.fun(_.path.normalize(__dirname));
var root_url = _.url.fun("https://" + config.host);
var builds = config.builds;
var build_path = _.path.fun(root_path(), "builds");

var static = require('node-static');
var builds_server = new static.Server(build_path());

function ipa_path(build_name, version){
    return build_path(build_name, version, "install.ipa");
}

function check_version(build_name, version, callback){
    var path = ipa_path(build_name, version);
    _.p("check path: ", path);
    _.fs.exists(path, callback);
}

function current_version(build_name, callback){
    var path = build_path(build_name, "current");

    fs.lstat(path, _.plumb(function(stat){
        if(!stat.isSymbolicLink()){ return callback(_.error("NotLink", "The directory 'current' must be a symbolic link to a version directory.")); }
        // current should point to a dir who's name is the version
        fs.readlink(path, callback);
    }, callback));
}

function basic_auth(username, password){
    var basicAuth = require('basic-auth');

    return(function(req, res, next){
       function unauthorized(res){
           res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
           return res.sendStatus(401);
       };

       var user = basicAuth(req);

       if(!user || !user.name || !user.pass){
           return unauthorized(res);
       };

       if(user.name === username && user.pass === password){
           return next();
       }else{ return unauthorized(res); };
   });
}

function ssl_parse_ca(bundle_path){
    var ca = [];

    try{ var chain = fs.readFileSync(bundle_path, 'utf8'); }
    catch(e){ 
        _.stderr("Not using a certificate chain. Can't read ca_bundle file: " + bundle_path + ".");
        return([]);
    }

    chain = chain.split("\n");

    var cert = [];
    var line = null;
    var _len = 0;

    for (var _i = 0, _len = chain.length; _i < _len; _i++) {
        line = chain[_i];
        if (!(line.length !== 0)) {
            continue;
        }
        cert.push(line);
        if (line.match(/-END CERTIFICATE-/)) {
            ca.push(cert.join("\n"));
            cert = [];
        }
    }

    return(ca);
}

function ssl_options(key_path, cert_path, bundle_path){
    return({
        key : fs.readFileSync(key_path, 'utf8'),
        cert : fs.readFileSync(cert_path, 'utf8'),
        ca : ssl_parse_ca(bundle_path)
    });
}
 

function add_build_routes(app, build_name, build_info){

    function template_hash(version, build_name, build_info, current){
        var hash = {
            version: version,
            current: current,
            build_name: build_name,
            root_url: root_url(),
            plist_url: root_url(build_name, version, "install.plist"),
            ipa_url: root_url(build_name, version, "install.ipa"),
        };

        hash = _.extend(hash, build_info);

        return(hash);
    }

    function inspect_version(req){
        _.log.debug("req.url: ", req.url);
        _.log.debug("req.requested_current: ", req.requested_current);
        _.log.debug("req.version: ", req.version);
        _.log.debug("req.current_version: ", req.current_version);
        _.log.debug("req.is_current_version: ", req.is_current_version);
    }

    function handle_version(req, res, next){
        var version = req.version_override || req.param("version");

        check_version(build_name, version, _.plumb(function(exists){
            if(!exists){ return res.status(404).end("Version does not exist."); }

            req.version = version;
            req.requested_current = (version === "current");

            current_version(build_name, _.plumb(function(current_version_string){
                if(req.requested_current){ req.version = current_version_string; }
                req.current_version = current_version_string;
                req.is_current_version = (current_version_string === req.version);

                inspect_version(req);

                return next();

            }, next));
        }, next));
    }

    function secure_versions(req, res, next){
        if(req.is_current_version){ return next(); }
        else if(config.auth.secure === false){ return next(); }
        else{ return basic_auth(config.auth.username, config.auth.password)(req, res, next); }
    }

    app.get('/' + build_name + '/:version/install.plist', handle_version, secure_versions, function(req, res, next){
        var plist = _.render("install.plist", template_hash(req.version, build_name, build_info, req.is_current_version));
        res.end(plist);
    });

    app.get('/' + build_name + '/:version/install.ipa', handle_version, secure_versions, function(req, res, next){
        builds_server.serveFile(req.url, 200, null, req, res);
        // res.sendFile(ipa_path(build_name, req.version));
    });

    app.get('/' + build_name + '/:version/', handle_version, secure_versions, function(req, res, next){
        var html = _.render("install.html", template_hash(req.version, build_name, build_info, req.is_current_version));
        res.end(html);
    });

    if(!build_info.default){ return; }

    app.get('/', function(req, res, next){ req.version_override = "current"; next(); }, handle_version, secure_versions, function(req, res, next){
        var html = _.render("install.html", template_hash(req.version, build_name, build_info, req.is_current_version));
        res.end(html);
    });
}

function load_routes(app){
    app.get('/ping', function(req, res){ res.end("pong"); });

    _.each(builds, function(build_info, build_name){
        add_build_routes(app, build_name, build_info);
    });
}

function setup_builds(){
    _.each(builds, function(build_info, build_name){
        _.fs.mkdir.sync(build_path(build_name));
    });
}

function run_server(){

    var http = require('http');
    var https = require('https');
    var express = require('express');
    var app = express();

    var ssl_info = ssl_options(config.ssl.key, config.ssl.cert, config.ssl.ca_bundle);

    load_routes(app);

    var redirect_app = express();

    redirect_app.get('*', function(req, res){ res.redirect(root_url(req.url)); })

    var redirect_server = http.createServer(redirect_app);

    var secure_server = https.createServer(ssl_info, app);

    redirect_server.listen(80, function(){
        secure_server.listen(443, function(){
            _.stderr("Root url: ", root_url());
            _.stderr("Builds path: ", build_path());
            _.stderr("Server listening on port: 443");
        });
    });
}

function main(){

    _.render.loadDirectory(root_path("templates"));

    setup_builds();
    run_server();
}

main();
