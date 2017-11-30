const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const del = require('del');
const run = require('run-sequence');
const path = require('path');
const ghPages = require('gulp-gh-pages');

gulp.task('clean', function() {
  return del('build');
});

gulp.task("copy", function() {
  return gulp.src([
  "fonts/**/*.{woff,woff2}",
  "img/**",
  "js/**"
  ], {
  base: "."
  })
  .pipe(gulp.dest("build"))
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('html', function() {
  return gulp.src('*.html')
  .pipe(gulp.dest('build'))
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('style', function() {
  return gulp.src('sass/style.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 1 version',
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Edge versions',
        'last 2 Opera version'
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('images', function() {
  return gulp.src('build/img/**/*.{png,jpg,gif}')
    .pipe(gulp.dest('build/img'))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('build', function(fn) {
  run(
    'clean',
    'copy',
    'html',
    'style',
    'images',
    fn
  );
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: 'build'
    },
    notify: false,
    open: true,
    port: 8080
  });
  gulp.watch('sass/**/*.scss', ['style']);
  gulp.watch('*.html', ['html']);
});

gulp.task('default', ['build', 'serve']);

gulp.task('clean-publish', function() {
  return del('.publish');
});

gulp.task('ghPages', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

gulp.task('deploy', function(fn) {
  run(
    'clean-publish',
    'build',
    'ghPages',
    fn
  );
});
