const { default: axios } = require("axios");
const express = require("express");
const cors = require("cors")
const { json } = require("express");
require("dotenv").config()
const app = express();

app.use(json());
app.use(cors());
app.listen(3333);

const header = { 'X-Riot-Token': process.env.LOL_KEY };

app.get('/', async (req, res) => {
    res.send("hi mundo");
})

app.get('/server-status', async (req, res) => {
    const r = await axios.get(`${process.env.LOL_URL}/lol/status/v4/platform-data`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => { res.status(e.response.status).json(e.response.data) });
    console.log(r.data)
    return r;
})

app.get('/summoner/me', async (req, res) => {
    const r = await axios.get(`${process.env.LOL_URL}/lol/summoner/v4/summoners/me`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => { res.status(e.response.status).json(e.response.data) });
    console.log(r);
    return r;
})

app.get('summoner/match', async (req, res) => {

    const activeInfo = await axios.get(`${process.env.LOL_URL}/lol/spectator/v4/active-games/by-summoner/${id}`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => res.status(e.response.status).json(e.response.data));

        return activeInfo.data;
})
app.get('/summoner/:summonerName', async (req, res) => {
    const { summonerName } = req.params;

    const summonerIdResponse = await axios
        .get(`${process.env.LOL_URL}/lol/summoner/v4/summoners/by-name/${summonerName}`, { headers: header })
        .catch(e => res.status(e.response.status).json(e.response.data));

    const { id, profileIconId, accountId, summonerLevel } = summonerIdResponse.data;

    const responseRanked = await axios
        .get(`${process.env.LOL_URL}/lol/league/v4/entries/by-summoner/${id}`,
            { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => res.status(e.response.status).json(e.response.data));

    const masteryInfo = await axios.get(`${process.env.LOL_URL}/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => res.status(e.response.status).json(e.response.data));


    const scoresInfo = await axios.get(`${process.env.LOL_URL}/lol/champion-mastery/v4/scores/by-summoner/${id}`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => res.status(e.response.status).json(e.response.data));

    const matchesInfo = await axios.get(`${process.env.LOL_URL}/lol/match/v4/matchlists/by-account/${accountId}`,
        { headers: { 'X-Riot-Token': process.env.LOL_KEY } })
        .catch(e => res.status(e.response.status).json(e.response.data));

    const data = {
        rankeds: responseRanked.data.map(r => (
        {
            nick: r.summonerName, type: r.queueType, tier: r.tier + ' ' + r.rank, wins: r.wins,
            loses: r.losses, pdl: r.leaguePoints, icon: `${process.env.LOL_ICONS}/${profileIconId}.png`
        })),
        mastery: masteryInfo.data,
        scores: scoresInfo.data,
        matches: matchesInfo.data,
    };

    return res.json(data);
});

global.console.log("> Running in http://localhost:3333/")