// ──────────────────────────────────────────────
// TypeScript interfaces for the RiseUp API
// Derived from 1,319 captured authenticated calls
// ──────────────────────────────────────────────

// ── Transactions & Envelopes ─────────────────

export interface Transaction {
  chunkId: string;
  accountNumberHash: string;
  billingAmount: number | null;
  incomeAmount: number | null;
  originalAmount: number | null;
  scraperSourceType: string;
  sourceType: string;
  isTemp?: boolean;
  transactionDate: string;
  businessName: string;
  source: string;
  accountNumberPiiId: string;
  billingDate: string;
  customerId: number;
  transactionId: string;
  isIncome: boolean;
  credentialsId: string;
  createdAt: string;
  deleted: boolean;
  updated: boolean;
  rollingCredit: boolean;
  isPotentialPapa: boolean;
  isPapa: boolean;
  hasPapa: boolean;
  papaTransactionIds?: string[];
  approximateMerge: boolean;
  originalDates: { transactionDate?: string; billingDate?: string };
  originalDate: string;
  balance: number | null;
  paymentNumber: number | null;
  totalNumberOfPayments: number | null;
  isInstallment: boolean;
  expense: string;
  expenseReason?: string;
  trackingCategory?: TrackingCategory;
  isPostponed: boolean;
  isPostponedOpenBanking: boolean;
  transactionBudgetDate: string;
  calendarMonth: string;
  ageInDays: number;
  transactionWeekInMonth: number;
  placement: string;
  placementReason: string;
  sequenceId?: string;
  previousTransactionId?: string;
  monthsInterval?: number;
  sequencerName?: string;
  modelScore?: number;
  aiEnrichment?: AiEnrichment;
  accountNumberPiiValue?: string;
}

export interface TrackingCategory {
  name: string;
  id: string;
  matchingPredicates?: MatchingPredicate[];
}

export interface MatchingPredicate {
  categoryName: string;
  categoryId: string;
  categoryEnabled: boolean;
  customerId: number;
  trackingCategoryId: string;
  matchBy: string;
  value: string;
}

export interface AiEnrichment {
  businessName: string;
  enrichmentSetId: string;
  businessCategoryNormalized: string;
  businessCategoryRaw: string;
  mappedCategory: string;
}

// ── Envelope ─────────────────────────────────

export interface Envelope {
  id: string;
  originalAmount: number;
  balancedAmount: number;
  type: string;
  actuals: Transaction[];
  details: EnvelopeDetails;
  balanceDate?: string;
}

export interface EnvelopeDetails {
  previousTransactionId?: string;
  transactionDate?: string;
  expense?: string;
  businessName?: string;
  sequence?: Transaction[];
}

// ── Budget ───────────────────────────────────

export interface Budget {
  _id: string;
  envelopes: Envelope[];
  excluded: Transaction[];
  trackingCategoryMetadata: TrackingCategoryMetadata[];
  customerId: number;
  budgetDate: string;
  cashflowHash: string;
  lastUpdatedAt: string;
  commitHash: string;
  cashflowStartDay: number;
  created: string;
  __v: number;
  modelVersion: number;
  params: { variableIncomePredictionAmount: number | null };
}

export interface TrackingCategoryMetadata {
  trackingCategoryId: string;
  budgetDate: string;
  historyAverage: number;
  name: string;
  display: string;
  basedOnHistoryAverage: boolean;
  trackingCategoryType: string;
  hasEnvelope: boolean;
  activated: boolean;
}

// ── Account / Balance ────────────────────────

export interface Balance {
  _id: string;
  accountNumberPiiId: string;
  customerId: number;
  balance: number;
  lastUpdated: string;
  source: string;
  credentialsName: string;
  created: string;
  __v: number;
  accountNumberPiiValue?: string;
}

export interface CreditCardDebt {
  _id: string;
  name: string;
  customerId: number;
  lastUpdated: string;
  accountNumberPiiId: string;
  source: string;
  amount: number;
  created: string;
  __v: number;
  accountNumberPiiValue?: string;
}

// ── Subscription ─────────────────────────────

export interface Subscription {
  id: string;
  created: string;
  customerId: number;
  providerCustomerId: string;
  provider: string;
  isFree: boolean;
  nextPaymentDate: string;
  previousPaymentDate: string;
  currency: string;
  amount: number;
  status: string;
  productName: string;
  canceledAt: string | null;
  planType: string;
  scheduledCancellationDate: string | null;
  cancellationRequestDate: string | null;
}

export interface SubscriptionState {
  since: string;
  isDormant: boolean;
  hasAccessToCashflow: boolean;
  inTrial: boolean;
  isAutoRenewalOn: boolean;
}

// ── Credentials ──────────────────────────────

export interface CredentialsSettings {
  credentialsConfigurations: CredentialConfig[];
  disabledObkSources: string[];
  allowNewConnections: boolean;
}

export interface CredentialConfig {
  bankIdentifier: string;
  name: string;
  status: string;
  sourceName: string;
  credentialsId: string;
  accounts: CredentialAccount[];
  isInvalid: boolean;
  isOBK: boolean;
  openBankingConsentId?: string;
  displayIncidentTooltip: boolean;
  buttons: {
    displayMigrateBtn: boolean;
    displayReconnectConsentBtn: boolean;
    displayReconnectBtn: boolean;
  };
}

