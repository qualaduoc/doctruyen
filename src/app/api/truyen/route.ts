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

    // 1. Tối ưu Tên Chương
    let title = $("title").text().trim() || $("h1").text().trim();
    title = title
      .replace(/\s*-\s*[a-zA-Z0-9]+\.[a-zA-Z]+/i, "") // Xóa '- domain.com'
      .replace(/\s*-\s*Đọc Truyện.*$/i, "")
      .replace(/\s*-\s*Truyện.*$/i, "")
      .replace(/\s*-\s*Wattpad.*$/i, "")
      .replace(/\s*\|\s*Truyện.*$/i, "")
      .trim();

    // 2. Tối ưu Nút Next (Nhiều keyword hơn)
    let nextUrl = "";
    $("a").each((_: number, el: any) => {
      const linkText = $(el).text().toLowerCase().trim();
      if (
        linkText === "chương tiếp" ||
        linkText === "chương sau" ||
        linkText.includes("chương tiếp") ||
        linkText.includes("chương sau") ||
        linkText === "tiếp >>" ||
        linkText === "tiếp" ||
        linkText === "next chapter" ||
        linkText.includes("chương kế")
      ) {
        const href = $(el).attr("href");
        if (href && href !== "#" && !href.includes("javascript")) {
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

    // 3. Quét rác sơ bộ
    $("script, style, iframe, .ads, .comment, noscript, nav, header, footer").remove();

    // 4. Tìm Container chứa Text nội dung
    let contentTexts: string[] = [];
    let contentNode: any = null;
    
    // Hệ thống Selectors phổ biến của TruyenFull, TangThuVien, Wattpad, Metruyenchu...
    const knownSelectors = [
      '#chapter-c', '.chapter-c', '.chapter-content', '#chr-content', 
      '.reading-content', '#box-chap', '.nd-chap', 'div[itemprop="articleBody"]',
      '.txt-body'
    ];
    
    for (const sel of knownSelectors) {
      if ($(sel).length > 0) {
        contentNode = $(sel).first();
        break;
      }
    }
    
    // Cơ Chế Fallback: Điểm danh thẻ chứa nhiều <p> nhất nếu không trúng phóc Selector nào
    if (!contentNode) {
      let maxP = 0;
      let targetDiv = null;
      $("div, article, section").each((_: number, el: any) => {
        const pCount = $(el).find("p").length;
        if (pCount > maxP) {
          maxP = pCount;
          targetDiv = el;
        }
      });
      if (targetDiv && maxP > 2) {
        contentNode = $(targetDiv);
      } else {
        contentNode = $("body");
      }
    }

    // Lẩy từng thẻ p
    contentNode.find("p").each((_: number, el: any) => {
      const text = $(el).text().trim();
      // Loại trừ các câu thừa hay có trong list
      const lower = text.toLowerCase();
      if (
        text.length > 5 &&
        !lower.includes("chương trước") &&
        !lower.includes("chương tiếp") &&
        !lower.includes("đọc truyện tại")
      ) {
        contentTexts.push(text);
      }
    });

    // Nếu tụi nó không xài thẻ p mà xài thụt dòng <br> thô bỉ?
    if (contentTexts.length === 0) {
      const rawHtml = contentNode.html() || "";
      rawHtml.split(/<br\s*\/?>/i).forEach((frag: string) => {
        const t = cheerio.load(frag).text().trim();
        const lower = t.toLowerCase();
        if (
          t.length > 5 &&
          !lower.includes("chương trước") &&
          !lower.includes("chương tiếp") &&
          !lower.includes("đọc truyện tại")
        ) {
          contentTexts.push(t);
        }
      });
    }

    const fullText = contentTexts.join("\n\n");
    if (!fullText || fullText.length < 50) {
       return NextResponse.json({ success: false, error: "Không thể trích xuất nội dung từ link này. Có thể website đang sử dụng cơ chế bảo mật cấm cào." }, { status: 400 });
    }

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
