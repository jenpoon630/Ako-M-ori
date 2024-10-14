let isLoggedIn = false;
let globalUsername = null;
let globalPassword = null;
let gameScore = 0;
let gameTotal = 0;
function getVersion() {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/ako/api/Version');
    const streamPromise = fetchPromise.then((response) => response.text());
    streamPromise.then((data) => { document.getElementById("serverVersion").innerText += " " + data });
}

function addComment() {
    const url = 'http://localhost:5000/api/Comment';
    const data = { comment: document.getElementById("commentData").value, name: document.getElementById("commentName").value };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const iframeElem = document.getElementById('allCommentsiframe')
            iframeElem.src = iframeElem.src;
            document.getElementById("commentData").value = "";
            document.getElementById("commentName").value = "";
        });
}

function Register() {
    const url = 'https://cws.auckland.ac.nz/ako/api/Register';
    const data = { username: document.getElementById("registrationUsername").value, password: document.getElementById("registrationPassword").value, address: document.getElementById("registrationAddress").value };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            document.getElementById("registrationText").innerText = data;
            document.getElementById("registrationUsername").value = "";
            document.getElementById("registrationPassword").value = "";
            document.getElementById("registrationAddress").value = "";
        });
}

// 3 events - content-type: application/json;
function getEventCount() {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/ako/api/EventCount',
        {
            headers: {
                "Accept": "application/json"
            }
        })
    const streamPromise = fetchPromise.then((response) => response.json());
    streamPromise.then((data) => {
        const eventCount = parseInt(data);
        fetchEvents(eventCount);
    });
}

function fetchEvents(eventCount) {
    for (let i = eventCount - 1; i > -1; i--) {
        const fetchPromise = fetch(`https://cws.auckland.ac.nz/ako/api/Event/${i}`,
            {
                headers: {
                    "Accept": "application/json",
                }
            });
        const streamPromise = fetchPromise.then((response) => response.text());
        streamPromise.then((data) => {
            displayEvent(data, i);
        });
    }
}

function vcalendarParser(event) {
    const parsedEvent = {};

    const summaryMatch = event.match(/SUMMARY:(.*)/);
    const descriptionMatch = event.match(/DESCRIPTION:(.*)/);
    const locationMatch = event.match(/LOCATION:(.*)/);
    const startDateMatch = event.match(/DTSTART:(.*)/);
    const endDateMatch = event.match(/DTEND:(.*)/);

    if (summaryMatch) {
        parsedEvent.summary = summaryMatch[1];
    }

    if (descriptionMatch) {
        parsedEvent.description = descriptionMatch[1];
    }

    if (locationMatch) {
        parsedEvent.location = locationMatch[1];
    }

    if (startDateMatch) {
        const startDateString = startDateMatch[1];
        const startDateComponents = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(startDateString);
        if (startDateComponents) {
            const [, year, month, day, hours, minutes, seconds] = startDateComponents;
            parsedEvent.startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

            const ampm = hours >= 12 ? 'AM' : 'PM';
            const hours12 = hours % 12 || 12;
            const formattedMonth = String(month).replace(/^0+/, '');
            const formattedDay = String(day).replace(/^0+/, '');

            parsedEvent.formattedDay = formattedDay;

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            parsedEvent.month = monthNames[parsedEvent.startDate.getMonth()];

            parsedEvent.startFormattedDate = `${formattedMonth}/${formattedDay}/${year}, ${hours12}:${minutes}:${seconds} ${ampm}`;
        }
    }

    if (endDateMatch) {
        const endDateString = endDateMatch[1];
        const endDateComponents = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(endDateString);
        if (endDateComponents) {
            const [, year, month, day, hours, minutes, seconds] = endDateComponents;
            parsedEvent.endDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

            const ampm = hours >= 12 ? 'AM' : 'PM';
            const hours12 = hours % 12 || 12;
            const formattedMonth = String(month).replace(/^0+/, '');
            const formattedDay = String(day).replace(/^0+/, '');
            parsedEvent.formattedDay = formattedDay;

            parsedEvent.endFormattedDate = `${formattedMonth}/${formattedDay}/${year}, ${hours12}:${minutes}:${seconds} ${ampm}`;
        }
    }

    return parsedEvent;
}

