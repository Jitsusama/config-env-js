const config = require("./index.js");

test.each([
  ["PASSWORD", undefined, "password"],
  ["USERNAME", "bob", undefined],
  ["JWT_SECRET", "shh", "doesn't matter"],
])("gets a string or provides a fallback value", (key, value, fallback) => {
  const environment = new config.Environment({ environment: { [key]: value } });

  const result = environment.getString(key, fallback);

  expect(result).toEqual(value || fallback);
});

test("complains when string is missing without a fallback value", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getString("key");

  expect(logic).toThrow(config.EnvironmentError);
});

test.each([
  ["OPTIONAL", undefined],
  ["EMPTY", ""],
  ["REAL_VAR", "someValue"],
])("gets an optional string", (key, value) => {
  const environment = new config.Environment({
    environment: { [key]: value },
  });

  const result = environment.getOptionalString(key);

  expect(result).toEqual(value);
});

test.each([
  ["REQUEST_TIMEOUT", undefined, 30_000],
  ["RESPONSE_TIMEOUT", "15000", undefined],
  ["RETRY_COUNT", "2", 3],
])("gets an integer or provides a fallback value", (key, value, fallback) => {
  const environment = new config.Environment({ environment: { [key]: value } });

  const result = environment.getInteger(key, fallback);

  expect(result).toEqual(Number.parseInt(value) || fallback);
});

test.each(["-1", "0", "bob"])("complains when integer is invalid", (value) => {
  const environment = new config.Environment({ environment: { key: value } });

  const logic = () => environment.getInteger("key", 1);

  expect(logic).toThrow(config.EnvironmentError);
});

test("complains when integer without a fallback is missing", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getInteger("key");

  expect(logic).toThrow(config.EnvironmentError);
});

test.each([
  ["API_BASEURI", undefined, "http://api.host:1234/path"],
  ["UI_BASEURI", "https://1.2.3.4/path", undefined],
  ["CORS_HOSTNAME", "http://my.host:9876", "https://a.host:2345"],
])("gets a URL or provides a fallback value", (key, value, fallback) => {
  const environment = new config.Environment({ environment: { [key]: value } });

  const result = environment.getUrl(key, fallback);

  expect(result).toEqual(value || fallback);
});

test.each(["://no.scheme", "http://bad host"])(
  "complains when URL is invalid",
  (value) => {
    const environment = new config.Environment({ environment: { key: value } });

    const logic = () => environment.getUrl("key", "http://localhost");

    expect(logic).toThrow(config.EnvironmentError);
  }
);

test("complains when URL without a fallback is missing", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getUrl("key");

  expect(logic).toThrow(config.EnvironmentError);
});

test.each([
  ["LISTENING_PORT", undefined, 8080],
  ["HTTPS_PORT", "8444", undefined],
  ["HTTP_PORT", "8080", 8090],
])(
  "gets an unprivileged port or provides a fallback value",
  (key, value, fallback) => {
    const environment = new config.Environment({
      environment: { [key]: value },
    });

    const result = environment.getUnprivilegedPort(key, fallback);

    expect(result).toEqual(Number.parseInt(value) || fallback);
  }
);

test.each(["string", "-1", "1", "1024", "65536"])(
  "complains when unprivileged port is invalid",
  (value) => {
    const environment = new config.Environment({ environment: { key: value } });

    const logic = () => environment.getUnprivilegedPort("key", 8080);

    expect(logic).toThrow(config.EnvironmentError);
  }
);

test("complains when unprivileged port without a fallback is missing", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getUnprivilegedPort("key");

  expect(logic).toThrow(config.EnvironmentError);
});

test.each([
  ["VERBOSITY", undefined, "trace"],
  ["LOGGING_LEVEL", "debug", "silent"],
  ["LOGS", "info", undefined],
  ["LOGGING", "warn", "error"],
  ["LOUDNESS", undefined, "error"],
  ["LEVEL", "fatal", undefined],
  ["LOG_LEVEL", "silent", "trace"],
])(
  "gets logging level or provides a fallback value",
  (key, value, fallback) => {
    const environment = new config.Environment({
      environment: { [key]: value },
    });

    const result = environment.getLoggingLevel(key, fallback);

    expect(result).toEqual(value || fallback);
  }
);

test.each(["invalid", "bad"])(
  "complains when logging level is invalid",
  (value) => {
    const environment = new config.Environment({ environment: { key: value } });

    const logic = () => environment.getLoggingLevel("key", "silent");

    expect(logic).toThrow(config.EnvironmentError);
  }
);

test("complains when logging level without a fallback is missing", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getLoggingLevel("key");

  expect(logic).toThrow(config.EnvironmentError);
});

test.each([
  ["UNDER_TEST", undefined, false, false],
  ["IS_SUN_HOT", "true", false, true],
  ["IS_EARTH_FLAT", "false", true, false],
  ["AM_I_A_ROBOT", "TRUE", undefined, true],
  ["ARE_YOU_HAPPY", "False", undefined, false],
])(
  "gets boolean or provides a fallback value",
  (key, value, fallback, resultValue) => {
    const environment = new config.Environment({
      environment: { [key]: value },
    });

    const result = environment.getBoolean(key, fallback);

    expect(result).toEqual(resultValue);
  }
);

test.each(["not_true", "1"])(
  "complains when boolean value is invalid",
  (value) => {
    const environment = new config.Environment({ environment: { key: value } });

    const logic = () => environment.getBoolean("key", true);

    expect(logic).toThrow(config.EnvironmentError);
  }
);

test("complains when boolean without a fallback is missing", () => {
  const environment = new config.Environment({ environment: {} });

  const logic = () => environment.getBoolean("key");

  expect(logic).toThrow(config.EnvironmentError);
});
