// MODULES IMPORT
var gulp          = require('gulp');
var sass          = require('gulp-sass');
var concat        = require('gulp-concat');
var minifyCSS     = require('gulp-minify-css');
var autoprefixer  = require('gulp-autoprefixer');
var rename        = require('gulp-rename');
var imagemin      = require('gulp-imagemin');
var concat        = require('gulp-concat');
var uglify        = require('gulp-uglify');
var gcmq          = require('gulp-group-css-media-queries');
var browserSync   = require('browser-sync').create();
var del           = require('del');
var fs            = require('fs');




// WORK PATHS
var paths = {
  src: {
    base:     'src',
    markup:   'src',
    fonts:    'src/assets/fonts',
    icons:    'src/assets/icons',
    images:   'src/assets/images',
    scripts:  'src/assets/js',
    styles:   'src/assets/scss',
    vendor:  {
      styles: [
        'src/assets/vendor/bootstrap-sass/assets/stylesheets',
        'src/assets/vendor/slick-carousel/slick'
      ],
      scripts: [
        'src/assets/vendor/jquery/docs/jquery.js',
        'src/assets/vendor/bootstrap-sass/assets/javascripts/bootstrap.js',
        'src/assets/vendor/slick-carousel/slick/slick.js',
        'src/assets/vendor/wow/docs/wow.js'
      ],
      static: [
        'src/assets/vendor/bootstrap-sass/assets/fonts/**/*',
        'src/assets/vendor/slick-carousel/slick/fonts/**/*'
      ]
    }
  },

  dev: {
    base:     'dev',
    markup:   'dev',
    fonts:    'dev/fonts',
    icons:    'dev/icons',
    images:   'dev/images',
    scripts:  'dev/js',
    styles:   'dev/css',
  },

  dist: {
    base:     'docs',
    markup:   'docs',
    fonts:    'docs/fonts',
    icons:    'docs/icons',
    images:   'docs/images',
    scripts:  'docs/js',
    styles:   'docs/css',
  }
};




// DELETE FULL DEV DIRECTORY
gulp.task('main:clean', function() {
  return del( paths.dev.base );
});


// COPY HTML AND PHP CODE
gulp.task('main:markup', function() {
  return gulp
    .src( paths.src.markup+'/*.{html,php}' )
    .pipe( gulp.dest( paths.dev.base ));
});


// PROCESS SCSS
gulp.task('main:styles', function(){
  return gulp
    .src( paths.src.styles+'/styles.scss' )
    .pipe( sass() )
    .pipe( rename('styles.min.css') )
    .pipe( gulp.dest( paths.dev.styles ) )
});


// CONCAT JS
gulp.task('main:scripts', function() {
  return gulp
    .src( paths.src.scripts+'/**/*.js' )
    .pipe( concat('scripts.min.js') )
    .pipe( gulp.dest( paths.dev.scripts ));
});


// COPY IMAGES
gulp.task('main:images', function() {
  return gulp
    .src( paths.src.images+'/**/*' )
    .pipe( gulp.dest( paths.dev.images ));
});


// COPY FONTS
gulp.task('main:fonts', function() {
  return gulp
    .src( paths.src.fonts+'/**/*' )
    .pipe( gulp.dest( paths.dev.fonts ));
});


// RUN TASKS RELATED TO IMAGES / FONTS
gulp.task('main:static', 
  gulp.parallel('main:images', 'main:fonts') 
);




// DELETE FULL BUILD DIRECTORY
gulp.task('build:clean', function() {
  return del( paths.dist.base );
});


// COPY HTML AND PHP CODE
gulp.task('build:markup', function() {
  return gulp
    .src( paths.src.markup+'/*.{html,php}' )
    .pipe( gulp.dest( paths.dist.base ));
});


// PROCESS AND MINIFY SCSS
gulp.task('build:styles', function(){
  return gulp
    .src( paths.src.styles+'/styles.scss' )
    .pipe( sass() )
    .pipe( gcmq() )
    .pipe( minifyCSS() )
    .pipe( rename('styles.min.css') )
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'iOS 8']
    }))
    .pipe( gulp.dest( paths.dist.styles ) )
});


