var gulp         = require('gulp'),
    shell        = require('gulp-shell'),
    postcss      = require('gulp-postcss'),
    atImport     = require('postcss-import'),
    cssnext      = require('postcss-cssnext'),
    cssnano      = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin      = require('gulp-htmlmin'),
    gzip         = require('gulp-gzip'),
    browserSync  = require('browser-sync').create(),
    reload       = browserSync.reload;

// styles
gulp.task('styles', function() {
  return gulp.src('_assets/src/style.css')
    .pipe(postcss([atImport(), cssnext()]))
    .pipe(cssnano({discardComments: {removeAll: true}}))
    .pipe(gulp.dest('_assets/css'));
});

// serve < styles
gulp.task('serve', ['styles'], function() {
  browserSync.init({
    server: {
      baseDir: '_site/'
    },
    notify: false
  });
  gulp.watch('_assets/src/**/*.css', ['styles']);
  gulp.watch('_assets/css/style.css').on('change', reload);
  gulp.watch('_site/**/*.*').on('change', reload);
});

// default (buildWatch) < serve < styles
gulp.task('default', ['serve'], shell.task(
  'JEKYLL_ENV=development bundle exec jekyll build --watch'
));


//     DDDDD    EEEEEE  PPPPP   LL      OOO   YY   YY
//     DD   DD  EE      PP   PP LL    OO   OO  YY YY
//     DD   DD  EEEEE   PPPPP   LL    OO   OO   YYY
//     DD   DD  EE      PP      LL    OO   OO   YY
//     DDDDDD   EEEEEE  PP      LLLLLL  OOO    YY


var path = '_site';

// build < styles
gulp.task('build', ['styles'], shell.task(
  // 'bundle exec jekyll build --destination ' + path
  'JEKYLL_ENV=production bundle exec jekyll build'
));

// minify < build < styles
gulp.task('minify', ['build'], function() {
  return gulp.src(path + '/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest(path));
});

// compress < minify < build < styles
gulp.task('compress', ['minify'], function () {
  return gulp.src(path + '/**/*.html')
    .pipe(gzip())
    .pipe(gulp.dest(path));
});

// deploy < compress < minify < build < styles
gulp.task('deploy', ['compress'], shell.task(
  'cd _site; rm -rf assets; git add -A; git commit -S -m "Deploy"; git push live master'
));
