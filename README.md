## iOS Deployment Server

This server simplifes iOS Enterprise distributions.
You must serve these files over https.

You define "builds" in your config file, each "build" repersents a bundle identifier.
Builds have versions, this server hosts multiple versions of the same build.
The "current" version of the build is public, all other versions are protected by basic auth.
You can have one "default" build, the current version of which is available at "/" the root of the server.

The server serves three URLs for each version:
- `/<build>/<version>/`, hosts a simple html page where you can install the app. Visit this from your phone.
- `/<build>/<version>/install.plist`, is the manifest needed by the phone to install the app.
- `/<build>/<version>/install.ipa`, is the app archive for this version, you upload this to the server.

In the root of the project directory there is a folder called `builds` which contains a directory for each of your builds.
These folders are where you put your .ipa files for serving. 
The archives must be named `install.ipa`. 
You must name of the folder must match the value of the bundle version.
You must create a symlink named `current`, and point it to the version you want to serve as "current".
An example is show below.

```
/builds
    /foo
        /0.0.1
            install.ipa
        /0.0.2
            install.ipa
        /current -> 0.0.2
    /bar
        /0.0.1
            install.ipa
        /0.0.2
            install.ipa
        /current -> 0.0.1
```
