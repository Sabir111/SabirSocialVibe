import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./env"
});
const PORT = process.env.PORT || 8000;
connectDB().
then(() => {
    app.on("error", (error) =>{
        console.error("Server error:", error);
        throw error;
    })
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

}).
catch((error) => {
    console.error("Failed to connect to the database:", error);
})