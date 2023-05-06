import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
const KmsClient = new KMSClient({ region: "eu-west-2" }); // Cambia "eu-west-2" por la región que deseas utilizar

export const encrypt = async (plaintext: string) => {
  const command = new EncryptCommand({
    KeyId: process.env.KMS_KEY_ARN, // Reemplaza con la clave KMS que corresponda
    Plaintext: Buffer.from(plaintext),
  });

  const response = await KmsClient.send(command);

  return Buffer.from(response.CiphertextBlob).toString("base64");
};

export const decrypt = async (ciphertext: string) => {
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(ciphertext, "base64"),
  });
  try {
    const response = await KmsClient.send(command);
    return Buffer.from(response.Plaintext).toString();
  } catch (ex) {
    console.log(ex);
  }
};
