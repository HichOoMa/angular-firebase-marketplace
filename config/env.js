const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define the environment files to generate
const environments = ['environment.ts', 'environment.prod.ts'];

// Create the environments directory if it doesn't exist
const envDir = './src/environments';
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Generate environment files
environments.forEach(env => {
  const isProd = env.includes('prod');
  
  // Create environment content
  const envContent = `// This file is auto-generated from .env file
export const environment = {
  production: ${isProd},
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}",
  },
  aws: {
    region: "${process.env.AWS_REGION || ''}",
    accessKeyId: "${process.env.AWS_ACCESS_KEY_ID || ''}",
    secretAccessKey: "${process.env.AWS_SECRET_ACCESS_KEY || ''}",
    bucketName: "${process.env.AWS_BUCKET_NAME || ''}",
  },
};
`;

  // Write environment file
  fs.writeFileSync(`${envDir}/${env}`, envContent);
  console.log(`Generated ${env}`);
});
