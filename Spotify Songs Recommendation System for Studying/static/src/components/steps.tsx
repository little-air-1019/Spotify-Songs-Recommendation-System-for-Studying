import * as React from 'react';


interface StepsProps {
    children?: React.ReactNode | React.ReactNode[];
    params?: any;
}
export const Steps: React.FunctionComponent<StepsProps> = function (props: StepsProps): React.ReactElement {
    const [step, setStep] = React.useState(0);
    const [containerElement, setContainerElement] = React.useState<Element>(null);

    React.useEffect(() => {
        if (!containerElement) return;
        const width = containerElement.clientWidth;
        containerElement.scrollTo({
            behavior: 'smooth',
            left: (width + 16) * step
        });
    }, [containerElement, step]);

    const nextStep = React.useCallback(function () {
        setStep(step => step + 1);
    }, []);

    const prevStep = React.useCallback(function () {
        setStep(step => step - 1);
    }, []);

    const children = React.useMemo(() => {
        return [].concat(props.children)?.map((item, index) => (
            <StepItem
                key={index}
                setStep={setStep}
                nextStep={nextStep}
                prevStep={prevStep}
                isCurrent={() => index === step}
            >
                {item}
            </StepItem>
        ));
    }, [step]);

    return (
        <div className="step-container" ref={setContainerElement}>
            <div className="step-row">
                {children}
            </div>
        </div>
    );
}

interface StepItemContextValue {
    setStep(number: number): void;
    nextStep(): void;
    prevStep(): void;
    isCurrent(): boolean;
}
export const StepItemContext = React.createContext<StepItemContextValue>(null);

type StepItemProps = React.PropsWithChildren<StepItemContextValue>;
const StepItem: React.FunctionComponent<StepItemProps> = function (props: StepItemProps): React.ReactElement {
    const {children, ...contextValue} = props;

    return (
        <StepItemContext.Provider value={contextValue}>
            <div className="step-item">
                {props.children}
            </div>
        </StepItemContext.Provider>
    );
}
