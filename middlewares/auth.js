import jwt from "express-jwt";
import jwksRsa from "jwks-rsa"
import dotenv from "dotenv";

dotenv.config();

export const checkJwtAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: `https://${process.env.AUTH0_IDENTIFIER}`,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: [`${process.env.AUTH0_ALGORITHM}`]
});
