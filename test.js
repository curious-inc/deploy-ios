#!/usr/bin/env node

var _ = require('dry-underscore');

// we test with self signed certs
_.http.unsafe = true;

var eq = _.test.eq;

var host = _.url.fun("https://localhost");

/*
_.http.get(host("secure/0.0.2/install.ipa"), function(err, res, body){
    _.p("err: ", err);
    _.p("res: ", res);
    _.p("body: ", body);
});
*/

function add_version(build, version, secure){
    build[version] = secure;
    build[version + "/"] = secure;
    build[version + "/install.ipa"] = secure;
    build[version + "/install.plist"] = secure;
}

var secure_build = { "/" : true, }

add_version(secure_build, "current", true);
add_version(secure_build, "0.0.1", true);
add_version(secure_build, "0.0.2", true);

var unsecure_build = { "/" : false, }

add_version(unsecure_build, "current", false);
add_version(unsecure_build, "0.0.1", false);
add_version(unsecure_build, "0.0.2", false);

var secure_unsecure_current_build = { "/" : false, }

add_version(secure_unsecure_current_build, "current", false);
add_version(secure_unsecure_current_build, "0.0.1", true);
add_version(secure_unsecure_current_build, "0.0.2", false);


function test_url(url, expects_protected){
    _.http.get(url, function(err, res, body){
        eq(err, null);
        if(expects_protected){
            try{
                eq(res.status, 401);
                eq(res.body, "Unauthorized");
            }catch(e){ throw(_.error("Error", "url not protected: " + url + ": " + e.message)); }
        }else{ 
            try{
                eq(res.status, 200);
            }catch(e){ throw(_.error("Error", "url protected: " + url + ": " + e.message)); }
        }
        _.p("checked url: ", url);
    });
}

function test_build(build_name, security_info){
    _.each(security_info, function(protected, url){
        test_url(host(build_name, url), protected);
    });
}

test_url(host(), false);
test_build("unsecure", unsecure_build);
test_build("secure", secure_build);
test_build("secure_unsecure_current", secure_unsecure_current_build);


