"use client";
import * as tus from "tus-js-client";
import React, { useState, FormEvent } from "react";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);

    function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            console.log(selectedFile);
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (file) {
            console.log("Submitting file:", file);
            uploadFile(file);
        } else {
            console.log("No file selected");
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" name="fileObj" onChange={changeHandler} />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

function uploadFile(file: File) {
    const upload = new tus.Upload(file, {
        endpoint: "/api/upload",
        metadata: {
            filename: file.name,
            filetype: file.type,
        },
        chunkSize: 1024 * 1024, // 1MB
        onSuccess: function () {
            console.log("Download %s from %s", upload.file.name, upload.url);
        },
        onError: function (error) {
            console.error("Upload error", error);
        },
    });
    upload.start();
}
