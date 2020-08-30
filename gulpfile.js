const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('gulp-buffer');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

function js() {
  return browserify('app/js/app.js', {
    debug: true
  })
    .transform(babelify, {
      presets: [ '@babel/preset-env' ],
      plugins: [ '@babel/transform-runtime', '@babel/plugin-proposal-class-properties' ],
      sourceMaps: true
    })
    .bundle()
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe(rename('index.min.js'))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

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
      baseDir: 'dist',
      index: 'index.html'
    },
    ghostMode: false
  });
  gulp.watch('app/scss/*.scss', style);
  gulp.watch('app/images/*.png', images);
  gulp.watch('app/pug/**/*.pug', html);
  gulp.watch('app/js/*.js', js);
  gulp.watch('dist/*.html').on('change', browserSync.reload);
}

exports.style = style;
exports.pug = html;
exports.watch = watch;
exports.js = js;
exports.default = gulp.parallel(style, html, watch, images, js);