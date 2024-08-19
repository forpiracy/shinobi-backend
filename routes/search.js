const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
// const fs = require('fs');

const router = express.Router();
router.use(cors());
router.use(express.json());

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";


function wordSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().match(/\b(\w+)\b/g) || [];
    const words2 = str2.toLowerCase().match(/\b(\w+)\b/g) || [];
    // console.log(words1, " ", words2);
    const intersection = words1.filter(word => words2.includes(word)).length;
    const totalWords = new Set([...words1, ...words2]).size;
  
    // Return the similarity as a ratio of matching words to total unique words
    return intersection / totalWords;
}

const findId = (searchResults, animeTitle, episodes, format) => {
    if(searchResults.length==0){
        console.error(`searchResults extracted from html is empty for animeTitle: "${animeTitle}"`);
        return '-1';
    }

    const filteredAnimes = [];
    searchResults.forEach(anime => {
        if(anime.sub==episodes && anime.format==format){
            const matchPercentage = wordSimilarity(animeTitle, anime.japaneseTitle);
            filteredAnimes.push({matchPercentage: matchPercentage, id: anime.id});
        }
    });
    // console.log(filteredAnimes);
    
    if(filteredAnimes.length==0){
        console.error(`In searchResults extracted from html, no match found for animeTitle: "${animeTitle}"`);
        return '-1';
    }
    
    filteredAnimes.sort((a, b) => b.matchPercentage - a.matchPercentage);
    // console.log(filteredAnimes);
    return filteredAnimes[0].id;
}

router.post('/search', async (req, res) => {
    // console.time();

    // console.log(req.body);
    const {animeTitle, leftYear, rightYear, episodes, format} = req.body;
    const animeTitleParts = animeTitle.split(' ');
    let animeTitleHalf = animeTitle;
    if(animeTitleParts.length>1){
        const half = Math.ceil(animeTitleParts.length/2);
        animeTitleParts.splice(-half, half);
        animeTitleHalf = animeTitleParts.join(' ');
    }
    // console.log(animeTitleHalf);
    const url = `https://hianime.to/search?keyword=${animeTitleHalf}&sy=${leftYear}&ey=${rightYear}`;

    try {
        console.log(`Fetching animes for animeTitle: "${animeTitle}"`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENT,
            }
        });

        const html = response.data;
        // fs.writeFileSync('output.html', html);
        const $ = cheerio.load(html);
        const searchResults = [];

        $('.flw-item').each((index, element) => {
            const title = $(element).find('.dynamic-name').text();
            const japaneseTitle = $(element).find('.dynamic-name').attr('data-jname');
            const format = $(element).find('.fdi-item:first').text();
            const duration = $(element).find('.fdi-item:eq(1)').text();
            const id = $(element).find('.film-poster-ahref').attr('data-id');
            const sub = $(element).find('.tick-sub').text();
            const dub = $(element).find('.tick-dub').text() || 0;
            const totalEpisodes = $(element).find('.tick-eps').text() || false;

            searchResults.push({ title, japaneseTitle, format, duration, id, sub, dub, totalEpisodes });
        })
        // console.log(searchResults);

        const animeId = findId(searchResults, animeTitle, episodes, format);

        if(animeId=='-1'){
            return res.status(404).json(`Failed to fetch searchResults for animeTitle: "${animeTitle}"`);
        }

        res.json({animeId});

    } catch (error) {
        res.status(404).json(`Failed to fetch searchResults for animeTitle: "${animeTitle}"`);
        console.error(`Failed to fetch searchResults for animeTitle: "${animeTitle}"`);
        console.log(error);
    }

    // console.timeEnd();
})

module.exports = router;