function displayEvent(event, i) {
    parsedEvent = vcalendarParser(event);
    document.getElementById("eventsTable").innerHTML += `<tr><td><div class="calendarDateIcon"> <img src="https://i.imgur.com/NCRFStu.png" alt="Calendar Icon" style="width: 7vw; height: auto; padding-right: 2vw"> <div class="dateWithinCalendarIcon"><p>${parsedEvent.formattedDay} ${parsedEvent.month}<br>${parsedEvent.startDate.getFullYear()}</p></div> </div> </td>
    <td style="padding-right:3vw"><b>${parsedEvent.summary}</b>: ${parsedEvent.description}. Location: ${parsedEvent.location}. <br>Starts: ${parsedEvent.startFormattedDate} <br>Finishes: ${parsedEvent.endFormattedDate}</td>
    <td>  <a href="https://cws.auckland.ac.nz/ako/api/Event/${i}" download="eventICS"> <img id="$event{i}"  src="https://i.imgur.com/8CWVfzT.png" alt="addEvent" style="width: 3.5vw; height: auto; cursor: pointer;"> </a> </td></tr>`;
}

function Login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const endpointUrl = 'https://cws.auckland.ac.nz/ako/api/TestAuth';
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    };


    fetch(endpointUrl, options)
        .then(res => {
            if (res.ok) {
                isLoggedIn = true;
                globalUsername = `${username}`;
                globalPassword = `${password}`
                document.getElementById("loginIcon").style.display = "none";
                showHomepage();
                document.getElementById('loginUsername').value = "";
                document.getElementById('loginPassword').value = "";

                document.querySelector('#navBar td:first-child').style.width = "60vw";
                document.querySelector('.logo').style.width = "13%";
                document.getElementById("loginText").innerText = `${username} `;
                document.getElementById("underlinedLoginText").innerHTML = '<u id="underlinedLoginText" style="padding - right: 20vw; display: inline; white - space: nowrap; cursor:pointer" onclick="logOut()">(logout)<u/>';
            }
            else {
                document.getElementById("loginTextInfo").innerText = "Invalid username and/or password.";
            }
        });
}

function logOut() {
    if (isLoggedIn) {
        document.getElementById("loginIcon").style.display = "block";
        document.getElementById("loginText").innerText = "Guest";
        document.getElementById("underlinedLoginText").innerHTML = "<u>(Not Logged In)</u>";
        document.querySelector('.logo').style.width = "15%";
        document.getElementById("underlinedLoginText").onclick = "";
        document.getElementById("underlinedLoginText").style.cursor = "default";
        showHomepage();
        isLoggedIn = false;
        globalUsername = null;
    }

}

function getAllItems() {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/ako/api/AllItems');
    const streamPromise = fetchPromise.then(response => response.json());
    streamPromise.then(data => showAllItems(data));
}

function showAllItems(items) {
    let htmlString = "";

    items.forEach((item) => {
        htmlString += `<tr><td><img class="shopItems" src="https://cws.auckland.ac.nz/ako/api/ItemImage/${item.id}"><td><td><b>${item.name}</b><br><br>${item.description}<br><br>$${item.price}<br><br><button class="shopButton" onclick="buyItem(${item.id})">buy now</button><td><tr>`
    })

    document.getElementById("shopTable").innerHTML = htmlString;
}

function buyItem(itemId) {
    if (isLoggedIn == false) {
        showLogin();
    }
    else {
        let username;
        let productId;
        const options = {
            headers: {
                'Authorization': 'Basic ' + btoa(globalUsername + ':' + globalPassword)
            }
        };
        let fetchedData;
        const fetchPromise = fetch(`https://cws.auckland.ac.nz/ako/api/PurchaseItem/${itemId}`, options);
        fetchPromise.then(response => response.json())
            .then(data => {
                document.getElementById("shopDialogBox").innerHTML = `<button id="closeButton" onclick="closeShopDialogBox()">&#10006;</button><br>Thank you ${JSON.stringify(data.userName)} for buying product ${JSON.stringify(data.productID)}.`
                document.getElementById("shopDialogBox").style.display = "block";
            });
    }
}

function closeShopDialogBox() {
    document.getElementById("shopDialogBox").style.display = "none";
}

function displayFilteredItems() {
    const searchTerm = document.getElementById("shopSearch").value

    if (searchTerm.length > 0) {
        fetchPromise = fetch(`https://cws.auckland.ac.nz/ako/api/Items/${searchTerm}`);
        streamPromise = fetchPromise.then(response => response.json());
        streamPromise.then(data => showAllItems(data));
    }
    else {
        getAllItems();
    }
}


function myTutorialDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function myTutorialDragOver(event) {
    event.preventDefault();
}

