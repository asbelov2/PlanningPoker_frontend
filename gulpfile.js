const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const concat = require('gulp-concat');

//compile scss into css
function style() {
  return gulp.src('app/scss/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError()
    }))
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

function html() {
  return gulp.src('app/pug/*.pug')
    .pipe(plumber({
      errorHandler: notify.onError()
    }))
    .pipe(pug({
      // Your options in here. for example:
  
        doctype: 'html',
        pretty: true
  
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp.src('app/images/*.png')
    .pipe(gulp.dest('dist/images/'));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "dist",
      index: "index.html"
    }
  });
  gulp.watch('app/scss/*.scss', style);
  gulp.watch('app/images/*.png', images);
  gulp.watch('app/pug/*.pug', html);
  gulp.watch('dist/*.html').on('change', browserSync.reload);
}

exports.style = style;
exports.pug = html;
exports.watch = watch;