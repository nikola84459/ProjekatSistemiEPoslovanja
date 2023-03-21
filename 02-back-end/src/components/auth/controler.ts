import { Request, Response } from 'express';
import KorisnikService from '../korisnik/service';
import ITokenData from './dto/ITokenData.interface';
import * as jwt from "jsonwebtoken";
import Config from '../../config/dev';
import SluzbenikService from '../sluzbenik/service';
import { IKorisnikLogin } from './dto/IKorisnikLogin';
import { ISluzbenikLogin } from './dto/ISluzbenikLogin';
import { IRefreshToken, IRefreshTokenValidator } from './dto/IRefreshTokenData';
import * as bcrypt from 'bcrypt';
import KorisnikModel from '../korisnik/model';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import SluzbenikModel from '../sluzbenik/model';
import BaseController from '../../../common/BaseController';

export default class AuthController extends BaseController {
  

    public async logovanjeKorisnik(req: Request, res: Response) {
        const data = req.body as IKorisnikLogin;
        
        const korisnik = await this.services.korisnikService.getByUsername(data.username);

        if(korisnik === null) {
            res.status(404).send("Ne postoji korisnik sa unetim korisničkim imenom.");
            
        } else {
            if(korisnik instanceof KorisnikModel) {
                if(korisnik.is_aktivan === 0) {
                    return res.status(400).send("Ne postoji korisnik sa unetim korisničkim imenom.")
                }

                if(!bcrypt.compareSync(data.password, (await korisnik).password_hash)) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return res.status(400).send("Šifra se ne poklapa sa korisničkim imenom.")
                }
            
                
                const authTokenData: ITokenData = {
                    id: (await korisnik).korisnik_id,
                    identity: (await korisnik).username,
                    role: "korisnik",
                };
    
                const refreshTokenData: ITokenData = {
                    id: (await korisnik).korisnik_id,
                    identity: (await korisnik).username,
                    role: "korisnik",
                };
    
            
                const authToken = jwt.sign(
                    authTokenData,
                    Config.auth.korisnik.auth.private,
                    {
                        algorithm: Config.auth.korisnik.algorithm,
                        issuer: Config.auth.korisnik.issuer,
                        expiresIn: Config.auth.korisnik.auth.duration,
                    },
                );
            
                const refreshToken = jwt.sign(
                    refreshTokenData,
                    Config.auth.korisnik.auth.private,
                    {
                        algorithm: Config.auth.korisnik.algorithm,
                        issuer: Config.auth.korisnik.issuer,
                        expiresIn: Config.auth.korisnik.refresh.duration,
                    },
                ); 
                res.send({
                    authToken: authToken,
                    refreshToken: refreshToken,
                    isPrvaPrijava: +(korisnik.is_prva_prijava)
                });
            }
        }    
    }

    public async sluzbenikLogin(req: Request, res: Response) {
        const data = req.body as ISluzbenikLogin;

        const sluzbenik = await this.services.sluzbenikService.getByUsername(data.username);
        
        if(sluzbenik === null) {
            res.status(404).send("Sluzbenik sa unetim korisničkim imenom ne postoji u sistemu.");
        } else {
            if(sluzbenik instanceof SluzbenikModel) {
                if(!bcrypt.compareSync(data.password, (await sluzbenik).password_hash)) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return res.status(400).send("Šifra se ne poklapa sa korisničkim imenom.")
                }

                const authTokenData: ITokenData = {
                    id: (await sluzbenik).sluzbenik_id,
                    identity: (await sluzbenik).username,
                    role: "sluzbenik",
                };
        
                const refreshTokenData: ITokenData = {
                    id: (await sluzbenik).sluzbenik_id,
                    identity: (await sluzbenik).username,
                    role: "sluzbenik",
                };
        
                const authToken = jwt.sign(
                    authTokenData,
                    Config.auth.sluzbenik.auth.private,
                    {
                        algorithm: Config.auth.sluzbenik.algorithm,
                        issuer: Config.auth.sluzbenik.issuer,
                        expiresIn: Config.auth.sluzbenik.auth.duration,
                    },
                );
                
                const refreshToken = jwt.sign(
                    refreshTokenData,
                    Config.auth.sluzbenik.auth.private,
                    {
                        algorithm: Config.auth.sluzbenik.algorithm,
                        issuer: Config.auth.sluzbenik.issuer,
                        expiresIn: Config.auth.sluzbenik.refresh.duration,
                    },
                ); 
                res.send({
                    authToken: authToken,
                    refreshToken: refreshToken,
                });
            }
        }    

       
    } 

    async korisnikRefresh(req: Request, res: Response) {
        this.refreshTokenByRole("korisnik")(req, res);
    }    

    async sluzbenikRefresh(req: Request, res: Response) {
        this.refreshTokenByRole("sluzbenik")(req, res);
    }   
    
    private refreshTokenByRole(role: "korisnik" | "sluzbenik"): (req: Request, res: Response) => void {
        return (req: Request, res: Response) => {
            const data = req.body as IRefreshToken

            if(!IRefreshTokenValidator(data)) {
                res.status(400).send(IRefreshTokenValidator.errors);
                return;
            }
            
            const refreshToken: string = data.refreshToken;

         
            try {
                const existingData = jwt.verify(refreshToken, Config.auth[role].auth.public) as ITokenData

                const newToken: ITokenData = {
                    id: existingData.id,
                    identity: existingData.identity,
                    role: existingData.role,   
                } 

                const authToken = jwt.sign(
                    newToken,
                    Config.auth[role].auth.private,
                    {
                        algorithm: Config.auth[role].algorithm,
                        issuer: Config.auth[role].issuer,
                        expiresIn: Config.auth[role].auth.duration,
                    },
                )

                res.send({
                    authToken: authToken,
                    refreshToken: null
                })
            } catch(e) {
                res.status(400).send("Ne ispravan token " + e?.message)
            }
            
        }
    }

    async vratiUlogu(req: Request, res: Response) {
        const korisnik = await this.services.korisnikService.getById(req.authorized.id);

        if(korisnik instanceof KorisnikModel) {
            if(+(korisnik.is_prva_prijava) === 0 ) {
                res.send("ok")
            } else {
                res.send(400);
            } 
        }

    }
    
}

