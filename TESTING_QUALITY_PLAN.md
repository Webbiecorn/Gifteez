# 🧪 Testing & Quality Assurance Framework - Implementatieplan

**Datum:** 19 oktober 2025  
**Status:** Planning

---

## 🎯 Doel

Een **professionele testing & quality infrastructure** die:

1. **ESLint + Prettier**: Code consistency & automatic formatting
2. **Vitest + Testing Library**: Unit & component tests
3. **Playwright**: E2E smoke tests
4. **Husky**: Pre-commit hooks (lint + typecheck + tests)
5. **CI/CD**: Automated testing pipeline

---

## 📋 Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        CODE QUALITY LAYER                        │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  ESLint    │  │  Prettier  │  │  TypeScript│  │  Vitest  │ │
│  │  Linting   │  │  Format    │  │  Type      │  │  Unit    │ │
│  │  Rules     │  │  Code      │  │  Check     │  │  Tests   │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│         │               │               │               │       │
│         └───────────────┴───────────────┴───────────────┘       │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────────┐                         │
│                     │  PRE-COMMIT     │                         │
│                     │  HOOK (Husky)   │                         │
│                     └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TESTING PYRAMID                              │
│                                                                  │
│                          E2E Tests                               │
│                      (Playwright - 5-10)                         │
│                    ┌─────────────────┐                          │
│                    │ Smoke Tests     │                          │
│                    │ Critical Flows  │                          │
│                    └─────────────────┘                          │
│                                                                  │
│                  Integration Tests                               │
│              (Testing Library - 20-30)                           │
│           ┌─────────────────────────┐                           │
│           │ Component Interactions  │                           │
│           │ User Flows             │                           │
│           └─────────────────────────┘                           │
│                                                                  │
│              Unit Tests                                          │
│         (Vitest - 50-100)                                        │
│    ┌──────────────────────────┐                                 │
│    │ Business Logic          │                                 │
│    │ Utility Functions       │                                 │
│    │ Service Methods         │                                 │
│    └──────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tools & Configuration

### **1. ESLint** (Linting)

**Purpose:** Enforce code quality & consistency

**Rules:**

- ✅ Import order (react → libs → local)
- ✅ React Hooks rules
- ✅ TypeScript best practices
- ✅ Unused variables detection
- ✅ Consistent spacing & syntax

**Config:** `.eslintrc.cjs`

---

### **2. Prettier** (Formatting)

**Purpose:** Automatic code formatting

**Rules:**

- ✅ 2-space indentation
- ✅ Single quotes for strings
- ✅ Trailing commas
- ✅ No semicolons
- ✅ Max line length 100

**Config:** `.prettierrc`

---

### **3. Vitest** (Unit & Component Tests)

**Purpose:** Fast unit testing with TypeScript support

**Features:**

- ✅ React Testing Library integration
- ✅ Component testing with jsdom
- ✅ Snapshot testing
- ✅ Coverage reports
- ✅ Fast watch mode

**Config:** `vitest.config.ts`

---

### **4. Playwright** (E2E Tests)

**Purpose:** End-to-end smoke tests (already installed!)

**Test Scenarios:**

- ✅ Homepage navigation
- ✅ GiftFinder flow
- ✅ Search functionality
- ✅ Affiliate link clicks
- ✅ Blog navigation
- ✅ Mobile responsiveness

**Config:** `playwright.config.ts`

---

### **5. Husky** (Git Hooks)

**Purpose:** Pre-commit quality gates

**Hooks:**

- ✅ `pre-commit`: Lint staged files
- ✅ `pre-commit`: TypeScript typecheck
- ✅ `pre-commit`: Run unit tests
- ✅ `pre-push`: Run E2E tests (optional)

**Config:** `.husky/pre-commit`

---

## 📦 Dependencies to Install

### **ESLint & Prettier**

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-import \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### **Vitest & Testing Library**

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  jsdom
```

### **Husky & Lint-Staged**

```bash
npm install --save-dev \
  husky \
  lint-staged
