// These interfaces define exactly what data each event carries
// Think of each interface as a form with specific required fields

export interface BaseEvent {
  event_type: string;
  event_id: string;
  source_system: string;
  timestamp: string;
  priority: number;
  user_id: string;
  idempotency_key: string;
}

// Transaction Events
export interface BuyOrderExecutedPayload {
  stock_name: string;
  qty: number;
  price: number;
  total: number;
  portfolio_value: number;
  order_id: string;
}

export interface SellOrderExecutedPayload {
  stock_name: string;
  qty: number;
  price: number;
  pnl: number;
  order_id: string;
}

export interface OrderRejectedPayload {
  reason_code: string;
  reason_description: string;
  order_id: string;
}

// Risk Events - most important ones
export interface MarginCallPayload {
  shortfall_amount: number;
  current_margin: number;
  required_margin: number;
  deadline: string;
  affected_positions: Array<{
    symbol: string;
    qty: number;
    current_value: number;
  }>;
  auto_square_off_time: string;
}

export interface PositionSquaredOffPayload {
  positions_closed: Array<{
    symbol: string;
    qty: number;
    price: number;
  }>;
  total_pnl: number;
  remaining_positions: number;
}

// SIP Events
export interface SipDueReminderPayload {
  fund_name: string;
  amount: number;
  due_date: string;
  bank_account_last4: string;
}

export interface SipExecutedPayload {
  fund_name: string;
  units_allotted: number;
  nav: number;
  total_investment: number;
}

// Market Events
export interface PriceAlertPayload {
  stock_name: string;
  target_price: number;
  current_price: number;
  direction: 'UP' | 'DOWN';
  symbol: string;
}

export interface CircuitBreakerPayload {
  stock_name: string;
  circuit_level: string;
  trading_halt_duration: number;
  symbol: string;
}

// Regulatory Events
export interface KycExpiryPayload {
  expiry_date: string;
  documents_needed: string[];
  submission_link: string;
  days_remaining: number;
}

// Union type - a FinancialEvent is a BaseEvent plus one of these payloads
export type FinancialEvent = BaseEvent & {
  payload:
    | BuyOrderExecutedPayload
    | SellOrderExecutedPayload
    | OrderRejectedPayload
    | MarginCallPayload
    | PositionSquaredOffPayload
    | SipDueReminderPayload
    | SipExecutedPayload
    | PriceAlertPayload
    | CircuitBreakerPayload
    | KycExpiryPayload
    | Record<string, unknown>; // fallback for other event types
};