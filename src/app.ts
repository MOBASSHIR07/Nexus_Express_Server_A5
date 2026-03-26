import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import { ParcelRoutes } from "./modules/parcel/parcel.route.js";
import { RiderRoutes } from "./modules/rider/rider.route.js";
import { AdminRoutes } from "./modules/admin/admin.route.js";
import { ReviewRoutes } from "./modules/review/review.route.js";


const app = express();

app.use(cors({
   origin: ["http://localhost:5000", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.all('/api/auth/*any', toNodeHandler(auth));

app.use(express.json());

// Better-Auth handler
// app.all('/api/auth', toNodeHandler(auth));
// app.all('/api/auth/*any', toNodeHandler(auth));

// app.ts


app.get('/', (req, res) => {
  res.send("Nexus Express Server is running 🚀");
});



app.use("/api/rider", RiderRoutes)
app.use("/api/parcel", ParcelRoutes)
// app.use("/api/rider", riderRoute)
// app.use("/api/payment", paymentRoute)
app.use("/api/admin", AdminRoutes)
app.use("/api/review", ReviewRoutes);
// app.use("/api/payment", PaymentRoutes);

app.use(globalErrorHandler);
export default app;