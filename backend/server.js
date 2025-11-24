const app = require("./app");
const dotenv = require('dotenv');
const db = require('./db');
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 8080;

db.connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})