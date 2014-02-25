# horseshoe command line interface

[![NPM](https://nodei.co/npm/horseshoe-cli.png?compact=true)](https://nodei.co/npm/horseshoe-cli/)

[![Build
Status](https://secure.travis-ci.org/lupomontero/horseshoe-cli.png)](http://travis-ci.org/lupomontero/horseshoe-cli) 
[![Dependency
Status](https://david-dm.org/lupomontero/horseshoe-cli.png)](https://david-dm.org/lupomontero/horseshoe-cli) 
[![devDependency Status](https://david-dm.org/lupomontero/horseshoe-cli/dev-status.png)](https://david-dm.org/lupomontero/horseshoe-cli#info=devDependencies)

```
➜  horseshoe -h

Usage:

horseshoe [ <options> ] <email1> [ <email2> ... ]

Options:

-s  --subject     The message subject.
-x  --text        The plain text message body.
-m  --html        HTML content.
-t  --tmpl        Handlebars template.
-p  --tmplPath    Path to Handlebars template files.
-d  --data        Data to be used as context for Handlebars template.
-c  --conf        Path to config file. Default is $HOME/.horseshoe.json
-j  --json        Output in JSON format.
-n  --no-colors   Dont do output colouring.
-h  --help        Show this screen you are looking at.
-v  --version     Show horseshoe's version number.

Examples:

1. Send plain text email using options:

horseshoe -s "the subject" -x "simple text body" you@example.com

2. Send plain text email piping body into horseshoe:

echo "the body" | horseshoe -s "the subject" you@example.com

3. Send email using template passing data as argument:

horseshoe -s "the subject" -t "foo" -d '{"name":"Lupo"}' you@example.com

4. Pipe a JSON object with data to render template:

echo '{"name":"Lupo"}' | horseshoe -s "the subject" -t foo you@example.com

5. Pipe a JSON array of messages into horseshoe's stdin:

(Assume each message object has the following properties: to, subject,
and either template and data or text or html)

cat messages.json | horseshoe
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/lupomontero/horseshoe-cli/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

