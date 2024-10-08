import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const port = process.env.PORT || 8000;

const app = express();

app.use(cors({origin: process.env.ORIGIN, credentials: true}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


export { app };
