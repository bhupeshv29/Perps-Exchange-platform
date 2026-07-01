// import rateLimit from "express-rate-limit";

// export const globalLimiter = rateLimit({
//   windowMs: 60_000,
//   limit: 300,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     message: "Too many requests. Please slow down.",
//   },
// });

// export const authLimiter = rateLimit({
//   windowMs: 15 * 60_000,
//   limit: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     message: "Too many auth attempts. Try again later.",
//   },
// });

// export const orderLimiter = rateLimit({
//   windowMs: 10_000,
//   limit: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return (req as any).userId ?? req.ip;
//   },
//   message: {
//     message: "Too many order requests.",
//   },
// });

// export const accountLimiter = rateLimit({
//   windowMs: 60_000,
//   limit: 120,
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return (req as any).userId ?? req.ip;
//   },
// });
