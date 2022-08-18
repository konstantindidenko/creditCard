const cardForm = document.getElementById('cardForm'),

      // Form fields
      cardNumber = document.getElementById('cardNumber'),
      cardName = document.getElementById('cardName'),
      cardMonth = document.getElementById('cardMonth'),
      cardYear = document.getElementById('cardYear'),
      cardCvv = document.getElementById('cardCvv'),

      // Card Fields
      cardLogo = document.getElementById('cardLogo'),
      cardNameOutput = document.getElementById('cardNameOutput'),
      cardNumberOutput = document.getElementById('cardNumberOutput'),
      cardMonthOutput = document.getElementById('cardMonthOutput'),
      cardYearOutput = document.getElementById('cardYearOutput'),

      // Form number mask
      numberPattern = /^\d{0,16}$/g,
      numberSeparator = ' ',

      // Validation message
      MESSAGE_INVALID = 'Field is required',
      MESSAGE_INVALID_MIN_LENGTH_START = 'Filed must have at least ',
      MESSAGE_INVALID_MIN_LENGTH_END = ' numbers';

let cardNumberOldValue, cardNumberOldCursor;

const maskInput = (value, limit, separator) => {
    const output = [];

    for (let i = 0; i < value.length; i++) {
        if (i !== 0 && i % limit === 0) {
            output.push(separator);
        }

        output.push(value[i]);
    }

    return output.join('');
};

const changeOutputCardNumber = (value) => {
    const maskOutput = '#### #### #### ####',
          cardNumber = value + maskOutput.slice(value.length);

    cardNumberOutput.innerHTML = cardNumber.split(' ').map(maskNumber => `<span>${maskNumber}</span>`).join('');
}

const getNumberOnly = (value) => value.replace(/[^\d]/g, '');

const checkSeparator = (position, interval) => Math.floor(position / (interval + 1));

const cardNumberKeyDownHandler = (event) => {
    const formField = event.target;

    cardNumberOldValue = formField.value;
    cardNumberOldCursor = formField.selectionEnd;
};

const cardNumberInputHandler = (event) => {
    const formField = event.target;
    let newValue = getNumberOnly(formField.value),
        newCursorPosition;

    if (newValue.match(numberPattern)) {
        newValue = maskInput(newValue, 4, numberSeparator);

        newCursorPosition =
            cardNumberOldCursor - checkSeparator(cardNumberOldCursor, 4) +
            checkSeparator(cardNumberOldCursor + (newValue.length - cardNumberOldValue.length), 4) +
            (getNumberOnly(newValue).length - getNumberOnly(cardNumberOldValue).length);

        formField.value = (newValue !== '') ? newValue : '';

    } else {
        formField.value = cardNumberOldValue;
        newCursorPosition = cardNumberOldCursor;
    }

    formField.setSelectionRange(newCursorPosition, newCursorPosition);

    validateCardForm(formField);
    changeOutputCardNumber(formField.value);
    checkCardType(formField.value);
};

const checkCardType = (value) => {
    const cardTypePatterns = { visa: /^4/, mastercard: /^5/ };
    let cardType = '';

    for (const type in cardTypePatterns) {
        if (cardTypePatterns[type].test(value)) {
            cardType = type;
            break;
        }
    }

    cardLogo.hidden = !cardType;
    cardLogo.src = cardType ? `./assets/images/card-type_${cardType}.png` : '';
    cardLogo.alt = cardType ? `${cardType}` : ''
};

const validateCardForm = (formField) => {
    let errorMessage;

    if (formField.minLength && getNumberOnly(formField.value).length < formField.minLength) {
        errorMessage = MESSAGE_INVALID_MIN_LENGTH_START + formField.minLength + MESSAGE_INVALID_MIN_LENGTH_END;
    }

    if (formField.required && formField.value.trim() === '') {
        errorMessage = MESSAGE_INVALID;
    }

    if (errorMessage) {
        showErrorMessage(formField, errorMessage);
    } else {
        showErrorMessage(formField,null);
    }

    return !errorMessage;
}

const showErrorMessage = (formField, message) => {
    const errorContent = formField.parentElement.querySelector('small')

    if (errorContent) {
        errorContent.textContent = message
    }

    if (message) {
        formField.classList.add('invalid');
    } else {
        formField.classList.remove('invalid')
    }
}

const setCardInformation = (event) => {
    const formField = event.target;

    if (formField.id === 'cardCvv' && !+formField.value) {
        formField.value = getNumberOnly(formField.value);
    } else {
        validateCardForm(formField);

        switch (formField.id) {
            case 'cardName':
                cardNameOutput.innerHTML = formField.value || 'Full Name';
                break;
            case 'cardMonth':
                cardMonthOutput.innerHTML = formField.value ? formField.value : 'MM';
                break;
            case 'cardYear':
                const currentDate = new Date(),
                      currentMonth = currentDate.getMonth() + 1,
                      isCurrentYear = +formField.value === currentDate.getFullYear()

                cardMonth.querySelectorAll('option').forEach(option => {
                    option.hidden = isCurrentYear && option.value && option.value < currentMonth;
                })

                if (isCurrentYear && cardMonth.value < currentMonth) {
                    cardMonth.value = '';
                    cardMonth.dispatchEvent(new Event('change'));
                }

                cardYearOutput.innerHTML = formField.value ? formField.value : 'YY';
                break;
        }
    }
}

const formSubmit = (event) => {
    const form = event.target;
    let isValid = true;

    Array.from(form.elements).forEach(field => {
        const isValidField = validateCardForm(field);
        if (!isValidField) {
            isValid = false;
        }
    })

    if (!isValid) {
        console.error('Form is not valid')
        event.preventDefault();
    }
}

cardNumber.addEventListener('keydown', cardNumberKeyDownHandler);
cardNumber.addEventListener('input', cardNumberInputHandler);
cardName.addEventListener('input', setCardInformation);
cardCvv.addEventListener('input', setCardInformation);
cardMonth.addEventListener('change', setCardInformation);
cardYear.addEventListener('change', setCardInformation);
cardForm.addEventListener('submit', formSubmit);
