/**
 * This code was written by Kevin Brand
 * E-mail: uffmu@kit.student.edu
 * Mtrk. Nr.: 2115628
 */

// CONSTANTS
const startOverlay = document.querySelector('#start-screen')
const startButton = document.querySelector('#start-button')

const endOverlay = document.querySelector('#end-screen')

const pauseOverlay = document.querySelector('#pause-screen')
const resumeButton = document.querySelector('#resume-button')
const quitButton = document.querySelector('#quit-button')

const imageModal = document.querySelector('#image-modal')
const imageModalModal = document.querySelector('#image-modal .modal')
const imageModalImage = document.querySelector('#image-modal .modal img')


const roundDisplay = document.querySelector('#round-display')
const timeDisplay = document.querySelector('#time-display')
const pauseButton = document.querySelector('#pause-button')
const rulesList = document.querySelector("#rule-list")
const addRuleButton = document.querySelector('#add-new-rule-button')

const slideOne = document.querySelector('#slide-1')
const slideOneInput = document.querySelector('#slide-1 .input-img')
const slideOnePrediction = document.querySelector('#slide-1 .prediction-img')
const slideOneExplanation = document.querySelector('#slide-1 .explanation-img')


const slideTwo = document.querySelector('#slide-2')
const slideTwoInput = document.querySelector('#slide-2 .input-img')
const slideTwoPrediction = document.querySelector('#slide-2 .prediction-img')
const slideTwoExplanation = document.querySelector('#slide-2 .explanation-img')


// VARIABLES
let currentRound
let numberofRounds
let roundDuration
let roundTimeLeft
let updateTimerID

let config;
let userID;

/**
 * Converts the rules list into a sortable list.
 * See sortable.js docs for more info
 */
new Sortable(rulesList, {
    handle: '.handle',
    animation: 200
})

// Adding Eventlisteners to buttons and attaching the related function
startButton.addEventListener('click', () => {
    let userCode = ''
    for (let i = 1; i < 5; i++) {
        let selector = '#code-gen-' + i
        userCode += document.querySelector(selector).value
    }

    if (userCode.length != 8) {
        for (let i = 1; i < 5; i++) {
            let selector = '#code-gen-' + i
            document.querySelector(selector).value = ''
        }
        alert('Please enter a valid values into the textfields! Thank you.')
        return
    }

    userID = userCode
    fetchConfig();
    startOverlay.classList.add('hidden');
})

addRuleButton.addEventListener('click', () => {
    addRule();
})

imageModalModal.addEventListener('click', () => {
    hideImageModal()
})

pauseButton.addEventListener('click', () => {
    pause('Please focus your attention on the cross and press continue to resume the round.', true)
})

quitButton.addEventListener('click', () => {
    end()
})

resumeButton.addEventListener('click', () => {
    unpause()
})


/**
 * Saves the rules in an object array and then attempts to E-Mail the rules
 */
function saveRules() {
    let ruleElements = document.querySelectorAll('.rule')
    let userRules = []

    ruleElements.forEach(ruleElemet => {
        userRules.push(convertRuleToObject(ruleElemet))
    });

    let ruleOBJ = {
        name: userID,
        rules: userRules
    }

    sendRulesViaEmail(ruleOBJ)
}

/**
 * Attempts to send an email with the rules array as JSON as the message
 * @param {Rules Obnject} rules 
 * @returns 
 */
function sendRulesViaEmail(rules) {
    if (!config.sendEmail)
        return

    let rulesJSON = JSON.stringify(rules)

    const serviceID = config.serviceID;
    const templateID = config.templateID;

    emailjs.send(serviceID, templateID, { message: rulesJSON })
        .then(() => {
            alert('Data has been sent successfully. You can now close the site.');
        }, (err) => {
            alert(JSON.stringify(err));
        });
}

/**
 * Extracts the values from the rule dom element and converts it into a javascript object
 * @param {DOMElement} ruleElement 
 * @returns Javascript Object Rule
 */
function convertRuleToObject(ruleElement) {
    let featureSelect = ruleElement.querySelector('.feature')
    let comparisonSelect = ruleElement.querySelector('.comparison')
    let valueInputElement = ruleElement.querySelector('.value')
    let magnitudeSelect = ruleElement.querySelector('.magnitude')
    let effectSelect = ruleElement.querySelector('.effect')

    let rule = {
        feature: featureSelect.options[featureSelect.selectedIndex].value,
        comparison: comparisonSelect.options[comparisonSelect.selectedIndex].value,
        value: valueInputElement.value,
        magnitude: magnitudeSelect.options[magnitudeSelect.selectedIndex].value,
        effect: effectSelect.options[effectSelect.selectedIndex].value
    }

    return rule
}

/**
 * Fetches the config file and then calls the test setup
 */
