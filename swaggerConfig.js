import swaggerJSDoc from 'swagger-jsdoc'
import dotenv from "dotenv";

import { AppStrings } from "./assets/AppStrings"
dotenv.config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ThatsMyPlane APIs',
    version: '1.0.0',
  },
  servers: [
    {
      url: process.env.DOMAIN_URL,
      description: AppStrings["swagger-description"]
    }
  ]
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./routes/*.js'],
};

export const SwaggerSpec = swaggerJSDoc(options);
