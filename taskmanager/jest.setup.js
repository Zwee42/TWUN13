// Ta bort @testing-library/jest-dom eftersom vi testar API:er, inte React komponenter
// import '@testing-library/jest-dom';

// Enkel fetch mock
global.fetch = jest.fn();

// Simple console mock to reduce test noise
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});