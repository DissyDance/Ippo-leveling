/**
 * Tests unitaires des fonctions pures (xp.utils, etc.).
 * ts-jest en environnement node : pas de babel.config.js, pas de transform RN.
 * Les utils métier ne dépendent d'aucun module natif, ce preset suffit.
 */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          isolatedModules: true,
          rootDir: '.',
          types: ['jest', 'node'],
        },
      },
    ],
  },
}
