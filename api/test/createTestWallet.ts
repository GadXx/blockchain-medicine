import { ethers } from 'ethers';

const newWallet = async () => {
    const wallet = ethers.Wallet.createRandom();
    console.log(wallet.address);
    console.log(wallet.privateKey);
    return wallet;
}

newWallet();