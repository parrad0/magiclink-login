import { decrypt } from "../../libs/kms";

export const handler = async (event) => {
  const email = event.request.userAttributes.email;

  const expected = event.request.privateChallengeParameters.challenge;
  if (event.request.challengeAnswer !== expected) {
    console.log("answer doesn't match current challenge token");
    event.response.answerCorrect = false;
    return event;
  }
  console.log(`challengAnswer: ${event.request.challengeAnswer}`);
  const json: any = await decrypt(event.request.challengeAnswer);
  console.log(`json: ${json}`);
  const payload = JSON.parse(json);
  console.log(`payload: ${payload}`);
  console.log(payload);

  const isExpired = new Date().toJSON() > payload.expiration;
  console.log("isExpired:", isExpired);

  if (payload.email === email && !isExpired) {
    event.response.answerCorrect = true;
  } else {
    console.log("email doesn't match or token is expired");
    event.response.answerCorrect = false;
  }

  return event;
};
