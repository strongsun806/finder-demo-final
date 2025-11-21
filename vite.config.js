// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile"; //  named import

export default defineConfig({
  base: "./", // file:// 더블클릭에서 상대경로 동작
  plugins: [
    react(),
    viteSingleFile({ removeViteModuleLoader: true }), //  단일 파일 인라인
  ],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    target: "es2018",
    cssCodeSplit: false,            // CSS 분리 금지
    sourcemap: false,
    assetsInlineLimit: 100_000_000, // 모든 에셋 인라인
    chunkSizeWarningLimit: 100_000_000,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // 동적 임포트 인라인
        manualChunks: undefined,    // 청크 분할 금지
      },
    },
  },
});
