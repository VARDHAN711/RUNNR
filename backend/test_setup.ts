import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const testPort: number = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('TypeScript Foundation Verified');
});

console.log(`Path check: ${path.join(__dirname, 'dist')}`);