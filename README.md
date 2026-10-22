# RentEase

A simple rental app for flatmates and landlords. Tenants pay their share of the rent and keep their personal documents private. Landlords collect rent and ask for document access only when they need it, for a limited time.

## 1. Vision & originality

RentEase replaces the usual rental routine (rent sent to one person's bank account, ID and payslips sent over chat apps) with two simple ideas:

- **Rent is paid per person, into a shared pot.** Nobody can take the whole pot. The landlord receives only the rent due under the lease.
- **Documents are locked by default.** The landlord can see that a document exists, but not its contents. To open one, the landlord must ask with a reason, and the tenant decides whether to allow it for 24 hours.

What makes it distinctive is that privacy is the default and access is a request. Today most rental apps work the other way round.

## 2. Trust constraint insight

Two things are risky in shared renting today:

1. **Rent custody.** Rent is usually gathered into one person's account (the lead tenant or the landlord). That person can delay payment, spend it, or disappear with it.
2. **Sensitive documents.** Landlords ask for national IDs, passports, marriage certificates and payslips. These are sent over chat or cloud drives, where they can be forwarded, leaked or reused for other purposes, and the tenant has no way to take them back.

If these constraints are removed, tenants can pay without trusting a middleman, and can prove who they are without handing over a permanent copy.

## 3. Value & impact

**Who benefits**
- Tenants and flatmates, who no longer have to trust one person with the group's money or hand out copies of their ID.
- Landlords, who get a clear record of who has paid and an auditable way to request the documents they need.

**Concrete example.** Minh's landlord needs his national ID to register his temporary residence at the ward police. Instead of Minh sending a photo over chat, the landlord sends an access request with that reason. Minh approves it for 24 hours. The landlord views the ID, and access then ends automatically. Minh can also revoke it sooner.

## 4. Why TideCloak matters

The design is built around TideCloak's model of end-to-end encryption and consent-based access:

- **Client-side encryption** (`doEncrypt`): documents are encrypted in the browser before they are stored, so the server only ever holds ciphertext.
- **Temporary decryption** (`doDecrypt`): a document can be opened by the landlord only while the tenant's approval is active, and the tenant can end it at any time.
- **Per-member rent release**: no single party holds a master key to the pot.

**Honest status of the prototype:** this version does **not** call the TideCloak SDK yet. Encryption, access approval and rent release are simulated in the browser so the experience can be shown end to end. The planned integration uses `useTideCloak()` from `@tidecloak/nextjs` (`doEncrypt`, `doDecrypt`, `secureFetch`), and the document flow in `src/components/DocsView.tsx` and the actions in `src/store.tsx` are where those calls would replace the simulated ones.

## 5. Prototype & storytelling

**What it demonstrates today**
- Working sign in and sign up, with the session saved in the browser.
- **Rent tab:** progress of the monthly rent ($160 per tenant, in USD), tenants paying their own share, and the landlord releasing the collected amount.
- **Documents tab:** tenants add a document using the camera or a file, and documents appear scrambled while locked.

**The key interaction to look for**
1. Sign in as the landlord (`landlord@demo.com`) and open **Documents**. Every document is locked.
2. Choose **Request access** on Lan's marriage certificate and give a reason.
3. Sign out and sign in as the tenant (`lan@demo.com`). A badge on **Documents** shows a pending request. Choose **Allow for 24 hours**.
4. Sign back in as the landlord. The document is now open, with a live countdown. Sign in as Lan again and choose **Revoke access now** to lock it immediately.

Demo accounts (password `demo1234` for all):

| Email | Role |
| --- | --- |
| `minh@demo.com` | Tenant (has a pending request from the landlord) |
| `lan@demo.com` | Tenant |
| `tuan@demo.com` | Tenant (has already granted access) |
| `landlord@demo.com` | Landlord |

Use **Reset data** on the sign-in page to restore the sample data.

## Run locally

```bash
pnpm install
pnpm dev
```

Built with React, Vite and Tailwind CSS v4. All data is stored in the browser's local storage, so there is no backend.
