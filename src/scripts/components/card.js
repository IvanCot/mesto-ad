/*
  Файл card.js отвечает за создание карточки на основе template-элемента
  и за изменение DOM уже созданной карточки (лайк, количество лайков).
*/

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

// Поставить/снять визуальное состояние лайка
export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

// Обновить счётчик лайков по данным с сервера
export const updateLikeCount = (cardElement, likes) => {
  const likeCountElement = cardElement.querySelector(".card__like-count");
  if (likeCountElement) {
    likeCountElement.textContent = likes.length;
  }
};

// Удалить карточку со страницы
export const deleteCard = (cardElement) => {
  cardElement.remove();
};

// Создать элемент списка "определение - значение" из template-элемента
export const createInfoString = (term, description) => {
  const infoItem = document
    .getElementById("popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;

  return infoItem;
};

// Создать элемент-бейдж пользователя из template-элемента
export const createUserBadge = (userName) => {
  const userBadge = document
    .getElementById("popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  userBadge.textContent = userName;

  return userBadge;
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoButton }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );
  const cardImage = cardElement.querySelector(".card__image");

  // Заполняем карточку данными с сервера
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.dataset.cardId = data._id;
  cardElement.querySelector(".card__title").textContent = data.name;

  // Отображаем актуальное количество лайков
  if (likeCount && Array.isArray(data.likes)) {
    likeCount.textContent = data.likes.length;
  }

  // Если карточка уже лайкнута текущим пользователем — подсвечиваем сердечко
  if (
    Array.isArray(data.likes) &&
    data.currentUserId &&
    data.likes.some((user) => user._id === data.currentUserId)
  ) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Кнопка удаления видна только автору карточки
  if (data.owner && data.owner._id !== data.currentUserId) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(likeButton, cardElement)
    );
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement));
  }

  if (onInfoButton && infoButton) {
    infoButton.addEventListener("click", () => onInfoButton(cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
