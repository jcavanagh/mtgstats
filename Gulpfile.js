//Hack the paths together
process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var metagameSync = require('data/match/metagame');
var personalSync = require('data/match/personal');

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

gulp.task('sync_personal', function() {
	console.log('Syncing personal...');
	personalSync.sync();
});

gulp.task('sync_metagame', function() {
	console.log('Syncing metagame...');
	scgSync.sync();
});