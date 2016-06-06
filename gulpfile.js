var gulp = require('gulp'),
    del = require('del');

var libs = [
  'bower_components/dat.gui/dat.gui.min.js',
  'bower_components/gl-matrix/dist/gl-matrix-min.js',
  'bower_components/mousetrap/mousetrap.min.js'
];

gulp.task('cleanup-pre', function(){
    return del('public/libs/*');
});

gulp.task('libs', function(){
    return gulp.src(libs).pipe(gulp.dest('public/libs'));
});

// Default task

gulp.task('default', ['cleanup-pre', 'libs']);
