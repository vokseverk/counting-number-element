class CountingNumber extends HTMLElement {
	static defaults = {
		value: 0,
		targetValue: 0,
		duration: 1000,
		delay: 0,
		decimals: 0,
		culture: 'en-US'
	}

	constructor() {
		super()
		this.startTime = null
	}

	connectedCallback() {
		const defaults = CountingNumber.defaults

		this.targetValue = Number(this.getAttribute('value')) || this.textContent || defaults.targetValue
		this.duration = Number(this.getAttribute('duration')) || defaults.duration
		this.delay = Number(this.getAttribute('delay')) || defaults.delay
		this.culture = this.getLanguage()

		// Set starting value
		this.updateValue(0)

		this.decimals = CountingNumber.getDecimalCount(this.targetValue) || defaults.decimals

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						requestAnimationFrame(this.animateCount.bind(this))
					}, this.delay)

					observer.unobserve(this)
				}
			})
		}, { threshold: 0 })

		observer.observe(this)
	}

	animateCount(timestamp) {
		this.startTime ||= timestamp

		const elapsed = timestamp - this.startTime
		const progress = elapsed / this.duration

		const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
		//const easeInCubic = (t) => t * t * t
		//const easeOutCubic = (t) => --t * t * t + 1
		const easedProgress = easeInOutCubic(progress)

		this.value = Math.min(this.targetValue * easedProgress, this.targetValue)
		this.updateValue()

		if (this.value < this.targetValue) {
			requestAnimationFrame(this.animateCount.bind(this))
		}
	}

	updateValue(value = this.value) {
		this.textContent = Intl.NumberFormat(this.culture, { minimumfractiondigits: this.decimals }).format(value.toFixed(this.decimals))
	}

	getLanguage() {
		let language = "en"

		const decider = this.closest('[lang]')
		if (decider && decider.lang != '') {
			language = decider.lang
		}

		return language
	}

	static getDecimalCount(value) {
		let valueConv = value.toString()

		if (valueConv.indexOf('.') < 0) {
			return 0
		}

		valueConv = valueConv.replace(',', '.')

		this.targetValue = valueConv

		return valueConv.split(".")[1].length || 0
	}
}

export { CountingNumber }

export default function registerElement() {
	customElements.define('counting-number', CountingNumber)
}
