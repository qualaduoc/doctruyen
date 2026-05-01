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
    const fetchWithFallback = async (target: string) => {
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1"
      };

      const fetchWithTimeout = async (url: string, ms: number, opts = {}) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ms);
        try {
          const res = await fetch(url, { ...opts, signal: controller.signal });
          clearTimeout(timeout);
          return res;
        } catch (err) {
          clearTimeout(timeout);
          throw err;
        }
      };

      try {
        // Thử gọi trực tiếp nhưng fake header thật kỹ (timeout 5s)
        let response = await fetchWithTimeout(target, 5000, { headers });
        if (response.ok) {
          const text = await response.text();
          // Kiểm tra xem có phải trang Cloudflare challenge không
          if (text.length > 5000 && !text.includes("Just a moment...")) {
             return text;
          }
        }
      } catch (err) {
        console.warn(`Direct fetch error:`, err);
      }

      // Fallback Proxy 1 (timeout 8s)
      console.warn(`Direct fetch failed or blocked. Using Proxy 1...`);
      try {
        const proxy1 = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`, 8000, { headers });
        if (proxy1.ok) {
           return await proxy1.text();
        }
      } catch (err) {
        console.warn(`Proxy 1 error:`, err);
      }

      throw new Error(`Failed to fetch url from both direct and proxy`);
    };

    // === XỬ LÝ ĐẶC BIỆT CSR APP (VD: linhdi.vn) BẰNG JINA AI ===
    if (url.includes("linhdi.vn")) {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const jinaResponse = await fetch(jinaUrl, {
        headers: {
          "Accept": "application/json",
          "X-Return-Format": "markdown"
        }
      });
      if (jinaResponse.ok) {
        const payload = await jinaResponse.json();
        if (payload.data && payload.data.text) {
          let title = payload.data.title || "Chương Truyện";
          title = title.replace(/\s*-\s*Linh D.*$/i, "").replace("Chương 1: Chương 1:", "Chương 1:").trim();
          
          let nextUrl = null;
          let prevUrl = null;
          
          // Tính Next / Prev dựa vào slug 'chuong-[number]'
          const match = url.match(/(.*\/)?chuong-(\d+)(.*)/i);
          if (match) {
            const base = match[1] || "";
            const current = parseInt(match[2]);
            const tail = match[3] || "";
            if (current > 1) {
               prevUrl = `${base}chuong-${current - 1}${tail}`;
            }
            nextUrl = `${base}chuong-${current + 1}${tail}`;
          }

          let fullText = payload.data.text
             .split('\n')
             .filter((line: string) => line.trim() && line.trim() !== 'Aa')
             .join('\n\n');

          const chunks = chunkText(fullText, 200);

          return NextResponse.json({
            success: true,
            data: {
              title,
              chunks,
              nextUrl,
              prevUrl,
              fullTextLength: fullText.length,
            },
          });
        }
      }
    }

    const html = await fetchWithFallback(url);
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

    let nextUrl = "";
    let prevUrl = "";
    $("a").each((_: number, el: any) => {
      const linkText = $(el).text().toLowerCase().trim();
      const href = $(el).attr("href");
      
      if (!href || href === "#" || href.includes("javascript")) return;
      
      let finalUrl = "";
      if (href.startsWith("http")) {
        finalUrl = href;
      } else if (href.startsWith("/")) {
        const baseUrl = new URL(url).origin;
        finalUrl = `${baseUrl}${href}`;
      } else {
        const baseUrl = new URL(url).origin;
        finalUrl = baseUrl + "/" + href;
      }

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
        nextUrl = finalUrl;
      }

      if (
        linkText === "chương trước" ||
        linkText.includes("chương trước") ||
        linkText === "<< trước" ||
        linkText === "trước" ||
        linkText === "prev chapter" ||
        linkText === "previous chapter"
      ) {
        prevUrl = finalUrl;
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
        prevUrl: prevUrl || null,
        fullTextLength: fullText.length,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi cào dữ liệu:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
