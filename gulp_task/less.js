var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({advanced: true});

module.exports = function (gulp, plugins, path, min) {
  var minify = min;
  return function () {
    var less_task = function(src, dist, note){
      if (minify === false) {
        return gulp.src( src )
          .pipe(plumber(function (error) {
              gutil.log(error.message);
              this.emit('end');
          }))
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(autoprefixer({
                browsers: [
                  "Android 2.3",
                  "Android 4",
                  "Android >= 4",
                  "Chrome >= 20",
                  "ChromeAndroid >= 20",
                  "Firefox >= 24",
                  "Explorer >= 8",
                  "iOS >= 6",
                  "Opera >= 12",
                  "Safari >= 6"
                ],
                cascade: true
          }))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest( dist ))
          .pipe(notify({ message: note }));
      } else {
        return gulp.src( src )
          .pipe(plumber(function (error) {
              gutil.log(error.message);
              this.emit('end');
          }))
          .pipe(less())
          .pipe(autoprefixer({
                browsers: [
                  "Android 2.3",
                  "Android 4",
                  "Android >= 4",
                  "Chrome >= 20",
                  "ChromeAndroid >= 20",
                  "Firefox >= 24",
                  "Explorer >= 8",
                  "iOS >= 6",
                  "Opera >= 12",
                  "Safari >= 6"
                ],
                cascade: true
          }))
          .pipe(rename({suffix: '.min'}))
          .pipe(less({
              plugins: [cleancss]
          }))
          .pipe(gulp.dest( dist ))
          .pipe(notify({ message: note }));
        }
    };

    return less_task(path.src.less + '/*.less', path.dist.css, 'Build <%= file.relative %>' );

  };
};
