const CLASS = {
  LIGHTBOX: 'xlb',
  BACKDROP: 'xlb-backdrop',
  IMG: 'xlb-img',
  ALBUM: 'xlb-album',
  ARROW: 'xlb-arrow',
  ARROW_RIGHT: 'xlb-arrow-right',
  ARROW_LEFT: 'xlb-arrow-left',

  HIDE: 'xlb-hide',
  LOCKED: 'xlb-locked',
  FORCE_TRANSPARENT: 'xlb-force-transparent'
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
  offset: 100
}

export {
  CLASS,
  STATUS,
  EVENTS,
  DEFAULT_OPTS
}