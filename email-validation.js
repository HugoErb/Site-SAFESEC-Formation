'use strict';

/**
 * Valide la structure d'une adresse e-mail sans effectuer de requête réseau.
 *
 * @param {unknown} value Adresse à valider.
 * @returns {boolean} Indique si la structure est acceptable.
 */
function isValidEmail(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 254 || /[\r\n\s]/.test(value)) {
    return false;
  }

  const atIndex = value.lastIndexOf('@');
  if (atIndex < 1 || atIndex !== value.indexOf('@')) {
    return false;
  }

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (
    localPart.length > 64
    || localPart.startsWith('.')
    || localPart.endsWith('.')
    || localPart.includes('..')
    || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)
  ) {
    return false;
  }

  const labels = domain.split('.');
  return labels.length >= 2
    && labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
    && /^[A-Za-z]{2,63}$/.test(labels.at(-1));
}

module.exports = { isValidEmail };
