// Конфигурация Vite.
// base: './' — относительные пути, чтобы проект корректно работал на GitHub Pages.
// Экспортируем обычный объект без импорта defineConfig,
// чтобы сборка не требовала установленного локально пакета vite.
const config = {
  server: {
    open: true,
  },
  base: './',
};

export default config;
