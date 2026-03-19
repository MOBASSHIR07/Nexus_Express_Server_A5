import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Better-Auth handler
app.all('/api/auth/*any', toNodeHandler(auth));

app.get('/', (req, res) => {
  res.send("Nexus Express Server is running 🚀");
});

// Routes (পরে add করবো)
// app.use("/api/user", userRoute)
// app.use("/api/parcel", parcelRoute)
// app.use("/api/rider", riderRoute)
// app.use("/api/payment", paymentRoute)
// app.use("/api/admin", adminRoute)



export default app;