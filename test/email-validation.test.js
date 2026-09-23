'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidEmail } = require('../email-validation');

test('accepte les adresses e-mail valides', () => {
  for (const email of ['prenom.nom@example.fr', 'contact+formation@entreprise.co.uk', 'a@b.io']) {
    assert.equal(isValidEmail(email), true, email);
  }
});

test('refuse les structures d’adresses e-mail invalides', () => {
  for (const email of [
    '', 'prenom', '@example.fr', 'prenom@', 'prenom..nom@example.fr',
    '.prenom@example.fr', 'prenom.@example.fr', 'prenom@example..fr',
    'prenom@-example.fr', 'prenom@example-.fr', 'prenom@example.c',
    'prenom @example.fr', 'prenom@example.fr\nBCC: autre@example.fr'
  ]) {
    assert.equal(isValidEmail(email), false, email);
  }
});
