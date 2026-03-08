export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const USER_ID_KEY = "callflow:userId";
const AUTH_TOKEN_KEY = "callflow:authToken";

export const getStoredUserId = () => localStorage.getItem(USER_ID_KEY);
export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const setAuthSession = (userId: string, token: string) => {
  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const createDemoUser = async () => {
  const email = `demo.${Date.now()}@callflow.app`;
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create demo user");
  }

  const data = (await response.json()) as { id: string; token: string };
  setAuthSession(data.id, data.token);
  return data.id;
};

export const getOrCreateUserId = async () => {
  const existingUserId = getStoredUserId();
  const existingToken = getStoredAuthToken();
  if (existingUserId && existingToken) {
    return existingUserId;
  }
  return createDemoUser();
};

export type BillingTransaction = {
  id: string;
  amount: number;
  creditsAdded: number;
  stripePaymentId: string | null;
  status: string;
  createdAt: string;
};

export type BillingSummaryResponse = {
  user: {
    id: string;
    email: string;
    creditBalance: number;
  };
  thisMonthSpend: number;
  monthlyUsage: {
    callCost: number;
    smsCost: number;
  };
  transactions: BillingTransaction[];
};

export const fetchBillingSummary = async (userId: string) => {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/stripe/summary?userId=${encodeURIComponent(userId)}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch billing summary");
  }
  return (await response.json()) as BillingSummaryResponse;
};

export const createCheckoutSession = async (params: {
  userId: string;
  amountUSD: number;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/dodo/checkout`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      amountUSD: params.amountUSD,
      productId: params.productId,
      quantity: 1
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Dodo checkout session");
  }

  return (await response.json()) as {
    checkoutUrl: string;
    credits: number;
  };
};

export const searchNumbers = async (areaCode?: string) => {
  const token = getStoredAuthToken();
  const url = `${API_BASE_URL}/api/numbers/search${areaCode ? `?areaCode=${areaCode}` : ''}`;
  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Failed to search numbers");
  return await response.json();
};

export const provisionNumber = async (phoneNumber: string) => {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/numbers/provision`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to purchase number");
  }
  return await response.json();
};

export const sendSms = async (params: { to: string; from: string; body: string }) => {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send SMS");
  }
  return await response.json();
};
