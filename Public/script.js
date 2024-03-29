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