import { HDNodeWallet, Mnemonic  } from 'ethers';

const generateWallet = (new_mnemonic: string): HDNodeWallet => {
    const mnemonic =  Mnemonic.fromPhrase(new_mnemonic);
    const wallet = HDNodeWallet.fromMnemonic(mnemonic);
    return wallet;
};

const restoreWallet = (mnemonic: string): HDNodeWallet => {
    const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic));
    return wallet;
}


export { generateWallet, restoreWallet };