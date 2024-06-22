import { assert, chai } from '@open-wc/testing';

async function errorInConnectedCallbackAssertion(utils: Chai.ChaiUtils, self: object, message: string) {
  let syncError;
  let asyncError;
  const obj = utils.flag(self, 'object');

  if (typeof obj !== 'function') {
    throw new Error(`Expected a function, received: ${obj}`);
  }

  const listener = (errorEvent: ErrorEvent) => {
    errorEvent.preventDefault();
    asyncError = errorEvent.error.message;
  };
  window.addEventListener('error', listener);

  try {
    await obj();
  } catch (err) {
    syncError = err;
  } finally {
    window.removeEventListener('error', listener);
  }

  const finalError = syncError || asyncError;
  if (finalError && typeof finalError === "object" && "message" in finalError) {
    assert.equal(finalError?.message, message, `Expected to throw ${message}`);
  } else {
    assert.equal(finalError, message, `Expected to throw ${message}`);
  }
}

chai.use((_chai, utils) => {
  utils.addMethod(chai.Assertion.prototype, 'throwInConnectedCallback', function (this: object,message: string) {
    errorInConnectedCallbackAssertion(utils, this, message);
  });
  utils.addMethod(chai.Assertion.prototype, 'throwErrorInConnectedCallback', function (this: object, message: string) {
    errorInConnectedCallbackAssertion(utils, this, message);
  });
});