function fetchConfig() {
    fetch('./config.json')
        .then(response => response.json())
        .then(data => setupTest(data))
}


/**
 * Sets up the test and then calls the first round to begin
 * @param {JSON} data 
 */
function setupTest(data) {
    config = data

    emailjs.init(config.emailjsKey)

    numberofRounds = config.rounds.length;
    currentRound = -1;
    roundDuration = config.duration;

    startRound()
}

/**
 * Starts a new round
 */
function startRound() {
    roundTimeLeft = roundDuration
    currentRound++

    if (currentRound == numberofRounds) {
        end()
        return;
    }

    updateDisplays()
    updateTimer()
    updateTimerID = setInterval(updateTimer, 1000)
    loadSlideContents()
}

/**
 * Displays the End Screen and saves the rules
 */
function end() {
    endOverlay.classList.remove('hidden')
    saveRules()
}

/**
 * Updates Number of Rounds Text
 */
function updateDisplays() {
    let currentRoundText = (currentRound < 10) ? '0' + (currentRound + 1) : currentRound.toString()
    let numberOfRoundsText = (numberofRounds < 10) ? '0' + numberofRounds : numberofRounds.toString()
    roundDisplay.innerHTML = "Round: " + currentRoundText + "/" + numberOfRoundsText
    timeDisplay.innerHTML = "Time: " + roundDuration.toString() + "s"
}

/**
 * Pauses the round and displays the pause screen dependent on the caller
 * @param {string} text 
 * @param {boolean} showQuitButton 
 */
function pause(text, showQuitButton = false) {
    if (showQuitButton)
        quitButton.classList.remove('hidden')

    pauseOverlay.querySelector('h1').innerHTML = text
    pauseOverlay.classList.remove('hidden')
    clearInterval(updateTimerID)
}

/**
 * Unpauses the round
 */
function unpause() {
    quitButton.classList.add('hidden')
    pauseOverlay.classList.add('hidden')
    updateTimerID = setInterval(updateTimer, 1000)
}

/**
 * Hides the image modal
 */
function hideImageModal() {
    imageModal.classList.add('hidden')
}

/**
 * Displays the image in its full size
 * @param {string} src 
 */
function displayImageFull(src) {
    let displayImage = new Image()
    displayImage.onload = function () {
        imageModalImage.src = this.src
    }
    displayImage.src = src

    imageModal.classList.remove('hidden')
}

/**
 * Loads the slide contents 
 */
function loadSlideContents() {
    let newInputImg1 = new Image()
    newInputImg1.onload = function () {
        slideOneInput.src = this.src
        slideOneInput.addEventListener('click', () => {
            displayImageFull(slideOneInput.src)
        })
    }
    newInputImg1.src = config.rounds[currentRound].input1;

    let newPredictionImg1 = new Image()
    newPredictionImg1.onload = function () {
        slideOnePrediction.src = this.src
        slideOnePrediction.addEventListener('click', () => {
            displayImageFull(slideOnePrediction.src)
        })
    }
    newPredictionImg1.src = config.rounds[currentRound].prediction1;

    let newExplanationImg1 = new Image()
    newExplanationImg1.onload = function () {
        slideOneExplanation.src = this.src
        slideOneExplanation.addEventListener('click', () => {
            displayImageFull(slideOneExplanation.src)
        })
    }
    newExplanationImg1.src = config.rounds[currentRound].explanation1;

    let newInputImg2 = new Image()
    newInputImg2.onload = function () {
        slideTwoInput.src = this.src
        slideTwoInput.addEventListener('click', () => {
            displayImageFull(slideTwoInput.src)
        })
    }
    newInputImg2.src = config.rounds[currentRound].input2;

    let newPredictionImg2 = new Image()
    newPredictionImg2.onload = function () {
        slideTwoPrediction.src = this.src
        slideTwoPrediction.addEventListener('click', () => {
            displayImageFull(slideTwoPrediction.src)
        })
    }
    newPredictionImg2.src = config.rounds[currentRound].prediction2;

    let newExplanationImg2 = new Image()
    newExplanationImg2.onload = function () {
        slideTwoExplanation.src = this.src
        slideTwoExplanation.addEventListener('click', () => {
            displayImageFull(slideTwoExplanation.src)
        })
    }
    newExplanationImg2.src = config.rounds[currentRound].explanation2;
}

/**
 * Updates the timer starts a new round if the round timer reaches 0
 */
function updateTimer() {
    let minutes = Math.floor(roundTimeLeft / 60)
    let seconds = roundTimeLeft % 60

    let minutesText = (minutes < 10) ? '0' + minutes : minutes.toString()
    let secondsText = (seconds < 10) ? '0' + seconds : seconds.toString()

    timeDisplay.innerHTML = 'Time: ' + minutesText + ':' + secondsText

    roundTimeLeft--

    if (roundTimeLeft < 0) {
        clearInterval(updateTimerID)

        if ((currentRound + 1) == numberofRounds) {
            end()
            return;
        }
        else {
            startRound()
            pause('Please focus your attention on the cross and press continue to start the next round.')
        }
    }
}


