export default class Source {
  private code;
  private name;
  private path;
  /**
   * @param string $code The template source code
   * @param string $name The template logical name
   * @param string $path The filesystem path of the template if any
   */
  public constructor(code: string, name: string, path: string = '') {
    this.code = code;
    this.name = name;
    this.path = path;
  }
  public getCode(): string {
    return this.code;
  }
  public getName(): string {
    return this.name;
  }
  public getPath(): string {
    return this.path;
  }
}
