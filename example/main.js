import SimpleTranslator from "../src/SimpleTranslator.js";

const timeProvider = () => {
  const currentDate = new Date();

  const hours = `${currentDate.getHours() < 10 ? `0${currentDate.getHours()}` : currentDate.getHours()}`;
  const minutes = `${currentDate.getMinutes() < 10 ? `0${currentDate.getMinutes()}` : currentDate.getMinutes()}`;

  return `${hours}:${minutes}`;
};

const translations = {
  en: {
    HEADER_DESCRIPTION: 'Here goes page header!',
    ABOUT_SECTION: 'Hello there, this is my about Page.',
    FOOTER_CONTENTS: () => `All rights reserved &copy; 2020 - Time: ${timeProvider()}`
  },
  de: {
    HEADER_DESCRIPTION: 'Hier geht der Seitenkopf!',
    ABOUT_SECTION: 'Hallo, das ist meine About-Seite.',
    FOOTER_CONTENTS: () => `Alle Rechte vorbehalten &copy; 2020 - Zeit: ${timeProvider()}`
  },
  rs: {
    HEADER_DESCRIPTION: 'Ovde ide heder!',
    ABOUT_SECTION: 'Pozdrav, ovo je stranica o meni.',
    FOOTER_CONTENTS: () => `Sva prava zadrzana &copy 2020 - Vreme: ${timeProvider()}`
  }
};

const simpleTranslator = new SimpleTranslator({ language: 'en', translations });

const areaHtml = `<header>
<span translateId="HEADER_DESCRIPTION">Here goes page header!</span>
</header>
<div class="content" translateId="ABOUT_SECTION">Hello there, this is my about Page</div>
<footer translateId="FOOTER_CONTENTS">All rights reserved &copy; 2020</footer>`;

window.addEventListener('load', () => {
  const chunkSizeInput = document.getElementById('chunkSize');
  const chunkSizeButton = document.getElementById('updateChunkSize');
  const languageSelect = document.getElementById('languageSwitch');
  const sectionsContentsDiv = document.getElementById('sectionsContents');
  const sectionsCountInput = document.getElementById('sectionsCount');
  const updateButton = document.getElementById('updateSections');

  chunkSizeButton.addEventListener('click', () => {
    simpleTranslator.chunkSize = chunkSizeInput.value;
  });

  updateButton.addEventListener('click', async () => {
    sectionsContentsDiv.innerHTML = '';

    updateButton.setAttribute('disabled', true);
    updateButton.innerHTML = 'Generating Sections';

    sectionsContentsDiv.innerHTML = await new Promise(resolve => {
      let contents = '';

      const setInnerHTMLIteration = iterations => {
        if (0 === iterations.length) {
          return resolve(contents);
        }

        iterations.splice(0, 100).forEach(() => {
          contents = `${contents}${areaHtml}`;
        });

        requestAnimationFrame(setInnerHTMLIteration.bind(null, iterations));
      };

      requestAnimationFrame(setInnerHTMLIteration.bind(null, [...new Array(Number(sectionsCountInput.value))]));
    });

    updateButton.innerHTML = 'Reloading Elements';

    simpleTranslator.reloadTranslationElements();

    updateButton.removeAttribute('disabled');
    updateButton.innerHTML = 'Update Sections';

    languageSwitch.options.selectedIndex = 0;
  });

  languageSelect.onchange = event => {
    simpleTranslator.language = event.target.value;
  };
});
