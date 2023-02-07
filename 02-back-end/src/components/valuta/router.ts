import IRouter from '../../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import AuthMiddleware from '../../middleware/auth.middleware';
import ValutaService from './service';
import ValutaController from './controler';

export default class ValutaRouter implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const valutaController = new ValutaController(resource);

        aplication.get(
            "/valuta",
            AuthMiddleware.getVerifier("korisnik", "sluzbenik"),
            valutaController.getAll.bind(valutaController));
       
    }
}    