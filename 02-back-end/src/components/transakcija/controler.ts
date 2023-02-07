import TransakcijaService from './service';
import { NextFunction, Request, Response } from 'express';
import RacunService from '../racun/service';
import {IPrenosNovca, IPrenosNovcaValidator } from './dto/IPenosNovca';
import TransakcijaModel from './model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import RacunModel from '../racun/model';
import BaseController from '../../../common/BaseController';
import { IMenjacnica, IMenjacnicaValidator } from './dto/IMenjacnica';
import { IIsplataNovca, IIsplataNovcaValidator } from './dto/IIsplataNovca';
import { IIsplataNovcaSve, IIsplataNovcaSveValidator } from './dto/IIsplataNovcaSve';
import KorisnikModel from '../korisnik/model';
import * as nodemailer from "nodemailer"
import Config from '../../config/dev';

export default class TransakcijaController extends BaseController {
    isPogresnaValuta: boolean;
    stanjeNaRacunu: number;   
    valutaRacuna: number;
    prodajniKurs: number;
    kupovniKurs: number;
    isDevizni: boolean;
         
    async getByRacunId(req: Request, res: Response, neextFuntion: NextFunction) {
        const racunId: number = +req.params.id;
        const transakcije = await this.services.transakcijaService.getByRacunId(racunId);
        const korisnik: number = req.authorized.id;

        if(transakcije === null) {
            res.send(404);
            return;
        }

        const racun = (await this.services.racunService.getById(racunId, {loadValuta: true}))
        let checkKorisnik = null;
        
        if(racun instanceof RacunModel) {
            checkKorisnik = await racun.korisnik_id
        }
        

        if(checkKorisnik !== korisnik) {
            return res.status(400).send("Nije moguć prikaz transakcija.");
        }

       
        res.send(transakcije);
            
    }

    padTo2Digits(num: number): string {
       return num.toString().padStart(2, '0');
    }

    private dateAndTime() {
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

          return datumIVreme;
    }

    private async checkIsplata(racunPlatioc: RacunModel, valutaId: number, iznos: number): Promise<boolean> {
        for(const i of (await racunPlatioc).racun_valuta) {
            if(valutaId === i.valuta_id) {
                this.isPogresnaValuta = false;
                if(i.stanje >= iznos) {
                    this.stanjeNaRacunu = i.stanje;
                    return true;
                } else {
                    break;
                }
            } else {
                this.isPogresnaValuta = true;
            }
        }

        return false;
    }

    private async checkValutaPrimaoc(racunPimaoc: RacunModel, valutaId: number): Promise<boolean> {
        for(const i of (await racunPimaoc).racun_valuta) {
            if(i.valuta_id === valutaId) {
                this.stanjeNaRacunu = i.stanje;
                return true;
            }
        }

        return false;
    }
           
