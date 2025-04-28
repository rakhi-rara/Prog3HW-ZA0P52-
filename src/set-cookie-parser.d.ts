declare module 'set-cookie-parser' {
    import { IncomingMessage } from 'http';

    interface Cookie {
        name: string;
        value: string;
        path?: string;
        expires?: Date;
        maxAge?: number;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    }

    interface ParseOptions {
        decodeValues?: boolean;
        map?: boolean;
    }

    function parse(
        input: string | string[] | IncomingMessage,
        options?: ParseOptions
    ): Cookie[] | { [key: string]: Cookie };

    export = parse;
}
