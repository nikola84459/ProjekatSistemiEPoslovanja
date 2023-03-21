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
    mesto_prebivalista: string;
    ulica_prebivalista: string;
    broj_prebivalista: string;
    email: string;
    is_prva_prijava: any;
    mesto_rodjenja: string;
    opstina_rodjenja: string;
    drzava_rodjenja: string;
    datum_rodjenja: string;
    datum_kreiranja: string;
    datum_brisanja: string;
}