    async prenosNovca(req: Request, res: Response, neextFuntion: NextFunction) {
        const data = req.body as IPrenosNovca; 
                
        if(!IPrenosNovcaValidator(data)) {
            res.status(400).send(IPrenosNovcaValidator.errors);
            return;
        } 
        
        const datumIVreme = this.dateAndTime();

        const racunPlatioc = await this.services.racunService.getById(data.racun_id, { loadValuta: true });
        const racunPrimaoc = await this.services.racunService.getByRacunNumber(data.brRacuna, { loadValuta: true });

        let stanjePlatioc: number = null;
        let stanjePrimaoc: number = null;

        let racunIdPrimaoca: number = null;

        const korisnikId = req.authorized.id;
       
        if(racunPrimaoc === null) {
            return res.status(404).send("Račun sa unetim brojem nije pronađen.");
        }

        if(racunPlatioc instanceof RacunModel && racunPrimaoc instanceof RacunModel) {
            racunIdPrimaoca = (await racunPrimaoc).racun_id;

            if((await racunPlatioc).korisnik_id !== korisnikId) {
                return res.status(400).send("Došlo je do greške. Nije moguće izvršiti transakciju.");
            }

            if(data.racun_id === racunIdPrimaoca) {
                return res.status(400).send("Došlo je do greške. Uneli ste dva ista računa.");
            }
            
            if(racunPlatioc.tip === "dinarski") {
                data.valuta_id = (await racunPlatioc).racun_valuta[0].valutaa.valuta_id;
            } 

          
            if(await this.checkIsplata(racunPlatioc, data.valuta_id, data.iznos)) {
                stanjePlatioc = this.stanjeNaRacunu - Number(data.iznos);
            } else {
                if(this.isPogresnaValuta) {
                    return res.status(400).send("Nije moguće izvršiti transakciju. Pogrešna valuta.")
                }
                
                return res.status(400).send("Nemate dovoljno novca na računu kako bi ste izvršili transakciju.");
           }
           

            if(await this.checkValutaPrimaoc(racunPrimaoc, data.valuta_id)) {
                stanjePrimaoc = this.stanjeNaRacunu + Number(data.iznos);
            } else {
                return res.status(400).send("Računi moraju biti u istim valutama.")
            }
            
            let brTransakcije = null;
            
            let upis: TransakcijaModel | IErrorResponse = null
            
            let isTrue = true;

            do {
                brTransakcije = String(new Date().valueOf());
                upis = await this.services.transakcijaService.add(brTransakcije, data.iznos, datumIVreme, data.svrha, data.racun_id,
                racunIdPrimaoca ,"uplata", "isplata", data.valuta_id, null, stanjePlatioc, stanjePrimaoc);    
            } while(!(upis instanceof TransakcijaModel) && upis.errorMessage.includes("uq_transakcija_br_transakcije"));

            while(isTrue) {
                if(!(upis instanceof TransakcijaModel)) {
                    if(upis.errorMessage.includes("uq_transakcija_br_transakcije")) {
                        brTransakcije = String(new Date().valueOf());
                    }
                } else {
                    isTrue = false;
                }
            }
            const podaci = [];
            const primaoc = await this.services.korisnikService.getById(racunPrimaoc.korisnik_id);
            if(primaoc instanceof KorisnikModel) {
                podaci.push({
                    brojTransakcije: brTransakcije,
                    iznos: data.iznos,
                    primaocIme: primaoc.ime,
                    primaocPrezime: primaoc.prezime,
                    brRacunPrimaoc: data.brRacuna
                })
            }
            const korisnik = await this.services.korisnikService.getById(korisnikId);
            if(korisnik instanceof KorisnikModel) {
               await this.sendMailTransakcija(korisnik, podaci);
            }   
            
            res.send(upis);    
        }
    }
    
    private async checkPlatiocMenjacnica(racunPlatioc: RacunModel, iznos: number): Promise<boolean> {
        for(const i of (await racunPlatioc).racun_valuta) {
            if(i.valutaa.sifra === "rsd") {
                this.isPogresnaValuta = false;
                if(i.stanje >= iznos) {
                    this.stanjeNaRacunu = i.stanje;
                    this.valutaRacuna = i.valuta_id;
                    return true;
                } else {
                    break;
                }    
            } else {
                this.isPogresnaValuta = true;
            }
        }
        return false;
    }

    private async checkPrimaocMenjacnica(racunPrimaoc: RacunModel, valutaId: number): Promise<boolean> {
        for(const i of (await racunPrimaoc).racun_valuta) {
            if((await i.valutaa.sifra !== "rsd")) {
                this.isDevizni = true;
                if(i.valuta_id === valutaId) {
                    this.kupovniKurs = i.valutaa.kupovni_kurs;
                    this.stanjeNaRacunu = i.stanje;
                    return true;
            
                } else {
                    this.isPogresnaValuta = true;
                }
            } else {
                this.isDevizni = false;
            }    
        }

        return false;
    }

