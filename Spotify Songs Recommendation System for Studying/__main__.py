
# flask server
from flask import Flask, request, render_template, redirect

# spotify api
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
# when spotipy is unavailable
# import spotify

# send request
import requests

# model to filtering tracks
from filtering_study_list import tracks_to_dataframe, study_list_filter, get_all_tracks

# loading model
import joblib

# create a flask server app
app = Flask(__name__)

# load the model
# MODEL = XGBModel()
# MODEL.load_model("model.json")
MODEL = joblib.load("model.pkl")

# authorization certificate
CLIENT_ID = '8b2697e8f6ea4399bebd30c57a65c3c2'
# === ! CAUTION ! ===
# THIS CLIENT SECRET IS PROVIDED FOR STUDY ONLY.
# PLEASE DO NOT USE THIS SECRET TO DO ANYTHING
CLIENT_SECRET = '9cce8a36b6eb4cd680219f563cb912d9'
REDIRECT_URI = 'https://localhost:5000/'

# create spotify api object
AUTH = SpotifyClientCredentials(
    client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
SPOTIFY = spotipy.Spotify(auth_manager=AUTH, requests_timeout=5, retries=5,)
# when spotipy is unavailable
# SPOTIFY = spotify.Spotify(CLIENT_ID, CLIENT_SECRET)

@app.route('/', methods=['GET'])
def default():
    '''
    Showing user interface for webpage.
    '''

    if code := request.args.get('code'):
        # process the authorization code
        return redirect(f'/token/exchange/{exchange_token(code)["access_token"]}')
    else:
        return app.send_static_file('index.html')

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

@app.route('/query-artists')
def get_artist():
    '''
    Api: query artists

    List artists as selections for user to pickup.

    params:
    - q (required): query string for searching artists
    - offset (optional, default 0): skip artists equivalent to the specified offset
    '''

    # get search parameters
    query_string = request.args.get('q', '')
    offset = request.args.get('offset', 0)

    # if no query string is provided
    if not query_string:
        return {"error": "No Query String Provided."}, 401

    # use spotify search api to find artists
    response = SPOTIFY.search(
        q=query_string, type='artist', offset=offset, limit=10)['artists']

    return {
        'artists': response['items'],
        'total': response['total'],
        'offset': response['offset'],
        'limit': response['limit']
    }


@app.route('/artists/<artist_id>')
def get_tracks(artist_id):
    '''
    Api: List all track of artist

    params:
    - artist_id (required): get tracks from
    - filter (optional): 
      - `'all'` (default): show all track of artist;
      - `'study'`: show all track of artist which are suitable for listening when study.
    '''

    # get search parameters
    track_filter = request.args.get('filter', 'all')

    # get all tracks from artist
    tracks = get_all_tracks(SPOTIFY, artist_id)

    match track_filter:
        # show all tracks of artist
        case 'all': return list(tracks.values())
        # show all tracks suitable for listening
        case 'study': return study_list_filter(MODEL, tracks, tracks_to_dataframe(SPOTIFY, tracks))
        # default case: show all track of artist
        case _: return tracks.values()


def exchange_token(code):
    '''
    Exchange authorization code to client token

    params:
    - code (required): code needs to be exchanged
    '''
    try:
        
        res = requests.post(
            'https://accounts.spotify.com/api/token',
            {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET
            }
        )

        print(res.content)

        return res.json()

    except Exception as e:
        print(e)
        return {'error': str(e)}, 401


@app.route('/token/exchange', methods=['POST'])
def exchange_token_api():
    '''
    <UNUSED>
    Api: Exchange authorization code to client token

    params:
    - code (required): code needs to be exchanged
    '''

    if code := request.form.get('code'):
        return exchange_token(code)
    else:
        return {'error': 'code is required'}, 403
    
@app.route('/token/exchange/<token>', methods=['GET'])
def show_token(token):
    '''
    Api: Exchange authorization code to client token

    params:
    - token (required): store token to local storage
    '''

    return render_template('save-token.html', token=token)

@app.route('/token/refresh', methods=['POST'])
def refresh_token():
    '''
    Api: Refresh client token

    params:
    - token (required): token needs to be refreshed
    '''

    token = request.form.get('token')
    if token is None:
        return {'error': 'token is required'}, 403

    try:

        res = requests.post(
            'https://accounts.spotify.com/api/token',
            {
                'grant_type': 'refresh_token',
                'refresh_token': token,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET
            }
        )

        return res.json()

    except Exception as e:

        return {'error': str(e)}, 401


if __name__ == '__main__':
    app.run(host="0.0.0.0", ssl_context=('server.crt', 'server.key'))
