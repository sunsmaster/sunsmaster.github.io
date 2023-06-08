let gameElements = {
    "ids": [
        "goal_area_left",
        "goal_area_right",
        "goal_line_left",
        "goal_line_right",
        "playing_area",
        "bounce_wall_upper",
        "bounce_wall_lower",
        "score_left",
        "score_right",
        "paddle_left",
        "paddle_right",
        "ball"
    ],
    "intersect":{}
}

document.addEventListener('keydown', actOnKeyDown, false);
document.addEventListener('keyup', actOnKeyUp, false);
document.addEventListener('pong', actOnPongEvent, false);

setInterval(keepTrackOfBallAndPaddles, 10);

function keepTrackOfBallAndPaddles() {
    gameElements.ids.forEach(id => getElementPosition(id));
    gameElements.ids.forEach(id => updateCSS(id));
    findIntersect("ball");
    fireOffEvents("ball");
}

function tryCallEvent(eventDetails) {
    document.dispatchEvent(new CustomEvent('pong', {'detail': eventDetails}));
}

function actOnPongEvent(e) {
    //>ball< >type< >element<
    //ball = moving element
    //type = bounce/scratch/inside
    //element = intersecting element
    if (e.detail.type === "bounce") {
        if (e.detail.intersecting === "goal_line_left") {
            pointAwarded("right", 1);
        }
        if (e.detail.intersecting === "goal_line_right") {
            pointAwarded("left", 1);
        }
        if (e.detail.intersecting === "paddle_left") {
            changeDirection(e.detail.moving, "x",-1);
        }
        if (e.detail.intersecting === "paddle_right") {
            changeDirection(e.detail.moving, "x",1);
        }
        if (e.detail.intersecting === "bounce_wall_upper") {
            changeDirection(e.detail.moving, "y",-1);
        }
        if (e.detail.intersecting === "bounce_wall_lower") {
            changeDirection(e.detail.moving, "y",1);
        }
    }
    if (e.detail.type === "inside") {
        if (e.detail.intersecting === "paddle_left") {
            changeDirection(e.detail.moving, "x",-1);
        }
        if (e.detail.intersecting === "paddle_right") {
            changeDirection(e.detail.moving, "x",1);
        }
    }
    if (e.detail.type === "scratch") {
        console.log("wow")
    }
}

function changeDirection(id, direction, newDirection) {
    document.getElementById(id).dataset["direction" + direction.toUpperCase()] = newDirection.toString();
}

function pointAwarded(side, points) {
    let currentPoint = document.getElementById("score_" + side).innerText;
    let newPoint = Number.parseInt(currentPoint) + points;
    document.getElementById("score_" + side).innerText = newPoint;
    document.querySelector(':root').style.setProperty('--ball-pos-x', '0');
    document.querySelector(':root').style.setProperty('--ball-pos-y', '0');
    document.getElementById("ball").dataset.directionY = '0';
    document.getElementById("ball").dataset.directionX = '0';
    document.getElementById("ball").dataset.speed = '0';
}

function fireOffEvents(id) {
    if (gameElements[id].current.speed > 0) {
        gameElements.ids.forEach(otherID => {
            if (id !== otherID) {
                let checkObject = gameElements.intersect[id][otherID];
                let checkObjectIntersectValue = 0;
                Object.keys(checkObject).map(point => {
                    checkObjectIntersectValue += checkObject[point];
                })
                /* 1: snuddar ett annat object */
                if (checkObjectIntersectValue === 1) {
                    tryCallEvent({
                        "moving": id,
                        "intersecting": otherID,
                        "type": "scratch"
                    })
                }
                /* 2: två sidor möts */
                if (checkObjectIntersectValue === 2) {
                    tryCallEvent({
                        "moving": id,
                        "intersecting": otherID,
                        "type": "bounce"
                    })
                }
                /* >3: hela "id" är inom "otherID" */
                if (checkObjectIntersectValue > 3) {
                    tryCallEvent({
                        "moving": id,
                        "intersecting": otherID,
                        "type": "inside"
                    })
                }
            }
        });
    }
}

function findIntersect(id) {
    if (gameElements.intersect[id] === undefined) {
        gameElements.intersect[id] = {}
    }
    if (gameElements[id].current.speed > 0) {
        gameElements.ids.forEach(otherID => {
            if (id !== otherID) {
                if (gameElements.intersect[id][otherID] === undefined) {
                    gameElements.intersect[id][otherID] = {}
                }
                let subElementPos = {
                    "x1": gameElements[id].current.x1,
                    "y1": gameElements[id].current.y1,
                    "x2": gameElements[id].current.x2,
                    "y2": gameElements[id].current.y2
                };
                let otherElementPos = {
                    "x1": gameElements[otherID].current.x1,
                    "y1": gameElements[otherID].current.y1,
                    "x2": gameElements[otherID].current.x2,
                    "y2": gameElements[otherID].current.y2
                };
                gameElements.intersect[id][otherID] = {
                    "X1Y1": (
                        subElementPos.x1 >= otherElementPos.x1 &
                        subElementPos.x1 <= otherElementPos.x2 &
                        subElementPos.y1 >= otherElementPos.y1 &
                        subElementPos.y1 <= otherElementPos.y2
                    ),
                    "X1Y2": (
                        subElementPos.x1 >= otherElementPos.x1 &
                        subElementPos.x1 <= otherElementPos.x2 &
                        subElementPos.y2 >= otherElementPos.y1 &
                        subElementPos.y2 <= otherElementPos.y2
                    ),
                    "X2Y1": (
                        subElementPos.x2 >= otherElementPos.x1 &
                        subElementPos.x2 <= otherElementPos.x2 &
                        subElementPos.y1 >= otherElementPos.y1 &
                        subElementPos.y1 <= otherElementPos.y2
                    ),
                    "X2Y2": (
                        subElementPos.x2 >= otherElementPos.x1 &
                        subElementPos.x2 <= otherElementPos.x2 &
                        subElementPos.y2 >= otherElementPos.y1 &
                        subElementPos.y2 <= otherElementPos.y2
                    )
                }
            }
        });
    }
}

