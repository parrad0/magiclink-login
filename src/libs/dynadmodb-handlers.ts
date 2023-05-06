import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const executeDynamodDBCommand = async (command) => {
  const DBclient = new DynamoDBClient({ region: "eu-west-2" });
  const ddbDocClient = DynamoDBDocumentClient.from(DBclient);
  let result;

  try {
    result = await ddbDocClient.send(command);
    console.log(`DB result : ${JSON.stringify(result)}`);
  } catch (error) {
    console.log(`Error during Dynamo DB command : ${error}`);
    throw error;
  } finally {
    ddbDocClient.destroy();
    DBclient.destroy();
    console.log("Destroying the Dynamo DB clients");
  }

  return result;
};
