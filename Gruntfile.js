var liveReload = require('connect-livereload');
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  // Load all plugins named with the "grunt-" prefix
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
  grunt.initConfig({

    watch: {
      reload: {
        files: [
          'lib/**/*',
        ],
        options: {
          livereload: true
        }
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      server: {
        options: {
          middleware: function(connect) {
            return [
              liveReload(),
              mountFolder(connect, 'lib'),
              mountFolder(connect, 'bower_components')
            ];
          }
        }
      },
    },
  });

  grunt.registerTask('default', ['connect', 'watch']);

}
