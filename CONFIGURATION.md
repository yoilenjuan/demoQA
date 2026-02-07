# Estructura de Configuración Genérica para Cucumber

## Resumen de Cambios

Se ha configurado el proyecto de automatización con Cucumber para aceptar múltiples archivos `.feature` mediante un sistema escalable.

### Archivos Modificados

#### 1. [cucumber.js](cucumber.js)
**Cambios:**
- Documentación clara sobre cómo agregar nuevos features
- Arrays separados para `featureFiles` y `stepFiles`
- Estructura modular con `commonConfig` compartida entre perfiles
- Perfiles configurados: `default`, `smoke`, `regression`, `critical`

**Cómo agregar nuevos features:**
```javascript
const featureFiles = [
  "src/features/elements.feature",
  "src/features/newFeature.feature"  // Agregar aquí
];

const stepFiles = [
  "src/step-definitions/elements.steps.ts",
  "src/step-definitions/newFeature.steps.ts"  // Agregar aquí
];
```

#### 2. [package.json](package.json)
**Cambios:**
- Scripts NPM actualizados con requisitos explícitos: `--require`, `--require-module`, archivos feature
- Todos los scripts especifican los módulos necesarios para evitar problemas de inicialización

**Scripts disponibles:**
```bash
npm test                    # Ejecutar todos los tests
npm run test:smoke         # Tests con etiqueta @smoke
npm run test:regression    # Tests con etiqueta @regression
npm run test:parallel      # Tests en paralelo
```

### Convención de Nombres

Para que el sistema funcione correctamente, sigue esta convención:

```
src/
├── features/
│   ├── elements.feature          # Patrón: [nombre].feature
│   ├── buttons.feature
│   └── forms.feature
├── step-definitions/
│   ├── elements.steps.ts         # Patrón: [nombre].steps.ts
│   ├── buttons.steps.ts
│   └── forms.steps.ts
└── page-objects/
    ├── ElementsPage.ts           # Patrón: [Nombre]Page.ts
    ├── ButtonsPage.ts
    └── FormsPage.ts
```

### Procedimiento para Agregar Nuevos Archivos

1. **Crear el archivo .feature:**
   ```bash
   src/features/myFeature.feature
   ```

2. **Crear el archivo .steps.ts:**
   ```bash
   src/step-definitions/myFeature.steps.ts
   ```

3. **Actualizar cucumber.js:**
   - Abrir `cucumber.js`
   - Agregar `"src/features/myFeature.feature"` a `featureFiles`
   - Agregar `"src/step-definitions/myFeature.steps.ts"` a `stepFiles`

4. **Opcionalmente, crear Page Object:**
   ```bash
   src/page-objects/MyFeaturePage.ts
   ```

5. **Ejecutar tests:**
   ```bash
   npm test
   ```

### Ventajas de Esta Configuración

✅ **Escalable:** Agregar nuevos features solo requiere dos cambios en `cucumber.js`  
✅ **Modular:** Cada feature tiene su propio archivo de steps y page object  
✅ **Mantenible:** Estructura clara y consistente  
✅ **Flexible:** Soporta múltiples perfiles de ejecución  
✅ **Documentado:** Instrucciones claras en los archivos de configuración  

### Perfiles Disponibles

| Perfil | Propósito | Tags | Comando |
|--------|-----------|------|---------|
| `default` | Todos los tests | Ninguno | `npm test` |
| `smoke` | Tests críticos rápidos | `@smoke` | `npm run test:smoke` |
| `regression` | Suite completa | `@regression` | `npm run test:regression` |
| `critical` | Casos críticos solo | `@critical` | `cucumber-js --profile critical` |

### Tagging de Scenarios

Usa tags para categorizar tus scenarios:

```gherkin
@smoke @elements @ui-testing
Scenario: Valid scenario description
  Given step
  When step
  Then step

@regression @edge-case
Scenario: Edge case scenario
  Given step
  When step
  Then step
```

Luego ejecuta solo los tests que necesites:
```bash
npm run test:smoke      # Todos los @smoke
npm run test:regression # Todos los @regression
```

### Notas Importantes

⚠️ **Orden de Carga:** Los steps DEBEN cargar ANTES que los hooks  
⚠️ **Nombres:** Los archivos DEBEN seguir el patrón `[nombre].steps.ts`  
⚠️ **Ubicación:** Features en `src/features/`, Steps en `src/step-definitions/`  
⚠️ **Sincronización:** Si agregás un `.feature`, DEBES agregar el `.steps.ts`  

### Troubleshooting

**P: Agregué un feature pero no se ejecuta**
R: Asegúrate de:
- Seguir el patrón de nombres: `*.feature` y `*.steps.ts`
- Actualizar ambas arrays en `cucumber.js`
- Ejecutar `npm test -- --dry-run` para validar que se detecte

**P: "Step is undefined"**
R: Verifica que:
- El paso en el `.feature` coincide exactamente con el `Given/When/Then` en `.steps.ts`
- Las imports están correctas en el archivo `.steps.ts`

**P: Error de inicialización de Cucumber**
R: Asegúrate de:
- Los steps se cargan ANTES que los hooks en `package.json`
- No hay conflictos de módulos duplicados

### Próximas Mejoras Consideradas

- [ ] Implementar auto-descubrimiento con globSync (actualmente manual)
- [ ] Agregar validación de nombres en pre-commit hook
- [ ] Crear template generator para nuevos features
- [ ] Agregar CI/CD integration

---

Para más detalles, consulta [ADD_NEW_FEATURES.md](ADD_NEW_FEATURES.md)