```

**Note:** Playwright already installed ✅

---

## 📁 Files to Create

### **1. Configuration Files (6 files)**

#### `.eslintrc.cjs` (~100 lines)

ESLint configuration with React, TypeScript, Hooks rules

#### `.prettierrc` (~20 lines)

Prettier formatting configuration

#### `.prettierignore` (~10 lines)

Files to exclude from formatting

#### `vitest.config.ts` (~50 lines)

Vitest testing configuration

#### `playwright.config.ts` (~100 lines)

Playwright E2E configuration

#### `.husky/pre-commit` (~10 lines)

Pre-commit hook script

---

### **2. Unit Tests (3 files, ~300 lines)**

#### `services/__tests__/analyticsEventService.test.ts` (~100 lines)

Test event tracking functions

#### `services/__tests__/abTestingService.test.ts` (~100 lines)

Test A/B variant assignment & conversion tracking

#### `services/__tests__/funnelTrackingService.test.ts` (~100 lines)

Test funnel tracking & metrics calculation

---

### **3. Component Tests (3 files, ~400 lines)**

#### `components/__tests__/GiftResultCard.test.tsx` (~150 lines)

Test product card rendering, interactions, affiliate clicks

#### `components/__tests__/GiftFinderPage.test.tsx` (~150 lines)

Test filter changes, product display, analytics tracking

#### `components/__tests__/HomePage.test.tsx` (~100 lines)

Test hero section, CTA clicks, navigation

---

### **4. E2E Tests (3 files, ~300 lines)**

#### `e2e/navigation.spec.ts` (~100 lines)

Test navigation flows (home → giftfinder → deals → blog)

#### `e2e/giftfinder.spec.ts` (~100 lines)

Test GiftFinder flow (filters → results → affiliate click)

#### `e2e/search.spec.ts` (~100 lines)

Test search functionality, results display

---

### **5. Test Utilities (2 files, ~200 lines)**

#### `tests/setup.ts` (~50 lines)

Global test setup (jsdom, mocks, etc.)

#### `tests/test-utils.tsx` (~150 lines)

Custom render functions, mock providers, test helpers

---

## 🎯 Critical Components to Test

### **Priority 1: Core Business Logic**

1. ✅ `services/analyticsEventService.ts`
   - Event tracking functions
   - Session ID generation
   - Batch product impressions

2. ✅ `services/abTestingService.ts`
   - Variant assignment (deterministic)
   - Conversion tracking
   - Metrics calculation

3. ✅ `services/funnelTrackingService.ts`
   - Funnel session management
   - Step completion tracking
   - Drop-off rate calculation

4. ✅ `services/giftScoringService.ts`
   - Score calculation
   - Budget fit
   - Occasion matching

---

### **Priority 2: Critical UI Components**

1. ✅ `GiftResultCard.tsx`
   - Product display
   - Affiliate link click
   - Analytics tracking

2. ✅ `GiftFinderPage.tsx`
   - Filter changes
   - Product filtering
   - Results display

3. ✅ `HomePage.tsx`
   - Hero section
   - CTA clicks
   - Navigation

---

### **Priority 3: E2E Smoke Tests**

1. ✅ **Navigation Flow**
   - Home → GiftFinder → Deals → Blog → Categories

2. ✅ **GiftFinder Flow**
   - Apply filters → View results → Click product → Click affiliate

3. ✅ **Search Flow**
   - Search term → Results → Click result

---

## 🚀 Implementation Phases

### **Phase 1: Linting & Formatting** (Week 1)

#### Step 1: Install Dependencies

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import
```

#### Step 2: Create Configs

- `.eslintrc.cjs`
- `.prettierrc`
- `.prettierignore`

#### Step 3: Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

#### Step 4: Run Initial Format

```bash
npm run format
npm run lint:fix
```

---

### **Phase 2: Unit Testing** (Week 2)

