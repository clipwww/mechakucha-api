import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
const xmlParser = new XMLParser();
export const parseNcdrXMLtoData = (path) => {
    return new Promise(reslove => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                return reslove();
            }
            try {
                const alert = xmlParser.parse(data);
                const entry = alert?.feed?.entry ?? [];
                const newEnrty = entry[entry.length - 1];
                return reslove({
                    id: newEnrty.id,
                    title: newEnrty.title,
                    author: newEnrty.author.name,
                    updated: newEnrty.updated,
                    message: newEnrty.summary.$t,
                    category: newEnrty.category.term,
                    link: newEnrty.link.href,
                });
            }
            catch (err) {
                console.error(err);
                return reslove();
            }
        });
    });
};
