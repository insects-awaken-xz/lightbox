/** throttle */
const throttle = (wait, cb) => {
  let timeout
  return function (arg) {
    if (timeout) return
    timeout = setTimeout(() => {
      cb(arg)
      timeout = 0
    }, wait)
  }
}

/** holdScroll */
const holdScroll = e => e.preventDefault()

export {
  throttle,
  holdScroll
}
