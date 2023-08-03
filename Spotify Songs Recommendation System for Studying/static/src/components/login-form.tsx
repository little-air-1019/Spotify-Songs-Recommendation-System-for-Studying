import * as React from 'react';
import { Link } from 'react-router-dom';

import axios, { AxiosError } from 'axios';

import { StepItemContext, Steps } from '../components/steps';

export const LoginForm: React.FunctionComponent = function () {

    const [username, setUsername] = React.useState<string>(null);
    const [image, setImage] = React.useState<Blob>(null);

    React.useEffect(() => {
        if (!username || !image) return;
        const formdata = new FormData();
        formdata.append('username', username);
        formdata.append('image', image);
        axios.put(`/${username}`, formdata)
    }, [username, image]);

    return (
        <div className="card">
            <img src="/static/google-logo.svg" alt="logo" style={{ width: 75 }} />
            <Steps>
                <StepOne setUsername={setUsername} />
                <StepTwo setImage={setImage} />
            </Steps>
        </div>
    );
}

interface StepOneProps {
    setUsername(username: string): void;
}
const StepOne: React.FunctionComponent<StepOneProps> = function (props: StepOneProps): React.ReactElement {
    const enum StepOneState { isAvailable, isWaiting, isError }

    const [username, setUsername] = React.useState<string>();
    const { nextStep } = React.useContext(StepItemContext);
    const [state, setState] = React.useState(StepOneState.isAvailable);

    async function submit() {
        if (state !== StepOneState.isAvailable) return;
        setState(StepOneState.isWaiting);

        try {
            const res = await axios.get(`/${username}`);

            if (res.status === 200){
                setState(StepOneState.isAvailable);
                props.setUsername(username);
                nextStep();
            }
            
        } catch (err) {
            const { response: _res } = err as AxiosError;
            setState(StepOneState.isError);
        }
    }

    function inputHandler(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;
        const username = target.value.trim().toLowerCase();
        setUsername(username);

        if (state === StepOneState.isError)
            setState(StepOneState.isAvailable);
    }

    return (
        <>
            <h1>登入</h1>
            <h2>使用臉部識別登入</h2>
            <label className={"input-box" + (state === StepOneState.isError ? ' error' : '')}>
                <span className="input-placeholder">請輸入計中帳號</span>
                <input type="text" className="input-element" placeholder=" " onInput={inputHandler} />
            </label>
            <div className="error-message">* 此帳戶不存在。</div>
            <div className="card-text">此為課程作品，僅具備登入及註冊功能。此作品會要求啟用鏡頭，請允許權限。</div>
            <span className="card-spacer"></span>
            <div className="card-footer">
                <Link to="/register" className="button button-secondary">註冊新帳號</Link>
                <button type="button" className="button button-primary" disabled={!username || state !== StepOneState.isAvailable} onClick={submit}>下一步</button>
            </div>
        </>
    );
}

interface StepTwoProps {
    setImage(image: Blob): void;
}
const StepTwo: React.FunctionComponent<StepTwoProps> = function (props: StepTwoProps): React.ReactElement {
    const webcamRef = React.useRef(null);
    const { prevStep, isCurrent } = React.useContext(StepItemContext);

    async function capture() {
        if (!webcamRef.current)
            return;
        const src = webcamRef.current.getScreenshot();
        const image: Blob = await fetch(src).then(res => res.blob());
        props.setImage(image);
    }

    return (
        <div className="step-item">
            <div className="webcam-container">
            </div>
            <div className="card-footer">
                <button type="button" className="button button-secondary" onClick={prevStep}>上一步</button>
                <button type="button" className="button button-primary" onClick={capture}>認證並登入</button>
            </div>
        </div>
    );
}