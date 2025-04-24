import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from "bullmq";
import { getVectorStore } from "./utils";

const worker = new Worker(
	"file-upload-queue",
	async (job) => {
		const { fileName, filePath, originalName } = job.data;
		const loader = new PDFLoader(filePath);

		const docs = await loader.load();
		console.log("Loaded documents:", docs.length, docs);

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const splittedDocs = await splitter.splitDocuments(docs);
		console.log("Splitted documents:", splittedDocs.length, splittedDocs);

		const vectorStore = await getVectorStore(splittedDocs);
		// vectorStore.ensureCollection();
		console.log("Vector Store: ", vectorStore);

		await vectorStore.addDocuments(splittedDocs);
		console.log("Documents added to vector store");
	},
	{
		concurrency: 100,
		connection: {
			host: "localhost",
			port: 6379,
		},
	}
);
