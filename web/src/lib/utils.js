import BigNumber from 'bignumber.js';

export const sleep = time => new Promise(r => setTimeout(r, time));

export const toUnitAmount = (amount, decimals) => {
  retur