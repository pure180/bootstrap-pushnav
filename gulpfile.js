'use-strict';

// Set applikation dependencies
var bower = require('bower'),
    del = require('del'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpFilter = require('gulp-filter'),
    jshint = require('gulp-jshint'),
    plugins = require('gulp-load-plugins')(),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    webserver = require('gulp-webserver'),
    mainBowerFiles = require('main-bower-files'),
    underscore = require('underscore'),
    underscoreStr = require('underscore.string');


// Get configuration from config.json
var conf = require('./conf.json');

// Get data structures from sourcemap.json
var path = require('./sourcemap.json');

/* ################################################ *
 * Default build tasks
 * ################################################ */

gulp.task('build:jade', require('./gulp_task/jade')(gulp, plugins, path));
gulp.task('build:less-norm', require('./gulp_task/less')(gulp, plugins, path, false));
gulp.task('build:less-min', require('./gulp_task/less')(gulp, plugins, path, true));
gulp.task('build:less', ['build:less-norm', 'build:less-min']);
gulp.task('build:scripts', require('./gulp_task/scripts')(gulp, plugins, path));
gulp.task('build:images', require('./gulp_task/images')(gulp, plugins, path));
gulp.task('build:fonts', require('./gulp_task/fonts')(gulp, plugins, path));



gulp.task('clean', function() {
    return del([
      path.dist.html + '/**/*.html',
      path.dist.css + '/**/*.css',
      path.dist.js + '/**/*.js',
      path.dist.img + '/**/*.*',
      path.dist.fonts + '/**/*.*'
    ]);
});

gulp.task('watch', ['reload'], function(){
  gulp.watch( path.watch.jade, ['build:jade']);
  gulp.watch( path.watch.less, ['build:less']);
  gulp.watch( path.watch.bower, ['bower:js']);
  gulp.watch( path.watch.js, ['build:scripts']);
  gulp.watch( path.watch.img, ['build:images']);
  gulp.watch( path.watch.fonts, ['build:fonts']);
});

gulp.task('reload', function() {
    return gulp.src( path.dist.html )
    .pipe(webserver({
      livereload: conf.server.livereload,
      directoryListing: conf.server.directoryListing,
      open: conf.server.open,
      port: conf.server.port
    }));
});

gulp.task('start:compile', ['clean'], function(){
  gulp.start('build:jade', 'build:less', 'build:scripts', 'bower:js', 'bower:fonts', 'build:images', 'build:fonts');
});

gulp.task('start:production', ['bower:init', 'start:compile']);

gulp.task('start', ['start:compile', 'watch']);

/* ################################################ *
 * Bower Task
 * ################################################ */

gulp.task('bower:get', function(cb){
  bower.commands.install([], {save: true}, {})
    .on('end', function(installed){
      cb(); // notify gulp that this task is finished
    });
});

gulp.task('bower:js', function() {
  return gulp.src(mainBowerFiles('**/*.js'))
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(jshint( '.jshintrc'))
    .pipe(concat( 'libs.js' ))
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({
      message: 'Build <%= file.relative %>'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( path.dist.js ))
    .pipe(notify({
      message: 'Build <%= file.relative %>'
    }));
});

/* Copy Bower Fonts */
gulp.task('bower:fonts', function() {
  return copy([path.bower + '/bootstrap/fonts/**/*.*', path.bower + '/font-awesome/fonts/**/*.*'], path.dist.fonts);
});

/* Copy Bower Less */
gulp.task('bower:less', function() {
  return copy(path.bower + '/bootstrap/less/**/*.less', path.src.less + '/bootstrap'),
    copy(path.bower + '/font-awesome/less/**/*.less', path.src.less + '/font-awesome');
});

/*  Bower general task */
gulp.task('bower:init', ['bower:get'], function(){
  gulp.start('bower:js', 'bower:less', 'bower:fonts');
});



/* ################################################ *
 * Helper Functions
 * ################################################ */

var copy = function (src, dist) {
  return gulp.src( src )
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(gulp.dest( dist ));
};
