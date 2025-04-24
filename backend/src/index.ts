import "dotenv/config";
import express from "express";
import { upload } from "./multer";
import { Queue } from "bullmq";
import { generateSystemPrompt, getVectorStore } from "./utils";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.GEMINI_API_KEY,
	baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const app = express();
const fileUploadQueue = new Queue("file-upload-queue", {
	connection: { host: "localhost", port: 6379 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.single("pdf"), async (req, res) => {
	await fileUploadQueue.add("pdf-upload", {
		fileName: req.file?.filename,
		filePath: req.file?.path,
		originalName: req.file?.originalname,
	});

	res.status(200).json({
		message: "File uploaded successfully",
		fileName: req.file?.filename,
	});
});

app.post("/chat", async (req, res, next) => {
	const { question } = req.body;
	if (!question) {
		res.status(400).json({ error: "Question is required" });
		return;
	}

	const vectorStore = await getVectorStore();
	if (!vectorStore) {
		res.status(500).json({ error: "Vector store not initialized" });
		return;
	}

	const docs = await vectorStore.similaritySearch(question, 5);
	if (docs.length === 0) {
		res.status(404).json({ error: "No relevant documents found" });
		return;
	}

	console.log("Retrieved documents:", docs.length, docs);

	const context = docs.map((doc) => doc.pageContent).join("\n\n");
	const SYSTEM_PROMPT = generateSystemPrompt(context);
	console.log("System prompt:", SYSTEM_PROMPT);

	const response = await openai.chat.completions.create({
		model: "gemini-2.0-flash",
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: question },
		],
	});

	console.log("Gemini response:", response);

	res.status(200).json({
		// answer: "This is a mock answer. Replace with actual OpenAI response.",
		answer: response.choices[0].message.content,
	});
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
