import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";

const generateDID = (): string => {
    return `did:medchain:${uuidv4()}`;
}

const verifyDID = (did: string): boolean => {
    return did.startsWith('did:medchain:');
}

const verifyMsg = (did: string, signature: string, publicKey: string): boolean => {
    try {
        const recoveredAddress = ethers.verifyMessage(did, signature);
        const recoveredPublicKey = ethers.computeAddress(publicKey);
        return recoveredAddress.toLocaleLowerCase() === recoveredPublicKey.toLocaleLowerCase();
    } catch (error) {
        return false;
    }
}

export { generateDID, verifyDID, verifyMsg };
