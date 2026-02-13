import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {Amplify} from "aws-amplify";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'eu-north-1_iELbUyWTV',
            userPoolClientId: '68cvvgb94fn9ooe34c1g7f1iu',
            identityPoolId: 'eu-north-1:408d11b6-4be1-4f87-aabe-375996549723',
            loginWith: {
                email: true,
            }
        }
    }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
