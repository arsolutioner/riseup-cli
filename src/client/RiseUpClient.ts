import { HttpClient } from "./http.js";
import { SessionManager } from "../auth/SessionManager.js";
import type {
  Budget,
  Balance,
  CreditCardDebt,
  Plan,
  Insight,
  CredentialsSettings,
  Subscription,
  SubscriptionState,
  SessionData,
  FinancialSummary,
  CashflowTrends,
  CredentialInfo,
  CredentialAccountMapping,
  CustomerProgress,
} from "./types.js";

export interface RiseUpClientOptions {
  /** Override the base URL (defaults to https://input.riseup.co.il). */
  baseUrl?: string;
  /** Explicit path to the session file (highest-priority auth tier). */
  sessionPath?: string;
  /** Provide your own SessionManager instance (takes precedence over sessionPath). */
  sessionManager?: SessionManager;
}

/**
 * Facade for the RiseUp API.
 *
 * Provides namespaced sub-clients for discoverability:
 *
 *   client.budget.current()
 *   client.account.balances()
 *   client.insights.all()
 */
export class RiseUpClient {
  readonly http: HttpClient;
  readonly session: SessionManager;

  constructor(options: RiseUpClientOptions = {}) {
    this.session =
      options.sessionManager ?? new SessionManager(options.sessionPath);
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      sessionManager: this.session,
    });
  }

  // ═══════════════════════════════════════════
  //  Namespaced sub-clients
  // ═══════════════════════════════════════════

  /** Budget / cashflow endpoints. */
  budget = {
    current: () => this.getCurrentBudget(),
    get: (date: string, count?: number) => this.getBudgets(date, count),
    oldest: () => this.getOldestBudgetDate(),
  };

  /** Account, balance, and credential endpoints. */
  account = {
    balances: () => this.getBalances(),
    creditCardDebt: () => this.getCreditCardDebt(),
    credentials: () => this.getCredentialsSettings(),
    credentialsInfo: () => this.getCredentialsInfo(),
    credentialAccounts: () => this.getCredentialAccounts(),
    financialSummary: () => this.getFinancialSummary(),
    subscription: () => this.getSubscription(),
    subscriptionState: () => this.getSubscriptionState(),
    sessionData: () => this.getSessionData(),
  };

  /** Insights. */
  insights = {
    all: () => this.getInsights(),
  };

  /** Plans. */
  plans = {
    list: () => this.getPlans(),
  };

  /** Configuration. */
  config = {
    cashflowStartDay: () => this.getCashflowStartDay(),
  };

  /** Hamster analytics endpoints. */
  hamster = {
    cashflowTrends: () => this.getCashflowTrends(),
    customerProgress: () => this.getCustomerProgress(),
  };

  /** Transaction write operations. */
  transactions = {
    classify: (transactionId: string, businessName: string, expense: string, applyTo: "single" | "all" = "all") =>
      this.http.postText("/api/enrichment-update/save-enrichment", { transactionId, businessName, expense, applyTo }),

    rename: (transactionId: string, businessName: string, expense: string, applyTo: "single" | "all" = "single") =>
      this.http.postText("/api/enrichment-update/save-enrichment", { transactionId, businessName, expense, applyTo }),

    comment: (transactionId: string, comment: string) =>
      this.http.postText("/api/enrichment-update/save-comments", { transactionId, comment }),

    exclude: (transactionId: string) =>
      this.http.postText("/api/investigator/answers/budget-category", { transactionId, budgetCategory: "excluded" }),

    include: (transactionId: string) =>
      this.http.postText("/api/investigator/answers/unexclude-transaction", { transactionId }),

    setBudgetType: (transactionId: string, budgetCategory: "fixed" | "variable") =>
      this.http.postText("/api/investigator/answers/budget-category", { transactionId, budgetCategory }),

    merge: (transactionId: string, input: string = "approved") =>
      this.http.postText("/api/investigator/answers/merge", { papasMergeInput: [{ transactionId, input }] }),

    adjustPrediction: (payload: {
      envelopeId: string;
      amount: number;
      applyOnBudgetDate: string;
      sequenceId: string;
      isPermanent?: boolean;
      monthsAhead?: number;
    }) =>
      this.http.postText("/api/prediction-update/update-amount", {
        ...payload,
        isPermanent: payload.isPermanent ?? true,
        monthsAhead: payload.monthsAhead ?? 1,
      }),
  };

  // ═══════════════════════════════════════════
  //  Direct API methods
  // ═══════════════════════════════════════════

  /** Check if the session is still authenticated. Returns "OK" on success. */
  async isLoggedIn(): Promise<string> {
    return this.http.getText("/api/logged-in/");
  }

  /** Fetch the current month's budget. */
  async getCurrentBudget(): Promise<Budget> {
    return this.http.getJson<Budget>("/api/budget/current");
  }

  /**
   * Fetch budgets starting from a given date.
   *
   * The RiseUp API has a +1 month offset: requesting "2026-03" returns
   * budgetDate "2026-02". We compensate here so callers get the month
   * they actually asked for.
   *
   * @param date  e.g. "2026-03"
   * @param count number of months to fetch (default 1)
   */
  async getBudgets(date: string, count = 1): Promise<Budget[]> {
    const [year, month] = date.split("-").map(Number);
    const adjusted = new Date(year, month, 1); // month is already 1-based, so this adds +1
    const apiDate = `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, "0")}`;
    return this.http.getJson<Budget[]>(`/api/budget/${apiDate}/${count}`);
  }

  /** Get the oldest budget date the user has (e.g. "2025-06"). */
  async getOldestBudgetDate(): Promise<string> {
    return this.http.getText("/api/budget/oldest");
  }

  /** Get current balances across all connected accounts. */
  async getBalances(): Promise<Balance[]> {
    return this.http.getJson<Balance[]>("/api/current-balance");
  }

  /** Get outstanding credit-card debt for each card. */
  async getCreditCardDebt(): Promise<CreditCardDebt[]> {
    return this.http.getJson<CreditCardDebt[]>("/api/current-credit-card-debt");
  }

  /** Get all financial plans. */
  async getPlans(): Promise<Plan[]> {
    return this.http.getJson<Plan[]>("/api/plans");
  }

  /** Get all insights (tips, alerts). */
  async getInsights(): Promise<Insight[]> {
    return this.http.getJson<Insight[]>("/api/insights/all");
  }

  /** Get connected credential (bank/card) settings. */
  async getCredentialsSettings(): Promise<CredentialsSettings> {
    return this.http.getJson<CredentialsSettings>("/api/credentials-settings");
  }

  /** Get billing subscription details. */
  async getSubscription(): Promise<Subscription> {
    return this.http.getJson<Subscription>("/api/subscription");
  }

  /** Get the day-of-month when cashflow resets. */
  async getCashflowStartDay(): Promise<{ cashflowStartDay: number }> {
    return this.http.getJson<{ cashflowStartDay: number }>(
      "/api/cashflow-start-day",
    );
  }

  /** Get simplified subscription state. */
  async getSubscriptionState(): Promise<SubscriptionState> {
    return this.http.getJson<SubscriptionState>(
      "/api/subscription-state-simplified",
    );
  }

  /** Get session/customer data. */
  async getSessionData(): Promise<SessionData> {
    return this.http.getJson<SessionData>(
      "/api/restricted-customer/session-data",
    );
  }

  /** Get investment portfolio, savings accounts, loans, and mortgages. */
  async getFinancialSummary(): Promise<FinancialSummary> {
    return this.http.getJson<FinancialSummary>(
      "/api/aggregator/financial-summary",
    );
  }

  /** Get detailed credential info with status and last scrape time. */
  async getCredentialsInfo(): Promise<CredentialInfo[]> {
    return this.http.getJson<CredentialInfo[]>("/api/credentials-info");
  }

  /** Get credential-to-account number mappings. */
  async getCredentialAccounts(): Promise<CredentialAccountMapping[]> {
    return this.http.getJson<CredentialAccountMapping[]>(
      "/api/creds-to-accounts",
    );
  }

  /** Get cashflow trends with fixed vs variable breakdown. */
  async getCashflowTrends(): Promise<CashflowTrends> {
    return this.http.getJson<CashflowTrends>("/api/hamster/cashflow-trends");
  }

  /** Get financial health metrics and savings progress. */
  async getCustomerProgress(): Promise<CustomerProgress> {
    return this.http.getJson<CustomerProgress>(
      "/api/hamster/customer-progress",
    );
  }
}
