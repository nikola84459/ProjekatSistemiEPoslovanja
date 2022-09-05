import * as express from 'express';
import IApplicationResources from '../../common/IAplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import TransakcijaService from './service';
import TransakcijaController from './controler';
import RacunService from '../racun/service';

export default class RouterTransakcija implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
       const transakcijaService = new TransakcijaService(resource.databaseconection);
       const racunService = new RacunService(resource.databaseconection);
       const transakcijaControler = new TransakcijaController(transakcijaService, racunService);

       aplication.get("/transakcije/:id", transakcijaControler.getByRacunId.bind(transakcijaControler));
       aplication.get("/transakcijeAdd", transakcijaControler.add.bind(transakcijaControler));
       aplication.get("/menjacnica", transakcijaControler.menjacnica.bind(transakcijaControler));
    }
}