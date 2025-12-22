// https://www.npmjs.com/package/@types/express?activeTab=readme

console.log("index.ts:", new Date().toISOString());
import express from 'express';
import { Request, Response} from 'express';
import { Queue } from 'bullmq';
import { tasks } from './schema';
import { eq } from 'drizzle-orm';

// https://orm.drizzle.team/docs/get-started/postgresql-new
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);
console.log("Database connected.");
const app = express();
var cors = require('cors')
app.use(cors());
app.use(express.json());

//https://www.npmjs.com/package/bullmq
const taskQueue = new Queue('scraping-queue', { 
  connection: { host: process.env.REDIS_HOST! ,port: 6379 } 
});


app.post('/api/tasks', async (req: Request, res: Response) => {
  const { url, question } = req.body;
 
  const [newTask] = await db.insert(tasks).values({ url, question }).returning();
  
  await taskQueue.add('scrape-web', { taskId: newTask.id, url, question });
  console.log("New task added to queue:", newTask.id);
  
  res.json(newTask);
});


app.get('/api/tasks/:id', cors(), async (req: Request, res: Response) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  console.log("Fetched task:", task);
  res.json(task);
});

app.listen(4000, () => console.log('API running on port 4000'));