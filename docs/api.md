# API Reference

This page documents the reverse-engineered RiseUp API that powers the CLI. All endpoints are read-only GET requests. The base URL is `https://input.riseup.co.il`.

::: warning
This is an unofficial, undocumented API. Endpoints and response shapes may change without notice.
:::

## Authentication

Every request requires these headers:

| Header | Value |
|--------|-------|
| `Cookie` | Session cookies from browser login |
| `COMMIT-HASH` | Build hash extracted from the RiseUp web app |
| `RISEUP-PLATFORM` | `WEB` |
| `Accept` | `application/json` |

Sessions are obtained by signing in through the browser (`riseup login`), which captures cookies and the commit hash from the running web app. Sessions are stored at `~/.config/riseup-cli/session.json` with `0600` permissions.

## Endpoints

### Budget

#### `GET /api/budget/current`

Returns the current month's budget with all envelopes and transactions.

#### `GET /api/budget/{date}/{count}`

Returns budgets starting from a given month.

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `date` | string | `2026-03` | Year-month (YYYY-MM) |
| `count` | number | `1` | Number of months to fetch |

#### `GET /api/budget/oldest`

Returns the oldest available budget date as plain text (e.g., `2025-05`).

### Balances

#### `GET /api/current-balance`

Returns an array of bank account balances across all connected accounts.

```typescript
interface Balance {
  _id: string
  accountNumberPiiId: string
  customerId: number
  balance: number
  lastUpdated: string
  source: string
  credentialsName: string
  accountNumberPiiValue?: string
}
```

#### `GET /api/current-credit-card-debt`

Returns an array of credit card debt entries.

```typescript
interface CreditCardDebt {
  _id: string
  name: string
  customerId: number
  lastUpdated: string
  accountNumberPiiId: string
  source: string
  amount: number
  accountNumberPiiValue?: string
}
```

### Insights and Plans

#### `GET /api/insights/all`

Returns all financial insights (tips, alerts).

```typescript
interface Insight {
  insightId: string
  insightName: string
  budgetDate: string
  _id: string
  customerId: number
  created: string
  deliveredAt?: string
  snoozed: boolean
  views: number
}
```

#### `GET /api/plans`

Returns all savings plans and goals.

### Account

#### `GET /api/credentials-settings`

Returns connected bank and credit card credentials.

```typescript
interface CredentialsSettings {
  credentialsConfigurations: CredentialConfig[]
  disabledObkSources: string[]
  allowNewConnections: boolean
}

interface CredentialConfig {
  bankIdentifier: string
  name: string
  status: string
  sourceName: string
  credentialsId: string
  accounts: CredentialAccount[]
  isInvalid: boolean
  isOBK: boolean
}
```

#### `GET /api/subscription`

Returns the user's billing subscription details.

```typescript
interface Subscription {
  id: string
  created: string
  customerId: number
  provider: string
  isFree: boolean
  nextPaymentDate: string
  previousPaymentDate: string
  currency: string
  amount: number
  status: string
  productName: string
  canceledAt: string | null
  planType: string
}
```

#### `GET /api/subscription-state-simplified`

Returns simplified subscription state.

```typescript
interface SubscriptionState {
  since: string
  isDormant: boolean
  hasAccessToCashflow: boolean
  inTrial: boolean
  isAutoRenewalOn: boolean
}
```

#### `GET /api/restricted-customer/session-data`

Returns session and customer data including household name and member info.

### Configuration

#### `GET /api/cashflow-start-day`

Returns the day of the month when the budget cycle resets.

#### `GET /api/logged-in/`

Returns `"OK"` as plain text if the session is valid.

## Core Types

### Transaction

The main data unit inside budget envelopes.

```typescript
interface Transaction {
  transactionId: string
  businessName: string
  source: string
  billingAmount: number | null
  incomeAmount: number | null
  originalAmount: number | null
  transactionDate: string
  billingDate: string
  isIncome: boolean
  expense: string
  isInstallment: boolean
  paymentNumber: number | null
  totalNumberOfPayments: number | null
  trackingCategory?: TrackingCategory
  aiEnrichment?: AiEnrichment
  rollingCredit: boolean
  deleted: boolean
  calendarMonth: string
  transactionBudgetDate: string
}
```

### Budget

```typescript
interface Budget {
  _id: string
  envelopes: Envelope[]
  excluded: Transaction[]
  trackingCategoryMetadata: TrackingCategoryMetadata[]
  budgetDate: string
  cashflowStartDay: number
  commitHash: string
  lastUpdatedAt: string
}
```

### Envelope

Envelopes group transactions by category within a budget.

```typescript
interface Envelope {
  id: string
  originalAmount: number
  balancedAmount: number
  type: string
  actuals: Transaction[]
  details: EnvelopeDetails
}
```

### TrackingCategory

Categories used to classify transactions (displayed in Hebrew).

```typescript
interface TrackingCategory {
  name: string
  id: string
}

interface TrackingCategoryMetadata {
  trackingCategoryId: string
  budgetDate: string
  historyAverage: number
  name: string
  display: string
  trackingCategoryType: string
  hasEnvelope: boolean
  activated: boolean
}
```

## Client Library

The CLI exposes a `RiseUpClient` class with namespaced methods:

```typescript
// Budget
client.budget.current()              // GET /api/budget/current
client.budget.get(date, count)       // GET /api/budget/{date}/{count}
client.budget.oldest()               // GET /api/budget/oldest

// Account
client.account.balances()            // GET /api/current-balance
client.account.creditCardDebt()      // GET /api/current-credit-card-debt
client.account.credentials()         // GET /api/credentials-settings
client.account.subscription()        // GET /api/subscription
client.account.subscriptionState()   // GET /api/subscription-state-simplified
client.account.sessionData()         // GET /api/restricted-customer/session-data

// Insights and Plans
client.insights.all()                // GET /api/insights/all
client.plans.list()                  // GET /api/plans

// Configuration
client.config.cashflowStartDay()     // GET /api/cashflow-start-day
```

## Error Handling

| Status | Error Type | Meaning |
|--------|-----------|---------|
| 401 | `AuthError` | Session expired or invalid. Run `riseup login`. |
| 4xx/5xx | `ApiError` | API returned an error. Includes status code and response. |
| Network failure | `NetworkError` | Could not reach RiseUp servers. |
