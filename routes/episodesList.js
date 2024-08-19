const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const router = express.Router();
router.use(cors());

const USER_AGENT ="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";
const ACCEPT_ENCODING_HEADER = "gzip, deflate, br";


router.get('/episodesList/:id', async ( req, res)=>{
    // console.time();

    const animeId = req.params.id;
    const url = `https://hianime.to/ajax/v2/episode/list/${animeId}`;

    try {
        console.log(`Fetching episodesList for animeId: ${animeId}`);

        const response = await axios.get(url, {
            headers:{
                'User-Agent': USER_AGENT,
                "Accept-Encoding": ACCEPT_ENCODING_HEADER,
            }
        });
        // console.log(response);

        const html = response?.data?.html;
        const $ = cheerio.load(html);
    
        const episodesList = [];
    
        $('.ss-list .ssl-item.ep-item').each(function(index, element) {
            // const name = $(element).find('.e-dynamic-name').text().trim();
            const number = $(element).find('.ssli-order').text().trim();
            const id = $(element).attr('href').split('/watch/')[1];
        
            episodesList.push({
                number,
                id,
            });
        });
        // console.log(episodesList);

        if(episodesList.length==0){
            console.log(`episodesList extracted from html is empty for animeId: ${animeId}`);
            return res.status(404).json(`Failed to fetch episodesList for animeId: ${animeId}`);
        }
    
        res.json(episodesList);
    
    } catch (error) {
        res.status(404).json(`Failed to fetch episodesList for animeId: ${animeId}`);
        console.log(`Failed to fetch episodesList for animeId: ${animeId}`);
        console.log(error);
    }

    // console.timeEnd();
})

module.exports = router;