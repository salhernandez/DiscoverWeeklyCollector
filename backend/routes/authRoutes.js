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
        `user-library-modify
      user-library-read
      playlist-read-private
      playlist-modify-private`;

    console.log("=== BACKEND - LOGIN ===");

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
    console.log("=== BACKEND - REDIRECT ===");;
    let query;
    let trackUris = [];
    let songsAdded = [];

    const finish = (isSuccess) => {
        // Add query params for success and failure
        const status = isSuccess ? 'SUCCESS' : 'FAIL';
        console.log(`\n=== BACKEND - FINISHED WITH ~~${status}~~ ===`);
        res.redirect(`${process.env.CLIENT_REDIRECTURI}?status=${status}`);
    };

    const body = {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: process.env.REDIRECTURI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    }

    console.log("=== BACKEND - AUTHENTICATING WITH SPOTIFY ===");
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
        })
        .catch(e => {
            console.log(e);
            return finish(false);
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


        console.log("=== BACKEND - GET DISCOVER WEEKLY PLAYLIST ===");
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
                    let artistNames = [];
                    track.track.artists.forEach(({ name }) => artistNames.push(name))
                    songsAdded.push(`${artistNames.join(', ')} - ${track.track.name}`);
                });

            })
            .catch(e => {
                console.log(e);
                return finish(false);
            });

        console.log("=== BACKEND - ADD TRACKS TO DISCOVER WEEKLY AGGREGATOR ===");

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
            .then(() => {
                console.log("=== BACKEND - ADDED THE FOLLOWING SONGS TO THE PLAYLIST ===\n");
                console.log(songsAdded.join("\n"));
                return finish(true);
            })
            .catch(e => {
                console.log(e);
                overallStatus = false;
                return finish(false);
            });
    }
});

module.exports = router;