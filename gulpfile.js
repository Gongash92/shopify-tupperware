var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssvariables = require('postcss-css-variables');
var calc = require('postcss-calc');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var purgecss = require('gulp-purgecss');

// js file paths
var utilJsPath = 'node_modules/codyhouse-framework/main/assets/js';
var componentsJsPath = 'js/**/*.js'; // component js files
var scriptsJsPath = 'assets'; //folder for final scripts.js/scripts.min.js files



// function reload(done) {
//   browserSync.reload();
//   done();
// }

var cssFolder = 'assets'; // folder for final style.css/style-custom-prop-fallbac.css files
var scssFilesPath = 'scss/**/*.scss'; // scss files to watch

gulp.task('sass', function () {
  return gulp.src(scssFilesPath)
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(rename('style.css.liquid'))
    .pipe(replace('"{{', '{{'))
    .pipe(replace('}}"', '}}'))
    .pipe(gulp.dest(cssFolder));
  // if you need to support IE11 and below:
  // 1 - remove ; from the above line 👆
  // 2 - uncomment 3 lines below 👇
  // .pipe(rename('style-fallback.css.liquid'))
  // .pipe(postcss([cssvariables(), calc()]))
  // .pipe(gulp.dest(cssFolder));
});

gulp.task('scripts', function () {
  return gulp.src([utilJsPath + '/util.js', componentsJsPath])
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(scriptsJsPath))
    .pipe(rename('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(scriptsJsPath));
});

gulp.task('watch', gulp.series(['sass', 'scripts'], function () {
  gulp.watch(scssFilesPath, gulp.series(['sass']));
  gulp.watch(componentsJsPath, gulp.series(['scripts']));
}));

gulp.task('dist', async function () {
  await purgeCSS();
  console.log('Distribution task completed!')
});

function purgeCSS() {
  return new Promise(function (resolve, reject) {
    var stream = gulp.src(cssFolder + '/style.css.liquid')
      .pipe(purgecss({
        content: ['templates/*.liquid', 'layout/*.liquid', 'sections/*.liquid', 'snippets/*.liquid'],
        safelist: ['.is-hidden', '.is-visible', '.select', '.inline-block', '.js-select', '.tabs', 'js-tabs', '.tabs__control'],
        defaultExtractor: content => content.match(/[\w-/:%@]+(?<!:)/g) || []
      }))
      .pipe(gulp.dest(cssFolder));

    stream.on('finish', function () {
      resolve();
    });
  });
};
