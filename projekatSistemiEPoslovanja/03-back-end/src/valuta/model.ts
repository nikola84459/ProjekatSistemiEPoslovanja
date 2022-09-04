import IModel from '../../../common/IModel.interface';


export default class ValutaModel implements IModel {
    valuta_id: number;
    naziv: string;
    sifra: string;
    srednji_kurs: number;
    kupovni_kurs: number;
    prodajni_kurs: number
}
