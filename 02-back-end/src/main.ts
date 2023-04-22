import * as express from "express"
import * as cors from "cors"
import Config from './config/dev';
import IApplicationResources from '../common/IApplicationResources.interface';
import * as mysql2 from 'mysql2/promise';
import RouterRacun from './components/racun/router';
import Router from './router';
import KorisnikRouter from './components/korisnik/router';
import RouterTransakcija from './components/transakcija/router';
import RouterAuth from './components/auth/router';
import ValutaRouter from './components/valuta/router';
import * as session from 'express-session';
import DnevnikRouter from './components/dnevnik/router';
import ValutaController from './components/valuta/controler';
import cron = require('node-cron');
import ValutaService from "./components/valuta/service";
import { readFileSync } from 'fs';
import path = require("path");
import * as https from "https"
import RacunService from './components/racun/service';
import KorisnikService from './components/korisnik/service';
import TransakcijaService from "./components/transakcija/service";
import SluzbenikService from './components/sluzbenik/service';
import DnevnikService from "./components/dnevnik/service";
import SluzbenikRouter from './components/sluzbenik/router';


async function main() {
    const aplication: express.Application = express();

    aplication.use(cors({
        credentials: true,
        origin: "https://localhost:3000",
         
    }));

           
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
        }),

    }

    resources.databaseconection.connect();

    resources.services = {
        racunService: new RacunService(resources),
        korisnikService: new KorisnikService(resources),
        transakcijaService: new TransakcijaService(resources),
        valutaService: new ValutaService(resources),
        sluzbenikService: new SluzbenikService(resources),
        dnevnikService: new DnevnikService(resources),
    }

      
    cron.schedule('0 0 0 * * *', () => {
        resources.services.valutaService.edit() // stura napraviti mogućnost pregleda stanja po valutama, napraviti sluzbenika i pregled njegovih podataka, napraviti 
        //isplatu novca službenik i popraviti odrednjene contoller-e, ispraviti grešku na front-end-u sa valutama i stanjem
    });
   

   
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

    aplication.use(
        session({
          secret: 'projekat',
          resave: false,
          saveUninitialized:true,
                                
        }),
      );

                
    
    Router.setupRoutes(aplication, resources, [
        new RouterRacun(), 
        new KorisnikRouter(),
        new RouterTransakcija(),
        new RouterAuth(),
        new ValutaRouter(),
        new DnevnikRouter(),
        new SluzbenikRouter()
    ]);
    
    aplication.use((req, res) => {
        res.sendStatus(404);
    });

    
    https.createServer({
       "key": readFileSync(path.join(__dirname, "../ssl", "key.pem")),
       "cert": readFileSync(path.join(__dirname, "../ssl", "cert.pem"))
    }, aplication).listen(Config.server.port);
}

main();