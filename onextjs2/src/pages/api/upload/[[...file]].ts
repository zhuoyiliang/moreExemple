import type { NextApiRequest, NextApiResponse } from "next";
import { Server, Upload } from "@tus/server";
import { FileStore } from "@tus/file-store";
import crypto from "crypto";

export const config = {
    api: {
        bodyParser: false,
    },
};

const tusServer = new Server({
    path: "/api/upload",
    datastore: new FileStore({ directory: "./files" }),
    namingFunction(req) {
        const id = crypto.randomBytes(16).toString("hex");
        const folder = "default";
        return `users/${folder}/${id}`;
    },
    generateUrl(req, { proto, host, path, id }) {
        id = Buffer.from(id, "utf-8").toString("base64url");
        return `${proto}://${host}${path}/${id}`;
    },
    getFileIdFromRequest(req, lastPath) {
        //@ts-ignore
        console.log("lastPath: ", Buffer.from(lastPath, "base64url").toString("utf-8"));
        //@ts-ignore
        return Buffer.from(lastPath, "base64url").toString("utf-8");
    },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return tusServer.handle(req, res);
}
