var path = require('path');
var cp = require('child_process');
var bin = require.resolve('../');
var _ = require('lodash');

exports['no config file'] = function (t) {
  var env = _.extend({}, process.env, { HOME: __dirname });
  cp.exec(bin, { env: env }, function (err, stdout, stderr) {
    t.ok(err instanceof Error);
    t.equal(stdout, '');
    t.ok(/\.horseshoe\.json/.test(stderr));
    t.done();
  });
};

//exports['without args and no stdin we get error'] = function (t) {
//  cp.exec(bin, function (err, stdout, stderr) {
//    t.ok(err instanceof Error);
//    t.ok(/waiting for stdin/i.test(err.message));
//    t.done();
//  });
//};

//exports['horseshoe -h'] = function (t) {
//  cp.exec(bin + ' -h --no-colors', function (err, stdout, stderr) {
//    t.ok(!err);
//    t.ok(/Usage/.test(stdout));
//    t.equal(stderr, '');
//    t.done();
//  });
//};

