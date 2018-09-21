declare namespace lightbox {
	export type LightboxOption = {
		hide?: Boolean,
		duration?: Number,
		offset?: Number,
		onDisappeared?: Function,
		onShowing?: Function,
		onShowed?: Function,
		onDisappearing?: Function
	}

	class Lightbox {

		option(options: LightboxOption): Lightbox

		start(): void
	}
}