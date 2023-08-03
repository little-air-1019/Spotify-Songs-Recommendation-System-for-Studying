import * as React from "react";

import { StepItemContext, Steps } from "./components/steps";
import { SearchBar } from "./components/search-bar";
import { SearchLoading } from "./components/loading";
import { Artist, PlayList, Track } from "./components/spotify";

import type { Artist as ArtistType, PlayList as PlayListType, Track as TrackType } from "./request";
import { appendToPlaylist, isLogin, queryArtists, queryPlayLists, queryTracks } from "./request";

export const Homepage: React.FunctionComponent = function () {
    const [isUsingApplication, setUsingApplicationState] = React.useState(false);
    return (
        <div className={"container" + (isUsingApplication ? " using-app" : "")}>
            <img src="/static/images/spotify-brand.svg" className="brand" alt="spotify brand" />
            <span className="content">
                <span className="title">輕鬆聽歌 輕鬆讀書</span>
                <App setFocusingState={setUsingApplicationState} />
                <span className="subtitle">在線歌曲篩選</span>
            </span>
        </div>
    );
};

interface AppContextProps {
    queryString: string;
    artists: ArtistType[];
    nextSearchArtistsOffset: number;
    searchArtistsTotal: number;
    selectedArtist: ArtistType;
    tracks: TrackType[];
    isQueryingTracks: boolean;
    playlists: PlayListType[];
}
const AppContext = React.createContext<AppContextProps>(null);

interface AppProps {
    isFocusing?: boolean;
    setFocusingState: (state: boolean) => void;
}
const App: React.FunctionComponent<AppProps> = function (props: AppProps) {

    const [queryString, setQueryString] = React.useState<string>("");
    const [artists, setArtists] = React.useState<ArtistType[]>([]);
    const [nextSearchArtistsOffset, setNextSearchArtistsOffset] = React.useState<number>(0);
    const [searchArtistsTotal, setSearchArtistsTotal] = React.useState<number>(NaN);

    const [selectedArtist, setSelectedArtist] = React.useState<ArtistType>(null);
    const [tracks, setTracks] = React.useState<TrackType[]>([]);
    const [isQueryingTracks, setQueryingTracksState] = React.useState<boolean>(false);
    const [playlists, setPlaylists] = React.useState<PlayListType[]>([]);

    function onSubmitHandler(_event: React.FormEvent, value: string) {
        if (!value) return;
        setQueryString(value);
    }

    function queryArtistTracks() {
        setQueryingTracksState(true);
        queryTracks(selectedArtist.id).then(function (tracks) {
            if (tracks) setTracks(tracks);
            setQueryingTracksState(false);
        });
    }

    function getPlaylists() {
        queryPlayLists().then(function (items) {
            if (items)
                setPlaylists(items);
        }).catch(function () {

        })
    }

    React.useEffect(function () {
        if (queryString) {
            props.setFocusingState(true);
            queryArtists(queryString).then(function (result) {
                if (!result) return;
                setArtists(result.artists);
                setNextSearchArtistsOffset(result.artists.length);
                setSearchArtistsTotal(result.total);
            });
        } else {
            props.setFocusingState(false);
        }
    }, [queryString]);

    return (
        <AppContext.Provider value={{
            queryString,
            artists,
            nextSearchArtistsOffset,
            searchArtistsTotal,
            selectedArtist,
            tracks,
            isQueryingTracks,
            playlists
        }}>
            <div className="application">
                <SearchBar onSubmit={onSubmitHandler} />
                <div className="application-body">
                    <Steps>
                        <QueryArtist
                            setArtists={setArtists}
                            setNextSearchArtistsOffset={setNextSearchArtistsOffset}
                            setSelectedArtist={setSelectedArtist}
                            setSearchArtistsTotal={setSearchArtistsTotal}
                        />
                        <CheckArtistSelected
                            queryArtistTracks={queryArtistTracks}
                        />
                        <QueryTracks
                            queryArtistTracks={queryArtistTracks}
                        />
                        <AddToPlaylist
                            getPlaylists={getPlaylists}
                        />
                    </Steps>
                </div>
            </div>
        </AppContext.Provider>
    );
};


