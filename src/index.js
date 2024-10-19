import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from "./app.js"


const port = process.env.PORT || 8000;

dotenv.config({
    path: './env'
})

app.listen(port, async ()=> {
    // await connectDB() //TODO: confirm the criditial of mongodb and connect
    console.log(`Your Server is Sarted in port ${port}`)
})