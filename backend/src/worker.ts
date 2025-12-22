    
    console.log("WORKER STARTING UP AT:", new Date().toISOString());
    import { Worker } from 'bullmq';
    import { chromium } from 'playwright';
    import { GoogleGenAI } from "@google/genai";
    import { tasks } from './schema';
    import { eq } from 'drizzle-orm';
    import { drizzle } from 'drizzle-orm/node-postgres';
    
    const db = drizzle(process.env.DATABASE_URL!);

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    console.log("Worker starting...");
    
    //https://www.npmjs.com/package/bullmq
    const worker = new Worker('scraping-queue', async (job) => {
      const { taskId, question } = job.data;
        let url = job.data.url as string;

  
      if (url && !url.startsWith('http')) {
        url = `https://${url}`;
      }

     
      await db.update(tasks).set({ status: 'processing' }).where(eq(tasks.id, taskId));

      try {
        
        const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });
        const pageText = await page.innerText('body');
        console.log("Page text extracted ${pageText}");
        await browser.close();

        
        // https://ai.google.dev/gemini-api/docs/text-generation
        
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Answer the question: ${question} regarding the url: ${url} having webpage content: ${pageText}`,
        });
        const answer = result.text;
        

        
        await db.update(tasks).set({ status: 'completed', answer }).where(eq(tasks.id, taskId));
        
      } catch (error) {
        await db.update(tasks).set({ status: 'failed' }).where(eq(tasks.id, taskId));
        console.error("Job failed:", error);
      }
    },

    { connection: { host: process.env.REDIS_HOST! || 'redis', port: 6379 } });