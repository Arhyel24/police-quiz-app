document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.querySelector('.optionbtn');
    const radioInputs = document.querySelectorAll('.optionradio');

    submitButton.disabled = true;

    if (submitButton.disabled = true) {
        submitButton.style.backgroundColor = "#dadada";
    } else {
        submitButton.style.backgroundColor = "#1260cc";
    }

    radioInputs.forEach(function (input) {
        input.addEventListener('change', () => {
            submitButton.disabled = false;
            submitButton.style.backgroundColor = "#1260cc";
        });
    });
});

var varTimerInSeconds = 30;
var warningTimeInSeconds = 10;

function updateTimer() {
var timerElement = document.getElementById("timer");

if (varTimerInSeconds <= warningTimeInSeconds) {
  timerElement.style.color = "red";
  timerElement.classList.add("timeranim");
}

timerElement.textContent = "Timer: " + varTimerInSeconds + " seconds";

if (varTimerInSeconds <= 0) {
  document.getElementById("quiz").submit();
} else {
  setTimeout(function () {
    varTimerInSeconds--;
    updateTimer();
  }, 1000);
}
}

updateTimer();