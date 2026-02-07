# Cómo Agregar Nuevos Archivos de Features

Este documento explica cómo extender la configuración de Cucumber para incluir nuevos archivos `.feature` y sus correspondientes definiciones de steps.

## Estructura Actual

```
src/
├── features/
│   └── elements.feature          ← Archivo feature existente
├── step-definitions/
│   └── elements.steps.ts         ← Pasos existentes
└── support/
    └── hooks.ts                  ← Hooks (no modificar)
```

## Pasos para Agregar un Nuevo Feature

### 1. Crear el archivo .feature

Crea un nuevo archivo en `src/features/` con el patrón: `[nombreFeature].feature`

**Ejemplo:** `src/features/buttons.feature`

```gherkin
@ui-testing @buttons
Feature: DemoQA Buttons Testing

  @smoke @buttons-click
  Scenario: Click different button types
    Given I navigate to DemoQA website
    And I navigate to Elements section
    And I click on Buttons link
    When I click the "Double Click Me" button
    Then I should see the double click message
```

### 2. Crear el archivo .steps.ts

Crea un nuevo archivo en `src/step-definitions/` con el patrón: `[nombreFeature].steps.ts`

**Ejemplo:** `src/step-definitions/buttons.steps.ts`

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import browserManager from "../support/browser-manager";
import ButtonsPage from "../page-objects/ButtonsPage";
import logger from '../utils/logger';

let page: Page;
let buttonsPage: ButtonsPage;

Given("I click on Buttons link", async function () {
  page = browserManager.page!;
  buttonsPage = new ButtonsPage(page);
  
  logger.step('Clicking on Buttons link');
  await buttonsPage.clickButtonsLink();
});

When("I click the {string} button", async function (buttonName: string) {
  logger.step(`Clicking on ${buttonName} button`);
  await buttonsPage.clickButton(buttonName);
});

Then("I should see the double click message", async function () {
  logger.step('Verifying double click message');
  const message = await buttonsPage.getDoubleClickMessage();
  expect(message).toBeTruthy();
});
```

### 3. Actualizar cucumber.js

Abre el archivo `cucumber.js` en la raíz del proyecto y agrega tus nuevos archivos a las arrays:

```javascript
// Feature files to execute (add new .feature files here)
const featureFiles = [
  "src/features/elements.feature",
  "src/features/buttons.feature"        // <-- AGREGADO
];

// Step definition files (add new .steps.ts files here)
const stepFiles = [
  "src/step-definitions/elements.steps.ts",
  "src/step-definitions/buttons.steps.ts"  // <-- AGREGADO
];
```

### 4. Crear el Page Object (opcional pero recomendado)

Para mantener la arquitectura limpia, crea un Page Object en `src/page-objects/`:

**Ejemplo:** `src/page-objects/ButtonsPage.ts`

```typescript
import { Page } from "@playwright/test";
import BasePage from "./BasePage";

class ButtonsPage extends BasePage {
  private doubleClickBtn = "button:has-text('Double Click Me')";
  private doubleClickMsg = "#doubleClickMessage";

  async clickButtonsLink() {
    await this.page.click("text=Buttons");
    await this.page.waitForLoadState("networkidle");
  }

  async clickButton(buttonName: string) {
    await this.page.click(`button:has-text('${buttonName}')`);
  }

  async getDoubleClickMessage() {
    return await this.page.textContent(this.doubleClickMsg);
  }
}

export default ButtonsPage;
```

### 5. Ejecutar los Tests

```bash
# Ejecutar todos los tests incluyendo el nuevo feature
npm test

# Ejecutar solo los tests con tag @smoke
npm test:smoke

# Ejecutar un profile específico
npm test:regression
```

## Nombrado de Archivos

Para que el sistema funcione correctamente, sigue estos patrones:

| Tipo | Ubicación | Patrón | Ejemplo |
|------|-----------|--------|---------|
| Feature | `src/features/` | `*.feature` | `buttons.feature` |
| Steps | `src/step-definitions/` | `*.steps.ts` | `buttons.steps.ts` |
| Page Object | `src/page-objects/` | `*Page.ts` | `ButtonsPage.ts` |

## Estructura Recomendada para Features Complejos

Si tienes múltiples features relacionadas, puedes organizarlas en subdirectorios:

```
src/features/
├── elements/
│   ├── textbox.feature
│   ├── buttons.feature
│   └── checkboxes.feature
├── forms/
│   ├── practiceForm.feature
│   └── submission.feature
└── tables/
    └── dataTable.feature

src/step-definitions/
├── textbox.steps.ts
├── buttons.steps.ts
├── checkboxes.steps.ts
├── practiceForm.steps.ts
├── submission.steps.ts
└── dataTable.steps.ts

src/page-objects/
├── TextBoxPage.ts
├── ButtonsPage.ts
├── CheckboxesPage.ts
├── PracticeFormPage.ts
└── DataTablePage.ts
```

Luego en `cucumber.js`, simplemente agrega todos los archivos:

```javascript
const featureFiles = [
  "src/features/elements/textbox.feature",
  "src/features/elements/buttons.feature",
  "src/features/elements/checkboxes.feature",
  "src/features/forms/practiceForm.feature",
  "src/features/forms/submission.feature",
  "src/features/tables/dataTable.feature"
];

const stepFiles = [
  "src/step-definitions/textbox.steps.ts",
  "src/step-definitions/buttons.steps.ts",
  "src/step-definitions/checkboxes.steps.ts",
  "src/step-definitions/practiceForm.steps.ts",
  "src/step-definitions/submission.steps.ts",
  "src/step-definitions/dataTable.steps.ts"
];
```

## Scripts NPM Disponibles

```bash
npm test                 # Ejecutar todos los tests
npm run test:smoke      # Ejecutar tests con @smoke tag
npm run test:regression # Ejecutar tests con @regression tag
npm run test:parallel   # Ejecutar tests en paralelo
npm run test:report     # Ver reporte Allure
npm run test:serenity   # Ver reporte Serenity
npm run clean:reports   # Limpiar reportes anteriores
```

## Troubleshooting

### Los tests no se ejecutan después de agregar nuevos files

1. Verifica que los nombres de archivos sigan el patrón correcto
2. Confirma que hayas actualizado `cucumber.js` con las nuevas rutas
3. Ejecuta `npm test -- --dry-run` para verificar que los scenarios se detectan
4. Limpia la caché: `npm run clean:reports`

### Error: "Given step is undefined"

Asegúrate de que:
- El archivo `.steps.ts` está en `src/step-definitions/`
- El nombre del paso en el `.feature` coincide exactamente con el `Given/When/Then` en el `.steps.ts`
- Importaste correctamente `{ Given, When, Then }` de `@cucumber/cucumber`

### Error: "Page object module not found"

Verifica que:
- El path de import en el `.steps.ts` es correcto
- El archivo Page Object existe en `src/page-objects/`
- El export está correctamente definido: `export default ClassName`
