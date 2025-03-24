import { NextRequest } from "next/server";

export async function GET(nextRequest: NextRequest) {
    return new Response("Success!", {
        status: 500,
    });
}

export async function POST() {
    return Response.json({ message: "Hello World!" });
}
