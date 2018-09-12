class XZLightBox {
  constructor () {
    let timeout
    const holdScroll = e => e.preventDefault()
    const throttleCalc = arg => {
      if (timeout) return
      timeout = setTimeout(() => {
        this._calcActivePos.bind(this)(arg)
        timeout = undefined
      }, 33)
    }
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
    this.defaults = {
      hideEl: false,
      duration: 618,
      offsetDistance: 60,
      listenAttr: 'xz-lightbox',
      backdropColor: '#000',
      backdropOpacity: 0.618
    }
    Object.defineProperty(this.option(), 'status', {
      set: newValue => {
        status = newValue
        const isDisappeared = status === 'disappeared'
        this.$img.style.willChange = isDisappeared ? 'auto' : 'transform'
        document.documentElement.classList[isDisappeared ? 'remove' : 'add']('xz-locked')
        document.body.classList[isDisappeared ? 'remove' : 'add']('xz-locked')
        window[isDisappeared ? 'removeEventListener' : 'addEventListener']('touchmove', holdScroll, false)
        window[isDisappeared ? 'removeEventListener' : 'addEventListener'](resizeEvt, throttleCalc, false)
      },
      get: () => status
    })
  }

  _buildAndListen () {
    if (this.$lightbox) return
    this.calc = {}
    this.$lightbox = document.createElement('div')
    this.$lightbox.id = 'xz-lightbox'
    this.$lightbox.classList.add('xz-lightbox', 'hide')
    this.$backdrop = document.createElement('div')
    this.$backdrop.classList.add('xz-lightbox-backdrop', 'transparent')
    this.$backdrop.style.background = this.opts.backdropColor
    this.$backdrop.style.opacity = `${this.opts.backdropOpacity}`
    this.$backdrop.style.transition = `opacity ${this.opts.duration}ms ease`
    this.$img = document.createElement('img')
    this.$img.classList.add('xz-lightbox-img')
    this.$img.style.transition = `transform ${this.opts.duration}ms ease, box-shadow ${this.opts.duration}ms ease`
    this.$lightbox.appendChild(this.$backdrop)
    this.$lightbox.appendChild(this.$img)
    document.body.appendChild(this.$lightbox)

    const style = document.createElement('style')
    // style.innerHTML = `${this.opts.listenAttr}`
    style.innerHTML = `html.xz-locked{overflow:hidden !important}html img[${this.opts.listenAttr}]{cursor:zoom-in}html img.xz-force-hide{opacity:0}html .xz-lightbox{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999}html .xz-lightbox.hide{display:none}html .xz-lightbox .xz-lightbox-backdrop{position:absolute;top:0;left:0;width:inherit;height:inherit}html .xz-lightbox .xz-lightbox-backdrop.transparent{opacity:.01 !important}html .xz-lightbox .xz-lightbox-img{cursor:zoom-out}`
    document.body.appendChild(style)

    this.$img.addEventListener('transitionend', () => {
      if (this.status !== 'disappearing') return
      this.status = 'disappeared'
      if (this.opts.hideEl)
        this.$el.classList.remove('xz-force-hide')
      this.$lightbox.classList.add('hide')
    }, false)

    this.$lightbox.addEventListener('click', () => {
      this.status = 'disappearing'
      this.$backdrop.classList.add('transparent')
      this._calcInactivePos()
    })
  }

  _calcInactivePos () {
    const elStyle = this.$el.getBoundingClientRect()
    this.calc.elW = elStyle.width
    this.calc.elH = elStyle.height
    this.$img.style.width = `${this.calc.elW}px`
    this.$img.style.height = `${this.calc.elH}px`
    this.$img.style.transform = `translate(${elStyle.left}px, ${elStyle.top}px) scale(1, 1)`
  }

  _calcActivePos () {
    const s = this.$lightbox.getBoundingClientRect()
    const screenWidth = s.width - this.opts.offsetDistance
    const screenHeight = s.height - this.opts.offsetDistance
    if (this.calc.originW <= screenWidth && this.calc.originH <= screenHeight) {
      this.calc.lastW = this.calc.originW
    } else {
      this.calc.lastW = screenWidth
      if (this.calc.lastW * this.calc.originRatio > screenHeight) {
        this.calc.lastW = screenHeight / this.calc.originRatio
      }
    }
    const scaleX = this.calc.lastW / this.calc.elW
    const scaleY = this.calc.lastW * this.calc.originRatio / this.calc.elH
    const translateX = (screenWidth + this.opts.offsetDistance - this.calc.elW) / 2
    const translateY = (screenHeight + this.opts.offsetDistance - this.calc.elH) / 2
    this.$img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
  }

  _updateImg () {
    this._calcInactivePos()
    this.$img.src = this.$el.getAttribute('src')
    this.$img.onload = () => {
      this.calc.originW = this.$img.width
      this.calc.originH = this.$img.height
      this.calc.originRatio = this.$img.height / this.$img.width
      this.$lightbox.classList.remove('hide')
      this.status = 'show'
      if (this.opts.hideEl)
        this.$el.classList.add('xz-force-hide')
      this._calcActivePos()
      this.$backdrop.classList.remove('transparent')
    }
  }

  option (options) {
    if (options && 'class_style_src'.split('_').indexOf(options.listenAttr) !== -1) {
      throw new Error('The name of listenAttr should\'t be class,style or src!')
    }
    this.opts = Object.assign({}, this.defaults, options)
    return this
  }

  start () {
    this._buildAndListen()
    window.addEventListener('click', ({target: t}) => {
      const value = t.getAttribute(this.opts.listenAttr) // TODO
      if (!t.tagName || 'IMG' !== t.tagName.toUpperCase() || typeof value === 'object') return
      this.$el = t
      this._updateImg()
    }, false)
  }
}

export default new XZLightBox()