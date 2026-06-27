import Stripe from "stripe";
import { env } from "./env";

const stripe = new Stripe(env.stripeSecretKey);

export default stripe;
