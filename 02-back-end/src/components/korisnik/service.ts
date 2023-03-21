import * as mysql2 from 'mysql2/promise';
import BaseService from '../../../common/BaseService';
import IErrorResponse from '../../../common/IErrorResponse.interface';
import KorisnikModel from './model';


export default class KorisnikService extends BaseService<KorisnikModel> {
  
    protected async adaptModel (row: any): Promise<KorisnikModel>{
      const item = new KorisnikModel();

      item.korisnik_id = +(row?.korisnik_id);
      item.ime = row?.ime;
      item.prezime = row?.prezime;
      item.username = row?.username;
      item.password_hash = row?.password_hash;
      item.jmbg = row?.jmbg;
      item.is_aktivan = row?.is_aktivan;
      item.br_licne_karte = row?.br_licne_karte;
      item.br_telefon = row?.br_telefona;
      item.mesto_prebivalista = row?.mesto_prebivalista;
      item.ulica_prebivalista = row?.ulica_prebivalista;
      item.broj_prebivalista = row?.broj_prebivalista  
      item.email = row?.email
      item.is_prva_prijava = row?.is_prva_prijava;
      item.mesto_rodjenja = row?.mesto_rodjenja;
      item.opstina_rodjenja = row?.opstina_rodjenja;
      item.drzava_rodjenja = row?.drzava_rodjenja;
      item.datum_rodjenja = row?.datum_rodjenja;
      item.datum_kreiranja = row?.datum_kreiranja;
      item.datum_brisanja = row?.datum_brisanja;

      return item;
    }
    
    public async getById(id: number): Promise <KorisnikModel | null | IErrorResponse> {
        return await this.getByIdFromTable(
            id,
            "korisnik"
        )
    }
        

    public async getByUsername(username: string): Promise<KorisnikModel | null | IErrorResponse> {
        return await this.getByFieldName(
            "korisnik",
            "username",
            username
        )
    }

    public async getByPassword(password: string, id: number): Promise<KorisnikModel | IErrorResponse | null> {
        return new Promise<KorisnikModel | IErrorResponse | null>(async reslove => {
            const sql = `SELECT
                            *
                        FROM
                            korisnik
                        WHERE
                            password_hash = ? AND korisnik_id = ?`
            const [ rows, columns ] = await this.db.execute(sql, [password, id]);
        
            if(!Array.isArray(rows)) {
                reslove(null);
                return;
            }

            if(rows.length === 0) {
                reslove(null);
                return;
            }

            return await this.adaptModel(rows[0]);   
        })
        
    }

