import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { VectorStore } from "@langchain/core/vectorstores";

async function getVectorStore(splittedDocs?: any[]): Promise<VectorStore> {
	const embeddings = new GoogleGenerativeAIEmbeddings({
		apiKey: process.env.GEMINI_API_KEY,
		model: "text-embedding-004",
		taskType: TaskType.RETRIEVAL_DOCUMENT,
	});

	console.log("Embeddings: ", embeddings);

	// Create Vector store with the given embeddings
	let vectorStore: VectorStore | null = null;
	if (splittedDocs) {
		vectorStore = await QdrantVectorStore.fromDocuments(splittedDocs, embeddings, {
			url: "http://localhost:6333",
			collectionName: "pdf-rag",
		});
	} else {
		vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
			url: "http://localhost:6333",
			collectionName: "pdf-rag",
		});
	}

	return vectorStore;
}

function generateSystemPrompt(context: string) {
	return `You are a helpful assistant. You will be provided with a context. Your task is to answer the question based on the context.
  Context: ${context} `;
}

export { getVectorStore, generateSystemPrompt };
