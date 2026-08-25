// Универсальный модуль валидации форм.
// Все селекторы и классы приходят извне через объект settings,
// конкретных полей и форм модуль не знает.

// Показать ошибку для конкретного поля
const showInputError = (settings, formElement, inputElement, errorMessage) => {
  const errorElement = formElement.querySelector("#" + inputElement.id + "-error");
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

// Скрыть ошибку для конкретного поля
const hideInputError = (settings, formElement, inputElement) => {
  const errorElement = formElement.querySelector("#" + inputElement.id + "-error");
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
};

// Проверка одного поля: берём сообщение из validity,
// для pattern подставляем кастомный текст из data-error-message
const checkInputValidity = (settings, formElement, inputElement) => {
  if (inputElement.validity.patternMismatch) {
    showInputError(
      settings,
      formElement,
      inputElement,
      inputElement.dataset.errorMessage
    );
  } else if (!inputElement.validity.valid) {
    showInputError(settings, formElement, inputElement, inputElement.validationMessage);
  } else {
    hideInputError(settings, formElement, inputElement);
  }
};

// Есть ли хотя бы одно невалидное поле в форме
const hasInvalidInput = (inputList) =>
  inputList.some((inputElement) => !inputElement.validity.valid);

// Заблокировать кнопку отправки
const disableSubmitButton = (settings, buttonElement) => {
  buttonElement.disabled = true;
  buttonElement.classList.add(settings.inactiveButtonClass);
};

// Разблокировать кнопку отправки
const enableSubmitButton = (settings, buttonElement) => {
  buttonElement.disabled = false;
  buttonElement.classList.remove(settings.inactiveButtonClass);
};

// Включить/выключить кнопку по состоянию всех полей формы
const toggleButtonState = (settings, inputList, buttonElement) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(settings, buttonElement);
  } else {
    enableSubmitButton(settings, buttonElement);
  }
};

// Навесить слушатели input на все поля формы
const setEventListeners = (settings, formElement) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(settings, inputList, buttonElement);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(settings, formElement, inputElement);
      toggleButtonState(settings, inputList, buttonElement);
    });
  });
};

// Очистить ошибки формы и заблокировать кнопку.
// Вызывается при открытии попапа и после успешного сабмита.
const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(settings, formElement, inputElement);
  });

  disableSubmitButton(settings, buttonElement);
};

// Включить валидацию всех форм на странице
const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));

  formList.forEach((formElement) => {
    setEventListeners(settings, formElement);
  });
};

export {
  enableValidation,
  clearValidation,
};