interface StepOneProps {
    setArtists(callback: (artists: ArtistType[]) => ArtistType[]): unknown;
    setNextSearchArtistsOffset(callback: (offset: number) => number): unknown;
    setSelectedArtist(artist: ArtistType): unknown;
    setSearchArtistsTotal(total: number): unknown;
}
const QueryArtist: React.FunctionComponent<StepOneProps> = function (props: StepOneProps): React.ReactElement {

    const { nextStep, setStep } = React.useContext(StepItemContext);
    const { artists, queryString, nextSearchArtistsOffset, searchArtistsTotal } = React.useContext(AppContext);

    const [isFetching, setFetchingState] = React.useState<boolean>(false);
    const [loadingElement, setLoadingElement] = React.useState<HTMLElement>(null);
    const [containerElement, setContainerElement] = React.useState<HTMLElement>(null);

    function onScrollHandler(event: React.WheelEvent<HTMLDivElement>) {
        if (!loadingElement) return;
        if (isFetching) return;

        const { currentTarget: target } = event;

        if (target.scrollHeight - target.scrollTop < target.clientHeight + loadingElement.clientHeight) {
            setFetchingState(true);
            queryArtists(queryString, nextSearchArtistsOffset).then(function (result) {
                if (!result) return;
                props.setArtists(artists => [...artists, ...result.artists]);
                props.setNextSearchArtistsOffset(offset => offset + result.artists.length);
                props.setSearchArtistsTotal(result.artists.length == 10 ? result.total : 0);
                setFetchingState(false);
            });
        }
    }

    React.useEffect(function () {
        if (!containerElement) return;
        setStep(0);
        containerElement.scrollTo(0, 0);
    }, [queryString]);

    return (
        <div
            className="card-body"
            onScroll={onScrollHandler}
            ref={setContainerElement}
            style={{
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden"
            }}
        >
            <div className="artists">
                {
                    artists.map(function (artist) {

                        function onClickHandler() {
                            props.setSelectedArtist(artist);
                            nextStep();
                        }
                        return (
                            <Artist key={artist.id} artist={artist} onClick={onClickHandler} />
                        );
                    })
                }
            </div>
            {
                nextSearchArtistsOffset < searchArtistsTotal ? (
                    <div className="scroll-hint" ref={setLoadingElement}>
                        <SearchLoading />
                    </div>
                ) : (
                    <div className="scroll-hint">已拉至底部</div>
                )
            }
        </div>
    );
};

interface StepTwoProps {
    queryArtistTracks(): void;
}
const CheckArtistSelected: React.FunctionComponent<StepTwoProps> = function (props: StepTwoProps) {
    const { prevStep, nextStep } = React.useContext(StepItemContext);
    const { selectedArtist } = React.useContext(AppContext);

    function select() {
        nextStep();
        props.queryArtistTracks();
    }

    return selectedArtist ? (
        <>
            <div className="card-body">
                <button className="button button-icon" onClick={prevStep}>
                    <span className="left-arrow-icon" />
                </button>
                <div className="artist artist-details">
                    {
                        selectedArtist.images.length ? (
                            <img className="artist-image" src={selectedArtist.images[0].url} alt={selectedArtist.name} />
                        ) : (
                            <span className="artist-image"><span className="artist-icon" /></span>
                        )
                    }
                    <div className="artist-info">
                        <span className="artist-name">
                            {selectedArtist.name}
                        </span>
                        <a href={selectedArtist.external_urls.spotify} target="_blank" style={{ fontSize: ".8em" }}>
                            在 Spotify 中查看 <span className="external-link-icon" />
                        </a>
                        <span className="artist-tags">{selectedArtist.genres.join(", ")}</span>
                    </div>
                </div>
            </div>
            <div className="card-space"></div>
            <div className="card-footer">
                <span />
                <button type="button" className="button button-icon" aria-label="filtering tracks" onClick={select}>
                    <span className="play-icon" style={{ transform: "translateX(.1rem)" }} />
                </button>
                <span />
            </div>
        </>
    ) : (
        <></>
    );
};

