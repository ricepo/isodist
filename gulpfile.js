/**
 * gulpfile.js
 *
 * @author  Denis Luchkin-Zhou <denis@ricepo.com>
 * @license MIT
 */

const gulp         = require('gulp');

const del          = require('del');
const isci         = require('is-ci');
const babel        = require('gulp-babel');
const eslint       = require('gulp-eslint');
const notify       = require('gulp-notify');
const changed      = require('gulp-changed');
const sourcemaps   = require('gulp-sourcemaps');


/*!
 * Load plugin configuration files.
 */
const out          = 'lib';


/*!
 * Default build target.
 */
gulp.task('default', [ 'rebuild' ]);


/*!
 * Delete previous builds.
 */
gulp.task('clean', () =>
  del([ out + '/**' ])
);


/*!
 * Incremental build (use with watch).
 */
const build = function() {

  const stream = gulp.src([ 'src/**/*.js' ], { base: 'src' })
    .pipe(changed(out))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(out));

  if (isci) { return stream; }
  return stream.pipe(notify({ message: 'Build Successful', onLast: true }));
};
gulp.task('build', [ 'lint' ], build);
gulp.task('rebuild', [ 'relint' ], build);


/*!
 * Lint all source files.
 */
const lint = function() {

  return gulp.src([ 'src/**/*.js' ])
    .pipe(changed(out))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

};
gulp.task('lint', lint);
gulp.task('relint', [ 'clean' ], lint);


/*!
 * Automatically rebuild on save.
 */
gulp.task('watch', [ 'rebuild' ], () => {
  gulp.watch('src/**/*.*', [ 'build' ]);
});
