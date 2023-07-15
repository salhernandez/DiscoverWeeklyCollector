# DiscoverWeeklyCollector
This project was based on https://ahmetomer.net/spotify-api-authorization-in-nodejs/

## Why did I make this?
I don't always listen to my `Discover Weekly Playlist` and it resets every week with new tracks. I wanted to create a way to archive the songs so I could go back to listen to them in the future. That's when I had the idea to stitch this project together.

## How Does it work and what does it do?
1. It creates a `frontend` server that listens for
   1. `GET` request at the root. i.e. `http://localhost:3000/`
   2. This is essentially a dummy page so that the process can finish *properly*
2. It creates a `backend` server that listes for
   1. `GET` request on `http://localhost:8888/api/login`
      1. When the page loads it will `redirect` the browser to an authorization page for Spotify.
   2. `GET` request on `http://localhost:8888/api/logged`
      1. After the user get's authenticated and accepts the app, this is where the browser redirects us to.
      2. When the page loads it will programatically reach out to spotify and get an `access_token` which it will then use to
         1. Get the tracks from the `Discover Weekly Playlist` and
         2. Add them to the `Discover Weekly Playlist Aggregator`
3. It runs puppeteer in headless mode
   1. Opens a web browser and navigates to `http://localhost:8888/api/login`
   2. When the Authorization Page from Spotify loads, it enters the user's credentials and clicks `Submit`
   3. It then waits until the browser navigates to a new url (`http://localhost:3000/`)
      1. `http://localhost:8888/api/logged` counts as a browser redirect, not as a new url
4. By the time `http://localhost:3000/` is loaded, all of the logic has been executed and since puppeteer exits successfully with code 0, it kills the rest of the servers (`frontend`, and `backend`) because of `--kill-others --success last` in `concurrently \"npm:start:frontend\" \"npm:start:backend\" \"npm:start:puppeteer\" --kill-others --success last`

## ENVIRONMENT VARIABLE SAMPLE FILE
necessary environment variables for `.env` file
```
# FRONTEND
FRONTEND_PORT=3000

# BACKEND
BACKEND_PORT=8888
CLIENT_ID=
CLIENT_SECRET=
REDIRECTURI="http://localhost:8888/api/logged"
CLIENT_REDIRECTURI="http://localhost:3000/"
DISCOVER_WEEKLY_PLAYLIST_ID=
DISCOVER_WEEKLY_AGGREGATOR_PLAYLIST_ID=

# PUPPETEER
SPOTIFY_USERNAME=
SPOTIFY_PASSWORD=
```