function updateCSS(id) {
    if (gameElements[id].current.speed > 0 & id === "ball" || id === "paddle_left" || id === "paddle_right") {
        updateSpecificCssVariable(id, "y");
        if (id === "ball") {
            updateSpecificCssVariable(id, "x");
        }
    }
}

function updateSpecificCssVariable(variableName, direction) {
    let elementData = gameElements[variableName].current;
    let rootCSS = getComputedStyle(document.querySelector(':root'));
    let cssVariable = variableName.replaceAll("_","-");
    let cssValue = rootCSS.getPropertyValue('--' + cssVariable + '-pos-' + direction);
    let cssNewValue = Number.parseFloat(cssValue);
    cssNewValue += Number.parseFloat(elementData["direction-" + direction]) * Number.parseFloat(elementData.speed);
    if (isNaN(cssNewValue)) {
        cssNewValue = 0;
    }
    if (Math.abs(cssNewValue) > 100) {
        let checkValue = Number.parseFloat(elementData["direction-" + direction]);
        if (checkValue < 0) {
            cssNewValue = -100;
        } else {
            cssNewValue = 100;
        }
    }
    document.querySelector(':root').style.setProperty('--' + cssVariable + '-pos-' + direction, cssNewValue.toString());
}

function getElementPosition(id) {
    if (gameElements[id] === undefined) {
        gameElements[id] = {
            "previous": {
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0,
                "speed": 0,
                "direction-x": 0,
                "direction-y": 0
            },
            "current": {
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0,
                "speed": 0,
                "direction-x": 0,
                "direction-y": 0
            }
        }
    }
    gameElements[id].previous = gameElements[id].current;
    let elementPos = document.getElementById(id).getBoundingClientRect();
    gameElements[id].current = {
        "x1": elementPos.left,
        "x2": elementPos.right,
        "y1": elementPos.top,
        "y2": elementPos.bottom,
        "speed": Number.parseFloat(document.getElementById(id).dataset.speed),
        "direction-x": Number.parseFloat(document.getElementById(id).dataset.directionX),
        "direction-y": Number.parseFloat(document.getElementById(id).dataset.directionY)
    }
    if (
        JSON.stringify(gameElements[id].previous)
        !==
        JSON.stringify(gameElements[id].current)
    ) {
        gameElements[id].moving = true;
    } else {
        gameElements[id].moving = false;
    }
}

function actOnKeyDown(event) {
    let paddle = {
        "side": "",
        "direction": 0,
        "speed": Number.parseInt(getComputedStyle(document.querySelector(':root')).getPropertyValue("--paddle-speed"))
    };
    if (event.code === "KeyW") {
        paddle.side = "left";
        paddle.direction = 1;
    }
    if (event.code === "KeyS") {
        paddle.side = "left";
        paddle.direction = -1;
    }
    if (event.code === "KeyO") {
        paddle.side = "right";
        paddle.direction = 1;
    }
    if (event.code === "KeyL") {
        paddle.side = "right";
        paddle.direction = -1;
    }
    paddle.speed += Number.parseInt(getComputedStyle(document.querySelector(':root')).getPropertyValue("--paddle-speed-" + paddle.side));
    let element = document.getElementById("paddle_" + paddle.side);
    if (element !== null) {
        element.dataset.directionY = paddle.direction;
        element.dataset.speed = (paddle.speed).toString();
    }
}

function actOnKeyUp(event) {
    if (event.code === "Space") {
        startBall();
        return;
    }
    let paddle = {
        "side": "",
        "direction": 0,
        "speed": 0
    };
    if (event.code === "KeyW") {
        paddle.side = "left";
    }
    if (event.code === "KeyS") {
        paddle.side = "left";
    }
    if (event.code === "KeyO") {
        paddle.side = "right";
    }
    if (event.code === "KeyL") {
        paddle.side = "right";
    }
    let element = document.getElementById("paddle_" + paddle.side);
    if (element !== null) {
        element.dataset.directionY = paddle.direction;
        element.dataset.speed = paddle.speed;
    }
}

function startBall() {
    let element = document.getElementById("ball");
    let randomX = Math.random() * 2 - 1;
    let randomY = Math.random() * 2 - 1;
    let ballSpeed = getComputedStyle(document.querySelector(':root')).getPropertyValue("--ball-speed");
    element.dataset.speed = (Number.parseInt(ballSpeed)).toString();
    element.dataset.directionX = randomX.toString();
    element.dataset.directionY = randomY.toString();
}