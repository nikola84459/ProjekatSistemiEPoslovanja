import * as express from 'express';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import IRouter from '../../../common/IRouter.interface';
import SluzbenikController from './controler';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class SluzbenikRouter implements IRouter {
    public setupRoutes(aplication: express.Application, resource: IApplicationResources) {
        const sluzbenikController = new SluzbenikController(resource);

        aplication.get(
            "/sluzbenikPodaci",
            AuthMiddleware.getVerifier("sluzbenik"),
            sluzbenikController.getById.bind(sluzbenikController)
        );

        aplication.post(
            "/sluzbenikEditSifra",
            AuthMiddleware.getVerifier("sluzbenik"),
            sluzbenikController.editSifra.bind(sluzbenikController)
        );
    }
}