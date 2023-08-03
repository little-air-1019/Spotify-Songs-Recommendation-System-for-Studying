import axios, { AxiosResponse } from "axios";

const clientId = '8b2697e8f6ea4399bebd30c57a65c3c2';

const token = new class {

    token: string;
    userId: string;
    timestampWillTokenExpire: number;

    constructor() {
        const dataText = localStorage.getItem('data');
        if (!dataText) return;

        const data = JSON.parse(dataText);

        this.userId = data.userId;
        this.token = data.token;
        this.timestampWillTokenExpire = data.timestampWillTokenExpire;
    }

    async get(): Promise<string> {
        if (this.token && Date.now() > this.timestampWillTokenExpire) {
            await this.refresh();
        }

        if (!this.token) {
            await this.getAuthToken().then(token => {
                this.token = token;
                // Token will be expired after 1 hour, but set the expiration 1 minute earlier to prevent any invalidation errors.
                this.timestampWillTokenExpire = Date.now() + 3540e3;
            });
        }

        localStorage.setItem('data', JSON.stringify({
            userId: this.userId,
            token: this.token,
            timestampWillTokenExpire: this.timestampWillTokenExpire
        }))
        return this.token;
    }

    getAuthToken(): Promise<string> {
        const popupWidth = 400;
        const popupHeight = 600;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;

        return new Promise(function (resolve, reject) {
            const redirectUri = `${document.location.origin}/`;
            const scope = 'user-library-read playlist-read-private playlist-modify-private playlist-modify-public';

            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

            const popup = window.open(
                authUrl,
                'Spotify Login',
                `width=${popupWidth}, height=${popupHeight}, left=${left}, top=${top}`
            );

            const interval = setInterval(function () {
                const token = localStorage.getItem('token');
                if (!token) {
                    if (popup.closed)
                        reject();

                    return;
                };

                resolve(token);

                clearInterval(interval);
                popup.close();
            }, 1000);
        });
    }

    refresh(): Promise<void> {
        return axios.post(
            '/token/refresh',
            { data: { token: this.token } }
        ).then(
            res => {
                this.token = res.data.access_token;
                // Token will be expired after 1 hour, but set the expiration 1 minute earlier to prevent any invalidation errors.
                this.timestampWillTokenExpire = Date.now() + 3540e3;
            },
            err => console.error(err)
        );
    }

    isValid(): boolean {
        return this.token && Date.now() < this.timestampWillTokenExpire;
    }
}

export interface Artist {
    external_urls: {
        spotify: string;
    },

    followers: {
        total: number;
    },

    images: Image[],
    genres: string[];
    name: string;
    id: string;
}

interface Image {
    height: number;
    width: number;
    url: string;
}

interface QueryArtistResult {
    artists: Artist[];
    limit: number;
    offset: number;
    total: number;
}

interface Album {
    artists: Artist[];
    images: Image[];
    name: string;
}

export interface Track {
    external_urls: {
        spotify: string;
    },

    id: string;
    name: string;
    preview_url: string;
    artists: Artist[];
    album: Album;
    uri: string;
}

interface QueryTrackResult extends Array<Track> { };

export interface PlayList {
    external_urls: {
        spotify: string;
    },

    id: string;
    images: Image[];
    name: string;
}

interface PlayListResult {
    items: PlayList[];
    limit: number;
    offset: number;
    total: 1;
}

export function queryArtists(quertString: string, offset?: number): Promise<QueryArtistResult | void> {
    return axios.get("/query-artists", {
        params: {
            q: quertString,
            offset: offset ?? 0
        }
    }).then(
        res => res.data,
        err => console.error(err)
    );
}

export function queryTracks(artistId: string): Promise<QueryTrackResult | void> {
    return axios.get(`/artists/${artistId}`, {
        params: {
            filter: 'study'
        }
    }).then(
        res => res.data,
        err => console.error(err)
    );
}

export async function queryPlayLists(offset?: number): Promise<PlayList[] | void> {

    const userRes = await axios.get(
        'https://api.spotify.com/v1/me',
        { headers: { 'authorization': `Bearer ${await token.get()}` } }
    )
    const user = userRes.data;

    const playlistRes: AxiosResponse<PlayListResult> = await axios.get(
        `https://api.spotify.com/v1/users/${user.id}/playlists`,
        { headers: { 'authorization': `Bearer ${await token.get()}` } }
    );

    return playlistRes.data.items;
}

export async function appendToPlaylist(playlistId: string, tracks: Track[]): Promise<PlayList[] | void> {

    return axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: tracks.map(track => track.uri) },
        { headers: { 'authorization': `Bearer ${await token.get()}` } }
    );
}

export function isLogin() {
    return token.isValid();
}