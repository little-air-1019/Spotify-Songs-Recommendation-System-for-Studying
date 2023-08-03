import itertools
import functools
from spotify import Spotify
from asyncio import run, to_thread, gather

def _get_all_albums(spotify: Spotify, artist_id: str):

    albums = []
    for offset in itertools.count(0, 50):
        print('get albums, offest:', offset)
        response = spotify.artist_albums(artist_id, limit=50, offset=offset)
        albums.extend(response['items'])
        if not response['next'] or offset > response['total']:
            break

        # To make developing more easily, uncomment the line below. 
        break

    return albums


async def _get_all_tracks(spotify: Spotify, artist_id: str):
    tracks = {}

    await gather(*[
        _get_album_tracks(spotify, album, tracks)
        for album in _get_all_albums(spotify, artist_id)
    ])
        
    return tracks


async def _get_album_tracks(spotify: Spotify, album: dict, tracks: dict):

    for offset in itertools.count(0, 50):
        try:
            # Put the request waiting task to other threads
            response = await to_thread(spotify.album_tracks, album["id"], limit=50)
            for item in response['items']:
                
                # if the track dosen't be fetched
                if item['id'] not in tracks:
                    item["album"] = album
                    tracks.setdefault(item['id'], item)
            
            print('get tracks, count:', len(tracks))
            if not response['next'] or offset > response['total']:
                break
        except:
            pass

@functools.cache
def get_all_tracks(spotify: Spotify, artist_id: str):
    '''
    Get all tracks of a given artist id.

    Parmas:
    - spotify: A Spotify api model to requst.
    - artist_id: The artist to get tracks.
    '''

    # wait the async-function and return its results
    return run(_get_all_tracks(spotify, artist_id))
