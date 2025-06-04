import UploadPdf from "./UploadPdf";

export default function Home() {
	return (
		<>
			<div className="bg-gray-900 grid grid-cols-2 h-screen">
				<div className="col-span-1 w-full flex items-center justify-center">
					<UploadPdf />
				</div>
				<div className="col-span-1 border-l border-slate-100 w-full"></div>
			</div>
		</>
	);
}
