import jwt, { JwtHeader } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

const client = jwksClient({
  jwksUri: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  cache: true,
  rateLimit: true,
});

function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) {
    return callback(new Error('No "kid" in token header'));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyFirebaseToken(idToken: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ['RS256'],
        audience: PROJECT_ID,
        issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}
