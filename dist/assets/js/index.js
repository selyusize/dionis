import { initHeader } from '../js/header.js'
import { initOpenModal } from './modal.js'
import { initServicesInstrumentsSlider } from './sliders-about.js'
import { initReviewsSlider } from './sliders.js'

document.addEventListener('DOMContentLoaded', () => {
	initHeader()
	initReviewsSlider()
	initServicesInstrumentsSlider()
	initOpenModal()
})
