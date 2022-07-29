
const UUIDs = [];
const regEx = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

const createUUID = _ => {
  let uuid = crypto.randomUUID();

  while ( UUIDs.indexOf(uuid) !== -1 ) {
    uuid = crypto.randomUUID();
  }

  rememberUUID(uuid);
  return uuid;
}

const rememberUUID = function () {

  let uuid    = null;
  let args    = Array.from(arguments).flat();
  let testRes = null;
  for (uuid of arguments) {
    testRes = regEx.test(uuid);

    console.log(uuid,testRes);
    if (testRes && UUIDs.indexOf(uuid) === -1 ) {
      UUIDs.push(uuid);
    }
  }
}




export {createUUID, rememberUUID, UUIDs}