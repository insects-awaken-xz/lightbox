/** throttle */
const throttle = (wait, cb) => {
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

/** preventDefault */
const preventDefault = e => e.preventDefault()

/** css */
const css = (el, obj) => {
  if (!(el instanceof HTMLElement))
    return
  Object.keys(obj).map(attribute => el.style[attribute] = obj[attribute])
}

export {
  css,
  throttle,
  preventDefault
}
