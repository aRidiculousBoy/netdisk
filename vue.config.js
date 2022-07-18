const path = require('path')
module.exports = {
  productionSourceMap: false,
  configureWebpack: config => {
    return {
      resolve: {
        alias: {
          '@': path.resolve('./src')
        }
      }
    }
  },
  chainWebpack: config => {
    config.module.rule('worker').test(/\.worker\.js$/).use('worker-loader').loader('worker-loader').options({
      inline: 'no-fallback'
    }).end()
    config.module.rule('js').exclude.add(/\.worker\.js$/)
  },
  transpileDependencies: ['element-plus'],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://39.105.212.251:8080',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
