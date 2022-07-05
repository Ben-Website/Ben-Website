// converts a roll result into a string
function renderRoll(result) {
    return String(result);
}

// Roll a die
// `die` should be integer
// returns a random integer in [1..die]
function rollDie(die) {
    return Math.floor(Math.random() * die) + 1;
}

/*
 *   INLINE AND TABLE ROLLS 
 */

// initiate a dice roll
function roll(id) {
    let el = document.getElementById(id);
    console.log(el.dataset);

    if (el.dataset.rollKind == "simple") {
        simpleRolling.roll(id, el);
    } else {
        tableRolling.roll(id, el);
    }
}

// rolling inline clickable
const simpleRolling = {
    roll: function(id, el) {
        // do the rolls
        let dice = []; // results
        let die = Number(el.dataset.rollDie); // which die we're rolling
    
        for (let i = 0; i < el.dataset.rollNumber; i++) {
            dice.push(rollDie(die));
        }

        console.log(dice);

        let shouldDelay = false;

        let result = document.getElementById("result-for-" + id);
        if (result.classList.contains("active")) {
            shouldDelay = true;
            result.classList.remove("active");
        }

        let delay = 0;
    
        if (shouldDelay) {
            delay = 150;
        }

        setTimeout(function() { 
            let ans = "";
            switch (el.dataset.rollFunction) {
                case "identity":
                    ans = dice.map((el) => renderRoll(el)).join(", ")
                    break;
                case "max":
                    ans = renderRoll(dice.reduce((l, r) => Math.max(l, r)));
                    break;
                case "min":
                    ans = renderRoll(dice.reduce((l, r) => Math.min(l, r)));
                    break;
                case "sum":
                case "add":
                    ans = renderRoll(dice.reduce((l, r) => l + r, 1));
                    break;
                default:
                    console.log("Unknown function ", el.dataset.rollFunction);
            }

            let result = document.getElementById("result-for-" + id);
            result.innerHTML = ans;
            result.classList.add("active");
            result.dataset.rollRaw = dice;
        }, delay);
    }
}

// rolling a table
const tableRolling = {
    // whether an element is labelled as being a result for the roll result `roll`
    elementContainsRoll: function(element, roll) {
        if ('rollOn' in element.dataset) {
            let rollOn = JSON.parse(element.dataset.rollOn);
            if (Array.isArray(rollOn)) {
                return rollOn.includes(roll);
            } else {
                return element.dataset.rollOn == roll;
            }
        } else if ('rollResult' in element.dataset) {
            let res = JSON.parse(element.dataset.rollResult);
            if ((typeof res) === "number") {
                return res == roll;
            } else if (Array.isArray(res)) {
                return res.includes(roll);
            } else {
                return (roll <= res.end) && (roll >= res.start);
            }
        } else {
            return false;
        }
    },

    // roll 
    roll: function(id, el) {
        let die = Number(el.dataset.rollDie);
        let result = rollDie(die);
    
        let shouldDelay = false;
    
        el.querySelectorAll('td').forEach(function(subElement) {
            if (subElement.classList.contains("active")) {
                shouldDelay = true;
                subElement.classList.remove("active");
            }
        });
    
        let delay = 0;
    
        if (shouldDelay) {
            delay = 150;
        }
    
        setTimeout(function() {
            el.querySelectorAll('td').forEach(function(subElement) {
                subElement.classList.remove("active");

                if (tableRolling.elementContainsRoll(subElement, result)) {
                    subElement.classList.add("active");
                }
            });
        }, delay);
    }
};


/*
 * TOOLBOX
 */

// the order to display dice options in 
const DICE_ORDER = new Uint32Array([4, 6, 8, 12, 20, 10, 100]);
// radius of the circumscribed circle for rendering dice options
const RADIUS = 70;
// half-spacing between dice options
const MARGIN = 15;


let TOOLBOX_STATE; // set in DOMContentLoaded event


