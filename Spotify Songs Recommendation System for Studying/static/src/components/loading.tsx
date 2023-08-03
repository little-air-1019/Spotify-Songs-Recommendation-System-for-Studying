import * as React from "react";

interface LoadingProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
    refFunction?: any
}
export const SearchLoading: React.FunctionComponent<LoadingProps> = function (props: LoadingProps): React.ReactElement {
    const {className, refFunction: referenceFunction, ...elementProps} = props;
    return (
        <span className={["loading search-loading", className].filter(Boolean).join(" ")} ref={referenceFunction} {...elementProps}>Loading...</span>
    );
};