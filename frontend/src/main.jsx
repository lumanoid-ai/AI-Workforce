import React from "react";
import ReactDOM from "react-dom/client";
import AIWorkforce from "./AIWorkforce.jsx";
import "./index.css";

/* StrictMode is deliberately not used here: it double-invokes effects in
   development, which would open the SSE stream twice and duplicate events. */
ReactDOM.createRoot(document.getElementById("root")).render(<AIWorkforce />);