const diceOptions = {
    // creates an svg element used for rendering dice options
    createDieSvg: function(die) {
        let element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        element.setAttribute("width", RADIUS + "px");
        element.setAttribute("height", RADIUS + "px");
        element.setAttribute('viewBox', "-75 -75 150 150");
        element.setAttribute("role", "img");
        element.setAttribute("aria-label", "A depiction of a " + String(die) + "-sided die.");
        element.classList.add("die");

        return element;
    },

    // returns a comma-separated (for SVG points input) list of points for a regular polygon with the given parameters
    regularPolygonPoints: function(sides, radius, offset, offsetY=0) {
        let points = [];

        for (let i = 0; i < sides; i++) {
            let theta = (2 * Math.PI) / sides * i + offset;
            let x = radius * Math.cos(theta);
            let y = radius * Math.sin(theta);
            points.push(String(x) + " " + String(y + offsetY));
        }

        return points.join(",");
    },

    // adds the circumscribing circles, with the appropriate classes
    circles: function() {
        let circle = function(cls) {
            return "<circle class='circumscribing-circle " + cls + "' cx='0' cy='0' r='50' stroke-width='1pt' fill='none'/>";
        }

        return ["cc-1", "cc-2", "cc-3", "cc-4", "cc-0"].map(function(cls) { return circle(cls); })
    },

    textPair: function(x, y) { return String(x) + " " + String(y); },

    textPairPolar: function(theta, radius) {
        let x = radius * Math.cos(theta);
        let y = radius * Math.sin(theta);
        return diceOptions.textPair(x, y);
    },

    createD4: function() {
        let element = diceOptions.createDieSvg(4);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet' points='" + diceOptions.regularPolygonPoints(3, 50, Math.PI / 6) + "' />" + 
            "<text x='0' y='0'>4</text>";
    
        return element;
    },
    
    createD6: function() {
        let element = diceOptions.createDieSvg(6);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet' points='" + diceOptions.regularPolygonPoints(4, 50, Math.PI / 4) + "' />" + 
            "<text x='0' y='0'>6</text>";
    
        return element;
    },
    
    createD8: function(roll) {
        let element = diceOptions.createDieSvg(8);
    
        let r = Math.tan(30 * Math.PI / 180) * 100;
    
        element.innerHTML = diceOptions.circles() +
            "<polyline class='die-facet-comp' points='" +
                diceOptions.textPair(-r/2, 0) + "," + diceOptions.textPair(r/2, 0) + "' />" +
            "<polygon class='die-facet' points='" +
                diceOptions.textPair(-r/2, 0) + "," +
                diceOptions.textPair(0, -50) + "," +
                diceOptions.textPair(r/2, 0) + "," +
                diceOptions.textPair(0, 50) + "' />" +
            "<text x='0' y='0'>8</text>";
    
        return element;
    },

    createD12: function() {
        let element = diceOptions.createDieSvg(12);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet' points='" + diceOptions.regularPolygonPoints(5, 50, Math.PI / 10) + "' />" + 
            "<text x='0' y='0'>12</text>";
    
        return element;
    },
    
    createD20: function() {
        let element = diceOptions.createDieSvg(20);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet' points='" + diceOptions.regularPolygonPoints(3, 50, -Math.PI / 6) + "' />" + 
            "<text x='0' y='0'>20</text>";
    
        return element;
    },
    
    createD10: function() {
        let element = diceOptions.createDieSvg(10);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet die-facet-10' points='" + 
            diceOptions.textPairPolar(0, 50) + "," + 
            diceOptions.textPairPolar(Math.PI/3, 50) + "," + 
            diceOptions.textPairPolar(Math.PI, 50) + "," + 
            diceOptions.textPairPolar(-Math.PI/3, 50) + "," + 
            "' />" + 
            "<text x='0' y='0'>&nbsp;10</text>";
    
        return element;
    },
    
    createD100: function() {
        let element = diceOptions.createDieSvg(100);
    
        element.innerHTML = diceOptions.circles() +
            "<polygon class='die-facet die-facet-100' points='" + 
            diceOptions.textPairPolar(0, 50) + "," + 
            diceOptions.textPairPolar(2*Math.PI/3, 50) + "," + 
            diceOptions.textPairPolar(Math.PI, 50) + "," + 
            diceOptions.textPairPolar(-2*Math.PI/3, 50) + "," + 
            "' />" + 
            "<text x='0' y='0'>100&nbsp;&nbsp;</text>";
    
        return element;
    },
    
    createDie: function(die) {
        switch (die) {
            case 4:
                return diceOptions.createD4();
            case 6:
                return diceOptions.createD6();
            case 8:
                return diceOptions.createD8();
            case 12:
                return diceOptions.createD12();
            case 20:
                return diceOptions.createD20();
            case 10:
                return diceOptions.createD10();
            case 100:
                return diceOptions.createD100();
            default:
                throw "Unknown die number " + String(die);
        }
    }
};

