import { NextFunction, Request, Response } from 'express';
import RacunService from './service';
import RacunModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import IApplicationResources from '../../common/IAplicationResources.interface';
import { IAddRacun } from './dto/IAddRacun';

class RacunControler {
    private racunService: RacunService;
    

    constructor(racunService) {
        this.racunService = racunService 
    }

    async getAll(req: Request, res: Response, neextFuntion: NextFunction) {
        const racuni = await this.racunService.getAll();
        res.send(racuni);
    }

    async getById(req: Request, res: Response, next: NextFunction){
        const id: string = req.params.id;

        const racunId: number = parseInt(id);

        if(racunId <= 0){
            res.sendStatus(400);
            return;
        }
        const data: RacunModel|null|IErrorResponse = await this.racunService.getById(racunId);

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
        const id = req.params.korisnikId

        if(+id <=0) {
            res.send(400);
            return;
        }

        const racuni = await this.racunService.getByKorisnikId(+id);

        if(racuni === null) {
            res.send(404)
            return;
        }

        res.send(racuni);        
    }
  
   

    async add(req: Request, res: Response, next: NextFunction) {
        const br = +(await this.racunService.getLastData()).br_racuna + 1;
        const brRacuna = String(br);
        console.log(br);

        const data = req.body as IAddRacun
        
        res.send(await this.racunService.add(brRacuna, data.tip, data.korisnik_id, data.valuta));
        
    }
}

export default RacunControler;