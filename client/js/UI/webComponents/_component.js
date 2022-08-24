"use strict";
export default class component extends HTMLElement {

  boundEvents = [];

  constructor() {
    super();
  }

  clear(element = this) {
    while (element.firstChild) element.firstChild.remove();
  }

  connectedCallback() {
    this.#bindEvents();
  }

  disconnectedCallback() {
    this.#unbindEvents();
  }

  #bindEvents() {
    this.#unbindEvents();
    this.boundEvents.forEach(([element, event, callback]) => {
      if (!element || callback.constructor.name !== 'Function') return;
      element.addEventListener(event, callback.bind(this));
    });
  }

  #unbindEvents() {
    this.boundEvents.forEach(([element, event, callback]) => {
      if (!element || callback.constructor.name !== 'Function') return;
      element.removeEventListener(event, callback);
    });
  }
}

export { component };