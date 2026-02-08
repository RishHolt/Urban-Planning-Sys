import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    optimizeDeps: {
        include: ['@tensorflow/tfjs'],
        esbuildOptions: {
            target: 'esnext',
        },
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Separate TensorFlow.js into its own chunk for better loading
                    if (id.includes('@tensorflow/tfjs')) {
                        return 'tensorflow';
                    }
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: '192.168.1.14',
        },
        cors: {
            origin: ['http://192.168.1.14:8000', 'http://localhost:8000'],
            credentials: true,
        },
    },
});
