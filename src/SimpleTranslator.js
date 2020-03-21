/**
 * Library used to translate any page contents without any difficulties.
 *
 * @TODO:
 *  - Remove iterations and rely on streams.
 *
 * @version 0.0.1
 */
const propTranslations = Symbol();
const propDefaultLanguage = Symbol();
const propLanguage = Symbol();
const propTranslationElements = Symbol();
const propChunksPerIteration = Symbol();

/**
 * @memberOf SimpleTranslator
 * @private
 */
function initialize() {
  window.addEventListener('load', () => {
    if (null === this.language) {
      const html = (document.getElementsByTagName('html') || [])[0];

      if (typeof html.getAttribute !== 'function') {
        throw new Error('Missing HTML tag.');
      }

      this.language = html.getAttribute('lang') || this.defaultLanguage;
    }
  });
}

export default class SimpleTranslator {
  static get ITERATION_CHUNK_SIZE() {
    return 1000;
  }

  /**
   * SimpleTranslator constructor.
   *
   * @param {object} options SimpleTranslator options.
   * @param {object} options.translations Translations definitions.
   * @param {string|null} options.language Language that should be applied.
   * @param {string} [options.defaultLanguage="en"] Default (fallback) language.
   * @param {number} [options.chunkSize=SimpleTranslator.ITERATION_CHUNK_SIZE] Chunk size.
   */
  constructor({
    translations,
    language = null,
    defaultLanguage = 'en',
    chunkSize = SimpleTranslator.ITERATION_CHUNK_SIZE
  }) {
    this.chunkSize = chunkSize;
    this.translations = translations;

    this.defaultLanguage = defaultLanguage;
    this.language = language;

    initialize.call(this);
  }

  /**
   * Setter for currently available translations.
   *
   * @param {object} translations Translations definitions.
   */
  set translations(translations) {
    if (typeof translations !== 'object' || 0 === Object.keys(translations).length) {
      throw new TypeError(`Invalid translations object: ${translations}`);
    }

    this[propTranslations] = { ...translations };
  }

  /**
   * Getter for translations definitions.
   *
   * @returns {object} Translations.
   */
  get translations() {
    return this[propTranslations];
  }

  /**
   * Setter for default language.
   *
   * @param {string} defaultLanguage Default language.
   */
  set defaultLanguage(defaultLanguage) {
    if (typeof this.translations[defaultLanguage] !== 'object') {
      throw new TypeError(`Invalid translation language ${defaultLanguage}`);
    }

    this[propDefaultLanguage] = defaultLanguage;
  }

  /**
   * Getter for default language.
   *
   * @returns {string} Default language.
   */
  get defaultLanguage() {
    return this[propDefaultLanguage];
  }

  /**
   * Setter for currenlty used language.
   *
   * @param {string} language Language identifier.
   */
  set language(language) {
    if (language && typeof this.translations[language] !== 'object') {
      throw new TypeError(`Invalid translation language ${language}`);
    }

    this[propLanguage] = language;

    this.translate();
  }

  /**
   * Getter for currently set language
   *
   * @returns {string} Currently set language
   */
  get language() {
    return this[propLanguage] || this.defaultLanguage;
  }

  /**
   * Setter for translation chunk size.
   *
   * @param {number} size Chunk size.
   */
  set chunkSize(size) {
    if (Number.isNaN(Number.parseInt(size)) || 0 >= size) {
      throw new TypeError(`Provided chunk size is invalid: ${size}`);
    }

    this[propChunksPerIteration] = size;
  }

  /**
   * Getter for translation chunk size.
   *
   * @returns {number} Chunk size.
   */
  get chunkSize() {
    return this[propChunksPerIteration];
  }

  /**
   * Retrieve translation for provided id.
   *
   * @param {object} options Options.
   * @param {string} options.translateId ID of translation.
   * @param {string} [options.language=SimpleTranslator.ITERATION_CHUNK_SIZE] Language (Note: overrides currently set language)
   */
  getTranslation({ translateId, language = null }) {
    const translation = this.translations[language || this.language][translateId];

    return typeof translation === 'function' ? translation() : translation;
  }

  /**
   * Perform DOM iteration to ensure proper translating elements.
   */
  reloadTranslationElements() {
    const translatedElements = document.querySelectorAll('[translateId]');

    this[propTranslationElements] = [...translatedElements].map(element => {
      const defaultHtml = `${element.innerHTML}`;
      const translateId = `${element.getAttribute('translateId')}`;

      return () => {
        element.innerHTML = `${this.getTranslation({ translateId }) || defaultHtml}`;
      };
    });
  }

  /**
   * Apply translations over DOM elements.   *
   */
  translate() {
    if (false === this[propTranslationElements] instanceof Array) {
      this.reloadTranslationElements();
    }

    /**
     * Perform translations over chunks of elements.
     *
     * @param {function[]} triggers Translation triggers.
     */
    const translateElementsChunk = triggers => {
      triggers.splice(0, this.chunkSize).forEach(trigger => trigger());

      if (triggers.length) {
        requestAnimationFrame(translateElementsChunk.bind(null, triggers));
      }
    };

    requestAnimationFrame(translateElementsChunk.bind(null, [...this[propTranslationElements]]));
  }
}