    private async checkRacunPlatiocMenjacnicaProdaja(racunPlatioc: RacunModel, valudaId: number, iznos: number): Promise<boolean> {
        if((await racunPlatioc).tip === "devizni") {
            this.isDevizni = false;
            for(const i of (await racunPlatioc).racun_valuta) {
                if(i.valuta_id === valudaId) {
                    if(i.stanje >= iznos) {
                        this.stanjeNaRacunu = i.stanje;
                        this.valutaRacuna = i.valuta_id;
                        this.prodajniKurs = i.valutaa.prodajni_kurs;
                        return true;
                    } else {
                        break;
                    }
                } else {
                    this.isPogresnaValuta = true;
                }
            }
        } else {
            this.isDevizni = false;
        }
    
        return false;
    }

    private async checkRacunPrimaocMenjacnicaProdaja(racunPrimaoc: RacunModel): Promise<boolean> {
        for(const i of (await racunPrimaoc).racun_valuta) {
            if(i.valutaa.sifra === "rsd") {
                this.valutaRacuna = i.valuta_id;
                this.stanjeNaRacunu = i.stanje;
                return true;
            }
        }

        return false;
    }

    async menjacnica(req: Request, res: Response, neextFuntion: NextFunction) {
        const data = req.body as IMenjacnica;
       
        if(!IMenjacnicaValidator(data)) {
            res.status(400).send(IMenjacnicaValidator.errors);
            return; 
        }
        
        const datumIVreme = this.dateAndTime();

        let novoStanjeIsplata: number = null;
        let novoStanjeUplata: number = null;

        let iznosUValuti = null;

        let valuta1 = null;
        let valuta2 = null;

        const racunPlatioc = await this.services.racunService.getById(data.racun_id, { loadValuta: true });
        const racunPrimaoc = await this.services.racunService.getById(data.racun_primaoc_id, { loadValuta: true });

        
        if(data.isKupovina) {
            if(racunPlatioc instanceof RacunModel && racunPrimaoc instanceof RacunModel) {
                if((await racunPlatioc).korisnik_id !== req.authorized.id && (await racunPrimaoc).korisnik_id !== req.authorized.id) {
                    return res.status(400).send("Nije moguće izvršiti transakciju. Neispravni računi.");
                }

                if(await this.checkPlatiocMenjacnica(racunPlatioc, data.iznos)) {
                    novoStanjeIsplata = this.stanjeNaRacunu - data.iznos;
                    valuta2 = this.valutaRacuna;
                } else {
                    if(this.isPogresnaValuta) {
                        return res.status(400).send("Račun sa koga se uplaćuje novac mora biti dinarski račun.");
                    }

                    return res.status(400).send("Nemate dovoljno novca na računu kako bi ste izvršili razmenu novca.");
                }
                
                if(await this.checkPrimaocMenjacnica(racunPrimaoc, data.valuta_id)) {
                    novoStanjeUplata = this.stanjeNaRacunu + (data.iznos / this.kupovniKurs);
                    iznosUValuti = data.iznos / this.kupovniKurs;   
                    valuta1 = data.valuta_id; 
                } else {
                    if(this.isPogresnaValuta) {
                        return res.status(400).send("Nije moguće izvršiti transakciju. Račun primaoc mora biti u izabranoj valuti.");
                    }

                    if(!this.isDevizni) {
                        return res.status(400).send("Račun na koji uplaćujete novac mora biti devizni.");
                    }
                }
            }
        
        } else {
            if(racunPlatioc instanceof RacunModel && racunPrimaoc instanceof RacunModel) {
                if((await racunPlatioc).korisnik_id !== req.authorized.id && (await racunPrimaoc).korisnik_id !== req.authorized.id) {
                    return res.status(400).send("Nije moguće izvršiti transakciju. Neispravni računi.");
                }
                
                if(await this.checkRacunPlatiocMenjacnicaProdaja(racunPlatioc, data.valuta_id, data.iznos)) {
                    novoStanjeIsplata = this.stanjeNaRacunu - Number(data.iznos);
                    iznosUValuti = Number(data.iznos) * this.prodajniKurs;
                    valuta2 = this.valutaRacuna;
                } else {
                    if(this.isPogresnaValuta) {
                        return res.status(400).send("Nije moguće izvršiti transakciju. Izabrani račun nije u izabranoj valuti.");
                    }

                    if(!this.isDevizni) {
                        return res.status(400).send("Račun sa koga se vrši prodaja deviza mora biti devizni.")
                    }

                    return res.status(400).send("Nemate dovoljno novca na računu kako bi ste izvršili razmenu novca.");
                }

                if(await this.checkRacunPrimaocMenjacnicaProdaja(racunPrimaoc)) {
                    valuta1 = this.valutaRacuna;
                    novoStanjeUplata = this.stanjeNaRacunu + iznosUValuti;
                }
            } 
        }

        let upis: TransakcijaModel | IErrorResponse = null;
        let brTransakcije = null;

        do {
            brTransakcije = String(new Date().valueOf());
            upis = await this.services.transakcijaService.add(brTransakcije, iznosUValuti, datumIVreme, "", data.racun_id, 
                    data.racun_primaoc_id ,"menjačnica - uplata", "menjačnica - isplata", valuta1, valuta2 ,novoStanjeIsplata, novoStanjeUplata);    
        } while(!(upis instanceof TransakcijaModel) && upis.errorMessage.includes("uq_transakcija_br_transakcije"));
        

        if(racunPlatioc instanceof RacunModel && racunPrimaoc instanceof RacunModel) {
            const korisnik = await this.services.korisnikService.getById(racunPlatioc.korisnik_id);
            const podaci = [];
            if(korisnik instanceof KorisnikModel) {
                podaci.push({
                    iznosPlatioc: data.iznos,
                    iznosPrimaoc: iznosUValuti,
                    brojTransakcije: brTransakcije,
                    brojRacunPlatioc: racunPlatioc.br_racuna,
                    brojRacunPrimaoc: racunPrimaoc.br_racuna                     
                })

                this.sendMailTransakcija(korisnik, podaci, true);
            }

        }

                    
        res.send(upis);   
    }

