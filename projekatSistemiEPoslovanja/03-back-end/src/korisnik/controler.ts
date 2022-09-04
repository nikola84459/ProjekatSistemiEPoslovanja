import { NextFunction, Request, Response } from 'express';
import KorisnikService from './service';
import KorisnikModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditKorisnik } from './dto/IEditKorisnik';
import { IAddKorisnik } from './dto/IAddKorisnik';


export default class KorisnikControler {
    private korisnikService: KorisnikService;

    constructor(korisnikService: KorisnikService) {
        this.korisnikService = korisnikService;
    }
    
    async getById(req: Request, res: Response, neextFunction: NextFunction) {
        const id = +req.params.id;
        res.send(await this.korisnikService.getById(id));
    }

    async editPassword(req: Request, res: Response, neextFunction: NextFunction) {
        const id = 1;
        const data = req.body as IEditKorisnik;
               
        if(data.password_hash_old === (await this.korisnikService.getById(id)).password_hash) {
            if(data.password_hash === data.password_hash_ponovo) {
                if(id <= 0) {
                    res.send(400);
                    return;
                }
        
                const podaci = await this.korisnikService.updatePassword(id, data.password_hash);
        
                if(podaci === null) {
                    res.send(404);
                    return;
                }
               
                res.send(podaci);
            } else {
                res.send({
                    greska: "Šifra se ne poklapaju."
                });
            }
            
        } else {
            res.send({
                greska: "Uneta šifra ne odgovara staroj šifri"
            });
        }
       
       
    }

    async add(req: Request, res: Response, neextFunction: NextFunction) {
        const data = req.body as IAddKorisnik;

        const password_hash = String(Math.floor(Math.random() * 10000000000));
      
        res.send(await this.korisnikService.add(data.ime, data.prezime, password_hash, data.jmbg, data.brLicneKarte));
    }
    
}