import { Router, Request, Response } from "express";
import puppeteer from "puppeteer";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import { logger } from "../utils/logger.js";

const execAsync = promisify(exec);
const router = Router();

interface StoredReport {
  result: any;
  profile: any;
  createdAt: number;
}

const reportStore = new Map<string, StoredReport>();
const TOKEN_EXPIRY_MS = 5 * 60 * 1000;

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, report] of reportStore.entries()) {
    if (now - report.createdAt > TOKEN_EXPIRY_MS) {
      reportStore.delete(token);
    }
  }
}

setInterval(cleanupExpiredTokens, 60 * 1000);

async function getChromiumPath(): Promise<string> {
  try {
    const { stdout } = await execAsync("which chromium");
    return stdout.trim();
  } catch {
    throw new Error("Chromium not found. Please ensure chromium is installed.");
  }
}

router.post("/store", (req: Request, res: Response) => {
  const { result, profile } = req.body;
  
  if (!result || !profile) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: result and profile" 
    });
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  
  reportStore.set(token, {
    result,
    profile,
    createdAt: Date.now()
  });
  
  logger.info("Report stored for PDF generation", { 
    playerName: `${profile.firstName} ${profile.lastName}`,
    token: token.substring(0, 8) + '...'
  });
  
  res.json({ success: true, token });
});

router.get("/data/:token", (req: Request, res: Response) => {
  const { token } = req.params;
  
  const report = reportStore.get(token);
  
  if (!report) {
    return res.status(404).json({ 
      success: false, 
      error: "Report not found or expired" 
    });
  }
  
  if (Date.now() - report.createdAt > TOKEN_EXPIRY_MS) {
    reportStore.delete(token);
    return res.status(410).json({ 
      success: false, 
      error: "Report expired" 
    });
  }
  
  res.json({ 
    success: true, 
    result: report.result, 
    profile: report.profile 
  });
});

router.post("/generate/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  
  const report = reportStore.get(token);
  
  if (!report) {
    return res.status(404).json({ 
      success: false, 
      error: "Report not found or expired" 
    });
  }
  
  if (Date.now() - report.createdAt > TOKEN_EXPIRY_MS) {
    reportStore.delete(token);
    return res.status(410).json({ 
      success: false, 
      error: "Report expired" 
    });
  }
  
  let browser;
  
  try {
    const { profile } = report;
    logger.info("Starting PDF generation from actual page", { 
      playerName: `${profile.firstName} ${profile.lastName}` 
    });
    
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
    
    await page.setViewport({ width: 1200, height: 900 });
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    
    const reportUrl = `${baseUrl}/report/${token}`;
    
    logger.info("Navigating to report page", { url: reportUrl });
    
    await page.goto(reportUrl, { 
      waitUntil: "networkidle0",
      timeout: 60000
    });
    
    await page.waitForFunction(() => {
      return (window as any).__PDF_READY__ === true;
    }, { timeout: 30000 });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" },
      displayHeaderFooter: false,
      preferCSSPageSize: false
    });
    
    await browser.close();
    
    reportStore.delete(token);
    
    logger.info("PDF generated successfully from actual page", { 
      playerName: `${profile.firstName} ${profile.lastName}` 
    });
    
    const safeName = `${profile.firstName}_${profile.lastName}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ExposureEngine_${safeName}_Report.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(Buffer.from(pdfBuffer));
    
  } catch (error) {
    logger.error("PDF generation failed", { error });
    
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
