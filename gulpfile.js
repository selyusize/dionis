const { src, dest, watch, series, parallel } = require('gulp')
const pug = require('gulp-pug')
const data = require('gulp-data')
const htmlmin = require('gulp-htmlmin')
const gulpif = require('gulp-if')
const { deleteAsync } = require('del')
const browserSync = require('browser-sync').create()
const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const fs = require('fs')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

// Пути
const paths = {
	src: 'src',
	pages: 'src/pages/**/*.pug',
	layouts: 'src/layouts/**/*.pug',
	includes: 'src/includes/**/*.pug',
	data: 'src/data',
	assets: {
		css: 'src/assets/css/**/*',
		js: 'src/assets/js/**/*',
		img: 'src/assets/img/**/*',
		static: 'src/static/**/*',
	},
	dist: 'dist',
}

// Очистка
function clean() {
	return deleteAsync([paths.dist])
}

// Загрузка данных сайта (один JSON/JS файл) для Pug
function loadData(file) {
	const dataPath = path.join(__dirname, paths.data, 'pages.json')
	if (fs.existsSync(dataPath)) {
		return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
	}
	return {}
}

// Pug -> HTML
function html() {
	return src(paths.pages)
		.pipe(plumber())
		.pipe(data(loadData))
		.pipe(
			pug({
				pretty: !isProd,
			})
		)
		.pipe(
			gulpif(
				isProd,
				htmlmin({
					collapseWhitespace: true,
					removeComments: true,
				})
			)
		)
		.pipe(rename({ extname: '.html' }))
		.pipe(dest(paths.dist))
		.pipe(browserSync.stream())
}

// Копирование ресурсов
function assetsCss() {
	return src(paths.assets.css)
		.pipe(dest(path.join(paths.dist, 'assets/css')))
		.pipe(browserSync.stream())
}

function assetsJs() {
	return src(paths.assets.js)
		.pipe(dest(path.join(paths.dist, 'assets/js')))
		.pipe(browserSync.stream())
}

// ИСПРАВЛЕНО: добавлен {encoding: false} для бинарных файлов
function assetsImg() {
	return src(paths.assets.img, { encoding: false })
		.pipe(dest(path.join(paths.dist, 'assets/img')))
		.pipe(browserSync.stream())
}

function staticFiles() {
	return src(paths.assets.static, { encoding: false })
		.pipe(dest(paths.dist))
		.pipe(browserSync.stream())
}

// Сервер разработки
function serve(done) {
	browserSync.init({
		server: {
			baseDir: paths.dist,
		},
		port: 3000,
		open: false,
	})
	done()
}

// Наблюдение за изменениями
function watcher() {
	watch(
		[paths.pages, paths.layouts, paths.includes, path.join(paths.data, '**/*')],
		html
	)
	watch(paths.assets.css, assetsCss)
	watch(paths.assets.js, assetsJs)
	watch(paths.assets.img, assetsImg)
	watch(paths.assets.static, staticFiles)
}

const build = series(
	clean,
	parallel(html, assetsCss, assetsJs, assetsImg, staticFiles)
)

const dev = series(
	() => {
		process.env.NODE_ENV = 'development'
		return Promise.resolve()
	},
	build,
	serve,
	watcher
)

const prod = series(() => {
	process.env.NODE_ENV = 'production'
	return Promise.resolve()
}, build)

exports.clean = clean
exports.build = build
exports.dev = dev
exports.prod = prod
exports.default = dev
