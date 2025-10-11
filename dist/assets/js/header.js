const hero = document.querySelector('section:nth-child(1)')
const header = document.querySelector('header')
const backgroundHero = getComputedStyle(hero).backgroundColor

const state = {
	isFixed: false,
	theme: 'white',
	isWhiteHero: false,
}

const setFixedPositionHeader = () => {
	const height = 800
	const scrollPosition = document.documentElement.scrollTop
	const scrollHiddenPointer = 700

	state.isFixed = scrollPosition > height

	if (scrollPosition >= scrollHiddenPointer && !state.isFixed) {
		header.style.transform = 'translateY(-100%)'
	} else {
		header.style.transform = 'translateY(0)'
	}

	header.classList.toggle('fixed', state.isFixed)

	backgroundHero == 'rgb(250, 250, 252)'
		? (state.isWhiteHero = true)
		: (state.isWhiteHero = false)

	header.classList.toggle(`header--theme-fixed-${state.theme}`, state.isFixed)

	header.classList.toggle(`header__for-bg-theme`, state.isWhiteHero)
}

window.addEventListener('scroll', setFixedPositionHeader)

export const initHeader = () => {
	setFixedPositionHeader()
}
