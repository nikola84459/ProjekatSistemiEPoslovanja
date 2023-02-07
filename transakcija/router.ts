import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import IRouter from '../../../common/IRouter.interface';
import TransakcijaService from './service';
import TransakcijaController from './controler';
import RacunService from '../racun/service';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class RouterTransakcija implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const transakcijaControler = new TransakcijaController(resource);

       aplication.get(
        "/transakcije/:id", 
        AuthMiddleware.getVerifier("korisnik"),
        transakcijaControler.getByRacunId.bind(transakcijaControler));
       aplication.post(
        "/prenosNovca", 
        AuthMiddleware.getVerifier("korisnik"),
        transakcijaControler.prenosNovca.bind(transakcijaControler));
       aplication.post(
        "/menjacnica", 
        AuthMiddleware.getVerifier("korisnik"),
        transakcijaControler.menjacnica.bind(transakcijaControler));
       aplication.post(
        "/isplata", 
        AuthMiddleware.getVerifier("sluzbenik"),
        transakcijaControler.isplataNovca.bind(transakcijaControler));
       aplication.post(
          "/isplataSve", 
          AuthMiddleware.getVerifier("sluzbenik"),
          transakcijaControler.isplataNovacSve.bind(transakcijaControler));
       
       }   
           
    }