    public async updatePassword(id: number, password: string, isPrvaPrijava: boolean): Promise<KorisnikModel | IErrorResponse> {
        return new Promise <KorisnikModel | IErrorResponse> (async reslove => {
            let sql = ""
            if(!isPrvaPrijava) {
                sql = `UPDATE
                            korisnik
                        SET
                            password_hash = ? 
                        WHERE
                            korisnik_id = ?`
            } else {
                sql = `UPDATE
                            korisnik
                        SET
                            password_hash = ?,
                            is_prva_prijava = 0 
                        WHERE
                            korisnik_id = ?`
            }
            
            this.db.execute(sql, [password, id])
                .then(async result => {
                    reslove(await this.getById(id));
                })
                .catch (async error => {
                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    })   
                    
                });           
        });
    }

    public async add(ime: string, prezime: string, password_hash: string, username: string, jmbg: string, brTelefona: string ,brLicneKarte: string, mestoPrebivalista: string, 
                    ulicaPrebivalista: string, brojPrebivalista: string, email: string,
                    mestoRodjenja: string, opstinaRodjenja: string, drzavaRodjenja: string, datumRodjenja: string, datumKreiranja): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(async reslove => {
            const sql = `INSERT
                            korisnik
                        SET
                            ime = ?,
                            prezime = ?,
                            username = ?,
                            password_hash = ?,
                            jmbg = ?,
                            is_aktivan = ?,
                            br_telefona = ?, 
                            br_licne_karte = ?,
                            mesto_prebivalista = ?,
                            ulica_prebivalista = ?,
                            broj_prebivalista = ?,
                            email = ?,
                            is_prva_prijava = ?,
                            mesto_rodjenja = ?,
                            opstina_rodjenja = ?,
                            drzava_rodjenja = ?,
                            datum_rodjenja = ?,
                            datum_kreiranja = ?`
            
            this.db.execute(sql, [ime, prezime, username, password_hash, jmbg, 0, brTelefona ,brLicneKarte, mestoPrebivalista, ulicaPrebivalista, brojPrebivalista, email, 1, mestoRodjenja, opstinaRodjenja, drzavaRodjenja, datumRodjenja, datumKreiranja])
            .then(async (result: any) => {
                reslove(await this.getById(result[0].insertId));
            })
            .catch (async error => {
                reslove({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                })   
                
            });                  
        });
    }

    public async pretragaByImeIprezime(ime: string, prezime: string): Promise <KorisnikModel[] | null> {
        const korisnici: KorisnikModel[] = [];
        const sql = `SELECT
                        korisnik_id,
                        ime,
                        prezime,
                        jmbg,
                        br_licne_karte,
                        is_aktivan
                    FROM
                        korisnik
                    WHERE
                        ime = ? AND prezime = ?`
        const [ rows ] = await this.db.execute(sql, [ime, prezime]);

        if(!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        if(Array.isArray) {
            for(const row of rows) {
                korisnici.push(await this.adaptModel(
                        row
                ))
            }

        }
        
        return korisnici
        
    }

    public async pretragaByJmbgAndBrLk(jmbg: string, brLk: string): Promise<KorisnikModel | null> {
        const sql = `SELECT 
                        korisnik_id,
                        ime,
                        prezime,
                        jmbg,
                        br_licne_karte,
                        br_telefona,
                        is_aktivan
                    FROM
                        korisnik
                    WHERE
                        jmbg = ? OR br_licne_karte = ?`
        const [ rows ] = await this.db.execute(sql, [jmbg, brLk]);
        
        if(!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        return this.adaptModel(rows[0]);

    }

    public async edit(ime: string, prezime: string, brTelefona: string, brLicneKarte: string, ulica: string, broj: string, mesto: string, korisnikdId: number, 
        passwordHash: string = null, email: string, username: string = null): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(reslove => {
            let sql = "";
            if(username === null && passwordHash === null) {
                sql = `UPDATE 
                            korisnik
                        SET
                            ime = ?,
                            prezime = ?,
                            br_telefona = ?,
                            br_licne_karte = ?,
                            email = ?,
                            mesto_prebivalista = ?,
                            ulica_prebivalista = ?,
                            broj_prebivalista = ?
                        WHERE
                            korisnik_id = ?`
                    this.db.execute(sql, [ime, prezime, brTelefona, brLicneKarte, email ,mesto, ulica, broj, korisnikdId])
                    .then(async res => {
                        reslove(await this.getById(korisnikdId))
                    })
                    .catch(error => {
                        reslove({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        });      
                    });                     
            } else {
                sql = `UPDATE 
                            korisnik
                        SET
                            ime = ?,
                            prezime = ?,
                            br_telefona = ?,
                            br_licne_karte = ?,
                            email = ?,
                            mesto_prebivalista = ?,
                            ulica_prebivalista = ?,
                            broj_prebivalista = ?,
                            password_hash = ?,
                            username = ?
                        WHERE
                            korisnik_id = ?`
                    this.db.execute(sql, [ime, prezime, brTelefona, brLicneKarte, email ,mesto, ulica, broj, passwordHash, username, korisnikdId])
                    .then(async res => {
                        reslove(await this.getById(korisnikdId))
                    })
                    .catch(error => {
                        reslove({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        });      
                    });                 
            }
        });
    }

    public async editIsAktivan(korisnikId: number, datumBrisaja: string = null): Promise<KorisnikModel | IErrorResponse> {
        return new Promise<KorisnikModel | IErrorResponse>(reslove => {
            if(datumBrisaja === null) {
                const sql = `UPDATE 
                                korisnik
                            SET
                                is_aktivan = 0
                            WHERE
                                korisnik_id = ?`
                this.db.execute(sql, [korisnikId])
                .then(async res => {
                    reslove(this.getById(korisnikId));
                })
                .catch(error => {
                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });      
                }); 
            } else {
                const sql = `UPDATE 
                                korisnik
                            SET
                                is_aktivan = ?,
                                datum_brisanja = ?
                            WHERE
                                korisnik_id = ?`
                this.db.execute(sql, [0, datumBrisaja, korisnikId])
                .then(async res => {
                    reslove(this.getById(korisnikId));
                })
                .catch(error => {
                    console.log(error)
                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });      
                });      
            }           
        });
    
    }
}