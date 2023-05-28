const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const querystring = require('querystring');

// this can be used as a seperate module
const encodeFormData = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

router.get('/login', async (req, res) => {
    const scope =
        `user-modify-playback-state
      user-read-playback-state
      user-read-currently-playing
      user-library-modify
      user-library-read
      user-top-read
      playlist-read-private
      playlist-modify-public
      playlist-modify-private`;

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECTURI
        })
    );
});

router.get('/logged', async (req, res) => {

    let query;
    let trackUris = [];
    const body = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: process.env.REDIRECTURI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    }

    await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        body: encodeFormData(body)
    })
        .then(response => response.json())
        .then(data => {
            query = querystring.stringify(data);
            res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`);
        });

    if (query) {
        const getHashParams = (uriStuff) => {
            const hashParams = {};
            let e,
                r = /([^&;=]+)=?([^&;]*)/g,
                q = uriStuff;

            while (e = r.exec(q)) {
                hashParams[e[1]] = decodeURIComponent(e[2]);
            }

            return hashParams;
        }

        const params = getHashParams(query);

        // * Get Playlist tracks from "Discover Weekly" playlist
        await fetch(`https://api.spotify.com/v1/playlists/${process.env.DISCOVER_WEEKLY_PLAYLIST_ID}/tracks`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${params.access_token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const tracks = data.items

                tracks.forEach(track => {
                    trackUris.push(track.track.uri);
                });
            });

        console.log(trackUris.toString())

        // * Add tracks to "Discover Weekly Aggregator"
        // ! Use a test playlist in the future!
        await fetch(`https://api.spotify.com/v1/playlists/${process.env.DISCOVER_WEEKLY_AGGREGATOR_PLAYLIST_ID}/tracks`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${params.access_token}`,
                "Content-Type": "application/json",
            },
            body: (JSON.stringify({
                uris: trackUris,
                position: 0
            }))
        })
            .then(response => response.json())
            .then(data => {
                console.log("result from updating album!", data)
            });
    }
});

module.exports = router;