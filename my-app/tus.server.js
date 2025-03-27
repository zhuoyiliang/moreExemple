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

uploadApp.all("*", async (req, res) => {
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

// video标签播放视频
app.get('/play-tus/:filename', async (req, res) => {
    const relPath = join(process.cwd(), "files", decryptAES_CBC(Buffer.from(req.params.filename, "base64url").toString("utf-8"), secretKey, iv));
    const jsonPath = `${relPath}.json`;
    const videoPath = relPath;
    try {
        const jsonFile = fs.statSync(jsonPath);
        const videoFile = fs.statSync(videoPath);

        // Check if both files exist
        if (!jsonFile || !videoFile) {
            console.log("File not found: ", relPath);
            return res.status(404).send('File not found');
        }

        // Read and parse JSON data
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (jsonData.metadata.filetype !== "video/mp4") {
            console.log("Invalid file type: ", jsonData);
            return res.status(404).send("Invalid file type");
        }

        const fileSize = videoFile.size;
        const { range } = req.headers; // Get the byte range from request headers

        if (!range) {
            // If no range header provided, send entire file
            return res.set({
                'Content-Type': 'video/mp4',
                'Content-Length': fileSize,
                'Cache-Control': 'public, max-age=86400'
            }).sendFile(videoPath);
        }

        // Parse Range Header e.g., bytes=0-1023
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Validate requested range
        if (start >= fileSize || isNaN(start)) {
            return res.status(416).set({
                'Content-Range': `*/${fileSize}`
            }).send('Requested range not satisfiable');
        }

        const chunksize = (end - start) + 1; // Calculate size of response body

        // Set headers for partial content response
        res.set({
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
            'Cache-Control': 'public, max-age=86400'
        });

        // Send status code 206 for partial content
        res.status(206);

        // Stream the requested part of the file to client
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
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

let str = "http://localhost:1080/uploads/MVZ3Q3ZKZkJzd1I4b0o0SjJZREpGMCt0MjZ5aGN3RmNDdXlsSXFySW5zSlFpL1MwbExsTEU4YUg0clpvTHJwVw"
