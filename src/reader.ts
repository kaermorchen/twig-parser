import type { Point } from 'unist';
import { location, Location } from 'vfile-location';

class Reader {
  protected readonly document: string;
  protected readonly location: Location;
  protected position: number;

  constructor(document: string) {
    this.document = document;
    this.location = location(this.document);
    this.position = document.length === 0 ? 0 : -1;
  }

  public get eof(): boolean {
    return this.offset >= this.document.length;
  }

  public get offset(): number {
    return this.position;
  }

  public peek(k: number = 1): string {
    return this.document[this.offset + k] ?? '';
  }

  public peekUntil(
    k: number = 1,
    z: number = this.document.length - this.offset - k
  ): string {
    return this.document.slice(this.offset + k, this.offset + k + z + 1);
  }

  public read(k: number = 1): string {
    return this.document[(this.position += k)] ?? '';
  }

  public toOffset(point: Point): number {
    return this.location.toOffset(point);
  }

  public toPoint(offset: number): Point {
    return this.location.toPoint(offset);
  }
}

export default Reader;
