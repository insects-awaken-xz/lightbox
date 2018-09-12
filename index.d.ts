declare namespace lightbox {
	export type LightboxOption = {
		hideEl: Boolean,
		duration: Number,
		offsetDistance: Number,
		listenAttr: String,
		backdropColor: String,
		backdropOpacity: Number
	}

	class Lightbox {

		option(options: LightboxOption): Lightbox

		start(): void
	}
}