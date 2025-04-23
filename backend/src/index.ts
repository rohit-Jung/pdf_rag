import "dotenv/config";
import express from "express";
import { upload } from "./multer";
import { Queue } from "bullmq";

const app = express();
const fileUploadQueue = new Queue("file-upload-queue", {
	connection: { host: "localhost", port: 6379 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
	await fileUploadQueue.add("pdf-upload", {
		fileName: req.file?.filename,
		filePath: req.file?.path,
		originalName: req.file?.originalname,
	});
});

app.post("/chat", (req, res, next) => {});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
