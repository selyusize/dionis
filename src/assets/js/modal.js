const form = document.querySelector('.modal__feedback')
const formWrapper = document.querySelector('.modal__wrapper')
const btns = document.querySelectorAll('.open-feedback')

function openModal(e) {
	e.preventDefault()
	formWrapper.style.display =
		formWrapper.style.display === 'block' ? 'none' : 'block'
}

function closeModalOnClickOutside(e) {
	if (e.target === formWrapper) {
		formWrapper.style.display = 'none'
	}
}

export function initOpenModal() {
	btns.forEach(btn => btn.addEventListener('click', openModal))
	formWrapper.addEventListener('click', closeModalOnClickOutside)
}
