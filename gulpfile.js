const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

function style() {
  return gulp.src('app/scss/style.scss')
    .pipe(plumber({
      errorHandler: notify.onError()
    }))
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
}

function html() {
  return gulp.src('app/pug/index.pug')
    .pipe(plumber({
      errorHandler: notify.onError()
    }))
    .pipe(pug({
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
  gulp.watch('app/pug/**/*.pug', html);
  gulp.watch('dist/*.html').on('change', browserSync.reload);
}

exports.style = style;
exports.pug = html;
exports.watch = watch;
exports.default = gulp.parallel(style, html, watch);