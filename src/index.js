const startOverlay = document.querySelector('#start-screen')
const startButton = document.querySelector('#start-button')
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

let currentRound
let numberofRounds
let roundDuration
let roundTimeLeft
let updateTimerID

let testConfig;

new Sortable(rulesList, {
    handle: '.handle',
    animation: 200
})

startButton.addEventListener('click', () => {
    fetchConfig();
    startOverlay.style.display = 'none';
})

addRuleButton.addEventListener('click', () => {
    addRule();
})


function fetchConfig() {
    fetch('./config.json')
    .then(response => response.json())
    .then(data => setupTest(data))
}

function setupTest(data) {
    testConfig = data

    numberofRounds = testConfig.rounds.length;
    currentRound = -1;
    roundDuration = testConfig.duration; 

    startRound()
}

function startRound() {
    roundTimeLeft = roundDuration
    currentRound++
    updateDisplays()
    updateTimer()
    updateTimerID = setInterval(updateTimer, 1000)
    loadSlideContents()
}

function updateDisplays() {
    let currentRoundText = (currentRound < 10) ? '0' + (currentRound + 1) : currentRound.toString()
    let numberOfRoundsText = (numberofRounds < 10) ? '0' + numberofRounds : numberofRounds.toString()
    roundDisplay.innerHTML = "Round: " + currentRoundText + "/" + numberOfRoundsText
    timeDisplay.innerHTML = "Time: " + roundDuration.toString() + "s"
}

function loadSlideContents() {
    let newInputImg1 = new Image()
    newInputImg1.onload = function() {
        slideOneInput.src = this.src
    }
    newInputImg1.src = testConfig.rounds[currentRound].input1;

    let newPredictionImg1 = new Image()
    newPredictionImg1.onload = function() {
        slideOnePrediction.src = this.src
    }
    newPredictionImg1.src = testConfig.rounds[currentRound].prediction1;

    let newExplanationImg1 = new Image()
    newExplanationImg1.onload = function() {
        slideOneExplanation.src = this.src
    }
    newExplanationImg1.src = testConfig.rounds[currentRound].explanation1;

    let newInputImg2 = new Image()
    newInputImg2.onload = function() {
        slideTwoInput.src = this.src
    }
    newInputImg2.src = testConfig.rounds[currentRound].input2;

    let newPredictionImg2 = new Image()
    newPredictionImg2.onload = function() {
        slideTwoPrediction.src = this.src
    }
    newPredictionImg2.src = testConfig.rounds[currentRound].prediction2;

    let newExplanationImg2 = new Image()
    newExplanationImg2.onload = function() {
        slideTwoExplanation.src = this.src
    }
    newExplanationImg2.src = testConfig.rounds[currentRound].explanation2;
}

function updateTimer() {
    let minutes = Math.floor(roundTimeLeft / 60)
    let seconds = roundTimeLeft % 60

    let minutesText = (minutes < 10) ? '0' + minutes : minutes.toString()
    let secondsText = (seconds < 10) ? '0' + seconds : seconds.toString()

    timeDisplay.innerHTML = 'Time: ' + minutesText + ':' + secondsText

    roundTimeLeft--

    if (roundTimeLeft < 0) {
        clearInterval(updateTimerID)
        startRound()
    }
}

function addRule() {
    let listGroupItem = document.createElement('div')
    listGroupItem.classList.add(('list-group-item'))

    listGroupItem.appendChild(createHandle())
    listGroupItem.appendChild(createRule())
    listGroupItem.appendChild(createClose())

    rulesList.appendChild(listGroupItem)
}

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

function createClose() {
    let close = document.createElement('div')
    close.classList.add('close')
    close.classList.add('flex-center')

    let span = document.createElement('span')
    span.classList.add('material-symbols-sharp')
    span.appendChild(document.createTextNode('close'))

    close.appendChild(span)

    return close
}

function createRule() {
    let ruleDiv = document.createElement('div')
    ruleDiv.classList.add('rule')
    ruleDiv.classList.add('flex-center')

    let ifP = createPElement('if')
    let featureSelect = createSelectElement('feature', 'feature', testConfig.features)
    //let isP = createPElement('is')
    let comparisonSelect = createSelectElement(
        'comparison', 
        'comparison', 
        ['GREATER', 'GREATER EQUAL', 'EQUAL', 'NOT EQUAL', 'LESS', 'LESS EQUAL']
    )
    let valueInputElement = createDataListInputElement('value', 'features', testConfig.features)
    let thenP = createPElement('then')
    let magnitudeSelect = createSelectElement('magnitude', 'magnitude', ['WEAK', 'STRONG'])
    let effectSelect = createSelectElement('effect', 'effect', ['POSITIVE', 'NEGATIVE'])
    let effectP = createPElement('effect')

    ruleDiv.appendChild(ifP)
    ruleDiv.appendChild(featureSelect)
    //ruleDiv.appendChild(isP)
    ruleDiv.appendChild(comparisonSelect)
    ruleDiv.appendChild(valueInputElement)
    ruleDiv.appendChild(thenP)
    ruleDiv.appendChild(magnitudeSelect)
    ruleDiv.appendChild(effectSelect)
    ruleDiv.appendChild(effectP)

    return ruleDiv
}

function createPElement(text) {
    let p = document.createElement('p')
    p.appendChild(document.createTextNode(text))
    return p
}

function createSelectElement(className, name, options) {
    let select = document.createElement('select')
    select.classList.add(className)
    select.setAttribute('name', name)

    options.forEach(option => {
        let optionDOM = document.createElement('option')
        optionDOM.appendChild(document.createTextNode(option.toString().toUpperCase()))
        select.appendChild(optionDOM)
    });

    return select;
}

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