function setToolboxState(die) {
    if (TOOLBOX_STATE["die"] != die) {
        TOOLBOX_STATE = {
            die: die,
            number: 1,
        };
    } else {
        TOOLBOX_STATE["number"] += 1;
    }
    localStorage.setItem('toolbox-state', JSON.stringify(TOOLBOX_STATE));
    
    let label = document.getElementById("toolbox-roll-button");
    label.innerText = String(TOOLBOX_STATE.number) + "d" + String(TOOLBOX_STATE.die);
}

function toolboxLayout() {
    let root = document.getElementById("toolbox-dice-options");

    // draw dice options
    DICE_ORDER.forEach(function(die) {
        let button = document.createElement("button");
        button.classList.add("dice-wrap");
        button.addEventListener("click", function (ev) {
            setToolboxState(die);
        }, false);
        let element = diceOptions.createDie(die);
        button.appendChild(element);
        root.appendChild(button);
    });
}

function toggleToolbox() {
    let element = document.getElementById("toolbox");
    if (element.classList.contains("active")) {
        // deactivate
        element.style.maxHeight = "0px";
        element.classList.remove("active");
    } else {
        element.classList.add("active");
        element.style.maxHeight = String(document.getElementById("toolbox-inner").clientHeight + element.clientHeight + 18) + "px";
    }
}

function rollToolbox() {
    let rolls = [];

    for (let i = 0; i < TOOLBOX_STATE.number; i++) {
        rolls.push(rollDie(TOOLBOX_STATE.die));
    }

    let result = document.getElementById("toolbox-result");
    let resultMin = document.getElementById("toolbox-result-min");
    let resultMax = document.getElementById("toolbox-result-max");
    let resultSum = document.getElementById("toolbox-result-sum");

    if (TOOLBOX_STATE.number == 1) {
        result.innerText = rolls.join(", ");
        resultMin.innerText = "";
        resultMax.innerText = "";
        resultSum.innerText = "";
    } else {
        result.innerText = rolls.join(", ");
        resultMin.innerText = rolls.reduce((l, r) => Math.min(l, r));
        resultMax.innerText = rolls.reduce((l, r) => Math.max(l, r));
        resultSum.innerText = rolls.reduce((l, r) => l + r);
    }
}

function initToolbox() {
    toolboxLayout();
    if (localStorage.getItem('toolbox-state') === null) {
        let defaultState = {die: 20, number: 1};
        localStorage.setItem('toolbox-state', JSON.stringify(defaultState));
        TOOLBOX_STATE = defaultState;
    } else {
        TOOLBOX_STATE = JSON.parse(localStorage.getItem('toolbox-state'));
    }
    let label = document.getElementById("toolbox-roll-button");
    label.innerText = String(TOOLBOX_STATE.number) + "d" + String(TOOLBOX_STATE.die);
}

if (document.readyState === "complete" || document.readyState === "loaded") {
    initToolbox();
} else {
    document.addEventListener('DOMContentLoaded', function(_event) {
        initToolbox();
    })
}

window.addEventListener("resize", function (_event) {
    let element = document.getElementById("toolbox");
    if (element.classList.contains("active")) {
        element.style.maxHeight = String(document.getElementById("toolbox-inner").clientHeight + element.clientHeight + 18) + "px";
    }
})
