require("dotenv").config();
const express = require("express");
const httpProxy = require("http-proxy");
const morgan = require("morgan");

const app = express();
const proxy = httpProxy.createProxyServer();

// Internal service addresses (set through environment variables)
const services = {
    registration: process.env.REGISTRATION_SERVICE,
    search: process.env.SEARCH_SERVICE
};

app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "API Gateway is online" }));

// Forward the request to an internal microservice
function forwardTo(target) {
    return (req, res) => {
        req.url = req.originalUrl;   // keep the full path
        proxy.web(req, res, { target }, (err) => {
            console.error("Proxy error:", err.message);
            if (!res.headersSent) {
                res.status(502).json({ message: "Upstream service is unavailable" });
            }
        });
    };
}

app.use("/register", forwardTo(services.registration));   // Registration microservice
app.use("/search", forwardTo(services.search));          // Search microservice

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
