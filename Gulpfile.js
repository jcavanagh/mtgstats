var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

gulp.task('less', function () {
  return gulp.src('./public/**/*.less')
    .pipe(less())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('node', function () {
    nodemon({
    	script: 'app.js',
    	ext: 'js',
    	ignore: ['public/**/*', 'node_modules/**/*', 'bower_components/**/*']
    });
})

gulp.task('watch', ['node', 'less'], function() {
    gulp.watch('public/**/*.less', ['less']);
});