export interface CredentialAccount {
  sourceName: string;
  sourceType: string;
  accountNumberPiiId: string;
  isExcluded: boolean;
  accountNickname: string;
  accountNumberPiiValue?: string;
}

// ── Insights ─────────────────────────────────

export interface Insight {
  insightId: string;
  insightName: string;
  budgetDate: string;
  _id: string;
  customerId: number;
  created: string;
  __v: number;
  deliveredAt?: string;
  snoozed: boolean;
  views: number;
}

// ── Plans ────────────────────────────────────

/** Plans endpoint returns an array; shape may vary. Typed loosely for now. */
export interface Plan {
  [key: string]: unknown;
}

// ── Session ──────────────────────────────────

export interface SessionData {
  restrictedCustomerData: {
    customerId: number;
    intercomUserHash: string;
    householdName: string;
    primaryMember: {
      firstNamePiiId: string;
      lastNamePiiId: string;
      emailPiiId: string;
      phoneNumberPiiId: string;
      firstNamePiiValue: string;
      lastNamePiiValue: string;
      emailPiiValue: string;
      phoneNumberPiiValue: string;
    };
    isRestrictedCustomer: boolean;
  };
  members: Array<{
    _id: string;
    market: string;
    primary: boolean;
  }>;
  activeMember: {
    _id: string;
    market: string;
    primary: boolean;
  };
  onboardingStatus: string;
}

// ── Financial Summary (Investments) ──────────

export interface FinancialSummary {
  securities: SecurityAccount[];
  savingsAccounts: SavingsAccount[];
  loans: LoanAccount[];
  mortgages: MortgageAccount[];
}

export interface SecurityAccount {
  resourceId: string;
  iban: string;
  currency: string;
  usage: string;
  cashAccountType: string;
  displayName: string;
  sourceIdentifier: string;
  balances: Array<{
    balanceAmount: { amount: string; currency: string };
    balanceType: string;
    referenceDateTime: string;
  }>;
  positions: SecurityPosition[];
  balanceAmount: { amount: string; currency: string };
}

export interface SecurityPosition {
  unitsNumber: number;
  details: string;
  averageBuyingPrice: { currency: string; amount: string };
  estimatedCurrentValue: {
    evaluationDate: string;
    amount: { currency: string; amount: string };
  };
  financialInstrument: {
    isin: string;
    name: string;
    normalisedPrice: {
      amount: { amount: string; currency: string };
      priceDate: string;
    };
  };
}

export interface SavingsAccount {
  [key: string]: unknown;
}

export interface LoanAccount {
  [key: string]: unknown;
}

export interface MortgageAccount {
  [key: string]: unknown;
}

// ── Cashflow Trends ─────────────────────────

export interface CashflowTrends {
  variables: CashflowTrendEntry[];
  fixed: CashflowFixedEntry[];
  income_fixed?: CashflowFixedEntry[];
  income_variables?: CashflowTrendEntry[];
}

export interface CashflowTrendEntry {
  cashflowMonth: string;
  amount: number;
}

export interface CashflowFixedEntry {
  cashflowMonth: string;
  amount: number;
  expense: string;
}

// ── Credential Info ─────────────────────────

export interface CredentialInfo {
  _id: string;
  name: string;
  status: string;
  customerId: number;
  credentialsId: string;
  sourceName: string;
  provider: string;
  created: string;
  __v: number;
  openBankingConsentId?: string;
  statusExtraData: Record<string, unknown>;
  lastScrapedAt: string;
}

export interface CredentialAccountMapping {
  _id: string;
  customerId: number;
  credentialsId: string;
  accountNumberPiiIds: Array<{
    _id: string;
    accountNumberPiiId: string;
    source: string;
    sourceType: string;
    isExcluded: boolean;
    accountNickname: string;
    accountNumberPiiValue?: string;
    ibanPiiValue?: string;
    scraperSourceAccountNumber?: string | null;
  }>;
  createdAt: string;
  __v: number;
}

// ── Customer Progress ───────────────────────

export interface CustomerProgress {
  averageCashflows: number;
  positiveCashflowsCount: number;
  averageSavings: number;
  totalSavings: number;
  totalCashflowsAndSavingsSinceActivation: number;
  topCategoryTrends: {
    highestNegativeChangeCategory?: {
      categoryName: string;
      categoryId: string;
      categoryIdHash: string;
      topBusinessNames: Array<{
        businessName: string;
        transactionsSum: number;
        transactionsCount: number;
      }>;
      quarterlyChangeAmount: number;
      quarterlyChangePercentage: number;
      lastQuarterAmount: number;
      currentQuarterAmount: number;
    };
  };
  progressState: {
    progressStatus: string;
    inTrial: boolean;
    currentOshIsPositive: boolean;
    hasRecentNegativeCashflows: boolean;
    hasRecentSavingsTransaction: boolean;
    monthlySavingsRecommendation: number;
  };
}

// ── Stored session file shape ────────────────

export interface StoredSession {
  cookies: string;
  commitHash: string;
  savedAt?: string;
  expiresAt?: string;
}
