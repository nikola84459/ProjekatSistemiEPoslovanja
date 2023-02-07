import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import IRouter from '../../../common/IRouter.interface';
import AuthMiddleware from '../../middleware/auth.middleware';
import DnevnikService from './service';
import DnevnikController from './controller';

export default class DnevnikRouter implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const dnevnikController = new DnevnikController(resource);

       aplication.post(
        "/addAkitvnost", 
        AuthMiddleware.getVerifier("sluzbenik", "korisnik"),
        dnevnikController.add.bind(dnevnikController));
    }
}