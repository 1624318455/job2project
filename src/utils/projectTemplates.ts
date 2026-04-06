export interface ProjectTemplate {
  name: string;
  framework: string;
  files: Record<string, string>;
}

export const TEMPLATES: Record<string, ProjectTemplate> = {
  'vue3-vite': {
    name: 'Vue 3 + Vite + TypeScript',
    framework: 'vue',
    files: {
      'package.json': JSON.stringify({
        name: '{{projectName}}',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vue-tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          vue: '^3.4.0',
          'vue-router': '^4.3.0',
          pinia: '^2.1.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          vite: '^5.4.0',
          'vue-tsc': '^2.0.0',
          typescript: '~5.5.0',
        },
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'preserve',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        references: [{ path: './tsconfig.node.json' }],
      }, null, 2),
      'tsconfig.node.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
      'src/main.ts': `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`,
      'src/App.vue': `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
#app {
  min-height: 100vh;
}
</style>`,
      'src/env.d.ts': `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`,
      'src/router/index.ts': `import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router`,
      'src/styles/global.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  font: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}`,
      'src/views/HomeView.vue': `<template>
  <div class="home">
    <h1>{{projectName}}</h1>
    <p>{{projectDescription}}</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #1a1a1a;
}

p {
  color: #666;
  font-size: 1.1rem;
}
</style>`,
      '.gitignore': `node_modules
dist
*.local
.env
.env.*
!.env.example`,
      'README.md': `# {{projectName}}

{{projectDescription}}

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`
`,
    },
  },
  'react-vite': {
    name: 'React + Vite + TypeScript',
    framework: 'react',
    files: {
      'package.json': JSON.stringify({
        name: '{{projectName}}',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.3.0',
          'react-dom': '^18.3.0',
          'react-router-dom': '^6.26.0',
        },
        devDependencies: {
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.0',
          vite: '^5.4.0',
          typescript: '~5.5.0',
        },
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      }, null, 2),
      'tsconfig.node.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      'src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)`,
      'src/App.tsx': `import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App`,
      'src/vite-env.d.ts': `/// <reference types="vite/client" />`,
      'src/styles/global.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  font: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}`,
      'src/pages/Home.tsx': `function Home() {
  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 16, color: '#1a1a1a' }}>
        {{projectName}}
      </h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>
        {{projectDescription}}
      </p>
    </div>
  )
}

export default Home`,
      '.gitignore': `node_modules
dist
*.local
.env
.env.*
!.env.example`,
      'README.md': `# {{projectName}}

{{projectDescription}}

## 技术栈

- React 18 + TypeScript
- Vite
- React Router

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`
`,
    },
  },
};

export function selectTemplate(techStack: string[], projectType: string): string {
  const hasVue = techStack.some((t) => t.toLowerCase().includes('vue'));
  const hasReact = techStack.some((t) => t.toLowerCase().includes('react'));

  if (hasVue && projectType === 'web') return 'vue3-vite';
  if (hasReact && projectType === 'web') return 'react-vite';
  if (projectType === 'web') return 'react-vite';

  return 'react-vite';
}

export function fillTemplate(template: Record<string, string>, vars: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [path, content] of Object.entries(template)) {
    let filled = content;
    for (const [key, value] of Object.entries(vars)) {
      filled = filled.replaceAll(`{{${key}}}`, value);
    }
    result[path] = filled;
  }
  return result;
}
