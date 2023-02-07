import IErrorResponse from '../../../common/IErrorResponse.interface';
import ValutaModel from '../valuta/model';

export default class TransakcijaModel {
    transakcija_id: number;
    br_transakcije: string;
    iznos: number;
    datum_i_vreme: Date;
    svrha: string;
    racunTransakcija: RacunTransakcija;
    valuta_id: number;
    valuta: ValutaModel;
    
}

class RacunTransakcija {
    racun_transakcija_id: number;
    transakcija_id: number;
    racun_id: number;
    tip: string;
}


export {RacunTransakcija};