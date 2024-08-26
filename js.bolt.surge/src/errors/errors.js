/**
 * An environment variable was not an expected or valid value.
 * @class
 * @extends {Error}
 */
export class EnvironmentVariableInvalidError extends Error {
  /**
   * Shoot! One of the environment variable values is invalid.
   * @param {string} variable - name of the invalid variable.
   */
  constructor(variable) {
    super(variable);
    this.name = "EnvironmentVariableInvalidError";
    this.message = `Invalid environment variable for: ${variable}`;
  }
}

/**
 * An environment variable was not set or collected or found.
 * @class
 * @extends {Error}
 */
export class EnvironmentVariableMissingError extends Error {
  /**
   * Oh no! One of the required environment variable is missing.
   * @param {string} variable - name of the missing variable.
   */
  constructor(variable) {
    super(variable);
    this.name = "EnvironmentVariableMissingError";
    this.message = `Missing a required environment variable: ${variable}`;
  }
}
