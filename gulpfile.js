"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const minify = require("gulp-csso");
const jsmin = require("gulp-jsmin");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const run = require("run-sequence");
const del = require("del");
const server = require("browser-sync").create();
const ghpages = require("gh-pages");

gulp.task("clean", () => {
  return del("build");
});

gulp.task("copy", () => {
  return gulp.src([
      'source/fonts/**',
      "source/img/**",
      "source/js/**"
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'))
    .pipe(server.stream({
      once: true
    }));
});

gulp.task("style", () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", () => {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task("scripts", () => {
  return gulp.src("source/js/**/*.js")
    .pipe(jsmin())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("watch:style", () => {
  return gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("style"));
});

gulp.task("watch:html", () => {
  return gulp.watch("source/*.html", gulp.series("html"));
});

gulp.task("watch:scripts", () => {
  return gulp.watch("source/js/**/*.js", gulp.series("scripts"));
});

gulp.task("watch:images", () => {
  return gulp.watch("source/img/**/*.{png,jpg,svg}", gulp.series("images"));
});

gulp.task("watch", gulp.parallel(
  "watch:html",
  "watch:style",
  "watch:scripts",
  "watch:images",
));

gulp.task("build", gulp.parallel(
  "clean",
  "copy",
  "style",
  "images",
  "html",
  "scripts"
));

gulp.task("server", () => {
  server.init({
    ui: false,
    notify: false,
    server: {
      baseDir: "build"
    }
  });
});

gulp.task("default", gulp.series(
  "build",
  gulp.parallel(
    "watch",
    "server"
  )
));

ghpages.publish("build");
