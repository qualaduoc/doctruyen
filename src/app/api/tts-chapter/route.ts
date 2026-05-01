import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { chunkText } from "@/utils/chunkText";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const voice = searchParams.get("voice") || "google";

  // ===== 1. CÀO TEXT TỪ WEBSITE =====
  let fullText = "";
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
        let response = await fetchWithTimeout(target, 5000, { headers });
        if (response.ok) {
          const text = await response.text();
          if (text.length > 5000 && !text.includes("Just a moment...")) {
             return text;
          }
        }
      } catch (err) {
        console.warn(`Direct fetch error:`, err);
      }

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

    const html = await fetchWithFallback(url);
    const $ = cheerio.load(html);

    // Quét rác
    $("script, style, iframe, .ads, .comment, noscript, nav, header, footer").remove();

    let contentNode: any = null;
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
      contentNode = targetDiv && maxP > 2 ? $(targetDiv) : $("body");
    }

    let contentTexts: string[] = [];
    contentNode.find("p").each((_: number, el: any) => {
      const text = $(el).text().trim();
      const lower = text.toLowerCase();
      if (text.length > 5 && !lower.includes("chương trước") && !lower.includes("chương tiếp")) {
        contentTexts.push(text);
      }
    });

    if (contentTexts.length === 0) {
      const rawHtml = contentNode.html() || "";
      rawHtml.split(/<br\s*\/?>/i).forEach((frag: string) => {
        const t = cheerio.load(frag).text().trim();
        const lower = t.toLowerCase();
        if (t.length > 5 && !lower.includes("chương trước") && !lower.includes("chương tiếp")) {
          contentTexts.push(t);
        }
      });
    }

    fullText = contentTexts.join("\n\n");
    if (!fullText || fullText.length < 50) throw new Error("Empty text chunks");
  } catch (error) {
    return NextResponse.json({ error: "Failed to scrape novel text" }, { status: 500 });
  }

  // ===== 2. BĂM CHUNKS VÀ GỌI TTS SONG SONG =====
  try {
    const chunks = chunkText(fullText, 200);
    
    const audioBuffers: Buffer[] = [];
    const BATCH_SIZE = 5; // Xử lý 5 chunk cùng lúc
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (chunk) => {
          let buffer: Buffer | null = null;
          
          // 1. THỬ DÙNG ZALO AI (NẾU CÓ KEY VÀ CHỌN GIỌNG ZALO)
          if (voice.startsWith("zalo_") && process.env.ZALO_API_KEY) {
             const speaker_id = voice === "zalo_nam" ? 2 : 1; 
             try {
               const zaloRes = await fetch("https://api.zalo.ai/v1a/tts/synthesize", {
                 method: "POST",
                 headers: {
                   "apikey": process.env.ZALO_API_KEY,
                   "Content-Type": "application/x-www-form-urlencoded"
                 },
                 body: new URLSearchParams({ input: chunk, speaker_id: speaker_id.toString() })
               });
               const zaloData = await zaloRes.json();
               if (zaloData.error_code === 0 && zaloData.data?.url) {
                  // Zalo trả về link bất đồng bộ, cần chờ vài giây rồi tải
                  for (let j = 0; j < 5; j++) {
                     await new Promise(r => setTimeout(r, 1000));
                     const audioRes = await fetch(zaloData.data.url);
                     if (audioRes.ok) {
                        const arrayBuffer = await audioRes.arrayBuffer();
                        buffer = Buffer.from(arrayBuffer);
                        break;
                     }
                  }
               }
             } catch(e) { console.warn("Zalo AI failed", e); }
          }
          
          // 2. THỬ DÙNG VIETTEL AI (NẾU CÓ KEY VÀ CHỌN GIỌNG VIETTEL)
          if (!buffer && voice.startsWith("viettel_") && process.env.VIETTEL_API_KEY) {
             try {
               const viettelRes = await fetch("https://viettelgroup.ai/voice/api/tts/v1/rest/syn", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "token": process.env.VIETTEL_API_KEY
                  },
                  body: JSON.stringify({
                     text: chunk,
                     voice: voice === "viettel_nam" ? "doanngocle" : "hcm-diemmy",
                     id: "1",
                     without_filter: false,
                     speed: 1.0,
                     tts_return_option: 2
                  })
               });
               if (viettelRes.ok) {
                  const arrayBuffer = await viettelRes.arrayBuffer();
                  buffer = Buffer.from(arrayBuffer);
               }
             } catch(e) { console.warn("Viettel AI failed", e); }
          }

          // 3. FALLBACK: GOOGLE TTS MẶC ĐỊNH (HOÀN TOÀN MIỄN PHÍ)
          if (!buffer) {
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
            const res = await fetch(googleUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://translate.google.com/",
              },
            });
            if (!res.ok) throw new Error(`Google API error: ${res.status}`);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
          }
          
          return buffer;
        })
      );
      audioBuffers.push(...batchResults);
      
      // Delay nhỏ giữa các batch để Google không block IP
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Kỹ thuật nối MP3 thần thánh (Buffer Concat)
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    // Đẩy trả stream MP3 hoàn chỉnh về client
    return new NextResponse(finalAudioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalAudioBuffer.length.toString(),
        "Accept-Ranges": "bytes", // Để HĐH hỗ trợ Tua
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400", // Cache mạnh trên Vercel Edge 1 năm và Browser
      },
    });

  } catch (error: any) {
    console.error("TTS Builder Error:", error);
    return NextResponse.json({ error: "Failed to build MP3" }, { status: 500 });
  }
}
