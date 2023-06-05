import path from 'path';
import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
dotenv.config();

import router from './routers';

app.use('/', router);


app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
