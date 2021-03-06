#!/usr/bin/env node

var path = require('path');
var Stream = require('stream');
var nopt = require("nopt");
var colors = require('colors');
var JSONStream = require('JSONStream');
var horseshoe = require('horseshoe');
var argv = process.argv.slice(2);

var knownOpts = {
  subject: String,
  text: String,
  html: String,
  tmpl: String,
  tmplPath: [ path, false ],
  data: String,
  conf: [ path, false ],
  json: Boolean,
  colors: Boolean,
  version: Boolean
};

var shorthands = {
  s: [ '--subject' ],
  x: [ '--text' ],
  m: [ '--html' ],
  t: [ '--tmpl' ],
  p: [ '--tmplPath' ],
  d: [ '--data' ],
  c: [ '--conf' ],
  j: [ '--json' ],
  n: [ '--no-colors' ],
  "?": [ '--help' ],
  h: [ '--help' ],
  v: [ '--version' ]
};

var defaults = {
  subject: null,
  text: null,
  html: null,
  tmpl: null,
  tmplPath: null,
  data: null,
  conf: process.env.HOME + '/.horseshoe.json',
  json: false,
  colors: true,
  help: false,
  version: false
};

var options = nopt(knownOpts, shorthands);

Object.keys(defaults).forEach(function (k) {
  if (!options.hasOwnProperty(k)) { options[k] = defaults[k]; }
});

if (options.version) {
  console.log(require('./package.json').version);
  process.exit(0);
}

// Disable colouring if asked to do so...
if (!options.colors) { colors.mode = 'none'; }

// We create a readable stream to be used for output.
function createTextResponse() {
  var s = new Stream(), code = 0;
  s.readable = true;
  s.on('error', function (err) {
    // Here we are assuming that err has a `message` property. Maybe we should
    // actually check this.
    console.error(('error: ' + err.message).red);
    code = 1;
  });
  s.on('warn', function (buf) { console.error(('warn: ' + buf).yellow); });
  s.on('data', function (buf) { console.log(('data: ' + buf).green); });
  s.on('end', function (buf) {
    if (arguments.length) { s.emit('data', buf); }
    if (code > 0) { console.error('error: See horseshoe -h for help.'.red); }
    process.exit(code);
  });
  return s;
}

function createJsonResponse() {
  var s = new Stream();
  var parser = JSONStream.stringify('[', ',', ']');
  var  code = 0;
  s.readable = true;
  s.on('error', function (err) { code = 1; parser.write({ error: err.message }); });
  s.on('warn', function (buf) { parser.write({ warn: buf }); });
  s.on('data', function (buf) { parser.write({ data: buf }); });
  s.on('end', function (buf) {
    if (arguments.length) { s.emit('data', buf); }
    parser.end();
  });
  parser.on('end', function () { process.exit(code); });
  parser.pipe(process.stdout);
  return s;
}

var res;
if (options.json) {
  res = createJsonResponse();
} else {
  res = createTextResponse();
}

// Try to load config file and make sure it has a valid transport type.
try {
  var config = require(options.conf);
  if ([ 'Sendmail', 'SMTP', 'SES' ].indexOf(config.type) < 0) {
    throw new Error('Config file MUST contain a "type" property with a value ' +
                    'of Sendmail, SMTP or SES.');
  }
  // Override `tmplPath` is passed as argument.
  if (options.tmplPath) { config.options.tmplPath = options.tmplPath; }
} catch (err) {
  res.emit('warn', [
    'In order to use horseshoe you need to have at least one configuration ',
    'file. The default location for this file is ' + process.env.HOME +
      '/.horseshoe.json.',
    'You can specify a different config file with the ' + '--conf'.bold +
      ' option. See ',
    'horseshoe --help'.bold + ' for more on this.',
    '',
    'This file should look something like this:',
    '',
    JSON.stringify({
      type: 'SMTP',
      options: {
        sender: 'Someone <you@example.com>',
        host: 'mail.example.com',
        port: 587,
        auth: {
          user: 'you@example.com',
          pass: 'xxxxxx'
        }
      }
    }, null, '  '),
    '',
    'More info about all the different options here:',
    'https://github.com/lupomontero/horseshoe',
    ''
  ].join('\n'));
  res.emit('error', err);
  process.exit(1);
}

