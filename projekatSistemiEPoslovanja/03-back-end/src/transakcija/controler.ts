import TransakcijaService from './service';
import { NextFunction, Request, Response } from 'express';
import RacunService from '../racun/service';
import { IAddTransakcija } from './dto/IAddTransakcija';

export default class TransakcijaController {
    transakcijaService: TransakcijaService;
    racunService: RacunService

    constructor(transakcijaService: TransakcijaService, racunService: RacunService) {
        this.transakcijaService = transakcijaService;
        this.racunService = racunService;

    }

    async getByRacunId(req: Request, res: Response, neextFuntion: NextFunction) {
        const racunId: number = +req.params.id;
        const transakcije = await this.transakcijaService.getByRacunId(racunId);

        if(transakcije === null) {
            res.send(404);
            return;
        }

        res.send(transakcije);
    }

    padTo2Digits(num: number) {
       return num.toString().padStart(2, '0');
    }

    async add(req: Request, res: Response, neextFuntion: NextFunction) {
        const datum: Date = new Date();
        const datumIVreme = [
            datum.getFullYear(),
            this.padTo2Digits(datum.getMonth() + 1),
            this.padTo2Digits(datum.getDate()),
          ].join('-') +
          ' ' +
          [
            this.padTo2Digits(datum.getHours()),
            this.padTo2Digits(datum.getMinutes()),
            this.padTo2Digits(datum.getSeconds()),
          ].join(':') 

        
       const data = req.body as IAddTransakcija;   
               
       const br = +await (await this.transakcijaService.getLastData()).br_transakcije + 1;
       const brTransakcije = String(br);

       var isOk = false;

       const racunIdPrimaoca: number = await (await this.racunService.getByRacunNumber("456789787845")).racun_id;
              
       var stanjePlatioca: number = null;
       var stanjePrimaoca: number = null;
            
        for(const i of (await this.racunService.getByRacunNumber("456789787845")).racun_valuta) {
            if(i.valuta_id === data.valuta_id) {
                isOk = true;
                stanjePrimaoca = i.stanje + data.iznos 
                break;  
            } else {
                res.send("Nije moguće izvršiti plaćanje");
            }
         }

        for(const i of (await this.racunService.getById(data.racun_id)).racun_valuta) {
            if(i.valuta_id === data.valuta_id) {
                isOk = true;
                stanjePlatioca = i.stanje - data.iznos
                break;
        }
    }
          
       if(stanjePlatioca < data.iznos) {
          res.send("Nemate dovoljno novca na računu");     
       } else {
            if(isOk) {
                console.log(await this.transakcijaService.add(brTransakcije, data.iznos, datumIVreme, "uplata", data.racun_id , racunIdPrimaoca ,"uplata", "isplata", data.valuta_id, null, stanjePlatioca, stanjePrimaoca))
                res.send("Transakcija je uspešno izvršena")
            }     
         
        }            
    }

    async menjacnica(req: Request, res: Response, neextFuntion: NextFunction) {
        const datum: Date = new Date();
        
        const datumIVreme = [
            datum.getFullYear(),
            this.padTo2Digits(datum.getMonth() + 1),
            this.padTo2Digits(datum.getDate()),
          ].join('-') +
          ' ' +
          [
            this.padTo2Digits(datum.getHours()),
            this.padTo2Digits(datum.getMinutes()),
            this.padTo2Digits(datum.getSeconds()),
          ].join(':') 

          const data = req.body as IAddTransakcija;
          
          const racunUplata: string = "7894564512657";

          const racunIdPrimaoca = (await this.racunService.getByRacunNumber(racunUplata)).racun_id;

          var novoStanjeIsplata: number = null;
          var novoStanjeUplata: number = null;

          
          const br = +(await this.transakcijaService.getLastData()).br_transakcije + 1;
          const brTransakcije = String(br);
          

          var isOk = false;

          var iznosUValuti: number = null;
         
          var valuta1 = null;
          var valuta2 = null;
        
        if(data.isKupovina) {  
            for(const i of (await this.racunService.getById(data.racun_id)).racun_valuta) {
                if(i.valutaa.sifra === "rsd") {
                    isOk = true
                    novoStanjeIsplata = i.stanje - data.iznos;
                    valuta2 = i.valuta_id;                    
                } 
            }

            for(const i of (await this.racunService.getByRacunNumber(racunUplata)).racun_valuta) {
                if(i.valuta_id === data.valuta_id) {
                    novoStanjeUplata = i.stanje + (data.iznos / i.valutaa.kupovni_kurs)
                    iznosUValuti = data.iznos / i.valutaa.kupovni_kurs; 
                    valuta1 = data.valuta_id;                
                }
            }
        } else {
            for(const i of (await this.racunService.getById(data.racun_id)).racun_valuta) {
                if(i.valutaa.sifra !== "rsd") {
                    if(i.valuta_id === data.valuta_id) {
                        isOk = true;
                        novoStanjeIsplata = i.stanje - data.iznos;
                        iznosUValuti = data.iznos * i.valutaa.prodajni_kurs;
                        valuta2 = data.valuta_id;
                        break;
                    }    
                }
            }

            for(const i of (await this.racunService.getByRacunNumber(racunUplata)).racun_valuta) {
                if(i.valutaa.sifra === "rsd") {
                    valuta1 = i.valuta_id;
                    novoStanjeUplata = i.stanje + iznosUValuti;
                }
            }            
        }
        
        if(isOk) {
            console.log(await this.transakcijaService.add(brTransakcije, iznosUValuti, datumIVreme, "", data.racun_id , racunIdPrimaoca ,"menjačnica", "menjačnica", valuta1, valuta2 ,novoStanjeIsplata, novoStanjeUplata)); 
            res.send("Uspešno ste izvršili razmenu novca.");   
        } else {
            res.send("Doslo je do greške sa razmenom novca.")
        }
    }
}