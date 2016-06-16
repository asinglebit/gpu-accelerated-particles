var gulp = require('gulp'),
del = require('del'),
gp_concat = require('gulp-concat'),
gp_minify = require('gulp-minifier'),
gp_cssmin = require('gulp-cssmin');

var libs = [
  'bower_components/dat.gui/dat.gui.min.js',
  'bower_components/gl-matrix/dist/gl-matrix-min.js',
  'bower_components/mousetrap/mousetrap.min.js'
];

var views = [
  'public/index.html'
];

var application = [
  'bower_components/dat.gui/dat.gui.min.js',
  'bower_components/gl-matrix/dist/gl-matrix-min.js',
  'bower_components/mousetrap/mousetrap.min.js',
  'public/scripts/application/application.js',
  'public/scripts/application/renderer.js',
  'public/scripts/application/camera.js',
  'public/scripts/application/utilities.js',
  'public/scripts/shaders/full_screen_quad.js',
  'public/scripts/shaders/particles_init.js',
  'public/scripts/shaders/particles_move.js',
  'public/scripts/shaders/particles_draw.js',
  'public/scripts/index.js'
];

var styles = [
  'public/styles/layout.css'
];

gulp.task('cleanup-pre', function(){
  return del('public/libs/*');
});

gulp.task('libs', function(){
  return gulp.src(libs).pipe(gulp.dest('public/libs'));
});

// Default task

gulp.task('default', ['cleanup-pre', 'libs']);

// Build task

gulp.task('cleanup-pre', function(){
  return del('public/dist/*');
});

gulp.task('views', ['cleanup-pre'], function(){
  return gulp.src(views)
  .pipe(gulp.dest('public/dist'));
});

gulp.task('application', ['cleanup-pre'], function(){
  return gulp.src(application)
  .pipe(gp_concat('scripts.min.js'))
  //.pipe(gp_minify({minify: true, minifyJS: true}))
  .pipe(gulp.dest('public/dist'));
});

gulp.task('styles', ['cleanup-pre'], function(){
  return gulp.src(styles)
  .pipe(gp_concat('stylesheets.min.css'))
  .pipe(gp_cssmin())
  .pipe(gulp.dest('public/dist'));
});

gulp.task('build', ['cleanup-pre', 'views', 'application', 'styles']);
