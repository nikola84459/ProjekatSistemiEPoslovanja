import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import Config from '../config/dev';
import ITokenData from '../components/auth/dto/ITokenData.interface';
import BaseService from '../../common/BaseService';
import BaseController from '../../common/BaseController';

type UserRole = "korisnik" | "sluzbenik";

interface TokenValidationInformation {
    isValid: boolean;
    data: any;
}

export default class AuthMiddleware {
    
    private static validacijaTokena(req: Request, res: Response, next: NextFunction, allowedRoles: UserRole[]) {
        if(typeof req.headers.authorization !== "string") {
            return res.status(401).send("Token nije validan.");
        }

        const token: string = req.headers.authorization;

        
        const [ tokenType, tokenString ] = token.trim().split(" ");

        if (tokenType !== "Bearer") {
            console.log("nije Bearer")
            return res.status(401).send("Token nije validan.");
        }

                
        if (typeof tokenString !== "string" || tokenString.length === 0) {
            return res.status(401).send("Token nije validan.");
        }

        const korisnikValidacija = this.validateTokenByRole(tokenString, "korisnik");
        const sluzbenikValidacija = this.validateTokenByRole(tokenString, "sluzbenik");

        var rezultat;

        if(korisnikValidacija.isValid === false && sluzbenikValidacija.isValid === false) {
            return res.status(401).send("Token validation error: " + JSON.stringify(korisnikValidacija) + " " + JSON.stringify(sluzbenikValidacija));
        }

        if(korisnikValidacija.isValid) {
            rezultat = korisnikValidacija.data;
        } else {
            rezultat = sluzbenikValidacija.data;
        }

        if(typeof rezultat !== "object") {
            return res.status(401).send("Ne ispravni podaci tokena.");
        }

        const data: ITokenData = rezultat as ITokenData;

        if(!allowedRoles.includes(data.role)) {
            return res.status(403).send("Pristup je odbijen za ovu ulogu korisnika.");
        }
                
        req.authorized = data;

        next();
    }

    public static validateTokenByRole(tokenString: string, role: UserRole): TokenValidationInformation {
        try {
            const result = jwt.verify(tokenString, Config.auth[role].auth.public);
            return {
                isValid: true,
                data: result
            } 
             
        } catch(err) {
            return {
                isValid: false,
                data: err?.message
            }
        }
    }

    public static getVerifier(
        ... allowedRoles: UserRole[]
    ): (req: Request, res: Response, next: NextFunction) => void {
        return(req: Request, res: Response, next: NextFunction) => {
            this.validacijaTokena(req, res, next, allowedRoles);
        };
    }
}