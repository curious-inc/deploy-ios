<html>
    <head>
        <title>Applicaton Install</title>
        <style>

            body{
                margin-top: 200px;
            }

            a{
                margin-top: 40px;
                font-size: 30px;
                display: block;
            }

            .center{ text-align: center; }

        </style>
    </head>
    <body>
        <h1 class="center">Application Install</h1>
        <a class="center" href="itms-services://?action=download-manifest&url={{plist_url}}">Install - Version {{version}} {{#current}}(current){{/current}}</a>
    </body>
</html>
