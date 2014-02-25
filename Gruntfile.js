module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [ 'Gruntfile.js', 'index.js', 'test/**/*.js' ]
    },

    nodeunit: {
      files: [ 'test/test-*.js' ]
    }

  });

  // Default task.
  grunt.registerTask('default', [ 'jshint', 'nodeunit' ]);

};
