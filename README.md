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
    duration: 618,               // transition time ms, default 618
    hideEl: true,                // need hide img, default false
    offsetDistance: 20,          // offset to window, default 60
    listenAttr: 'xz-lightbox',   // need listen img attribute, default 'xz-lightbox'
    backdropColor: '#000',       // backdrop background color, default #000
    backdropOpacity: 0.618       // backdrop opacity, default 0.618
}).start()

lightbox.start()                 // default opts
```
#### Attention
* fucntion option should call before start, and only be executed once.
* ❌  lightbox.start().option({...})
* ✅  lightbox.option({...}).start()