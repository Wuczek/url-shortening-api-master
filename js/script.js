"use strict";

const navbarMenu = document.querySelector(".navbar__menu");
const hamburgerIcon = document.querySelector(".hamburger-icon");

const inputField = document.querySelector("#inputField");
const inputButton = document.querySelector("#inputButton");
const textError = document.querySelector(".p-error");

const linksContainer = document.querySelector(".shorten-links__links");

const shortenedLinksMap = new Map();

hamburgerIcon.addEventListener("click", () => {
  navbarMenu.classList.toggle("active");
});

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

const copyButtonHandler = () => {
  const copyButtons = document.querySelectorAll("#copyButton");

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "Copied!";
      button.disabled = true;
      button.classList.toggle("violet-bg");
      setTimeout(() => {
        button.textContent = "Copy";
        button.disabled = false;
        button.classList.toggle("violet-bg");
      }, 4000);
    });
  });
};

inputButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const inputUrl = readDataFromInput();
  if (inputUrl) {
    if (checkUrl(inputUrl)) {
      try {
        const data = await fetchShortenedLink(inputUrl);
        if (data) {
          addShortenedLink(inputUrl, data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      inputFieldError("Wrong URL format");
    }
  } else {
    inputFieldError("Please add a link");
  }
});

const saveMapToLocalStorage = () => {
  const stringifiedMap = JSON.stringify([...shortenedLinksMap]);
  localStorage.setItem("links", stringifiedMap);
};

const loadMapFromLocalStorage = () => {
  const storedData = localStorage.getItem("links");
  if (storedData) {
    shortenedLinksMap.clear();
    const parsedMap = new Map(JSON.parse(storedData));
    parsedMap.forEach((value, key) => {
      shortenedLinksMap.set(key, value);
    });
  }
  updateLinks();
};

const addShortenedLink = (url, shortenedUrl) => {
  const id = new Date();
  const newLink = `<div class="shorten-links__links--shorted">
    <p>${url}</p>
    <hr />
    <p>${shortenedUrl}</p>
    <button id="copyButton" class="cyan-button" onclick="copyToClipboard('${shortenedUrl}')">Copy</button>
    <button class="delete-button" onclick="deleteLink('${id}')">Delete</button>
  </div>`;

  shortenedLinksMap.set(`${id}`, newLink);
  updateLinks();
};

const deleteLink = (id) => {
  shortenedLinksMap.delete(id);
  updateLinks();
};

const updateLinks = () => {
  let linksHTML = "";
  shortenedLinksMap.forEach((linkHTML) => {
    linksHTML += linkHTML;
  });
  linksContainer.innerHTML = linksHTML;

  copyButtonHandler();
  saveMapToLocalStorage();
};

const checkUrl = (url) => {
  const startsWithHttp =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  const startsWithoutHttp =
    /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (startsWithHttp.test(url) || startsWithoutHttp.test(url)) {
    return true;
  } else return false;
};

const inputFieldError = (errorText) => {
  textError.textContent = errorText;
  inputField.classList.toggle("error");
  textError.classList.toggle("visible");
  setTimeout(() => {
    inputField.classList.toggle("error");
    textError.classList.toggle("visible");
  }, 4000);
};

const readDataFromInput = () => {
  const inputUrl = inputField.value.trim();

  if (!inputUrl || inputUrl.length === 0) {
    return null;
  }
  return inputUrl;
};

async function fetchShortenedLink(url) {
  const apiUrl = `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(
    url
  )}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.ok) {
      return data.result.full_short_link3;
    } else {
      throw new Error("Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
