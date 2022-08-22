
const roundDisplay = document.querySelector('#round-display')
const timeDisplay = document.querySelector('#time-display')
const pauseButton = document.querySelector('#pause-button')
const rulesList = document.querySelector("#rule-list")
const addRuleButton = document.querySelector('#add-new-rule-button')
const slideOne = document.querySelector('#slide-1')
const slideTwo = document.querySelector('#slide-2')

let currentRound = 1

new Sortable(rulesList, {
    handle: '.handle',
    animation: 200
})

addRuleButton.addEventListener('click', () => {
    addRule();
})

fetchConfig();

function fetchConfig() {
    fetch('./config.json')
    .then(response => response.json())
    .then(data => setupTest(data))
}

function setupTest(data) {
    let numberofRounds = data.rounds.length;
    let roundDuration = data.duration; 

    roundDisplay.innerHTML = "Round: " + currentRound.toString() + "/" + numberofRounds.toString()
    timeDisplay.innerHTML = "Time: " + roundDuration.toString() + "s"

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
    let featureSelect = createSelectElement('feature', 'feature', ['TEST #1'])
    //let isP = createPElement('is')
    let comparisonSelect = createSelectElement(
        'comparison', 
        'comparison', 
        ['GREATER', 'GREATER EQUAL', 'EQUAL', 'NOT EQUAL', 'LESS', 'LESS EQUAL']
    )
    let valueInputElement = createDataListInputElement('value', 'features', ['Test #1'])
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
        optionDOM.appendChild(document.createTextNode(option))
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
            optionDOM.appendChild(document.createTextNode(listElement))
            list.appendChild(optionDOM)
        });

        document.querySelector('body').appendChild(list)
    }

    return input;
}