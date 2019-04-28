export interface BraintreeGatewayToken {
  token: string;
}

export enum BraintreeCreditCardTypeEnum {
  AMERICAN_EXPRESS = 'American Express',
  CARTE_BLANCHE = 'Carte Blanche',
  CHINA_UNIONPAY = 'China UnionPay',
  DISCOVER = 'Discover',
  ELO = 'Elo',
  JCB = 'JCB',
  LASER = 'Laser',
  MAESTRO = 'Maestro',
  MASTERCARD = 'MasterCard',
  SOLO = 'Solo',
  SWITCH = 'Switch',
  VISA = 'Visa',
  UNKNOWN = 'Unknown',
}


export enum BraintreeSubscriptionStatusEnum {
  ACTIVE = 'Active',
  CANCELED = 'Canceled',
  EXPIRED = 'Expired',
  PAST_DUE = 'Past Due',
  PENDING = 'Pending',
}


export enum BraintreeSubscriptionTrialDurationUnitEnum {
  DAY = 'day',
  MONTH = 'month',
}


export interface BraintreeGatewaySubscriptionInterface {
  id: string;
  status: BraintreeSubscriptionStatusEnum;
  plan_id: string;
  price: string;
  balance: string;
  payment_method_token: string;
  billing_day_of_month: number;
  current_billing_cycle: number;
  trial_period: boolean;
  trial_duration: number;
  trial_duration_unit: BraintreeSubscriptionTrialDurationUnitEnum;
  created_at: Date;
  updated_at: Date;
}

export interface BraintreeCreditCardInterface {
  expiration_month: string;
  token: string;
  card_type: BraintreeCreditCardTypeEnum;
  subscriptions?: BraintreeGatewaySubscriptionInterface[];
  created_at: Date;
  updated_at: Date;
}

export interface BraintreeCustomerInterface {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  credit_cards?: BraintreeCreditCardInterface[];
  created_at: Date;
  updated_at: Date;
}
