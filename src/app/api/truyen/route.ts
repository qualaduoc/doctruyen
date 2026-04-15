import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { chunkText } from "@/utils/chunkText";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Thiếu tham số url" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch url: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Xử lý bóc tách nội dung
    // Dựa vào HTML phổ biến của truyện
    let rawTitle = $("title").text().trim() || $("h1").text().trim();
    let title = rawTitle
      .replace(/\s*-\s*Wattpad(\.com)?\.vn/i, "") // Xóa rác đuôi domain
      .replace(/\s*\|\s*Wattpad/i, "")
      .trim();
    // Tìm URL của chương tiếp theo
    // Wattpad clone thường dùng <a> có chữ Chương tiếp
    let nextUrl = "";
    $("a").each((_, el) => {
      const linkText = $(el).text().toLowerCase();
      if (linkText.includes("chương tiếp") || linkText.includes("chương sau") || linkText.includes("next chapter")) {
        const href = $(el).attr("href");
        if (href) {
          // Xử lý link tương đối
          if (href.startsWith("http")) {
            nextUrl = href;
          } else if (href.startsWith("/")) {
            const baseUrl = new URL(url).origin;
            nextUrl = `${baseUrl}${href}`;
          } else {
            const baseUrl = new URL(url).origin;
            nextUrl = baseUrl + "/" + href;
          }
        }
      }
    });

    // Lấy nội dung
    // Các trang web truyện thường ném trong div content và có rất nhiều thẻ <p>
    let contentTexts: string[] = [];
    
    // Clean up rác quảng cáo
    $("script, style, iframe, .ads, .comment").remove();

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      // Bỏ qua các đoạn text quá ngắn hoặc mang tính chất nút bấm
      if (text.length > 10 && !text.toLowerCase().includes("chương trước") && !text.toLowerCase().includes("chương tiếp")) {
        contentTexts.push(text);
      }
    });

    const fullText = contentTexts.join("\n\n");
    const chunks = chunkText(fullText, 200);

    return NextResponse.json({
      success: true,
      data: {
        title,
        chunks,
        nextUrl: nextUrl || null,
        fullTextLength: fullText.length,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi cào dữ liệu:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
