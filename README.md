# DemoQA Automation Framework

Proyecto de automatización de pruebas UI para DemoQA utilizando **Playwright**, **TypeScript**, **Cucumber** y **Page Object Model (POM)**.

## 📋 Especificaciones Técnicas

| Componente | Versión |
|-----------|---------|
| **Node.js** | 18.19.1 LTS |
| **TypeScript** | 5.4.5 |
| **npm** | 9.8.1 |
| **Playwright** | 1.43.1 |
| **Cucumber** | 10.3.1 |
| **ts-node** | 10.9.2 |
| **dotenv** | 16.4.5 |
| **Allure Playwright** | 2.27.0 |

## 🏗️ Estructura del Proyecto

```
demoqa-automation/
├── src/
│   ├── page-objects/           # Page Object Model classes
│   │   ├── BasePage.ts         # Base class for all pages
│   │   └── ElementsPage.ts     # Elements page example
│   ├── step-definitions/       # Cucumber step definitions
│   │   └── elements.steps.ts   # Steps for Elements feature
│   ├── features/               # Cucumber feature files
│   │   └── elements.feature    # Example feature file
│   ├── support/                # Support utilities
│   │   └── browser-manager.ts  # Browser lifecycle management
│   ├── config/                 # Configuration files
│   │   └── config.ts           # Application configuration
│   └── utils/                  # Utility functions
├── reports/                    # Test reports directory
├── .env                        # Environment variables
├── cucumber.js                 # Cucumber configuration
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🚀 Instalación

### Requisitos Previos

- **Node.js** 18.19.1 LTS o superior
- **npm** 9.8.1 o superior

### Pasos de Instalación

1. **Clonar o navegar al proyecto:**
   ```bash
   cd demoqa-automation
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

   Esto instalará:
   - Playwright y navegadores
   - Cucumber y dependencias BDD
   - TypeScript y ts-node
   - Allure para reporting
   - dotenv para gestión de configuración

3. **Verificar instalación:**
   ```bash
   npm run test --version
   ```

## ⚙️ Configuración

### Variables de Entorno (.env)

El archivo `.env` contiene las configuraciones del proyecto:

```env
BASE_URL=https://demoqa.com
BROWSER=chromium
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
```

**Parámetros:**
- `BASE_URL`: URL base de la aplicación a probar
- `BROWSER`: Navegador a utilizar (chromium, firefox, webkit)
- `HEADLESS`: Ejecutar en modo headless (true/false)
- `SLOW_MO`: Ralentización en milisegundos (0 = sin ralentización)
- `TIMEOUT`: Tiempo máximo de espera en milisegundos
- `SCREENSHOT_ON_FAILURE`: Captura de pantalla al fallar
- `VIDEO_ON_FAILURE`: Grabar video al fallar

## 📝 Ejecución de Pruebas

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests en modo UI

```bash
npm run test:ui
```

### Ejecutar tests con debug

```bash
npm run test:debug
```

### Ejecutar un feature específico

```bash
npx cucumber-js src/features/elements.feature
```

### Limpiar reportes

```bash
npm run clean:reports
```

## 📊 Reportes

### Reporte Allure

Generar y servir el reporte Allure:

```bash
npm run test:report
```

Se abrirá automáticamente en el navegador.

### Reportes Disponibles

- **Allure Reports**: `reports/allure-results/`
- **Cucumber HTML**: `reports/cucumber-report.html`
- **Playwright HTML**: `reports/playwright-report/`

## 🏛️ Arquitectura Page Object Model

### BasePage.ts

Clase base que contiene métodos comunes para todas las páginas:

- `navigateTo(path)`: Navegar a una URL
- `click(selector)`: Hacer clic en un elemento
- `fillText(selector, text)`: Rellenar un campo de texto
- `getText(selector)`: Obtener texto de un elemento
- `isVisible(selector)`: Verificar si un elemento es visible
- `waitForElement(selector)`: Esperar a que aparezca un elemento

### ElementsPage.ts

Ejemplo de implementación de Page Object que extiende BasePage:

```typescript
export class ElementsPage extends BasePage {
  // Locators
  private readonly textBoxLink = "//span[text()='Text Box']";
  private readonly fullNameInput = "#fullName";
  
  // Methods
  async clickTextBoxLink(): Promise<void> {
    await this.click(this.textBoxLink);
  }
}
```

## 🎯 Creando Nuevas Pruebas

### 1. Crear un Feature File

```gherkin
Feature: New Feature Description
  Scenario: Test scenario
    Given preconditions
    When actions
    Then assertions
```

### 2. Crear Page Object

```typescript
export class NewPage extends BasePage {
  private readonly someElement = "#some-element";
  
  async someAction(): Promise<void> {
    await this.click(this.someElement);
  }
}
```

### 3. Crear Step Definitions

```typescript
Given("step description", async function () {
  // Implementation
});
```

## 🔧 Configuración Avanzada

### Modificar Configuración de Playwright

Editar `playwright.config.ts`:

```typescript
use: {
  baseURL: "https://demoqa.com",
  trace: "on-first-retry",
  screenshot: "only-on-failure",
  video: "retain-on-failure"
}
```

### Configurar Navegadores

En `playwright.config.ts`:

```typescript
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } }
]
```

## 📦 Dependencias Principales

- **@playwright/test**: Framework de automatización UI
- **@cucumber/cucumber**: Framework BDD
- **TypeScript**: Lenguaje tipado
- **ts-node**: Ejecución de TypeScript
- **dotenv**: Gestión de variables de entorno
- **allure-playwright**: Reporting visual

## 🐛 Troubleshooting

### Error: "Cannot find module 'ts-node'"

Solución:
```bash
npm install -D ts-node @types/node typescript
```

### Error: "Playwright not found"

Solución:
```bash
npm install -D @playwright/test
npx playwright install
```

### Error: "Cucumber steps not found"

Solución:
- Verificar que los archivos `.ts` estén en `src/step-definitions/`
- Validar que `cucumber.js` apunte a la ruta correcta
- Ejecutar: `npm install -D ts-node/register`

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Documentación de Cucumber.js](https://cucumber.io/docs/cucumber/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Allure Reports](https://docs.qameta.io/allure/)

## 📝 Licencia

MIT

## 👨‍💻 Autor

Proyecto de Automatización QA

---

**Última actualización:** 31 de Enero, 2026
