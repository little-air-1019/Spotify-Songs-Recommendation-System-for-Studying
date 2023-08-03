import * as React from "react";

interface SearchBarProps {
    onSubmit?: (event?: React.FormEvent, value?: string) => unknown;
}
export const SearchBar: React.FunctionComponent<SearchBarProps> = function (props: SearchBarProps) {

    const [inputElement, setInputElement] = React.useState<HTMLInputElement>(null);

    function onSubmitHandler(event: React.FormEvent) {
        event.preventDefault();
        if (props.onSubmit) props.onSubmit(event, inputElement.value.trim());
    }

    return (
        <form className="search-bar" onSubmit={onSubmitHandler}>
            <input type="text" className="search-input" placeholder="輸入你感興趣的歌手" ref={setInputElement} />
            <button className="search-button" aria-label="search" type="submit"><span className="search-icon" /></button>
        </form>
    );
};