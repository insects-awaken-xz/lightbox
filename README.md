# Lightbox

The Native Javascript lightbox.
Support ie11 and modern browsers.

### Get Started

* via NPM
```
npm i --save xz-lightbox@latest

import lightbox from 'xz-lightbox'
lightbox.option({...}).start()
```

* via CDN

```
<link src="https://unpkg.com/xz-lightbox@latest/dist/lightbox.min.css">
<script src="https://unpkg.com/xz-lightbox"></script>
<script>
 lightbox.option({...}).start();
</script>
 ```

### Simple API

```
lightbox.option({
    duration: 618,   // transition time ms           default: 618
    hide: true,      // need hide img be clicked     default: false
    offset: 100,     // offset to window             default: 100
}).start();
lightbox.option({
	onShowing: () => ({}),         // showing process
	onShowed: () => ({}),          // has showed
	onDisappearing: () => ({}),    // disappear process
	onDisappeared: () => ({}),     // has disappeared
}) ;
lightbox.start();     // default opts
```