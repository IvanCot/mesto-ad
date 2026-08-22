/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  getCardList,
  postNewCard,
  deleteCardRequest,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  createCardElement,
  deleteCard,
  likeCard,
  updateLikeCount,
  createInfoString,
  createUserBadge,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
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

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(
  ".popup_type_edit-avatar"
);
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

// Модальное окно подтверждения удаления
const removeCardModalWindow = document.querySelector(
  ".popup_type_remove-card"
);
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

// Модальное окно со статистикой карточки
const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalList = cardInfoModalWindow.querySelector(".popup__list");

let currentUserId = null;
// Карточка, которую пользователь собирается удалить (для подтверждения)
let cardToRemove = null;

// Форматирование даты создания карточки: ДД месяц ГГГГ
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Изменение текста и состояния кнопки на время запроса (UX форм)
const renderLoading = (button, isLoading, initialText = "Сохранить") => {
  button.textContent = isLoading ? "Сохранение..." : initialText;
  button.disabled = isLoading;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Редактирование профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true);

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
      renderLoading(profileSubmitButton, false);
    });
};

// Обновление аватара
const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true);

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false);
    });
};

// Добавление новой карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardSubmitButton, true, "Создать");

  postNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          { ...cardData, currentUserId },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeButtonClick,
            onDeleteCard: handleDeleteCardClick,
            onInfoButton: handleInfoClick,
          }
        )
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false, "Создать");
    });
};

// Лайк: запрос на сервер, затем обновление сердечка и счётчика
const handleLikeButtonClick = (likeButton, cardElement) => {
  const cardId = cardElement.dataset.cardId;
  const isLiked = likeButton.classList.contains(
    "card__like-button_is-active"
  );

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeCard(likeButton);
      updateLikeCount(cardElement, updatedCard.likes);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Клик по иконке удаления: открываем попап подтверждения
const handleDeleteCardClick = (cardElement) => {
  cardToRemove = cardElement;
  openModalWindow(removeCardModalWindow);
};

// Подтверждение удаления карточки
const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  if (!cardToRemove) return;

  renderLoading(removeCardSubmitButton, true, "Да");

  deleteCardRequest(cardToRemove.dataset.cardId)
    .then(() => {
      deleteCard(cardToRemove);
      cardToRemove = null;
      closeModalWindow(removeCardModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(removeCardSubmitButton, false, "Да");
    });
};

// Статистика карточки: получаем актуальные данные с сервера
const handleInfoClick = (cardElement) => {
  const cardId = cardElement.dataset.cardId;

  getCardList()
    .then((cards) => {
      // Находим актуальную версию карточки среди данных с сервера
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        return Promise.reject(`Ошибка: карточка ${cardId} не найдена`);
      }

      // Заполняем список информации о карточке
      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalInfoList.append(
        createInfoString("Название:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      // Заполняем список пользователей, поставивших лайк
      cardInfoModalList.innerHTML = "";
      if (cardData.likes.length > 0) {
        cardInfoModalText.textContent = "";
        cardData.likes.forEach((user) => {
          cardInfoModalList.append(createUserBadge(user.name));
        });
      } else {
        cardInfoModalText.textContent = "Пока никто не поставил лайк";
      }

      cardInfoModalTitle.textContent = cardData.name;
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Первоначальная загрузка данных пользователя и карточек
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    // Отображаем данные пользователя
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Отображаем карточки с сервера
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          { ...cardData, currentUserId },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeButtonClick,
            onDeleteCard: handleDeleteCardClick,
            onInfoButton: handleInfoClick,
          }
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
