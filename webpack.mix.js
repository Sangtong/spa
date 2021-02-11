let mix = require('laravel-mix')

mix.setPublicPath('src/assets/public')
    .js('src/assets/js/index.js', 'js/index.js')
    .js('src/assets/js/authorization_code.js', 'js/authorization_code.js')
    .vue()
    .sass('src/assets/scss/index.scss', 'css')
    .version()
