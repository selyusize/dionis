// Конфигурация слайдера по умолчанию
const defaultConfig = {
	autoplayDelay: 4000, // Задержка автопрокрутки в мс
	transitionDuration: 600, // Длительность анимации в мс
	slideGap: 20, // Отступ между карточками в px
}

// Функция инициализации слайдера
export function initReviewsSlider(userConfig = {}) {
	const config = { ...defaultConfig, ...userConfig }

	// Получаем элементы
	const track = document.getElementById('slider-track')
	const prevBtns = document.querySelectorAll('.controller.prev')
	const nextBtns = document.querySelectorAll('.controller.next')
	const cards = document.querySelectorAll('.review-card')

	if (!track || !cards.length) {
		console.warn('Slider elements not found')
		return
	}

	let currentIndex = 0
	let autoplayInterval

	// Хранилище для блокировки отдельных кнопок (WeakSet безопасен для DOM-элементов)
	const lockedButtons = new WeakSet()

	// Функция для получения максимального индекса
	function getMaxIndex() {
		const trackWidth = track.parentElement.offsetWidth
		const slideWidth = getSlideWidth()
		const totalWidth = track.scrollWidth
		const maxScroll = totalWidth - trackWidth
		return slideWidth === 0 ? 0 : Math.floor(maxScroll / slideWidth)
	}

	// Функция для расчета ширины слайда
	function getSlideWidth() {
		if (cards.length === 0) return 0
		const firstCard = cards[0]
		return firstCard.offsetWidth
	}

	// Функция для перемещения слайдера
	// принимаем флаг manual для анимации и опционально элемент кнопки (clickedBtn) чтобы ничего не менять внутри move
	function moveSlider(index, manual = false) {
		const slideWidth = getSlideWidth()
		const offset = -slideWidth * index

		track.style.transition = `transform ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
		track.style.transform = `translateX(${offset}px)`

		updateButtons()
	}

	// Функция для обновления состояния кнопок
	function updateButtons() {
		const maxIndex = getMaxIndex()

		prevBtns.forEach(btn => {
			const isLocked = lockedButtons.has(btn)
			if (currentIndex === 0 || isLocked) {
				btn.classList.add('disable')
				btn.classList.remove('active')
				btn.disabled = true
			} else {
				btn.classList.remove('disable')
				btn.classList.add('active')
				btn.disabled = false
			}
		})

		nextBtns.forEach(btn => {
			const isLocked = lockedButtons.has(btn)
			if (currentIndex >= maxIndex || isLocked) {
				btn.classList.add('disable')
				btn.classList.remove('active')
				btn.disabled = true
			} else {
				btn.classList.remove('disable')
				btn.classList.add('active')
				btn.disabled = false
			}
		})
	}

	// Функции перехода
	function nextSlide() {
		const maxIndex = getMaxIndex()
		if (currentIndex < maxIndex) {
			currentIndex++
			moveSlider(currentIndex, true)
		}
	}

	function prevSlide() {
		if (currentIndex > 0) {
			currentIndex--
			moveSlider(currentIndex, true)
		}
	}

	// Запуск автопрокрутки
	function startAutoplay() {
		stopAutoplay()
		autoplayInterval = setInterval(() => {
			const maxIndex = getMaxIndex()

			if (currentIndex < maxIndex) {
				currentIndex++
				moveSlider(currentIndex, false)
			} else {
				// Возвращаемся к началу для бесконечной прокрутки
				currentIndex = 0
				moveSlider(currentIndex, false)
			}
		}, config.autoplayDelay)
	}

	// Остановка автопрокрутки
	function stopAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval)
			autoplayInterval = null
		}
	}

	// Помогает "локировать" кнопку и затем автоматически её "разблокировать" после анимации
	function lockButtonTemporarily(btn) {
		if (!btn) return
		lockedButtons.add(btn)
		updateButtons()

		// разблокируем после анимации (с небольшим запасом)
		const delay = Math.max(0, config.transitionDuration + 20)
		setTimeout(() => {
			lockedButtons.delete(btn)
			updateButtons()
		}, delay)
	}

	// Обработчики событий для кнопок — теперь блокируется только кликнутая кнопка
	prevBtns.forEach(btn => {
		btn.addEventListener('click', e => {
			// если кнопка уже заблокирована — игнорируем клик
			if (lockedButtons.has(btn)) return

			// блокируем только эту кнопку
			lockButtonTemporarily(btn)

			// выполняем переход, останавливаем/перезапускаем автоплей
			if (currentIndex > 0) {
				prevSlide()
				stopAutoplay()
				startAutoplay()
			}
		})
	})

	nextBtns.forEach(btn => {
		btn.addEventListener('click', e => {
			// если кнопка уже заблокирована — игнорируем клик
			if (lockedButtons.has(btn)) return

			const maxIndex = getMaxIndex()
			if (currentIndex >= maxIndex) return

			// блокируем только эту кнопку
			lockButtonTemporarily(btn)

			// выполняем переход, останавливаем/перезапускаем автоплей
			nextSlide()
			stopAutoplay()
			startAutoplay()
		})
	})

	// Пауза при наведении
	track.addEventListener('mouseenter', stopAutoplay)
	track.addEventListener('mouseleave', startAutoplay)

	// Обработка изменения размера окна
	let resizeTimer
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer)
		resizeTimer = setTimeout(() => {
			const maxIndex = getMaxIndex()
			if (currentIndex > maxIndex) {
				currentIndex = maxIndex
			}
			track.style.transition = 'none'
			moveSlider(currentIndex, false)
			// allow reflow then restore transition
			setTimeout(() => {
				track.style.transition = ''
			}, 50)
		}, 250)
	})

	// Инициализация
	updateButtons()
	startAutoplay()

	// Возвращаем API для управления слайдером
	return {
		next: () => {
			// если вызывают из API — не блокируем кнопки, просто выполняем переход (можно изменить)
			nextSlide()
		},
		prev: () => {
			prevSlide()
		},
		goTo: index => {
			const maxIndex = getMaxIndex()
			if (index >= 0 && index <= maxIndex) {
				currentIndex = index
				moveSlider(currentIndex, true)
			}
		},
		start: startAutoplay,
		stop: stopAutoplay,
		destroy: () => {
			stopAutoplay()
			track.style.transition = ''
			track.style.transform = ''
		},
	}
}
