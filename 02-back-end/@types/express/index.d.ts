import { Request } from 'express';
import { Session, SessionData } from 'express-session';
import ITokenData from '../../src/components/auth/dto/ITokenData.interface';
import { IKorisnikData } from '../../src/components/korisnik/korisnikSessionInterface/Ikorisnik.interface';
import * as session from 'express-session';


declare global {
    namespace Express {
        interface Request {
            authorized?: ITokenData | null,
                                               
        }
       
        
    }
    
}