interface StepThreeProps {
    queryArtistTracks(): void;
}
const QueryTracks: React.FunctionComponent<StepThreeProps> = function (props: StepThreeProps) {
    const { prevStep, nextStep } = React.useContext(StepItemContext);
    const { tracks, isQueryingTracks } = React.useContext(AppContext);

    return isQueryingTracks ? (
        <div className="card-body">
            <button className="button button-icon" onClick={prevStep}>
                <span className="left-arrow-icon" />
            </button>
            <div className="hint">這將會花費數分鐘…</div>
        </div>
    ) : tracks.length ? (
        <>
            <div className="card-body">
                <button className="button button-icon" onClick={prevStep}>
                    <span className="left-arrow-icon" />
                </button>
            </div>
            <div className="card-scroll">
                <div className="tracks">
                    {tracks.map(track => <Track track={track} key={track.id} />)}
                    <span className="scroll-hint">已拉至底部</span>
                </div>
            </div>
            <div className="card-space"></div>
            <div className="card-footer">
                <span />
                <button type="button" className="button button-icon" aria-label="filtering tracks" onClick={() => nextStep()}>
                    <span className="play-icon" style={{ transform: "translateX(.1rem)" }} />
                </button>
                <span />
            </div>
        </>
    ) : (
        <>
            <div className="card-body">
                <button className="button button-icon" onClick={prevStep}>
                    <span className="left-arrow-icon" />
                </button>
                <div className="hint">載入失敗，請重試。</div>
            </div>
            <div className="card-space"></div>
            <div className="card-footer">
                <span />
                <button type="button" className="button button-icon" aria-label="retry" onClick={() => props.queryArtistTracks()}>
                    <span className="retry-icon" />
                </button>
                <span />
            </div>
        </>
    );
}

interface StepFourProps {
    getPlaylists(): void;
}

const AddToPlaylist: React.FunctionComponent<StepFourProps> = function (props: StepFourProps): React.ReactElement {
    const { prevStep } = React.useContext(StepItemContext);
    const { playlists, tracks } = React.useContext(AppContext);

    React.useEffect(function () {
        if (isLogin() && playlists.length == 0) {
            props.getPlaylists();
        }
    }, []);

    return isLogin() ? (
        <>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center' }}>
                <button className="button button-icon" onClick={prevStep}>
                    <span className="left-arrow-icon" />
                </button>
                <span style={{ flexGrow: 1 }} />
                {/* <span style={{fontWeight: 300}}>重新取得播放列表</span> */}
                <button type="button" className="button button-icon" aria-label="retry" onClick={() => props.getPlaylists()}>
                    <span className="retry-icon" />
                </button>
            </div>
            <div className="card-scroll">
                <div className="tracks">
                    {
                        playlists.map(function (playlist) {

                            function onClickHandler() {
                                appendToPlaylist(playlist.id, tracks).then(
                                    () => alert('加入成功'),
                                    err => (console.log(err), alert('加入失敗'))
                                );
                            }
                            return (
                                <PlayList key={playlist.id} playlist={playlist} onClick={onClickHandler} />
                            );
                        })
                    }
                    <span className="scroll-hint">已拉至底部</span>
                </div>
            </div>
        </>
    ) : (
        <>
            <div className="card-body">
                <button className="button button-icon" onClick={prevStep}>
                    <span className="left-arrow-icon" />
                </button>
                <div className="hint">登入後取得播放列表</div>
            </div>
            <div className="card-footer">
                <span />
                <button type="button" className="button button-icon" aria-label="login" onClick={() => props.getPlaylists()} style={{ fontSize: '2rem' }}>
                    <span className="spotify-icon" />
                </button>
                <span />
            </div>
        </>
    );
};