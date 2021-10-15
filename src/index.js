const { URL } = require("url");
const logging = require("@jitsusama/logging-js");

/** Environment configuration. */
class Environment {
  /**
   * Create an environment configuration retriever.
   * @constructor
   * @param {object} options - configuration options
   * @param {
   *   Object<string, string> | Dict<string> | Record<string, string>
   * } [options.environment=process.env] - system environment
   * @param {Object} [options.logs] - logging configuration
   * @param {string} [options.logs.layer="config-env"] - layer to log as
   * @param {string} [options.logs.level="silent"] - logging level
   */
  constructor(options) {
    const { environment = process.env, logs } = options || {};
    const {
      layer = "config-env",
      level = environment.LOGGING_LEVEL || "silent",
    } = logs || {};

    this.environment = environment;
    this.log = logging.getLogger(layer, level);
  }

  /**
   * Retrieve a positive integer.
   * @method
   * @param {string} key - environment variable name
   * @param {number} [fallback] - fallback value
   * @returns {number}
   */
  getInteger(key, fallback) {
    const value = this.getString(key, fallback?.toString());
    try {
      const parsedInt = Number.parseInt(value);
      if (parsedInt > 0) return parsedInt;
    } catch {
      this.log.fatal(
        { key, value, reason: "invalid integer" },
        "invalid configuration value"
      );
      throw new EnvironmentError();
    }

    this.log.fatal(
      { key, value, reason: "non-positive integer" },
      "invalid configuration value"
    );
    throw new EnvironmentError();
  }

  /**
   * Get a logging level.
   * @param {string} key - environment variable name
   * @param {string} [fallback] - fallback value
   * @returns {string}
   */
  getLoggingLevel(key, fallback) {
    const validLevels = [
      "silent",
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
    ];
    const value = this.getString(key, fallback);

    if (validLevels.includes(value)) return value;

    this.log.fatal(
      { key, value, reason: "unsupported logging level" },
      "invalid configuration value"
    );
    throw new EnvironmentError();
  }

  /**
   * Retrieve an optional string.
   * @method
   * @param {string} key - environment variable name
   * @return {string}
   */
  getOptionalString(key) {
    return this.environment[key];
  }

  /**
   * Retrieve a string.
   * @method
   * @param {string} key - environment variable name
   * @param {string} [fallback] - fallback value
   * @returns {string}
   */
  getString(key, fallback) {
    const value = this.getOptionalString(key);
    if (!value?.trim()) {
      if (fallback) return fallback;

      this.log.fatal(
        { key, reason: "value is missing, empty or blank" },
        "invalid configuration value"
      );
      throw new EnvironmentError();
    }
    return value;
  }

  /**
   * Retrieve a boolean.
   * @method
   * @param {string} key - environment variable name
   * @param {boolean} [fallback] - fallback value
   * @returns {boolean}
   */
  getBoolean(key, fallback) {
    const value = this.getOptionalString(key);
    if (value === undefined) {
      if (fallback !== undefined) return fallback;
      this.log.fatal(
        { key, reason: "value is missing, empty or blank" },
        "invalid configuration value"
      );
      throw new EnvironmentError();
    }
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    this.log.fatal(
      { key, reason: "invalid boolean value" },
      "invalid configuration value"
    );
    throw new EnvironmentError();
  }

  /**
   * Retrieve an unprivileged TCP/UDP port number.
   * @method
   * @param {string} key - environment variable name
   * @param {number} [fallback] - fallback value
   * @returns {number}
   */
  getUnprivilegedPort(key, fallback) {
    const value = this.getInteger(key, fallback);
    if (value > 1024 && value < 65_536) return value;

    this.log.fatal(
      { key, value, reason: "port number out of valid range" },
      "invalid configuration value"
    );
    throw new EnvironmentError();
  }

  /**
   * Retrieve a URL.
   * @param {string} key - environment variable name
   * @param {string} [fallback] - fallback value
   * @returns {string}
   */
  getUrl(key, fallback) {
    const value = this.getString(key, fallback);
    try {
      new URL(value);
    } catch {
      this.log.fatal(
        { key, value, reason: "invalid URL format" },
        "invalid configuration value"
      );

      throw new EnvironmentError();
    }
    return value;
  }
}

/** An invalid configuration value was discovered. */
class EnvironmentError extends Error {
  name = this.constructor.name;
}

module.exports = { Environment, EnvironmentError };
