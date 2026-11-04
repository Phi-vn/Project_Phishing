import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const zipPath = path.resolve(process.cwd(), "public", "downloads", "PhishArmor_Extension_v1.4.2.zip");

    if (!fs.existsSync(zipPath)) {
      return new NextResponse("Tệp zip extension chưa sẵn sàng trên máy chủ.", { status: 404 });
    }

    const stat = fs.statSync(zipPath);
    const fileStream = fs.createReadStream(zipPath);

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
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="PhishArmor_Extension_v1.4.2.zip"',
        "Content-Length": stat.size.toString(),
      },
    });
  } catch (error) {
    console.error("Lỗi khi tải extension zip:", error);
    return new NextResponse("Lỗi máy chủ khi đọc tệp extension.", { status: 500 });
  }
}
