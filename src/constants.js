const CLASS = {
  LIGHTBOX: 'xz-lightbox',
  BACKDROP: 'xz-lightbox-backdrop',
  IMG: 'xz-lightbox-img',

  HIDE: 'xz-hide',
  LOCKED: 'xz-locked',
  FORCE_TRANSPARENT: 'xz-force-transparent'
}

const STATUS = {
  DISAPPEARED: 'disappeared',
  SHOWING: 'showing',
  SHOWED: 'showed',
  DISAPPEARING: 'disappearing'
}

const EVENTS = {
  onDisappeared: undefined,
  onShowing: undefined,
  onShowed: undefined,
  onDisappearing: undefined
}

const DEFAULT_OPTS = {
  hide: false,
  duration: 618,
  offset: 60
}

export {
  CLASS,
  STATUS,
  EVENTS,
  DEFAULT_OPTS
}