import IModel from '../../../common/IModel.interface';

export default class KorisnikModel implements IModel {
    korisnik_id: number;
    ime: string;
    prezime: string;
    username: string;
    password_hash: string;
    jmbg: string;
    is_aktivan: any;
    br_licne_karte: string;
    br_telefon: string;
    adresa: string;
    email: string;
}