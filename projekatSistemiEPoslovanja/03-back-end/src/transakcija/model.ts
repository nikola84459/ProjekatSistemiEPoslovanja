import IModel from '../../common/IModel.interface';

export default class TransakcijaModel implements IModel{
    transakcija_id: number;
    br_transakcije: string;
    iznos: number;
    datum_i_vreme: Date;
    svrha: string;
    racunTransakcija: RacunTransakcija[];
}

class RacunTransakcija {
    racun_transakcija_id: number;
    transakcija_id: number;
    racun_id: number;
    tip: string;
}

export {RacunTransakcija};