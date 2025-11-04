# How to Create Landlord Accounts

## ⚠️ Important
**Landlord accounts with `@rentify.com` emails MUST be created by Super Admin** - they cannot be created through regular signup.

## Steps to Create a Landlord Account

### Option 1: Via Super Admin Panel (Recommended)

1. **Login as Super Admin:**
   - Email: `ahrorbek@rentify.com`
   - Password: `ahrorbek`

2. **Go to Landlord Management:**
   - Navigate to `/admin/landlords`
   - Click "Create New Landlord"

3. **Fill in landlord details:**
   - Name: `Jahongir` (or landlord's name)
   - Email: `jahongir@rentify.com`
   - Password: `jahongir` (or desired password)
   - Phone: (optional)

4. **Save** - The landlord account will be created

### Option 2: Direct Database Creation (For Testing)

If you need to create a landlord account directly in the database:

```bash
# Connect to database
psql -d rentify

# Create landlord account (replace values as needed)
INSERT INTO "User" (id, email, password, name, role, "landlordProfileComplete", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'jahongir@rentify.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash password
  'Jahongir',
  'LANDLORD',
  false,
  NOW(),
  NOW()
);
```

**Better: Use the API endpoint**

```bash
# As Super Admin, use the API endpoint
curl -X POST http://localhost:3000/api/v1/admin/landlords \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Jahongir",
    "email": "jahongir@rentify.com",
    "password": "jahongir",
    "phone": ""
  }'
```

## After Creating the Account

1. **Landlord can now login:**
   - Email: `jahongir@rentify.com`
   - Password: `jahongir` (or the password you set)

2. **Onboarding Process:**
   - Step 1: Fill in profile (name, phone)
   - Step 2: Accept Terms & Conditions AND PDPA Compliance (both checkboxes required)
   - Click "Complete Setup"

3. **After onboarding:**
   - Will redirect to `/landlord/dashboard`
   - Can start managing properties

## Troubleshooting

### "Email already registered" error
- The account already exists
- Try logging in instead of creating

### Stuck in onboarding loop
- Make sure BOTH checkboxes are checked:
  - ✅ Terms & Conditions
  - ✅ PDPA Compliance
- Check browser console for errors
- Try refreshing the page

### Can't access dashboard
- Ensure onboarding is complete (`landlordProfileComplete = true`)
- Check database: `SELECT * FROM "User" WHERE email = 'jahongir@rentify.com';`

