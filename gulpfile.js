/*
Copyright 2014 Spotify AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* global require */

var gulp = require('gulp');
var qunit = require('gulp-qunit');
var jshint = require('gulp-jshint');
var htmlhint = require("gulp-htmlhint");

gulp.task('test', function() {
    return gulp.src('./test.html').pipe(qunit());
});

gulp.task('jslint', function() {
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('htmllint', function() {
    return gulp.src(["*.html", "!test.html"])
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(htmlhint.failReporter());
});
