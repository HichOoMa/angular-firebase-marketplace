# Marketplace Application

A modern e-commerce marketplace built with Angular 19, Firebase, and AWS S3 for image storage.

## Features

- **Authentication**: User registration and login with Firebase Authentication
- **Product Browsing**: Browse products with filtering and sorting options
- **Product Details**: View detailed product information
- **Shopping Cart**: Add products to cart (stored in local storage)
- **Product Management**: Add new products with image uploads
- **Real-time Chat**: Chat with product owners in real-time

## Tech Stack

- **Frontend**: Angular 19
- **Authentication & Database**: Firebase (Auth, Firestore)
- **Image Storage**: AWS S3
- **Styling**: SCSS
- **Icons**: Font Awesome

## Project Structure

```
marketplace/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI components
│   │   ├── guards/           # Route guards
│   │   ├── models/           # TypeScript interfaces
│   │   ├── pages/            # Page components
│   │   ├── services/         # Services for data handling
│   │   ├── app.component.ts  # Root component
│   │   ├── app.config.ts     # App configuration
│   │   └── app.routes.ts     # Routing configuration
│   ├── assets/               # Static assets
│   ├── environments/         # Environment configurations
│   ├── index.html            # Main HTML file
│   ├── main.ts               # Application entry point
│   └── styles.scss           # Global styles
└── package.json              # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Angular CLI (v19)
- Firebase account
- AWS account with S3 bucket

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with your Firebase and AWS credentials:
     ```
     # AWS Configuration
     AWS_REGION=your-aws-region
     AWS_ACCESS_KEY_ID=your-aws-access-key-id
     AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
     AWS_BUCKET_NAME=your-aws-bucket-name

     # Firebase Configuration
     FIREBASE_API_KEY=your-firebase-api-key
     FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
     FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
     FIREBASE_APP_ID=your-firebase-app-id
     ```

4. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore
   - Get your Firebase configuration from Project Settings > General > Your apps
   - Add the Firebase configuration to your `.env` file

5. Configure AWS S3:
   - Create an S3 bucket in your AWS account
   - Set up appropriate CORS configuration for the bucket
   - Create an IAM user with S3 access and get the access key and secret
   - Add the AWS configuration to your `.env` file

6. Start the development server:
   ```bash
   npm start
   ```

7. Open your browser and navigate to `http://localhost:4200/`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Features in Detail

### Authentication

- User registration with email and password
- User login
- Protected routes for authenticated users

### Product Management

- Add new products with multiple images
- Edit existing products
- Delete products

### Shopping Experience

- Browse products with category filters
- Sort products by price, date, etc.
- Search products by name or description
- Add products to cart
- View and manage shopping cart

### Real-time Chat

- Chat with product sellers
- Real-time message updates
- Message history

## License

This project is licensed under the MIT License - see the LICENSE file for details.
