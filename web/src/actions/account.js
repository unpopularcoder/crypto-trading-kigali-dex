import { getAllowance, getTokenBalance } from '../lib/wallet';
import { saveLoginData } from '../lib/session';
import BigNumber from 'bignumber.js';
import api from '../lib/api';
import { getSelectedAccount, getSelectedAccountWallet } from '@gongddex/hydro-sdk-wallet';

// request ddex private auth token
export const loginRequest = () => {
  return async (dispatch, getState) => {
    const message = 'HYDRO-AUTHENTICATION';
    const state = getState();
    const selectedAccount = getSelectedAccount(state);
    const address = selectedAccount ? selectedAccount.get('address') : null;
    const wallet = getSelectedAccountWallet(state);
    if (!wallet) {
      return;
    }
    const signature = await wallet.signPersonalMessage(message);
    if (!signatu