#### Step 1: Install Vitest

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event @vitest/ui jsdom
```

#### Step 2: Create vitest.config.ts

#### Step 3: Create Test Setup

- `tests/setup.ts`
- `tests/test-utils.tsx`

#### Step 4: Write Unit Tests

- `services/__tests__/analyticsEventService.test.ts`
- `services/__tests__/abTestingService.test.ts`
- `services/__tests__/funnelTrackingService.test.ts`

#### Step 5: Add Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### **Phase 3: Component Testing** (Week 2)

#### Step 1: Write Component Tests

- `components/__tests__/GiftResultCard.test.tsx`
- `components/__tests__/GiftFinderPage.test.tsx`
- `components/__tests__/HomePage.test.tsx`

#### Step 2: Run Tests

```bash
npm run test
```

---

### **Phase 4: E2E Testing** (Week 3)

#### Step 1: Create playwright.config.ts

#### Step 2: Write E2E Tests

- `e2e/navigation.spec.ts`
- `e2e/giftfinder.spec.ts`
- `e2e/search.spec.ts`

#### Step 3: Add Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

### **Phase 5: Pre-commit Hooks** (Week 3)

#### Step 1: Install Husky

```bash
npm install --save-dev husky lint-staged
npx husky init
```

#### Step 2: Configure lint-staged in package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

#### Step 3: Create Pre-commit Hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Step 4: Test Hook

```bash
git add .
git commit -m "test: verify pre-commit hook"
# Should run: lint → format → typecheck → tests
```

---

## 📊 Test Coverage Goals

### **Unit Tests**

- **Target**: 80% coverage
- **Critical paths**: 95% coverage
- **Business logic**: 100% coverage

### **Component Tests**

- **Target**: 70% coverage
- **User interactions**: 90% coverage
- **Critical components**: 100% coverage

### **E2E Tests**

- **Target**: 5-10 smoke tests
- **Critical flows**: 100% coverage
- **Happy path**: Full coverage

---

## 🎯 Success Metrics

### **Week 1 (Linting)**

- ✅ 0 ESLint errors
- ✅ 0 ESLint warnings
- ✅ 100% formatted code
- ✅ Consistent import order

### **Week 2 (Unit Tests)**

- ✅ 50+ unit tests
- ✅ 80% coverage
- ✅ All business logic tested
- ✅ All services tested

### **Week 3 (E2E Tests)**

- ✅ 5-10 E2E tests
- ✅ Critical flows covered
- ✅ Pre-commit hooks working
- ✅ CI/CD pipeline setup

---

## 🔒 Quality Gates

### **Pre-commit**

```bash
# Runs automatically on `git commit`
1. ESLint check (no errors)
2. Prettier check (code formatted)
3. TypeScript check (no type errors)
4. Unit tests (all passing)
```

### **Pre-push** (Optional)

```bash
# Runs automatically on `git push`
1. Full unit test suite
2. E2E smoke tests
3. Build check
```

### **CI/CD** (GitHub Actions)

```yaml
# Runs on every PR
1. Lint & format check
2. TypeScript typecheck
3. Unit tests + coverage
4. E2E tests
5. Build verification
6. Bundle size check
```

---

## 📁 Project Structure

```
gifteez/
├── .eslintrc.cjs                # ESLint config
├── .prettierrc                  # Prettier config
├── .prettierignore              # Prettier ignore
├── vitest.config.ts             # Vitest config
├── playwright.config.ts         # Playwright config
├── .husky/
│   └── pre-commit              # Pre-commit hook
├── tests/
│   ├── setup.ts                # Global test setup
│   └── test-utils.tsx          # Custom test utilities
├── services/__tests__/
│   ├── analyticsEventService.test.ts
│   ├── abTestingService.test.ts
│   └── funnelTrackingService.test.ts
├── components/__tests__/
│   ├── GiftResultCard.test.tsx
│   ├── GiftFinderPage.test.tsx
│   └── HomePage.test.tsx
└── e2e/
    ├── navigation.spec.ts
    ├── giftfinder.spec.ts
    └── search.spec.ts
```

---

## 🎯 Expected Impact

### **Code Quality**

- **Consistency**: 100% formatted, linted code
- **Readability**: Consistent style across codebase
- **Maintainability**: Easy to understand & modify

### **Reliability**

- **Bug Prevention**: Catch errors before deployment
- **Regression Prevention**: Tests prevent breaking changes
- **Confidence**: Deploy with confidence

### **Developer Experience**

- **Fast Feedback**: Tests run in <5 seconds
- **Auto-fix**: ESLint & Prettier auto-fix issues
- **CI/CD**: Automated testing pipeline

### **ROI**

- **-50% bugs** in production
- **-30% debugging time**
- **+40% development speed** (confidence to refactor)

---

## 📋 Checklist

**Phase 1 (Linting):**

- [ ] Install ESLint & Prettier dependencies
- [ ] Create `.eslintrc.cjs`
- [ ] Create `.prettierrc`
- [ ] Add lint scripts to package.json
- [ ] Run initial format & lint

**Phase 2 (Unit Testing):**

- [ ] Install Vitest & Testing Library
- [ ] Create `vitest.config.ts`
- [ ] Create test setup files
- [ ] Write unit tests for services
- [ ] Achieve 80% coverage

**Phase 3 (Component Testing):**

- [ ] Write tests for GiftResultCard
- [ ] Write tests for GiftFinderPage
- [ ] Write tests for HomePage
- [ ] Achieve 70% coverage

**Phase 4 (E2E Testing):**

- [ ] Create `playwright.config.ts`
- [ ] Write navigation tests
- [ ] Write GiftFinder flow tests
- [ ] Write search tests

**Phase 5 (Pre-commit Hooks):**

- [ ] Install Husky
- [ ] Configure lint-staged
- [ ] Create pre-commit hook
- [ ] Test hook locally
- [ ] Deploy to team

---

**Next Steps:**

1. Review plan met team
2. Start Phase 1 (Linting)
3. Add tests incrementally
4. Monitor coverage metrics
5. Iterate & improve

---

**Documentation:**

- ESLint rules: `.eslintrc.cjs` (comments)
- Test patterns: `tests/test-utils.tsx` (examples)
- E2E patterns: `e2e/` folder (examples)
