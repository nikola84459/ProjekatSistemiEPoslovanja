import IRouter from '../../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import KorisnikService from '../korisnik/service';
import AuthController from './controler';
import SluzbenikService from '../sluzbenik/service';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class RouterAuth implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const authController = new AuthController(resource);

       aplication.post("/auth/korisnik/prijava", authController.logovanjeKorisnik.bind(authController));
       aplication.post("/auth/sluzbenik/prijava", authController.sluzbenikLogin.bind(authController));
       aplication.post("/auth/korisnik/refreshToken", authController.korisnikRefresh.bind(authController));
       aplication.post("/auth/sluzbenik/refreshToken", authController.sluzbenikRefresh.bind(authController));
       aplication.get(
        "/auth/korisnik/vratiUlogu", 
        AuthMiddleware.getVerifier("korisnik"),
       authController.vratiUlogu.bind(authController));
       aplication.get(
        "/auth/sluzbenik/vratiUlogu", 
        AuthMiddleware.getVerifier("sluzbenik"),
       authController.vratiUlogu.bind(authController));
       
    }   
   
}