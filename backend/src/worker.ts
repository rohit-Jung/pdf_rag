import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { VectorStore } from "@langchain/core/vectorstores";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

const worker = new Worker(
	"file-upload-queue",
	async (job) => {
		const { fileName, filePath, originalName } = job.data;
		const loader = new PDFLoader(filePath);

		const docs = await loader.load();
		console.log("Loaded documents:", docs.length);

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const splittedDocs = await splitter.splitDocuments(docs);
		console.log("Splitted documents:", splittedDocs.length);

		const embeddings = new GoogleGenerativeAIEmbeddings({
			apiKey: process.env.GOOGLE_API_KEY,
			model: "text-embedding-004",
			taskType: TaskType.RETRIEVAL_DOCUMENT,
			title: "Document title",
		});

		// Instantiation
		const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {});

		// embedder.embedDocuments(splittedDocs)
	},
	{
		concurrency: 100,
		connection: {
			host: "localhost",
			port: 6379,
		},
	}
);
