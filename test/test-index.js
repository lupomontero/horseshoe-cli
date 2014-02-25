var path = require('path');
var cp = require('child_process');
var bin = require.resolve('../');

exports['without args and no stdin we get error'] = function (t) {
  cp.exec(bin, function (err, stdout, stderr) {
    t.ok(err instanceof Error);
    t.ok(/waiting for stdin/i.test(err.message));
    t.done();
  });
};

exports['horseshoe -h'] = function (t) {
  cp.exec(bin + ' -h --no-colors', function (err, stdout, stderr) {
    t.ok(!err);
    t.ok(/Usage/.test(stdout));
    t.equal(stderr, '');
    t.done();
  });
};

exports['foo?'] = function (t) {
  cp.exec(bin + ' --no-colors -s "test" -x "hallo" lupomontero@gmail.com', function (err, stdout, stderr) {
    console.log(err, stdout, stderr);
    //t.ok(!err);
    //t.ok(/Usage/.test(stdout));
    //t.equal(stderr, '');
    t.done();
  });
};

