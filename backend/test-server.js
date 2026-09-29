const express = require("express");

const app = express();

const PORT = 5001;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Test server is working"
    });
});

const server = app.listen(PORT, () => {

    console.log("=================================");
    console.log("TEST SERVER STARTED");
    console.log(`http://localhost:${PORT}`);
    console.log("=================================");

});

server.on("listening", () => {

    console.log("🟢 Listening event fired");

});

server.on("close", () => {

    console.log("🔴 SERVER CLOSED");

});

server.on("error", (error) => {

    console.error("❌ SERVER ERROR");
    console.error(error);

});

process.on("beforeExit", (code) => {

    console.log("⚠️ Node beforeExit:", code);

});

process.on("exit", (code) => {

    console.log("⚠️ Node exit:", code);

});