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

		this.targetValue = this.textContent || defaults.targetValue
		this.duration = Number(this.getAttribute('duration')) || defaults.duration
		this.delay = Number(this.getAttribute('delay')) || defaults.delay
		this.culture = this.getAttribute('culture') || defaults.culture

		this.textContent = Intl.NumberFormat(this.culture).format(this.targetValue)
		this.decimals = this.countDecimals(this.targetValue) || defaults.decimals
		// Set starting value
		this.updateValue(0)

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

	countDecimals(value) {
		var valueConv = value.toString().replace(",", ".")
		if (Math.floor(value) === Number(value)) return 0
	updateValue(value = this.value) {
		this.textContent = Intl.NumberFormat(this.culture, { minimumfractiondigits: this.decimals }).format(value.toFixed(this.decimals))
	}
		this.targetValue = valueConv

		return valueConv.split(".")[1].length || 0
	}
}

export { CountingNumber }

export default function registerElement() {
	customElements.define('counting-number', CountingNumber)
}
