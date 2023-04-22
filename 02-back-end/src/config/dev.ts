import { readFileSync } from 'fs';
import IConfig from '../../common/Iconfig.interface';
import * as dotenv from "dotenv"

const dotEnvResult = dotenv.config();

if(dotEnvResult.error) {
    throw "Environment error " + dotEnvResult.error
}

const Config: IConfig = {
    server: {
        port: 40080 , // 
        static: {
            route: "/static",
            path: "./static/",
            cacheControl: false,
            dotFiles: "deny",
            etag: false,
            index: false,
            maxAge: 360000            
        }
    },

    database: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "12345",
        database: "projekat",
        charset: "utf8",
        timezone: "+01:00"
    },

    auth: {
        korisnik: {
            algorithm: "RS256",
            issuer: "localhost",
            auth: {
                duration: 60 * 60 * 24 * 7,
                public: readFileSync("keystore/korisnik-auth.public", "utf8"),
                private: readFileSync("keystore/korisnik-auth.private", "utf8"), 
            },

            refresh: {
                duration: 60 * 60 * 24 * 7,
                public: readFileSync("keystore/korisnik-refresh.public", "utf8"),
                private: readFileSync("keystore/korisnik-refresh.private", "utf8"),   
            }
        },

        sluzbenik: {
            algorithm: "RS256",
            issuer: "localhost",
            auth: {
                duration: 60 * 60 * 24 * 7,
                public: readFileSync("keystore/sluzbenik-auth.public", "utf8"),
                private: readFileSync("keystore/sluzbenik-auth.private", "utf8"), 
            },

            refresh: {
                duration: 60 * 60 * 24 * 7,
                public: readFileSync("keystore/sluzbenik-refresh.public", "utf8"),
                private: readFileSync("keystore/sluzbenik-refresh.private", "utf8"),   
            }    
        }
    },

    mail: {
        hostname: process.env?.MAIL_HOST,
        port: +(process.env?.MAIL_PORT),
        secure: process.env?.MAIL_SECURE === "true",
        username: process.env?.MAIL_USERNAME,
        password: process.env?.MAIL_PASSWORD,
        fromMail: process.env?.MAIL_FROM,
        debug: true
    }
}

export default Config;