## SETUP 
1. Clone repository
2. Install and use `Node v18.16.1`
3. Run `npm install`
4. At the root of the repository create a file called `.env`. Use the one in [ENVIRONMENT VARIABLE SAMPLE FILE](#ENVIRONMENT-VARIABLE-SAMPLE-FILE) 
5. Register a Spotify App and get a token by following the Spotify App instructions from https://ahmetomer.net/spotify-api-authorization-in-nodejs/ 
   1. MAKE SURE TO ADD THE CORRECT REDIRTECT URL TO THE SPOTIFY APP! (`http://localhost:8888/api/logged`)
   2. You will get `CLIENT_ID` and `CLIENT_SECRET` from this step
6. Go to the spotify player and crete a new playlist called `DISCOVER WEEKLY AGGREGATOR` or something like that.
7. Get the link to the playlist by clicking on the `Ellipsis->Share->Copy link to playlist`.
   1. You should now have a URL that looks like this `https://open.spotify.com/playlist/5EIjIqnxsxQrlms9XSWhEs?si=0025a51a60fa427b`
   2. The playlist id is what comes immediataly after `playlist/` in this case it is `5EIjIqnxsxQrlms9XSWhEs`
8. REPLACE `DISCOVER_WEEKLY_AGGREGATOR_PLAYLIST_ID` with your playlist id (i.e. `5EIjIqnxsxQrlms9XSWhEs`)
9. Get the playlist id of your `Discover Weekly Playlist` or whatever playlist you want to copy the songs from
   1. REPLACE `DISCOVER_WEEKLY_PLAYLIST_ID` with your playlist id (i.e. `12344UIEYJHhu123`)
10. Update `SPOTIFY_USERNAME` and `SPOTIFY_PASSWORD` acordingly.
11. The app is ready!

## RUN IT
1. Run `npm run aggregator`
   1. This will run `"npm:start:frontend" "npm:start:backend" "npm:start:puppeteer"` concurrently and will exit when it's done
2. Your playlist should now be updated!

Example output
```
> discoverweeklycollector@1.0.0 aggregator
> concurrently "npm:start:frontend" "npm:start:backend" "npm:start:puppeteer" --kill-others --success last

[start:puppeteer]
[start:puppeteer] > discoverweeklycollector@1.0.0 start:puppeteer
[start:puppeteer] > node puppeteer/index.js
[start:puppeteer]
[start:backend]
[start:backend] > discoverweeklycollector@1.0.0 start:backend
[start:backend] > node backend/index.js
[start:backend]
[start:frontend]
[start:frontend] > discoverweeklycollector@1.0.0 start:frontend
[start:frontend] > node frontend/index.js
[start:frontend]
[start:frontend] Frontend server started on port 3000
[start:backend] Backend server started on port 8888
[start:puppeteer] === START PUPPETEER ===
[start:puppeteer]
[start:puppeteer]   Puppeteer old Headless deprecation warning:
[start:puppeteer]     In the near feature `headless: true` will default to the new Headless mode
[start:puppeteer]     for Chrome instead of the old Headless implementation. For more
[start:puppeteer]     information, please see https://developer.chrome.com/articles/new-headless/.
[start:puppeteer]     Consider opting in early by passing `headless: "new"` to `puppeteer.launch()`
[start:puppeteer]     If you encounter any bugs, please report them to https://github.com/puppeteer/puppeteer/issues/new/choose.
[start:puppeteer]
[start:backend] === BACKEND - LOGIN ===
[start:backend] === BACKEND - REDIRECT ===
[start:backend] === BACKEND - AUTHENTICATING WITH SPOTIFY ===
[start:backend] === BACKEND - GET DISCOVER WEEKLY PLAYLIST ===
[start:backend] === BACKEND - ADD TRACKS TO DISCOVER WEEKLY AGGREGATOR ===
[start:backend] === BACKEND - ADDED THE FOLLOWING SONGS TO THE PLAYLIST ===
[start:backend]
[start:backend] Daft Punk, Julian Casablancas, The Voidz - Infinity Repeating (2013 Demo) [feat. Julian Casablancas+The Voidz]
[start:backend] Daft Punk - One More Time
[start:backend] Daft Punk, Pharrell Williams, Nile Rodgers - Get Lucky (feat. Pharrell Williams and Nile Rodgers)
[start:backend] Daft Punk - Around the World
[start:backend] Daft Punk, Todd Edwards - The Writing of Fragments of Time (feat. Todd Edwards)
[start:backend] Daft Punk, Todd Edwards - Fragments of Time (feat. Todd Edwards)
[start:backend] Daft Punk - Harder, Better, Faster, Stronger
[start:backend] Daft Punk, Pharrell Williams - Lose Yourself to Dance (feat. Pharrell Williams)
[start:backend] Daft Punk - Something About Us
[start:backend] Daft Punk - GLBTM (Studio Outtakes)
[start:backend] Daft Punk - Give Life Back to Music
[start:backend] Daft Punk, Julian Casablancas - Instant Crush (feat. Julian Casablancas)
[start:backend] The Weeknd, Daft Punk - I Feel It Coming
[start:backend] Daft Punk, Panda Bear - Doin' it Right (feat. Panda Bear)
[start:backend] Daft Punk - Veridis Quo
[start:backend] Daft Punk - Giorgio by Moroder
[start:backend] Daft Punk - Da Funk
[start:backend] Daft Punk, Paul Williams - Touch (feat. Paul Williams)
[start:backend] Daft Punk - End of Line
[start:backend] Daft Punk - Digital Love
[start:backend] Daft Punk - The Game of Love
[start:backend] Daft Punk - Revolution 909
[start:backend] Daft Punk - Technologic
[start:backend] Daft Punk - Burnin'
[start:backend] The Weeknd, Daft Punk - Starboy
[start:backend] Daft Punk - Fresh
[start:backend] Daft Punk - Robot Rock
[start:backend] Daft Punk - Teachers
[start:backend] Daft Punk - Voyager
[start:backend] Daft Punk - Rollin' & Scratchin'
[start:backend] Daft Punk - Human After All
[start:backend] Daft Punk, Ian Pooley - Burnin' - Ian Pooley Cut up Mix
[start:backend] Daft Punk - Derezzed
[start:backend] Daft Punk - Aerodynamic
[start:backend] Daft Punk - Make Love
[start:backend] Daft Punk - Face to Face
[start:backend] Daft Punk - The Prime Time of Your Life
[start:backend] Daft Punk - High Life
[start:backend] Daft Punk - Television Rules the Nation
[start:backend] Daft Punk - The Son of Flynn
[start:backend] Daft Punk, DJ Sneak - Burnin' - DJ Sneak Main Mix
[start:backend] Daft Punk - Face to Face
[start:backend] Daft Punk, Masters At Work - Around the World - Kenlou Mix
[start:backend]
[start:backend] === BACKEND - FINISHED WITH ~~SUCCESS~~ ===
[start:frontend] === FRONTEND - SUCCESS ===
[start:puppeteer] === END PUPPETEER ===
[start:puppeteer] npm run start:puppeteer exited with code 0
--> Sending SIGTERM to other processes..
[start:frontend] npm run start:frontend exited with code 1
--> Sending SIGTERM to other processes..
[start:backend] npm run start:backend exited with code 1
```