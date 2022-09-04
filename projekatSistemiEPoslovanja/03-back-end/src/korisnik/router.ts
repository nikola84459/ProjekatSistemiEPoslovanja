import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IAplicationResources.interface';
import KorisnikService from './service';
import KorisnikControler from './controler';

export default class KorisnikRouter implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const korisnikService = new KorisnikService(resource.databaseconection);
        const korisnikControler = new KorisnikControler(korisnikService);

        aplication.get("/korisnici/:id", korisnikControler.getById.bind(korisnikControler));
        aplication.get("/korisniciIzmenaPassworda", korisnikControler.editPassword.bind(korisnikControler));
        aplication.get("/korisnikAdd", korisnikControler.add.bind(korisnikControler));
    }
}    