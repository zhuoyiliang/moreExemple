const { Server } = require("@tus/server");
const { FileStore } = require("@tus/file-store");
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const { resolve, join } = require("path");
const CryptoJS = require("crypto-js");
const fs = require("fs");
const { Readable } = require('stream');

const secretKey = "b4c34e5de857d8d886622acfc71093253a458c9178fe329e4437ea994bb2e3ba";
const iv = CryptoJS.enc.Utf8.parse("300ad0c9a4e9dd6487022d9ffb9ef5a4");
// crypto.randomBytes(16).toString("hex")

const host = "127.0.0.1";
const port = 1080;
const app = express();
app.use(cors());

const uploadApp = express();
const server = new Server({
    path: "/uploads",
    datastore: new FileStore({ directory: resolve(__dirname, "files") }),
    namingFunction(req) {
        const id = crypto.randomBytes(16).toString("hex");
        const folder = getFolderForUser(req);
        return join("users", folder, id);
    },
    generateUrl(req, { proto, host, path, id }) {
        id = Buffer.from(encryptAES_CBC(id, secretKey, iv), "utf-8").toString("base64url");
        return `${proto}://${host}${path}/${id}`;
    },
    getFileIdFromRequest(req, lastPath) {
        return decryptAES_CBC(Buffer.from(lastPath, "base64url").toString("utf-8"), secretKey, iv);
    },
    async onUploadCreate(req, res, upload) {
        upload.metadata.filename = encodeURIComponent(upload.metadata.filename);
        return { res, metadata: { ...upload.metadata, a: "b" } };
    },
});

// 添加一个工具函数来转换 Web Request 为 Node.js IncomingMessage
function webRequestToIncomingMessage(webRequest) {
    // 创建一个新的 IncomingMessage 对象
    const Duplex = require('stream').Duplex;
    const incomingMessage = new Duplex();

    // 复制请求方法和 URL
    incomingMessage.method = webRequest.method;
    incomingMessage.url = webRequest.url;

    // 复制 headers
    incomingMessage.headers = {};
    for (const [key, value] of webRequest.headers.entries()) {
        incomingMessage.headers[key.toLowerCase()] = value;
    }

    // 处理请求体
    if (webRequest.body) {
        const readable = Readable.from(webRequest.body);
        readable.pipe(incomingMessage);
    }

    return incomingMessage;
}

uploadApp.all("*", async (req, res) => {
    // 如果是 Next.js 的 Web Request
    if (req.constructor.name === 'Request') {
        const nodeRequest = webRequestToIncomingMessage(req);
        return server.handle(nodeRequest, res);
    }
    // 如果已经是 Node.js request（比如在普通 Express 环境中）
    return server.handle(req, res);
});

app.use("/uploads", uploadApp);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/files", async (req, res) => {
    const folderPath = join(resolve(__dirname, "files"), "users", "default");
    const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".json"));
    const allJsonData = files.reduce((acc, file) => {
        const filePath = join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        acc.push(JSON.parse(content));
        return acc;
    }, []);
    return res.json({msg: "success", data: allJsonData});
});

app.listen(port, host, () => {
    console.log(`Example app running on http://${host}:${port}`);
});

/**
 * 根据请求获取用户信息，设置文件夹
 * @param {Request} req
 * @returns {string}
 */
function getFolderForUser(req) {
    return "default";
}

function encryptAES_CBC(content, secretKey, iv) {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const ivParam = CryptoJS.enc.Utf8.parse(iv);

    const encrypted = CryptoJS.AES.encrypt(content, key, {
        iv: ivParam,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

function decryptAES_CBC(encryptedContent, secretKey, iv) {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const ivParam = CryptoJS.enc.Utf8.parse(iv);

    const encryptedHex = CryptoJS.enc.Base64.parse(encryptedContent).toString(CryptoJS.enc.Hex);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(encryptedHex) }, key, {
        iv: ivParam,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}
