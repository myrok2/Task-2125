var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./css/**/*.scss'],
};

gulp.task('default', ['watch', 'sass']);

gulp.task('sass', function () {
    gulp.src(paths.sass)
      .pipe(sourcemaps.init())
      .pipe(sass({errLogToConsole: true}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./css'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});
