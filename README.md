# Avanni Goods: E-commerce QA Playground

A small e-commerce web app built as a **practice environment for QA and Quality Engineering**. It behaves like a real product, and like a real product, it has quality problems.

Part of **Avanni Lab by Ari Avalos**.

## Purpose

This is not meant to be a perfect store. It is a system to test, investigate, document, automate and improve. I use it to practice and demonstrate:

- Test planning and test case design
- Exploratory testing and bug reporting
- Risk analysis
- UI automation (Playwright)
- API and contract testing
- Accessibility and performance testing
- Regression testing and CI/CD
- Quality metrics and AI-assisted QA experiments

## What the app does

Browse, search, filter and sort products · product detail with variants · cart · coupons · multi-step checkout with mock payment · order confirmation · responsive layout (desktop, tablet, mobile).

The app contains realistic defects across functionality, validation, state handling, responsive behavior and accessibility. They are intentionally not documented here. Finding them is the point.

## Tech stack

React · TypeScript · Vite · mock API layer (`src/api`), separated from the UI so it can be tested independently.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

Test cards for the mock payment:
- `4111 1111 1111 1111` → successful payment
- `4000 0000 0000 0002` → declined payment

## Roadmap

- [ ] Test plan and test cases
- [ ] Exploratory testing sessions and bug reports
- [ ] Playwright suite
- [ ] API tests (Postman) and load tests (k6)
- [ ] Accessibility audit
- [ ] CI/CD pipeline
- [ ] Quality metrics dashboard

## Disclaimer

All products, prices and payments are fictional. No real payment data is processed or stored.
