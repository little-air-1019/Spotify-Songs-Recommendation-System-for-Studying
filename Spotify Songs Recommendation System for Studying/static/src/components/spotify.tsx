import * as React from "react";
import type { Artist as ArtistType, PlayList as PlayListType, Track as TrackType } from "../request";

interface ArtistProps {
    artist: ArtistType;
    onClick(): void;
}
export const Artist: React.FunctionComponent<ArtistProps> = function (props: ArtistProps): React.ReactElement {
    const { artist, onClick: onClickHandler } = props;

    return (
        <div className="artist" key={artist.id}>
            {
                artist.images.length ? (
                    <img className="artist-image" src={artist.images[0].url} alt={artist.name} />
                ) : (
                    <span className="artist-image"><span className="artist-icon" /></span>
                )
            }
            <div className="artist-info">
                <span className="artist-name">
                    <a href={artist.external_urls.spotify} target="_blank">
                        {artist.name} <span className="external-link-icon" />
                    </a>
                </span>
                <span className="artist-tags">{artist.genres.join(" ")}</span>
            </div>
            <button className="select-artist" type="button" aria-label="select" onClick={onClickHandler}>
                <span className="play-icon" />
            </button>
        </div>
    );
};

interface TrackProps {
    track: TrackType;
}
export const Track: React.FunctionComponent<TrackProps> = function (props: TrackProps): React.ReactElement {
    const { track } = props;

    const [isPlaying, setPlayingState] = React.useState<boolean>(false);
    const audio = React.useMemo(function () {
        if (track.preview_url)
            return new Audio(track.preview_url);
        return null;
    }, [track]);

    function onClickHandler() {
        if (isPlaying) {
            setPlayingState(false);
            audio.pause();
        } else {
            setPlayingState(true);
            audio.play();
        }
    }

    React.useEffect(function () {
        if (!audio) return;

        audio.addEventListener('ended', function () {
            setPlayingState(false);
        });
    }, [audio]);


    return (
        <div className="track">
            <button className="play-track" type="button" aria-label="select" onClick={onClickHandler}>
                {track.album.images.length ? <img src={track.album.images[0].url} alt={track.album.name} /> : null}
                {
                    !audio ? (
                        <span className="ban-icon" />
                    ) : isPlaying ? (
                        <span className="pause-icon" />
                    ) : (
                        <span className="play-icon" style={{ transform: "translateX(.1rem)" }} />
                    )
                }
            </button>
            <div className="track-info">
                <span className="track-artist">{track.artists.map(artist => artist.name).join(" ")}</span>
                <span className="track-name">
                    <a href={track.external_urls.spotify} target="_blank">
                        {track.name} <span className="external-link-icon" />
                    </a>
                </span>
                <span className="track-album">{track.album.name}</span>
            </div>
        </div>
    );
};

interface PlayListProps {
    playlist: PlayListType;
    onClick(): unknown;
}
export const PlayList: React.FunctionComponent<PlayListProps> = function (props: PlayListProps): React.ReactElement {
    const { playlist, onClick: onClickHandler } = props;

    return (
        <div className="playlist" key={playlist.id}>
            {
                playlist.images.length ? (
                    <img className="playlist-image" src={playlist.images[0].url} alt={playlist.name} />
                ) : (
                    <span className="playlist-image"><span className="playlist-icon" /></span>
                )
            }
            <div className="playlist-info">
                <span className="playlist-name">
                    {playlist.name}
                </span>
                <a href={playlist.external_urls.spotify} target="_blank" style={{ fontSize: ".8em" }}>
                    在 Spotify 中查看 <span className="external-link-icon" />
                </a>
            </div>
            <button className="select-playlist" type="button" aria-label="select" onClick={onClickHandler}>
                <span className="play-icon" />
            </button>
        </div>
    );
};