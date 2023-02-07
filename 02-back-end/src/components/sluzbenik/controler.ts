import { NextFunction, Request, Response } from 'express';
import BaseController from '../../../common/BaseController';
import { IEditSifra, IEditSifraValidator } from './dto/IEditSifra';
import SluzbenikModel from './model';
import * as bcrypt from 'bcrypt';

export default class SluzbenikController extends BaseController {

    async getById(req: Request, res: Response, neextFuntion: NextFunction) {
        const id = req.authorized.id;

        const sluzbenik = await this.services.sluzbenikService.getById(id);

        if(sluzbenik === null) {
            return res.send(404);
        }

        return res.send(sluzbenik);
    }

    async editSifra(req: Request, res: Response, neextFuntion: NextFunction) {
        const id = req.authorized.id;  
        const data = req.body as IEditSifra;
                
        if(!IEditSifraValidator(data)) {
            res.status(400).send(IEditSifraValidator.errors);
            return;     
        }

        const sluzbenik = await this.services.sluzbenikService.getById(id);

        if(sluzbenik instanceof SluzbenikModel) {
            if(bcrypt.compareSync(data.password_hash_old, await sluzbenik.password_hash)) {
                console.log("usao ovde");
                if(data.password_hash === data.password_hash_ponovo) {
                    const podaci = await this.services.sluzbenikService.editSifra(id, bcrypt.hashSync(data.password_hash, 11));
                    if(podaci === null) {
                        res.send(404);
                        return;
                    }
                    
                    res.send(podaci);
                } else {
                    return res.status(400).send("Šifre se ne poklapaju.")
                }    
            } else {
                return res.status(400).send("Uneta šifra se ne poklapa sa starom šifrom");
            }
        }
    }
}