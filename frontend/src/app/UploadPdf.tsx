"use client";
import React from "react";
import { Upload } from "lucide-react";

function UploadPdf() {
	const handleUpload = async () => {
		const elem = document.createElement("input");
		elem.type = "application/pdf";
		elem.style.display = "none";
		elem.accept = ".pdf";
		elem.onchange = async () => {
			const file = elem.files?.[0];
			if (file) {
				const formData = new FormData();
				formData.append("pdf", file);
				console.log("Uploading file:", file.name, file);

				// const response = await fetch("/api/upload", {
				//   method: "POST",
				//   body: formData,
				// });

				// const data = await response.json();
				// console.log(data);
			}
		};
		elem.click();
	};
	return (
		<div
			className="flex flex-col items-center justify-center bg-gray-800 p-3
           border border-slate-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
			onClick={handleUpload}
		>
			<Upload />
			<h2>Upload PDF</h2>
		</div>
	);
}

export default UploadPdf;
