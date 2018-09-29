import {CLASS, DEFAULT_OPTS, EVENTS, INFO, LISTEN_ATTR, STATUS} from './constants'
import {createEl, css, appendChildren, throttle, preventDefault, toggleEventListener} from './utils'

let throttleActive
let throttleKeyBoard
let throttlePrevPage
let throttleNextPage

class LightBox {
  constructor () {
    this.defaultOpts = DEFAULT_OPTS
    this.option()
  }

  /**
   * build html, only play once
   */
  _build () {
    if (this.$) return
    /* all calculated value in obj calc */
    this.$ = {}
    this._initData()
    this.$.lightbox = createEl('div', [CLASS.LIGHTBOX, CLASS.HIDE], CLASS.LIGHTBOX)
    this.$.backdrop = createEl('div', [CLASS.BACKDROP, CLASS.FORCE_TRANSPARENT])
    this.$.photo = createEl('img', [CLASS.PHOTO])
    this.$.arrowR = createEl('div', [CLASS.ARROW, CLASS.ARROW_RIGHT, CLASS.HIDE, CLASS.FORCE_TRANSPARENT])
    this.$.arrowL = createEl('div', [CLASS.ARROW, CLASS.ARROW_LEFT, CLASS.HIDE, CLASS.FORCE_TRANSPARENT])
    this.$.info = createEl('div', [CLASS.INFO, CLASS.HIDE, CLASS.FORCE_TRANSPARENT])
    this.$.pagination = createEl('div', [CLASS.PAGINATION, CLASS.HIDE])
    this.$.title = createEl('div', [CLASS.TITLE])
    this.$.desc = createEl('div', [CLASS.DESC])
    appendChildren(document.body, [
      appendChildren(this.$.lightbox, [
        this.$.backdrop,
        this.$.photo,
        this.$.arrowL,
        this.$.arrowR,
        appendChildren(this.$.info, [
          this.$.pagination,
          this.$.title,
          this.$.desc])
      ])
    ])
    this._setDuration()
    /* init listener function */
    throttleActive = throttle(this._active.bind(this))
    throttleKeyBoard = throttle(this._keyboard.bind(this))
    throttlePrevPage = throttle(this._togglePage.bind(this, false))
    throttleNextPage = throttle(this._togglePage.bind(this, true))
  }

  _initData () {
    this.calc = {}
    this.album = {}
    this.$.el = undefined
    this.title = ''
    this.desc = ''
    this.isAlbum = false
    this.sameSize = false
    this.status = STATUS.DISAPPEARED
  }

  _setDuration () {
    const t = `${this.opts.duration}ms`
    const a = 'ease'
    css(this.$.photo, {transition: `transform ${t} ${a}`})
    css(this.$.info, {transition: `bottom ${t} ${a}, left ${t} ${a}, width ${t} ${a}, opacity ${t} ${a}`})
    css(this.$.backdrop, {transition: `opacity ${t} ${a}`})
    css(this.$.arrowR, {transition: `opacity ${t} ${a}, border-color 300ms ${a}`})
    css(this.$.arrowL, {transition: `opacity ${t} ${a}, border-color 300ms ${a}`})
  }

  /**
   * event listener, shouldn't be removed
   */
  _listen () {
    this.$.photo.addEventListener('transitionend', () => {
      this._setStatus(this.status === STATUS.SHOWING ? STATUS.SHOWED
        : this.status === STATUS.DISAPPEARING ? STATUS.DISAPPEARED
          : STATUS.SHOWED)
    })
    this.$.backdrop.addEventListener('click', () => {
      this.status !== STATUS.DISAPPEARING && this._setStatus(STATUS.DISAPPEARING)
    })
    window.addEventListener('click', ({target: t}) => {
      const album = this.album
      album.name = t.getAttribute(LISTEN_ATTR)
      if (!t.tagName || 'IMG' !== t.tagName.toUpperCase() || typeof album.name === 'object'/* null */)
        return
      if (album.name.trim()) {
        album.photos = document.querySelectorAll(`img[${LISTEN_ATTR}="${album.name}"]`)
        this.isAlbum = album.photos.length > 1
      }
      if (this.isAlbum) {
        album.index = Array.prototype.indexOf.call(album.photos, t)
        if (album.index === -1) {
          this._initData()
          return
        }
        this._albumEventListener(true)
        this.$.pagination.classList.remove(CLASS.HIDE)
      } else {
        this.$.pagination.classList.add(CLASS.HIDE)
      }
      this._update(t)
    })
  }

