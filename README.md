# CropLink - TSA Software Development 2025

<p align="center">
    <img src="./public/swdlogo.png" alt="Crop image" width="200" />
</p>

To run the development server:

```bash
npm run dev
```

Make sure to include these environment variables in your `.env` file:

```
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:xxxxxxxxxxxxxxxx@aws-0-us-xxxx-2.pooler.supabase.com:5432/postgres"

BETTER_AUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET=xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxx

NEXT_PUBLIC_BASE_URL="http://localhost:3000/"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_upload_preset_name"

NEXT_PUBLIC_SUPABASE_URL="https://xxxxxx.supabase.co/"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- Farmer Portal
    - Send detailed requests for surplus crops to be sold
    - Able to specify date, type of crops, amount of crops, and upload images of crops.
    - Live chat with admin users for support.
- Admin Portal
    - View crop inventory in detailed, sortable table.
    - View list of top suppliers of crops.
    - View and approve all incoming requests and orders sent by farmers and buyers in a detailed, sortable table.
    - Live chat with both farmers and buyers to provide support.
- Buyer Portal
    - Send orders for any amount of a crop.
    - View order history.
    - Live chat with admin users for support.

## Code Standards
- Documentation: Code is well documented and explained through comments.
- Error handling: Use of try-catch blocks, error boundaries, and toast to ensure errors are properly handled and don't crash the website.
- Type Safety: TypeScript types are defined and reused, DrizzleORM is used to ensure type safety when querying data, Zod is used to validate form data.
- Suspense: Loading components are used while waiting for data to be successfully fetched.
- Reusability: UI and general components are designed to be easily reused across the website, minimizing redundancy.

## Tools
- NextJS
- DrizzleORM
- PostgreSQl & Supabase
- Zod
- React-Hook-Form
- Cloudinary