// CONCAT AND MINIFY JS
gulp.task('build:scripts', function() {
  return gulp
    .src( paths.src.scripts+'/**/*.js' )
    .pipe( uglify() )
    .pipe( concat('scripts.min.js') )
    .pipe( gulp.dest( paths.dist.scripts ));
});


// COPY AND OPTIMIZE IMAGES
gulp.task('build:images', function() {
  return gulp
    .src( paths.src.images+'/**/*' )
    .pipe( imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({ plugins: [{ removeViewBox: true }] })
    ]))
    .pipe( gulp.dest( paths.dist.images ));
});


// COPY FONTS
gulp.task('build:fonts', function() {
  return gulp
    .src( paths.src.fonts+'/**/*' )
    .pipe( gulp.dest( paths.dist.fonts ));
});


// COPY ICONS
gulp.task('build:icons', function() {
  return gulp
    .src( paths.src.icons+'/**/*' )
    .pipe( gulp.dest( paths.dist.icons ));
});


// COPY FAVICON
gulp.task('build:favicon', function() {
  return gulp
    .src( paths.src.icons+'/favicon.ico' )
    .pipe( gulp.dest( paths.dist.base ));
});


// RUN TASKS RELATED TO IMAGES / FONTS / ICONS
gulp.task('build:static', 
  gulp.parallel('build:images', 'build:fonts', 'build:icons', 'build:favicon')
);


// GENERATE FILES
gulp.task('build:createfiles', function(done){
  fs.writeFile( paths.dist.base+'/robots.txt', 'User-agent: *\nAllow: /', done );
  // fs.writeFile( paths.dist.base+'/readme.md', 'contents', done );
});




// PROCESS AND MINIFY VENDOR JS
gulp.task('vendor:scripts', function() {
  return gulp
    .src( paths.src.vendor.scripts )
    .pipe( uglify() )
    .pipe( concat('vendor.min.js') )
    .pipe( gulp.dest( paths.dev.scripts ))
    .pipe( gulp.dest( paths.dist.scripts ));
});


// PROCESS AND MINIFY VENDOR SCSS
gulp.task('vendor:styles', function(){
  return gulp
    .src( paths.src.styles+'/vendor.scss' )
    .pipe( sass({
      outputStyle: 'expanded',
      includePaths: paths.src.vendor.styles
    }))
    .pipe( minifyCSS() )
    .pipe( rename('vendor.min.css') )
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'iOS 8']
    }))
    .pipe( gulp.dest( paths.dev.styles ) )
    .pipe( gulp.dest( paths.dist.styles ) );
});




// RELOADS WEB SERVER
gulp.task('reload', function(done){
  browserSync.reload();
  done();
});


// SERVES DEV SITE
gulp.task('serve', function(done){
  browserSync.init({
    server: {
      baseDir: paths.dev.base
    }
  });
  done();
});




// CHANGE CONTROL AND TASK RUNNER
gulp.task('watch', function(){
  gulp.watch( paths.src.markup+'/**/*.{html,php}', gulp.series('main:markup', 'reload') );
  gulp.watch( paths.src.styles+'/**/*', gulp.series('main:styles', 'reload') );
  // gulp.watch( paths.src.scripts+'/**/*', gulp.series('main:scripts', 'reload') );
  // gulp.watch( paths.src.images+'/**/*', gulp.series('main:images', 'reload') );
  // gulp.watch( paths.src.fonts+'/**/*', gulp.series('main:fonts', 'reload') );
  // gulp.watch( paths.src.vendor+'/**/*.js', gulp.series('vendor:scripts', 'reload') );
  // gulp.watch( paths.src.vendor+'/**/*', gulp.series('vendor:styles', 'reload') );
});




// DEFAULT
gulp.task('default', gulp.series( 'main:clean', gulp.parallel('main:markup', 'main:styles'), 'serve', 'watch' ) );


// BUILD
gulp.task('build', gulp.series( 'build:clean', gulp.parallel( 'build:markup', 'build:styles'), 'build:createfiles' ) );




/*
TODO:
  - sourcemaps
  - why use pump
  - cachear imagenes
  - linter
  - https://github.com/RealFaviconGenerator/gulp-real-favicon
*/
