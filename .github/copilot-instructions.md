<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## DemoQA Automation Framework

Este es un proyecto de automatización UI para DemoQA usando:
- **Playwright** 1.43.1 - Framework de automatización
- **TypeScript** 5.4.5 - Lenguaje principal
- **Cucumber** 10.3.1 - Framework BDD
- **Page Object Model (POM)** - Arquitectura
- **Node.js** 18.19.1 LTS - Runtime

### Estructura del Proyecto

```
src/
  ├── page-objects/       # Classes de Page Object Model
  ├── step-definitions/   # Steps de Cucumber
  ├── features/           # Archivos .feature (Gherkin)
  ├── support/            # Gestión de navegador
  ├── config/             # Configuración
  └── utils/              # Funciones helper
```

### Convenciones de Código

- **Page Objects**: Extienden `BasePage`, contienen locators privados y métodos públicos
- **Step Definitions**: Importan `@cucumber/cucumber`, utilizan `async/await`
- **TypeScript**: Modo estricto habilitado, tipos explícitos requeridos
- **Nomenclatura**: camelCase para métodos, UPPER_CASE para constantes

### Comandos Frecuentes

- `npm install` - Instalar dependencias
- `npm test` - Ejecutar todos los tests
- `npm run test:ui` - Ejecutar en modo UI
- `npm run clean:reports` - Limpiar reportes

### Archivos Importantes

- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración TypeScript
- `cucumber.js` - Configuración Cucumber
- `playwright.config.ts` - Configuración Playwright
- `.env` - Variables de entorno (no commitear)

### Creando Nuevas Pruebas

1. Crear `.feature` en `src/features/`
2. Crear Page Object en `src/page-objects/`
3. Crear steps en `src/step-definitions/`
4. Ejecutar con `npm test`

### Recursos

- [Playwright](https://playwright.dev/)
- [Cucumber.js](https://cucumber.io/docs/cucumber/)
- [TypeScript](https://www.typescriptlang.org/)
- [DemoQA](https://demoqa.com/)
