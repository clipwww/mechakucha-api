import { Router } from 'express';
// import { format } from 'date-fns';

import { sendNotifyMessage } from '../libs/line.lib';
import { parseXMLtoData } from '../libs/youtube.lib';

const router = Router();

// router.post('/', (req, res) => {
//   const { name } = req.query;
//   const path = `./files/${name}.xml`;

//   req.pipe(fs.createWriteStream(path));
//   req.on('end', async () => {

//     const alert = await parseNcdrXMLtoData(path);
//     console.log('alert', alert)

//     if (alert) {
//       const tokens = ['2Ku8zuIZIOUoAXKm0VsqqXYv2Mvy8w68b3NqxkkXRp6', 'Xn5g3dqsMZKsndQL1A1L6XnjIf5sweNPCduP3WcRg6K']
//       await Promise.all(tokens.map(token => sendNotifyMessage(token, {
//         message: `
// -- ${alert.title} --
// ${alert.message}
//         `
//       })))
     
//     }
      
//       res.status(200).send(`<?xml version=\"1.0\" encoding=\"utf-8\" ?> <Data><Status>True</Status></Data>`)
//   });
// })

router.get('/yt', (req, res) => {
  const query = req.query;
  console.log(query);
  res.status(200).send(query['hub.challenge']);
})


router.post('/yt', async (req, res) => {
  const xmlString: string = req['rawBody'];

  const entry = parseXMLtoData(xmlString);
  console.log('entry', entry)
  if (entry) {
    await sendNotifyMessage('2Ku8zuIZIOUoAXKm0VsqqXYv2Mvy8w68b3NqxkkXRp6', {
      message: `
  ${entry.author.name} 發布了新的影片！
  影片標題: ${entry.title}
  影片連結: ${entry.link.href}
  發布時間: ${new Date(entry.published).toLocaleString()}
      `,
      imageFullsize: `https://img.youtube.com/vi/${entry["yt:videoId"]}/maxresdefault.jpg`,
      imageThumbnail: `https://img.youtube.com/vi/${entry["yt:videoId"]}/default.jpg`
    })
  }


  res.status(200).send(entry ? 'ok' : '不ok');
})

export default router;