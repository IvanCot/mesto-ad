const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};


export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const updateLikeState = (likeButton, cardElement, likes, userId) => {
  likeButton.classList.toggle(
    "card__like-button_is-active",
    hasUserLike(likes, userId)
  );
  cardElement.querySelector(".card__like-count").textContent = likes.length;
};

// Определяет наличие лайка пользователя в данных карточки
export const hasUserLike = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick, currentUserId }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  cardElement.querySelector(".card__like-count").textContent = data.likes.length;

  if (hasUserLike(data.likes, currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  const isOwner = data.owner._id === currentUserId;

  if (!isOwner) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(likeButton, cardElement, data)
    );
  }

  if (isOwner && onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data));
  }

  if (onInfoClick && infoButton) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};