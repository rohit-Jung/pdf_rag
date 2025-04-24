import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Please upload a PDF file"));
	}
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./uploads");
	},

	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${file.originalname}-${uniqueSuffix}`);
	},
});

export const upload = multer({ storage: storage, fileFilter });
