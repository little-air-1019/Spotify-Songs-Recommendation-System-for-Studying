import requests
from datetime import datetime, timedelta

def protect_request(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except:
            return None
    return wrapper


class Spotify:

    client_id: str
    client_secret: str
    ses: requests.Session

    _access_token: str
    token_will_expire_at: datetime

    def __init__(self, client_id: str, client_secret: str):
        self.ses = requests.Session()
        self.client_id = client_id
        self.client_secret = client_secret
        # set token expire time to 10 minutes ago to force refetch to get token.
        self.token_will_expire_at = datetime.now() - timedelta(seconds=3600)

    @property
    def token(self):
        # if token is expired then refetch the token.
        if datetime.now() > self.token_will_expire_at:
            self._access_token = self.get_token()
            self.token_will_expire_at = datetime.now() + timedelta(3600)
        return self._access_token

    def get_token(self):
        res: requests.Response = self.ses.request(**{
            'method': 'post',
            'url': 'https://accounts.spotify.com/api/token',
            'headers': {'content-type': 'application/x-www-form-urlencoded'},
            'data': {'grant_type': 'client_credentials', 'client_id': self.client_id, 'client_secret': self.client_secret}
        })

        token_object = res.json()
        return token_object['access_token']

    @protect_request
    def search(self, q: str, limit: int = 10, offset: int = 0, type: str = "track"):
        res: requests.Response = self.ses.request(**{
            'method': 'get',
            'url': 'https://api.spotify.com/v1/search',
            'params': {'q': q, 'limit': limit, 'offset': offset, 'type': type},
            'headers': {'authorization': f'Bearer {self.token}'}
        })

        return res.json()
    
    
    @protect_request
    def artist_albums(self, artist_id: str, limit: int = 20, offset: int = 0):
        res: requests.Response = self.ses.request(**{
            'method': 'get',
            'url': f'https://api.spotify.com/v1/artists/{artist_id}/albums',
            'params': {'limit': limit, 'offset': offset},
            'headers': {'authorization': f'Bearer {self.token}'}
        })

        return res.json()
    
    @protect_request
    def album_tracks(self, album_id: str, limit: int = 50, offset: int = 0):
        res: requests.Response = self.ses.request(**{
            'method': 'get',
            'url': f'https://api.spotify.com/v1/albums/{album_id}/tracks',
            'params': {'limit': limit, 'offset': offset},
            'headers': {'authorization': f'Bearer {self.token}'}
        })

        return res.json()

    @protect_request
    def audio_features(self, audio_id: str):
        res: requests.Response = self.ses.request(**{
            'method': 'get',
            'url': f'https://api.spotify.com/v1/audio-features/{audio_id}',
            'headers': {'authorization': f'Bearer {self.token}'}
        })

        print(res.text)

        return res.json()
