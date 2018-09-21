# Lightbox

The Native Javascript lightbox.
Support ie11 and modern browsers.

#### Get Started

```
npm i --save xz-lightbox
```
#### Simple API

```
lightbox.option({
    duration: 618,   // transition time ms           default: 618
    hide: true,      // need hide img be clicked     default: false
    offset: 60,      // offset to window             default: 20
}).start()

lightbox.option({
    onShowing: () => ({}),         // showing process
    onShowed: () => ({}),          // has showed
    onDisappearing: () => ({}),    // disappear process
    onDisappeared: () => ({}),     // has disappeared
})

lightbox.start()     // default opts
```