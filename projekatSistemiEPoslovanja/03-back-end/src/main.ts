import * as express from "express"
import * as cors from 'cors';
import Config from './config/dev';
import IApplicationResources from "../common/IAplicationResources.interface";
import * as mysql2 from 'mysql2/promise';
import RouterRacun from './components/racun/router';
import KorisnikRouter from './korisnik/router';
import Router from '../router';



async function main() {
    const aplication: express.Application = express();

    aplication.use(cors());
    aplication.use(express.json());

    const resources: IApplicationResources = {
        databaseconection: await mysql2.createConnection({
            host: Config.database.host,
            port: Config.database.port,
            user: Config.database.user,
            password: Config.database.password,
            database: Config.database.database,
            charset: Config.database.charset,
            timezone: Config.database.timezone,
            supportBigNumbers: true

       })
    }

    resources.databaseconection.connect();

    aplication.use(
        Config.server.static.route,
        express.static(Config.server.static.path, {
            index: Config.server.static.index,
            cacheControl: Config.server.static.cacheControl,
            maxAge: Config.server.static.maxAge,
            etag: Config.server.static.etag,
            dotfiles: Config.server.static.dotFiles,
        })
        
    );

    Router.setupRoutes(aplication, resources, [
        new RouterRacun(), 
        new KorisnikRouter(),
        
    ])
    
    aplication.use((req, res) => {
        res.sendStatus(404);
    });

    aplication.use((err, req, res, next) => {
        res.status(err.status).send(err.type);
    })

    aplication.listen(Config.server.port)
}

main();
