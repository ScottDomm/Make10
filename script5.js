window.onload = () => {

//Variables just needed for initiation:
const numberContainer = document.getElementById('number-container');
const operatorContainer = document.getElementById('operator-container');
const tryAgainBtn = document.getElementById('try-btn');
const resetBtn = document.getElementById('reset-btn');  
const difficultyBlock = document.getElementById('difficulty-block');
const difficultyStaticBlock = document.getElementById('difficulty-static-block');  
const completeBlock = document.getElementById('completed-block'); 
const progressBlock = document.getElementById('progress-block'); 
document.getElementById('close-button').addEventListener('click', function() {
  document.getElementById('popup').style.display='none';
});


//Global Variables we will use:
const userInput = document.getElementById('user-input'); //This is what is being displayed (i.e. has x and ^ in it)
let userInputCalc = ""; // This is the actual formula to evaluate.
let tableData = null; //This is the list of arrays and ease
let lookupTable = {};
const buttonsClicked = []; // This is an array of all the buttons that have been clicked.
const numbersClicked = []; // This is an array of all the buttons that have been clicked.
let difficulty = "";
let completedSwitch = 0; //This will equal 1 if the numbers have been used before. 
let currentCookieString = "";

const generateNumbers = (lookupTable, cookieString) => {
  // Convert the cookie string into an array of sorted number strings
  let cookieNumbers = [];
  for (let i = 0; i <= cookieString.length - 4; i += 4) {
    let currentNumbers = cookieString.slice(i, i + 4).split('').sort((a, b) => a - b);
    cookieNumbers.push(JSON.stringify(currentNumbers.map(Number)));
  }

  // Get the keys of the lookup table where difficulty is not "Impossible"
  let tableKeys = Object.keys(lookupTable).filter(key => lookupTable[key] !== "Impossible");

  // Filter the keys to get the ones that are not in the cookie string
  let unusedKeys = tableKeys.filter(key => !cookieNumbers.includes(key));

  // If there are no unused keys, return an empty array
  if (unusedKeys.length === 0) {
    return [0,0,0,0];
  }

  // Otherwise, randomly select one of the unused keys and convert it into an array of numbers
  let newNumbers = JSON.parse(unusedKeys[Math.floor(Math.random() * unusedKeys.length)]);

  // Shuffle the numbers
  for (let i = newNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newNumbers[i], newNumbers[j]] = [newNumbers[j], newNumbers[i]];
  }

  return newNumbers;
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
        evaluateEquation()
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

    checkCompleted(numbers, currentCookieString)
  
    numberContainer.innerHTML = '';
    for (let number of numbers) {
        let btn = document.createElement('button');
        btn.className = 'number';
        btn.textContent = number;
        btn.addEventListener('click', numberClick(number, btn));
        numberContainer.appendChild(btn);
    }
};


function checkCompleted(numbers, cookieString) {
  
  sortedNumbers = [...numbers];
  sortedNumbers.sort(function(a, b) { return a - b });
  sortedNumbers = sortedNumbers.join("")
  // Iterate over the cookie string in steps of 4
  
  for (let i = 0; i <= cookieString.length - 4; i += 4) {
    // Get the current group of 4 numbers in the cookie string
    var currentNumbers = cookieString.slice(i, i + 4);
    // Check if the current group of numbers matches the provided number string
    if (currentNumbers == sortedNumbers) {
      completedSwitch = 1;
      completeBlock.style.display = "block";
    }
  }
}

