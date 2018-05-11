var gulp = require('gulp');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var gulpFn = require('gulp-fn');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var fs = require('fs');

var unique_string = function(files, config){
	var str = '';
	for (var i = 0; i < files.length; i++) {
		str += files[i] + fs.statSync(files[i]).mtime;
	}
	return str + config.way + config.prefix;
}

module.exports = function gulpJsMinify(config) {
	var name = 'lab';
	if(config.name) name = config.name;
	if(config.production) var files = config.productionFiles;
	else var files = config.files;
	if (fs.existsSync(config.way + name + '-min.js')) {
		var data = fs.readFileSync(config.way + name + '-min.js', 'utf8');
		var lines = data.split("\n");
		if (lines[lines.length - 1].indexOf(unique_string(files, config)) > -1) return;
	}
	var once = true;
	gulp.src(files)
	.pipe(sourcemaps.init())
	.pipe(concat(name + '.js'))
	.pipe(ngAnnotate())
	.pipe(sourcemaps.write())
	.pipe(minify({
		mangle: ['sharedData','angular']
	})).pipe(gulp.dest(config.way))
	.pipe(gulpFn(function() {
		if(once){
			once = false;
			fs.appendFile(config.way + name + '-min.js', '\r\n/*' + unique_string(files, config) + '*/', function(err) {});
		}
	}));
};
