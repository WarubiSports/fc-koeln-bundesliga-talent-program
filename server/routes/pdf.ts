import { Router, Request, Response } from "express";
import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "../utils/logger.js";

const execAsync = promisify(exec);
const router = Router();

async function getChromiumPath(): Promise<string> {
  try {
    const { stdout } = await execAsync("which chromium");
    return stdout.trim();
  } catch {
    throw new Error("Chromium not found. Please ensure chromium is installed.");
  }
}

router.post("/generate", async (req: Request, res: Response) => {
  const { analysisHtml, playerName } = req.body;
  
  if (!analysisHtml || !playerName) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: analysisHtml and playerName" 
    });
  }
  
  let browser;
  
  try {
    logger.info("Starting PDF generation", { playerName });
    
    const chromiumPath = await getChromiumPath();
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process"
      ],
      executablePath: chromiumPath
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({ width: 900, height: 1200 });
    
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            background: #0f172a;
            color: #f1f5f9;
            font-size: 12px;
            line-height: 1.4;
          }
          .pdf-container {
            padding: 24px;
            max-width: 850px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          ${analysisHtml}
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(fullHtml, { 
      waitUntil: "networkidle0",
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
      displayHeaderFooter: false
    });
    
    await browser.close();
    
    logger.info("PDF generated successfully", { playerName });
    
    const safeName = playerName.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ExposureEngine_${safeName}_Report.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(Buffer.from(pdfBuffer));
    
  } catch (error) {
    logger.error("PDF generation failed", { error, playerName });
    
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "PDF generation failed" 
    });
  }
});

export default router;
