import util from "../../../../utilities";
import xmlParser from "fast-xml-parser"
import request from "request-promise"

import TorrentProvider from "../torrent-provider.js";

const allowedSubs = [
  //"SubsPlease",
  "Erai-raws",
  "HorribleSubs"
]

const BASE_URL = "https://nyaa.si/?page=rss&f=2&c=1_2&q=&p=";

export default class Nyaa extends TorrentProvider {
  constructor() {
    super();
  }

  name() {
    return "Nyaa";
  }

  recentReleases(page) {
    return new Promise((resolve, reject) => {
      request.get(BASE_URL + page)
        .catch(error => reject(error))
        .then(response => {
          return xmlParser.parse(response);
        })
        .catch(error => reject(error))
        .then(parsedXML => {
          let result = {}
          for (let torrent of parsedXML.rss.channel.item) {
            let information = util.rakun.parse(torrent.title);
            if (!allowedSubs.includes(information.subber)) continue;

            const key = information.name + "###" + information.season;
            let entries = result[key] || [];
            entries.push({
              original_name: torrent.title,
              name: information.name,
              episode: information.episode,
              season: information.season,
              link: torrent.link,
              resolution: information.resolution.replaceAll("p", "")
            });

            entries = entries.sort((a, b) => -(Number.parseInt(a.resolution) - Number.parseInt(b.resolution)));

            result[key] = entries;
          }

          resolve(Object.entries(result));
        })
    })
  }
}
