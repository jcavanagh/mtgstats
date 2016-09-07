//Hack the paths together
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function () {
  return gulp.src('./**/*.less')
	.pipe(less())
	.pipe(concat('app.css'))
	.pipe(gulp.dest('./css'));
});

gulp.task('watch', ['node', 'less'], function() {
	gulp.watch('**/*.less', ['less']);
});
