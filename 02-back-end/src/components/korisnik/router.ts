import IRouter from '../../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import KorisnikService from './service';
import KorisnikControler from './controler';
import AuthMiddleware from '../../middleware/auth.middleware';


export default class KorisnikRouter implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const korisnikControler = new KorisnikControler(resource);
        

        aplication.get(
            "/korisnici",
            AuthMiddleware.getVerifier("korisnik", "sluzbenik"),
            korisnikControler.getById.bind(korisnikControler));
        aplication.post(
            "/korisniciIzmenaPassworda",
             AuthMiddleware.getVerifier("korisnik"),   
             korisnikControler.editPassword.bind(korisnikControler));
        aplication.post(
            "/korisnikAdd",
             AuthMiddleware.getVerifier("sluzbenik"),
             korisnikControler.add.bind(korisnikControler));
        aplication.get(
            "/korisniciSluzbenik",
            AuthMiddleware.getVerifier("sluzbenik"),
            korisnikControler.getByIdSluzbenik.bind(korisnikControler));
        aplication.post(
           "/korisnikPretraga",
            AuthMiddleware.getVerifier("sluzbenik"),
            korisnikControler.pretraga.bind(korisnikControler)); 
        aplication.post(
            "/korisnikSession",
            AuthMiddleware.getVerifier("sluzbenik"),
            korisnikControler.setSessionKorisnik.bind(korisnikControler));
        aplication.post(
            "/izmeniPodatke",
            AuthMiddleware.getVerifier("sluzbenik"),
            korisnikControler.edit.bind(korisnikControler)); 
        aplication.post(
            "/obrisiKorisnika",
            AuthMiddleware.getVerifier("sluzbenik"),
            korisnikControler.obrisiKorisnika.bind(korisnikControler));        
                
    }
}    