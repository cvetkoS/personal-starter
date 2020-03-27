var gulp = require('gulp');
var gulpclean = require('gulp-clean');
var sass = require('gulp-sass');
var sasslint = require('gulp-sass-lint');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var fs = require('fs-extra');
var fileinclude = require('gulp-file-include');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var svgSprite = require('gulp-svg-sprite');


sass.compiler = require('node-sass');


const plumberErrorHandler = {
	errorHandler: notify.onError({
		title: 'Makarenko :D',
		message: 'Pogrešio si: <%= error.message %>'
	})
};

const config = {
	mode: {
	  symbol: {
		dest: 'sprite',
		sprite: 'sprite.svg',
		example: false
	  }
	},
	svg: {
	  xmlDeclaration: false,
	  doctypeDeclaration: false
	}
  };


gulp.task('sass-lint', function () {
  return gulp.src([
      'src/scss/**/*.scss',
      '!src/scss/vendors/*.scss'
  ])
  .pipe(plumber(plumberErrorHandler))
  .pipe(sasslint({
	config: '.sass-lint.yml'
	}))
	.pipe(sasslint.format())
	.pipe(sasslint.failOnError());
});

gulp.task('sass', function() {
	return gulp.src('src/scss/**/*.scss')
	.pipe(plumber(plumberErrorHandler))
    .pipe(sourcemaps.init())
	.pipe(sass({ style: 'compressed' }).on('error', sass.logError))
	.pipe(rename('style.min.css'))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('./dist/css'));
});

gulp.task('js-lint', () => {
	return gulp.src(['src/js/**/*.js', '!src/js/_libs/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});


gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')
  	.pipe(plumber())
    .pipe(sourcemaps.init())
	.pipe(concat('global.js'))
	.pipe(babel({ presets: ['@babel/preset-env'] }))
	.pipe(uglify())
	.pipe(rename('global.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('assets', function() {
  return gulp.src(['src/assets/**/*', '!src/assets/images/svg/sprite/**/*.svg'])
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
      svgoPlugins: [
          {
              removeViewBox: true
          }
      ]
    }))
		.pipe(gulp.dest('dist/assets'));
});

gulp.task('sprite', function() {
	return gulp.src('src/assets/images/svg/sprite/**/*.svg')
		.pipe(svgSprite(config))
		.pipe(gulp.dest('dist/assets/images/svg'));
})

gulp.task('fileinclude', async function() {
	gulp.src(['src/html/index.html'])
	  .pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	  }))
	  .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', (done) => {
	gulp.watch('src/html/**/*.html', gulp.series('fileinclude'));
	gulp.watch('src/scss/**/*.scss', gulp.series('sass-lint', 'sass'));
	gulp.watch('src/js/**/*.js', gulp.series('js-lint', 'js'));
	done();
});

gulp.task('remove-dist', function(done) {
	fs.remove('./dist').then(function() {
		console.log('Dist is cleared!');
		done();
	});
});

gulp.task('default', gulp.series('remove-dist', 'fileinclude', 'js', 'sass', 'sprite', 'assets', 'watch'));
