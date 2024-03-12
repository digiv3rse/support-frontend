import { v4 as uuidv4 } from "uuid";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length: number) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const firstName = () => `${generateString(5)}TestF`;
export const lastName = () => `${generateString(5)}TestL`;
/**
 * This email needs to end with @thegulocal.com.
 *
 * Those are skipped by membership-workflow to avoid
 * us spamming non-existent email addresses which might hurt our
 * reputation with email clients.
 *
 * e.g: https://github.com/guardian/membership-workflow/blob/99e2b90305f93bf35ce230f6b6c17e0c4533facb/app/model/BrazeCampaignTriggerPayload.scala#L28
 **/
export const email = () =>
  `test.support.frontend.e2e+${uuidv4()}@thegulocal.com`;
