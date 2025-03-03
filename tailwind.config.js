const { resolve, isMp } = require('./shared')
const cssMacro = require('weapp-tailwindcss/css-macro')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", './pages/**/*.{vue,js,ts}', './components/**/*.{vue,js,ts}'].map(resolve),
  theme: {

  },
  plugins: [
    // https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro
    cssMacro({
      variantsMap: {
        wx: 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true
        }
      }
    })
  ],
  corePlugins: {
    preflight: !isMp,
  },
  important:true,
};
