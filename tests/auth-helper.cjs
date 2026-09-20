// Real browser flow used by the existing learning and tool regression tests.
exports.registerDemo = async function(page,fullName='Amos') {
  await page.waitForURL('**/account.html?**');
  await page.locator('#full-name').fill(fullName);
  await page.locator('#account-password').fill('Test-only-passphrase-42');
  await page.locator('#confirm-password').fill('Test-only-passphrase-42');
  await page.locator('#account-submit').click();
  await page.waitForURL('**/index.html?onboard=1&**');
  await page.locator('#onboarding-dialog').waitFor({state:'visible'});
};
