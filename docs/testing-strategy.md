# Testing Strategy — DemoQA Automation Framework

> **Document type**: Architectural reference  
> **Audience**: QA Engineers, Technical Leads  
> **Last updated**: March 24, 2026

---

## Purpose

This document captures testing concepts and strategies that are architecturally relevant but **not automatable** against the DemoQA demo environment. These are documented as a reference for what would need to be implemented when applying this framework against a production-grade application.

DemoQA is a frontend-only demonstration site with no real backend security, database, or session management. The test automation coverage achievable against it is therefore limited to UI interactions, navigation, form submission, alerts, and element manipulation.

---

## Automated Coverage (Implemented)

| Module | Scenarios | Tags |
|---|---|---|
| Authentication | 5 | @smoke @critical @negative @regression |
| Navigation | 6 | @smoke @critical @regression @negative |
| Elements | 10 | @smoke @critical @regression |
| Practice Form | 4 | @smoke @regression |
| Alerts, Frame & Windows | 6 | @smoke |
| Quick Tests | 4 | @smoke |
| Configuration (framework-level) | 1 active + 3 @skip | @regression |
| User Management (data-layer) | 4 active + 3 @skip | @smoke @critical @regression |
| **Total active** | **54** | — |

---

## Concepts NOT Automatable Against DemoQA

The following categories are documented here as testing strategy reference but cannot be automated against the DemoQA demo environment.

### Security Testing

**SQL Injection**
In production systems, validate:
- `admin'; DROP TABLE users;--`
- `' OR '1'='1`
- UNION SELECT attacks  
*DemoQA constraint: Frontend-only, no SQL backend.*

**Session Security**
In production systems, validate:
- Session fixation attacks
- Session hijacking attempts
- Token replay attacks
- CSRF protection  
*DemoQA constraint: No sophisticated session management.*

**XSS Prevention**
In production systems, validate:
- `<script>alert('XSS')</script>`
- `javascript:alert('XSS')`
- Event handler injection vectors  
*DemoQA constraint: Frontend validation is minimal.*

**Brute Force Protection**
In production systems, validate:
- Account lockout after N failed attempts
- Rate limiting mechanisms
- CAPTCHA activation after repeated failures
- IP-based blocking  
*DemoQA constraint: No backend security mechanisms.*

---

### Performance Testing

In production systems, validate:
- Memory leak detection during long navigation sessions
- Resource loading optimization
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Core Web Vitals thresholds  
*DemoQA constraint: Demo environment not suitable for performance benchmarking.*

---

### Advanced Accessibility Testing

In production systems, validate:
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Full keyboard navigation paths
- ARIA attribute correctness
- Focus management during modal dialogs and error states  
*DemoQA constraint: Requires specialized a11y tooling (axe-core, Lighthouse) beyond basic indicator checks.*

---

### Network Resilience Testing

In production systems, validate:
- Offline mode functionality (PWA scenarios)
- Network timeout handling and retry logic
- Connection interruption recovery
- Degraded network conditions (throttling)  
*DemoQA constraint: Demo site does not support service workers or offline modes.*

---

### Concurrency Testing

In production systems, validate:
- Race condition handling under concurrent user load
- Resource contention between parallel sessions
- Transaction integrity under simultaneous operations  
*DemoQA constraint: Single-session demo environment.*

---

### Advanced Boundary Testing

In production systems, validate:
- Extreme input lengths (256+ characters)
- Unicode edge cases and right-to-left text
- Special character handling (emoji, zero-width chars)
- Buffer overflow attempts at API level  
*DemoQA constraint: Frontend validation is basic.*

---

## Framework Extension Points

When targeting a production application, the following should be added:

1. **Security test suite** — Dedicated feature file with OWASP-aligned scenarios
2. **API layer** — Axios-based request/response assertions in step definitions  
3. **Performance thresholds** — CWV metrics via Playwright's CDP protocol
4. **Accessibility suite** — axe-core integration in hooks for automated a11y scanning
5. **Visual regression** — Screenshot diffing via Playwright's `toHaveScreenshot()` or Percy
6. **Load testing** — K6 or Artillery integration alongside Playwright for combined UI+API load scenarios

---

## Tag Strategy

| Tag | Scope | When to run |
|---|---|---|
| `@smoke` | Core happy paths (~20 scenarios) | Every commit |
| `@critical` | Business-critical paths (~6) | Every deployment |
| `@regression` | Full feature coverage (~25) | Nightly / pre-release |
| `@negative` | Error and boundary paths | Nightly |
| `@skip` | Unimplemented (framework-internal) | Never — @skip excluded by default |
| `@manual` | Cannot be automated | Never |
| `@documentation_only` | Conceptual reference (this file) | Never |

---

## Known DemoQA Constraints

| Constraint | Impact | Mitigation |
|---|---|---|
| Ad overlays intercept button clicks | Dialog triggers fail | Use `page.once('dialog')` + `{ force: true }` |
| Homepage title sometimes `"demosite"` | Title assertions too strict | Regex `DEMOQA\|ToolsQA\|demosite` |
| reCAPTCHA on registration | Registration cannot be fully automated | Step annotated with `# Note:` comment |
| No real user persistence | Dynamic user creation falls back to seed data | `UserRotationManager` with JSON file storage |
| Ads cause heading count = 0 on redirect | Accessibility assertions fail | Non-fatal check with warning log |
