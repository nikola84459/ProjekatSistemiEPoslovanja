import IRouter from '../../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import RacunControler from './controler';
import RacunService from './service';

export default class RouterRacun implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const racunService = new RacunService(resource.databaseConnection);
        const racunControler: RacunControler = new RacunControler(racunService);

        aplication.get("/racun", racunControler.getAll.bind(racunControler));
        aplication.get("/racun/:id", racunControler.getById.bind(racunControler));
        aplication.get("/racunKorisnik/:korisnikId", racunControler.getByKorisnikId.bind(racunControler));
        aplication.get("/racunAdd", racunControler.add.bind(racunControler));
    }
}



