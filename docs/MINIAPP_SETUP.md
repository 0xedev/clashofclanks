# Farcaster Mini App Setup Guide

## Overview

Clash of Clanks is now configured as a **Farcaster Mini App** (formerly known as Frames v2). This provides native-like app experiences with access to Farcaster features like authentication, wallet interactions, and notifications.

## Mini App Features

### 🔐 Authentication
- Users are automatically signed in with their Farcaster account
- No forms or passwords needed
- Access to user FID, username, display name, and profile picture

### 💳 Wallet Integration
- Integrated Ethereum wallet for seamless transactions
- Base blockchain support (native to Farcaster)
- One-click transactions for betting and staking

### 🔔 Notifications
- Send notifications to users about battle results
- Re-engage users when new battles start
- Notify about winning bets and rewards

### 📱 Native Experience
- Mobile and desktop support
- Fast loading with splash screen
- Can be saved as favorite for quick access

## Setup Steps

### 1. Enable Developer Mode

1. Log in to Farcaster (mobile or desktop)
2. Visit: https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"
4. Access developer tools from the left sidebar

### 2. Install Dependencies

```bash
cd clash-of-clanks
npm install
```

This installs `@farcaster/miniapp-sdk` and all required dependencies.

### 3. Configure Manifest

Update `/public/manifest.json` with your app details:

```json
{
  "name": "Clash of Clanks",
  "shortName": "COC",
  "homeUrl": "https://your-domain.com",
  "iconUrl": "https://your-domain.com/icon-192.png",
  "splashImageUrl": "https://your-domain.com/splash.png",
  "developer": {
    "name": "Your Team Name",
    "url": "https://your-domain.com",
    "fid": YOUR_FID_NUMBER
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your Mini App.

### 5. Test in Farcaster

To test your Mini App in Farcaster during development:

1. Use a tunneling service like ngrok:
   ```bash
   ngrok http 3000
   ```

2. Use the ngrok URL in Farcaster developer tools

## SDK Usage

### Authentication

```typescript
import { useAuth } from './lib/useAuth'

function MyComponent() {
  const { user, isLoading, error } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>Welcome, {user?.username}!</div>
}
```

### Wallet Transactions

```typescript
import { useWallet } from './lib/useWallet'

function BettingComponent() {
  const { sendTransaction } = useWallet()
  
  const placeBet = async () => {
    const result = await sendTransaction({
      to: BETTING_POOL_ADDRESS,
      data: encodedBetData,
    })
  }
}
```

### Send Notifications

```typescript
import { useNotifications } from './lib/useNotifications'

function NotifyWinner() {
  const { sendNotification } = useNotifications()
  
  const notify = async () => {
    await sendNotification({
      title: 'You Won! 🎉',
      body: 'Claim your 5,000 $COC winnings',
      targetUrl: '/battles/123/claim',
    })
  }
}
```

## Mini App Lifecycle

### 1. Initialization

```typescript
import { sdk } from '@farcaster/miniapp-sdk'

// Signal that your app is ready to display
await sdk.actions.ready()
```

This is automatically called in `FrameContainer` component.

### 2. Context Access

```typescript
const context = await sdk.context

// Access user information
const fid = context.user.fid
const username = context.user.username

// Access client information
const client = context.client.clientFid
```

### 3. Wallet Operations

```typescript
// Get user's wallet address
const address = await sdk.wallet.getAddress()

// Switch to Base chain (chainId: 8453)
await sdk.wallet.switchChain({ chainId: 8453 })

// Send transaction
const txHash = await sdk.wallet.sendTransaction({
  to: contractAddress,
  value: '0',
  data: encodedData,
})
```

## Publishing Your Mini App

### 1. Deploy Your App

Deploy to a hosting provider (Vercel, Netlify, etc.):

```bash
npm run build
# Deploy to your preferred platform
```

### 2. Update Manifest URLs

Replace all URLs in `manifest.json` with your production URLs:
- `homeUrl`
- `iconUrl`
- `splashImageUrl`
- `manifestUrl`
- Developer URLs

### 3. Submit for Review

1. Go to Farcaster developer tools
2. Click "Create Mini App"
3. Provide manifest URL
4. Fill in app details
5. Submit for review

### 4. Distribution

Once approved:
- Users can discover your app in Mini App stores
- Share directly in Farcaster feeds
- Add to user favorites
- Enable social discovery

## Required Assets

Create these assets for your Mini App:

### App Icon (192x192px)
- PNG format
- Transparent or solid background
- Represents your app visually

### Splash Screen (1200x630px)
- PNG or JPG format
- Shown while app loads
- Use brand colors

### OG Image (1200x630px)
- For social sharing
- Include app name and description

## Environment Variables

Update `.env` with Mini App specific configs:

```bash
# Mini App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MANIFEST_URL=https://your-domain.com/manifest.json

# Farcaster
NEXT_PUBLIC_DEVELOPER_FID=YOUR_FID

# Base Configuration (for wallet)
NEXT_PUBLIC_BASE_CHAIN_ID=8453
```

## Testing Checklist

- [ ] App loads and displays correctly
- [ ] `sdk.actions.ready()` is called when ready
- [ ] User authentication works
- [ ] Wallet address can be retrieved
- [ ] Transactions can be sent
- [ ] Notifications can be sent (if enabled)
- [ ] App works on mobile
- [ ] App works on desktop
- [ ] Splash screen displays properly
- [ ] Icon displays correctly

## Debugging

### Common Issues

**App doesn't load:**
- Check that `sdk.actions.ready()` is called
- Verify manifest.json is accessible
- Check console for errors

**Authentication fails:**
- Ensure app is accessed through Farcaster client
- Check SDK initialization
- Verify permissions in manifest

**Wallet not working:**
- Confirm user has connected wallet
- Check Base chain is configured (8453)
- Verify transaction data encoding

**Notifications not working:**
- Request permission first
- Check notification permissions in manifest
- Verify user has enabled notifications

### Debug Mode

```typescript
// Enable debug logging
import { sdk } from '@farcaster/miniapp-sdk'

sdk.on('error', (error) => {
  console.error('Mini App SDK Error:', error)
})
```

## Resources

- **Mini Apps Docs**: https://miniapps.farcaster.xyz/
- **Specification**: https://miniapps.farcaster.xyz/docs/specification
- **SDK Reference**: https://miniapps.farcaster.xyz/docs/sdk
- **Examples**: https://github.com/farcasterxyz/miniapps

## Next Steps

1. ✅ Setup complete - Mini App SDK integrated
2. 📝 Update manifest.json with your details
3. 🎨 Create app icons and splash screens
4. 🚀 Deploy to production
5. 📤 Submit for review on Farcaster

---

**Happy Building! 🎮⚔️**