function storeInCookie(numbersClicked) {
  // Check if there are 4 numbers clicked, if not, return.
  if(numbersClicked.length != 4) return;

  // Sort the numbers in ascending order.
  numbersClicked.sort(function(a, b) { return a - b });

  // Check if there's a pre-existing cookie.
  var existingCookie = document.cookie.replace(/(?:(?:^|.*;\s*)numbersClicked\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  var cookieContent = "";

  // If cookie exists, append the new numbers to it, else create a new one.
  if(existingCookie != "") {
    cookieContent = existingCookie + numbersClicked.join('');
  } else {
    cookieContent = numbersClicked.join('');
  }

  // Set the expiry date to 10 years from now.
  var expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);

  // Store the updated string in the cookie.
  document.cookie = "numbersClicked=" + cookieContent + "; expires=" + expiryDate.toUTCString() + "; path=/";
}


function printCookieContent() {
  // Retrieve the cookie content.
  var existingCookie = document.cookie.replace(/(?:(?:^|.*;\s*)numbersClicked\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  
  // If cookie exists, print its contents.
  if(existingCookie != "") {
    console.log(existingCookie);
    progressBlock.textContent = "You Have Complete: " + existingCookie.length/4 + " / 597"
    currentCookieString = existingCookie

  } else {
    console.log("No cookie found.");
    progressBlock.textContent = "You Have Complete: 0 / 597"
    currentCookieString = ""
  }
}

//This is the final check that the equiation equals 10
const checkResult = () => {
      
  let finalNumber = evaluateEquation()

  // Check if equation equals 10
  if (finalNumber === 10) {
    if (completedSwitch === 0) {
      storeInCookie(numbersClicked);
      var existingCookie = document.cookie.replace(/(?:(?:^|.*;\s*)numbersClicked\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      progressBlock.textContent = "You Have Complete: " + existingCookie.length/4 + " / 597"
    }
    winScreen()
  } else {
      failScreen('That\'s not 10! That was ' + formatNumber(eval(finalNumber)));
  }

};

function formatNumber(num) {
  // For numbers in scientific notation
  if (Math.abs(num) >= 1e+21) {
      let scientificString = num.toPrecision(3); // limit to 3 significant figures
      let [coeff, exponent] = scientificString.split('e');
      let [whole, decimal] = coeff.split('.');

      // If the decimal part is undefined or has less than 2 digits, pad it with zeros
      if (!decimal) {
          decimal = '00';
      } else if (decimal.length < 2) {
          decimal += '0';
      }

      return `${whole}.${decimal.slice(0, 2)}e${exponent}`;
  }
  // For integer numbers
  else if (Number.isInteger(num)) {
      return num.toString();
  }
  // For decimal numbers
  else {
      return num.toFixed(2);
  }
}

function winScreen() {
// Wherever you check for a correct answer in your code...
  let popup = document.getElementById('popup');
  let popupContent = document.querySelector('.popup-content');

  popup.style.display='block';
  popupContent.style.animation = 'fadeInFromBottom 0.2s';

  // Make the popup fade out after 2 seconds
  setTimeout(function() {
      popupContent.style.animation = 'fadeOutToBottom 0.2s forwards';
  }, 1000);

  // Hide the popup completely after the fade-out animation
  setTimeout(function() {
      popup.style.display='none';
  }, 1200);

  resetBtn.style.backgroundColor ="#FF8E25"
  tryAgainBtn.style.backgroundColor = "#22a6a8"
  numberContainer.style.display = "None";
  operatorContainer.style.display = "None";
  resetBtn.textContent ="Same Numbers"
  tryAgainBtn.textContent ="New Numbers"
  userInput.style.border = "None";
  tryAgainBtn.style.color = "#ffffff"
  userInput.classList.add("win");
}

function completeScreen() {
  resetBtn.style.display ="None"
  numberContainer.style.display = "None";
  operatorContainer.style.display = "None";
  userInput.style.display = "None";
  difficultyBlock.style.display = "None"
  difficultyStaticBlock.style.display = "None"
  progressBlock.classList.add("checkin");

  var existingCookie = document.cookie.replace(/(?:(?:^|.*;\s*)numbersClicked\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  completed = existingCookie.length/4;

  if (completed < 597) {
    tryAgainBtn.textContent ="New Numbers"
    tryAgainBtn.style.marginTop = "30px"
    tryAgainBtn.style.backgroundColor = "#22a6a8"
    tryAgainBtn.style.color = "#ffffff"
  } else {
    tryAgainBtn.style.display ="None"
  }

}

function failScreen(failString) {
  numberContainer.style.display = "None";
  operatorContainer.style.display = "None";
  userInput.value = failString;
  userInput.style.border = "None";
  userInput.classList.add("lose");
}

// This evalutes the current formula in the user input.
function evaluateEquation() {
  let equation = userInputCalc.trim().split(' ');
  let currentValue = eval(equation.join(' '));

  // Display the equation for a moment
  userInput.value = equation.join(' ');
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
      printCookieContent()
      initiateNumbers(numbers);
  } else {
      printCookieContent()  
      numbers = generateNumbers(lookupTable, currentCookieString); // Generate random numbers
      console.log(numbers)
      window.location.href = `${window.location.origin}/?${numbers.join('-')}`;
  }
  
  let key = JSON.stringify(numbers.sort((a, b) => a - b));

  // Look up the difficulty.
  difficulty = lookupTable[key];
  console.log(key)

  if (key === "[0,0,0,0]") {
    completeScreen()
  } else if (difficulty === "Impossible") {
    difficultyBlock.textContent = "This is " + difficulty + "! Try another."
  } else {
    difficultyBlock.textContent = difficulty
  }
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

    //let tempCookieContent = "0157001500240148016801780236034504571479156622892358247724993357366937794467568856995889589901583679378946890018002700360045018802770336036604451178133813471399144714991567166816991778233923882557266933443347348845884799489955895679577866886689677967996889689977897799138945791158116812771336133713781489159922352278236724552469256827792889346634673499355539994459466746794779499955565578566967886999777878997999012301260568112211341188126914571589235523992579267827883349336733683448347735783677377845594566578901350267127934596789025603470357037804670556055812781288144514661556155822792449246725592578266733693449355938994469448945684577466948895567557978891259346845690237026902780346035903890479048905890689116613451346144815551888225622772333236824562478255626892699277727992999333433353336333833583378338834793567359936883699444844664478566657775888889913693589013302790369045504881157158816892238224523343389345734893556455745994668467801241359137914562379248925890115123714551478179922472259226722992377335633994456448844990247146923890238114812281299134413771678178822492346235924473348344534553566357936683678444944574458457847785559556956675999777988898999134823572378245835680225022702280258028803370377045604660579114911691179125513351467245933793889447945674589478956895779669902490259046911591357148815571577226923472789334534584468036812560299039904990599069907991117114415792227222922662268233723692479267733333339335934693666444555586668667988881258245735690229033904490557066907790889118912331366144622482258234424880246128923482468002900390049005900690079008915682366256734463689023403791249126756780147022402550266035603580458047705550578068812221246222624462569455566690156026801381139123822342236233626790139017923560149015901690446112301890289055913332239228823491236126823453456046811331477168802230239025703340349036705690679078922230127013602440459119912661578014513581468011811351679178924661349136800090248112415692233244499990245123912471367125713560235122512270355089911151126145900992244189925771248122424452566259927783346335534473667378837994455455646995566557755881458223701292558258828993557467755990199133413552448123412232222233812441235133914491779188946880999155916692224233512450025002800370046005512292255114711561138266802262246112901370146012501280155288833373777444646660019113611271145255512262225222819991118555511251137114611281155"
    //var expiryDate = new Date();
    //expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    //document.cookie = "numbersClicked=" + tempCookieContent + "; expires=" + expiryDate.toUTCString() + "; path=/";

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
