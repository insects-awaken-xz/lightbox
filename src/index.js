import {throttle, holdScroll} from './utils'
import {CLASS, STATUS, EVENTS, DEFAULT_OPTS} from './constants'

class LightBox {
  constructor () {
    this.initial = DEFAULT_OPTS
    Object.defineProperty(this.option(), 'status', {
      set: this._statusHandle,
      get: () => status
    })
  }

  /**
   * build html, only play once
   */
  _build () {
    if (this.$lightbox) return
    /* all calculated value in obj calc */
    this.calc = {}
    this.$lightbox = document.createElement('div')
    this.$lightbox.id = CLASS.LIGHTBOX
    this.$lightbox.classList.add(CLASS.LIGHTBOX, CLASS.HIDE)
    this.$backdrop = document.createElement('div')
    this.$backdrop.classList.add(CLASS.BACKDROP, CLASS.FORCE_TRANSPARENT)
    this.$img = document.createElement('img')
    this.$img.classList.add(CLASS.IMG)
    this._setDuration()
    this.$lightbox.appendChild(this.$backdrop)
    this.$lightbox.appendChild(this.$img)
    document.body.appendChild(this.$lightbox)
  }

  _setDuration () {
    this.$backdrop.style.transition = `opacity ${this.opts.duration}ms ease`
    this.$img.style.transition = `transform ${this.opts.duration}ms ease`
  }

  /**
   * event listener, shouldn't remove listener
   */
  _listen () {
    this.$img.addEventListener('transitionend', () =>
      this.status = this.status === STATUS.SHOWING
        ? STATUS.SHOWED
        : this.status === STATUS.DISAPPEARING
          ? STATUS.DISAPPEARED
          : '' /* impossible status */
    )
    this.$lightbox.addEventListener('click', () =>
      this.status = STATUS.DISAPPEARING
    )
  }

  /**
   * calc img disappeared position
   */
  _inactive () {
    const elStyle = this.$el.getBoundingClientRect()
    this.calc.elW = elStyle.width
    this.calc.elH = elStyle.height
    this.$img.style.width = `${this.calc.elW}px`
    this.$img.style.height = `${this.calc.elH}px`
    this.$img.style.transform = `translate(${elStyle.left}px, ${elStyle.top}px) scale(1, 1)`
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
    const scaleX = this.calc.lastW / this.calc.elW
    const scaleY = this.calc.lastW * this.calc.originRatio / this.calc.elH
    const translateX = (screenW + this.opts.offset - this.calc.elW) / 2
    const translateY = (screenH + this.opts.offset - this.calc.elH) / 2
    this.$img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
    this.$backdrop.classList.remove(CLASS.FORCE_TRANSPARENT)
  }

  _update (target) {
    this.$el = target
    this._inactive()
    const preload = new Image()
    const src = this.$el.getAttribute('src')
    preload.src = src
    preload.onload = () => {
      this.$img.src = src
      this.calc.originW = preload.width
      this.calc.originH = preload.height
      this.calc.originRatio = preload.height / preload.width
      this.$img.onload = () => {
        this.status = STATUS.SHOWING
        this._active()
      }
    }
    preload.onerror = console.error
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
      this.$img.style.willChange = 'auto'
      document.documentElement.classList.remove(CLASS.LOCKED)
      window.removeEventListener('touchmove', holdScroll)
      window.removeEventListener('resize', throttle(33, this._active.bind(this)))
      /* clear data */
      this.calc = {}
      this.$el = undefined
    } else {
      if (this.status === STATUS.SHOWING) {
        this.opts.onShowing && this.opts.onShowing()
        if (this.opts.hide)
          this.$el.classList.add(CLASS.FORCE_TRANSPARENT)
        this.$lightbox.classList.remove(CLASS.HIDE)
      } else if (this.status === STATUS.SHOWED) {
        this.opts.onShowed && this.opts.onShowed()
      } else if (this.status === STATUS.DISAPPEARING) {
        this.opts.onDisappearing && this.opts.onDisappearing()
        this._inactive()
      }
      /* change, add event listen */
      this.$img.style.willChange = 'transform'
      document.documentElement.classList.add(CLASS.LOCKED)
      window.addEventListener('touchmove', holdScroll)
      window.addEventListener('resize', throttle(33, this._active.bind(this)))
    }
  }

  option (opts) {
    if (opts) {
      const optsKeys = Object.keys(opts)
      optsKeys.map(key => {
        if (Object.hasOwnProperty.call(EVENTS, key)) {
          if (typeof opts[key] !== 'function') {
            throw TypeError(`${key} has to be a function.`)
          }
        }
      })
    }
    this.opts = Object.assign({}, this.initial, opts)
    this.$lightbox && this._setDuration()
    return this
  }

  start () {
    this._build()
    this._listen()
    // const keyboard = e => {
    //   console.log(e)
    //   if (e.keyCode === 37 || e.keyCode === 65) // ⬅️ || A
    //     this.activeIndex--
    //   if (e.keyCode === 39 || e.keyCode === 68) // ➡️ || D
    //     this.activeIndex++
    //   if (e.keyCode === 27) {
    //     window.removeEventListener('keydown', keyboard.bind(this))
    //   }
    //   this.activeIndex = this.activeIndex < 0
    //     ? this.album.length - 1
    //     : this.activeIndex > this.album.length - 1
    //       ? 0
    //       : this.activeIndex
    //   this.$el = this.album[this.activeIndex]
    //   this._update()
    // }
    window.addEventListener('click', ({target: t}) => {
      const value = t.getAttribute('xz-lightbox')
      if (!t.tagName || 'IMG' !== t.tagName.toUpperCase() || typeof value === 'object') return
      // const $els = document.querySelectorAll(`img[xz-lightbox="${value}"]`)
      // if (value !== '' && $els.length > 1) { // album
      //   this.album = Array.from($els)
      //   this.activeIndex = this.album.indexOf(t)
      //   if (this.activeIndex === -1) return
      // window.addEventListener('keydown', keyboard.bind(this))
      // } else {
      //
      // }
      this._update(t)
    }, false)
  }
}

const lightbox = new LightBox()

export default lightbox