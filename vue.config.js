const path = require('path');
module.exports = {
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    devServer: {
      port: process.env.VUE_APP_PORT,
      proxy: {
        '/api': {
          target: process.env.VUE_APP_API_DEV_WEB,
          pathRewrite: { '^/api': '' },
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@util': path.resolve(__dirname, 'src/util'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      },
    },
    optimization: {
      removeAvailableModules: process.env.NODE_ENV === 'production',
      removeEmptyChunks: process.env.NODE_ENV === 'production',
      splitChunks: {
        chunks: 'all',
        maxAsyncRequests: 20,
        maxInitialRequests: 5,
        minSize: 30000,
        cacheGroups: {
          libs: {
            name: 'chunk-vender-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial', // only package third parties that are initially dependent
          },
          vuetify: {
            name: 'chunk-vuetify-lib',
            test: /[\\/]vuetify[\\/]lib[\\/]/,
            priority: 20,
          },
        },
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true, // https://github.com/electron/electron/issues/9920#issuecomment-653978691
      builderOptions: {
        productName: 'VPlayer',
        asar: true,
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64'],
            },
            {
              target: 'portable',
              arch: ['x64'],
            },
          ],
        },
        mac: {
          target: 'dmg',
          category: 'public.app-category.music',
          artifactName: '${productName}_${version}.${ext}',
          darkModeSupport: true,
        },
        linux: {
          target: [
            'AppImage',
            'snap',
            'deb',
            'rpm',
            'freebsd',
            'pacman',
            'tar.xz',
          ],
          category: 'Audio',
        },
      },
      // Use this to change the entrypoint of your app's main process
      mainProcessFile: 'src/background.js',
    },
  },
};
