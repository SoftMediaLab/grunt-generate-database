module.exports = function(grunt) {
    "use strict";
  
    grunt.initConfig({

      env : {
        dev : {
          src : "./environment/dev.json",
        },
        prod : {
          src : "./environment/prod.json",
        },
        test : {
          src : "./environment/test.json",
        },
      },

      concurrent: {
        dev: {
          tasks: ['nodemon:debug', 'watch'],
          options: {
            logConcurrentOutput: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
          }
        }
      },

      nodemon: {
        debug: {
          script: './bin/www',
          options: {
            nodeArgs: ['--debug'],
          }
        },
        run: {
          script: './bin/www',
          options: {
            nodeArgs: [],
          }
        }
      },

      execute: {
        DB: {
            src: ['./dist/dbscript/generateDB.js']
        },
        Triggers: {
           src: ['./dist/dbscript/generateTriggers.js']
        },
        TriggerFuncs: {
          src: ['./dist/dbscript/generateTriggerFuncs.js']
       },
        DBTests:{
          src: ['./dist/DBTests/testDB.js']
        }
    },
      
      ts: {
        app: {
          files: [{
            src: ["src/\*\*/\*.ts", "!src/.baseDir.ts", "!src/_all.d.ts"],
            dest: "./dist"
          },],
          options: {
            rootDir: "src",
            module: "commonjs",
            noLib: false,
            target: "es6",
            moduleResolution: "node",
            sourceMap: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true
          }
        },

        test: {
          files: [{
            src: ["src/\*\*/\*.ts", 'test/**/*.ts'],
            dest: "./test/dist"
          },],
          
          options: {
            rootDir: "",
            module: 'commonjs',
            noLib: false,
            target: "es6",
            moduleResolution: "node",
            sourceMap: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true
          }
        }
      },
      
      tslint: {
        options: {
          configuration: "tslint.json"
        },
        files: {
          src: ["src/\*\*/\*.ts"]
        }
      },

      watch: {
        ts: {
          files: ["js/src/\*\*/\*.ts", "src/\*\*/\*.ts", "src/\*\*/\*.jade", "src/\*\*/\*.css"],
          tasks: ["ts:app", "tslint", "copy"]
        }
      },

      copy: {
        static: {
          expand: true,
          cwd: 'src/static',
          src: ['**'],
          dest: 'dist/static'
        },
        template:{
          expand: true,
          cwd: 'src/tasks',
          src: ['**/**/*.njk'],
          dest: 'dist/tasks'
        }
      },

      mochaTest: {
        test: {
          options: {
            log: true,
            run: true
          },
          src: ['test/**/*.js']
        },
      },

      makeHistory:{
        make:
        {
          files:[{
          expand: true,
          cwd: 'src/models',
          src: ['**/*.ts'],          
          dest: 'src/_autogenerated_historymodels',
        }],
        oneFile:false
        }
      },
      makeView:{
        make:
        {
          files:[{
          expand: true,
          cwd: 'src/models',
          src: ['**/*.ts'],
          dest: 'src/_autogenerated_viewmodels',
        }],
        oneFile:true
        }
      },
      
      makeTableMaker:{
        make:
        {
        destinationDB: "src/dbscript/",
        reCreate:true,
        pathToDeclaration:"./src/dbscript/declaration.json",
        baseModelPath:"./src/models/",
        pathToHistory:"./src/_autogenerated_historymodels/",
        absolutePathToHistory: "./src/_autogenerated_historymodels/common.ts"
      },
    },
  });
  
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadTasks('dist/tasks/makeHistory');
    grunt.loadTasks('dist/tasks/makeView');
    grunt.loadTasks('dist/tasks/makeTableMaker');

    grunt.registerTask("default", [
      "nodemon:run"
    ]);

    grunt.registerTask("maketables", [
      "makeHistory","makeView","env:prod",
      "ts:app", "tslint","copy","makeTableMaker" ,"ts:app", "tslint", 
    "copy","execute:DB"]);

    grunt.registerTask("testsWithRecreate", [
      "env:prod","execute:DB","execute:DBTests"
        ]);
      
    grunt.registerTask("testsWithoutRecreate", [
      "env:prod","execute:DBTests"
        ]);

    grunt.registerTask("debugVS", [
      "env:prod", "build", "nodemon:debug"
    ]);

    grunt.registerTask("debug", [
      "env:dev", "concurrent"
    ]);

    grunt.registerTask("release", [
      "env:prod", "concurrent"
    ]);

    grunt.registerTask("test", [
      "env:test", "ts:test",  "mochaTest"
    ]);

    grunt.registerTask("build", [
      "ts:app", "tslint", "copy"
    ]);

    grunt.registerTask("deploy", [
      "env:prod", "concurrent"
    ]);
  };