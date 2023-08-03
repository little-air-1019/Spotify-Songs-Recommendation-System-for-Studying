import pandas as pd
from spotify import Spotify
from asyncio import run, as_completed, to_thread

COLUMNS = 'track', 'track_id', 'artist', 'album', 'year'
FEATURES_COLUMNS = 'acousticness', 'danceability', 'energy','key','loudness','mode', 'speechiness', 'instrumentalness', 'liveness','valence','tempo','duration_ms','time_signature'

async def _get_track_features(spotify: Spotify, track: dict) -> dict | None:
    
    features = {}

    # columns that can use track item values
    features['track_id'] = track['id']
    features['track'] = ''
    features['artist'] = ''
    features['album'] = ''
    features['year'] = 0

    # colums need use audio features values
    if audio_features_list := await to_thread(spotify.audio_features, track['id']):
        audio_features = audio_features_list[0]
        for feature in FEATURES_COLUMNS:
            features[feature] = audio_features[feature]
    else:
        return None

    return features

async def _tracks_to_dataframe(spotify: Spotify, tracks: dict[str, dict]) -> pd.DataFrame:
    info = pd.DataFrame(columns=COLUMNS + FEATURES_COLUMNS)

    for result in as_completed([
        _get_track_features(spotify, track)
        for track in tracks.values()
    ]):
        try:
            features = await result
            if not features:
                continue
            
            track_df = pd.DataFrame(features, index=[0])
            info = pd.concat([info, track_df], ignore_index=True)
        except Exception as e:
            print(e)
    
    info.drop_duplicates(['track'])
    return info
    
def tracks_to_dataframe(spotify: Spotify, tracks: dict[str, dict]):
    '''
    Gather the tracks' information and setup the dataframe.

    Parmas:
    - spotify: A Spotify api model to requst.
    - tracks: The tracks need to get info.
    '''
    return run(_tracks_to_dataframe(spotify, tracks))
