import {css, throttle, preventDefault} from './utils'
import {CLASS, STATUS, EVENTS, INFO, LISTEN_ATTR, DEFAULT_OPTS} from './constants'

let throttleActive
let throttleKeyBoard
let throttlePrevPage
let throttleNextPage

class LightBox {
  constructor () {
    this.initial = DEFAULT_OPTS
    Object.defineProperty(this.option(), 'status', {
      set: this._statusHandle,
      get: () => status,
      enumerable: true
    })
  }

  option (opts) {
    Object.keys(opts || {}).map(key => {
      if (Object.hasOwnProperty.call(EVENTS, key)) {
        if (typeof opts[key] !== 'function') {
          throw TypeError(`${key} has to be a function.`)
        }
      }
    })
    this.opts = Object.assign({}, this.initial, opts)
    this.$lightbox && this._setDuration()
    return this
  }

  /**
   * build html, only play once
   */
  _build () {
    if (this.$lightbox) return
    /* all calculated value in obj calc */
    this.calc = {}
    this.album = []
    this.isAlbum = false
    this.$lightbox = document.createElement('div')
    this.$lightbox.id = CLASS.LIGHTBOX
    this.$lightbox.classList.add(CLASS.LIGHTBOX, CLASS.HIDE)

    this.$backdrop = document.createElement('div')
    this.$backdrop.classList.add(CLASS.BACKDROP, CLASS.FORCE_TRANSPARENT)

    this.$img = document.createElement('img')
    this.$img.classList.add(CLASS.IMG)

    this.$arrowR = document.createElement('div')
    this.$arrowR.classList.add(CLASS.ARROW, CLASS.ARROW_RIGHT, CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
    this.$arrowL = document.createElement('div')
    this.$arrowL.classList.add(CLASS.ARROW, CLASS.ARROW_LEFT, CLASS.HIDE, CLASS.FORCE_TRANSPARENT)

    this.$info = document.createElement('div')
    this.$info.classList.add(CLASS.INFO, CLASS.HIDE)
    this.$pagination = document.createElement('div')
    this.$pagination.classList.add(CLASS.PAGINATION, CLASS.HIDE)
    this.$title = document.createElement('div')
    this.$title.classList.add(CLASS.TITLE)
    this.$desc = document.createElement('div')
    this.$desc.classList.add(CLASS.DESC)
    this.$info.appendChild(this.$pagination)
    this.$info.appendChild(this.$title)
    this.$info.appendChild(this.$desc)

    this.$lightbox.appendChild(this.$backdrop)
    this.$lightbox.appendChild(this.$img)
    this.$lightbox.appendChild(this.$arrowL)
    this.$lightbox.appendChild(this.$arrowR)
    this.$lightbox.appendChild(this.$info)
    document.body.appendChild(this.$lightbox)
    this._setDuration()

    /* init listener function */
    throttleActive = throttle(33, this._active.bind(this))
    throttleKeyBoard = throttle(33, this._keyboard.bind(this))
    throttlePrevPage = throttle(33, this._prevPage.bind(this))
    throttleNextPage = throttle(33, this._nextPage.bind(this))
  }

  _setDuration () {
    const t = `${this.opts.duration}ms ease`
    css(this.$img, {transition: `transform ${t}`})
    css(this.$info, {transition: `bottom ${t}, left ${t}, width ${t}`})
    css(this.$backdrop, {transition: `opacity ${t}`})
    css(this.$arrowR, {transition: `opacity ${t}, border-color 300ms ease`})
    css(this.$arrowL, {transition: `opacity ${t}, border-color 300ms ease`})
  }

  /**
   * event listener, shouldn't be removed
   */
  _listen () {
    this.$img.addEventListener('transitionend', () =>
      this.status = this.status === STATUS.SHOWING
        ? STATUS.SHOWED
        : this.status === STATUS.DISAPPEARING
          ? STATUS.DISAPPEARED
          : '' /* impossible status */
    )
    this.$backdrop.addEventListener('click', () => {
      this.status = STATUS.DISAPPEARING
    })
  }

  /**
   * calc img disappeared position
   */
  _inactive () {
    const elStyle = this.$el.getBoundingClientRect()
    this.calc.elW = elStyle.width
    this.calc.elH = elStyle.height
    css(this.$img, {
      width: `${this.calc.elW}px`,
      height: `${this.calc.elH}px`,
      transform: `translate(${elStyle.left}px, ${elStyle.top}px) scale(1, 1)`
    })
    this.$backdrop.classList.add(CLASS.FORCE_TRANSPARENT)
  }

  /**
   * calc img showed position
   */
  _active () {
    const s = this.$lightbox.getBoundingClientRect()
    const screenW = s.width - this.opts.offset
    const screenH = s.height - this.opts.offset

    if (this.calc.originW <= screenW && this.calc.originH <= screenH) {
      this.calc.lastW = this.calc.originW
    } else {
      this.calc.lastW = screenW
      if (this.calc.lastW * this.calc.originRatio > screenH) {
        this.calc.lastW = screenH / this.calc.originRatio
      }
    }
    const lastH = this.calc.lastW * this.calc.originRatio

    const scaleX = this.calc.lastW / this.calc.elW
    const scaleY = lastH / this.calc.elH
    const translateX = (screenW + this.opts.offset - this.calc.elW) / 2
    const translateY = (screenH + this.opts.offset - this.calc.elH) / 2
    css(this.$img, {transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`})
    this.$backdrop.classList.remove(CLASS.FORCE_TRANSPARENT)
    css(this.$info, {
      bottom: `${(s.height - lastH) / 2 - 1}px`,
      width: `${this.calc.lastW}px`,
      left: `${(s.width - this.calc.lastW) / 2}px`
    })
  }

  /**
   * intensively status handle
   */
  _statusHandle (nextStatus) {
    status = nextStatus
    if (this.status === STATUS.DISAPPEARED) {
      this.opts.onDisappeared && this.opts.onDisappeared()

      if (this.opts.hide)
        this.$el.classList.remove(CLASS.FORCE_TRANSPARENT)

      this.$lightbox.classList.add(CLASS.HIDE)

      /* change el status, remove event listen */
      css(this.$img, {willChange: 'auto'})
      document.documentElement.classList.remove(CLASS.LOCKED)
      window.removeEventListener('touchmove', preventDefault)
      window.removeEventListener('resize', throttleActive)

      /* clear data */
      this.calc = {}
      this.$el = undefined

      /* if isAlbum, remove listener and clear data */
      if (this.isAlbum) {
        this.album = []
        this.$arrowR.classList.add(CLASS.HIDE)
        this.$arrowL.classList.add(CLASS.HIDE)
      }
    } else {
      if (this.status === STATUS.SHOWING) {
        this.opts.onShowing && this.opts.onShowing()

        if (this.opts.hide)
          this.$el.classList.add(CLASS.FORCE_TRANSPARENT)

        this.$lightbox.classList.remove(CLASS.HIDE)

        this._active()

        if (this.isAlbum) {
          this.$pagination.innerText = this.opts.template
            .replace('$index', this.activeIndex + 1)
            .replace('$total', this.album.length)

          this.$arrowR.classList.remove(CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
          this.$arrowL.classList.remove(CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
        }

      } else if (this.status === STATUS.SHOWED) {
        this.opts.onShowed && this.opts.onShowed()

        if (this.title || this.desc || this.isAlbum) {
          this.$title.innerText = this.title
          this.$desc.innerText = this.desc
          this.$info.classList.remove(CLASS.HIDE)
        }

      } else if (this.status === STATUS.DISAPPEARING) {
        this.opts.onDisappearing && this.opts.onDisappearing()

        this._inactive()

        this.$info.classList.add(CLASS.HIDE)

        if (this.isAlbum) {
          this.$arrowL.removeEventListener('click', throttlePrevPage)
          this.$arrowR.removeEventListener('click', throttleNextPage)
          this.$img.removeEventListener('click', throttleNextPage)
          window.removeEventListener('keydown', throttleKeyBoard)

          this.$arrowR.classList.add(CLASS.FORCE_TRANSPARENT)
          this.$arrowL.classList.add(CLASS.FORCE_TRANSPARENT)
        }
      }

      /* change, add event listener */
      css(this.$img, {willChange: 'transform'})
      document.documentElement.classList.add(CLASS.LOCKED)
      window.addEventListener('touchmove', preventDefault)
      window.addEventListener('resize', throttleActive)
    }
  }

  _keyboard (e) {
    if (e.keyCode === 27) { // esc
      this.status = STATUS.DISAPPEARING
      return
    }
    if (e.keyCode === 37 || e.keyCode === 65) // ⬅️ || A
      this._prevPage()
    else if (e.keyCode === 39 || e.keyCode === 68 || e.keyCode === 13 || e.keyCode === 32) // ➡️ || D || Enter || Space
      this._nextPage()
  }

  _prevPage () {
    this.activeIndex = --this.activeIndex < 0 ? this.album.length - 1 : this.activeIndex
    this._update(this.album[this.activeIndex])
  }

  _nextPage () {
    this.activeIndex = ++this.activeIndex > this.album.length - 1 ? 0 : this.activeIndex
    this._update(this.album[this.activeIndex])
  }

  _update (target) {
    this.$el && this.$el.classList.remove(CLASS.FORCE_TRANSPARENT)
    this.$el = target
    this.title = this.$el.getAttribute(INFO.TITLE)
    this.desc = this.$el.getAttribute(INFO.DESC)
    this._inactive()
    const preload = new Image()
    const src = this.$el.getAttribute('src')
    preload.src = src
    preload.onload = () => {
      this.$img.src = src
      this.calc.originW = preload.width
      this.calc.originH = preload.height
      this.calc.originRatio = preload.height / preload.width
      this.$img.onload = () => this.status = STATUS.SHOWING
    }
    preload.onerror = console.error
  }

  start () {
    this._build()
    this._listen()
    window.addEventListener('click', ({target: t}) => {
      const albumName = t.getAttribute(LISTEN_ATTR)
      if (!t.tagName || 'IMG' !== t.tagName.toUpperCase() || typeof albumName === 'object' /* no attribute xz-lightbox */)
        return
      if (albumName.trim()) {
        this.album = document.querySelectorAll(`img[${LISTEN_ATTR}="${albumName}"]`)
      }
      this.isAlbum = this.album.length > 1 // album
      if (this.isAlbum) {
        this.activeIndex = Array.prototype.indexOf.call(this.album, t)
        if (this.activeIndex === -1)
          return
        this.$pagination.classList.remove(CLASS.HIDE)
        this.$arrowL.addEventListener('click', throttlePrevPage)
        this.$arrowR.addEventListener('click', throttleNextPage)
        this.$img.addEventListener('click', throttleNextPage)
        window.addEventListener('keydown', throttleKeyBoard)
      } else {
        this.$pagination.classList.add(CLASS.HIDE)
      }
      this._update(t)
    })
  }
}

const lightbox = new LightBox()

export default lightbox