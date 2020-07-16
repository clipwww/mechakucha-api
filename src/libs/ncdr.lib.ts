import * as fs from 'fs';
import { toJson } from 'xml2json';

export interface Alert {
  id: string;
  title: string;
  author: string;
  updated: string;
  message: string;
  category: string;
  link: string;
}

export const parseNcdrXMLtoData = (path: string): Promise<Alert | void> => {
  return new Promise(reslove => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        return reslove();
      }
      try {
        const alert = JSON.parse(toJson(data))
  
        const entry = alert?.feed?.entry ?? []
        const newEnrty = entry[entry.length - 1];
  
        return reslove({
          id: newEnrty.id,
          title: newEnrty.title,
          author: newEnrty.author.name,
          updated: newEnrty.updated,
          message: newEnrty.summary.$t,
          category: newEnrty.category.term,
          link: newEnrty.link.href,
        })
      } catch (err) {
        console.error(err);
        return reslove();
      }
    })
  })
}