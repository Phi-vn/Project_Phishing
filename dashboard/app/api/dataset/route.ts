import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // Locate dataset in ml-training/Data/dataset.csv
    const datasetPath = path.resolve(process.cwd(), "..", "ml-training", "Data", "dataset.csv");

    if (!fs.existsSync(datasetPath)) {
      return new NextResponse("Tệp dataset.csv không tìm thấy trên máy chủ.", { status: 404 });
    }

    const stat = fs.statSync(datasetPath);
    const fileStream = fs.createReadStream(datasetPath);

    // Stream directly to client
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="phisharmor_dataset_580k.csv"',
        "Content-Length": stat.size.toString(),
      },
    });
  } catch (error) {
    console.error("Lỗi khi tải dataset:", error);
    return new NextResponse("Lỗi máy chủ khi đọc tệp dataset.", { status: 500 });
  }
}
