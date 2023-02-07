import { NextFunction, Request, Response } from 'express';
import RacunService from './service';
import RacunModel from './model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import IApplicationResources from '../../../common/IApplicationResources.interface';
import ITokenData from '../auth/dto/ITokenData.interface';
import { IAddRacun, IAddRacunValidator } from './dto/IAddRacun';
import ValutaService from '../valuta/service';
import { IIsPotipsao, IIsPotpisaoValidator } from './dto/IIsPotpisao';
import { IObrisi, IObrisiValidator } from './dto/IObrisi';
import ValutaModel from '../valuta/model';
import BaseController from '../../../common/BaseController';
const requestIp = require('request-ip');

export default class RacunControler extends BaseController {
    
    async getAll(req: Request, res: Response, neextFuntion: NextFunction) {
        const racuni = await this.services.racunService.getAll();
        res.send(racuni);
    }

    async getById(req: Request, res: Response, next: NextFunction){
        const id: string = req.params.id;

        const racunId: number = parseInt(id);

        if(racunId <= 0){
            res.sendStatus(400);
            return;
        }
        const data: RacunModel|null|IErrorResponse = await this.services.racunService.getById(racunId, { loadValuta: true });

        if(data === null){
           res.sendStatus(404);
           return;
        }
        if(data instanceof RacunModel){
           res.send(data);
           return;
        }
              
        res.status(500).send(data);
          
    }

    async getByKorisnikId(req: Request, res: Response, next: NextFunction) {
        const id = req.authorized.id;
               
        if(+id <=0) {
            res.send(400);
            return;
        }

        const racuni = await this.services.racunService.getByKorisnikId(+(id), { loadValuta: true });

        if(racuni === null) {
            res.send(404)
            return;
        }

        res.send(racuni);        
    }

    async getByKorisnikIdSluzbenik (req: Request, res: Response, next: NextFunction) {
        let id = req.session["korisnik"];
        
        if(+id <=0) {
            res.send(400);
            return;
        }
        
        const racuni = await this.services.racunService.getByKorisnikId(+(id), { loadValuta: true });

        if(racuni === null) {
            res.send(404)
            return;
        }
        
        res.send(racuni);        
     
    }
  
    async add(req: Request, res: Response, next: NextFunction) {
         
        
        const data = req.body as IAddRacun

        if(!IAddRacunValidator(data)) {
            res.status(400).send(IAddRacunValidator.errors);
            return;
        }

        const korisnikId = req.session["korisnik"]; 

        const valuta = await this.services.valutaService.getBySifra("rsd")
        
        if(data.tip === "dinarski") {
            if(valuta instanceof ValutaModel) {
                data.valuta.push(await valuta.valuta_id);    
            }    
        }

        let upis: RacunModel | IErrorResponse = null; 

        do {
            let vreme = new Date();
            let randomBr = String(Math.floor(Math.random() * 10));
            let brRacuna: string = String(vreme.getDate()) + String(vreme.getTime()) + String(vreme.getMilliseconds()) + randomBr;

            upis = await this.services.racunService.add(brRacuna, data.tip, korisnikId ,data.valuta, data.svrha);

        } while(!(upis instanceof RacunModel) && upis.errorMessage.includes("uq_racun_br_racuna"))
              
        
        if(upis instanceof RacunModel) {
            res.send(
                {
                    brRacuna: upis.br_racuna,
                    tip: upis.tip,
                    racunId: upis.racun_id
                }
            )
        }

    }

    async isPotpisao(req: Request, res: Response, next: NextFunction) {
        const data = req.body as IIsPotipsao
        

        if(!IIsPotpisaoValidator(data)) {
            res.status(400).send(IObrisiValidator.errors);
            return;    
        }

        if(data.isPotpisao) {
            await this.editIsAktivan(data.racunId, 1);
            res.send()
        } else {
            await this.deleteRacun(data.racunId);
            res.send();
        }
    } 

    async deleteRacun(racunId: number) {
        await this.services.racunService.deleteRacun(racunId)
    }

    async editIsAktivan(racunId: number, isPotpisao: number) {
        await this.services.racunService.editIsAktivan(racunId, isPotpisao)
    }

    async obrisiRacun(req: Request, res: Response, next: NextFunction) {
        const data = req.body as IObrisi
        
        if(!IObrisiValidator(data)) {
            res.status(400).send(IObrisiValidator.errors);
            return;
        }
        
        if(data.isBrisi) {
            const racun = await this.services.racunService.getById(data.racunId, { loadValuta: true });
                        
            if(racun instanceof RacunModel) 
                for(const i of await racun.racun_valuta) {
                    if(i.stanje > 0) {
                        return res.status(400).send();
                    }
                }
            }
            
            res.send(await this.editIsAktivan(data.racunId, 0));    
    }

    async obrisiSveZaKorisnika(req: Request, res: Response, next: NextFunction) {
        const data = req.body as IObrisi
        
        if(!IObrisiValidator(data)) {
            res.status(400).send(IObrisiValidator.errors);
            return;
        }

        const korisnikId = req.session["korisnik"];
                
        const racun = await this.services.racunService.getByKorisnikId(korisnikId, { loadValuta: true });

        let isOk = false;
        
        if(data.isBrisi) {
            for(const i of await racun) {
                for(const j of await i.racun_valuta) {
                    if(j.stanje > 0) {
                        isOk = false;
                        return res.status(400).send();
                    } else {
                        isOk = true
                    }
                }
            }
            
            if(isOk) {
                for(const i of await racun) {
                    await this.services.racunService.editIsAktivan(i.racun_id, 0)
                }
            }

            res.send();
        }
    }
}