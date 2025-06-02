import type { RequestHandler } from "express";

// Development authentication bypass
export const devAuth: RequestHandler = (req, res, next) => {
  // For development, always allow access
  next();
};

export const devAuthWithUser: RequestHandler = (req: any, res, next) => {
  // Mock user for development
  req.user = {
    claims: {
      sub: "dev-user",
      email: "max.bisinger@warubi-sports.com",
      first_name: "Max", 
      last_name: "Bisinger"
    }
  };
  next();
};