const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define the environment files to update
const targetPath = './src/environments/environment.ts';
const targetProdPath = './src/environments/environment.prod.ts';

// Create the environments directory if it doesn't exist
const envDir = './src/environments';
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Development environment content
const envContent = `
// This file is auto-generated - DO NOT EDIT
export const environment = {
  production: false,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
  },
  aws: {
    region: '${process.env.AWS_REGION || ''}',
    accessKeyId: '${process.env.AWS_ACCESS_KEY_ID || ''}',
    secretAccessKey: '${process.env.AWS_SECRET_ACCESS_KEY || ''}',
    bucketName: '${process.env.AWS_BUCKET_NAME || ''}',
  },
};
`;

// Production environment content
const prodEnvContent = `
// This file is auto-generated - DO NOT EDIT
export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
  },
  aws: {
    region: '${process.env.AWS_REGION || ''}',
    accessKeyId: '${process.env.AWS_ACCESS_KEY_ID || ''}',
    secretAccessKey: '${process.env.AWS_SECRET_ACCESS_KEY || ''}',
    bucketName: '${process.env.AWS_BUCKET_NAME || ''}',
  },
};
`;

// Write the environment files
fs.writeFileSync(targetPath, envContent);
console.log(`Environment file generated at ${targetPath}`);

fs.writeFileSync(targetProdPath, prodEnvContent);
console.log(`Production environment file generated at ${targetProdPath}`);
