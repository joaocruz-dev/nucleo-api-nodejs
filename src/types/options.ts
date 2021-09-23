export interface Environment<T> {
  /**
   * In development mode this value will be used
   */
  dev: T,

  /**
   * In production mode this value will be used
   */
  prod: T

  /**
   * In sandbox mode this value will be used
   */
  sandbox: T
}

export interface OptionsServer {
  /**
   * API version
   */
  version: string,

  /**
   * Activate sandbox mode
   */
  sandbox: boolean,

  /**
   * Server settings
   */
  server: {
    /**
     * port to run the server
     */
    port: Environment<number>,

    /**
     * enable multi-processing on server
     */
    multiprocessing: Environment<boolean>
  },

  /**
   * Access url for systems
   */
   endpoint: {
    /**
     * api url
     */
    api: Environment<string>,

    /**
     * view url
     */
    view: Environment<string>
  },

  /**
   * MongoDB settings
   */
   mongodb: {
    /**
     * database name
     */
    name: string,

    /**
     * database connection url
     */
    conection: Environment<string>
  }
}

export interface OptionsMetadata extends OptionsServer {
  token: {
    secret: string,
    deafult: string
  }
}

export interface OptionsRandomString {
  lowercase?: boolean
  uppercase?: boolean
  numeric?: boolean
  special?: boolean
}
