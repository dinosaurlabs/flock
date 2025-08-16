import { ConvexProvider, ConvexReactClient } from "convex/react";

// Using the Convex URL from environment variables
const convex = new ConvexReactClient(process.env.REACT_APP_CONVEX_URL || "https://descriptive-nightingale-284.convex.cloud");

export { convex, ConvexProvider };