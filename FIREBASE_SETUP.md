# Firebase Setup Guide for BiryaniGuys

This guide will help you set up Firebase Realtime Database for the BiryaniGuys app.

## Current Configuration

The app is currently configured to use the Firebase Realtime Database at:
```
https://biryaniguys-9a6cb-default-rtdb.firebaseio.com/
```

## Database Structure

The database has the following main collections:

1. **menu** - Contains menu items available for ordering
2. **orders** - Contains all customer orders
3. **locations** - Contains delivery location data for tracking

## Setting Up Firebase Rules

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project (biryaniguys-9a6cb)
3. Click on "Realtime Database" in the left menu
4. Click on the "Rules" tab
5. Copy and paste the contents of the `firebase-rules.json` file
6. Click "Publish"

## Data Seeding

The application will automatically seed the database with initial menu items if no menu data exists. This happens when the app starts for the first time.

If you want to manually reset the database:

1. Go to your Firebase Console
2. Navigate to Realtime Database
3. Select your database
4. Delete any existing data
5. Restart the application - it will repopulate with seed data

## Security Notes

The current rules are configured for development and testing:
- Menu items can be read by anyone but only modified by authenticated users
- Orders and location data can be read and written by anyone (for testing purposes)

For production, you should modify the rules to be more restrictive:

```json
{
  "rules": {
    ".read": "auth != null",
    "menu": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null",
      ".write": true,
      "$orderId": {
        ".read": "auth != null || query.orderByChild('customer/email').equalTo(auth.token.email)",
        ".write": true
      }
    },
    "locations": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$orderId": {
        ".read": "auth != null || root.child('orders').child($orderId).child('customer/email').val() === auth.token.email",
        ".write": "auth != null"
      }
    }
  }
}
```

## How to Use in the Application

The app includes several utility hooks to interact with the database:

1. **useMenu** - For managing menu items
2. **useOrders** - For creating and managing orders
3. **useLocation** - For tracking delivery locations

Each hook provides methods to read and write data to the Firebase Realtime Database. 