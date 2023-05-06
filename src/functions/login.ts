// handler.ts
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { decrypt, encrypt } from "../libs/kms";
import {
  buildFailureResponse,
  buildSuccessResponse,
} from "../libs/api-gateway";
const querystring = require("querystring");

const region = "eu-west-2";
const userPoolId = "User pool id";
const fromEmail = "Your verified email";
const BASE_URL = "localhost:3000/validatelogin";

export async function handler(event) {
  const email = event.queryStringParameters.email;
  const ONE_MIN = 60 * 1000;
  const TIMEOUT_MINS = 60;
  const now = new Date();
  const expiration = new Date(now.getTime() + ONE_MIN * TIMEOUT_MINS);

  const payload = {
    email,
    expiration: expiration.toJSON(),
  };

  const tokenB64: any = await encrypt(JSON.stringify(payload));
  const token = querystring.escape(tokenB64);
  const magicLink = `http://${BASE_URL}?email=${email}&token=${token}`;

  const cognitoClient = new CognitoIdentityProviderClient({ region });

  const updateAttributesParams = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      {
        Name: "custom:authChallenge",
        Value: tokenB64,
      },
    ],
  };

  try {
    await cognitoClient.send(
      new AdminUpdateUserAttributesCommand(updateAttributesParams)
    );
    console.log("Custom attribute added to user");
  } catch (error) {
    buildFailureResponse(500, "Check inbox");
    console.error("Error adding custom attribute:", error);
    throw error;
  }

  const sesClient = new SESClient({ region });

  const emailParams = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Hello, this is your token: ${magicLink}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Your Token",
      },
    },
    Source: fromEmail,
  };

  // Envía el correo electrónico al usuario
  try {
    const result = await sesClient.send(new SendEmailCommand(emailParams));
    buildSuccessResponse(200, "Check inbox");
    console.log("Email sent:", result);
  } catch (error) {
    buildFailureResponse(500, "Check inbox");
    console.error("Error sending email:", error);
    throw error;
  }
}
