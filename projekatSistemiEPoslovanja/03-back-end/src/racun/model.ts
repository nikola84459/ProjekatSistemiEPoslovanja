import IModel from '../../common/IModel.interface';

class RacunModel implements IModel {
    racun_id: number;
    br_racuna: string;
    tip: string;
    stanje_u_din: number;
    korisnik_id: number
}


export default RacunModel;