/**
 * Adds a new rule dom element to the rules-list
 */
function addRule() {
    let listGroupItem = document.createElement('div')
    listGroupItem.classList.add(('list-group-item'))

    listGroupItem.appendChild(createHandle())
    listGroupItem.appendChild(createRule())
    listGroupItem.appendChild(createClose())

    rulesList.appendChild(listGroupItem)
}

/**
 * Creates the handle for the rule DOM element
 * @returns Handle
 */
function createHandle() {
    let handle = document.createElement('div')
    handle.classList.add('handle')
    handle.classList.add('flex-center')

    let span = document.createElement('span')
    span.classList.add('material-symbols-sharp')
    span.appendChild(document.createTextNode('menu'))

    handle.appendChild(span)

    return handle
}

/**
 * Creates the close button for the rule DOM element
 * @returns Close
 */
function createClose() {
    let close = document.createElement('div')
    close.classList.add('close')
    close.classList.add('flex-center')

    let span = document.createElement('span')
    span.classList.add('material-symbols-sharp')
    span.appendChild(document.createTextNode('close'))

    close.appendChild(span)

    // Adds ability to delete the attached rule
    close.addEventListener('click', () => {
        let parent = findParentWithClass(close, 'list-group-item')
        parent.remove()
    })

    return close
}

/**
 * Finds the first parent of a child that has a class
 * @param {DOMElement} element 
 * @param {string} className 
 * @returns 
 */
function findParentWithClass(element, className) {
    while ((element = element.parentElement) && !element.classList.contains(className));
    return element;
}

/**
 * Creates the rule part of the rule...yeah, the naming is bad. 
 * @returns The rule rule part
 */
function createRule() {
    let ruleDiv = document.createElement('div')
    ruleDiv.classList.add('rule')
    ruleDiv.classList.add('flex-center')

    let ifP = createPElement('if')
    let featureSelect = createSelectElement('feature', 'feature', config.features)
    let comparisonSelect = createSelectElement(
        'comparison',
        'comparison',
        ['GREATER', 'GREATER EQUAL', 'EQUAL', 'NOT EQUAL', 'LESS', 'LESS EQUAL']
    )
    let valueInputElement = createDataListInputElement('value', 'features', config.features)
    let thenP = createPElement('then')
    let magnitudeSelect = createSelectElement('magnitude', 'magnitude', ['WEAK', 'STRONG'])
    let effectSelect = createSelectElement('effect', 'effect', ['POSITIVE', 'NEGATIVE'])
    let effectP = createPElement('effect')

    ruleDiv.appendChild(ifP)
    ruleDiv.appendChild(featureSelect)
    ruleDiv.appendChild(comparisonSelect)
    ruleDiv.appendChild(valueInputElement)
    ruleDiv.appendChild(thenP)
    ruleDiv.appendChild(magnitudeSelect)
    ruleDiv.appendChild(effectSelect)
    ruleDiv.appendChild(effectP)

    return ruleDiv
}

/**
 * Creates a p element with a specified text
 * @param {string} text The text in the p element
 * @returns the p elment with the specified text
 */
function createPElement(text) {
    let p = document.createElement('p')
    p.appendChild(document.createTextNode(text))
    return p
}

/**
 * Creates a select element
 * @param {string} className 
 * @param {string} name 
 * @param {Array} options 
 * @returns Select with Options
 */
function createSelectElement(className, name, options) {
    let select = document.createElement('select')
    select.classList.add(className)
    select.setAttribute('name', name)

    options.forEach(option => {
        let optionDOM = document.createElement('option')
        optionDOM.setAttribute('value', option)
        optionDOM.appendChild(document.createTextNode(option.toString().toUpperCase()))
        select.appendChild(optionDOM)
    });

    return select;
}

/**
 * Creates an input element and a data list, shouldn't it exist yet
 * @param {string} className 
 * @param {string} listName 
 * @param {Array} dataList 
 * @returns Input Element
 */
function createDataListInputElement(className, listName, dataList) {
    let input = document.createElement('input')
    input.classList.add(className)
    input.setAttribute('type', 'text')
    input.setAttribute('list', listName)

    if (document.getElementById(listName) == null) {
        let list = document.createElement('datalist')
        list.setAttribute('id', listName)

        dataList.forEach(listElement => {
            let optionDOM = document.createElement('option')
            optionDOM.appendChild(document.createTextNode(listElement.toString().toUpperCase()))
            list.appendChild(optionDOM)
        });

        document.querySelector('body').appendChild(list)
    }

    return input;
}