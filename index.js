import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { routes } from "./routes/appRoutes";

dotenv.config();

const app = express();

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})


app.use(
  bodyparser.urlencoded({
    extended: true
  })
);

app.use(bodyparser.json());

app.use(cors());

routes(app);

app.listen(process.env.SERVER_PORT, async() => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});
