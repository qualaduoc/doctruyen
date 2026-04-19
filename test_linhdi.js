async function run() {
    const r = await fetch('https://r.jina.ai/https://www.linhdi.vn/truyen/thuong-hai-quan-truong/chuong-1', {
        headers: {
            "Accept": "application/json",
            "X-Return-Format": "markdown"
        }
    });
    const js = await r.json();
    console.log(js.data.text.slice(js.data.text.length - 2000));
}
run();
