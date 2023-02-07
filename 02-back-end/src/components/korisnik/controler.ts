import { NextFunction, Request, Response} from 'express';
import KorisnikService from './service';
import KorisnikModel from './model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import { IEditKorisnik, IEditKorisnikValidator } from './dto/IEditKorisnik';
import { IAddKorisnik, IAddKorisnikValidator } from './dto/IAddKorisnik';
import { ISearchKorisnik, ISearchKorisnikValidator } from './dto/ISearchKorisnik';
import { IEditKorisnikSluzbenik } from './dto/IEditKorisnikSluzbenik';
import * as bcrypt from 'bcrypt'; 
import BaseController from '../../../common/BaseController';
import Config from '../../config/dev';
import * as nodemailer from 'nodemailer';


export default class KorisnikControler extends BaseController {
        
    async getById(req: Request, res: Response, neextFunction: NextFunction) {
        const id = req.authorized.id;
        res.send(await this.services.korisnikService.getById(id));
    }

    async getByIdSluzbenik(req: Request, res: Response, neextFunction: NextFunction) {
        let korisnikId = req.session["korisnik"]
        res.send(await this.services.korisnikService.getById(korisnikId));   
    }

    async editPassword(req: Request, res: Response, neextFunction: NextFunction) {
        const id = req.authorized.id;
        const data = req.body as IEditKorisnik;

        if(!IEditKorisnikValidator(data)) {
            res.status(400).send(IEditKorisnikValidator.errors);
            return;    
        }
        
        const korisnik = await this.services.korisnikService.getById(id);

        if(korisnik instanceof KorisnikModel) {
            //if(bcrypt.compareSync(data.password_hash_old, await korisnik.password_hash)) {
                if(data.password_hash === data.password_hash_ponovo) {
                    const podaci = await this.services.korisnikService.updatePassword(id, bcrypt.hashSync(data.password_hash, 11));
                    if(podaci === null) {
                        res.send(404);
                        return;
                    }
                    
                    res.send(podaci);
                } else {
                    return res.status(400).send("Šifre se ne poklapaju.");
                }    
            //} else {
              //  return res.status(400).send("Uneta šifra se ne poklapa sa starom šifrom");
           // }
        } 
    }

    async add(req: Request, res: Response, neextFunction: NextFunction) {
        const data = req.body as IAddKorisnik;
                                
        if(!IAddKorisnikValidator(data)) {
            res.status(400).send(IAddKorisnikValidator.errors);
            return;      
        }

                                   
        const password_hash = String(Math.floor(Math.random() * 10000000000));

        const upis: KorisnikModel | IErrorResponse = await this.services.korisnikService.add(data.ime, data.prezime, password_hash, data.jmbg, data.brTelefona, data.brLicneKarte, data.adresa, data.email);
        console.log(upis);
        if(!(upis instanceof KorisnikModel)) {
            if(upis.errorMessage.includes("uq_korisnik_username")) {
                return res.status(400).send("Nije moguće dodati ovog korisnika! Korisnik sa unetim JMBG-em već postoji.")
            }
           
        } else {
            const podaci = [];
            podaci.push({
                kime: data.jmbg,
                sifra: password_hash,
                ime: data.ime,
                prezime: data.prezime,
                email: data.email
            })
            await this.sendMailAdd(podaci);
            req.session["korisnik"] = (await upis).korisnik_id
            res.send(upis); 
            
            
        } 
            
    }

    async pretraga(req: Request, res: Response, neextFunction: NextFunction) {
        const data = req.body as ISearchKorisnik;
        
        if(!ISearchKorisnikValidator(data)) {
            res.status(400).send(ISearchKorisnikValidator.errors);
            return;
        }

        let korisnici: KorisnikModel[] = [];

        if(data.ime !== null && data.prezime !== null) {
            korisnici = await this.services.korisnikService.pretragaByImeIprezime(data.ime, data.prezime);    
        } else if(data.jmbg !== null || data.brLicneKarte !== null) {
            const korisnikObjekat = await this.services.korisnikService.pretragaByJmbgAndBrLk(data.jmbg, data.brLicneKarte)
            if(korisnikObjekat === null) {
                return res.status(404).send("Ne postoji korisnik sa unetim podacima.")
            }
            korisnici.push(korisnikObjekat);
        }

        if(korisnici === null) {
            return res.status(404).send("Ne postoji korisnik sa unetim imenom i prezimenom.")
        }
        res.send(korisnici);
    }

    
    async setSessionKorisnik(req: Request, res: Response, neextFunction: NextFunction) {
        req.session["korisnik"] = req.body.korisnikId;
        res.send();
    }

    async edit(req: Request, res: Response, neextFunction: NextFunction) {
        const data = req.body as IEditKorisnikSluzbenik;
        let korisnikId = req.session["korisnik"];
        const noviKorisnik = await this.services.korisnikService.edit(data.ime, data.prezime, data.brTelefona, data.brLicneKarte, data.adresa, korisnikId);
        res.send(noviKorisnik);
    }

    async obrisiKorisnika(req: Request, res: Response, neextFunction: NextFunction) {
        const korisnikId = req.session["korisnik"];

        const racuni = await this.services.racunService.getByKorisnikId(korisnikId);

        if(req.body.isBrisi) {
            for(const racun of racuni) {
                if(await racun.is_aktivan === 1) {
                    return res.status(400).send();
                }
            }
            res.send(await this.services.korisnikService.editIsAktivan(korisnikId));
        }    
    }

    private async sendMailAdd(podaci: any) {
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

           
                const poruka = `
                    <!doctype html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                        </head>

                        <body>
                            <p>Poštovani/a ${podaci[0].ime} ${podaci[0].prezime},</p> <br>
                            <p>Za Vas je uspešno kreiran nalog.</p> <br>
                            <p>Podaci za prijavu se nalaze u nastavku ovog mejla:</p>                            
                            <br>
                            <p>Korisničko ime: ${podaci[0].kime}</p>
                            <p>Šifra: ${podaci[0].sifra}</p>
                            <br>
                            <p>Srdačan pozdrav,</p>
                            <p>Vaša Banka</p>

                        </body>
                    </html>
              ` 
            transport.sendMail(
                {
                    to: podaci[0].email,
                    subject: "BANKA - REGISTRACIJA",
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