# Spotify OAuth Setup (One-Time)

Get the three secrets needed for the weekly listening wall update.

## 1. Create a Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Click **Create App**
3. Name it anything (e.g. "Portfolio Listening Wall")
4. Set **Redirect URI** to `http://localhost:8888/callback`
5. Check **Web API**
6. Save and note your **Client ID** and **Client Secret**

## 2. Get an Authorization Code

Open this URL in your browser (replace `YOUR_CLIENT_ID`):

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-top-read
```

Log in and approve. You will be redirected to a URL like:

```
http://localhost:8888/callback?code=AQD...very_long_code
```

Copy the `code` parameter value.

## 3. Exchange for a Refresh Token

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d grant_type=authorization_code \
  -d code=YOUR_AUTHORIZATION_CODE \
  -d redirect_uri=http://localhost:8888/callback \
  -u YOUR_CLIENT_ID:YOUR_CLIENT_SECRET
```

The response JSON contains a `refresh_token`. This token does not expire (unless you revoke it).

## 4. Add Secrets to GitHub

Go to **Settings > Secrets and variables > Actions** in the `caidespries.github.io` repo.

Add three repository secrets:

| Secret Name              | Value               |
|--------------------------|---------------------|
| `SPOTIFY_CLIENT_ID`      | Your Client ID      |
| `SPOTIFY_CLIENT_SECRET`  | Your Client Secret  |
| `SPOTIFY_REFRESH_TOKEN`  | The refresh token   |

## 5. Test

Trigger the workflow manually:

```bash
gh workflow run update-listening.yml
```

Or run the script locally:

```bash
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
export SPOTIFY_REFRESH_TOKEN=...
node scripts/fetch-listening.mjs
```
