// Metro configuration — Expo SDK 56.
// Aucun babel.config.js dans ce projet : sa présence casse expo-router en SDK 56.
// Les alias de chemin (@/*) sont résolus via tsconfig.json, lu nativement par Metro.
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

module.exports = config
