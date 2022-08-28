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
    this.bindEvents();
  }

  disconnectedCallback() {
    console.debug('disconnectedCallback', this.constructor.name);
    this.unbindEvents();
  }

  bindEvents() {
    if (!this.parentElement) return;
    this.boundEvents.forEach(([element, event, callback]) => {
      if (!element || callback.constructor.name !== 'Function') return;
      console.debug(
        this.constructor.name,
        `add eventListener`,
        event,
        `to`,
        element.nodeName,
        element.nodeName === 'A' ? `[${element.href}]` : '',
      );
      element.addEventListener(event, callback.bind(this));
    });
  }

  unbindEvents() {
    if (!this.parentElement) return;
    console.trace(this.parentElement.nodeName);
    this.boundEvents.forEach(([element, event, callback]) => {
      if (!element || callback.constructor.name !== 'Function') return;
      console.debug(
        this.constructor.name,
        `remove eventListener`,
        event,
        `from`, 
        element.nodeName,
        element.nodeName === 'A' ? `[${element.href}]` : '',
      );
      element.removeEventListener(event, callback);
    });
  }
}

export { component };