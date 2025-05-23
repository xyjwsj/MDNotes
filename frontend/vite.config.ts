import {defineConfig} from 'vite'
import vueJsx from '@vitejs/plugin-vue-jsx';
import vue from '@vitejs/plugin-vue'
import {join} from 'path';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    })
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      '@assets': join(__dirname, 'src/assets'),
      '@root': __dirname,
    },
  },
})
