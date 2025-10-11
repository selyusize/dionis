const defaultConfig = {
	autoplayDelay: 4000,
	transitionDuration: 600,
	slideGap: 16, // Gap between slides in px
}

export function initServicesInstrumentsSlider(userConfig = {}) {
	const config = { ...defaultConfig, ...userConfig }

	const track = document.querySelector('.slider-techs__track')
	const prevBtns = document.querySelectorAll(
		'.slider-techs__controll .controller.prev'
	)
	const nextBtns = document.querySelectorAll(
		'.slider-techs__controll .controller.next'
	)
	const cards = document.querySelectorAll('.slider-item')
	const progressBar = document.querySelector(
		'.slider-scroll-progress .progress'
	)

	if (!track || !cards.length || !progressBar) {
		console.warn('Services instruments slider elements not found')
		return
	}

	let currentIndex = 0
	let autoplayInterval
	const lockedButtons = new WeakSet()

	function getMaxIndex() {
		return cards.length - 1
	}

	function getSlideWidth() {
		if (cards.length === 0) return 0
		return cards[0].offsetWidth
	}

	function updateProgressBar() {
		const totalSlides = cards.length
		const progressWidth = ((currentIndex + 1) / totalSlides) * 100
		progressBar.style.setProperty('--progress-width', `${progressWidth}%`)
	}

	function moveSlider(index, manual = false) {
		const slideWidth = getSlideWidth()
		const offset = -(slideWidth + config.slideGap) * index // Include gap in offset
		track.style.transition = manual
			? `transform ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
			: ''
		track.style.transform = `translateX(${offset}px)`

		updateButtons()
		updateProgressBar()
	}

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

	function nextSlide() {
		if (currentIndex < getMaxIndex()) {
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

	function startAutoplay() {
		stopAutoplay()
		autoplayInterval = setInterval(() => {
			if (currentIndex < getMaxIndex()) {
				currentIndex++
				moveSlider(currentIndex, false)
			} else {
				currentIndex = 0
				moveSlider(currentIndex, false)
			}
		}, config.autoplayDelay)
	}

	function stopAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval)
			autoplayInterval = null
		}
	}

	function lockButtonTemporarily(btn) {
		if (!btn) return
		lockedButtons.add(btn)
		updateButtons()
		const delay = Math.max(0, config.transitionDuration + 20)
		setTimeout(() => {
			lockedButtons.delete(btn)
			updateButtons()
		}, delay)
	}

	prevBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			if (lockedButtons.has(btn)) return
			lockButtonTemporarily(btn)
			if (currentIndex > 0) {
				prevSlide()
				stopAutoplay()
				startAutoplay()
			}
		})
	})

	nextBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			if (lockedButtons.has(btn)) return
			if (currentIndex >= getMaxIndex()) return
			lockButtonTemporarily(btn)
			nextSlide()
			stopAutoplay()
			startAutoplay()
		})
	})

	track.addEventListener('mouseenter', stopAutoplay)
	track.addEventListener('mouseleave', startAutoplay)

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
			setTimeout(() => {
				track.style.transition = ''
			}, 50)
		}, 250)
	})

	updateButtons()
	updateProgressBar()
	startAutoplay()

	return {
		next: () => nextSlide(),
		prev: () => prevSlide(),
		goTo: index => {
			if (index >= 0 && index <= getMaxIndex()) {
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
			progressBar.style.setProperty('--progress-width', '0%')
		},
	}
}
