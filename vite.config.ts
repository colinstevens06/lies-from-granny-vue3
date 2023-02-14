import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@components': path.resolve(__dirname, './src/components'),
			'@models': path.resolve(__dirname, './src/models'),
			'@router': path.resolve(__dirname, './src/router'),
			'@styles': path.resolve(__dirname, './src/styles'),
			'@views': path.resolve(__dirname, './src/router/views')
		}
	}
});
