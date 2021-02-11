import { Cache } from '../../Cache';
interface StateOptions {
    rest?: any
    cache?: boolean
}

export default abstract class State {
    public rest: any;
    public cache?: boolean;
    constructor(public client: Cache, options: StateOptions) {
        this.rest = options.rest ?? false;
        this.cache = options.cache ?? true;
    }
    abstract get(...args: any[]): any
    abstract fetch(...args: any[]): any
    abstract set(...args: any[]): any
    abstract size(): any
    abstract del(...args: any[]): any
    abstract getAll(): any
}