if (options.help) {
  console.log([
    '',
    'Usage:'.bold,
    '',
    'horseshoe [ <options> ] <email1> [ <email2> ... ]',
    '',
    'Options:'.bold,
    '',
    '-s  ' + '--subject     '.grey + 'The message subject.',
    '-x  ' + '--text        '.grey + 'The plain text message body.',
    '-m  ' + '--html        '.grey + 'HTML content.',
    '-t  ' + '--tmpl        '.grey + 'Handlebars template.',
    '-p  ' + '--tmplPath    '.grey + 'Path to Handlebars template files.',
    '-d  ' + '--data        '.grey + 'Data to be used as context for Handlebars template.',
    '-c  ' + '--conf        '.grey + 'Path to config file. Default is $HOME/.horseshoe.json',
    '-j  ' + '--json        '.grey + 'Output in JSON format.',
    '-n  ' + '--no-colors   '.grey + 'Dont do output colouring.',
    '-h  ' + '--help        '.grey + 'Show this screen you are looking at.',
    '-v  ' + '--version     '.grey + 'Show horseshoe\'s version number.',
    '',
    'Examples:'.bold,
    '',
    '1. Send plain text email using options:',
    '',
    'horseshoe ' + '-s "the subject"'.green + ' -x "simple text body"'.yellow +
      ' you@example.com'.cyan,
    '',
    '2. Send plain text email piping body into horseshoe:',
    '',
    'echo ' + '"the body"'.yellow + ' | horseshoe' + ' -s "the subject"'.green +
      ' you@example.com'.cyan,
    '',
    '3. Send email using template passing data as argument:',
    '',
    'horseshoe ' + '-s "the subject"'.green + ' -t "foo"'.yellow +
      ' -d \'{"name":"Lupo"}\''.magenta + ' you@example.com'.cyan,
    '',
    '4. Pipe a JSON object with data to render template:',
    '',
    'echo ' + '\'{"name":"Lupo"}\''.magenta + ' | horseshoe ' +
      '-s "the subject"'.green + ' -t foo'.yellow + ' you@example.com'.cyan,
    '',
    '5. Pipe a JSON array of messages into horseshoe\'s stdin:',
    '',
    '(Assume each message object has the following properties: to, subject,'.grey,
    'and either template and data or text or html)'.grey,
    '',
    'cat messages.json | horseshoe',
    ''
  ].join('\n'));
  process.exit(0);
}

// Abstract horseshoe's `mailer.send()`.
function send(msg) {
  horseshoe(config.type, config.options).send(msg, function (err, response) {
    if (err) { return res.emit('error', err); }
    if (response.failedRecipients && response.failedRecipients.length) {
      response.failedRecipients.forEach(function (recipient) {
        res.emit('warn', 'Error sending to ' + JSON.stringify(recipient));
      });
    } else {
      res.emit('end', response.messageId);
    }
  });
}

// Helper function to get list of recipient emails from command line arguments
// and emit an error if no email addresses have been passed.
function getAndEnsureRecipientsFromArgs() {
  if (!options.argv.remain.length) {
    res.emit('error', new Error('At least one recipient is required!'));
  }
  return options.argv.remain.join(',');
}

// Handle cases where we don't expect anything from  stdin...
if (options.text && options.subject) {
  send({
    to: getAndEnsureRecipientsFromArgs(),
    subject: options.subject,
    text: options.text
  });
} else if (options.html) {
  send({
    to: getAndEnsureRecipientsFromArgs(),
    subject: options.subject,
    html: options.html
  });
} else if (options.tmpl && options.data) {
  // Put this block in a try/catch block as `JSON.parse` could throw.
  try {
    var data = JSON.parse(options.data);
    send({
      to: getAndEnsureRecipientsFromArgs(),
      subject: options.subject,
      template: options.tmpl,
      data: data
    });
  } catch (err) {
    res.emit('error', err);
  }
} else if (options.tmpl) {
  // Handle template data as input from stdin.
  var parser = JSONStream.parse(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.pipe(parser);
  parser.on('error', function (err) {
    console.error(err);
  });
  parser.on('data', function (chunk) {
    process.stdout.write('data: ' + chunk);
  });
  parser.on('end', function () {
    process.stdout.write('end');
  });
} else {
  // Use stdin as message body.
  var text = '';
  var parser = JSONStream.parse([ true ]);
  var stream = horseshoe(config.type, config.options).createStream();
  var isJSON = false;

  setTimeout(function () {
    if (!isJSON && !text) {
      res.emit('error', new Error('Waiting for stdin but nothing coming in :-S'));
      res.emit('end');
    }
  }, 1500);

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  stream.on('error', function (err) { res.emit('error', err); });
  stream.on('data', function (buf) { res.emit('data', buf.messageId); });
  stream.on('end', function (buf) {
    if (arguments.length) { res.emit('data', buf.messageId); }
    res.emit('end');
  });
  process.stdin.pipe(parser);
  parser.on('error', function (err) {
    if (isJSON) { res.emit('error', err); }
  });
  parser.on('data', function (buf) {
    isJSON = true;
    stream.write(buf);
  });
  parser.on('end', function () {
    if (isJSON) { stream.end(); }
  });

  process.stdin.on('data', function (buf) {
    if (isJSON) { return; }
    text += buf;
  });
  process.stdin.on('end', function () {
    if (isJSON) { return; }
    send({
      subject: options.subject,
      to: getAndEnsureRecipientsFromArgs(),
      text: text.trim()
    });
  });
}
