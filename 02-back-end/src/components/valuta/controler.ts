import { NextFunction, Request, Response } from 'express';
import ValutaService from './service';
import BaseController from '../../../common/BaseController';

export default class ValutaController extends BaseController {
    
    async getAll(req: Request, res: Response, neextFuntion: NextFunction) {
        res.send(await this.services.valutaService.getAll());
    }
    
}