function tutorialDrop(event) {
    const movingObjectId = event.dataTransfer.getData("text/plain")
    if (event.dataTransfer !== null) {
        if (movingObjectId == "tutorialKoruImage" && event.target.id == "tutorialKoru") {
            document.getElementById(event.target.id).innerHTML = '<img src="https://i.imgur.com/KXpsEUF.png" alt="Koru" id="koruImage" draggable="false" style="display:block; margin:auto; width:4vw; height:auto">';
            document.getElementById(movingObjectId).remove();
        }
        else if (movingObjectId == "tutorialTahi" && event.target.id == "tutorialOne") {
            document.getElementById(event.target.id).innerText = `${document.getElementById(movingObjectId).innerText}`;
            document.getElementById(movingObjectId).remove();
        }
    }
}

function getMatchingPairs() {
    const fetchPromise = fetch("https://cws.auckland.ac.nz/ako/api/MatchingPair");
    const streamPromise = fetchPromise.then(response => response.json());
    streamPromise.then(data => {
        gameScore = 0;
        gameTotal = 0;
        displayMatchingPairs(data);

    });

}

function displayMatchingPairs(data) {
    const matchingPairsType = data.type.split(":");
    const matchingPairs = data.pairs.split("|");

    gameTotal = matchingPairs.length;
    document.getElementById("gameScore").innerText = `Your current score is ${gameScore} out of ${gameTotal}.`;

    let htmlString = "";
    let firstColumn = [];
    let secondColumn = [];
    let thirdColumn = [];

    if (matchingPairsType.includes("image")) {

        if (matchingPairsType[0] == "string") {
            matchingPairs.forEach((pair) => {

                const individualPair = pair.split("@");

                const firstColumnString = `<td>${individualPair[0]}</td>`
                firstColumn.push(firstColumnString);

                const secondColumnString = `<td id="secondColumn${individualPair[0]}" ondragover="myDragOver(event)" ondrop="myDrop(event)"></td>`
                secondColumn.push(secondColumnString);

                const thirdColumnString = `<td><img src=${individualPair[1]} id="thirdColumn${individualPair[0]}" draggable="true" ondragstart="myDragStart(event)" style="width:6vw"/></td>`
                thirdColumn.push(thirdColumnString);
            });
        }
        else {
            matchingPairs.forEach((pair) => {
                const individualPair = pair.split("@");

                const firstColumnString = `<td><img src=${individualPair[0]} style="width:6vw"/></td>`
                firstColumn.push(firstColumnString);

                const secondColumnString = `<td id="secondColumn${individualPair[1]}" ondragover="myDragOver(event)" ondrop="myDrop(event)"></td>`
                secondColumn.push(secondColumnString);

                const thirdColumnString = `<td id="thirdColumn${individualPair[1]}" draggable="true" ondragstart="myDragStart(event)">${individualPair[1]}</td>`
                thirdColumn.push(thirdColumnString);
            });
        }

    }
    else if (matchingPairsType.includes("audio")) {
        if (matchingPairsType[0] == "string") {
            matchingPairs.forEach((pair) => {

                const individualPair = pair.split("@");

                const firstColumnString = `<td>${individualPair[0]}</td>`
                firstColumn.push(firstColumnString);

                const secondColumnString = `<td id="secondColumn${individualPair[0]}" ondragover="myDragOver(event)" ondrop="myDrop(event)"></td>`
                secondColumn.push(secondColumnString);

                const thirdColumnString = `<td><audio src=${individualPair[1]} id="thirdColumn${individualPair[0]}" controls="controls" draggable="true" ondragstart="myDragStart(event)"/></td>`
                thirdColumn.push(thirdColumnString);
            });
        }
        else {
            matchingPairs.forEach((pair) => {
                const individualPair = pair.split("@");

                const firstColumnString = `<td><audio src=${individualPair[0]} controls="controls"/></td>`
                firstColumn.push(firstColumnString);

                const secondColumnString = `<td id="secondColumn${individualPair[1]}" ondragover="myDragOver(event)" ondrop="myDrop(event)"></td>`
                secondColumn.push(secondColumnString);

                const thirdColumnString = `<td id="thirdColumn${individualPair[1]}" draggable="true" ondragstart="myDragStart(event)">${individualPair[1]}</td>`
                thirdColumn.push(thirdColumnString);
            });
        }
    }
    else {
        matchingPairs.forEach((pair) => {
            const individualPair = pair.split("@");

            const firstColumnString = `<td>${individualPair[0]}</td>`
            firstColumn.push(firstColumnString);

            const secondColumnString = `<td id="secondColumn${individualPair[0]}" ondragover="myDragOver(event)" ondrop="myDrop(event)"></td>`
            secondColumn.push(secondColumnString);

            const thirdColumnString = `<td id="thirdColumn${individualPair[0]}" draggable="true" ondragstart="myDragStart(event)">${individualPair[1]}</td>`
            thirdColumn.push(thirdColumnString);
        });
    }

    for (let i = 0; i < matchingPairs.length; i++) {
        const j = Math.floor(Math.random() * thirdColumn.length);
        [thirdColumn[i], thirdColumn[j]] = [thirdColumn[j], thirdColumn[i]];
    }

    for (let i = 0; i < thirdColumn.length; i++) {
        htmlString += `<tr>${firstColumn[i]}${secondColumn[i]}${thirdColumn[i]}</tr>`;
    }
    document.getElementById("matchingPairsTable").innerHTML = htmlString;

}

function myDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function myDragOver(event) {
    event.preventDefault();
}

function myDrop(event) {
    const movingObjectId = event.dataTransfer.getData("text/plain");
    const targetObjectId = event.target.id;
    if (event !== null) {
        if (movingObjectId.slice(11) == targetObjectId.slice(12)) {
            gameScore += 1;
            document.getElementById("gameScore").innerText = `Your current score is ${gameScore} out of ${gameTotal}.`;
            if (document.getElementById(movingObjectId).hasAttribute("style") || document.getElementById(movingObjectId).hasAttribute("controls")) {
                document.getElementById(event.target.id).appendChild(document.getElementById(movingObjectId));

            }
            else {
                document.getElementById(event.target.id).innerText = `${document.getElementById(movingObjectId).innerText}`;
                document.getElementById(movingObjectId).innerText = "";
            }
            document.getElementById(movingObjectId).draggable = "false";
        }
    }
}

function addKoru() {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/ako/api/Koru');
    const streamPromise = fetchPromise.then(res => res.text());
    streamPromise.then(svgImage => {
        document.getElementById("svgKoru").innerHTML = svgImage;
        const colour = document.getElementById("koru").querySelector('path').getAttribute('fill');
        getLog(colour);
    });
}

function getLog(colour) {
    const fetchPromise = fetch('https://cws.auckland.ac.nz/ako/api/Log');
    const streamPromise = fetchPromise.then(res => res.json());
    streamPromise.then(data => {
        document.getElementById("logInformation").innerText = "[" + data + "]";
        displayLog(data, colour);
    });

}

function displayLog(data, colour) {

    let htmlString = "";
    let clipPathsString = "";
    let longestQuotient = 0;

    for (let i = 0; i < data.length; i++) {
        
        let dataElement = data[i];
        let quotient = Math.floor(dataElement / 10);
        let remainder = dataElement % 10;

        if (quotient > longestQuotient) {
            longestQuotient = quotient;
        }

        htmlString += `<svg width="75" height="25" x="${0}" y="${30 * i}" style="text-anchor: middle">
        <text x="50%" y="78%" font-family="sans-serif" font-size="19" font-weight="bolder" stroke="${colour}" fill="${colour}">${i+1}</text>
        </svg>`;

        for (let j = 0; j < quotient; j++) {
            htmlString += `<svg width="25" height="25" x="${(30 * j) + 75}" y="${30 * i}" ><use href="#koru"></svg>`;
        }

        clipPathsString += `<clipPath id=cutout${i}><rect width="${2.5 * remainder}" height="25" /></clipPath>`;
        htmlString += `<svg width="25" height="25" x="${(30 * quotient) + 75}" y="${30 * i}" clip-path="url(#cutout${i})"><use href="#koru"></svg><br>`;
    }

    document.getElementById("Infographics").setAttribute('viewBox', `0 0 ${(30 * longestQuotient) + 100} ${25 * data.length + 50}`);

    console.log(longestQuotient);

    document.getElementById("clipPaths").innerHTML = clipPathsString;
    document.getElementById("Infographics").innerHTML = htmlString;
}



function showHomepage() {
    document.getElementById("Homepage").style.display = "block";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Ako Māori";
}
function showEvents() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "block";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Kauhau";
}
function showLearning() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "block";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Mahi";
}
function showLogin() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "block";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Takiuru";
}
function showRegistration() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "block";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Pukapuka rēhita";
}
function showShop() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "block";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Whare hokohoko";
}
function showGuestbook() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "block";
    document.getElementById("Log").style.display = "none";

    document.getElementById("Title").innerText = "Pukapuka Manuhiri";
}

function showLog() {
    document.getElementById("Homepage").style.display = "none";
    document.getElementById("Events").style.display = "none";
    document.getElementById("Learning").style.display = "none";
    document.getElementById("Login").style.display = "none";
    document.getElementById("Registration").style.display = "none";
    document.getElementById("Shop").style.display = "none";
    document.getElementById("Guestbook").style.display = "none";
    document.getElementById("Log").style.display = "block";

    document.getElementById("Title").innerText = "Rangitaki";
}







window.onload = showHomepage();
getAllItems();
getVersion();
getEventCount();
getMatchingPairs();
addKoru();


