import { Algorithm } from "jsonwebtoken";

interface TokenKeyOptions {
    private: string;
    public: string;
    duration: number;
}

interface TokenOptions {
    auth: TokenKeyOptions;
    refresh: TokenKeyOptions;
    issuer: string;
    algorithm: Algorithm    ;
}
export default interface IConfig {
    server: {
        port: number,
        static: {
            path: string,
            route: string,
            cacheControl: boolean,
            dotFiles: "deny" | "allow",
            etag: boolean,
            index: boolean,
            maxAge: number
        }
    },

    database: {
        host: string,
        port: number,
        user: string,
        password: string,
        database: string,
        charset: string,
        timezone: string
    },

    auth: {
        korisnik: TokenOptions,
        sluzbenik: TokenOptions 
    }

    mail:{
        hostname: string,
        port: number,
        secure: boolean,
        username: string,
        password: string,
        fromMail: string,
        debug: boolean
    }

}