    async isplataNovca(req: Request, res: Response, neextFuntion: NextFunction) {
        const data = req.body as IIsplataNovca

        if(!IIsplataNovcaValidator(data)) {
            res.status(400).send(IIsplataNovcaValidator.errors);
            return;
        }

        const racun = await this.services.racunService.getById(data.racun_id, { loadValuta: true });

        let stanje: number = null;

        const datumIVreme = this.dateAndTime();

        if(racun instanceof RacunModel) {
            if(await racun.korisnik_id !== req.session["korisnik"]) {
                return res.status(400).send("Nije moguće izvršiti transakciju.");
            }
            
            if(await racun.tip === "dinarski") {
                data.valuta_id = (await racun).racun_valuta[0].valutaa.valuta_id;
            }

            if(await this.checkIsplata(racun, data.valuta_id, data.iznos)) {
                stanje = this.stanjeNaRacunu - Number(data.iznos);
                console.log(stanje);   
                
            } else {
                if(this.isPogresnaValuta) {
                    return res.status(400).send("Nije moguće izvršiti transakciju. Pogrešna valuta.");
                }

                return res.status(400).send("Korisnik nema dovoljno novca na računu kako bi se izvršila isplata unetog iznosa.");
            }

            let upis: TransakcijaModel | IErrorResponse = null;
           
            do {
                let brTransakcije = String(new Date().valueOf());
                upis = await this.services.transakcijaService.addIsplata(brTransakcije, data.iznos, datumIVreme,
                        "Banka - isplata", data.valuta_id, stanje, data.racun_id);

            } while(!(upis instanceof TransakcijaModel) && upis.errorMessage.includes("uq_transakcija_br_transakcije"));
                        
            res.send(upis);           

        }
    }

