import { NextFunction, Request, Response } from 'express';
import { IAddAktivnost, IAddAktivnostValidator } from './dto/IAddAktivnost';
import DnevnikService from './service';
import BaseController from '../../../common/BaseController';

export default class DnevnikController extends BaseController {
      

    padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    async add(req: Request, res: Response, neextFuntion: NextFunction) {
        const datum = new Date().toLocaleString("sv", {timeZone: 'Europe/Belgrade'})
        const data = req.body as IAddAktivnost;

        if(!IAddAktivnostValidator(data)) {
            res.status(400).send(IAddAktivnostValidator.errors);
            return;
        }

        let korisnikId = null;
        let sluzbenikId = null;

        if(req.authorized.role === "korisnik") {
            korisnikId = req.authorized.id
        } else if(req.authorized.role === "sluzbenik") {
            sluzbenikId = req.authorized.id
        }

        
        res.send(await this.services.dnevnikService.add(data.stranica, data.radnja, datum, korisnikId, sluzbenikId, data.ipAdresa, data.grad, data.drzava))          
    }
}