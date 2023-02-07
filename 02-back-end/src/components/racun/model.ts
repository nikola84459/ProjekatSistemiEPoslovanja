import IModel from "../../../common/IModel.interface";
import ValutaModel from '../valuta/model';

class RacunModel implements IModel {
    racun_id: number;
    br_racuna: string;
    tip: string;
    racun_valuta: RacunValuta[];
    stanje_u_din: number;
    korisnik_id: number;
    is_aktivan: number;
}

class RacunValuta {
    racun_valuta_id: number;
    racun_id: number;
    valuta_id: number;
    valutaa: ValutaModel;
    stanje: number;

}

export default RacunModel;
export {RacunValuta}
