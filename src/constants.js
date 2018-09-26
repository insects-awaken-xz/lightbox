const LISTEN_ATTR = 'xz-lightbox'

const CLASS = {
  LIGHTBOX: 'xlb',
  BACKDROP: 'xlb-backdrop',
  CLOSE_BTN: 'xlb-close',
  INFO: 'xlb-info',
  TITLE: 'xlb-title',
  DESC: 'xlb-desc',
  PAGINATION: 'xlb-pagination',
  IMG: 'xlb-img',
  ARROW: 'xlb-arrow',
  ARROW_RIGHT: 'xlb-arrow-right',
  ARROW_LEFT: 'xlb-arrow-left',

  HIDE: 'xlb-hide',
  LOCKED: 'xlb-locked',
  FORCE_TRANSPARENT: 'xlb-force-transparent'
}

const INFO = {
  TITLE: 'title',
  DESC: 'desc'
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
  offset: 100,
  template: '$index of $total photos'
}

export {
  CLASS,
  STATUS,
  EVENTS,
  INFO,
  LISTEN_ATTR,
  DEFAULT_OPTS
}