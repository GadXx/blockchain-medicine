import { ethers } from "ethers";

const testVerifyMsg = async () => {
    // Генерируем случайную пару ключей
    const wallet = ethers.Wallet.createRandom();
    const did = "did:medchain:" + wallet.address;

    // Подписываем DID приватным ключом
    const signature = await wallet.signMessage(did);

    // Получаем публичный ключ
    const publicKey = wallet.publicKey;

    // Функция проверки подписи
    const verifyMsg = (did: string, signature: string, publicKey: string): boolean => {
        try {
            const recoveredAddress = ethers.verifyMessage(did, signature);
            const recoveredPublicKey = ethers.computeAddress(publicKey);
            return recoveredAddress.toLowerCase() === recoveredPublicKey.toLowerCase();
        } catch (error) {
            console.error("Ошибка проверки подписи:", error);
            return false;
        }
    };

    // Тестируем успешную проверку
    console.log("\n===== ✅ Тест: Успешная проверка ✅ =====");
    console.log("DID:", did);
    console.log("Адрес:", wallet.address);
    console.log("Публичный ключ:", publicKey);
    console.log("Подпись:", signature);

    const isValid = verifyMsg(did, signature, publicKey);
    console.log("✅ Проверка подписи:", isValid ? "УСПЕШНО!" : "❌ НЕВЕРНО!");

    // Тестируем неуспешную проверку (подделанная подпись)
    console.log("\n===== ❌ Тест: Подделанная подпись ❌ =====");
    const fakeSignature = await wallet.signMessage("did:medchain:fake-user"); // Подделываем DID

    const isFakeValid = verifyMsg(did, fakeSignature, publicKey);
    console.log("✅ Проверка подписи:", isFakeValid ? "УСПЕШНО!" : "❌ НЕВЕРНО!");

    // Тестируем неуспешную проверку (неправильный публичный ключ)
    console.log("\n===== ❌ Тест: Неправильный публичный ключ ❌ =====");
    const fakeWallet = ethers.Wallet.createRandom(); // Генерируем новый кошелек
    const fakePublicKey = fakeWallet.publicKey; // Берем поддельный публичный ключ

    const isWrongKeyValid = verifyMsg(did, signature, fakePublicKey);
    console.log("✅ Проверка подписи:", isWrongKeyValid ? "УСПЕШНО!" : "❌ НЕВЕРНО!");
};

// Запускаем тесты
testVerifyMsg();
