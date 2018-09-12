const {rollup} = require('rollup')
const babel = require('rollup-plugin-babel')
const {uglify} = require('rollup-plugin-uglify')

async function build (option) {
  const bundle = await rollup(option.input)
  await bundle.write(option.output)
}

(function () {
  build({
    input: {
      input: './src/index.js',
      plugins: [babel(), uglify()]
    },
    output: {
      file: './dist/lightbox.min.js',
      name: 'lightbox',
      format: 'umd',
      global: {
        lightbox: 'lightbox'
      }
    }
  }).catch(console.error)
})()