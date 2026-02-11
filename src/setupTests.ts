import "@testing-library/jest-dom";

// Mock scrollIntoView because JSDOM doesn't support it
window.HTMLElement.prototype.scrollIntoView = function() {};