import { Wallet } from 'ethers';

const unsignedTransaction = {
    to: "0x13eB65FEbc1d31430972a7673A284c85fcc68Ddb",
    data: "0x9f3baccc000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000316469643a6d6564636861696e3a33653537386239322d363430642d343630622d386630632d613862393432633032343130000000000000000000000000000000",
    from: "0x0838218E8c24Ffa97272B8212947E0f92a5Ffe55",
    chainId: 1337,
    gasLimit: "0x4c4b40",
    gasPrice: "0x0",
    maxFeePerGas: "0x0",
    maxPriorityFeePerGas: "0x0",
    nonce: 0
};

async function main() {
    const UserWallet = new Wallet("0x90bde32a6094d96b78cecf241f2aa750f09307bf9ebb7809025d468ef4da6c0a");
    const signedTx = await UserWallet.signTransaction(unsignedTransaction);

    console.log("Signed Transaction:", signedTx);
}

main();









