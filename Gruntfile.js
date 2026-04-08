module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'app/app.js',
          'app/app.routes.js',
          'app/components/**/*.js',
          'app/directives/**/*.js',
          'app/filters/**/*.js',
          'app/services/**/*.js'
        ],
        dest: 'dist/js/app.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/js/app.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    cssmin: {
      target: {
        files: {
          'dist/css/style.min.css': ['app/assets/css/**/*.css']
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['**/*.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'app/assets/images/',
            src: ['**/*'],
            dest: 'dist/images/'
          },
          {
            expand: true,
            cwd: 'bower_components/',
            src: ['**/*'],
            dest: 'dist/bower_components/'
          }
        ]
      }
    },

    connect: {
      server: {
        options: {
          port: 8080,
          base: 'app',
          hostname: 'localhost',
          livereload: true,
          open: true
        }
      }
    },

    watch: {
      files: ['app/**/*'],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['concat', 'uglify', 'cssmin', 'copy']);
  grunt.registerTask('serve', ['connect:server', 'watch']);
  grunt.registerTask('default', ['build']);
};
