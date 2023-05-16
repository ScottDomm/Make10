window.onload = () => {
  const numberContainer = document.getElementById('number-container');
  const operatorContainer = document.getElementById('operator-container');
  const userInput = document.getElementById('user-input');
  let userInputCalc = "";
  const submitBtn = document.getElementById('submit-btn');
  const tryBtn = document.getElementById('try-btn');
  const resetBtn = document.getElementById('reset-btn');
  const result = document.getElementById('result');
  const buttonsClicked = [];

  const generateNumbers = () => {
      return Array.from({length: 4}, () => Math.floor(Math.random() * 10));
  };

  const displayNumbers = numbers => {
      numberContainer.innerHTML = '';
      for (let number of numbers) {
          let btn = document.createElement('button');
          btn.textContent = number;
          btn.addEventListener('click', () => {
              userInput.value += number;
              userInputCalc += number;
              buttonsClicked.push(number)
              btn.disabled = true;
          });
          numberContainer.appendChild(btn);
      }
  };

  function getNumbers(string) {
    const characters = string.split('');
    const numbers = [];
  
    for (const character of characters) {
      if (character >= '0' && character <= '9') {
        numbers.push(character);
      }
    }
  
    return numbers;
  }

  function areArraysEqual(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
  
    array1.sort();
    array2.sort();
  
    return array1.every((element, index) => element === array2[index]);
  }

  function resetIncorrectBoard() {
    userInput.value = '';
    userInputCalc = "";
    Array.from(numberContainer.children).forEach(btn => btn.disabled = false);
    buttonsClicked.length = 0
  }

  const checkResult = () => {
    let equation = userInputCalc.trim().split(' ');
    let numbersUsed = getNumbers(userInputCalc.trim()).map(Number);
    let zeroCheckNumbers = equation.filter(item => !isNaN(item)); 
    let originalNumbers = Array.from(numberContainer.children).map(btn => Number(btn.textContent));

       
    // Check if all numbers are used
    if (!areArraysEqual(numbersUsed, originalNumbers)) {
        result.textContent = 'Nice Try! You must use all the generated numbers.';
        result.style.color = 'red';
        resetIncorrectBoard()
        return;
    }

    // Check if zero is not at the front of a number, or if it is, that it is by itself
    if (zeroCheckNumbers.some(num => num.toString().startsWith('0') && num != "0")) {
        result.textContent = 'Nice Try! Zero cannot be at the front of a number.';
        result.style.color = 'red';
        resetIncorrectBoard()
        return;
    }
  
    // Check if there aren't two operators in a row
    for (let i = 0; i < buttonsClicked.length - 1; i++) {
      // Ignore brackets
      if (buttonsClicked[i] === '(' || buttonsClicked[i] === ')' || buttonsClicked[i + 1] === '(' || buttonsClicked[i + 1] === ')') {
          continue;
      }
  
      if (typeof buttonsClicked[i] === 'string' && typeof buttonsClicked[i + 1] === 'string') {
        result.textContent = 'Invalid equation. You cannot use two operators in a row.';
        result.style.color = 'red';
        resetIncorrectBoard()
        return;
      }
  }
  
    
    for (let i = 0; i < buttonsClicked.length - 1; i++) {
      if (typeof buttonsClicked[i] === 'string' && typeof buttonsClicked[i + 1] === 'string') {

      }
    }
    
    if (zeroCheckNumbers.some(num => num == "")) {
      
  }


    // Check if equation equals 10
    try {
        if (eval(equation.join(' ')) === 10) {
            result.textContent = 'Correct! Good job!';
            result.style.color = 'green';
            setTimeout(generateAndDisplayNumbers, 2000);
        } else {
            result.textContent = 'That\'s not 10! That was ' + eval(equation.join(' '));
            result.style.color = 'red';
        }
    } catch (e) {
        result.textContent = 'Invalid equation. Try again!';
        result.style.color = 'red';
    }

    userInput.value = '';
    userInputCalc = "";
    Array.from(numberContainer.children).forEach(btn => btn.disabled = false);
};

const generateAndDisplayNumbers = () => {
  let numbers;
  const search = window.location.search; // Get part of URL after question mark
  if (search && search.match(/^\?[0-9]-[0-9]-[0-9]-[0-9]$/)) { // Check if URL format is correct
      numbers = search.slice(1).split('-').map(Number); // Get numbers from URL
      displayNumbers(numbers);
      result.textContent = '';
  } else {
      numbers = generateNumbers(); // Generate random numbers
      window.location.href = `${window.location.origin}/?${numbers.join('-')}`;
  }
};

const regenerateAndDisplayNumbers = () => {
  let numbers;
  numbers = generateNumbers(); // Generate random numbers
  console.log(numbers)
  window.location.href = `${window.location.origin}/?${numbers.join('-')}`;
};

operatorContainer.addEventListener('click', event => {
    if (event.target.className === 'operator') {
        userInputCalc += ` ${event.target.value} `;
        userInput.value += ` ${event.target.textContent} `;
        buttonsClicked.push(`${event.target.value}`)
    }
});

  submitBtn.addEventListener('click', checkResult);
  tryBtn.addEventListener('click', regenerateAndDisplayNumbers);
  resetBtn.addEventListener('click', resetIncorrectBoard);
  generateAndDisplayNumbers();
};
