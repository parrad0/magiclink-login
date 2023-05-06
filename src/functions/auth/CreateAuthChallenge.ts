export const handler = async (event) => {
  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };

  event.response.privateChallengeParameters = {
    challenge: event.request.userAttributes["custom:authChallenge"],
  };

  return event;
};