  /**
   * calc img disappeared position
   */
  _inactive (isDisappeared) {
    const calc = this.calc
    const lastElWidth = calc.elWidth
    const lastElHeight = calc.elHeight

    const domRect = this.$.el.getBoundingClientRect()
    calc.elWidth = domRect.width
    calc.elHeight = domRect.height

    css(this.$.photo, isDisappeared ? {
      width: `${lastElWidth}px`,
      height: `${lastElHeight}px`,
      transform: `translate(${(calc.elWidth - lastElWidth) / 2 + domRect.left}px, ${(calc.elHeight - lastElHeight) / 2 + domRect.top}px) 
                  scale(${calc.elWidth / lastElWidth}, ${calc.elHeight / lastElHeight})`
    } : {
      width: `${calc.elWidth}px`,
      height: `${calc.elHeight}px`,
      transform: `translate(${domRect.left}px, ${domRect.top}px) scale(1, 1)`
    })
  }

  /**
   * calc img showed position
   */
  _active () {
    const calc = this.calc
    const width = this.$.lightbox.offsetWidth // hack
    const height = this.$.lightbox.offsetHeight // hack
    const maxWidth = width - this.opts.offset
    const maxHeight = height - this.opts.offset

    const lastFinalWidth = calc.finalWidth
    const lastFinalHeight = calc.finalHeight

    if (calc.originWidth <= maxWidth && calc.originHeight <= maxHeight) {
      calc.finalWidth = calc.originWidth
    } else {
      calc.finalWidth = maxWidth
      if (calc.finalWidth * calc.originRatio > maxHeight) {
        calc.finalWidth = Math.floor(maxHeight / calc.originRatio)
      }
    }
    calc.finalHeight = Math.floor(calc.finalWidth * calc.originRatio)

    const scaleX = calc.finalWidth / calc.elWidth
    const scaleY = calc.finalHeight / calc.elHeight
    const translateX = (width - calc.elWidth) / 2
    const translateY = (height - calc.elHeight) / 2

    css(this.$.photo, {transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`})
    css(this.$.info, {
      bottom: `${(height - calc.finalHeight) / 2 - 1}px`,
      width: `${calc.finalWidth}px`,
      left: `${(width - calc.finalWidth) / 2}px`
    })

    this.sameSize = lastFinalWidth === calc.finalWidth && lastFinalHeight === calc.finalHeight
  }

  /**
   * all status
   *                 addListen              removed
   *                    ======================>
   *                   ||                     ||
   * disappeared => showing => showed => disappearing
   *      ||       || || ||        ||         ||
   *      ||       <===  <==========          ||
   *       <==================================
   *
   *  all $element.offsetWidth is hack. Used to resolve the transition does not fire after display: none => display: block
   */
  _setStatus (currentStatus) {
    const lastStatus = this.status
    this.status = currentStatus
    if (lastStatus === STATUS.DISAPPEARED && this.status === STATUS.SHOWING ||
      lastStatus === STATUS.DISAPPEARING && this.status === STATUS.DISAPPEARED) {
      const begin = lastStatus === STATUS.DISAPPEARED
      css(this.$.photo, {willChange: begin ? 'transform' : 'auto'})
      document.documentElement.classList[begin ? 'add' : 'remove'](CLASS.LOCKED)
      window[toggleEventListener(begin)]('touchmove', preventDefault)
      window[toggleEventListener(begin)]('resize', throttleActive)
    }
    if (this.status === STATUS.DISAPPEARED) {
      css(this.$.photo, {transform: 'unset'})
      this.opts.hide && this.$.el.classList.remove(CLASS.FORCE_TRANSPARENT)
      this.$.lightbox.classList.add(CLASS.HIDE)
      this._initData()
      this.opts.onDisappeared && this.opts.onDisappeared()
    } else if (this.status === STATUS.SHOWING) {
      if (lastStatus === STATUS.DISAPPEARING) return // when click fast will happen
      if (lastStatus === STATUS.DISAPPEARED) { // show first photo
        this.$.lightbox.classList.remove(CLASS.HIDE)
        this.$.backdrop.offsetWidth
        this.$.backdrop.classList.remove(CLASS.FORCE_TRANSPARENT)
      } else {
        if (lastStatus === STATUS.SHOWED) {
          this.$.info.classList.add(CLASS.HIDE)
          this.$.info.offsetWidth
          this.$.info.classList.add(CLASS.FORCE_TRANSPARENT)
        }
      }
      this._active()
      this.opts.hide && this.$.el.classList.add(CLASS.FORCE_TRANSPARENT)
      this.opts.onShowing && this.opts.onShowing()
      this.sameSize && this._setStatus(STATUS.SHOWED)
    } else if (this.status === STATUS.SHOWED) {
      if (this.isAlbum) {
        this.$.arrowR.classList.remove(CLASS.HIDE)
        this.$.arrowL.classList.remove(CLASS.HIDE)
        this.$.arrowR.offsetWidth
        this.$.arrowL.offsetWidth
        this.$.arrowR.classList.remove(CLASS.FORCE_TRANSPARENT)
        this.$.arrowL.classList.remove(CLASS.FORCE_TRANSPARENT)
      }
      if (this.title || this.desc || this.isAlbum) {
        this.$.info.classList.remove(CLASS.HIDE)
        this.$.info.offsetWidth
        this.$.info.classList.remove(CLASS.FORCE_TRANSPARENT)
      }
      this.opts.onShowed && this.opts.onShowed()
    } else if (this.status === STATUS.DISAPPEARING) {
      this._inactive(true)
      this.$.backdrop.classList.add(CLASS.FORCE_TRANSPARENT)
      this.$.info.classList.add(CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
      if (this.isAlbum) {
        this._albumEventListener(false)
        this.$.arrowR.classList.add(CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
        this.$.arrowL.classList.add(CLASS.HIDE, CLASS.FORCE_TRANSPARENT)
      }
      this.opts.onDisappearing && this.opts.onDisappearing()
    }
  }

  _keyboard (e) {
    if (e.keyCode === 37 || e.keyCode === 65) // ⬅️ || A
      this._togglePage(false)
    else if (e.keyCode === 39 || e.keyCode === 68 || e.keyCode === 13 || e.keyCode === 32) // ➡️ || D || Enter || Space
      this._togglePage(true)
    else if (e.keyCode === 27) // esc
      this.status !== STATUS.DISAPPEARING && this._setStatus(STATUS.DISAPPEARING)
  }

  _togglePage (isNextPage) {
    const album = this.album
    const photos = album.photos
    const length = photos.length
    album.index += isNextPage ? 1 : -1
    album.index = (album.index + length) % length
    this._update(photos[album.index], true)
  }

  _update (target, updateAlbum) {
    /* show last photo when isAlbum */
    this.opts.hide && this.$.el && this.$.el.classList.remove(CLASS.FORCE_TRANSPARENT)

    this.$.el = target

    this.title = target.getAttribute(INFO.TITLE)
    this.desc = target.getAttribute(INFO.DESC)
    this.$.title.innerText = this.title || ''
    this.$.desc.innerText = this.desc || ''
    this.isAlbum && (this.$.pagination.innerText = this.opts.template
      .replace('$index', this.album.index + 1)
      .replace('$total', this.album.photos.length))

    !updateAlbum && this._inactive()
    const preload = new Image()
    const src = target.getAttribute('src')
    preload.src = src
    preload.onload = () => {
      this.$.photo.src = src
      this.calc.originWidth = preload.width
      this.calc.originHeight = preload.height
      this.calc.originRatio = preload.height / preload.width
      this.$.photo.onload = () => this._setStatus(STATUS.SHOWING)
    }
    preload.onerror = console.error
  }

  _albumEventListener (begin) {
    this.$.arrowL[toggleEventListener(begin)]('click', throttlePrevPage)
    this.$.arrowR[toggleEventListener(begin)]('click', throttleNextPage)
    this.$.photo[toggleEventListener(begin)]('click', throttleNextPage)
    window[toggleEventListener(begin)]('keydown', throttleKeyBoard)
  }

  option (opts) {
    Object.keys(opts || {}).map(key => {
      if (Object.hasOwnProperty.call(EVENTS, key)) {
        if (typeof opts[key] !== 'function') {
          throw TypeError(`${key} has to be a function.`)
        }
      }
    })
    this.opts = Object.assign({}, this.defaultOpts, opts)
    if (this.$) this._setDuration()
    return this
  }

  start () {
    this._build()
    this._listen()
  }
}

const lightbox = new LightBox()

export default lightbox