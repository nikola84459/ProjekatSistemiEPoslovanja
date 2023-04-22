import IRouter from '../../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import RacunControler from './controler';
import RacunService from './service';
import AuthMiddleware from '../../middleware/auth.middleware';
import ValutaService from '../valuta/service';

export default class RouterRacun implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const racunControler: RacunControler = new RacunControler(resource);

        aplication.get(
            "/racun", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.getAll.bind(racunControler));
        aplication.get(
            "/racun/:id", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.getById.bind(racunControler));
        aplication.get(
            "/racunKorisnik", 
            AuthMiddleware.getVerifier("korisnik"),
            racunControler.getByKorisnikId.bind(racunControler));
        aplication.post(
            "/racunAdd", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.add.bind(racunControler));

        aplication.post(
            "/editIsAktivan",
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.editIsAktivan.bind(racunControler)
       ); 
       
        aplication.post(
            "/obrisiPotpisivanje",
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.deleteRacun.bind(racunControler)
   );  

        aplication.get(
            "/racunKorisnikSluzbenik", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.getByKorisnikIdSluzbenik.bind(racunControler));   
        aplication.post(
            "/obrisiRacun", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.obrisiRacun.bind(racunControler));  

        aplication.get(
            "/obrisiSveKorisnik", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.obrisiSveZaKorisnika.bind(racunControler));

        aplication.post(
            "/obrisiPoslednjiRacun", 
            AuthMiddleware.getVerifier("sluzbenik"),
            racunControler.obrisiPoslednji.bind(racunControler));
            
    }

   
}