# Frontend Configuration & Integration Guide

This document tracks frontend-specific features and provides a checklist for configuring the `clear-connect` application.

## 🚀 Quick Setup Checklist (When Ngrok URL Changes)

If the backend Ngrok tunnel restarts and provides a new URL (e.g., `https://new-link.ngrok-free.app`):

1.  **Update `.env`**:
    *   Change `VITE_API_URL` to `https://new-link.ngrok-free.app/api`.
2.  **Restart Frontend**:
    *   Restart the Vite dev server to pick up the new environment variable.

---

## 🛠 Frontend Feature Log

### 1. Authentication & Session
- **Method**: Google OAuth 2.0.
- **Session Management**: JWT tokens are stored in `localStorage` under the key `token`.
- **Protection**: `DashboardLayout.tsx` contains a `useEffect` hook that redirects unauthenticated users to `/login`.
- **API Fetching**: All requests via `lib/api.ts` automatically include the `Authorization: Bearer <token>` header.

### 2. Phone Number Marketplace
- **Location**: `NumbersPage.tsx`.
- **Functionality**: 
    - Real-time search by 3-digit area code.
    - Provisioning numbers with a single click (costs 1.0 credit).
    - Feedback provided via `sonner` toasts and `Loader2` spinners.

### 3. Billing & Credit Packs
- **Location**: `BillingPage.tsx`.
- **Dodo Product IDs**:
    - **Starter Pack ($10)**: `pdt_0NZDLiDjrSA2Q0SkwU6Vg`
    - **Growth Pack ($25)**: `pdt_0NZDLw3jYM9uQzW8m3EiW`
    - **Scale Pack ($50)**: `pdt_0NZDM2MWFzemu7DHjBBqB`
- **Flow**: Clicking a pack generates a Dodo Checkout session and redirects the user to the secure payment page.

### 4. Communication Interface
- **Dialer**: (In Progress) Interacts with Twilio Voice SDK.
- **Messages**: Displays live incoming SMS via Socket.io.
- **Logs**: Fetches historical call and SMS data for display.

---

## 🔑 Frontend Environment Variables

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The full URL to the backend API (e.g., `https://link.ngrok-free.app/api`) |

---

## 💡 Troubleshooting
- **Credits not updating?** Check the backend logs to see if the Dodo webhook was received.
- **Login failing?** Ensure the backend `GOOGLE_WEB_CLIENT_ID` matches the one used in the frontend.
- **Numbers not loading?** Ensure the backend `TWILIO_AUTH_TOKEN` is valid.