    async isplataNovacSve(req: Request, res: Response, neextFuntion: NextFunction) {
        const id = req.body as IIsplataNovcaSve;

        if(!IIsplataNovcaSveValidator(id)) {
            res.status(400).send(IIsplataNovcaSveValidator.errors);
            return;   
        }

        const datumIVreme = this.dateAndTime();

        const racun = await this.services.racunService.getById(id.racun_id, { loadValuta: true });

        if(racun instanceof RacunModel) {
            const iznosValuta = [];
            for(const i of await racun.racun_valuta) {
                const novoStanje = i.stanje - i.stanje;
                
                let upis: TransakcijaModel | IErrorResponse = null;               

                do {
                    let brTransakcije = String(new Date().valueOf());
                    upis = await this.services.transakcijaService.addIsplata(brTransakcije, i.stanje, datumIVreme,
                    "Banka - isplata zatvaranje računa", i.valuta_id, novoStanje, id.racun_id);

                } while(!(upis instanceof TransakcijaModel) && upis.errorMessage.includes("uq_transakcija_br_transakcije"))
                        
                const iznos = i.stanje;
                const valuta = i.valutaa.sifra;

                iznosValuta.push({
                    iznos: iznos,
                    valuta: valuta
                })    

            }
            
            res.send(iznosValuta);
        }
    }

    private async sendMailTransakcija(korisnik: KorisnikModel, podaci: any, menjacnica: boolean = false): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>(reslove => {
            const transport = nodemailer.createTransport(
                {
                    host: Config.mail.hostname,
                    port: Config.mail.port,
                    secure: Config.mail.secure,
                    auth: {
                        user: Config.mail.username,
                        pass: Config.mail.password
                    },
                   
                },

                {
                    from: Config.mail.fromMail,
                    tls: {
                        ciphers:'SSLv3'
                    }
                }

            )

            let poruka = "";

            if(!menjacnica) {
                poruka = `
                    <!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                        </head>

                        <body>
                            <p>Poštovani/a ${korisnik.ime} ${korisnik.prezime},</p> <br>
                            <p>Vaša transakcija je uspešno primljena i obrađena.</p> <br>
                            <p>Podaci Vaše transakcije se nalaze u nastavku ovog mejla:<p/><br>
                            <p>Naziv platioca: ${korisnik.ime} ${korisnik.prezime}<p/>
                            <p>Naziv primaoca: ${podaci[0].primaocIme} ${podaci[0].primaocPrezime}</p>
                            <p>Broj računa primaoca: ${podaci[0].brRacunPrimaoc}</p>
                            <p>Broj transakcije: ${podaci[0].brojTransakcije}</p>
                            <p>Iznos: ${podaci[0].iznos}</p>
                            <br>
                            <p>Srdačan pozdrav,</p>
                            <p>Vaša Banka</p>

                        </body>
                    </html>
              ` 
            } else {
                poruka = `
                    <!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                        </head>

                        <body>
                            <p>Poštovani/a ${korisnik.ime} ${korisnik.prezime},</p> <br>
                            <p>Vaša transakcija je uspešno primljena i obrađena.</p> <br>
                            <p>Podaci Vaše transakcije se nalaze u nastavku ovog mejla:<p/><br>
                            <p>Naziv platioca: ${korisnik.ime} ${korisnik.prezime}<p/>
                            <p>Broj računa sa kog se uplaćuje novac: ${podaci[0].brojRacunPlatioc}</p>
                            <p>Broj na koji se uplaćuje novac: ${podaci[0].brojRacunPrimaoc}</p>
                            <p>Broj transakcije: ${podaci[0].brojTransakcije}</p>
                            <p>Iznos u valuti računa platioca: ${podaci[0].iznosPlatioc}</p>
                            <p>Iznos u valuti računa primaoca: ${podaci[0].iznosPrimaoc}</p>
                            <br>
                            <p>Srdačan pozdrav,</p>
                            <p>Vaša Banka</p>

                        </body>
                    </html>
              `     
            }

            transport.sendMail(
                {
                    to: korisnik.email,
                    subject: "BANKA - POTVRDA TRANSAKCIJE",
                    html: poruka
                }
            )
            .then(err => {
                console.log(err);
                transport.close();

                reslove({
                    errorCode: 0,
                    errorMessage: ""
                })
            })
            .catch(err => {
                console.log(err);
                transport.close();

                reslove({
                    errorCode: -1,
                    errorMessage: err?.message
                })   
            })            
        })
    }
}