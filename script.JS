window.onload = () => {

//Variables just needed for initiation:
const numberContainer = document.getElementById('number-container');
const operatorContainer = document.getElementById('operator-container');
const tryAgainBtn = document.getElementById('try-btn');
const resetBtn = document.getElementById('reset-btn');  
const result = document.getElementById('result');

//Global Variables we will use:
const userInput = document.getElementById('user-input'); //This is what is being displayed (i.e. has x and ^ in it)
const difficultyBlock = document.getElementById('difficulty-block'); 
let userInputCalc = ""; // This is the actual formula to evaluate.
let tableData = null; //This is the list of arrays and ease
let lookupTable = {};
const buttonsClicked = []; // This is an array of all the buttons that have been clicked.
const numbersClicked = []; // This is an array of all the buttons that have been clicked.
let difficulty = "";

//This generates an array of 4 numbers.
const generateNumbers = () => {
    return Array.from({length: 4}, () => Math.floor(Math.random() * 10));
};

function hideBox(box) {
  // Reduce the width and height of the box
  box.style.width = '0';
  box.style.height = '0';
  box.style.padding = '0'; // Also reduce padding if any
  box.style.margin = '0'; // Also reduce margin if any
  box.style.fontSize = '0'; // Reduce the font size

  // After a delay, set the display to "none"
  setTimeout(function() {
    box.style.display = 'none';
  }, 300); // The delay should match the duration of the transition
}

//This defines what happens when you click a number button.
const numberClick = (number, btn) => {
  return () => {
      userInput.value += number;
      userInputCalc += number;
      buttonsClicked.push(number)
      numbersClicked.push(number)
  
      hideBox(btn);
      buttonSwitch("number")
      btn.disabled = true;
      if (numbersClicked.length > 1 && numbersClicked.length < 4) {
        evaluteEquation()
      } else if (numbersClicked.length === 4) {
        checkResult()
      }

  }
}

function buttonSwitch (switchString) {
  if (switchString === "number") {
    Array.from(numberContainer.children).forEach(btn => btn.disabled = true);
    Array.from(operatorContainer.children).forEach(btn => btn.disabled = false);
  } else {
    Array.from(numberContainer.children).forEach(btn => btn.disabled = false);
    Array.from(operatorContainer.children).forEach(btn => btn.disabled = true);
  }
}

//This set's up the 4 number buttons and gives them thet number click event listener.
const initiateNumbers = numbers => {
    numberContainer.innerHTML = '';
    for (let number of numbers) {
        let btn = document.createElement('button');
        btn.className = 'number';
        btn.textContent = number;
        btn.addEventListener('click', numberClick(number, btn));
        numberContainer.appendChild(btn);
    }
};

//This is the final check that the equiation equals 10
const checkResult = () => {
      
  let finalNumber = evaluteEquation()

  // Check if equation equals 10
  try {
      if (finalNumber === 10) {
        winScreen()
      } else {
          failScreen('That\'s not 10! That was ' + eval(finalNumber));
      }
  } catch (e) {
      failScreen('Invalid equation. Try again!');
  }
};

function winScreen() {
  numberContainer.style.display = "None";
  operatorContainer.style.display = "None";
  result.textContent = 'Correct! Good job!';
  resetBtn.textContent ="Same Numbers"
  tryAgainBtn.textContent ="New Numbers"
  tryAgainBtn.style.backgroundColor = "#72be0e"
  tryAgainBtn.style.color = "#ffffff"
  userInput.classList.add("win");
}

function failScreen(failString) {
  result.style.color =  "#d85858";
  result.textContent = failString;
  operatorContainer.style.display = "none"
  result.style.display = "block"
  userInput.style.display = "none" 
}

// This evalutes the current formula in the user input.
function evaluteEquation() {
  let equation = userInputCalc.trim().split(' ');
  let currentValue = eval(equation.join(' '))
  userInput.value = currentValue;
  userInputCalc = currentValue;
  return currentValue;
}

// This lets the code know what to do when an operator is clicked.
operatorContainer.addEventListener('click', event => {
    if (event.target.className === 'operator') {
        userInputCalc += ` ${event.target.value} `;
        userInput.value += ` ${event.target.textContent} `;
        buttonsClicked.push(`${event.target.value}`)
        buttonSwitch("operator")
    }
});

// This is the OG formula that checks if there are 4 numbers after the URL, if not it generates them and sents us there.
const generateAndDisplayNumbers = () => {
  setTimeout(function() {
}, 2000);
  let numbers;
  const search = window.location.search; // Get part of URL after question mark
  if (search && search.match(/^\?[0-9]-[0-9]-[0-9]-[0-9]$/)) { // Check if URL format is correct
      numbers = search.slice(1).split('-').map(Number); // Get numbers from URL
      initiateNumbers(numbers);
      result.textContent = '';
  } else {
      numbers = generateNumbers(); // Generate random numbers
      window.location.href = `${window.location.origin}/?${numbers.join('-')}`;
  }
  
  let key = JSON.stringify(numbers.sort((a, b) => a - b));
  // Look up the difficulty.
  difficulty = lookupTable[key];
  if (difficulty === "Impossible") {
    generateAndDisplayNumbers();
  }
  difficultyBlock.textContent = difficulty
};

//This resets the page by refreshing it and sending us to a new one.
const newNumberGame = () => {
  window.location.href = `${window.location.origin}`;
};

//This resets the board to have no user input by refreshing the page.
function resetIncorrectBoard() {
  location.reload()
}

fetch('valid_expressions.json')
  .then(response => response.json())
  .then(data => {
    tableData = data;
    
    for (let row of tableData) {
      // Parse the string into an array and sort it.
      let numbersArray = JSON.parse(row['Numbers']).sort((a, b) => a - b);
      // Convert the sorted array back into a string.
      let sortedNumbersString = JSON.stringify(numbersArray);

      // Store the difficulty in the lookup table, using the sorted string as the key.
      lookupTable[sortedNumbersString] = row['Difficulty'];
    }

    tryAgainBtn.addEventListener('click', newNumberGame);
    resetBtn.addEventListener('click', resetIncorrectBoard);
    generateAndDisplayNumbers();
    buttonSwitch("operator")
  })
  .catch(error => console.error('Error:', error));

};
