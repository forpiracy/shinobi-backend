const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const router = express.Router();
router.use(cors());

const USER_AGENT ="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";
const ACCEPT_ENCODING_HEADER = "gzip, deflate, br";


router.get('/serversList/:id', async ( req, res )=>{
    // console.time();

    const episodeId = req.params.id;
    const url = `https://hianime.to/ajax/v2/episode/servers?episodeId=${episodeId}`;

    try {
        console.log(`Fetching serversList for episodeId: ${episodeId}`);

        const response = await axios.get(url, {
            headers:{
                'User-Agent': USER_AGENT,
                "Accept-Encoding": ACCEPT_ENCODING_HEADER,
            }
        })
        // console.log(response);

        const html = response?.data?.html;
        const $ = cheerio.load(html);

        const serversListSub = [];
        const serversListDub = [];

        $('.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item').each(function( index, element){
            const serverName = $(element).find('a').text().toLowerCase().trim();
            const serverId = $(element)?.attr('data-server-id')?.trim();
            const srcId = $(element)?.attr('data-id')?.trim();

            serversListSub.push({ serverName, serverId, srcId});
        })

        // $('.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item').each(function( index, element){
        //     const serverName = $(element).find('a').text().toLowerCase().trim();
        //     const serverId = $(element)?.attr('data-server-id')?.trim();
        //     const srcId = $(element)?.attr('data-id')?.trim();

        //     serversListDub.push({ serverName, serverId, srcId});
        // })

        // console.log(serversListSub);
        // console.log(serversListDub);

        if(serversListSub.length==0){
            console.log(`serversListSub extracted from html is empty for episodeId: ${episodeId}`);
            return res.status(404).json(`Failed to fetch serversList for episodeId: ${episodeId}`);
        }
        
        res.json({ serversListSub });
        
    } catch (error) {
        res.status(404).json(`Failed to fetch serversList for episodeId: ${episodeId}`);
        console.log(`Failed to fetch serversList for episodeId: ${episodeId}`);
        console.log(error);
    }

    // console.timeEnd();
})

module.exports = router;
