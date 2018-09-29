const throttle = (cb, wait = 33) => {
  let timeout
  return function (arg) {
    if (timeout)
      return
    timeout = setTimeout(() => {
      cb(arg)
      timeout = 0
    }, wait)
  }
}

const createEl = (name, classes, id) => {
  const el = document.createElement(name)
  id && (el.id = id)
  classes && classes.length && el.classList.add(...classes)
  return el
}

const appendChildren = (parent, children) => {
  children.map(child => parent.appendChild(child))
  return parent
}

const preventDefault = e => e.preventDefault()

const css = (el, obj) => Object.keys(obj).map(attribute => el.style[attribute] = obj[attribute])

const toggleEventListener = isAdd => isAdd ? 'addEventListener' : 'removeEventListener'

export {
  css,
  throttle,
  createEl,
  preventDefault,
  appendChildren,
  toggleEventListener
}
