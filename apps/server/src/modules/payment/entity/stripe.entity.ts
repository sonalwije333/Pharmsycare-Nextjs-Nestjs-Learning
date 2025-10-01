export class StripeCustomerList {
  object?: string;
  url?: string;
  has_more?: boolean;
  data?: StripeCustomer[];
}

export class StripeCustomer {
  id?: string;
  object?: string;
  address?: StripeAddress | null;
  balance?: number;
  created?: number;
  currency?: string | null;
  default_source?: string | null;
  delinquent?: boolean | null;
  description?: string | null;
  discount?: any;
  email?: string | null;
  invoice_prefix?: string;
  invoice_settings?: InvoiceSettings;
  livemode?: boolean;
  metadata?: StripeMetadata;
  name?: string | null;
  next_invoice_sequence?: number;
  phone?: string | null;
  preferred_locales?: string[];
  shipping?: any;
  tax_exempt?: string;
  test_clock?: string | null;
}

export class StripePaymentMethod {
  id?: string;
  object?: string;
  billing_details?: BillingDetails;
  card?: StripeCard;
  created?: number;
  customer?: string | null;
  livemode?: boolean;
  metadata?: StripeMetadata;
  type?: string;
}

export class StripePaymentIntent {
  id?: string;
  amount?: number;
  amount_received?: number;
  client_secret?: string | null;
  currency?: string;
  customer?: string | null;
  metadata?: PaymentIntentMetadata;
  payment_method_types?: string[];
  setup_future_usage?: string | null;
  status?: string;
}

export class InvoiceSettings {
  custom_fields?: any[] | null;
  default_payment_method?: string | null;
  footer?: string | null;
  rendering_options?: any;
}

// Fix: Use a proper interface for metadata that allows our custom properties
interface StripeMetadata extends Record<string, string | number | null> {
  // order_tracking_number?: number;
}

export default StripeMetadata

export class BillingDetails {
  address?: StripeAddress | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
}

export class StripeAddress {
  city?: string | null;
  country?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  state?: string | null;
}

export class StripeCard {
  brand?: string;
  checks?: Checks;
  country?: string;
  exp_month?: number;
  exp_year?: number;
  fingerprint?: string;
  funding?: string;
  generated_from?: any;
  last4?: string;
  networks?: Networks;
  three_d_secure_usage?: ThreeDSecureUsage;
  wallet?: any;
}

export class Checks {
  address_line1_check?: string | null;
  address_postal_code_check?: string | null;
  cvc_check?: string | null;
}

export class Networks {
  available?: string[];
  preferred?: string | null;
}

export class ThreeDSecureUsage {
  supported?: boolean;
}

// Fix: Use a proper interface for payment intent metadata
export interface PaymentIntentMetadata extends Record<string, string | number | null> {
  // order_tracking_number?: number;
}