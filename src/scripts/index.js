import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  removeCard,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  createCardElement,
  deleteCard,
  updateLikeState,
  hasUserLike,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import {
  enableValidation,
  clearValidation,
  disableSubmitButton,
  enableSubmitButton,
} from "./components/validation.js";

// Конфигурация валидации: селекторы и классы вынесены сюда,
// чтобы validation.js не зависел от разметки
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// DOM elements
const placesWrap = document.querySelector(".places__list");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoUsersList = cardInfoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
);
const userPreviewTemplate = document.querySelector(
  "#popup-info-user-preview-template"
);

let currentUserId = null;
let cardToRemove = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.content
    .querySelector(".popup__info-item")
    .cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (name) => {
  const userItem = userPreviewTemplate.content
    .querySelector(".popup__list-item")
    .cloneNode(true);
  userItem.textContent = name;
  return userItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeIcon = (likeButton, cardElement, cardData) => {
  const isLiked = hasUserLike(cardData.likes, currentUserId);
  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      updateLikeState(
        likeButton,
        cardElement,
        updatedCard.likes,
        currentUserId
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleRemoveCard = (cardElement, cardData) => {
  cardToRemove = { element: cardElement, id: cardData._id };
  openModalWindow(removeCardModalWindow);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      cardInfoTitle.textContent = "Информация о карточке";
      cardInfoModalInfoList.replaceChildren();
      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", String(cardData.likes.length))
      );
      cardInfoUsersList.replaceChildren();
      if (cardData.likes.length === 0) {
        cardInfoText.textContent = "Пока никто не поставил лайк";
      } else {
        cardInfoText.textContent = "Лайкнули:";
        cardData.likes.forEach((user) => {
          cardInfoUsersList.append(createUserPreview(user.name));
        });
      }
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmittingStatus(profileSubmitButton, true);
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setSubmittingStatus(profileSubmitButton, false);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmittingStatus(avatarSubmitButton, true);
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setSubmittingStatus(avatarSubmitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmittingStatus(cardSubmitButton, true, "Создание...");
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeIcon,
          onDeleteCard: handleRemoveCard,
          onInfoClick: handleInfoClick,
        })
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setSubmittingStatus(cardSubmitButton, false);
    });
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmittingStatus(removeCardSubmitButton, true, "Удаление...");
  removeCard(cardToRemove.id)
    .then(() => {
      deleteCard(cardToRemove.element);
      cardToRemove = null;
      closeModalWindow(removeCardModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setSubmittingStatus(removeCardSubmitButton, false);
    });
};

// Показывает процесс сохранения: меняет текст кнопки,
// а активность кнопки управляется функциями модуля validation
const setSubmittingStatus = (
  buttonElement,
  isLoading,
  loadingText = "Сохранение..."
) => {
  const initialText = buttonElement.dataset.initialText || buttonElement.textContent;
  if (isLoading) {
    buttonElement.dataset.initialText = buttonElement.textContent;
    buttonElement.textContent = loadingText;
    disableSubmitButton(validationSettings, buttonElement);
  } else {
    buttonElement.textContent = initialText;
    delete buttonElement.dataset.initialText;
    enableSubmitButton(validationSettings, buttonElement);
  }
};

// Event listeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Включаем валидацию всех форм на странице
enableValidation(validationSettings);

// Initial load: user + cards together
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeIcon,
          onDeleteCard: handleRemoveCard,
          onInfoClick: handleInfoClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Close popups on overlay / cross / Escape
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});