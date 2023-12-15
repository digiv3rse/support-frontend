import {
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType
} from "@playwright/test";

export const afterEachTasks = (test:TestType<PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions>) => {
    test.afterEach(async ({page, context}, testInfo) => {
     if (process.env.RUNNING_IN_BROWSERSTACK) {
       if (testInfo.status) {
        await page.evaluate(
          _ => {},
          `browserstack_executor: ${JSON.stringify({
              action: 'setSessionStatus',
              arguments: { status: testInfo.status }
          })}`)
       }
     }
     context.pages().forEach(async (page) => {
       await page.close();
     });
    });
}
