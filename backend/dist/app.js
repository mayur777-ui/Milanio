"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socketHandlers/socket");
// const app = express();
socket_1.app.get('/', (req, res) => {
    res.send("Hello from mayur");
});
socket_1.app.listen('8000', () => {
    console.log("app listening");
});
