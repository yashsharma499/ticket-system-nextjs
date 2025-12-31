import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user) 
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");

    if (!file)
      return NextResponse.json({ message: "No file found" }, { status: 400 });

    
    const buffer = Buffer.from(await file.arrayBuffer());

    
    const uploaded = await new Promise((resolve, reject) =>
      cloudinary.uploader
        .upload_stream({ folder: "tickets" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer)
    );

    
    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,       
      uploadedAt: new Date()
    }, { status: 200 });

  } catch (err) {
    console.log("Upload Error →", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
