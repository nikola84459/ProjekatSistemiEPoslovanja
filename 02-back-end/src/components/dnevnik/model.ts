import IModel from '../../../common/IModel.interface';

export default class DnevnikModel implements IModel{
    dnevnik_id: number;
    stranica: string;
    radnja: string;
    datum_i_vreme: string;
    korisnik_id: number | null;
    sluzbenik_id: number | null;
    ip_adresa: string;
    grad: string;
    drzava: string
}