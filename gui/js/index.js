import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Routes, Route, NavLink} from "react-router-dom";
import { FiBox as HeaderIcon } from "react-icons/fi";

import {GlobalStyle, Menu, Header, Page, Hamburger} from "./comp/UiComponents";
import { WifiPage } from "./comp/WifiPage";
import { ConfigPage } from "./comp/ConfigPage";
import { DashboardPage } from "./comp/DashboardPage";
import { FilePage } from "./comp/FilePage";
import { FirmwarePage } from "./comp/FirmwarePage";

import { bin2obj } from "./functions/configHelpers";

import Config from "./configuration.json";
import Dash from "./dashboard.json";


let loc;
if (Config.find(entry => entry.name === "language")) {
    loc = require("./lang/" + Config.find(entry => entry.name === "language").value + ".json");
} else {
    loc = require("./lang/en.json");
}

//let url = "http://192.168.1.54";
let url = "http://127.0.0.1";
if (process.env.NODE_ENV === "production") {url = window.location.origin;}

if (process.env.NODE_ENV === "development") {require("preact/debug");}

const displayData = new Array();

function pad2(number)
{
    if (number < 10)
    {
        return '0' + number;
    }
    else
    {
        return number;
    }
}

function updateClock(timestamp, ok)
{
    var date;
    if (timestamp)
    {
        date = new Date(timestamp * 1000);
    }
    else
    {
        date = new Date();
    }
    var dateString = "" + date.getUTCFullYear() + "/" + pad2(date.getUTCMonth() + 1)
        + "/" + pad2(date.getUTCDate()) + " " + pad2(date.getUTCHours()) + ":"
        + pad2(date.getUTCMinutes()) /*+ ":" + pad2(date.getUTCSeconds())*/;
    console.log(dateString);
    var element = document.getElementById("clock");
    if (ok)
    {
        element.style.color = "white";
    }
    else
    {
        element.style.color = "red";
    }
    element.innerText = dateString;
}

function refreshClock()
{
    fetch(`${url}/api/clock/get`)
        .then(response => response.json())
        .then(data => updateClock(data.timestamp, true))
        .catch(error => {
            console.error('There was an error!', error);
            updateClock(null, false);
        });
}

// the first calls will be with one second interval and next one twenty.
var clock_count = 10;

const id_clock = setInterval(
    () =>
    {
        refreshClock();
        clock_count -= 1;
        if (clock_count <= 0)
        {
            clearInterval(id_clock);
            setInterval(refreshClock, 20000);
        }
    },
    1000);

function Root() {
    
    const [menu, setMenu] = useState(false);
    const [configData, setConfigData] = useState(new Object());
    const [binSize, setBinSize] = useState(0);
    const [socket, setSocket] = useState({});

    useEffect(() => {
        const ws = new WebSocket(url.replace("http://","ws://").concat("/ws"));
        ws.addEventListener("message", wsMessage);
        setSocket(ws);
        fetchData();        
    }, []);

    // failed attempt
    // useEffect(() => {
    //     console.log('useEffect updateCLock');
    //     fetch(`${url}/api/clock/get`)
    //         .then(response => response.json())
    //         .then(data => updateClock(data.timestamp, true))
    //         .catch(error => {
    //             console.error('There was an error!', error);
    //             updateClock(null, false);
    //         });
    // }, [true, 1]); // active and refreshed every second

    function wsMessage(event) {
        event.data.arrayBuffer().then((buffer) => {                
            const dv = new DataView(buffer, 0);
            const timestamp = dv.getUint32(0, true);
            displayData.push([timestamp, bin2obj(buffer.slice(4,buffer.byteLength), Dash)]);     
        });        
    }

    function fetchData() {
        fetch(`${url}/api/config/get`)
            .then((response) => {
                return response.arrayBuffer();
            })
            .then((data) => {
                setBinSize(data.byteLength);
                setConfigData(bin2obj(data, Config));
            });
    }
    console.log(configData["projectName"]);
    let projectName = configData["projectName"];
    if (typeof projectName === "undefined") {
        projectName = Config.find(entry => entry.name === "projectName") ? Config.find(entry => entry.name === "projectName").value : "ESP8266";
    }
    let projectVersion = configData["projectVersion"];
    if (typeof projectVersion === "undefined") {
        projectVersion = Config.find(entry => entry.name === "projectVersion") ? Config.find(entry => entry.name === "projectVersion").value : "";
    }
    
    return <><GlobalStyle />

        <BrowserRouter>

            <Header>
                <h1><HeaderIcon style={{verticalAlign:"-0.1em"}} /> {projectName} {projectVersion}</h1>
                <h2><p id="clock" style="color :white; ">2022-01-02 12:34</p></h2>

                <Hamburger onClick={() => setMenu(!menu)} />
                <Menu className={menu ? "" : "menuHidden"}>
                    <li><NavLink onClick={() => setMenu(false)} exact to="/">{loc.titleWifi}</NavLink></li>
                    <li><NavLink onClick={() => setMenu(false)} exact to="/dashboard">{loc.titleDash}</NavLink></li>
                    <li><NavLink onClick={() => setMenu(false)} exact to="/config">{loc.titleConf}</NavLink></li>
                    <li><NavLink onClick={() => setMenu(false)} exact to="/files">{loc.titleFile}</NavLink></li>
                    <li><NavLink onClick={() => setMenu(false)} exact to="/firmware">{loc.titleFw}</NavLink></li>
                </Menu>

            </Header>
        
            <Page>
                <Routes>
                    <Route exact path="files" element={
                            <FilePage API={url} />
                        }>
                    </Route>
                    <Route exact path="config" element={
                            <ConfigPage API={url}
                                configData={configData}
                                binSize={binSize}
                                requestUpdate={fetchData} />
                        }>
                    </Route>
                    <Route exact path="dashboard" element={
                            <DashboardPage API={url}
                                socket={socket}
                                requestData={() => {return displayData;}} />
                        }>
                    </Route>
                    <Route exact path="firmware" element={
                            <FirmwarePage API={url} />
                        }>
                    </Route>
                    <Route path="/" element={
                            <WifiPage API={url} />
                        }>
                    </Route>
                </Routes>
            </Page>

        </BrowserRouter>
    </>;

}



ReactDOM.render(<Root />, document.getElementById("root"));