const letters = document.querySelectorAll('.scoreboard-letter');
const ANSWER_LENGTH = 5;  //fixed length of the answer
const ROUNDS = 6; //number of times word is guessed

async function init() {
    let currentGuess = '';  //variable to store the guessed words
    let currentRow = 0;  //start of the rows
    

    // get the word to be guessed
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json(); //represt in json format
    const word = resObj.word.toUpperCase();  //convert into uppercase
    const wordParts = word.split(""); //split each letter
    let done = false; //to continue typing letters

    function addLetter(letter) {
        if(currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            //if length is 5 and then a letter is pressed, the the last word should be removed and new letter must be added or we can say replace the letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter; 
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter; //letter to be shifted to next row and display
    }

    //for the enter key to work
    async function commit() {
        if(currentGuess.length !== ANSWER_LENGTH) {
            return; //do nthng
        }

        // TODO validate word

        const res = await fetch("https://words.dev-apis.com/validate-word", {  //the api is used 
            method: "POST",  //the word is given to api
            body: JSON.stringify({ word: currentGuess }) // convert to string and check 
        });

        const resObj = await res.json();  //response in json
        const validWord = resObj.validWord; //to check the list of valid words in api

        if(!validWord) {
            markInvalidWord();
            return;
        }

        // TODO do all markings as correct, wrong, close 

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        // mark as correct
        for(let i = 0; i < ANSWER_LENGTH; i++) {
            if(guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct"); //mark that word or i as the class defined as correct
                map[guessParts[i]]--; //decrement if a letter is repeated
            }
        }

        //marking wrong and close
        for(let i = 0; i < ANSWER_LENGTH; i++) {
            if(guessParts[i] === wordParts[i]) {
                //nothing, already done
            } else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0 ) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;

        //TODO did they loose or win

        if(currentGuess === word) {
            alert('you win!');
            document.querySelector('.brand').classList.add("winner");
            done = true; //to avoid typing after winning
            return;
        } else if (currentRow === ROUNDS) {
            alert(`you loose, the word is ${word}`);
            done = true;
        }
        currentGuess = '';
    }

    // to make backspace key work
    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
    }

    //if the word is invalid then a red flash will be shown
    function markInvalidWord() {

        for(let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
            }, 10);
        }
    }
    
    //keys will be pressed and actions to be perfomed
  document.addEventListener('keydown', function handleKeyPress(event) {
    if (done) { // if done is true then do nothing
        return;
    }

    // the pressed key will be the action
    const action = event.key;

    if(action === 'Enter') {
        commit();
    } else if(action === 'Backspace') {
        backspace();
    } else if(isLetter(action)) {    //below is the defined function, to check that it has to be alphabet and not any number or symbols
        addLetter(action.toUpperCase());
    } else {
        // nthng
    }
  });
} 
// used to check if the letter lies between the condition then only apply addLetter function above
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

//to check the number of repetitions of letters in the word
function makeMap(array) {
    const obj = {};
    for(let i = 0; i < array.length; i++) {
        const letter = array[i];
        if(obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();