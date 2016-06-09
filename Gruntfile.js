/*jslint node: true */
"use strict";


module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //connect
    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 8282
        }
      }
    },
    //grunt server
    'http-server': {
      'dev': {
        port: 8282,
        openBrowser: true
      }
    },
    wiredep: {
      task: {
        src: ['index.html']
      }
    },
    files: {
      'index.html': [
        'index.js',
        'dashboard/*.js',
        'layout/*.js',
        'css/*.css',
      ],
    }

  });

  grunt.loadNpmTasks('grunt-http-server');
};
